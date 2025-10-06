"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useMock, formatDate } from "@/lib/mock-data"

export function CommentThread({ repairId }: { repairId: string }) {
  const { state, me, addComment, editComment, deleteComment } = useMock()
  const repair = state.repairs.find((r) => r.id === repairId)
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [content, setContent] = useState("")

  if (!repair) return null

  const byParent = new Map<string | null, string[]>()
  for (const c of repair.comments) {
    const key = c.parentId ?? null
    if (!byParent.has(key)) byParent.set(key, [])
    byParent.get(key)!.push(c.id)
  }

  const renderNode = (id: string, depth = 0) => {
    const c = repair.comments.find((x) => x.id === id)!
    const user = state.users.find((u) => u.id === c.userId)
    const children = byParent.get(id) || []
    return (
      <div key={id} className="space-y-2 border-l pl-3" style={{ marginLeft: depth ? 8 : 0 }}>
        <div className="flex items-center gap-2">
          <img src={user?.avatarUrl || "/placeholder-user.jpg"} alt="" className="h-5 w-5 rounded-full" />
          <span className="text-sm font-medium">{user?.username}</span>
          <span className="text-xs text-muted-foreground">{formatDate(c.date)}</span>
        </div>
        <p className="text-sm">{c.content}</p>
        <div className="flex gap-2">
          {me && (
            <Button variant="ghost" size="sm" onClick={() => setReplyTo(id)}>
              Reply
            </Button>
          )}
          {me?.id === c.userId && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  const next = prompt("Edit comment", c.content)
                  if (next && next !== c.content) await editComment(repairId, id, { content: next })
                }}
              >
                Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={() => deleteComment(repairId, id)}>
                Delete
              </Button>
            </>
          )}
        </div>
        {replyTo === id && me && (
          <div className="space-y-2">
            <Textarea placeholder="Write a reply..." value={content} onChange={(e) => setContent(e.target.value)} />
            <div className="flex gap-2">
              <Button
                onClick={async () => {
                  if (!content.trim()) return
                  await addComment(repairId, content.trim(), id)
                  setContent("")
                  setReplyTo(null)
                }}
              >
                Post reply
              </Button>
              <Button variant="outline" onClick={() => setReplyTo(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
        {children.length > 0 && (
          <div className="space-y-4">{children.map((child) => renderNode(child, depth + 1))}</div>
        )}
      </div>
    )
  }

  const roots = byParent.get(null) || []

  return (
    <div className="space-y-4">
      {me && (
        <div className="space-y-2">
          <Textarea placeholder="Add a comment..." value={content} onChange={(e) => setContent(e.target.value)} />
          <Button
            onClick={async () => {
              if (!content.trim()) return
              await addComment(repairId, content.trim(), null)
              setContent("")
            }}
          >
            Comment
          </Button>
        </div>
      )}
      <div className="space-y-6">
        {roots.length === 0 ? (
          <p className="text-sm text-muted-foreground">No comments yet.</p>
        ) : (
          roots.map((id) => renderNode(id))
        )}
      </div>
    </div>
  )
}
