"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Intercepta erros específicos do React 19 que são apenas avisos mas travam o Next.js
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const orig = console.error;
  console.error = (...args: any[]) => {
    const msg = typeof args[0] === "string" ? args[0] : "";
    if (
      msg.includes("Encountered a script tag") || 
      msg.includes("asChild") ||
      msg.includes("DOM element") ||
      msg.includes("hydration")
    ) {
      return;
    }
    orig.apply(console, args);
  };
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
