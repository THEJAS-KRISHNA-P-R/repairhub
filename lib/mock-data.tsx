"use client"

import type React from "react"
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { toast } from "@/components/ui/use-toast"

export type Outcome = "success" | "failure"

export type Badge = {
  id: string
  name: string
  desc: string
  variant?: "default" | "secondary" | "outline"
}

export type User = {
  id: string
  username: string
  email: string
  bio?: string
  avatarUrl?: string
  badges: string[] // badge ids
}

export type Comment = {
  id: string
  userId: string
  content: string
  parentId?: string | null
  date: string
}

export type RepairPost = {
  id: string
  userId: string
  deviceName: string
  issueDesc: string
  repairSteps: string
  outcome: Outcome
  date: string
  images: string[]
  comments: Comment[]
}

export type Guide = {
  id: string
  userId: string
  itemName: string
  content: string
  date: string
}

type State = {
  users: User[]
  repairs: RepairPost[]
  guides: Guide[]
  badges: Badge[]
  currentUserId?: string | null
}

const STORAGE_KEY = "digital-repair-hub-state-v1"

const delay = (ms = 350) => new Promise((res) => setTimeout(res, ms))

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

export function highlightMatch(text: string, query: string) {
  if (!query) return [{ text, match: false }]
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")})`, "ig")
  const parts = text.split(regex)
  return parts.filter(Boolean).map((part) => ({
    text: part,
    match: regex.test(part),
  }))
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

type Ctx = {
  state: State
  me: User | null
  login: (email: string, username?: string) => Promise<User>
  register: (email: string, username: string) => Promise<User>
  logout: () => Promise<void>
  addRepair: (input: Omit<RepairPost, "id" | "date" | "comments">) => Promise<RepairPost>
  editRepair: (id: string, patch: Partial<RepairPost>) => Promise<RepairPost>
  deleteRepair: (id: string) => Promise<void>
  addComment: (repairId: string, content: string, parentId?: string | null) => Promise<Comment>
  editComment: (repairId: string, commentId: string, patch: Partial<Comment>) => Promise<Comment>
  deleteComment: (repairId: string, commentId: string) => Promise<void>
  addGuide: (input: Omit<Guide, "id" | "date">) => Promise<Guide>
  editGuide: (id: string, patch: Partial<Guide>) => Promise<Guide>
  deleteGuide: (id: string) => Promise<void>
  updateProfile: (patch: Partial<User>) => Promise<User>
  fileToBase64: (f: File) => Promise<string>
}

const MockDataContext = createContext<Ctx | null>(null)

function seedInitial(): State {
  const badges: Badge[] = [
    { id: "first-repair", name: "First Repair", desc: "Posted your first repair", variant: "default" },
    { id: "contributor", name: "Contributor", desc: "5+ repairs", variant: "secondary" },
    { id: "helpful", name: "Helpful", desc: "10+ comments", variant: "outline" },
  ]
  const users: User[] = [
    {
      id: uuidv4(),
      username: "alice",
      email: "alice@example.com",
      bio: "Tinkerer",
      avatarUrl: "/placeholder-user.jpg",
      badges: [],
    },
    {
      id: uuidv4(),
      username: "bob",
      email: "bob@example.com",
      bio: "Phone fixer",
      avatarUrl: "/placeholder-user.jpg",
      badges: [],
    },
    {
      id: uuidv4(),
      username: "charlie",
      email: "charlie@example.com",
      bio: "Console modder",
      avatarUrl: "/placeholder-user.jpg",
      badges: [],
    },
  ]
  const mkComment = (userId: string, content: string): Comment => ({
    id: uuidv4(),
    userId,
    content,
    date: new Date().toISOString(),
  })

  const repairs: RepairPost[] = [
    {
      id: uuidv4(),
      userId: users[0].id,
      deviceName: "iPhone 13",
      issueDesc: "Screen cracked and touch intermittently unresponsive.",
      repairSteps: "Replaced screen assembly. Verified connectors. Calibrated True Tone.",
      outcome: "success",
      date: new Date().toISOString(),
      images: ["/placeholder.jpg"],
      comments: [mkComment(users[1].id, "Nice result! How long did it take?")],
    },
    {
      id: uuidv4(),
      userId: users[1].id,
      deviceName: "Nintendo Switch",
      issueDesc: "Joy-Con drift persists after cleaning.",
      repairSteps: "Replaced joystick module. Cleaned contacts. Firmware update.",
      outcome: "success",
      date: new Date().toISOString(),
      images: ["/placeholder.jpg"],
      comments: [mkComment(users[0].id, "Firmware step is clutch. Great tip!")],
    },
    {
      id: uuidv4(),
      userId: users[2].id,
      deviceName: "Dell XPS 15",
      issueDesc: "Thermal throttling under light load.",
      repairSteps: "Repasted CPU/GPU. Replaced thermal pads. Cleaned fans.",
      outcome: "failure",
      date: new Date().toISOString(),
      images: ["/placeholder.jpg"],
      comments: [],
    },
  ]

  const guides: Guide[] = [
    {
      id: uuidv4(),
      userId: users[0].id,
      itemName: "iPhone Battery Replacement",
      content: "Step-by-step battery replacement with safety notes.",
      date: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      userId: users[2].id,
      itemName: "Laptop Fan Cleaning",
      content: "Removing dust safely and reassembling.",
      date: new Date().toISOString(),
    },
  ]

  return { users, repairs, guides, badges, currentUserId: users[0].id }
}

function usePersistentState(): [State, React.Dispatch<React.SetStateAction<State>>] {
  const [state, setState] = useState<State>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as State) : seedInitial()
    } catch {
      return seedInitial()
    }
  })

  // avoid double-write on first render
  const mounted = useRef(false)
  useEffect(() => {
    if (mounted.current) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } else {
      mounted.current = true
    }
  }, [state])

  return [state, setState]
}

export function MockDataProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = usePersistentState()

  const me = useMemo(() => {
    if (!state.currentUserId) return null
    return state.users.find((u) => u.id === state.currentUserId) ?? null
  }, [state.currentUserId, state.users])

  const awardBadges = useCallback((draft: State, userId: string) => {
    const user = draft.users.find((u) => u.id === userId)
    if (!user) return
    const repairsByUser = draft.repairs.filter((r) => r.userId === userId).length
    const commentsByUser = draft.repairs.flatMap((r) => r.comments).filter((c) => c.userId === userId).length

    const ensure = (id: string) => {
      if (!user.badges.includes(id)) user.badges.push(id)
    }

    if (repairsByUser >= 1) ensure("first-repair")
    if (repairsByUser >= 5) ensure("contributor")
    if (commentsByUser >= 10) ensure("helpful")
  }, [])

  const login = useCallback(
    async (email: string, username?: string) => {
      await delay()
      let user = state.users.find((u) => u.email === email)
      if (!user && username) {
        // auto-register if username provided
        user = { id: uuidv4(), email, username, badges: [], avatarUrl: "/placeholder-user.jpg", bio: "" }
        setState((s) => ({ ...s, users: [...s.users, user!], currentUserId: user!.id }))
        toast({ title: "Welcome!", description: "Account created." })
        return user
      }
      if (!user) {
        toast({ title: "Login failed", description: "User not found", variant: "destructive" })
        throw new Error("User not found")
      }
      setState((s) => ({ ...s, currentUserId: user!.id }))
      toast({ title: "Signed in", description: `Hello, ${user.username}` })
      return user
      // TODO: Replace with POST /auth/login
    },
    [setState, state.users],
  )

  const register = useCallback(
    async (email: string, username: string) => {
      await delay()
      const exists = state.users.some((u) => u.email === email)
      if (exists) {
        toast({ title: "Registration failed", description: "Email already used", variant: "destructive" })
        throw new Error("Email exists")
      }
      const user: User = { id: uuidv4(), email, username, badges: [], avatarUrl: "/placeholder-user.jpg", bio: "" }
      setState((s) => ({ ...s, users: [...s.users, user], currentUserId: user.id }))
      toast({ title: "Welcome!", description: "Account created." })
      return user
      // TODO: Replace with POST /auth/register
    },
    [setState, state.users],
  )

  const logout = useCallback(async () => {
    await delay(200)
    setState((s) => ({ ...s, currentUserId: null }))
    toast({ title: "Signed out" })
    // TODO: Replace with POST /auth/logout
  }, [setState])

  const addRepair = useCallback(
    async (input: Omit<RepairPost, "id" | "date" | "comments">) => {
      await delay()
      const newRepair: RepairPost = { ...input, id: uuidv4(), date: new Date().toISOString(), comments: [] }
      setState((s) => {
        const draft = { ...s, repairs: [newRepair, ...s.repairs] }
        awardBadges(draft, newRepair.userId)
        return draft
      })
      toast({ title: "Repair posted", description: input.deviceName })
      return newRepair
      // TODO: POST /repairs
    },
    [setState, awardBadges],
  )

  const editRepair = useCallback(
    async (id: string, patch: Partial<RepairPost>) => {
      await delay()
      let updated: RepairPost | null = null
      setState((s) => {
        const repairs = s.repairs.map((r) => (r.id === id ? (updated = { ...r, ...patch })! : r))
        return { ...s, repairs }
      })
      if (!updated) throw new Error("Not found")
      toast({ title: "Repair updated" })
      return updated
      // TODO: PUT /repairs/:id
    },
    [setState],
  )

  const deleteRepair = useCallback(
    async (id: string) => {
      await delay()
      setState((s) => ({ ...s, repairs: s.repairs.filter((r) => r.id !== id) }))
      toast({ title: "Repair deleted" })
      // TODO: DELETE /repairs/:id
    },
    [setState],
  )

  const addComment = useCallback(
    async (repairId: string, content: string, parentId?: string | null) => {
      await delay(200)
      const comment: Comment = {
        id: uuidv4(),
        userId: state.currentUserId!,
        content,
        parentId: parentId ?? null,
        date: new Date().toISOString(),
      }
      setState((s) => {
        const repairs = s.repairs.map((r) => (r.id === repairId ? { ...r, comments: [...r.comments, comment] } : r))
        const draft = { ...s, repairs }
        if (s.currentUserId) awardBadges(draft, s.currentUserId)
        return draft
      })
      toast({ title: "Comment added" })
      return comment
      // TODO: POST /repairs/:id/comments
    },
    [setState, state.currentUserId, awardBadges],
  )

  const editComment = useCallback(
    async (repairId: string, commentId: string, patch: Partial<Comment>) => {
      await delay(200)
      let updated: Comment | null = null
      setState((s) => {
        const repairs = s.repairs.map((r) =>
          r.id === repairId
            ? { ...r, comments: r.comments.map((c) => (c.id === commentId ? (updated = { ...c, ...patch })! : c)) }
            : r,
        )
        return { ...s, repairs }
      })
      if (!updated) throw new Error("Not found")
      toast({ title: "Comment updated" })
      return updated
      // TODO: PUT /repairs/:id/comments/:commentId
    },
    [setState],
  )

  const deleteComment = useCallback(
    async (repairId: string, commentId: string) => {
      await delay(200)
      setState((s) => {
        const repairs = s.repairs.map((r) =>
          r.id === repairId ? { ...r, comments: r.comments.filter((c) => c.id !== commentId) } : r,
        )
        return { ...s, repairs }
      })
      toast({ title: "Comment deleted" })
      // TODO: DELETE /repairs/:id/comments/:commentId
    },
    [setState],
  )

  const addGuide = useCallback(
    async (input: Omit<Guide, "id" | "date">) => {
      await delay(200)
      const newGuide: Guide = { ...input, id: uuidv4(), date: new Date().toISOString() }
      setState((s) => ({ ...s, guides: [newGuide, ...s.guides] }))
      toast({ title: "Guide published", description: input.itemName })
      return newGuide
      // TODO: POST /guides
    },
    [setState],
  )

  const editGuide = useCallback(
    async (id: string, patch: Partial<Guide>) => {
      await delay(200)
      let updated: Guide | null = null
      setState((s) => {
        const guides = s.guides.map((g) => (g.id === id ? (updated = { ...g, ...patch })! : g))
        return { ...s, guides }
      })
      if (!updated) throw new Error("Not found")
      toast({ title: "Guide updated" })
      return updated
      // TODO: PUT /guides/:id
    },
    [setState],
  )

  const deleteGuide = useCallback(
    async (id: string) => {
      await delay(200)
      setState((s) => ({ ...s, guides: s.guides.filter((g) => g.id !== id) }))
      toast({ title: "Guide deleted" })
      // TODO: DELETE /guides/:id
    },
    [setState],
  )

  const updateProfile = useCallback(
    async (patch: Partial<User>) => {
      await delay(200)
      let updated: User | null = null
      setState((s) => {
        const users = s.users.map((u) =>
          s.currentUserId && u.id === s.currentUserId ? (updated = { ...u, ...patch })! : u,
        )
        return { ...s, users }
      })
      if (!updated) throw new Error("No user")
      toast({ title: "Profile updated" })
      return updated
      // TODO: PUT /users/me
    },
    [setState],
  )

  const value: Ctx = {
    state,
    me,
    login,
    register,
    logout,
    addRepair,
    editRepair,
    deleteRepair,
    addComment,
    editComment,
    deleteComment,
    addGuide,
    editGuide,
    deleteGuide,
    updateProfile,
    fileToBase64,
  }

  return <MockDataContext.Provider value={value}>{children}</MockDataContext.Provider>
}

export function useMock() {
  const ctx = useContext(MockDataContext)
  if (!ctx) throw new Error("useMock must be used within MockDataProvider")
  return ctx
}
