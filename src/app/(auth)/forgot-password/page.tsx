"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ClubIcon as GolfIcon } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { sendResetPasswordEmail } from "@/lib/api/auth"

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await sendResetPasswordEmail(email)
      
      setIsSubmitted(true)
      toast({
        title: "Success",
        description: "Password reset instructions have been sent to your email.",
      })
    } catch (error: any) {
      console.error("Password reset error:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to send reset email. Please try again.",
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
          <h1 className="text-2xl font-bold">Forgot password</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        {isSubmitted ? (
          <div className="rounded-lg border bg-card text-card-foreground p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-2">Check your email</h3>
            <p className="text-sm text-muted-foreground mb-4">
              We've sent a password reset link to {email}. Please check your inbox.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              If you don't see it, check your spam folder.
            </p>
            <Button asChild className="w-full">
              <Link href="/login">Back to Login</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="name@example.com"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={isLoading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Reset Link"}
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