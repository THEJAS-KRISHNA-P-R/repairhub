"use client"

import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

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
  useEffect(() => setInternal(value), [value])

  // debounce update
  useEffect(() => {
    const t = setTimeout(() => {
      if (internal !== value) onChange(internal)
    }, 300)
    return () => clearTimeout(t)
  }, [internal]) // eslint-disable-line react-hooks/exhaustive-deps

  const deviceSuggestions = useMemo(() => {
    const q = internal.trim().toLowerCase()
    if (!q) return []
    return Array.from(new Set(allDevices.filter((d) => d.toLowerCase().includes(q)))).slice(0, 5)
  }, [internal, allDevices])

  return (
    <div className="grid gap-3">
      <div className="grid gap-3 md:grid-cols-4">
        <div className="md:col-span-2">
          <Input
            placeholder="Search repairs by device, issue, or steps…"
            value={internal}
            onChange={(e) => setInternal(e.target.value)}
            aria-label="Search repairs"
          />
        </div>
        <Select value={deviceFilter} onValueChange={onDeviceFilter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter by device" />
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
        <Select value={userFilter} onValueChange={onUserFilter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter by user" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All users</SelectItem>
            {allUsers.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.username}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={outcomeFilter} onValueChange={onOutcomeFilter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Outcome" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All outcomes</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failure">Failure</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Command className={cn("rounded-md border")}>
        <CommandInput placeholder="Suggestions…" />
        <CommandList>
          <CommandEmpty>No suggestions.</CommandEmpty>
          <CommandGroup heading="Devices">
            {deviceSuggestions.map((d) => (
              <CommandItem key={d} value={d} onSelect={(val) => onChange(val)}>
                {d}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  )
}
