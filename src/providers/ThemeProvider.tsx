import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...otherProps }: ThemeProviderProps) {
  return <NextThemesProvider {...otherProps}>{children}</NextThemesProvider>;
}