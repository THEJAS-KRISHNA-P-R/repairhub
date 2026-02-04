"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { usersAPI, repairPostsAPI, followsAPI, type User, type RepairPost } from "@/lib/api"
import { useApi } from "@/lib/api-context"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RepairCard } from "@/components/custom/repair-card"
import { FollowButton } from "@/components/custom/follow-button"
import { ReportDialog } from "@/components/custom/report-dialog"
import { Loader2, Wrench, ThumbsUp, Calendar, Users } from "lucide-react"

export default function UserProfilePage() {
    const params = useParams<{ id: string }>()
    const { currentUser } = useApi()
    const [user, setUser] = useState<User | null>(null)
    const [repairs, setRepairs] = useState<RepairPost[]>([])
    const [loading, setLoading] = useState(true)
    const [totalUpvotes, setTotalUpvotes] = useState(0)
    const [followerCount, setFollowerCount] = useState(0)
    const [followingCount, setFollowingCount] = useState(0)

    useEffect(() => {
        if (!params.id) return

        const loadProfile = async () => {
            try {
                const [userData, allRepairs, followers, following] = await Promise.all([
                    usersAPI.getById(params.id),
                    repairPostsAPI.getAll(),
                    followsAPI.getFollowerCount(params.id),
                    followsAPI.getFollowingCount(params.id)
                ])
                setUser(userData)
                setFollowerCount(followers)
                setFollowingCount(following)

                // Filter repairs by this user
                const userRepairs = allRepairs.filter(r => r.user_id === params.id)
                setRepairs(userRepairs)

                // Calculate total upvotes received
                const upvotes = userRepairs.reduce((sum, r) => sum + (r.vote_count || 0), 0)
                setTotalUpvotes(upvotes)
            } catch (error) {
                console.error("Failed to load profile:", error)
            } finally {
                setLoading(false)
            }
        }

        loadProfile()
    }, [params.id])

    if (loading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!user) {
        return (
            <main className="mx-auto max-w-4xl p-4">
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold">User not found</h2>
                </div>
            </main>
        )
    }

    const memberSince = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

    return (
        <main className="mx-auto max-w-4xl p-4 space-y-6">
            {/* Profile Header */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        <img
                            src={user.avatar_url || "/placeholder-user.jpg"}
                            alt={user.username}
                            className="h-24 w-24 rounded-full border-4 border-background shadow-lg"
                        />
                        <div className="flex-1 text-center md:text-left space-y-3">
                            <div className="flex flex-col md:flex-row md:items-center gap-2">
                                <h1 className="text-2xl font-bold">{user.username}</h1>
                                {user.is_admin && (
                                    <Badge variant="default" className="w-fit mx-auto md:mx-0">Admin</Badge>
                                )}
                            </div>
                            {user.bio && (
                                <p className="text-muted-foreground">{user.bio}</p>
                            )}

                            {/* Follower Stats */}
                            <div className="flex justify-center md:justify-start gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                    <span className="font-semibold">{followerCount}</span>
                                    <span className="text-muted-foreground">followers</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="font-semibold">{followingCount}</span>
                                    <span className="text-muted-foreground">following</span>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-1 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Wrench className="h-4 w-4" />
                                    <span>{repairs.length} repairs</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <ThumbsUp className="h-4 w-4" />
                                    <span>{totalUpvotes} upvotes</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>Member since {memberSince}</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-center md:justify-start gap-2 pt-2">
                                <FollowButton userId={params.id} />
                                {currentUser && currentUser.id !== params.id && (
                                    <ReportDialog targetType="user" targetId={params.id} />
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* User's Repairs */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Repairs by {user.username}</h2>
                {repairs.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            No repairs posted yet
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {repairs.map((repair) => (
                            <RepairCard key={repair.id} repair={repair} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}
