"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useApi } from "@/lib/api-context"
import { useRouter } from "next/navigation"

export default function AuthPage() {
  const { login, register } = useApi()
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
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
              <Input 
                placeholder="Email" 
                type="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
              <Input 
                placeholder="Password" 
                type="password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
              <Button
                className="w-full"
                disabled={isLoading}
                onClick={async () => {
                  setIsLoading(true)
                  try {
                    await login(email, password)
                    router.push("/feed")
                  } catch (error) {
                    // Error handled by API context
                  } finally {
                    setIsLoading(false)
                  }
                }}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </TabsContent>
            <TabsContent value="register" className="space-y-3">
              <Input 
                placeholder="Email" 
                type="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
              <Input 
                placeholder="Username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
              />
              <Input 
                placeholder="Password" 
                type="password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
              <Button
                className="w-full"
                disabled={isLoading}
                onClick={async () => {
                  setIsLoading(true)
                  try {
                    await register(email, username, password)
                    router.push("/feed")
                  } catch (error) {
                    // Error handled by API context
                  } finally {
                    setIsLoading(false)
                  }
                }}
              >
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  )
}
