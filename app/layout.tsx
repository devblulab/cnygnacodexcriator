import React, { ReactNode } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/firebase/auth-context";
import { Toaster } from "@/components/ui/toaster";
import { EditorProvider } from "@/context/editor-context";

// Fonte Google: Inter (corrigido)
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "QuantumCode - Modern Web IDE",
  description:
    "A modern web-based IDE with AI assistance and Firebase integration",
  generator: "v0.dev",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthProvider>
            <EditorProvider>
              {children}
              <Toaster />
            </EditorProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
