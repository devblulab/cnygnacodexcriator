
import React, { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { EditorProvider } from "@/context/editor-context";

export const metadata: Metadata = {
  title: "QuantumCode - Modern Web IDE",
  description:
    "A modern web-based IDE with AI assistance",
  generator: "v0.dev",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <EditorProvider>
            {children}
            <Toaster />
          </EditorProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
