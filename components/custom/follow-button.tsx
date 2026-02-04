"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { followsAPI } from "@/lib/api"
import { useApi } from "@/lib/api-context"
import { UserPlus, UserMinus, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface FollowButtonProps {
    userId: string
    size?: "sm" | "default" | "icon"
    className?: string
}

export function FollowButton({ userId, size = "default", className }: FollowButtonProps) {
    const { currentUser } = useApi()
    const [isFollowing, setIsFollowing] = useState(false)
    const [loading, setLoading] = useState(true)
    const [toggling, setToggling] = useState(false)

    useEffect(() => {
        if (currentUser && currentUser.id !== userId) {
            followsAPI.isFollowing(userId).then(setIsFollowing).finally(() => setLoading(false))
        } else {
            setLoading(false)
        }
    }, [currentUser, userId])

    // Don't show button for own profile or if not logged in
    if (!currentUser || currentUser.id === userId) {
        return null
    }

    const handleToggle = async () => {
        setToggling(true)
        try {
            if (isFollowing) {
                await followsAPI.unfollow(userId)
                setIsFollowing(false)
                toast.success("Unfollowed")
            } else {
                await followsAPI.follow(userId)
                setIsFollowing(true)
                toast.success("Following!")
            }
        } catch (error) {
            toast.error("Failed to update follow status")
        } finally {
            setToggling(false)
        }
    }

    if (loading) {
        return (
            <Button size={size} variant="outline" disabled className={className}>
                <Loader2 className="h-4 w-4 animate-spin" />
            </Button>
        )
    }

    return (
        <Button
            size={size}
            variant={isFollowing ? "outline" : "default"}
            onClick={handleToggle}
            disabled={toggling}
            className={className}
        >
            {toggling ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : isFollowing ? (
                <UserMinus className="h-4 w-4 mr-1" />
            ) : (
                <UserPlus className="h-4 w-4 mr-1" />
            )}
            {isFollowing ? "Unfollow" : "Follow"}
        </Button>
    )
}
