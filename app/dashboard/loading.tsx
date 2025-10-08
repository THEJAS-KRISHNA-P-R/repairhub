import { DashboardSkeleton } from "@/components/ui/loading"

export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl space-y-8 p-4">
      <DashboardSkeleton />
    </main>
  )
}