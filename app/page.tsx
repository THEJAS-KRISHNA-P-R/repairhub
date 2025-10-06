import type { Metadata } from "next"
import { LandingHero } from "@/components/custom/landing-hero"
import { LandingSections } from "@/components/custom/landing-sections"

export const metadata: Metadata = {
  title: "Digital Repair Café — Fix it. Together.",
  description: "Join the DIY repair community. Discover guides, share repairs, and learn faster with real results.",
}

export default function Page() {
  return (
    <main>
      <LandingHero />
      <LandingSections />
      {/* Added full marketing landing in place of redirect to /feed */}
    </main>
  )
}
