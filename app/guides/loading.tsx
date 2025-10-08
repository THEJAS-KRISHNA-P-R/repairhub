import { GuidesSkeleton } from "@/components/ui/loading"

export default function GuidesLoading() {
  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4">
      <GuidesSkeleton />
    </main>
  )
}