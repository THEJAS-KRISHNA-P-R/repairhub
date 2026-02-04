"use client"

import { useMemo, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useApi } from "@/lib/api-context"
import { RepairCard } from "@/components/custom/repair-card"
import { SearchBar } from "@/components/custom/search-bar"
import { Outcome } from "@/lib/mock-data"
import { Loader2, Plus } from "lucide-react"
import { toast } from "sonner"
import { categoriesAPI, Category } from "@/lib/api"
import { ArrowUpDown } from "lucide-react"

export default function FeedPage() {
  const { currentUser, users, repairPosts, addRepairPost } = useApi()

  const [q, setQ] = useState("")
  const [deviceFilter, setDeviceFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [userFilter, setUserFilter] = useState("all")
  const [outcomeFilter, setOutcomeFilter] = useState("all")
  const [sortBy, setSortBy] = useState<"newest" | "upvotes" | "comments">("newest")
  const [open, setOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [displayCount, setDisplayCount] = useState(12)

  // Load categories
  useEffect(() => {
    categoriesAPI.getAll().then(setCategories).catch(console.error)
  }, [])

  const allDevices = useMemo(() => repairPosts.map((r) => r.item_name), [repairPosts])
  const allUsers = useMemo(() => users.map((u) => ({ id: u.id.toString(), username: u.username })), [users])

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase()
    let results = repairPosts.filter((r) => {
      if (deviceFilter !== "all" && r.item_name !== deviceFilter) return false
      if (categoryFilter !== "all" && r.category_id !== categoryFilter) return false
      if (outcomeFilter !== "all" && (outcomeFilter === "success") !== r.success) return false
      if (!text) return true
      const hay = `${r.item_name} ${r.issue_description || ''} ${r.repair_steps || ''}`.toLowerCase()
      return hay.includes(text)
    })

    // Sort results
    if (sortBy === "upvotes") {
      results = results.sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
    } else if (sortBy === "comments") {
      // Default to upvotes for now (comments count not available)
      results = results.sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
    } else {
      results = results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }

    return results
  }, [q, deviceFilter, categoryFilter, userFilter, outcomeFilter, sortBy, repairPosts])

  const displayedRepairs = useMemo(() => filtered.slice(0, displayCount), [filtered, displayCount])
  const hasMore = displayCount < filtered.length

  // new post form
  const [deviceName, setDeviceName] = useState("")
  const [issueDesc, setIssueDesc] = useState("")
  const [repairSteps, setRepairSteps] = useState("")
  const [outcome, setOutcome] = useState<"success" | "failure">("success")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const handleSubmit = async () => {
    if (!deviceName.trim() || !issueDesc.trim() || !repairSteps.trim()) {
      toast.error("Please fill in all fields")
      return
    }
    await addRepairPost({
      item_name: deviceName.trim(),
      issue_description: issueDesc.trim(),
      repair_steps: repairSteps.trim(),
      success: outcome === "success",
      category_id: selectedCategory || undefined,
      images: images.length > 0 ? images : null
    })
    setDeviceName("")
    setIssueDesc("")
    setRepairSteps("")
    setOutcome("success")
    setSelectedCategory("")
    setImages([])
    setOpen(false)
  }

  return (
    <main className="mx-auto max-w-6xl p-4 md:p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Community Repairs</h1>
          <p className="text-muted-foreground text-sm">Discover {repairPosts.length} repairs from the community.</p>
        </div>

        {currentUser && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="hidden md:flex">
                <Plus className="mr-2 h-4 w-4" /> New Repair
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Share a repair</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Device name</Label>
                  <Input placeholder="e.g. iPhone 12 Mini" value={deviceName} onChange={(e) => setDeviceName(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.icon && <span className="mr-1">{cat.icon}</span>}
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Issue description</Label>
                  <Textarea placeholder="What was broken?" value={issueDesc} onChange={(e) => setIssueDesc(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Repair steps</Label>
                  <Textarea placeholder="How did you fix it?" className="min-h-[100px]" value={repairSteps} onChange={(e) => setRepairSteps(e.target.value)} />
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
                    disabled={isUploading}
                    onChange={async (e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setIsUploading(true)
                        try {
                          const files = Array.from(e.target.files)
                          const uploadedUrls: string[] = []
                          const supabase = await import('@/utils/supabase/client').then(mod => mod.createClient())

                          for (const file of files) {
                            const fileExt = file.name.split('.').pop()
                            const fileName = `${Math.random()}.${fileExt}`
                            const filePath = `${currentUser.id}/${fileName}`

                            const { error: uploadError } = await supabase.storage
                              .from('repair-images')
                              .upload(filePath, file)

                            if (uploadError) {
                              console.error(uploadError)
                              toast.error(`Failed to upload ${file.name}`)
                              continue
                            }

                            const { data } = supabase.storage.from('repair-images').getPublicUrl(filePath)
                            uploadedUrls.push(data.publicUrl)
                          }
                          setImages(prev => [...prev, ...uploadedUrls])
                        } catch (error) {
                          toast.error("Upload failed")
                        } finally {
                          setIsUploading(false)
                        }
                      }
                    }}
                  />
                  {isUploading && <div className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin" /> Uploading...</div>}
                  {images.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-2">
                      {images.map((url, i) => (
                        <img key={i} src={url} alt="Uploaded" className="h-16 w-16 object-cover rounded border" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  disabled={isUploading}
                  onClick={handleSubmit}
                >
                  Post Repair
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <SearchBar
        allDevices={allDevices}
        allUsers={allUsers}
        categories={categories}
        value={q}
        onChange={setQ}
        deviceFilter={deviceFilter}
        onDeviceFilter={setDeviceFilter}
        categoryFilter={categoryFilter}
        onCategoryFilter={setCategoryFilter}
        userFilter={userFilter}
        onUserFilter={setUserFilter}
        outcomeFilter={outcomeFilter}
        onOutcomeFilter={setOutcomeFilter}
        repairs={repairPosts}
      />

      {/* Mobile New Repair Button (Floating or visible in layout) */}
      {currentUser && (
        <div className="md:hidden">
          <Button className="w-full" onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Repair
          </Button>
        </div>
      )}

      {/* Sort Options */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {filtered.length} repair{filtered.length !== 1 ? 's' : ''} found
        </span>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-40">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="upvotes">Most Upvoted</SelectItem>
            <SelectItem value="comments">Most Active</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-muted/10">
            <h3 className="font-semibold text-lg">No repairs found</h3>
            <p className="text-muted-foreground text-sm mt-1">Try adjusting your filters.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {displayedRepairs.map((r) => (
                <RepairCard key={r.id} id={r.id.toString()} />
              ))}
            </div>
            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => setDisplayCount(prev => prev + 12)}
                  className="px-8"
                >
                  Load More ({filtered.length - displayCount} remaining)
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
