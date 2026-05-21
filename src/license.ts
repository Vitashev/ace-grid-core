import { useEffect, useMemo, useState } from "react";
import type { GridTierPreset } from "./capabilities";

export type GridLicenseTier = Extract<GridTierPreset, "pro" | "enterprise">;

export interface GridLicenseConfig {
  licenseKey: string;
  appId: string;
  apiBaseUrl?: string;
  domain?: string;
  leaseSigningPublicKey?: string;
  runtime?: string;
  version?: string;
  fetchImpl?: typeof fetch;
}

export interface GridLicenseEntitlement {
  plan: string;
  features: string[];
  seatCount: number;
}

export interface GridLicenseLease {
  leaseToken: string;
  expiresAt: string;
  entitlement: GridLicenseEntitlement;
}

export type GridLicenseState =
  | {
      status: "valid";
      lease: GridLicenseLease;
    }
  | {
      status: "missing" | "validating" | "invalid";
      message: string;
    };

type LeaseResponse = {
  ok?: boolean;
  leaseToken?: unknown;
  expiresAt?: unknown;
  entitlement?: {
    plan?: unknown;
    features?: unknown;
    seatCount?: unknown;
  };
  error?: unknown;
};

type PublicKeyResponse = {
  ok?: boolean;
  publicKey?: unknown;
  error?: unknown;
};

const DEFAULT_LICENSE_API_BASE_URL =
  "https://api.ace-grid.com";
const LICENSE_LEASE_REFRESH_BUFFER_MS = 60 * 60 * 1000;
const LICENSE_LEASE_STORAGE_PREFIX = "ace-grid.licenseLease.v1.";
const LICENSE_PUBLIC_KEY_STORAGE_PREFIX = "ace-grid.licensePublicKey.v1.";

const TIER_RANK: Record<GridLicenseTier, number> = {
  pro: 1,
  enterprise: 2,
};

const leaseCache = new Map<string, GridLicenseLease>();
let globalLicenseConfig: GridLicenseConfig | null = null;

type StoredLicenseLease = {
  lease: GridLicenseLease;
  storedAt: string;
};

type LeaseTokenPayload = {
  appId?: unknown;
  aud?: unknown;
  domain?: unknown;
  exp?: unknown;
  features?: unknown;
  plan?: unknown;
  seatCount?: unknown;
};

const resolveDefaultDomain = () => {
  if (typeof window === "undefined") return undefined;
  return window.location.hostname;
};

const normalizeBaseUrl = (value?: string) =>
  (value || DEFAULT_LICENSE_API_BASE_URL).replace(/\/+$/, "");

const resolveLicenseStorage = () => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const hashCacheKey = (value: string) => {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
};

const persistedLeaseKey = (cacheKey: string) =>
  `${LICENSE_LEASE_STORAGE_PREFIX}${hashCacheKey(cacheKey)}`;

const persistedPublicKeyKey = (apiBaseUrl?: string) =>
  `${LICENSE_PUBLIC_KEY_STORAGE_PREFIX}${hashCacheKey(normalizeBaseUrl(apiBaseUrl))}`;

const getLeaseExpiryMs = (lease: GridLicenseLease) => Date.parse(lease.expiresAt);

const isLeaseFresh = (
  lease: GridLicenseLease,
  refreshBufferMs = LICENSE_LEASE_REFRESH_BUFFER_MS,
) => {
  const expiresAtMs = getLeaseExpiryMs(lease);
  return !Number.isNaN(expiresAtMs) && expiresAtMs > Date.now() + refreshBufferMs;
};

const isLeaseStillValid = (lease: GridLicenseLease) => {
  const expiresAtMs = getLeaseExpiryMs(lease);
  return !Number.isNaN(expiresAtMs) && expiresAtMs > Date.now();
};

const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - normalized.length % 4) % 4), "=");
  if (typeof atob === "function") {
    return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
  }
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(padded, "base64"));
  }
  throw new Error("base64_decoder_unavailable");
};

const decodeBase64UrlJson = (value: string): LeaseTokenPayload => {
  const bytes = decodeBase64Url(value);
  const json =
    typeof TextDecoder !== "undefined"
      ? new TextDecoder().decode(bytes)
      : String.fromCharCode(...bytes);
  return JSON.parse(json) as LeaseTokenPayload;
};

const pemToDer = (pem: string) => {
  const base64 = pem
    .replace(/-----BEGIN PUBLIC KEY-----/g, "")
    .replace(/-----END PUBLIC KEY-----/g, "")
    .replace(/\s+/g, "");
  if (!base64) throw new Error("invalid_license_public_key");
  return decodeBase64Url(base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""));
};

const resolveSubtleCrypto = () => globalThis.crypto?.subtle ?? null;

const verifyLeaseTokenSignature = async (leaseToken: string, publicKeyPem: string) => {
  const subtle = resolveSubtleCrypto();
  if (!subtle) throw new Error("crypto_unavailable");

  const parts = leaseToken.split(".");
  if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) {
    throw new Error("invalid_license_token");
  }

  const publicKey = await subtle.importKey(
    "spki",
    pemToDer(publicKeyPem),
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["verify"],
  );
  const signedBytes = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
  const signatureBytes = decodeBase64Url(parts[2]);
  const isValid = await subtle.verify(
    "RSASSA-PKCS1-v1_5",
    publicKey,
    signatureBytes,
    signedBytes,
  );

  if (!isValid) throw new Error("invalid_license_token_signature");
  return decodeBase64UrlJson(parts[1]);
};

const leaseFromVerifiedTokenPayload = (
  leaseToken: string,
  payload: LeaseTokenPayload,
  requestConfig: Required<Pick<GridLicenseConfig, "licenseKey" | "appId">> &
    Pick<GridLicenseConfig, "apiBaseUrl" | "domain" | "runtime" | "version">,
  requiredTier: GridLicenseTier,
): GridLicenseLease => {
  const exp = Number(payload.exp);
  if (!Number.isFinite(exp)) throw new Error("invalid_license_token");

  const entitlement: GridLicenseEntitlement = {
    plan: String(payload.plan ?? ""),
    features: Array.isArray(payload.features) ? payload.features.map(String) : [],
    seatCount: Math.max(0, Number(payload.seatCount ?? 0)),
  };
  const lease: GridLicenseLease = {
    leaseToken,
    expiresAt: new Date(exp * 1000).toISOString(),
    entitlement,
  };

  if (payload.aud !== "ace-grid-runtime") {
    throw new Error("invalid_license_token_audience");
  }

  if (String(payload.appId ?? "") !== requestConfig.appId) {
    throw new Error("license_key_app_mismatch");
  }

  if (
    requestConfig.domain &&
    typeof payload.domain === "string" &&
    payload.domain !== requestConfig.domain
  ) {
    throw new Error("domain_not_allowed");
  }

  if (!isLeaseStillValid(lease)) {
    throw new Error("license_expired");
  }

  if (!isTierAllowed(entitlement, requiredTier)) {
    throw new Error(`${requiredTier}_license_required`);
  }

  if (entitlement.seatCount < 1) {
    throw new Error("license_has_no_seats");
  }

  return lease;
};

const verifyLeaseToken = async (
  leaseToken: string,
  publicKeyPem: string,
  requestConfig: Required<Pick<GridLicenseConfig, "licenseKey" | "appId">> &
    Pick<GridLicenseConfig, "apiBaseUrl" | "domain" | "runtime" | "version">,
  requiredTier: GridLicenseTier,
) => {
  const payload = await verifyLeaseTokenSignature(leaseToken, publicKeyPem);
  return leaseFromVerifiedTokenPayload(leaseToken, payload, requestConfig, requiredTier);
};

const readPersistedPublicKey = (apiBaseUrl?: string) => {
  const storage = resolveLicenseStorage();
  if (!storage) return undefined;

  try {
    const value = storage.getItem(persistedPublicKeyKey(apiBaseUrl));
    return value?.includes("-----BEGIN PUBLIC KEY-----") ? value : undefined;
  } catch {
    return undefined;
  }
};

const persistPublicKey = (apiBaseUrl: string | undefined, publicKey: string) => {
  const storage = resolveLicenseStorage();
  if (!storage) return;

  try {
    storage.setItem(persistedPublicKeyKey(apiBaseUrl), publicKey);
  } catch {
    // Public key discovery is an optimization; verification still works in memory.
  }
};

const resolveLeaseSigningPublicKey = async (
  config: GridLicenseConfig,
  fetcher: typeof fetch,
) => {
  if (config.leaseSigningPublicKey) return config.leaseSigningPublicKey;

  const cachedPublicKey = readPersistedPublicKey(config.apiBaseUrl);
  if (cachedPublicKey) return cachedPublicKey;

  const response = await fetcher(`${normalizeBaseUrl(config.apiBaseUrl)}/v1/license/public-key`, {
    method: "GET",
  });
  const body = (await response.json().catch(() => ({}))) as PublicKeyResponse;
  if (!response.ok || !body.ok || typeof body.publicKey !== "string") {
    throw new Error(String(body.error || `license_public_key_request_failed_${response.status}`));
  }

  persistPublicKey(config.apiBaseUrl, body.publicKey);
  return body.publicKey;
};

const readPersistedLease = async (
  cacheKey: string,
  requestConfig: Required<Pick<GridLicenseConfig, "licenseKey" | "appId">> &
    Pick<GridLicenseConfig, "apiBaseUrl" | "domain" | "runtime" | "version">,
  requiredTier: GridLicenseTier,
  publicKeyPem?: string,
): Promise<GridLicenseLease | null> => {
  const storage = resolveLicenseStorage();
  if (!storage || !publicKeyPem) return null;

  try {
    const raw = storage.getItem(persistedLeaseKey(cacheKey));
    if (!raw) return null;
    const stored = JSON.parse(raw) as Partial<StoredLicenseLease>;
    const lease = stored.lease;
    if (
      !lease ||
      typeof lease.leaseToken !== "string" ||
      typeof lease.expiresAt !== "string" ||
      typeof lease.entitlement?.plan !== "string" ||
      !Array.isArray(lease.entitlement.features)
    ) {
      storage.removeItem(persistedLeaseKey(cacheKey));
      return null;
    }
    return await verifyLeaseToken(lease.leaseToken, publicKeyPem, requestConfig, requiredTier);
  } catch {
    storage.removeItem(persistedLeaseKey(cacheKey));
    return null;
  }
};

const persistLease = (cacheKey: string, lease: GridLicenseLease, publicKeyPem?: string) => {
  const storage = resolveLicenseStorage();
  if (!storage || !publicKeyPem) return;

  try {
    storage.setItem(
      persistedLeaseKey(cacheKey),
      JSON.stringify({
        lease,
        storedAt: new Date().toISOString(),
      } satisfies StoredLicenseLease),
    );
  } catch {
    // Storage can be unavailable or full; in-memory caching still applies.
  }
};

const normalizePlanTier = (plan: string): GridLicenseTier | null => {
  const normalized = plan.toLowerCase();
  if (normalized.includes("enterprise")) return "enterprise";
  if (normalized.includes("pro")) return "pro";
  return null;
};

const hasRequiredFeature = (
  entitlement: GridLicenseEntitlement,
  requiredTier: GridLicenseTier,
) => {
  const features = new Set(entitlement.features.map((feature) => feature.toLowerCase()));
  return requiredTier === "pro"
    ? features.has("pro") || features.has("enterprise")
    : features.has("enterprise");
};

const isTierAllowed = (
  entitlement: GridLicenseEntitlement,
  requiredTier: GridLicenseTier,
) => {
  const planTier = normalizePlanTier(entitlement.plan);
  if (!planTier) return hasRequiredFeature(entitlement, requiredTier);
  return TIER_RANK[planTier] >= TIER_RANK[requiredTier];
};

const normalizeLease = (
  response: LeaseResponse,
  requiredTier: GridLicenseTier,
): GridLicenseLease => {
  if (!response.ok) {
    throw new Error(String(response.error || "license_rejected"));
  }

  const entitlement = response.entitlement;
  const plan = String(entitlement?.plan ?? "");
  const features = Array.isArray(entitlement?.features)
    ? entitlement.features.map(String)
    : [];
  const seatCount = Math.max(0, Number(entitlement?.seatCount ?? 0));
  const leaseToken = String(response.leaseToken ?? "");
  const expiresAt = String(response.expiresAt ?? "");
  const expiresAtMs = Date.parse(expiresAt);

  if (!leaseToken || !expiresAt || Number.isNaN(expiresAtMs)) {
    throw new Error("invalid_license_response");
  }

  const normalized: GridLicenseLease = {
    leaseToken,
    expiresAt,
    entitlement: {
      plan,
      features,
      seatCount,
    },
  };

  if (expiresAtMs <= Date.now()) {
    throw new Error("license_expired");
  }

  if (!isTierAllowed(normalized.entitlement, requiredTier)) {
    throw new Error(`${requiredTier}_license_required`);
  }

  if (seatCount < 1) {
    throw new Error("license_has_no_seats");
  }

  return normalized;
};

const licenseCacheKey = (
  config: Required<Pick<GridLicenseConfig, "licenseKey" | "appId">> &
    Pick<GridLicenseConfig, "apiBaseUrl" | "domain" | "runtime" | "version">,
  requiredTier: GridLicenseTier,
) =>
  [
    normalizeBaseUrl(config.apiBaseUrl),
    config.appId,
    config.licenseKey,
    config.domain ?? "",
    config.runtime ?? "react",
    config.version ?? "1.0.0",
    requiredTier,
  ].join("|");

export const configureAceGridLicense = (config: GridLicenseConfig | null) => {
  globalLicenseConfig = config;
};

export const getAceGridLicenseConfig = () => globalLicenseConfig;

export const clearAceGridLicenseCache = () => {
  leaseCache.clear();
  const storage = resolveLicenseStorage();
  if (!storage) return;

  for (let index = storage.length - 1; index >= 0; index -= 1) {
    const key = storage.key(index);
    if (
      key?.startsWith(LICENSE_LEASE_STORAGE_PREFIX) ||
      key?.startsWith(LICENSE_PUBLIC_KEY_STORAGE_PREFIX)
    ) {
      storage.removeItem(key);
    }
  }
};

export async function validateAceGridLicense(
  config: GridLicenseConfig,
  requiredTier: GridLicenseTier,
): Promise<GridLicenseLease> {
  const licenseKey = config.licenseKey?.trim();
  const appId = config.appId?.trim();
  if (!licenseKey || !appId) {
    throw new Error("license_key_and_app_id_required");
  }

  const requestConfig = {
    ...config,
    licenseKey,
    appId,
    domain: config.domain ?? resolveDefaultDomain(),
    runtime: config.runtime ?? "react",
    version: config.version ?? "1.0.0",
  };
  const fetcher = config.fetchImpl ?? globalThis.fetch;
  if (!fetcher) {
    throw new Error("fetch_unavailable");
  }

  const cacheKey = licenseCacheKey(requestConfig, requiredTier);
  const cachedLease = leaseCache.get(cacheKey);
  if (cachedLease && isLeaseFresh(cachedLease)) {
    return cachedLease;
  }
  let leaseSigningPublicKey = config.leaseSigningPublicKey ?? readPersistedPublicKey(config.apiBaseUrl);
  const persistedLease = await readPersistedLease(
    cacheKey,
    requestConfig,
    requiredTier,
    leaseSigningPublicKey,
  );
  if (persistedLease) {
    leaseCache.set(cacheKey, persistedLease);
    if (isLeaseFresh(persistedLease)) {
      return persistedLease;
    }
  }

  try {
    const response = await fetcher(`${normalizeBaseUrl(config.apiBaseUrl)}/v1/license/lease`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        licenseKey,
        appId,
        domain: requestConfig.domain,
        runtime: requestConfig.runtime,
        version: requestConfig.version,
      }),
    });
    const body = (await response.json().catch(() => ({}))) as LeaseResponse;

    if (!response.ok) {
      throw new Error(String(body.error || `license_request_failed_${response.status}`));
    }

    const lease = normalizeLease(body, requiredTier);
    if (!leaseSigningPublicKey) {
      try {
        leaseSigningPublicKey = await resolveLeaseSigningPublicKey(config, fetcher);
      } catch {
        // A server-validated lease can be used for this session, but persistent
        // cache reuse stays disabled until the public key is available.
      }
    }
    const verifiedLease = leaseSigningPublicKey
      ? await verifyLeaseToken(
          lease.leaseToken,
          leaseSigningPublicKey,
          requestConfig,
          requiredTier,
        )
      : lease;
    leaseCache.set(cacheKey, verifiedLease);
    persistLease(cacheKey, verifiedLease, leaseSigningPublicKey);
    return verifiedLease;
  } catch (error) {
    const fallbackLease = cachedLease ?? persistedLease;
    if (fallbackLease && isLeaseStillValid(fallbackLease)) {
      return fallbackLease;
    }
    throw error;
  }
}

export const useAceGridLicense = (
  requiredTier: GridTierPreset,
  config?: GridLicenseConfig,
): GridLicenseState => {
  const licenseConfig = config ?? globalLicenseConfig;
  const stableConfig = useMemo(
    () =>
      licenseConfig
        ? {
            apiBaseUrl: licenseConfig.apiBaseUrl,
            appId: licenseConfig.appId,
            domain: licenseConfig.domain,
            fetchImpl: licenseConfig.fetchImpl,
            leaseSigningPublicKey: licenseConfig.leaseSigningPublicKey,
            licenseKey: licenseConfig.licenseKey,
            runtime: licenseConfig.runtime,
            version: licenseConfig.version,
          }
        : undefined,
    [
      licenseConfig?.apiBaseUrl,
      licenseConfig?.appId,
      licenseConfig?.domain,
      licenseConfig?.fetchImpl,
      licenseConfig?.leaseSigningPublicKey,
      licenseConfig?.licenseKey,
      licenseConfig?.runtime,
      licenseConfig?.version,
    ],
  );
  const [state, setState] = useState<GridLicenseState>(() => {
    if (requiredTier === "core") {
      return {
        status: "valid",
        lease: {
          leaseToken: "",
          expiresAt: new Date(Date.now() + 60_000).toISOString(),
          entitlement: { plan: "Core", features: [], seatCount: 1 },
        },
      };
    }
    return {
      status: "missing",
      message: "Ace Grid Pro or Enterprise license is required.",
    };
  });

  useEffect(() => {
    if (requiredTier === "core") return;

    if (!stableConfig) {
      setState({
        status: "missing",
        message: "Configure an Ace Grid license before rendering paid features.",
      });
      return;
    }

    let cancelled = false;
    setState({
      status: "validating",
      message: "Validating Ace Grid license.",
    });

    validateAceGridLicense(stableConfig, requiredTier)
      .then((lease) => {
        if (!cancelled) setState({ status: "valid", lease });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            status: "invalid",
            message: error instanceof Error ? error.message : "license_validation_failed",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [requiredTier, stableConfig]);

  return state;
};
