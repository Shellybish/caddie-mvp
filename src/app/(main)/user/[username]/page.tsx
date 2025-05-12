"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StarRating } from "@/components/common/star-rating"
import { useToast } from "@/components/ui/use-toast"
import {
  CalendarIcon,
  ClubIcon as GolfIcon,
  ListIcon,
  MapPinIcon,
  ThumbsUpIcon,
  UserIcon,
  UserCheckIcon,
  UserPlusIcon,
} from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { 
  getProfileByUsername, 
  getUserStats, 
  getFollowers, 
  getFollowing, 
  followUser, 
  unfollowUser, 
  isFollowing,
  type Profile 
} from "@/lib/api/profiles"

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user: currentUser } = useUser()
  const { toast } = useToast()
  
  const username = params.username as string
  
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState({
    coursesPlayed: 0,
    reviews: 0,
    lists: 0,
    followers: 0,
    following: 0
  })
  const [isCurrentUserFollowing, setIsCurrentUserFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isFollowLoading, setIsFollowLoading] = useState(false)
  
  // Mock data - would be replaced with actual API calls for recent plays, reviews, lists, etc.
  const recentPlays = []
  const reviews = []
  const lists = []
  const followingUsers = []
  
  // Fetch the user profile by username
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true)
        
        // Fetch profile by username
        const userProfile = await getProfileByUsername(username)
        setProfile(userProfile)
        
        // Fetch user stats
        const userStats = await getUserStats(userProfile.user_id)
        setStats(userStats)
        
        // Check if the current user is following this profile
        if (currentUser?.id && userProfile.user_id) {
          const following = await isFollowing(currentUser.id, userProfile.user_id)
          setIsCurrentUserFollowing(following)
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
        toast({
          title: "Error",
          description: "Could not load this user profile. The username may not exist.",
          variant: "destructive",
        })
        // Redirect back to main page if profile doesn't exist
        router.push('/')
      } finally {
        setIsLoading(false)
      }
    }
    
    if (username) {
      fetchProfile()
    }
  }, [username, currentUser?.id, toast, router])
  
  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!currentUser?.id || !profile?.user_id || currentUser.id === profile.user_id) {
      return
    }
    
    setIsFollowLoading(true)
    
    try {
      if (isCurrentUserFollowing) {
        // Unfollow
        await unfollowUser(currentUser.id, profile.user_id)
        setIsCurrentUserFollowing(false)
        setStats(prev => ({ ...prev, followers: Math.max(0, prev.followers - 1) }))
        toast({
          title: "Unfollowed",
          description: `You have unfollowed @${profile.username}.`,
        })
      } else {
        // Follow
        await followUser(currentUser.id, profile.user_id)
        setIsCurrentUserFollowing(true)
        setStats(prev => ({ ...prev, followers: prev.followers + 1 }))
        toast({
          title: "Following",
          description: `You are now following @${profile.username}.`,
        })
      }
    } catch (error) {
      console.error("Error toggling follow:", error)
      toast({
        title: "Error",
        description: "There was a problem updating your follow status.",
        variant: "destructive",
      })
    } finally {
      setIsFollowLoading(false)
    }
  }
  
  if (isLoading) {
    return (
      <div className="container py-8 md:py-12 flex justify-center items-center min-h-[60vh]">
        <p>Loading profile...</p>
      </div>
    )
  }
  
  if (!profile) {
    return (
      <div className="container py-8 md:py-12 flex flex-col justify-center items-center min-h-[60vh]">
        <h1 className="text-2xl font-bold mb-4">User not found</h1>
        <p className="mb-6">The username @{username} doesn't exist.</p>
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    )
  }
  
  const isOwnProfile = currentUser?.id === profile.user_id
  
  return (
    <div className="container py-8 md:py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full lg:w-[300px] space-y-6">
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.username} />
                <AvatarFallback>
                  {profile.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h1 className="text-xl font-bold">{profile.full_name || profile.username}</h1>
              <p className="text-sm text-muted-foreground mb-2">@{profile.username}</p>
              {profile.location && (
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <MapPinIcon className="h-3.5 w-3.5 mr-1" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.bio && <p className="text-sm mb-4">{profile.bio}</p>}
              
              {isOwnProfile ? (
                <Button asChild variant="outline" className="w-full">
                  <Link href="/profile/edit">Edit Profile</Link>
                </Button>
              ) : (
                <Button 
                  onClick={handleFollowToggle} 
                  variant={isCurrentUserFollowing ? "outline" : "default"}
                  className="w-full"
                  disabled={isFollowLoading || !currentUser}
                >
                  {isCurrentUserFollowing ? (
                    <>
                      <UserCheckIcon className="h-4 w-4 mr-2" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlusIcon className="h-4 w-4 mr-2" />
                      Follow
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h2 className="font-medium mb-3">Stats</h2>
              <div className="grid grid-cols-2 gap-y-4">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mb-1">
                    <GolfIcon className="h-5 w-5" />
                  </div>
                  <p className="font-medium">{stats.coursesPlayed}</p>
                  <p className="text-xs text-muted-foreground">Courses Played</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mb-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-message-square-text"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      <path d="M13 8H7" />
                      <path d="M17 12H7" />
                    </svg>
                  </div>
                  <p className="font-medium">{stats.reviews}</p>
                  <p className="text-xs text-muted-foreground">Reviews</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mb-1">
                    <ListIcon className="h-5 w-5" />
                  </div>
                  <p className="font-medium">{stats.following}</p>
                  <p className="text-xs text-muted-foreground">Following</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mb-1">
                    <UserIcon className="h-5 w-5" />
                  </div>
                  <p className="font-medium">{stats.followers}</p>
                  <p className="text-xs text-muted-foreground">Followers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Tabs defaultValue="plays">
            <TabsList className="mb-6">
              <TabsTrigger value="plays">Plays</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="lists">Lists</TabsTrigger>
              <TabsTrigger value="following">Following</TabsTrigger>
            </TabsList>

            <TabsContent value="plays" className="space-y-6">
              <h2 className="text-xl font-bold">Recent Plays</h2>
              
              {recentPlays.length > 0 ? (
                <div className="space-y-4">
                  {/* Show recent plays here */}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No recent plays to show.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              <h2 className="text-xl font-bold">Reviews</h2>
              
              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {/* Show reviews here */}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No reviews to show.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="lists" className="space-y-6">
              <h2 className="text-xl font-bold">Lists</h2>
              
              {lists.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Show lists here */}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No lists to show.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="following" className="space-y-6">
              <h2 className="text-xl font-bold mb-4">Following</h2>
              
              {followingUsers.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Show following users here */}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Not following anyone yet.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
} 