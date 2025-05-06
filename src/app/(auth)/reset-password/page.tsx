"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ClubIcon as GolfIcon } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { updatePasswordWithToken } from "@/lib/api/auth"

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isResetComplete, setIsResetComplete] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  // Check for token in URL (this is automatically added by Supabase)
  useEffect(() => {
    const type = searchParams?.get('type')
    const token = searchParams?.get('token')
    
    // Only show error if we've tried to load parameters and they're not valid
    if (searchParams && (!type || !token)) {
      setError("Invalid password reset link. Please request a new one.")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    
    // Validate passwords
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }
    
    setIsLoading(true)

    try {
      await updatePasswordWithToken(password)
      
      setIsResetComplete(true)
      toast({
        title: "Success",
        description: "Your password has been reset successfully.",
      })
    } catch (error: any) {
      console.error("Password reset error:", error)
      setError(error?.message || "Failed to reset password. Please try again.")
      toast({
        title: "Error",
        description: error?.message || "Failed to reset password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <div className="flex justify-center">
            <GolfIcon className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Reset password</h1>
          <p className="text-sm text-muted-foreground">
            Enter your new password
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isResetComplete ? (
          <div className="rounded-lg border bg-card text-card-foreground p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-2">Password reset complete</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your password has been reset successfully. You can now log in with your new password.
            </p>
            <Button asChild className="w-full">
              <Link href="/login">Go to Login</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    autoCapitalize="none"
                    autoComplete="new-password"
                    disabled={isLoading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    autoCapitalize="none"
                    autoComplete="new-password"
                    disabled={isLoading}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </div>
            </form>
            <p className="px-8 text-center text-sm text-muted-foreground">
              <Link href="/login" className="hover:text-brand underline underline-offset-4">
                Back to login
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 