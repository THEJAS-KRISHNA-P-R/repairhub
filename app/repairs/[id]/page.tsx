"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useApi } from "@/lib/api-context"
import { repairPostsAPI, adminAPI, RepairPost } from "@/lib/api"
import { RepairSteps } from "@/components/custom/repair-steps"
import { VoteButton } from "@/components/custom/vote-button"
import { BookmarkButton } from "@/components/custom/bookmark-button"
import { CategoryBadge } from "@/components/custom/category-badge"
import { CommentSection } from "@/components/custom/comment-section"
import { Loader2, Trash2, Edit } from "lucide-react"
import { toast } from "sonner"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function RepairDetailsPage() {
	const params = useParams<{ id: string }>()
	const router = useRouter()
	const { users, repairPosts, currentUser, deleteRepairPost } = useApi()

	const id = params.id

	const existing = useMemo(() => repairPosts.find((r) => r.id === id), [repairPosts, id])
	const [repair, setRepair] = useState<RepairPost | undefined>(existing)
	const [loading, setLoading] = useState(!existing)
	const [isAdmin, setIsAdmin] = useState(false)
	const [deleting, setDeleting] = useState(false)

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

	// Check admin status
	useEffect(() => {
		if (currentUser) {
			adminAPI.isAdmin().then(setIsAdmin).catch(() => setIsAdmin(false))
		}
	}, [currentUser])

	const canEdit = currentUser && repair && (currentUser.id === repair.user_id || isAdmin)

	const handleDelete = async () => {
		if (!repair) return
		setDeleting(true)
		try {
			await deleteRepairPost(repair.id)
			toast.success("Repair deleted")
			router.push('/feed')
		} catch (error) {
			toast.error("Failed to delete repair")
		} finally {
			setDeleting(false)
		}
	}

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

	const profileData = repair.profiles
	// @ts-ignore
	const authorProfile = Array.isArray(profileData) ? profileData[0] : profileData
	const author = authorProfile || users.find((u) => u.id === repair.user_id)
	const authorName = author?.username || author?.email?.split('@')[0] || "Unknown Author"

	return (
		<main className="mx-auto max-w-3xl space-y-6 p-4">
			<div className="flex items-center justify-between">
				<Button variant="ghost" onClick={() => router.back()}>
					&larr; Back
				</Button>

				{canEdit && (
					<div className="flex items-center gap-2">
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button variant="destructive" size="sm" disabled={deleting}>
									<Trash2 className="h-4 w-4 mr-1" />
									Delete
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Delete this repair?</AlertDialogTitle>
									<AlertDialogDescription>
										This action cannot be undone. This will permanently delete the repair post
										and all associated comments.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
										Delete
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				)}
			</div>

			<Card>
				<CardHeader className="space-y-2">
					<div className="flex items-center justify-between gap-4">
						<CardTitle className="text-pretty text-2xl">{repair.item_name}</CardTitle>
						{repair.category && <CategoryBadge category={repair.category} />}
					</div>
					<div className="flex items-center gap-2 flex-wrap">
						<img src={author?.avatar_url || "/placeholder-user.jpg"} alt="" className="h-6 w-6 rounded-full" />
						<span className="text-sm font-medium">{authorName}</span>
						<span className="text-xs text-muted-foreground">· {new Date(repair.date).toLocaleDateString()}</span>
						<Badge variant={repair.success ? "default" : "secondary"}>{repair.success ? "Success" : "Failure"}</Badge>
					</div>

					{/* Vote and Bookmark Actions */}
					<div className="flex items-center gap-3 pt-2">
						<VoteButton
							repairPostId={repair.id}
							initialCount={repair.vote_count || 0}
							initialVoted={repair.user_has_voted || false}
						/>
						<BookmarkButton
							repairPostId={repair.id}
							initialBookmarked={repair.user_has_bookmarked || false}
						/>
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

					<CommentSection repairPostId={repair.id} />
				</CardContent>
			</Card>
		</main>
	)
}
