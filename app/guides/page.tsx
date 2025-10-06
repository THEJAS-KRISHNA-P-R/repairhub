"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useMock } from "@/lib/mock-data"

export default function GuidesPage() {
  const { state, me, addGuide } = useMock()
  const [q, setQ] = useState("")
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return state.guides
    return state.guides.filter((g) => (g.itemName + " " + g.content).toLowerCase().includes(t))
  }, [q, state.guides])

  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState("")
  const [content, setContent] = useState("")

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <Input placeholder="Search guides..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {me && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>New Guide</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Publish a guide</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3 py-2">
                <div className="grid gap-2">
                  <Label>Item name</Label>
                  <Input value={itemName} onChange={(e) => setItemName(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Content</Label>
                  <Textarea rows={8} value={content} onChange={(e) => setContent(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={async () => {
                    if (!itemName.trim() || !content.trim()) return
                    await addGuide({ itemName: itemName.trim(), content: content.trim(), userId: me!.id })
                    setItemName("")
                    setContent("")
                    setOpen(false)
                  }}
                >
                  Publish
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      {filtered.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No guides</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">No guides matched your search.</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((g) => (
            <Card key={g.id} className="h-full">
              <CardHeader>
                <CardTitle className="text-base">{g.itemName}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-6 whitespace-pre-wrap text-sm">{g.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
