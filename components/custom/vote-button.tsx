"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ThumbsUp } from "lucide-react"
import { votesAPI } from "@/lib/api"
import { useApi } from "@/lib/api-context"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface VoteButtonProps {
    repairPostId: string
    initialCount?: number
    initialVoted?: boolean
    size?: "sm" | "default"
}

export function VoteButton({
    repairPostId,
    initialCount = 0,
    initialVoted = false,
    size = "default"
}: VoteButtonProps) {
    const { currentUser } = useApi()
    const [count, setCount] = useState(initialCount)
    const [voted, setVoted] = useState(initialVoted)
    const [loading, setLoading] = useState(false)

    const handleVote = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (!currentUser) {
            toast.error("Please sign in to vote")
            return
        }

        setLoading(true)
        try {
            const result = await votesAPI.toggle(repairPostId)
            setVoted(result.voted)
            setCount(result.count)
            toast.success(result.voted ? "Upvoted!" : "Vote removed")
        } catch (error) {
            toast.error("Failed to vote")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant={voted ? "default" : "outline"}
            size={size === "sm" ? "sm" : "default"}
            className={cn(
                "gap-1.5",
                size === "sm" && "h-8 px-2 text-xs"
            )}
            onClick={handleVote}
            disabled={loading}
        >
            <ThumbsUp className={cn("h-4 w-4", size === "sm" && "h-3 w-3")} />
            <span>{count}</span>
        </Button>
    )
}
