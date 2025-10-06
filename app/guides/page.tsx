"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useApi } from "@/lib/api-context"

export default function GuidesPage() {
  const { currentUser, guides, addGuide } = useApi()
  const [q, setQ] = useState("")
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return guides
    return guides.filter((g) => (g.item_name + " " + g.guide_content).toLowerCase().includes(t))
  }, [q, guides])

  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState("")
  const [content, setContent] = useState("")

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <Input placeholder="Search guides..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {currentUser && (
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
                    await addGuide({ item_name: itemName.trim(), guide_content: content.trim() })
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
                <CardTitle className="text-base">{g.item_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-6 whitespace-pre-wrap text-sm">{g.guide_content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
