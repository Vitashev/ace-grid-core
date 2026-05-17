import React, { createContext, useContext, useMemo } from "react";
import type { GridSearchProps } from "../../types";
import {
  resolveGridSearch,
  type ResolvedGridSearch,
  type SearchActiveMatch,
} from "./utils";

const DEFAULT_SEARCH_CONTEXT: ResolvedGridSearch = {
  enabled: false,
  query: "",
  mode: "highlight",
  caseSensitive: false,
  wholeWord: false,
  highlight: true,
  highlightClassName: "ace-grid__search-highlight",
  highlightStyle: undefined,
  activeHighlightClassName: "ace-grid__search-highlight--active",
  activeHighlightStyle: undefined,
  activeMatch: null,
  columns: undefined,
  matcher: null,
};

const GridSearchContext = createContext<ResolvedGridSearch>(
  DEFAULT_SEARCH_CONTEXT
);

type GridSearchProviderProps = {
  value?: GridSearchProps;
  activeMatch?: SearchActiveMatch | null;
  children: React.ReactNode;
};

export const GridSearchProvider: React.FC<GridSearchProviderProps> = ({
  value,
  activeMatch,
  children,
}) => {
  const resolved = useMemo(
    () => resolveGridSearch(value, activeMatch),
    [value, activeMatch]
  );

  return (
    <GridSearchContext.Provider value={resolved}>
      {children}
    </GridSearchContext.Provider>
  );
};

export const useGridSearch = () => useContext(GridSearchContext);
