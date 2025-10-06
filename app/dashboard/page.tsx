"use client"

import { useMemo } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useApi } from "@/lib/api-context"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
const Charts = dynamic(() => import("./Charts"), { ssr: false })

export default function DashboardPage() {
  const { currentUser, users, repairPosts, guides } = useApi()

  const myRepairs = useMemo(() => {
    if (!currentUser) return []
    return repairPosts.filter((r) => r.user_id === currentUser.id)
  }, [repairPosts, currentUser])
  const success = useMemo(() => myRepairs.filter((r) => r.success).length, [myRepairs])
  const failure = useMemo(() => myRepairs.filter((r) => !r.success).length, [myRepairs])

  const topDevices = useMemo(() => {
    const map = new Map<string, number>()
    for (const r of repairPosts) {
      map.set(r.item_name, (map.get(r.item_name) || 0) + 1)
    }
    return Array.from(map.entries())
      .map(([device, count]) => ({ device, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [repairPosts])

  const successPie = [
    { name: "Success", value: success, fill: "oklch(var(--chart-2))" },
    { name: "Failure", value: failure, fill: "oklch(var(--chart-3))" },
  ]

  if (!currentUser) {
    return (
      <main className="mx-auto max-w-3xl p-4">
        <Card>
          <CardHeader>
            <CardTitle>Restricted</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Please sign in to view your dashboard.</CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Repairs</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{repairPosts.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Your Repairs</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{myRepairs.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Guides</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{guides.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{users.length}</CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Charts topDevices={topDevices} successPie={successPie} />
      </section>
    </main>
  )
}
