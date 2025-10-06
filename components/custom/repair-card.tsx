"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useApi } from "@/lib/api-context"
import { BadgeDisplay } from "./badge-display"

export function RepairCard({ id }: { id: string }) {
  const { repairPosts, users } = useApi()
  const repair = repairPosts.find((r) => r.id.toString() === id)
  if (!repair) return null
  const user = users.find((u) => u.id === repair.user_id)
  const commentsCount = 0 // TODO: Add comments count when comments are implemented

  return (
    <Link href={`/repairs/${repair.id}`} className="block">
      <Card className="h-full transition hover:shadow-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-balance text-base">{repair.item_name}</CardTitle>
          <div className="flex items-center gap-2">
            <img src={user?.avatarUrl || "/placeholder-user.jpg"} alt="" className="h-6 w-6 rounded-full" />
            <span className="text-sm text-muted-foreground">{user?.username}</span>
            <span className="text-xs text-muted-foreground">· {new Date(repair.date).toLocaleDateString()}</span>
          </div>
          {/* TODO: Add badges when implemented */}
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="line-clamp-2 text-sm">{repair.issue_description || "No description available"}</p>
          <div className="flex items-center gap-2">
            <Badge variant={repair.success ? "default" : "secondary"}>
              {repair.success ? "Success" : "Failure"}
            </Badge>
            <span className="text-xs text-muted-foreground">{commentsCount} comments</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
