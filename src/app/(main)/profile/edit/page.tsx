"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@/contexts/user-context"
import { getProfileById, checkUsernameAvailability } from "@/lib/api/profiles"
import { supabase } from "@/lib/supabase/client"

export default function EditProfilePage() {
  const { user, isLoading: isUserLoading } = useUser()
  const router = useRouter()
  const { toast } = useToast()
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [originalUsername, setOriginalUsername] = useState("")
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    location: "",
    bio: "",
    avatar_url: ""
  })
  
  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return
      
      try {
        setIsLoading(true)
        const profile = await getProfileById(user.id)
        
        setFormData({
          username: profile.username || "",
          full_name: profile.full_name || "",
          location: profile.location || "",
          bio: profile.bio || "",
          avatar_url: profile.avatar_url || ""
        })
        
        setOriginalUsername(profile.username || "")
      } catch (error) {
        console.error("Error fetching profile:", error)
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    if (user) {
      fetchProfile()
    } else if (!isUserLoading) {
      // If we're not loading and there's no user, redirect to login
      router.push("/login")
    }
  }, [user, isUserLoading, toast, router])
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    // Clear username error when username field is changed
    if (name === "username" && usernameError) {
      setUsernameError(null)
    }
    
    setFormData((prev) => ({ ...prev, [name]: value }))
  }
  
  // Check username availability
  const checkUsername = async (username: string) => {
    // If username is unchanged, no need to check
    if (username === originalUsername) {
      return true
    }
    
    if (!username || username.length < 3) {
      setUsernameError("Username must be at least 3 characters")
      return false
    }
    
    try {
      const isAvailable = await checkUsernameAvailability(username)
      
      if (!isAvailable) {
        setUsernameError("This username is already taken")
        return false
      }
      
      return true
    } catch (error) {
      console.error("Error checking username:", error)
      setUsernameError("Could not check username availability")
      return false
    }
  }
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to update your profile",
        variant: "destructive",
      })
      return
    }
    
    // Validate username
    if (!formData.username) {
      setUsernameError("Username is required")
      return
    }
    
    if (formData.username.length < 3) {
      setUsernameError("Username must be at least 3 characters")
      return
    }
    
    // Check username availability if it's changed
    if (formData.username !== originalUsername) {
      const isAvailable = await checkUsername(formData.username)
      if (!isAvailable) return
    }
    
    setIsSaving(true)
    
    try {
      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          full_name: formData.full_name,
          location: formData.location,
          bio: formData.bio,
          avatar_url: formData.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
      
      if (error) throw error
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })
      
      // Redirect to profile page
      router.push(`/user/${formData.username}`)
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }
  
  // Show loading while user data is being fetched
  if (isUserLoading || isLoading) {
    return (
      <div className="container py-8 md:py-12 flex justify-center items-center min-h-[60vh]">
        <p>Loading profile...</p>
      </div>
    )
  }
  
  return (
    <div className="container py-8 md:py-12">
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/3 flex flex-col items-center">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage src={formData.avatar_url || "/placeholder.svg"} alt={formData.full_name || formData.username} />
                  <AvatarFallback>
                    {formData.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2 w-full">
                  <Label htmlFor="avatar_url">Avatar URL</Label>
                  <Input
                    id="avatar_url"
                    name="avatar_url"
                    placeholder="https://example.com/avatar.jpg"
                    value={formData.avatar_url}
                    onChange={handleChange}
                    disabled={isSaving}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a URL for your profile picture
                  </p>
                </div>
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    placeholder="johndoe"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={isSaving}
                    required
                  />
                  {usernameError && (
                    <p className="text-sm text-red-500">{usernameError}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    This is your public username that others will see
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    placeholder="John Doe"
                    value={formData.full_name}
                    onChange={handleChange}
                    disabled={isSaving}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="Cape Town, Western Cape"
                    value={formData.location}
                    onChange={handleChange}
                    disabled={isSaving}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    placeholder="Tell us about yourself and your golf journey..."
                    value={formData.bio}
                    onChange={handleChange}
                    disabled={isSaving}
                    rows={4}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving || !!usernameError}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 