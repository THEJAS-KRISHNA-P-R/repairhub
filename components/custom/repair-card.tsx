"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate, useMock } from "@/lib/mock-data"
import { BadgeDisplay } from "./badge-display"

export function RepairCard({ id }: { id: string }) {
  const { state } = useMock()
  const repair = state.repairs.find((r) => r.id === id)
  if (!repair) return null
  const user = state.users.find((u) => u.id === repair.userId)
  const commentsCount = repair.comments.length

  return (
    <Link href={`/repairs/${repair.id}`} className="block">
      <Card className="h-full transition hover:shadow-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-balance text-base">{repair.deviceName}</CardTitle>
          <div className="flex items-center gap-2">
            <img src={user?.avatarUrl || "/placeholder-user.jpg"} alt="" className="h-6 w-6 rounded-full" />
            <span className="text-sm text-muted-foreground">{user?.username}</span>
            <span className="text-xs text-muted-foreground">· {formatDate(repair.date)}</span>
          </div>
          {user && user.badges.length > 0 && (
            <div className="pt-1">
              <BadgeDisplay ids={user.badges} />
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="line-clamp-2 text-sm">{repair.issueDesc}</p>
          <div className="flex items-center gap-2">
            <Badge variant={repair.outcome === "success" ? "default" : "secondary"}>
              {repair.outcome === "success" ? "Success" : "Failure"}
            </Badge>
            <span className="text-xs text-muted-foreground">{commentsCount} comments</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
