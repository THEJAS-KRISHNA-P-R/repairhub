"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { repairPostsAPI, type RepairPost } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RepairCard } from "@/components/custom/repair-card"
import { Loader2, TrendingUp, Flame } from "lucide-react"

export default function TrendingPage() {
    const [repairs, setRepairs] = useState<RepairPost[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadTrending = async () => {
            try {
                const allRepairs = await repairPostsAPI.getAll()

                // Filter to last 7 days and sort by vote count
                const sevenDaysAgo = new Date()
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

                const trending = allRepairs
                    .filter(r => new Date(r.date) >= sevenDaysAgo)
                    .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
                    .slice(0, 10)

                setRepairs(trending)
            } catch (error) {
                console.error("Failed to load trending:", error)
            } finally {
                setLoading(false)
            }
        }

        loadTrending()
    }, [])

    if (loading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <main className="mx-auto max-w-6xl p-4 md:p-6 space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                    <Flame className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Trending Repairs</h1>
                    <p className="text-muted-foreground text-sm">Most upvoted repairs from the past 7 days</p>
                </div>
            </div>

            {repairs.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="font-semibold text-lg">No trending repairs yet</h3>
                        <p className="text-muted-foreground text-sm mt-1">
                            Check back soon or <Link href="/feed" className="text-primary hover:underline">browse all repairs</Link>
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {repairs.map((repair, index) => (
                        <div key={repair.id} className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                {index + 1}
                            </div>
                            <div className="flex-1">
                                <RepairCard repair={repair} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    )
}
