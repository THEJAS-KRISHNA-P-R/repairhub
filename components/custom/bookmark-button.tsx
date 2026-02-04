"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Bookmark } from "lucide-react"
import { bookmarksAPI } from "@/lib/api"
import { useApi } from "@/lib/api-context"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface BookmarkButtonProps {
    repairPostId: string
    initialBookmarked?: boolean
    size?: "sm" | "default"
}

export function BookmarkButton({
    repairPostId,
    initialBookmarked = false,
    size = "default"
}: BookmarkButtonProps) {
    const { currentUser } = useApi()
    const [bookmarked, setBookmarked] = useState(initialBookmarked)
    const [loading, setLoading] = useState(false)

    const handleBookmark = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (!currentUser) {
            toast.error("Please sign in to bookmark")
            return
        }

        setLoading(true)
        try {
            const isBookmarked = await bookmarksAPI.toggle(repairPostId)
            setBookmarked(isBookmarked)
            toast.success(isBookmarked ? "Saved to bookmarks" : "Removed from bookmarks")
        } catch (error) {
            toast.error("Failed to update bookmark")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant="ghost"
            size={size === "sm" ? "sm" : "icon"}
            className={cn(
                bookmarked && "text-primary",
                size === "sm" && "h-8 w-8"
            )}
            onClick={handleBookmark}
            disabled={loading}
            title={bookmarked ? "Remove bookmark" : "Save to bookmarks"}
        >
            <Bookmark
                className={cn(
                    "h-4 w-4",
                    bookmarked && "fill-current"
                )}
            />
        </Button>
    )
}
