"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { followsAPI, type User } from "@/lib/api"
import { Loader2 } from "lucide-react"
import Link from "next/link"

interface FollowsListProps {
    userId: string
    type: "followers" | "following"
    trigger?: React.ReactNode
    count?: number
}

export function FollowsList({ userId, type, trigger, count }: FollowsListProps) {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setLoading(true)
            const fetchUsers = async () => {
                try {
                    const data = type === "followers"
                        ? await followsAPI.getFollowers(userId)
                        : await followsAPI.getFollowing(userId)
                    setUsers(data)
                } catch (error) {
                    console.error("Failed to fetch follows:", error)
                } finally {
                    setLoading(false)
                }
            }
            fetchUsers()
        }
    }, [isOpen, userId, type])

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <div className="flex items-center gap-1 cursor-pointer hover:underline">
                        <span className="font-semibold">{count || 0}</span>
                        <span className="text-muted-foreground">{type}</span>
                    </div>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="capitalize">{type}</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[300px] w-full pr-4">
                    {loading ? (
                        <div className="flex justify-center p-4">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center text-muted-foreground p-4">
                            No users found.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {users.map((user) => (
                                <Link
                                    key={user.id}
                                    href={`/users/${user.id}`}
                                    className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Avatar>
                                        <AvatarImage src={user.avatar_url} />
                                        <AvatarFallback>{user.username[0]?.toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-sm">{user.username}</span>
                                        {user.bio && (
                                            <span className="text-xs text-muted-foreground line-clamp-1">{user.bio}</span>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
