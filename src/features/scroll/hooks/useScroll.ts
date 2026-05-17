import { useCallback, useState } from "react";

export function useScroll() {
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    setScrollTop(el.scrollTop);
    setScrollLeft(el.scrollLeft);
  }, []);
  return { scrollTop, scrollLeft, onScroll };
}
