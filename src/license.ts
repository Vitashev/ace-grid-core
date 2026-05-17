import { useEffect, useMemo, useState } from "react";
import type { GridTierPreset } from "./capabilities";

export type GridLicenseTier = Extract<GridTierPreset, "pro" | "enterprise">;

export interface GridLicenseConfig {
  licenseKey: string;
  appId: string;
  apiBaseUrl?: string;
  domain?: string;
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

const DEFAULT_LICENSE_API_BASE_URL =
  "https://api.ace-grid.com";

const TIER_RANK: Record<GridLicenseTier, number> = {
  pro: 1,
  enterprise: 2,
};

const leaseCache = new Map<string, GridLicenseLease>();
let globalLicenseConfig: GridLicenseConfig | null = null;

const resolveDefaultDomain = () => {
  if (typeof window === "undefined") return undefined;
  return window.location.hostname;
};

const normalizeBaseUrl = (value?: string) =>
  (value || DEFAULT_LICENSE_API_BASE_URL).replace(/\/+$/, "");

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
  const cacheKey = licenseCacheKey(requestConfig, requiredTier);
  const cachedLease = leaseCache.get(cacheKey);
  if (cachedLease && Date.parse(cachedLease.expiresAt) > Date.now() + 30_000) {
    return cachedLease;
  }

  const fetcher = config.fetchImpl ?? globalThis.fetch;
  if (!fetcher) {
    throw new Error("fetch_unavailable");
  }

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
  leaseCache.set(cacheKey, lease);
  return lease;
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
