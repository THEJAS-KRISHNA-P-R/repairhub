"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useMock } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const links = [
  { href: "/feed", label: "Feed" },
  { href: "/guides", label: "Guides" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile", label: "Profile" },
]

export function Navbar() {
  const pathname = usePathname()
  const { me, logout } = useMock()

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.jpg" alt="Digital Repair Hub logo" className="h-6 w-6" />
          <span className="text-pretty text-lg font-semibold">Digital Repair Hub</span>
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
          {me ? (
            <>
              <span className="hidden text-sm text-muted-foreground md:inline">Hi, {me.username}</span>
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
