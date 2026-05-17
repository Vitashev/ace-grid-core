import { useEffect, useMemo, useState } from "react";

import type { GridSearchMode } from "../../../types";
import { getNextSearchIndex, getPrevSearchIndex } from "../utils";

type GridSearchStateValue = {
  query: string;
  mode: GridSearchMode;
  caseSensitive: boolean;
  wholeWord: boolean;
  highlight: boolean;
  matchCount: number;
  activeIndex: number;
};

type GridSearchStateController = GridSearchStateValue & {
  set: (patch: Partial<GridSearchStateValue>) => void;
  clear: () => void;
  setMatchCount: (count: number) => void;
  setActiveIndex: (index: number) => void;
  nextMatch: () => void;
  prevMatch: () => void;
};

export const useGridSearchStateController = (): {
  value: GridSearchStateValue;
  state: GridSearchStateController;
} => {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<GridSearchMode>("highlight");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [highlight, setHighlight] = useState(true);
  const [matchCount, setMatchCount] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, mode, caseSensitive, wholeWord]);

  useEffect(() => {
    if (matchCount <= 0) {
      if (activeIndex !== 0) setActiveIndex(0);
      return;
    }
    if (activeIndex >= matchCount) {
      setActiveIndex(0);
    }
  }, [activeIndex, matchCount]);

  const value = useMemo<GridSearchStateValue>(
    () => ({
      query,
      mode,
      caseSensitive,
      wholeWord,
      highlight,
      matchCount,
      activeIndex,
    }),
    [query, mode, caseSensitive, wholeWord, highlight, matchCount, activeIndex],
  );

  const state = useMemo<GridSearchStateController>(
    () => ({
      ...value,
      set: (patch) => {
        if (patch.query != null) setQuery(patch.query);
        if (patch.mode != null) setMode(patch.mode);
        if (patch.caseSensitive != null) {
          setCaseSensitive(patch.caseSensitive);
        }
        if (patch.wholeWord != null) setWholeWord(patch.wholeWord);
        if (patch.highlight != null) setHighlight(patch.highlight);
        if (patch.matchCount != null) {
          setMatchCount(Math.max(0, patch.matchCount));
        }
        if (patch.activeIndex != null) {
          setActiveIndex(Math.max(0, patch.activeIndex));
        }
      },
      clear: () => {
        setQuery("");
        setMatchCount(0);
        setActiveIndex(0);
      },
      setMatchCount: (count) => setMatchCount(Math.max(0, count)),
      setActiveIndex: (index) => setActiveIndex(Math.max(0, index)),
      nextMatch: () =>
        setActiveIndex((prev) => getNextSearchIndex(prev, matchCount, true)),
      prevMatch: () =>
        setActiveIndex((prev) => getPrevSearchIndex(prev, matchCount, true)),
    }),
    [value, matchCount],
  );

  return { value, state };
};
