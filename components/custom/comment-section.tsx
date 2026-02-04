"use client"

import { useState, useEffect } from "react"
import { commentsAPI, type Comment } from "@/lib/api"
import { useApi } from "@/lib/api-context"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, MessageSquare, Send, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface CommentSectionProps {
    repairPostId: string
}

export function CommentSection({ repairPostId }: CommentSectionProps) {
    const { currentUser } = useApi()
    const [comments, setComments] = useState<Comment[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [newComment, setNewComment] = useState("")

    useEffect(() => {
        loadComments()
    }, [repairPostId])

    const loadComments = async () => {
        try {
            const data = await commentsAPI.getByRepairPost(repairPostId)
            setComments(data)
        } catch (error) {
            console.error("Failed to load comments:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newComment.trim() || !currentUser) return

        setSubmitting(true)
        try {
            const comment = await commentsAPI.create(repairPostId, { content: newComment.trim() })
            setComments(prev => [...prev, comment])
            setNewComment("")
            toast.success("Comment added!")
        } catch (error) {
            toast.error("Failed to add comment")
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (commentId: string) => {
        try {
            await commentsAPI.delete(commentId)
            setComments(prev => prev.filter(c => c.id !== commentId))
            toast.success("Comment deleted")
        } catch (error) {
            toast.error("Failed to delete comment")
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                <h3 className="font-semibold">Comments ({comments.length})</h3>
            </div>

            {/* Comment Form */}
            {currentUser ? (
                <form onSubmit={handleSubmit} className="space-y-3">
                    <Textarea
                        placeholder="Share your thoughts, tips, or ask a question..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                        disabled={submitting}
                    />
                    <div className="flex justify-end">
                        <Button type="submit" disabled={!newComment.trim() || submitting}>
                            {submitting ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4 mr-1" />
                            )}
                            Post Comment
                        </Button>
                    </div>
                </form>
            ) : (
                <div className="bg-muted/50 p-4 rounded-lg text-center text-sm text-muted-foreground">
                    <a href="/auth" className="text-primary hover:underline">Sign in</a> to leave a comment
                </div>
            )}

            {/* Comments List */}
            {comments.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                    No comments yet. Be the first to share your thoughts!
                </div>
            ) : (
                <div className="space-y-4">
                    {comments.map((comment) => {
                        const author = comment.profiles
                        const authorName = author?.username || "Unknown"
                        const isOwner = currentUser?.id === comment.user_id

                        return (
                            <div
                                key={comment.id}
                                className={cn(
                                    "border rounded-lg p-4 transition-colors",
                                    isOwner && "bg-primary/5"
                                )}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <img
                                            src={author?.avatar_url || "/placeholder-user.jpg"}
                                            alt=""
                                            className="h-8 w-8 rounded-full"
                                        />
                                        <div>
                                            <p className="font-medium text-sm">{authorName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(comment.date).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    {isOwner && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(comment.id)}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                                <p className="mt-3 text-sm whitespace-pre-wrap">{comment.content}</p>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
