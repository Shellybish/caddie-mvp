"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useUser } from "@/contexts/user-context"
import { supabase } from "@/lib/supabase/client"
import { getProfileById } from "@/lib/api/profiles"

export default function DebugProfilePage() {
  const { user, isLoading } = useUser()
  const [profileData, setProfileData] = useState<any>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [repairStatus, setRepairStatus] = useState<string | null>(null)

  const checkProfile = async () => {
    if (!user) {
      setProfileError("You must be logged in to check your profile")
      return
    }

    setIsChecking(true)
    setProfileError(null)
    setProfileData(null)

    try {
      // Check if user exists in auth.users
      const { data: authData, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        setProfileError(`Auth error: ${authError.message}`)
        return
      }
      
      if (!authData.user) {
        setProfileError("No authenticated user found")
        return
      }
      
      // Check if profile exists in profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // Profile doesn't exist
          setProfileError("Profile not found in database. Try repairing.")
        } else {
          setProfileError(`Profile error: ${profileError.message}`)
        }
      } else if (!profileData) {
        setProfileError("Profile query returned no data")
      } else {
        setProfileData(profileData)
      }
    } catch (error: any) {
      setProfileError(`Error: ${error.message}`)
    } finally {
      setIsChecking(false)
    }
  }

  const repairProfile = async () => {
    if (!user) {
      setProfileError("You must be logged in to repair your profile")
      return
    }

    setIsChecking(true)
    setRepairStatus("Attempting to repair profile...")

    try {
      // Generate a unique username with timestamp
      const timestamp = new Date().getTime().toString().slice(-6)
      const username = user.email?.split('@')[0] || `user_${user.id.substring(0, 6)}_${timestamp}`
      
      // Create profile data
      const profileData = {
        id: user.id,
        user_id: user.id,
        username,
        full_name: user.name,
        email: user.email,
        created_at: new Date().toISOString()
      }
      
      // Check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()
      
      if (existingProfile) {
        // Update existing profile
        setRepairStatus("Updating existing profile...")
        const { data, error } = await supabase
          .from('profiles')
          .update({ 
            username,
            updated_at: new Date().toISOString() 
          })
          .eq('user_id', user.id)
          .select()
          .single()
        
        if (error) {
          setRepairStatus(`Failed to update profile: ${error.message}`)
        } else {
          setProfileData(data)
          setRepairStatus("Profile updated successfully!")
        }
      } else {
        // Insert new profile
        setRepairStatus("Creating new profile...")
        const { data, error } = await supabase
          .from('profiles')
          .insert(profileData)
          .select()
          .single()
        
        if (error) {
          setRepairStatus(`Failed to create profile: ${error.message}`)
        } else {
          setProfileData(data)
          setRepairStatus("Profile created successfully!")
        }
      }
    } catch (error: any) {
      setRepairStatus(`Error during repair: ${error.message}`)
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Profile Diagnostics</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Current User Status</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading user...</p>
          ) : user ? (
            <div>
              <p><strong>Auth Status:</strong> Logged in</p>
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
            </div>
          ) : (
            <p>Not logged in. Please log in to check your profile.</p>
          )}
        </CardContent>
      </Card>
      
      <div className="flex flex-wrap gap-4 mb-6">
        <Button 
          onClick={checkProfile} 
          disabled={!user || isChecking}>
          {isChecking ? 'Checking...' : 'Check Profile in Database'}
        </Button>
        
        <Button 
          onClick={repairProfile} 
          variant="destructive" 
          disabled={!user || isChecking}>
          Repair Profile
        </Button>
      </div>
      
      {profileError && (
        <Card className="mb-6 border-red-500">
          <CardHeader>
            <CardTitle className="text-red-500">Profile Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{profileError}</p>
          </CardContent>
        </Card>
      )}
      
      {repairStatus && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Repair Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{repairStatus}</p>
          </CardContent>
        </Card>
      )}
      
      {profileData && (
        <Card>
          <CardHeader>
            <CardTitle>Profile Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(profileData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 