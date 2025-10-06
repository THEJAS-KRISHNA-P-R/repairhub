import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { ApiProvider } from "@/lib/api-context"
import { Navbar } from "@/components/custom/navbar"
import { Footer } from "@/components/custom/footer"
import { Suspense } from "react"

export const metadata: Metadata = {
title: "Digital Repair Café",
  description: "DIY device repair community — share fixes, learn from guides, and level up.",
  generator: "Thejas",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ApiProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <Navbar />
            <div className="min-h-[60vh]">{children}</div>
            <Footer />
            <Toaster />
          </Suspense>
        </ApiProvider>
        <Analytics />
      </body>
    </html>
  )
}
