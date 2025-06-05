"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StarRating } from "@/components/common/star-rating"
import { 
  TrophyIcon, 
  BookOpenIcon, 
  ListIcon, 
  TrendingUpIcon, 
  UsersIcon,
  UserPlusIcon,
  MapPinIcon,
  AwardIcon,
  ActivityIcon
} from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { followUser, unfollowUser, isFollowing } from "@/lib/api/profiles"
import { useToast } from "@/components/ui/use-toast"
import { formatTimeAgo } from "@/lib/utils"

interface MembersData {
  most_active_reviewers: any[]
  prolific_list_creators: any[]
  popular_this_week: any[]
  trending_courses: any[]
  trending_lists: any[]
}

export default function MembersLoungePage() {
  const { user: currentUser } = useUser()
  const { toast } = useToast()
  
  const [data, setData] = useState<MembersData>({
    most_active_reviewers: [],
    prolific_list_creators: [],
    popular_this_week: [],
    trending_courses: [],
    trending_lists: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({})
  const [followLoading, setFollowLoading] = useState<Record<string, boolean>>({})

  // Fetch members data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/members-lounge')
        if (!response.ok) throw new Error('Failed to fetch data')
        
        const membersData = await response.json()
        setData(membersData)

        // Check following status for all users
        if (currentUser) {
          const allUsers = [
            ...membersData.most_active_reviewers,
            ...membersData.prolific_list_creators,
            ...membersData.popular_this_week
          ]
          
          const followingStatus: Record<string, boolean> = {}
          await Promise.all(
            allUsers.map(async (user: any) => {
              if (user.user_id !== currentUser.id) {
                const following = await isFollowing(currentUser.id, user.user_id)
                followingStatus[user.user_id] = following
              }
            })
          )
          setFollowingStates(followingStatus)
        }
      } catch (err) {
        setError('Failed to load members data')
        console.error('Members Lounge error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [currentUser])

  // Handle follow/unfollow
  const handleFollowToggle = async (userId: string) => {
    if (!currentUser) return
    
    setFollowLoading(prev => ({ ...prev, [userId]: true }))
    
    try {
      const isCurrentlyFollowing = followingStates[userId]
      
      if (isCurrentlyFollowing) {
        await unfollowUser(currentUser.id, userId)
      } else {
        await followUser(currentUser.id, userId)
      }
      
      setFollowingStates(prev => ({
        ...prev,
        [userId]: !isCurrentlyFollowing
      }))
      
      toast({
        title: isCurrentlyFollowing ? "Unfollowed" : "Following",
        description: isCurrentlyFollowing ? "You are no longer following this user." : "You are now following this user.",
      })
    } catch (error) {
      console.error('Error toggling follow:', error)
      toast({
        title: "Error",
        description: "Failed to update follow status. Please try again.",
        variant: "destructive"
      })
    } finally {
      setFollowLoading(prev => ({ ...prev, [userId]: false }))
    }
  }

  // User card component for consistent styling
  const UserCard = ({ user, type }: { user: any, type: 'reviewer' | 'creator' | 'popular' }) => (
    <Card className="group hover:shadow-lg transition-all duration-200 border-0 shadow-sm">
      <CardContent className="p-6">
        {/* User Header */}
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="h-14 w-14 ring-2 ring-primary/10">
            <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.username} />
            <AvatarFallback className="bg-primary/5 text-primary font-medium">
              {user.username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-serif text-lg font-medium mb-1">
              <Link 
                href={`/user/${user.username}`} 
                className="hover:text-primary transition-colors"
              >
                {user.username}
              </Link>
            </h3>
            {type === 'reviewer' && (
              <p className="text-sm text-muted-foreground">
                {user.review_count} reviews • {user.courses_played} courses
              </p>
            )}
            {type === 'creator' && (
              <p className="text-sm text-muted-foreground">
                {user.list_count} lists • {user.total_courses} courses
              </p>
            )}
            {type === 'popular' && (
              <p className="text-sm text-muted-foreground">
                {user.weekly_activity} reviews this week
              </p>
            )}
          </div>
        </div>

        {/* Content based on type */}
        {type === 'reviewer' && user.recent_activity && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-foreground mb-3">Recent Reviews</h4>
            <div className="space-y-3">
              {user.recent_activity.slice(0, 2).map((activity: any) => (
                <div key={activity.course_id} className="bg-muted/30 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm line-clamp-1">
                      {activity.courses.name}
                    </span>
                    <StarRating rating={activity.rating} />
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <MapPinIcon className="h-3 w-3 mr-1" />
                    <span className="line-clamp-1">{activity.courses.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {type === 'creator' && user.recent_lists && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-foreground mb-3">Recent Lists</h4>
            <div className="space-y-2">
              {user.recent_lists.slice(0, 2).map((list: any) => (
                <div key={list.id} className="bg-muted/30 rounded-lg p-3">
                  <Link 
                    href={`/lists/${list.id}`}
                    className="font-medium text-sm text-primary hover:underline line-clamp-1"
                  >
                    {list.name}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTimeAgo(list.created_at)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {type === 'popular' && (
          <div className="mb-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center bg-muted/30 rounded-lg p-3">
                <div className="font-semibold text-primary text-lg">{user.total_reviews}</div>
                <div className="text-xs text-muted-foreground">Reviews</div>
              </div>
              <div className="text-center bg-muted/30 rounded-lg p-3">
                <div className="font-semibold text-primary text-lg">{user.total_lists}</div>
                <div className="text-xs text-muted-foreground">Lists</div>
              </div>
              <div className="text-center bg-muted/30 rounded-lg p-3">
                <div className="font-semibold text-primary text-lg">{user.followers}</div>
                <div className="text-xs text-muted-foreground">Followers</div>
              </div>
            </div>
          </div>
        )}

        {/* Follow Button */}
        {currentUser && currentUser.id !== user.user_id && (
          <Button
            variant={followingStates[user.user_id] ? "outline" : "default"}
            size="sm"
            className="w-full"
            disabled={followLoading[user.user_id]}
            onClick={() => handleFollowToggle(user.user_id)}
          >
            {followLoading[user.user_id] ? (
              "Loading..."
            ) : followingStates[user.user_id] ? (
              "Following"
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
  )

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="container py-8 md:py-12 flex-1 flex items-center justify-center">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading Members Lounge...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="container py-8 md:py-12 flex-1 flex items-center justify-center">
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - Clean and Elegant */}
      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Members Lounge</h1>
            <p className="text-xl text-muted-foreground mb-6">
              Discover and connect with our community's most active golfers
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <UsersIcon className="h-4 w-4 text-primary" />
                <span>Active Community</span>
              </div>
              <div className="flex items-center gap-2">
                <AwardIcon className="h-4 w-4 text-primary" />
                <span>Expert Reviews</span>
              </div>
              <div className="flex items-center gap-2">
                <ActivityIcon className="h-4 w-4 text-primary" />
                <span>Weekly Updates</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Most Active Reviewers */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <TrophyIcon className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Most Active Reviewers</h2>
            </div>
            <p className="text-muted-foreground">
              Members who've shared the most course insights in the last 30 days
            </p>
          </div>
          
          {data.most_active_reviewers.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.most_active_reviewers.map((user: any) => (
                <UserCard key={user.user_id} user={user} type="reviewer" />
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <TrophyIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No Active Reviewers Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to share your golf course experiences
                </p>
                <Button asChild>
                  <Link href="/courses">Start Reviewing</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Prolific List Creators */}
      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <ListIcon className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Prolific List Creators</h2>
            </div>
            <p className="text-muted-foreground">
              Curators building the best golf course collections
            </p>
          </div>
          
          {data.prolific_list_creators.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.prolific_list_creators.map((user: any) => (
                <UserCard key={user.user_id} user={user} type="creator" />
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <ListIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No List Creators Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create curated lists of your favorite golf courses
                </p>
                <Button asChild>
                  <Link href="/lists">Create Your First List</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Popular This Week */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUpIcon className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Trending This Week</h2>
            </div>
            <p className="text-muted-foreground">
              Members gaining recognition for their recent contributions
            </p>
          </div>
          
          {data.popular_this_week.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.popular_this_week.map((user: any) => (
                <UserCard key={user.user_id} user={user} type="popular" />
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <TrendingUpIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No Trending Members Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Share your golf experiences to join the trending members
                </p>
                <Button asChild>
                  <Link href="/profile">Update Your Profile</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Trending Courses This Week */}
      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <BookOpenIcon className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Trending Courses This Week</h2>
            </div>
            <p className="text-muted-foreground">
              Golf courses getting the most attention from our community
            </p>
          </div>
          
          {data.trending_courses.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.trending_courses.map((course: any) => (
                <Card key={course.id} className="overflow-hidden">
                  <div className="aspect-video relative">
                    <img src={course.image || "/placeholder.svg"} alt={course.name} className="object-cover w-full h-full" />
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-sm font-medium py-1 px-3 rounded-full">
                      🔥 {course.weeklyActivity} reviews
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium line-clamp-1">{course.name}</h3>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPinIcon className="h-3.5 w-3.5 mr-1" />
                            <span>{course.location}</span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <StarRating rating={course.rating} />
                          <span className="text-sm text-muted-foreground ml-1">({course.reviewCount})</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/courses/${course.id}`}>View Details</Link>
                        </Button>
                        <Button asChild size="sm" className="btn-navy">
                          <Link href={`/courses/${course.id}/log`}>Log Play</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <BookOpenIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No Trending Courses Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to review courses and start the conversation
                </p>
                <Button asChild>
                  <Link href="/courses">Explore Courses</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Trending Lists This Week */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <ListIcon className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Trending Lists This Week</h2>
            </div>
            <p className="text-muted-foreground">
              Fresh collections of golf courses curated by our community
            </p>
          </div>
          
          {data.trending_lists.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.trending_lists.map((list: any) => (
                <Card key={list.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-lg">{list.title}</h3>
                          <div className="flex items-center text-sm text-muted-foreground gap-2">
                            <div className="flex items-center">
                              <Avatar className="h-5 w-5 mr-1">
                                <AvatarImage src={list.author?.avatar || "/placeholder.svg"} alt={list.author?.name || "User"} />
                                <AvatarFallback>{(list.author?.name || "User").substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              {list.author?.name || "User"}
                            </div>
                            <span>•</span>
                            <div className="flex items-center">
                              <ListIcon className="h-3.5 w-3.5 mr-1" />
                              {list.courseCount} courses
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                            New
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{list.description}</p>
                      <div className="flex gap-2 pt-1">
                        {list.previewImages.map((image: string, index: number) => (
                          <div key={index} className="w-20 h-14 rounded overflow-hidden">
                            <img
                              src={image}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {list.courseCount > 3 && (
                          <div className="w-20 h-14 rounded bg-muted flex items-center justify-center text-muted-foreground">
                            +{list.courseCount - 3}
                          </div>
                        )}
                      </div>
                      <Button asChild variant="outline" className="w-full">
                        <Link href={`/lists/${list.id}`}>View List</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <ListIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No Trending Lists Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create and share your own curated golf course collections
                </p>
                <Button asChild>
                  <Link href="/lists/create">Create Your First List</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Join Our Golf Community
              </h2>
              <p className="text-primary-foreground/80 text-lg mb-6 max-w-2xl mx-auto">
                Connect with fellow golf enthusiasts, share your course experiences, 
                and discover your next favorite round.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" variant="secondary">
                  <Link href="/courses">Explore Courses</Link>
                </Button>
                <Button asChild size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                  <Link href="/profile">Complete Profile</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
} 