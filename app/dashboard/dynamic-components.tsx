"use client"

import dynamic from 'next/dynamic'

// Dynamically import non-critical components
export const DynamicChart = dynamic(() => import('./Charts').then(mod => mod.default), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse space-y-4">
      <div className="h-[300px] rounded bg-muted" />
    </div>
  )
})

export { default as StaticChart } from './Charts'