import React, { Component } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

export class ThemeProvider extends Component<ThemeProviderProps> {
  render() {
    const { children, ...props } = this.props;
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
  }
} 