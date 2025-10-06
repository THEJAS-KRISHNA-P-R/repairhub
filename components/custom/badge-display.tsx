"use client"

import { Badge as UIBadge } from "@/components/ui/badge"
import { useMock } from "@/lib/mock-data"

export function BadgeDisplay({ ids }: { ids: string[] }) {
  const { state } = useMock()
  const badges = state.badges.filter((b) => ids.includes(b.id))
  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((b) => (
        <UIBadge key={b.id} variant={b.variant}>
          {b.name}
        </UIBadge>
      ))}
    </div>
  )
}
