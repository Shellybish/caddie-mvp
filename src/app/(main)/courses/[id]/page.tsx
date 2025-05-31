import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StarRating } from "@/components/common/star-rating"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  BookmarkIcon, 
  CalendarIcon, 
  GlobeIcon, 
  HeartIcon, 
  ListIcon, 
  MapPinIcon, 
  PhoneIcon, 
  Share2Icon, 
  ThumbsUpIcon 
} from "lucide-react"
import { getCourseById, type Course } from "@/lib/api/courses"
import { getCourseAverageRating, getCourseReviews } from "@/lib/api/courses"
import { 
  Pagination, 
  PaginationContent,
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination"
import { LikeButton } from "@/components/reviews/LikeButton"
import { cookies } from "next/headers"
import { getUserIdFromCookies } from "@/lib/auth/session"
import { FavoriteCourseButton } from "@/components/courses/favorite-course-button"
import { CourseActions, CourseActionsButtons } from "@/components/courses/course-actions"

// Define an enhanced course type with UI-specific properties
type EnhancedCourse = Course & {
  rating: number;
  reviewCount: number;
  images: string[];
}

type EnhancedReview = {
  id: string;
  user_id: string;
  course_id: string;
  rating: number;
  review_text?: string;
  date_played: string;
  created_at: string;
  likes_count: number;
  user_has_liked?: boolean;
  user?: {
    username: string;
    avatar_url?: string;
  }
}

type CourseDetailPageProps = {
  params: {
    id: string;
  };
  searchParams?: {
    page?: string;
  };
}

const REVIEWS_PER_PAGE = 5;

export default async function CourseDetailPage({ params, searchParams }: CourseDetailPageProps) {
  // Fix for Next.js warning about using params synchronously
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const id = resolvedParams.id;
  
  // Get current page from query params
  const page = resolvedSearchParams?.page ? parseInt(resolvedSearchParams.page) : 1;
  
  // Get user ID from cookies for checking if user liked reviews
  const cookieStore = cookies();
  const userId = await getUserIdFromCookies(cookieStore);
  
  // Try to fetch the course from the database
  let course: EnhancedCourse;
  let reviews: EnhancedReview[] = [];
  let reviewCount = 0;
  
  try {
    const dbCourse = await getCourseById(id);
    
    // Get the review data
    const rawReviews = await getCourseReviews(id);
    const avgRating = await getCourseAverageRating(id);
    
    // Set the review count from the actual reviews fetched
    reviewCount = rawReviews?.length || 0;
    
    // Calculate pagination
    const startIndex = (page - 1) * REVIEWS_PER_PAGE;
    const paginatedReviews = rawReviews.slice(startIndex, startIndex + REVIEWS_PER_PAGE);
    
    // Check if user has liked each review
    if (userId) {
      const reviewsWithLikeStatus = await Promise.all(
        paginatedReviews.map(async (review) => {
          try {
            // Since hasUserLikedReview is not exported, we'll use a default false value
            // We should implement the proper function or endpoint for this
            return {
              ...review,
              user_has_liked: false // Default value since the function is not available
            };
          } catch (error) {
            console.error("Error checking if user liked review:", error);
            return review;
          }
        })
      );
      reviews = reviewsWithLikeStatus;
    } else {
      reviews = paginatedReviews;
    }
    
    // Transform to EnhancedCourse
    course = {
      ...dbCourse,
      rating: avgRating,
      reviewCount: reviewCount,
      images: [
        "/placeholder.svg?height=400&width=800",
        "/placeholder.svg?height=400&width=800",
        "/placeholder.svg?height=400&width=800",
      ]
    };
  } catch (error) {
    console.error("Error fetching course:", error);
    
    // Show more details about the error
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    // If course not found or error, use mock data as fallback
    course = {
      id: id,
      name: "Royal Johannesburg & Kensington Golf Club (Fallback)",
      location: "Johannesburg, Gauteng",
      province: "Gauteng",
      address: "1 Fairway Ave, Linksfield North, Johannesburg, 2192",
      postal_code: 2192,
      phone: "+27 11 640 3021",
      email: "info@royaljk.co.za",
      website: "https://www.royaljk.co.za",
      description:
        "Royal Johannesburg & Kensington Golf Club is one of the most prestigious golf clubs in South Africa. The East Course, designed by Robert Grimsdell, is a championship layout that has hosted multiple South African Opens. The course features tree-lined fairways, strategic bunkering, and challenging greens that test golfers of all abilities.",
      num_holes: 18,
      designer: "Robert Grimsdell",
      year_established: 1890,
      green_fee_range: "R500 - R1,500",
      slope_rating: 138,
      course_code: "RJK01",
      municipality: "City of Johannesburg",
      rating: 4.5,
      reviewCount: 42,
      images: [
        "/placeholder.svg?height=400&width=800",
        "/placeholder.svg?height=400&width=800",
        "/placeholder.svg?height=400&width=800",
      ],
      created_at: new Date().toISOString()
    };
  }

  // Calculate total pages for pagination
  const totalPages = Math.ceil(reviewCount / REVIEWS_PER_PAGE);

  // Mock lists featuring this course
  const lists = [
    {
      id: "1",
      title: "Top 10 Courses in Gauteng",
      author: "Golf Enthusiast",
      courseCount: 10,
      likes: 24,
    },
    {
      id: "2",
      title: "Best Championship Courses in SA",
      author: "Tournament Player",
      courseCount: 15,
      likes: 36,
    },
    {
      id: "3",
      title: "Historic Golf Clubs of South Africa",
      author: "Golf Historian",
      courseCount: 8,
      likes: 19,
    },
  ]

  return (
    <div>
      {/* Hero Section */}
      <div className="relative h-[300px] md:h-[400px]">
        <img src={course.images[0] || "/placeholder.svg"} alt={course.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
          <div className="container pb-6 md:pb-10">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">{course.name}</h1>
            <div className="flex items-center text-white/90 mb-4">
              <MapPinIcon className="h-4 w-4 mr-1" />
              <span>{course.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <StarRating rating={course.rating} />
              <span className="text-white/90">
                {course.rating > 0 ? course.rating.toFixed(1) : "0.0"} 
                ({reviewCount > 0 ? reviewCount : "0"} {reviewCount === 1 ? "review" : "reviews"})
              </span>
            </div>
            
            {/* Add buttons for favorites and bucket list */}
            <div className="flex flex-wrap gap-3 mt-4">
              <Button 
                variant="outline"
                size="sm"
                className="gap-1 text-sm bg-white/10 hover:bg-white/20 text-white border-white/20"
                asChild
              >
                <Link href={`/courses/${course.id}/log`}>
                  <CalendarIcon className="h-4 w-4" />
                  Log Play
                </Link>
              </Button>
              
              <Button 
                variant="outline"
                size="sm"
                className="gap-1 text-sm bg-white/10 hover:bg-white/20 text-white border-white/20"
                asChild
              >
                <Link href={`/courses/${course.id}/review`}>
                  <ThumbsUpIcon className="h-4 w-4 mr-1" />
                  Write Review
                </Link>
              </Button>
              
              <FavoriteCourseButton courseId={course.id} />
              
              <Button 
                variant="outline"
                size="sm"
                className="gap-1 text-sm bg-white/10 hover:bg-white/20 text-white border-white/20"
                asChild
              >
                <Link href="#" prefetch={false}>
                  <BookmarkIcon className="h-4 w-4 mr-1" />
                  Bucket List
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            <Tabs defaultValue="about">
              <TabsList className="mb-6">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="lists">Lists</TabsTrigger>
                <TabsTrigger value="photos">Photos</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-3">About the Course</h2>
                  <p className="text-muted-foreground">{course.description}</p>
                  
                  {/* Additional Course Information */}
                  {(course.designer || course.year_established || course.num_holes || course.green_fee_range) && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {course.designer && (
                        <div className="flex items-center">
                          <span className="font-medium mr-2">Designer:</span>
                          <span className="text-muted-foreground">{course.designer}</span>
                        </div>
                      )}
                      {course.year_established && (
                        <div className="flex items-center">
                          <span className="font-medium mr-2">Established:</span>
                          <span className="text-muted-foreground">{course.year_established}</span>
                        </div>
                      )}
                      {course.num_holes && (
                        <div className="flex items-center">
                          <span className="font-medium mr-2">Holes:</span>
                          <span className="text-muted-foreground">{course.num_holes}</span>
                        </div>
                      )}
                      {course.green_fee_range && (
                        <div className="flex items-center">
                          <span className="font-medium mr-2">Green Fees:</span>
                          <span className="text-muted-foreground">{course.green_fee_range}</span>
                        </div>
                      )}
                      {course.slope_rating && (
                        <div className="flex items-center">
                          <span className="font-medium mr-2">Slope Rating:</span>
                          <span className="text-muted-foreground">{course.slope_rating}</span>
                        </div>
                      )}
                      {course.course_code && (
                        <div className="flex items-center">
                          <span className="font-medium mr-2">Course Code:</span>
                          <span className="text-muted-foreground">{course.course_code}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="text-xl font-bold mb-3">Contact Information</h2>
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <MapPinIcon className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
                      <span>
                        {course.address}
                        {course.postal_code && course.address && <>, {course.postal_code}</>}
                        {!course.address && "Address not available"}
                      </span>
                    </div>
                    {course.phone && (
                      <div className="flex items-center">
                        <PhoneIcon className="h-5 w-5 mr-2 text-muted-foreground" />
                        <span>{course.phone}</span>
                      </div>
                    )}
                    {course.email && (
                      <div className="flex items-center">
                        <svg className="h-5 w-5 mr-2 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                          <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                        <a href={`mailto:${course.email}`} className="text-primary hover:underline">
                          {course.email}
                        </a>
                      </div>
                    )}
                    {course.website && (
                      <div className="flex items-center">
                        <GlobeIcon className="h-5 w-5 mr-2 text-muted-foreground" />
                        <a
                          href={course.website.startsWith('http') ? course.website : `https://${course.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {course.website.replace(/^https?:\/\//, "")}
                        </a>
                      </div>
                    )}
                    {(!course.phone && !course.website && !course.email) && (
                      <div className="text-muted-foreground">No contact information available</div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Reviews</h2>
                    <Button asChild>
                      <Link href={`/courses/${course.id}/log`}>
                        Log a Round
                      </Link>
                    </Button>
                  </div>

                  {reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <Card key={review.id} className="overflow-hidden">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={review.user?.avatar_url || "/placeholder.svg"} alt={review.user?.username || "User"} />
                                <AvatarFallback>{(review.user?.username || "U").charAt(0).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium">{review.user?.username || "Anonymous User"}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {review.date_played ? (
                                      <span>{new Date(review.date_played).toLocaleDateString()}</span>
                                    ) : (
                                      <span>{new Date(review.created_at).toLocaleDateString()}</span>
                                    )}
                                  </p>
                                </div>
                                <div className="flex items-center">
                                  <StarRating rating={review.rating} />
                                  <span className="ml-2 text-sm text-muted-foreground">
                                    {review.rating.toFixed(1)}
                                  </span>
                                </div>
                                {review.review_text && <p className="mt-2">{review.review_text}</p>}
                                <div className="flex items-center mt-3">
                                  <LikeButton 
                                    reviewId={review.id} 
                                    initialLiked={review.user_has_liked || false} 
                                    initialLikesCount={review.likes_count || 0}
                                  />
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      {totalPages > 1 && (
                        <Pagination className="mt-6">
                          <PaginationContent>
                            {page > 1 && (
                              <PaginationItem>
                                <PaginationPrevious href={`/courses/${course.id}?page=${page - 1}`} />
                              </PaginationItem>
                            )}
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                              <PaginationItem key={pageNum}>
                                <PaginationLink 
                                  href={`/courses/${course.id}?page=${pageNum}`}
                                  isActive={pageNum === page}
                                >
                                  {pageNum}
                                </PaginationLink>
                              </PaginationItem>
                            ))}
                            
                            {page < totalPages && (
                              <PaginationItem>
                                <PaginationNext href={`/courses/${course.id}?page=${page + 1}`} />
                              </PaginationItem>
                            )}
                          </PaginationContent>
                        </Pagination>
                      )}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-muted-foreground mb-4">No reviews yet. Be the first to review this course!</p>
                      <Button asChild>
                        <Link href={`/courses/${course.id}/review`}>Write a Review</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="lists" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Featured In Lists</h2>
                  <Button asChild variant="outline">
                    <Link href={`/courses/${course.id}/add-to-list`}>Add to List</Link>
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {lists.map((list) => (
                    <Card key={list.id} className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">{list.title}</h4>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <ThumbsUpIcon className="h-4 w-4 mr-1" />
                            {list.likes}
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <p className="text-muted-foreground">By {list.author}</p>
                          <p className="text-muted-foreground">
                            <ListIcon className="h-3.5 w-3.5 inline mr-1" />
                            {list.courseCount} courses
                          </p>
                        </div>
                        <Button asChild variant="outline" size="sm" className="w-full mt-2">
                          <Link href={`/lists/${list.id}`}>View List</Link>
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="photos" className="space-y-6">
                <h2 className="text-xl font-bold mb-3">Photos</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {course.images.map((image, index) => (
                    <div key={index} className="aspect-video rounded-md overflow-hidden">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`${course.name} - Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-[300px] space-y-6">
            <CourseActions courseId={course.id} courseName={course.name} />
            
            <CourseActionsButtons courseId={course.id} />

            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-medium">Recently Played By</h3>
                <div className="flex flex-wrap gap-2">
                  <Avatar>
                    <AvatarFallback>JS</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback>MK</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback>RB</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback>TN</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback>+8</AvatarFallback>
                  </Avatar>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-medium">Nearby Courses</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="w-16 h-12 rounded overflow-hidden shrink-0">
                      <img
                        src="/placeholder.svg?height=100&width=100"
                        alt="Nearby course"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium line-clamp-1">Randpark Golf Club</p>
                      <p className="text-xs text-muted-foreground">12.5 km away</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-16 h-12 rounded overflow-hidden shrink-0">
                      <img
                        src="/placeholder.svg?height=100&width=100"
                        alt="Nearby course"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium line-clamp-1">Houghton Golf Club</p>
                      <p className="text-xs text-muted-foreground">8.3 km away</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-16 h-12 rounded overflow-hidden shrink-0">
                      <img
                        src="/placeholder.svg?height=100&width=100"
                        alt="Nearby course"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium line-clamp-1">Glendower Golf Club</p>
                      <p className="text-xs text-muted-foreground">15.7 km away</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
