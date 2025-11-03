import type React from "react"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 1,
  userScalable: true,
}

export const metadata: Metadata = {
  title: "CareerPath - AI Career Advisor",
  description: "Discover your perfect career with AI-powered guidance",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <div className="flex flex-col min-h-screen">
              <Navigation />
              <main className="flex-1 pt-4 md:pt-15 pb-16 md:pb-0">
                {children}
              </main>
            </div>
          </Suspense>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
