"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { useMock, type Outcome } from "@/lib/mock-data"
import { RepairCard } from "@/components/custom/repair-card"
import { SearchBar } from "@/components/custom/search-bar"

export default function FeedPage() {
  const { state, me, addRepair, fileToBase64 } = useMock()

  const [q, setQ] = useState("")
  const [deviceFilter, setDeviceFilter] = useState("")
  const [userFilter, setUserFilter] = useState("")
  const [outcomeFilter, setOutcomeFilter] = useState("")
  const [open, setOpen] = useState(false)

  const allDevices = useMemo(() => state.repairs.map((r) => r.deviceName), [state.repairs])
  const allUsers = useMemo(() => state.users.map((u) => ({ id: u.id, username: u.username })), [state.users])

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase()
    return state.repairs.filter((r) => {
      if (deviceFilter && r.deviceName !== deviceFilter) return false
      if (userFilter && r.userId !== userFilter) return false
      if (outcomeFilter && r.outcome !== (outcomeFilter as Outcome)) return false
      if (!text) return true
      const hay = `${r.deviceName} ${r.issueDesc} ${r.repairSteps}`.toLowerCase()
      return hay.includes(text)
    })
  }, [q, deviceFilter, userFilter, outcomeFilter, state.repairs])

  // new post form
  const [deviceName, setDeviceName] = useState("")
  const [issueDesc, setIssueDesc] = useState("")
  const [repairSteps, setRepairSteps] = useState("")
  const [outcome, setOutcome] = useState<Outcome>("success")
  const [images, setImages] = useState<string[]>([])

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4">
      <section className="space-y-2">
        <h1 className="text-pretty text-2xl font-semibold">Community Repairs</h1>
        <p className="text-muted-foreground">Search, filter, and share your repair wins and lessons.</p>
      </section>

      <SearchBar
        allDevices={allDevices}
        allUsers={allUsers}
        value={q}
        onChange={setQ}
        deviceFilter={deviceFilter}
        onDeviceFilter={setDeviceFilter}
        userFilter={userFilter}
        onUserFilter={setUserFilter}
        outcomeFilter={outcomeFilter}
        onOutcomeFilter={setOutcomeFilter}
      />

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{filtered.length} results</span>
        {me && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>New Repair</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Share a repair</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3 py-2">
                <div className="grid gap-2">
                  <Label>Device name</Label>
                  <Input value={deviceName} onChange={(e) => setDeviceName(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Issue description</Label>
                  <Textarea value={issueDesc} onChange={(e) => setIssueDesc(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Repair steps</Label>
                  <Textarea value={repairSteps} onChange={(e) => setRepairSteps(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Outcome</Label>
                  <select
                    className="rounded-md border bg-background px-3 py-2 text-sm"
                    value={outcome}
                    onChange={(e) => setOutcome(e.target.value as Outcome)}
                  >
                    <option value="success">Success</option>
                    <option value="failure">Failure</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label>Images</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || [])
                      const list: string[] = []
                      for (const f of files.slice(0, 3)) {
                        list.push(await fileToBase64(f))
                      }
                      setImages(list)
                    }}
                  />
                  <div className="flex flex-wrap gap-2">
                    {images.map((src, i) => (
                      <img
                        key={i}
                        src={src || "/placeholder.svg"}
                        alt=""
                        className="h-16 w-16 rounded-md object-cover"
                      />
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={async () => {
                    if (!deviceName.trim() || !issueDesc.trim() || !repairSteps.trim()) return
                    await addRepair({
                      userId: me!.id,
                      deviceName: deviceName.trim(),
                      issueDesc: issueDesc.trim(),
                      repairSteps: repairSteps.trim(),
                      outcome,
                      images,
                    })
                    setDeviceName("")
                    setIssueDesc("")
                    setRepairSteps("")
                    setOutcome("success")
                    setImages([])
                    setOpen(false)
                  }}
                >
                  Post
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Separator />

      {filtered.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No results</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Try clearing filters or adjusting your search query.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <RepairCard key={r.id} id={r.id} />
          ))}
        </div>
      )}
    </main>
  )
}
