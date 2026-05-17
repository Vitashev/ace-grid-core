import { useEffect } from "react";

type UseGridSearchResultsCountEffectArgs = {
  onResultsCountChange?: (count: number) => void;
  searchMatchesCount: number;
  searchNavigationEnabled: boolean;
};

export const useGridSearchResultsCountEffect = ({
  onResultsCountChange,
  searchMatchesCount,
  searchNavigationEnabled,
}: UseGridSearchResultsCountEffectArgs) => {
  useEffect(() => {
    if (!searchNavigationEnabled) return;
    onResultsCountChange?.(searchMatchesCount);
  }, [onResultsCountChange, searchMatchesCount, searchNavigationEnabled]);
};
