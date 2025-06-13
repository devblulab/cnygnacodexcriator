
import React, { ReactNode } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { EditorProvider } from "@/context/editor-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QuantumCode - Modern Web IDE",
  description:
    "A modern web-based IDE with AI assistance inspired by v0.dev",
  generator: "QuantumCode",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
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
