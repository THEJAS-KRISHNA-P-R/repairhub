"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { adminAPI, categoriesAPI, type RepairPost, type User, type Category } from "@/lib/api"
import { useApi } from "@/lib/api-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Users, FileText, BookOpen, MessageSquare, Trash2, Ban, Plus, Loader2, BarChart2 } from "lucide-react"
import { toast } from "sonner"
import { AnalyticsCharts } from "@/components/custom/analytics-charts"

export default function AdminDashboard() {
    const router = useRouter()
    const { currentUser, isInitialized } = useApi()

    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({ users: 0, posts: 0, guides: 0, comments: 0 })
    const [posts, setPosts] = useState<RepairPost[]>([])
    const [users, setUsers] = useState<User[]>([])
    const [categories, setCategories] = useState<Category[]>([])

    // New category form
    const [newCatName, setNewCatName] = useState("")
    const [newCatIcon, setNewCatIcon] = useState("")
    const [catDialogOpen, setCatDialogOpen] = useState(false)
    const [addingCat, setAddingCat] = useState(false)

    // Post detail dialog
    const [selectedPost, setSelectedPost] = useState<RepairPost | null>(null)
    const [postDialogOpen, setPostDialogOpen] = useState(false)

    useEffect(() => {
        if (!isInitialized) return

        const checkAdminAndLoad = async () => {
            try {
                const adminStatus = await adminAPI.isAdmin()
                setIsAdmin(adminStatus)

                if (!adminStatus) {
                    router.push('/')
                    return
                }

                // Load admin data
                const [statsData, postsData, usersData, categoriesData] = await Promise.all([
                    adminAPI.getStats(),
                    adminAPI.getAllPosts(),
                    adminAPI.getAllUsers(),
                    categoriesAPI.getAll(),
                ])

                setStats(statsData)
                setPosts(postsData)
                setUsers(usersData)
                setCategories(categoriesData)
            } catch (error) {
                console.error("Admin check failed:", error)
                router.push('/')
            } finally {
                setLoading(false)
            }
        }

        checkAdminAndLoad()
    }, [isInitialized, router])

    const handleDeletePost = async (postId: string) => {
        try {
            await adminAPI.deletePost(postId)
            setPosts(prev => prev.filter(p => p.id !== postId))
            setStats(prev => ({ ...prev, posts: prev.posts - 1 }))
            toast.success("Post deleted")
        } catch (error) {
            toast.error("Failed to delete post")
        }
    }

    const handleToggleBan = async (userId: string, currentStatus: boolean) => {
        try {
            await adminAPI.toggleBan(userId, !currentStatus)
            setUsers(prev => prev.map(u =>
                u.id === userId ? { ...u, is_banned: !currentStatus } : u
            ))
            toast.success(`User ${!currentStatus ? 'banned' : 'unbanned'}`)
        } catch (error) {
            toast.error("Failed to update user")
        }
    }

    const handleAddCategory = async () => {
        if (!newCatName.trim()) {
            toast.error("Category name is required")
            return
        }

        setAddingCat(true)
        try {
            const newCat = await categoriesAPI.create({
                name: newCatName.trim(),
                icon: newCatIcon.trim() || undefined
            })
            setCategories(prev => [...prev, newCat])
            setNewCatName("")
            setNewCatIcon("")
            setCatDialogOpen(false)
            toast.success("Category created")
        } catch (error) {
            toast.error("Failed to create category")
        } finally {
            setAddingCat(false)
        }
    }

    const handleDeleteCategory = async (catId: string) => {
        try {
            await categoriesAPI.delete(catId)
            setCategories(prev => prev.filter(c => c.id !== catId))
            toast.success("Category deleted")
        } catch (error) {
            toast.error("Failed to delete category")
        }
    }

    // Prepare analytics data
    const analyticsData = useMemo(() => {
        // Group by date
        const dateMap = new Map<string, number>()
        posts.forEach(post => {
            const date = new Date(post.date).toISOString().split('T')[0]
            dateMap.set(date, (dateMap.get(date) || 0) + 1)
        })

        // Fill last 14 days
        const last14Days = Array.from({ length: 14 }, (_, i) => {
            const d = new Date()
            d.setDate(d.getDate() - i)
            return d.toISOString().split('T')[0]
        }).reverse()

        const postsByDate = last14Days.map(date => ({
            date,
            count: dateMap.get(date) || 0
        }))

        // Group by category
        const categoryMap = new Map<string, number>()
        posts.forEach(post => {
            const catName = post.category?.name || 'Uncategorized'
            categoryMap.set(catName, (categoryMap.get(catName) || 0) + 1)
        })

        const postsByCategory = Array.from(categoryMap.entries()).map(([name, count]) => ({
            name,
            count
        }))

        return { postsByDate, postsByCategory }
    }, [posts])

    if (loading || !isInitialized) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!isAdmin) {
        return null
    }

    return (
        <main className="mx-auto max-w-6xl p-4 md:p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground">Manage content, users, and categories.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.users}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Repair Posts</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.posts}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Guides</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.guides}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Comments</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.comments}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs for different sections */}
            <Tabs defaultValue="posts" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="posts">Posts</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="categories">Categories</TabsTrigger>
                </TabsList>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-4">
                    <AnalyticsCharts
                        postsByDate={analyticsData.postsByDate}
                        postsByCategory={analyticsData.postsByCategory}
                    />
                </TabsContent>

                {/* Posts Tab */}
                <TabsContent value="posts" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Repair Posts</CardTitle>
                            <CardDescription>Manage all repair posts. Click a row to view details.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item</TableHead>
                                        <TableHead>Author</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {posts.map((post) => (
                                        <TableRow
                                            key={post.id}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => {
                                                setSelectedPost(post)
                                                setPostDialogOpen(true)
                                            }}
                                        >
                                            <TableCell className="font-medium">{post.item_name}</TableCell>
                                            <TableCell>{post.profiles?.username || 'Unknown'}</TableCell>
                                            <TableCell>
                                                {post.category ? (
                                                    <Badge variant="outline">
                                                        {post.category.icon} {post.category.name}
                                                    </Badge>
                                                ) : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={post.success ? "default" : "secondary"}>
                                                    {post.success ? "Success" : "Failure"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{new Date(post.date).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete post?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This will permanently delete "{post.item_name}" and all its comments.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDeletePost(post.id)}
                                                                className="bg-destructive text-destructive-foreground"
                                                            >
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Post Detail Dialog */}
                    <Dialog open={postDialogOpen} onOpenChange={setPostDialogOpen}>
                        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                            {selectedPost && (
                                <>
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2">
                                            {selectedPost.item_name}
                                            <Badge variant={selectedPost.success ? "default" : "secondary"}>
                                                {selectedPost.success ? "Success" : "Failure"}
                                            </Badge>
                                        </DialogTitle>
                                        <DialogDescription className="flex items-center gap-2">
                                            by {selectedPost.profiles?.username || 'Unknown'} · {new Date(selectedPost.date).toLocaleDateString()}
                                            {selectedPost.category && (
                                                <Badge variant="outline">
                                                    {selectedPost.category.icon} {selectedPost.category.name}
                                                </Badge>
                                            )}
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-4 py-4">
                                        {/* Images */}
                                        {selectedPost.images && selectedPost.images.length > 0 && (
                                            <div>
                                                <Label className="text-sm font-medium">Images</Label>
                                                <div className="mt-2 grid grid-cols-3 gap-2">
                                                    {selectedPost.images.map((img, idx) => (
                                                        <img
                                                            key={idx}
                                                            src={img}
                                                            alt={`Image ${idx + 1}`}
                                                            className="rounded border h-24 w-full object-cover"
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Issue Description */}
                                        <div>
                                            <Label className="text-sm font-medium">Issue Description</Label>
                                            <p className="mt-1 text-sm text-muted-foreground bg-muted p-3 rounded">
                                                {selectedPost.issue_description || "No description provided"}
                                            </p>
                                        </div>

                                        {/* Repair Steps */}
                                        <div>
                                            <Label className="text-sm font-medium">Repair Steps</Label>
                                            <p className="mt-1 text-sm text-muted-foreground bg-muted p-3 rounded whitespace-pre-wrap">
                                                {selectedPost.repair_steps || "No steps provided"}
                                            </p>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex gap-4 text-sm text-muted-foreground">
                                            <span>👍 {selectedPost.vote_count || 0} votes</span>
                                        </div>
                                    </div>

                                    <DialogFooter className="flex gap-2">
                                        <Button variant="outline" asChild>
                                            <Link href={`/repairs/${selectedPost.id}`} onClick={() => setPostDialogOpen(false)}>
                                                View Full Page
                                            </Link>
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive">
                                                    <Trash2 className="h-4 w-4 mr-1" /> Delete Post
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will permanently delete "{selectedPost.item_name}" and all its comments.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => {
                                                            handleDeletePost(selectedPost.id)
                                                            setPostDialogOpen(false)
                                                        }}
                                                        className="bg-destructive text-destructive-foreground"
                                                    >
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </DialogFooter>
                                </>
                            )}
                        </DialogContent>
                    </Dialog>
                </TabsContent>

                {/* Users Tab */}
                <TabsContent value="users" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Users</CardTitle>
                            <CardDescription>Manage users. Ban users to prevent them from uploading content.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Username</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <img
                                                        src={user.avatar_url || "/placeholder-user.jpg"}
                                                        alt=""
                                                        className="h-6 w-6 rounded-full"
                                                    />
                                                    {user.username}
                                                </div>
                                            </TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <Badge variant={user.is_admin ? "default" : "secondary"}>
                                                    {user.is_admin ? "Admin" : "User"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {user.is_banned ? (
                                                    <Badge variant="destructive">Banned</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-green-600 border-green-600">Active</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {user.id !== currentUser?.id && !user.is_admin && (
                                                    <Button
                                                        variant={user.is_banned ? "outline" : "ghost"}
                                                        size="sm"
                                                        onClick={() => handleToggleBan(user.id, user.is_banned || false)}
                                                        className={user.is_banned ? "text-green-600" : "text-destructive"}
                                                    >
                                                        <Ban className="h-4 w-4 mr-1" />
                                                        {user.is_banned ? "Unban" : "Ban"}
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Categories Tab */}
                <TabsContent value="categories" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Categories</CardTitle>
                                <CardDescription>Manage repair categories.</CardDescription>
                            </div>
                            <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm">
                                        <Plus className="h-4 w-4 mr-1" /> Add Category
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add Category</DialogTitle>
                                        <DialogDescription>Create a new category for repair posts.</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label>Name</Label>
                                            <Input
                                                placeholder="e.g. Smartphones"
                                                value={newCatName}
                                                onChange={(e) => setNewCatName(e.target.value)}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Icon (emoji)</Label>
                                            <Input
                                                placeholder="e.g. 📱"
                                                value={newCatIcon}
                                                onChange={(e) => setNewCatIcon(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleAddCategory} disabled={addingCat}>
                                            {addingCat && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                                            Create
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Icon</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {categories.map((cat) => (
                                        <TableRow key={cat.id}>
                                            <TableCell className="text-xl">{cat.icon || '-'}</TableCell>
                                            <TableCell className="font-medium">{cat.name}</TableCell>
                                            <TableCell className="text-right">
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete category?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This will remove "{cat.name}" from all posts.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDeleteCategory(cat.id)}
                                                                className="bg-destructive text-destructive-foreground"
                                                            >
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </main>
    )
}
