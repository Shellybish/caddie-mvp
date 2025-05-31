"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StarRating } from "@/components/common/star-rating"
import {
  CalendarIcon,
  ClubIcon as GolfIcon,
  ListIcon,
  MapPinIcon,
  PencilIcon,
  Settings2Icon,
  ThumbsUpIcon,
  UserIcon,
  BookmarkIcon,
  BarChart2Icon,
  GripVertical,
  X,
} from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { getProfileById, getUserStats, getFavoriteCourses, getBucketListCourses, updateFavoriteCoursePositions, getListsByUserId, getListById, removeFavoriteCourse, removeBucketListCourse } from "@/lib/api/profiles"
import { getUserReviews } from "@/lib/api/courses"
import { BucketListSearchModal } from "@/components/courses/bucket-list-search-modal"
import { FavoriteCourseSelectionModal } from "@/components/courses/favorite-course-selector-modal"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core"
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, rectSwappingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useToast } from "@/components/ui/use-toast"

// Define types for the reviews
interface UserReview {
  id: string;
  course_id: string;
  rating: number;
  review_text?: string;
  date_played: string;
  created_at: string;
  likes_count: number;
  course: {
    id: string;
    name: string;
    location: string;
    province: string;
  } | null;
}

// Define a SortableFavoriteCourse component
interface SortableFavoriteCourseProps {
  favorite: any;
  onRemove: (courseId: string) => void;
}

function SortableFavoriteCourse({ favorite, onRemove }: SortableFavoriteCourseProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: favorite.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(favorite.course_id);
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={`overflow-hidden group ${isDragging ? 'ring-2 ring-primary shadow-lg' : ''}`}
    >
      <CardContent className="p-0">
        <div className="h-32 bg-muted relative">
          <img 
            src="/placeholder.svg?height=200&width=300" 
            alt={favorite.courses?.name || "Golf Course"} 
            className="w-full h-full object-cover" 
          />
          <div 
            {...attributes} 
            {...listeners}
            className="absolute top-2 right-2 bg-black/30 text-white p-1 rounded-md cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <GripVertical className="h-4 w-4" />
          </div>
          <button
            onClick={handleRemove}
            className="absolute top-2 left-2 bg-black/50 text-white p-1 rounded-md cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4">
          <h3 className="font-medium truncate">
            <Link href={`/courses/${favorite.course_id}`} className="hover:underline">
              {favorite.courses?.name || "Unknown Course"}
            </Link>
          </h3>
          <p className="text-sm text-muted-foreground">
            {favorite.courses?.location || "Unknown Location"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProfilePage() {
  const { user, isLoading: isUserLoading } = useUser()
  const router = useRouter()
  const { toast } = useToast()
  
  const [stats, setStats] = useState({
    coursesPlayed: 0,
    reviews: 0,
    lists: 0,
    followers: 0,
    following: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [userReviews, setUserReviews] = useState<UserReview[]>([])
  const [recentPlays, setRecentPlays] = useState<UserReview[]>([])
  const [favoriteCourses, setFavoriteCourses] = useState<any[]>([])
  const [bucketListCourses, setBucketListCourses] = useState<any[]>([])
  const [userLists, setUserLists] = useState<any[]>([])
  const [ratingDistribution, setRatingDistribution] = useState<number[]>([0, 0, 0, 0, 0])
  const [isBucketListModalOpen, setIsBucketListModalOpen] = useState(false)
  
  // Add sensors for dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch user stats and reviews when the user is loaded
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return
      
      try {
        setIsLoading(true)
        
        // Get user stats first 
        const userStats = await getUserStats(user.id)
        setStats(userStats)
        
        // Get user reviews
        const reviews = await getUserReviews(user.id)
        
        if (reviews && Array.isArray(reviews)) {
          setUserReviews(reviews)
          
          // Use the same data for recent plays (only take most recent 3)
          const recentOnes = [...reviews].sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          ).slice(0, 3)
          
          setRecentPlays(recentOnes)
          
          // Calculate rating distribution
          const distribution = [0, 0, 0, 0, 0]
          reviews.forEach(review => {
            if (review.rating >= 1 && review.rating <= 5) {
              distribution[review.rating - 1]++
            }
          })
          setRatingDistribution(distribution)
        } else {
          console.error("Reviews is not an array:", reviews)
          setUserReviews([])
          setRecentPlays([])
        }

        // Get favorite courses
        const favorites = await getFavoriteCourses(user.id)
        setFavoriteCourses(favorites)

        // Get bucket list courses
        const bucketList = await getBucketListCourses(user.id)
        setBucketListCourses(bucketList)
        
        // Get user lists
        try {
          const lists = await getListsByUserId(user.id, true);
          
          // Fetch courses for each list
          const listsWithCourses = await Promise.all(
            lists.map(async (list) => {
              try {
                const listWithCourses = await getListById(list.id);
                return {
                  ...listWithCourses,
                  courseCount: listWithCourses.list_courses?.length || 0,
                  preview: listWithCourses.list_courses 
                    ? listWithCourses.list_courses
                        .slice(0, 3)
                        .map((course: any) => course.courses?.image_url || "/placeholder.svg?height=100&width=100")
                    : ["/placeholder.svg?height=100&width=100"],
                  likes: 0 // This would be replaced with actual likes count when implemented
                };
              } catch (error) {
                console.error(`Error fetching details for list ${list.id}:`, error);
                return {
                  ...list,
                  courseCount: 0,
                  preview: ["/placeholder.svg?height=100&width=100"],
                  likes: 0
                };
              }
            })
          );
          setUserLists(listsWithCourses);
        } catch (error) {
          console.error("Error fetching user lists:", error);
          setUserLists([]);
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        setUserReviews([])
        setRecentPlays([])
        setFavoriteCourses([])
        setBucketListCourses([])
        setUserLists([])
      } finally {
        setIsLoading(false)
      }
    }
    
    if (user) {
      fetchUserData()
    } else if (!isUserLoading) {
      // If we're not loading and there's no user, redirect to login
      router.push("/login")
    }
  }, [user, isUserLoading, router])
  
  // Redirect to login if no user is logged in
  if (!isUserLoading && !user) {
    router.push("/login")
    return null
  }
  
  // Show loading while user data is being fetched
  if (isUserLoading || isLoading) {
    return (
      <div className="container py-8 md:py-12 flex justify-center items-center min-h-[60vh]">
        <p>Loading profile...</p>
      </div>
    )
  }
  
  // Function to refresh bucket list after adding courses
  const refreshBucketList = async () => {
    if (!user?.id) return
    try {
      const bucketList = await getBucketListCourses(user.id)
      setBucketListCourses(bucketList)
    } catch (error) {
      console.error("Error refreshing bucket list:", error)
    }
  }

  // Function to refresh user lists after creating a new one
  const refreshUserLists = async () => {
    if (!user?.id) return
    try {
      const lists = await getListsByUserId(user.id, true);
      
      // Fetch courses for each list
      const listsWithCourses = await Promise.all(
        lists.map(async (list) => {
          try {
            const listWithCourses = await getListById(list.id);
            return {
              ...listWithCourses,
              courseCount: listWithCourses.list_courses?.length || 0,
              preview: listWithCourses.list_courses 
                ? listWithCourses.list_courses
                    .slice(0, 3)
                    .map((course: any) => course.courses?.image_url || "/placeholder.svg?height=100&width=100")
                : ["/placeholder.svg?height=100&width=100"],
              likes: 0 // This would be replaced with actual likes count when implemented
            };
          } catch (error) {
            console.error(`Error fetching details for list ${list.id}:`, error);
            return {
              ...list,
              courseCount: 0,
              preview: ["/placeholder.svg?height=100&width=100"],
              likes: 0
            };
          }
        })
      );
      setUserLists(listsWithCourses);
    } catch (error) {
      console.error("Error refreshing user lists:", error);
    }
  }

  // Handle drag end event for reordering
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setFavoriteCourses((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Update positions in the database
        const courseIds = newItems.map(item => item.course_id);
        if (user?.id) {
          updateFavoriteCoursePositions(user.id, courseIds).catch(error => {
            console.error("Error updating positions:", error);
            toast({
              title: "Error",
              description: "Failed to update course order",
              variant: "destructive",
            });
          });
        }
        
        return newItems;
      });
    }
  };

  // Handle removing a favorite course
  const handleRemoveFavoriteCourse = async (courseId: string) => {
    if (!user?.id) return;
    
    try {
      await removeFavoriteCourse(user.id, courseId);
      // Update local state
      setFavoriteCourses(prev => prev.filter(item => item.course_id !== courseId));
      toast({
        title: "Course removed",
        description: "Course removed from favorites",
      });
    } catch (error) {
      console.error("Error removing favorite course:", error);
      toast({
        title: "Error",
        description: "Failed to remove course from favorites",
        variant: "destructive",
      });
    }
  };

  // Handle removing a bucket list course
  const handleRemoveBucketListCourse = async (courseId: string) => {
    if (!user?.id) return;
    
    try {
      await removeBucketListCourse(user.id, courseId);
      // Update local state
      setBucketListCourses(prev => prev.filter(item => item.course_id !== courseId));
      toast({
        title: "Course removed",
        description: "Course removed from bucket list",
      });
    } catch (error) {
      console.error("Error removing bucket list course:", error);
      toast({
        title: "Error",
        description: "Failed to remove course from bucket list",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container py-8 md:py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full lg:w-[300px] space-y-6">
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={user?.image || "/placeholder.svg"} alt={user?.name} />
                <AvatarFallback>{user?.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <h1 className="text-xl font-bold">{user?.name}</h1>
              <p className="text-sm text-muted-foreground mb-2">
                <Link href={`/user/${user?.name}`} className="hover:underline">
                  @{user?.name}
                </Link>
              </p>
              {user?.location && (
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <MapPinIcon className="h-3.5 w-3.5 mr-1" />
                  <span>{user.location}</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 w-full">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/profile/edit">
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/settings">
                    <Settings2Icon className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h2 className="font-medium mb-3">The Scorecard</h2>
              <div className="grid grid-cols-2 gap-y-4">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mb-1">
                    <GolfIcon className="h-5 w-5" />
                  </div>
                  <p className="font-medium">{stats.coursesPlayed}</p>
                  <p className="text-xs text-muted-foreground">Courses</p>
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
          <Tabs defaultValue="profile">
            <TabsList className="mb-6">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="plays">Plays</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="lists">Lists</TabsTrigger>
              <TabsTrigger value="following">Following</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Favorite Courses Section */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold">Favorite Courses</h2>
                      <p className="text-sm text-muted-foreground">Drag to reorder your favorite courses</p>
                    </div>
                    {favoriteCourses && favoriteCourses.length < 4 && (
                      <FavoriteCourseSelectionModal
                        onCourseAdded={() => {
                          // Refresh favorite courses after adding
                          if (user?.id) {
                            getFavoriteCourses(user.id).then(courses => {
                              setFavoriteCourses(courses);
                            });
                          }
                        }}
                        maxFavorites={4}
                        currentFavoriteCount={favoriteCourses.length}
                        buttonText="Find Courses"
                        buttonVariant="outline"
                      />
                    )}
                  </div>
                  
                  {isLoading ? (
                    <div className="py-8 text-center">
                      <p className="text-muted-foreground mb-4">Loading favorite courses...</p>
                    </div>
                  ) : favoriteCourses && favoriteCourses.length > 0 ? (
                    <DndContext 
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext 
                        items={favoriteCourses.map(course => course.id)}
                        strategy={rectSwappingStrategy}
                      >
                        <div className="grid grid-cols-2 gap-4">
                          {favoriteCourses.slice(0, 4).map((favorite) => (
                            <SortableFavoriteCourse 
                              key={favorite.id} 
                              favorite={favorite} 
                              onRemove={handleRemoveFavoriteCourse}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  ) : (
                    <div className="text-center py-8 border rounded-lg">
                      <p className="text-muted-foreground mb-4">You haven't added any favorite courses yet.</p>
                      <FavoriteCourseSelectionModal
                        onCourseAdded={() => {
                          // Refresh favorite courses after adding
                          if (user?.id) {
                            getFavoriteCourses(user.id).then(courses => {
                              setFavoriteCourses(courses);
                            });
                          }
                        }}
                        maxFavorites={4}
                        currentFavoriteCount={0}
                        buttonText="Explore Courses"
                        buttonVariant="default"
                      />
                    </div>
                  )}

                  {/* Recently Played Section */}
                  <div className="pt-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold">Recently Played</h2>
                      <Button asChild variant="outline" size="sm">
                        <Link href="/courses">Find a Course</Link>
                      </Button>
                    </div>
                    
                    {isLoading ? (
                      <div className="py-8 text-center">
                        <p className="text-muted-foreground mb-4">Loading your rounds...</p>
                      </div>
                    ) : recentPlays && recentPlays.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {recentPlays.map((play) => (
                          <Card key={play.id}>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-md overflow-hidden bg-muted">
                                  <img 
                                    src="/placeholder.svg?height=100&width=100" 
                                    alt={play.course?.name || "Golf Course"} 
                                    className="w-full h-full object-cover" 
                                  />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-medium">
                                    <Link href={`/courses/${play.course_id}`} className="hover:underline">
                                      {play.course?.name || "Unknown Course"}
                                    </Link>
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    {play.course?.location || "Unknown Location"}
                                  </p>
                                  <div className="flex items-center mt-1">
                                    <StarRating rating={play.rating} />
                                    <span className="text-sm text-muted-foreground ml-2">
                                      {new Date(play.date_played).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <p className="text-muted-foreground mb-4">You haven't logged any rounds yet.</p>
                        <Button asChild>
                          <Link href="/courses">Find a Course to Play</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side - Stats and Bucket List */}
                <div className="space-y-6">
                  {/* Rating Distribution */}
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-4 flex items-center">
                        <BarChart2Icon className="h-4 w-4 mr-2" />
                        Rating Distribution
                      </h3>
                      <div className="mb-2">
                        <div className="flex items-center gap-2">
                          {/* Left star indicator (single star) */}
                          <div className="text-primary">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              stroke="currentColor"
                              strokeWidth="1"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          </div>
                          
                          {/* Distribution bars */}
                          <div className="flex-1">
                            <div className="flex h-5 gap-[2px]">
                              {Array.from({ length: 10 }).map((_, index) => {
                                // Calculate the rating this bar represents (0.5 to 5.0)
                                const rating = 0.5 + (index * 0.5);
                                
                                // Map the rating to the correct index in the distribution array
                                const ratingIndex = Math.ceil(rating) - 1;
                                
                                // Determine if this bar should be highlighted based on the data
                                // For whole stars (1-5), use the distribution data directly
                                // For half stars (0.5, 1.5, etc), use an approximation
                                let barHeight = 0;
                                if (rating % 1 === 0) {
                                  // Whole star ratings (1, 2, 3, 4, 5)
                                  barHeight = ratingDistribution[ratingIndex] > 0 ? 100 : 20;
                                } else {
                                  // Half star ratings (0.5, 1.5, 2.5, 3.5, 4.5)
                                  // If the neighboring whole star has ratings, show a medium bar
                                  barHeight = ratingDistribution[ratingIndex] > 0 ? 40 : 20;
                                }
                                
                                // Increase the height for the ratings that we know exist in the data
                                // This creates the bell curve effect seen in the reference image
                                if ([4, 5].includes(Math.ceil(rating)) && ratingDistribution[ratingIndex] > 0) {
                                  barHeight = rating >= 4.5 ? 100 : 80;
                                }
                                
                                return (
                                  <div 
                                    key={index} 
                                    className="flex-1"
                                  >
                                    <div 
                                      className="w-full bg-primary/80 rounded-sm transition-all duration-300"
                                      style={{ height: `${barHeight}%` }}
                                    ></div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          
                          {/* Right indicator (five stars) */}
                          <div className="text-primary flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <svg
                                key={i}
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                stroke="currentColor"
                                strokeWidth="1"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground text-right">
                        {userReviews.length} ratings total
                      </div>
                    </CardContent>
                  </Card>

                  {/* Bucket List */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium flex items-center">
                          <BookmarkIcon className="h-4 w-4 mr-2" />
                          Bucket List
                        </h3>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setIsBucketListModalOpen(true)}
                        >
                          Add Courses
                        </Button>
                      </div>
                      
                      {isLoading ? (
                        <div className="py-4 text-center">
                          <p className="text-sm text-muted-foreground">Loading bucket list...</p>
                        </div>
                      ) : bucketListCourses && bucketListCourses.length > 0 ? (
                        <div className="space-y-3">
                          {bucketListCourses.slice(0, 5).map((course) => (
                            <div key={course.id} className="flex items-center gap-3 group">
                              <div className="w-12 h-12 rounded overflow-hidden bg-muted">
                                <img 
                                  src="/placeholder.svg?height=50&width=50" 
                                  alt={course.courses?.name || "Golf Course"} 
                                  className="w-full h-full object-cover" 
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm truncate">
                                  <Link href={`/courses/${course.course_id}`} className="hover:underline">
                                    {course.courses?.name || "Unknown Course"}
                                  </Link>
                                </h4>
                                <p className="text-xs text-muted-foreground truncate">
                                  {course.courses?.location || "Unknown Location"}
                                </p>
                              </div>
                              <button
                                onClick={() => handleRemoveBucketListCourse(course.course_id)}
                                className="p-1.5 text-muted-foreground hover:text-destructive rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                          {bucketListCourses.length > 5 && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="w-full text-xs"
                              asChild
                            >
                              <Link href="/profile/bucket-list">
                                View all {bucketListCourses.length} courses
                              </Link>
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="py-4 text-center">
                          <p className="text-sm text-muted-foreground mb-4">Your bucket list is empty.</p>
                          <Button 
                            size="sm"
                            onClick={() => setIsBucketListModalOpen(true)}
                          >
                            Add Courses
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="plays" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Recent Rounds</h2>
                <Button asChild variant="outline">
                  <Link href="/courses">Find a Course</Link>
                </Button>
              </div>

              {isLoading ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground mb-4">Loading your rounds...</p>
                </div>
              ) : recentPlays && recentPlays.length > 0 ? (
                <div className="space-y-4">
                  {recentPlays.map((play) => (
                    <Card key={play.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-md overflow-hidden bg-muted">
                            <img 
                              src="/placeholder.svg?height=100&width=100" 
                              alt={play.course?.name || "Golf Course"} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">
                              <Link href={`/courses/${play.course_id}`} className="hover:underline">
                                {play.course?.name || "Unknown Course"}
                              </Link>
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {play.course?.location || "Unknown Location"}
                            </p>
                            <div className="flex items-center mt-1">
                              <StarRating rating={play.rating} />
                              <span className="text-sm text-muted-foreground ml-2">
                                Played on {new Date(play.date_played).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground mb-4">You haven't logged any rounds yet.</p>
                  <Button asChild>
                    <Link href="/courses">Find a Course to Play</Link>
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">My Reviews</h2>
                <Button asChild variant="outline">
                  <Link href="/courses">Find a Course</Link>
                </Button>
              </div>

              {isLoading ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground mb-4">Loading your reviews...</p>
                </div>
              ) : userReviews && userReviews.length > 0 ? (
                <div className="space-y-4">
                  {userReviews
                    .filter(review => review.review_text && review.review_text.trim() !== '')
                    .map((review) => (
                      <Card key={review.id}>
                        <CardContent className="p-6">
                          <h3 className="font-medium mb-1">
                            <Link href={`/courses/${review.course_id}`} className="hover:underline">
                              {review.course?.name || "Unknown Course"}
                            </Link>
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {review.course?.location || "Unknown Location"}
                          </p>
                          <div className="flex items-center mb-3">
                            <StarRating rating={review.rating} />
                            <span className="text-sm text-muted-foreground ml-2">
                              Played on {new Date(review.date_played).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm mb-3">{review.review_text || "No review text provided."}</p>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <ThumbsUpIcon className="h-4 w-4 mr-1" />
                            <span>{review.likes_count} likes</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground mb-4">You haven't written any reviews yet.</p>
                  <Button asChild>
                    <Link href="/courses">Find a Course to Review</Link>
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="lists" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Lists</h2>
                <Button asChild variant="outline" onClick={refreshUserLists}>
                  <Link href="/lists/create">Create New List</Link>
                </Button>
              </div>

              {isLoading ? (
                <div className="text-center py-8">Loading your lists...</div>
              ) : userLists && userLists.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {userLists.map((list) => (
                    <Card key={list.id} className="overflow-hidden">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium">{list.title}</h3>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <ThumbsUpIcon className="h-3.5 w-3.5 mr-1" />
                            {list.likes}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{list.description}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <ListIcon className="h-3.5 w-3.5 mr-1" />
                          {list.courseCount} courses
                        </div>
                        <div className="flex gap-2">
                          {list.preview.map((image: string, index: number) => (
                            <div key={index} className="w-16 h-12 rounded overflow-hidden">
                              <img
                                src={image || "/placeholder.svg"}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                          {list.courseCount > 3 && (
                            <div className="w-16 h-12 rounded bg-muted flex items-center justify-center text-muted-foreground text-xs">
                              +{list.courseCount - 3}
                            </div>
                          )}
                        </div>
                        <Button asChild variant="outline" className="w-full">
                          <Link href={`/lists/${list.id}`}>View List</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground mb-4">You haven't created any lists yet</p>
                  <Button asChild>
                    <Link href="/lists/create">Create Your First List</Link>
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="following" className="space-y-6">
              <h2 className="text-xl font-bold mb-4">Following</h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardContent className="p-4 flex flex-col items-center text-center">
                      <Avatar className="h-16 w-16 mb-3">
                        <AvatarFallback>{`U${index + 1}`}</AvatarFallback>
                      </Avatar>
                      <h3 className="font-medium">User {index + 1}</h3>
                      <p className="text-xs text-muted-foreground mb-3">@username{index + 1}</p>
                      <Button variant="outline" size="sm" className="w-full">
                        Unfollow
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-center">
                <Button variant="outline">View All Following</Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Bucket List Search Modal */}
      {user && (
        <BucketListSearchModal
          userId={user.id}
          isOpen={isBucketListModalOpen}
          onOpenChange={setIsBucketListModalOpen}
          onCoursesAdded={refreshBucketList}
        />
      )}
    </div>
  )
}
