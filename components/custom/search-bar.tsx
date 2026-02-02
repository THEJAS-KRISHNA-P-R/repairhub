"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

type Props = {
  allDevices: string[]
  allUsers: { id: string; username: string }[]
  value: string
  onChange: (v: string) => void
  deviceFilter: string
  onDeviceFilter: (v: string) => void
  userFilter: string
  onUserFilter: (v: string) => void
  outcomeFilter: string
  onOutcomeFilter: (v: string) => void
}

export function SearchBar({
  allDevices,
  allUsers,
  value,
  onChange,
  deviceFilter,
  onDeviceFilter,
  userFilter,
  onUserFilter,
  outcomeFilter,
  onOutcomeFilter,
}: Props) {
  const [internal, setInternal] = useState(value)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
    setInternal(value)
  }, [value])

  // debounce update
  useEffect(() => {
    const t = setTimeout(() => {
      if (internal !== value) onChange(internal)
    }, 300)
    return () => clearTimeout(t)
  }, [internal]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!mounted) return <div className="h-10 w-full bg-muted/20 animate-pulse rounded-md" />

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search repairs..."
          value={internal}
          onChange={(e) => setInternal(e.target.value)}
          className="pl-9"
          aria-label="Search repairs"
        />
      </div>

      <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
        <Select value={deviceFilter} onValueChange={onDeviceFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Device" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All devices</SelectItem>
            {Array.from(new Set(allDevices))
              .sort()
              .map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <Select value={outcomeFilter} onValueChange={onOutcomeFilter}>
          <SelectTrigger className="w-[110px]">
            <SelectValue placeholder="Outcome" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failure">Failure</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
