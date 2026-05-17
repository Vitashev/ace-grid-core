import { useEffect } from "react";

const injectedStyleRefCounts = new Map<string, number>();

const ensureStyleElement = (id: string) => {
  let el = document.getElementById(id) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = id;
    el.type = "text/css";
    document.head.appendChild(el);
  }
  return el;
};

export function useInjectStyles(id: string, css: string) {
  useEffect(() => {
    if (typeof document === "undefined") return;

    ensureStyleElement(id);
    injectedStyleRefCounts.set(id, (injectedStyleRefCounts.get(id) ?? 0) + 1);

    return () => {
      const nextCount = (injectedStyleRefCounts.get(id) ?? 1) - 1;
      if (nextCount > 0) {
        injectedStyleRefCounts.set(id, nextCount);
        return;
      }

      injectedStyleRefCounts.delete(id);
      document.getElementById(id)?.remove();
    };
  }, [id]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const el = ensureStyleElement(id);
    if (el.textContent !== css) {
      el.textContent = css;
    }
  }, [id, css]);
}
