import Link from "next/link"
import { Button } from "@/components/ui/button"

export function LandingHero() {
  return (
    <section aria-labelledby="hero-title" className="bg-card">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
        <div className="space-y-6">
          <h1 id="hero-title" className="text-pretty text-4xl font-semibold leading-tight md:text-5xl">
            Fix it. Together.
            <span className="block text-balance text-primary">The DIY device repair community.</span>
          </h1>
          <p className="text-muted-foreground md:text-lg">
            Learn from real repairs, publish your wins, and get unstuck fast with step-by-step guides.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/feed" aria-label="Explore the repair feed">
              <Button className="min-w-36">Explore repairs</Button>
            </Link>
            <Link href="/auth" aria-label="Create your account">
              <Button variant="outline" className="min-w-36 bg-transparent">
                Create account
              </Button>
            </Link>
          </div>

          <dl className="mt-6 grid grid-cols-3 gap-4 text-center md:w-10/12" aria-label="Community stats">
            <div className="rounded-lg border p-4">
              <dt className="text-xs text-muted-foreground">Repairs logged</dt>
              <dd className="text-xl font-semibold">6+</dd>
            </div>
            <div className="rounded-lg border p-4">
              <dt className="text-xs text-muted-foreground">Success rate</dt>
              <dd className="text-xl font-semibold">95%</dd>
            </div>
            <div className="rounded-lg border p-4">
              <dt className="text-xs text-muted-foreground">Guides</dt>
              <dd className="text-xl font-semibold">5</dd>
            </div>
          </dl>
        </div>

        <div className="relative">
          <img
            src="/workbench-tools-electronics-photo.jpg"
            alt="Repair workbench with tools and components"
            className="w-full rounded-xl border shadow-sm"
          />
        </div>
      </div>
    </section>
  )
}
