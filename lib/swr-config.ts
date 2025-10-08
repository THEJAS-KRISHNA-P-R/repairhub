import { SWRConfig } from 'swr'

export const swrConfig = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 2000,
  shouldRetryOnError: false,
}

// Global cache warmer
export async function warmupCache() {
  // Prefetch common data
  await Promise.all([
    fetch('/api/guides').then(r => r.json()),
    fetch('/api/repairs').then(r => r.json()),
  ])
}