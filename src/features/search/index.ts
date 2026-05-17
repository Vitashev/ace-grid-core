export { GridSearchProvider, useGridSearch } from "./context";
export {
  createSearchMatcher,
  hasSearchMatch,
  collectSearchMatches,
  getSearchHighlightMarkProps,
  isActiveSearchCell,
  splitSearchMatches,
  getNextSearchIndex,
  getPrevSearchIndex,
  resolveGridSearch,
} from "./utils";
export type {
  SearchMatcher,
  SearchMatchSegment,
  SearchActiveMatch,
  ResolvedGridSearch,
  GridSearchMatch,
} from "./utils";
