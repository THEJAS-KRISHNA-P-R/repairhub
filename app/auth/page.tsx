"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMock } from "@/lib/mock-data"
import { useRouter } from "next/navigation"

export default function AuthPage() {
  const { login, register } = useMock()
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const router = useRouter()

  return (
    <main className="mx-auto max-w-md p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-balance text-center">Welcome to Digital Repair Hub</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign in</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="space-y-3">
              <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Button
                className="w-full"
                onClick={async () => {
                  await login(email, username || undefined)
                  router.push("/feed")
                }}
              >
                Sign in
              </Button>
            </TabsContent>
            <TabsContent value="register" className="space-y-3">
              <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
              <Button
                className="w-full"
                onClick={async () => {
                  await register(email, username)
                  router.push("/feed")
                }}
              >
                Create account
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  )
}
