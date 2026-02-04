"use client"

import { useEffect, useState } from "react"
import { bookmarksAPI, type Bookmark, type RepairPost } from "@/lib/api"
import { useApi } from "@/lib/api-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookmarkButton } from "@/components/custom/bookmark-button"
import { CategoryBadge } from "@/components/custom/category-badge"
import { Loader2, Bookmark as BookmarkIcon } from "lucide-react"
import Link from "next/link"

type BookmarkWithPost = Bookmark & { repair_post: RepairPost }

export default function BookmarksPage() {
    const { currentUser, isInitialized } = useApi()
    const [bookmarks, setBookmarks] = useState<BookmarkWithPost[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!isInitialized || !currentUser) return

        const load = async () => {
            try {
                const data = await bookmarksAPI.getAll()
                setBookmarks(data)
            } catch (error) {
                console.error("Failed to load bookmarks:", error)
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [isInitialized, currentUser])

    if (!isInitialized || loading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!currentUser) {
        return (
            <main className="mx-auto max-w-4xl p-4 md:p-6">
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold">Please sign in</h2>
                    <p className="text-muted-foreground mt-2">You need to be logged in to view your bookmarks.</p>
                    <Button asChild className="mt-4">
                        <Link href="/auth">Sign In</Link>
                    </Button>
                </div>
            </main>
        )
    }

    return (
        <main className="mx-auto max-w-4xl p-4 md:p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <BookmarkIcon className="h-6 w-6" />
                    My Bookmarks
                </h1>
                <p className="text-muted-foreground">Your saved repair posts.</p>
            </div>

            {bookmarks.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <BookmarkIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="font-semibold text-lg">No bookmarks yet</h3>
                        <p className="text-muted-foreground text-sm mt-1">
                            Save repairs you want to revisit later.
                        </p>
                        <Button asChild className="mt-4">
                            <Link href="/feed">Browse Repairs</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {bookmarks.map((bookmark) => {
                        const post = bookmark.repair_post
                        if (!post) return null

                        return (
                            <Card key={bookmark.id} className="hover:shadow-md transition">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between gap-4">
                                        <Link href={`/repairs/${post.id}`} className="hover:underline">
                                            <CardTitle className="text-lg">{post.item_name}</CardTitle>
                                        </Link>
                                        <div className="flex items-center gap-2">
                                            {post.category && <CategoryBadge category={post.category} size="sm" />}
                                            <BookmarkButton
                                                repairPostId={post.id}
                                                initialBookmarked={true}
                                                size="sm"
                                            />
                                        </div>
                                    </div>
                                    <CardDescription className="flex items-center gap-2">
                                        <span>{post.profiles?.username || 'Unknown'}</span>
                                        <span>·</span>
                                        <span>{new Date(post.date).toLocaleDateString()}</span>
                                        <Badge variant={post.success ? "default" : "secondary"} className="ml-2">
                                            {post.success ? "Success" : "Failure"}
                                        </Badge>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {post.issue_description || "No description"}
                                    </p>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </main>
    )
}
