export type CxValue = string | number | false | null | undefined;

export const cx = (...parts: CxValue[]): string =>
  parts.filter(Boolean).join(" ");
