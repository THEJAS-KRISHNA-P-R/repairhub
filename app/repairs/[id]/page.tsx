"use client"

import { notFound, useParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useApi } from "@/lib/api-context"
import { repairPostsAPI } from "@/lib/api"
import { RepairSteps } from "@/components/custom/repair-steps"

export default function RepairDetailsPage() {
	const params = useParams<{ id: string }>()
	const router = useRouter()
	const { users, repairPosts, currentUser } = useApi()
	const numericId = useMemo(() => Number(params.id), [params.id])

	const existing = useMemo(() => repairPosts.find((r) => r.id === numericId), [repairPosts, numericId])
	const [repair, setRepair] = useState(existing)
	const [loading, setLoading] = useState(!existing)

	useEffect(() => {
		if (existing) {
			setRepair(existing)
			setLoading(false)
			return
		}
		let cancelled = false
		;(async () => {
			try {
				const data = await repairPostsAPI.getById(numericId)
				if (!cancelled) setRepair(data)
			} catch {
				if (!cancelled) setRepair(undefined)
			} finally {
				if (!cancelled) setLoading(false)
			}
		})()
		return () => {
			cancelled = true
		}
	}, [existing, numericId])

	if (!loading && !repair) {
		notFound()
	}

	const author = useMemo(() => (repair ? users.find((u) => u.id === repair.user_id) : undefined), [users, repair])

	return (
		<main className="mx-auto max-w-3xl space-y-6 p-4">
			<Button variant="ghost" onClick={() => router.back()}>
				&larr; Back
			</Button>
			<Card>
				<CardHeader className="space-y-2">
					<CardTitle className="text-pretty">{repair?.item_name || "Repair"}</CardTitle>
					<div className="flex items-center gap-2">
						<img src={author?.avatarUrl || "/placeholder-user.jpg"} alt="" className="h-6 w-6 rounded-full" />
						<span className="text-sm">{author?.username || "Unknown"}</span>
						<span className="text-xs text-muted-foreground">· {repair ? new Date(repair.date).toLocaleDateString() : ""}</span>
						{repair && (
							<Badge variant={repair.success ? "default" : "secondary"}>{repair.success ? "Success" : "Failure"}</Badge>
						)}
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<RepairSteps
						issue={repair?.issue_description || ""}
						steps={repair?.repair_steps || ""}
						isLoading={loading}
					/>
					{/* Images from DB are not yet implemented as URLs; enable when available */}
					<Separator />
					{/* Comments integration will follow once API endpoints are wired on the client */}
				</CardContent>
			</Card>
		</main>
	)
}
