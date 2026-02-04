"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { repairPostsAPI, type RepairPost } from "@/lib/api"
import { Loader2 } from "lucide-react"

export function LandingSections() {
  const [recentRepairs, setRecentRepairs] = useState<RepairPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRepairs = async () => {
      try {
        const repairs = await repairPostsAPI.getAll()
        // Get 3 most recent repairs
        setRecentRepairs(repairs.slice(0, 3))
      } catch (error) {
        console.error("Failed to load repairs:", error)
      } finally {
        setLoading(false)
      }
    }

    loadRepairs()
  }, [])

  return (
    <>
      {/* Social proof bar */}
      <section aria-label="Trusted by makers" className="border-y bg-muted/50">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 text-sm text-muted-foreground md:grid-cols-4">
          <p>Real-world solutions</p>
          <p>Community-verified</p>
          <p>No fluff—just results</p>
          <p>Friendly moderation</p>
        </div>
      </section>

      {/* Feature highlights */}
      <section aria-labelledby="features-title">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 id="features-title" className="text-pretty text-2xl font-semibold md:text-3xl">
            Everything you need to repair smarter
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Search-first feed</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Find relevant repairs instantly with free text + filters, highlighting the exact steps that matter.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Guides that grow</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Publish step-by-step guides and keep them current as devices evolve—no gatekeeping.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Community-powered</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Threaded comments, reactions, and badges reward helpful contributions and real outcomes.
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/feed">
              <Button className="min-w-36">Browse the feed</Button>
            </Link>
            <Link href="/guides">
              <Button variant="outline" className="min-w-36 bg-transparent">
                Explore guides
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Preview strip - Real repairs from database */}
      <section aria-labelledby="preview-title" className="bg-card">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 id="preview-title" className="text-pretty text-2xl font-semibold md:text-3xl">
            See what people are fixing
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-lg border p-4 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="h-5 w-32 bg-muted rounded"></div>
                    <div className="h-6 w-16 bg-muted rounded"></div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="h-4 w-full bg-muted rounded"></div>
                    <div className="h-4 w-3/4 bg-muted rounded"></div>
                  </div>
                </div>
              ))
            ) : recentRepairs.length === 0 ? (
              <div className="col-span-3 text-center py-8 text-muted-foreground">
                <p>No repairs yet. Be the first to share!</p>
                <Link href="/feed">
                  <Button className="mt-4">Post a Repair</Button>
                </Link>
              </div>
            ) : (
              recentRepairs.map((repair) => (
                <Link
                  key={repair.id}
                  href={`/repairs/${repair.id}`}
                  className="block rounded-lg border p-4 hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium truncate">{repair.item_name}</p>
                    <Badge variant={repair.success ? "default" : "secondary"}>
                      {repair.success ? "Success" : "Failure"}
                    </Badge>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {repair.issue_description || "No description provided"}
                  </p>
                  {repair.category && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {repair.category.icon} {repair.category.name}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">
                    by {repair.profiles?.username || "Unknown"} · {new Date(repair.date).toLocaleDateString()}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* How it works section - replaces fake testimonials */}
      <section aria-labelledby="how-it-works-title">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 id="how-it-works-title" className="text-pretty text-2xl font-semibold md:text-3xl">
            How it works
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="text-3xl mb-3">🔍</div>
                <h3 className="font-semibold">1. Find your device</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Search repairs by device name, issue, or browse categories to find similar problems.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-3xl mb-3">🛠️</div>
                <h3 className="font-semibold">2. Learn from others</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Read step-by-step repair instructions shared by real people who fixed the same issue.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-3xl mb-3">✨</div>
                <h3 className="font-semibold">3. Share your win</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Fixed something? Share your repair to help the next person and earn community recognition.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-title" className="border-t">
        <div className="mx-auto max-w-3xl px-4 py-14">
          <h2 id="faq-title" className="text-pretty text-2xl font-semibold md:text-3xl">
            Frequently asked questions
          </h2>
          <Accordion type="single" collapsible className="mt-6">
            <AccordionItem value="a">
              <AccordionTrigger>Is it free to use?</AccordionTrigger>
              <AccordionContent>Yes—browse, search, and publish for free. You own your content.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="b">
              <AccordionTrigger>Can I publish my own repairs?</AccordionTrigger>
              <AccordionContent>Absolutely. Share your steps, parts, and outcomes to help others.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="c">
              <AccordionTrigger>How accurate are the guides?</AccordionTrigger>
              <AccordionContent>
                Everything is community-sourced with comments, updates, and outcomes for transparency.
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="mt-8">
            <Link href="/auth">
              <Button className="min-w-40">Get started — it's free</Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
