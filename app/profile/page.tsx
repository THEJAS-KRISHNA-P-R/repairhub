"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useApi } from "@/lib/api-context"
import { BadgeDisplay } from "@/components/custom/badge-display"
import { useToast } from "@/components/ui/use-toast"

export default function ProfilePage() {
  const { currentUser, updateProfile } = useApi()
  const { toast } = useToast()
  const [bio, setBio] = useState("")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (currentUser) {
      setBio(currentUser.bio || "")
      setEmail(currentUser.email || "")
    }
  }, [currentUser])

  if (!currentUser) {
    return (
      <main className="mx-auto max-w-3xl p-4">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Please sign in to view your profile.</CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-4">
      <section className="flex items-center gap-4">
        <img src={currentUser.avatarUrl || "/placeholder-user.jpg"} alt="" className="h-16 w-16 rounded-full" />
        <div>
          <h1 className="text-xl font-semibold">{currentUser.username}</h1>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Badges coming soon!</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Edit profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Bio</Label>
            <Textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>
          <Button 
            disabled={isLoading} 
            onClick={async () => {
              try {
                setIsLoading(true)
                await updateProfile({ email, bio })
              } catch (error: any) {
                toast({
                  title: "Failed to update profile",
                  description: error.response?.data?.error || "Please try again later",
                  variant: "destructive"
                })
              } finally {
                setIsLoading(false)
              }
            }}
          >
            {isLoading ? "Saving..." : "Save changes"}
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
