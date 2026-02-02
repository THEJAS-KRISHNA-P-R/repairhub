"use client"

import { notFound, useParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useApi } from "@/lib/api-context"
import { repairPostsAPI, RepairPost } from "@/lib/api"
import { RepairSteps } from "@/components/custom/repair-steps"
import { Loader2 } from "lucide-react"

export default function RepairDetailsPage() {
	const params = useParams<{ id: string }>()
	const router = useRouter()
	const { users, repairPosts } = useApi()

	// ID is now a string (UUID)
	const id = params.id

	const existing = useMemo(() => repairPosts.find((r) => r.id === id), [repairPosts, id])
	const [repair, setRepair] = useState<RepairPost | undefined>(existing)
	const [loading, setLoading] = useState(!existing)

	useEffect(() => {
		if (existing) {
			setRepair(existing)
			setLoading(false)
			return
		}

		if (!id) return;

		let cancelled = false
			; (async () => {
				try {
					const data = await repairPostsAPI.getById(id)
					if (!cancelled) setRepair(data)
				} catch (err) {
					console.error("Failed to fetch repair:", err)
					if (!cancelled) setRepair(undefined)
				} finally {
					if (!cancelled) setLoading(false)
				}
			})()
		return () => {
			cancelled = true
		}
	}, [existing, id])

	if (loading) {
		return (
			<div className="flex h-[50vh] w-full items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		)
	}

	if (!repair) {
		return (
			<main className="mx-auto max-w-3xl p-4">
				<div className="text-center py-12">
					<h2 className="text-2xl font-bold">Repair not found</h2>
					<Button onClick={() => router.push('/feed')} className="mt-4">Back to Feed</Button>
				</div>
			</main>
		)
	}

	// Handle user profile from joined data or context
	// Supabase join might return array or object depending on relationship type (one-to-one vs one-to-many)
	// We cast/check to be safe
	const profileData = repair.profiles
	// @ts-ignore
	const authorProfile = Array.isArray(profileData) ? profileData[0] : profileData
	const author = authorProfile || users.find((u) => u.id === repair.user_id)

	// Fallback: Username -> Email prefix -> "Unknown"
	const authorName = author?.username || author?.email?.split('@')[0] || "Unknown Author"

	return (
		<main className="mx-auto max-w-3xl space-y-6 p-4">
			<Button variant="ghost" onClick={() => router.back()}>
				&larr; Back
			</Button>
			<Card>
				<CardHeader className="space-y-2">
					<CardTitle className="text-pretty text-2xl">{repair.item_name}</CardTitle>
					<div className="flex items-center gap-2">
						<img src={author?.avatar_url || "/placeholder-user.jpg"} alt="" className="h-6 w-6 rounded-full" />
						<span className="text-sm font-medium">{authorName}</span>
						<span className="text-xs text-muted-foreground">· {new Date(repair.date).toLocaleDateString()}</span>
						<Badge variant={repair.success ? "default" : "secondary"}>{repair.success ? "Success" : "Failure"}</Badge>
					</div>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Images Section */}
					{repair.images && repair.images.length > 0 && (
						<div className="grid grid-cols-2 gap-4 md:grid-cols-3">
							{repair.images.map((img, idx) => (
								<div key={idx} className="relative aspect-square overflow-hidden rounded-md border bg-muted">
									<img src={img} alt={`Repair shot ${idx + 1}`} className="h-full w-full object-cover" />
								</div>
							))}
						</div>
					)}

					<RepairSteps
						issue={repair.issue_description || ""}
						steps={repair.repair_steps || ""}
						isLoading={loading}
					/>

					<Separator />

					<div className="bg-muted/50 p-4 rounded-lg text-center text-sm text-muted-foreground">
						Comments coming soon...
					</div>
				</CardContent>
			</Card>
		</main>
	)
}
