"use client"

import { useEffect, useState, useMemo, useRef } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"
import { Category } from "@/lib/api"
import { cn } from "@/lib/utils"

type Props = {
  allDevices: string[]
  allUsers: { id: string; username: string }[]
  categories: Category[]
  value: string
  onChange: (v: string) => void
  deviceFilter: string
  onDeviceFilter: (v: string) => void
  categoryFilter: string
  onCategoryFilter: (v: string) => void
  userFilter: string
  onUserFilter: (v: string) => void
  outcomeFilter: string
  onOutcomeFilter: (v: string) => void
  // New: optional repairs list for autocomplete
  repairs?: { id: string; item_name: string; issue_description?: string }[]
}

export function SearchBar({
  allDevices,
  allUsers,
  categories,
  value,
  onChange,
  deviceFilter,
  onDeviceFilter,
  categoryFilter,
  onCategoryFilter,
  userFilter,
  onUserFilter,
  outcomeFilter,
  onOutcomeFilter,
  repairs = [],
}: Props) {
  const [internal, setInternal] = useState(value)
  const [mounted, setMounted] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

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

  // Close suggestions on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [])

  // Generate suggestions
  const suggestions = useMemo(() => {
    if (!internal.trim() || internal.length < 2) return []
    const search = internal.toLowerCase()

    return repairs
      .filter(r =>
        r.item_name.toLowerCase().includes(search) ||
        (r.issue_description || '').toLowerCase().includes(search)
      )
      .slice(0, 5)
      .map(r => ({
        id: r.id,
        title: r.item_name,
        subtitle: (r.issue_description || '').slice(0, 50)
      }))
  }, [internal, repairs])

  if (!mounted) return <div className="h-10 w-full bg-muted/20 animate-pulse rounded-md" />

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center">
      <div className="relative flex-1" ref={containerRef}>
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="Search repairs..."
          value={internal}
          onChange={(e) => {
            setInternal(e.target.value)
            setShowSuggestions(true)
          }}
          onFocus={() => setShowSuggestions(true)}
          className="pl-9 pr-8"
          aria-label="Search repairs"
        />
        {internal && (
          <button
            onClick={() => {
              setInternal("")
              onChange("")
              inputRef.current?.focus()
            }}
            className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Autocomplete Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 overflow-hidden">
            {suggestions.map((s, i) => (
              <Link
                key={s.id}
                href={`/repairs/${s.id}`}
                className={cn(
                  "block px-3 py-2 hover:bg-accent transition-colors",
                  i !== suggestions.length - 1 && "border-b"
                )}
                onClick={() => setShowSuggestions(false)}
              >
                <div className="font-medium text-sm">{s.title}</div>
                {s.subtitle && (
                  <div className="text-xs text-muted-foreground truncate">{s.subtitle}...</div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
        <Select value={categoryFilter} onValueChange={onCategoryFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.icon && <span className="mr-1">{cat.icon}</span>}
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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
