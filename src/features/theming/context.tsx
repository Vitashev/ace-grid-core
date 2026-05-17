import React, { createContext, useContext, useMemo } from "react";
import type {
  GridIconSetInput,
  GridThemeInlineStyleOverrides,
  GridThemeInput,
} from "./types";
import { resolveTheme, defaultTheme } from "./resolveTheme";
import type { GridResolvedTheme } from "./resolveTheme";

const defaultResolvedTheme = resolveTheme(defaultTheme);

const GridThemeContext = createContext<GridResolvedTheme>(defaultResolvedTheme);

interface GridThemeProviderProps {
  theme?: GridThemeInput;
  icons?: Partial<GridIconSetInput>;
  inlineStyleOverrides?: GridThemeInlineStyleOverrides;
  value?: GridResolvedTheme;
  children: React.ReactNode;
}

export const GridThemeProvider: React.FC<GridThemeProviderProps> = ({
  theme,
  icons,
  inlineStyleOverrides,
  value,
  children,
}) => {
  const resolved = useMemo(
    () => value ?? resolveTheme(theme ?? defaultTheme, icons, inlineStyleOverrides),
    [value, theme, icons, inlineStyleOverrides]
  );

  return (
    <GridThemeContext.Provider value={resolved}>
      {children}
    </GridThemeContext.Provider>
  );
};

export const useGridTheme = () => useContext(GridThemeContext);
export const useGridThemeTokens = () => useGridTheme().tokens;
export const useGridThemeComponents = () => useGridTheme().components;
export const useGridThemeIcons = () => useGridTheme().icons;
