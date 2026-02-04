"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useApi } from "@/lib/api-context"
import { VoteButton } from "./vote-button"
import { BookmarkButton } from "./bookmark-button"
import { CategoryBadge } from "./category-badge"

export function RepairCard({ id }: { id: string }) {
  const { repairPosts, users, currentUser } = useApi()
  const repair = repairPosts.find((r) => r.id.toString() === id)
  if (!repair) return null
  const user = users.find((u) => u.id === repair.user_id)

  return (
    <Card className="h-full transition hover:shadow-md group">
      <Link href={`/repairs/${repair.id}`} className="block">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-balance text-base line-clamp-1">{repair.item_name}</CardTitle>
            {repair.category && (
              <CategoryBadge category={repair.category} size="sm" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <img
              src={user?.avatar_url || "/placeholder-user.jpg"}
              alt=""
              className="h-6 w-6 rounded-full"
            />
            <span className="text-sm text-muted-foreground">{user?.username}</span>
            <span className="text-xs text-muted-foreground">
              · {new Date(repair.date).toLocaleDateString()}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {repair.issue_description || "No description available"}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={repair.success ? "default" : "secondary"}>
                {repair.success ? "Success" : "Failure"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Link>

      {/* Action buttons outside the link */}
      <div className="px-6 pb-4 pt-0 flex items-center justify-between border-t mt-2 pt-3">
        <VoteButton
          repairPostId={repair.id}
          initialCount={repair.vote_count || 0}
          initialVoted={repair.user_has_voted || false}
          size="sm"
        />
        <BookmarkButton
          repairPostId={repair.id}
          initialBookmarked={repair.user_has_bookmarked || false}
          size="sm"
        />
      </div>
    </Card>
  )
}
