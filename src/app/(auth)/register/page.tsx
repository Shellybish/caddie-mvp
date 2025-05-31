"use client"

import type { ChangeEvent, FormEvent } from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ClubIcon as GolfIcon } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@/contexts/user-context"

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    location: "",
  })
  const { toast } = useToast()
  const { register } = useUser()
  const router = useRouter()

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await register(formData.name, formData.email, formData.password, formData.location)

      toast({
        title: "Account created",
        description: "Your account has been created successfully.",
      })

      // Redirect to onboarding
      router.push("/onboarding")
    } catch (error: any) {
      console.error("Registration error:", error)
      toast({
        title: "Registration failed",
        description: error.message || "There was a problem creating your account. Please try again.",
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
          <h1 className="text-2xl font-bold">Create an account</h1>
          <p className="text-sm text-muted-foreground">Enter your details to create your Caddie account</p>
        </div>
        <div className="grid gap-6">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Smith"
                  type="text"
                  autoCapitalize="words"
                  autoComplete="name"
                  autoCorrect="off"
                  disabled={isLoading}
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
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
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoCapitalize="none"
                  autoComplete="new-password"
                  disabled={isLoading}
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location (City/Province)</Label>
                <Input
                  id="location"
                  placeholder="Johannesburg, Gauteng"
                  type="text"
                  disabled={isLoading}
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>
              <Button disabled={isLoading}>{isLoading ? "Creating account..." : "Create Account"}</Button>
            </div>
          </form>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" disabled={isLoading}>
              Google
            </Button>
            <Button variant="outline" disabled={isLoading}>
              Facebook
            </Button>
          </div>
        </div>
        <p className="px-8 text-center text-sm text-muted-foreground">
          <Link href="/login" className="hover:text-brand underline underline-offset-4">
            Already have an account? Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
