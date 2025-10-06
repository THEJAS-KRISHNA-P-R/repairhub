"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useApi } from "@/lib/api-context"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

const links = [
  { href: "/feed", label: "Feed" },
  { href: "/guides", label: "Guides" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile", label: "Profile" },
]

export function Navbar() {
  const pathname = usePathname()
  const { currentUser, logout, isInitialized } = useApi()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by only showing user state after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render user-specific content until mounted and initialized to prevent hydration mismatch
  if (!mounted || !isInitialized) {
    return (
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Digital Repair Hub logo" className="h-6 w-6" />
            <span className="text-pretty text-lg font-semibold">Digital Repair Café</span>
          </Link>
          <nav className="hidden items-center gap-4 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "text-sm text-muted-foreground hover:text-foreground",
                  pathname.startsWith(l.href) && "text-foreground font-medium",
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <div className="h-8 w-20 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Digital Repair Hub logo" className="h-6 w-6" />
          <span className="text-pretty text-lg font-semibold">Digital Repair Café</span>
        </Link>
        <nav className="hidden items-center gap-4 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "text-sm text-muted-foreground hover:text-foreground",
                pathname.startsWith(l.href) && "text-foreground font-medium",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {currentUser ? (
            <>
              <span className="hidden text-sm text-muted-foreground md:inline">Hi, {currentUser.username}</span>
              <Button variant="outline" size="sm" onClick={() => logout()}>
                Logout
              </Button>
            </>
          ) : (
            <Link href="/auth">
              <Button size="sm">Sign in</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
