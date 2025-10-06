import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { MockDataProvider } from "@/lib/mock-data"
import { Navbar } from "@/components/custom/navbar"
import { Footer } from "@/components/custom/footer"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Digital Repair Hub",
  description: "DIY device repair community — share fixes, learn from guides, and level up.",
  generator: "v0.app",
  icons: {
    icon: "/favicon.jpg",
    shortcut: "/favicon.jpg",
    apple: "/favicon.jpg",
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
        <MockDataProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <Navbar />
            <div className="min-h-[60vh]">{children}</div>
            <Footer />
            <Toaster />
          </Suspense>
        </MockDataProvider>
        <Analytics />
      </body>
    </html>
  )
}
