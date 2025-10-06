"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function LandingSections() {
  return (
    <>
      {/* Social proof bar */}
      <section aria-label="Trusted by makers" className="border-y bg-muted/50">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 text-sm text-muted-foreground md:grid-cols-4">
          <p>Backed by thousands of posts</p>
          <p>Real-world outcomes</p>
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

      {/* Preview strip */}
      <section aria-labelledby="preview-title" className="bg-card">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 id="preview-title" className="text-pretty text-2xl font-semibold md:text-3xl">
            See what people are fixing
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {["iPhone 12 speaker", "ThinkPad trackpad", "PS5 fan swap"].map((t, i) => (
              <div key={i} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{t}</p>
                  <span className="rounded bg-accent px-2 py-1 text-xs text-accent-foreground">success</span>
                </div>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                  Community steps, parts, and pitfalls—summarized for quick wins.
                </p>
                <img
                  src={`/.jpg?height=140&width=480&query=${encodeURIComponent(t + " repair preview")}`}
                  alt={`${t} repair preview`}
                  className="mt-3 w-full rounded-md border"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section aria-labelledby="testimonials-title">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 id="testimonials-title" className="text-pretty text-2xl font-semibold md:text-3xl">
            Loved by DIYers and fixers
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {
                quote: "Found the exact steps for my laptop battery—saved time and money.",
                name: "Samir, hobbyist",
              },
              {
                quote: "The comments clarified a tricky connector—my repair worked on the first try.",
                name: "Priya, student",
              },
              {
                quote: "Guides are clean and searchable. Publishing my own was a breeze.",
                name: "Leo, technician",
              },
            ].map((t, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <p className="text-balance text-sm">{t.quote}</p>
                  <p className="mt-3 text-xs text-muted-foreground">{t.name}</p>
                </CardContent>
              </Card>
            ))}
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
              <Button className="min-w-40">Get started — it’s free</Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
