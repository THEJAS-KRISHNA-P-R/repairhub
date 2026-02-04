"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useApi } from "@/lib/api-context"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Menu, Shield, Bookmark } from "lucide-react"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { adminAPI } from "@/lib/api"

const baseLinks = [
  { href: "/feed", label: "Feed" },
  { href: "/guides", label: "Guides" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile", label: "Profile" },
]

export function Navbar() {
  const pathname = usePathname()
  const { currentUser, logout, isInitialized } = useApi()
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  // Prevent hydration mismatch by only showing user state after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Check admin status
  useEffect(() => {
    if (currentUser) {
      adminAPI.isAdmin().then(setIsAdmin).catch(() => setIsAdmin(false))
    } else {
      setIsAdmin(false)
    }
  }, [currentUser])

  // Build links dynamically based on admin status
  const links = isAdmin
    ? [...baseLinks, { href: "/admin", label: "Admin" }]
    : baseLinks

  // Calculate display name with fallback
  const displayName = currentUser?.username || currentUser?.email?.split('@')[0] || "User"

  // Don't render user-specific content until mounted and initialized to prevent hydration mismatch
  if (!mounted || !isInitialized) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Digital Repair Hub logo" className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">Digital Repair Café</span>
            <span className="font-bold sm:hidden">Repair Café</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="h-8 w-20 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Digital Repair Hub logo" className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">Digital Repair Café</span>
            <span className="font-bold sm:hidden">Repair Café</span>
          </Link>
          {/* Desktop Nav */}
          <nav className="hidden gap-6 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "flex items-center text-sm font-medium text-muted-foreground",
                  pathname.startsWith(l.href) && "text-foreground",
                  "transition-colors hover:text-foreground/80",
                  l.href === "/admin" && "text-orange-600 dark:text-orange-400"
                )}
              >
                {l.href === "/admin" && <Shield className="h-3.5 w-3.5 mr-1" />}
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Bookmarks link for logged in users */}
          {currentUser && (
            <Link href="/dashboard/bookmarks" className="hidden md:block">
              <Button variant="ghost" size="icon" title="My Bookmarks">
                <Bookmark className="h-4 w-4" />
              </Button>
            </Link>
          )}

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-2">
            {currentUser ? (
              <>
                <span className="text-sm text-muted-foreground">Hi, {displayName}</span>
                <Button variant="ghost" size="sm" onClick={() => logout()}>
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/auth">
                <Button size="sm">Sign in</Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <VisuallyHidden>
                  <SheetTitle>Mobile Menu</SheetTitle>
                  <SheetDescription>Navigation links for mobile devices</SheetDescription>
                </VisuallyHidden>
                {/* Added padding px-6 for better spacing */}
                <div className="flex flex-col space-y-6 mt-6 px-4">
                  <Link href="/" className="flex items-center gap-2 mb-2 pb-4 border-b" onClick={() => setIsOpen(false)}>
                    <img src="/logo.png" alt="Digital Repair Hub logo" className="h-6 w-6" />
                    <span className="font-bold text-lg">Digital Repair Café</span>
                  </Link>
                  <div className="flex flex-col gap-4">
                    {links.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "text-base font-medium transition-colors hover:text-primary py-1 flex items-center gap-2",
                          pathname.startsWith(item.href) && "text-primary",
                          item.href === "/admin" && "text-orange-600 dark:text-orange-400"
                        )}
                      >
                        {item.href === "/admin" && <Shield className="h-4 w-4" />}
                        {item.label}
                      </Link>
                    ))}
                    {currentUser && (
                      <Link
                        href="/dashboard/bookmarks"
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "text-base font-medium transition-colors hover:text-primary py-1 flex items-center gap-2",
                          pathname === "/dashboard/bookmarks" && "text-primary"
                        )}
                      >
                        <Bookmark className="h-4 w-4" />
                        My Bookmarks
                      </Link>
                    )}
                  </div>
                  <div className="border-t pt-6 mt-4">
                    {currentUser ? (
                      <div className="flex flex-col gap-4">
                        <span className="text-sm text-muted-foreground">Logged in as <span className="font-medium text-foreground">{displayName}</span></span>
                        <Button className="w-full" variant="outline" onClick={() => { logout(); setIsOpen(false); }}>
                          Logout
                        </Button>
                      </div>
                    ) : (
                      <Link href="/auth" onClick={() => setIsOpen(false)}>
                        <Button className="w-full">Sign in</Button>
                      </Link>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
