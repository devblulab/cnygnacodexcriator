import type React from "react"
import type { Metadata } from "next"
import { Mona_Sans as FontSans } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/firebase/auth-context"
import { Toaster } from "@/components/ui/toaster"
import { EditorProvider } from "@/context/editor-context"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "QuantumCode - Modern Web IDE",
  description: "A modern web-based IDE with AI assistance and Firebase integration",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased ${fontSans.variable}`}>
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
  )
}
