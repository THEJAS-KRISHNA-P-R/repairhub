"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useApi } from "@/lib/api-context"
import { VoteButton } from "./vote-button"
import { BookmarkButton } from "./bookmark-button"
import { CategoryBadge } from "./category-badge"
import { Share2 } from "lucide-react"
import { toast } from "sonner"
import { type RepairPost } from "@/lib/api"

interface RepairCardProps {
  id?: string
  repair?: RepairPost
}

export function RepairCard({ id, repair: repairProp }: RepairCardProps) {
  const { repairPosts, users } = useApi()

  // Support both id prop and direct repair prop
  const repair = repairProp || repairPosts.find((r) => r.id.toString() === id)
  if (!repair) return null

  // Get user from profiles or users list
  const profileData = repair.profiles
  // @ts-ignore
  const authorProfile = Array.isArray(profileData) ? profileData[0] : profileData
  const user = authorProfile || users.find((u) => u.id === repair.user_id)

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const url = `${window.location.origin}/repairs/${repair.id}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: repair.item_name,
          text: `Check out this repair: ${repair.item_name}`,
          url
        })
      } catch (error) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url)
      toast.success("Link copied!")
    }
  }

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
          <div
            className="flex items-center gap-2 hover:opacity-80 w-fit cursor-pointer"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              window.location.href = `/users/${repair.user_id}`
            }}
          >
            <img
              src={user?.avatar_url || "/placeholder-user.jpg"}
              alt=""
              className="h-6 w-6 rounded-full"
            />
            <span className="text-sm text-muted-foreground hover:underline">{user?.username}</span>
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
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={handleShare} className="h-8 px-2">
            <Share2 className="h-4 w-4" />
          </Button>
          <BookmarkButton
            repairPostId={repair.id}
            initialBookmarked={repair.user_has_bookmarked || false}
            size="sm"
          />
        </div>
      </div>
    </Card>
  )
}
