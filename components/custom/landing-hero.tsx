"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useApi } from "@/lib/api-context"
import { repairPostsAPI, guidesAPI } from "@/lib/api"

export function LandingHero() {
  const { currentUser } = useApi()
  const [stats, setStats] = useState({ repairs: 0, successRate: 0, guides: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [repairs, guides] = await Promise.all([
          repairPostsAPI.getAll(),
          guidesAPI.getAll(),
        ])

        const successCount = repairs.filter(r => r.success).length
        const successRate = repairs.length > 0
          ? Math.round((successCount / repairs.length) * 100)
          : 0

        setStats({
          repairs: repairs.length,
          successRate,
          guides: guides.length,
        })
      } catch (error) {
        console.error("Failed to load stats:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  return (
    <section aria-labelledby="hero-title" className="bg-card">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
        <div className="space-y-6">
          <h1 id="hero-title" className="text-pretty text-4xl font-semibold leading-tight md:text-5xl">
            Fix it. Together.
            <span className="block text-balance text-primary">The DIY device repair community.</span>
          </h1>
          <p className="text-muted-foreground md:text-lg">
            Learn from real repairs, publish your wins, and get unstuck fast with step-by-step guides.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/feed" aria-label="Explore the repair feed">
              <Button className="min-w-36">Explore repairs</Button>
            </Link>
            {!currentUser ? (
              <Link href="/auth" aria-label="Create your account">
                <Button variant="outline" className="min-w-36 bg-transparent">
                  Create account
                </Button>
              </Link>
            ) : (
              <Link href="/dashboard" aria-label="Go to Dashboard">
                <Button variant="outline" className="min-w-36 bg-transparent">
                  Dashboard
                </Button>
              </Link>
            )}
          </div>

          <dl className="mt-6 grid grid-cols-3 gap-4 text-center md:w-10/12" aria-label="Community stats">
            <div className="rounded-lg border p-4">
              <dt className="text-xs text-muted-foreground">Repairs logged</dt>
              <dd className="text-xl font-semibold">
                {loading ? (
                  <span className="inline-block h-6 w-8 animate-pulse bg-muted rounded"></span>
                ) : (
                  stats.repairs > 0 ? `${stats.repairs}+` : "0"
                )}
              </dd>
            </div>
            <div className="rounded-lg border p-4">
              <dt className="text-xs text-muted-foreground">Success rate</dt>
              <dd className="text-xl font-semibold">
                {loading ? (
                  <span className="inline-block h-6 w-8 animate-pulse bg-muted rounded"></span>
                ) : (
                  `${stats.successRate}%`
                )}
              </dd>
            </div>
            <div className="rounded-lg border p-4">
              <dt className="text-xs text-muted-foreground">Guides</dt>
              <dd className="text-xl font-semibold">
                {loading ? (
                  <span className="inline-block h-6 w-8 animate-pulse bg-muted rounded"></span>
                ) : (
                  stats.guides
                )}
              </dd>
            </div>
          </dl>
        </div>

        <div className="relative">
          <img
            src="/workbench-tools-electronics-photo.jpg"
            alt="Repair workbench with tools and components"
            className="w-full rounded-xl border shadow-sm"
          />
        </div>
      </div>
    </section>
  )
}
