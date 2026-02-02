
'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const supabase = createClient()

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Redirect to a page where they can update their password
        // Usually this is /account/update-password or similar
        // For now we'll route to home, but you should handle the #access_token on your landing page or a dedicated reset page
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/callback?next=/account/reset-password`,
        })

        if (error) {
            toast.error(error.message)
        } else {
            setSuccess(true)
            toast.success('Check your email for the password reset link')
        }
        setLoading(false)
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight">Recover Password</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Enter your email to receive a password reset link
                    </p>
                </div>

                {success ? (
                    <div className="rounded-md bg-green-50 p-4 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                        Check your email for the reset link. You can close this tab.
                    </div>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleReset}>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Send Reset Link
                        </Button>
                    </form>
                )}

                <div className="text-center">
                    <Link href="/auth" className="text-sm font-medium hover:underline">
                        Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    )
}
