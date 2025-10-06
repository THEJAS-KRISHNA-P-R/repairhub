"use client"

import { notFound, useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useMock, formatDate } from "@/lib/mock-data"
import { CommentThread } from "@/components/custom/comment-thread"

export default function RepairDetailsPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { state, me, deleteRepair } = useMock()
  const repair = state.repairs.find((r) => r.id === params.id)

  if (!repair) {
    notFound()
  }

  const user = state.users.find((u) => u.id === repair!.userId)

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-4">
      <Button variant="ghost" onClick={() => router.back()}>
        &larr; Back
      </Button>
      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="text-pretty">{repair!.deviceName}</CardTitle>
          <div className="flex items-center gap-2">
            <img src={user?.avatarUrl || "/placeholder-user.jpg"} alt="" className="h-6 w-6 rounded-full" />
            <span className="text-sm">{user?.username}</span>
            <span className="text-xs text-muted-foreground">· {formatDate(repair!.date)}</span>
            <Badge variant={repair!.outcome === "success" ? "default" : "secondary"}>
              {repair!.outcome === "success" ? "Success" : "Failure"}
            </Badge>
            {me?.id === repair!.userId && (
              <Button
                variant="outline"
                size="sm"
                className="ml-auto bg-transparent"
                onClick={async () => {
                  await deleteRepair(repair!.id)
                  router.push("/feed")
                }}
              >
                Delete
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <section>
            <h2 className="mb-1 text-sm font-medium text-muted-foreground">Issue</h2>
            <p>{repair!.issueDesc}</p>
          </section>
          <section>
            <h2 className="mb-1 text-sm font-medium text-muted-foreground">Steps</h2>
            <p className="whitespace-pre-wrap">{repair!.repairSteps}</p>
          </section>
          {repair!.images.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-sm font-medium text-muted-foreground">Images</h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {repair!.images.map((src, i) => (
                  <img key={i} src={src || "/placeholder.svg"} alt="" className="h-32 w-full rounded-md object-cover" />
                ))}
              </div>
            </section>
          )}
          <Separator />
          <section>
            <h2 className="mb-2 text-sm font-medium text-muted-foreground">Comments</h2>
            <CommentThread repairId={repair!.id} />
          </section>
        </CardContent>
      </Card>
    </main>
  )
}
