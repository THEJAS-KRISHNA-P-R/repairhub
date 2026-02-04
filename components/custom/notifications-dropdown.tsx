"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { notificationsAPI, type Notification } from "@/lib/api"
import { useApi } from "@/lib/api-context"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Bell, ThumbsUp, MessageSquare, UserPlus, Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function NotificationsDropdown() {
    const { currentUser } = useApi()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        if (currentUser) {
            notificationsAPI.getUnreadCount().then(setUnreadCount)
        }
    }, [currentUser])

    const loadNotifications = async () => {
        if (!currentUser) return
        setLoading(true)
        try {
            const data = await notificationsAPI.getAll()
            setNotifications(data)
        } catch (error) {
            console.error("Failed to load notifications:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleOpen = (isOpen: boolean) => {
        setOpen(isOpen)
        if (isOpen) {
            loadNotifications()
        }
    }

    const handleMarkAllRead = async () => {
        try {
            await notificationsAPI.markAllAsRead()
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
            setUnreadCount(0)
        } catch (error) {
            console.error("Failed to mark as read:", error)
        }
    }

    const handleMarkRead = async (id: string) => {
        try {
            await notificationsAPI.markAsRead(id)
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (error) {
            console.error("Failed to mark as read:", error)
        }
    }

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'upvote': return <ThumbsUp className="h-4 w-4 text-green-500" />
            case 'comment': return <MessageSquare className="h-4 w-4 text-blue-500" />
            case 'reply': return <MessageSquare className="h-4 w-4 text-purple-500" />
            case 'follow': return <UserPlus className="h-4 w-4 text-orange-500" />
            default: return <Bell className="h-4 w-4" />
        }
    }

    if (!currentUser) return null

    return (
        <DropdownMenu open={open} onOpenChange={handleOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between px-3 py-2">
                    <span className="font-semibold">Notifications</span>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="text-xs h-auto py-1">
                            <Check className="h-3 w-3 mr-1" />
                            Mark all read
                        </Button>
                    )}
                </div>
                <DropdownMenuSeparator />

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                        No notifications yet
                    </div>
                ) : (
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                asChild
                                className={cn(
                                    "flex items-start gap-3 p-3 cursor-pointer",
                                    !notification.is_read && "bg-primary/5"
                                )}
                            >
                                <Link
                                    href={notification.link || '#'}
                                    onClick={() => !notification.is_read && handleMarkRead(notification.id)}
                                >
                                    <div className="flex-shrink-0 mt-0.5">
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium">{notification.title}</p>
                                        {notification.message && (
                                            <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {new Date(notification.created_at).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    {!notification.is_read && (
                                        <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                                    )}
                                </Link>
                            </DropdownMenuItem>
                        ))}
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
