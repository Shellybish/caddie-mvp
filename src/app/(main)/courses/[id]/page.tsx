import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StarRating } from "@/components/common/star-rating"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarIcon, GlobeIcon, ListIcon, MapPinIcon, PhoneIcon, Share2Icon, ThumbsUpIcon } from "lucide-react"
import { getCourseById, type Course } from "@/lib/api/courses"
import { getCourseAverageRating, getCourseReviews } from "@/lib/api/courses"

// Define an enhanced course type with UI-specific properties
type EnhancedCourse = Course & {
  rating: number;
  reviewCount: number;
  images: string[];
}

type CourseDetailPageProps = {
  params: {
    id: string;
  };
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  // Fix for Next.js warning about using params synchronously
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams.id;
  
  console.log("Course ID from params:", id, typeof id);
  
  // Try to fetch the course from the database
  let course: EnhancedCourse;
  
  try {
    console.log("Attempting to fetch course with ID:", id);
    const dbCourse = await getCourseById(id);
    console.log("Successfully fetched course:", dbCourse?.name || "Unknown");
    
    // Get the review data
    const reviews = await getCourseReviews(id);
    const avgRating = await getCourseAverageRating(id);
    
    // Transform to EnhancedCourse
    course = {
      ...dbCourse,
      rating: avgRating,
      reviewCount: reviews.length,
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
                {course.rating} ({course.reviewCount} reviews)
              </span>
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

              <TabsContent value="reviews" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Reviews</h2>
                  <Button asChild>
                    <Link href={`/courses/${course.id}/review`}>Write a Review</Link>
                  </Button>
                </div>

                <div className="space-y-4">
                  {/* Create mock reviews if no real reviews available */}
                  {(course.reviewCount > 0 ? [{
                    id: "1",
                    user: {
                      name: "John Smith",
                      image: "/placeholder.svg?height=40&width=40",
                    },
                    rating: 5,
                    date: "2023-10-15",
                    content:
                      "Absolutely stunning course with amazing views. The condition was impeccable and the staff were incredibly friendly. The par 3s are particularly challenging and memorable. Will definitely be back!",
                    likes: 12,
                  },
                  {
                    id: "2",
                    user: {
                      name: "Sarah Johnson",
                      image: "/placeholder.svg?height=40&width=40",
                    },
                    rating: 4,
                    date: "2023-09-22",
                    content:
                      "Great layout and excellent condition. The greens were rolling perfectly, though the bunkers were a bit inconsistent. The clubhouse facilities are top-notch and the food was excellent. A must-play if you're in Johannesburg.",
                    likes: 8,
                  }] : []).map((review) => (
                    <Card key={review.id} className="p-4">
                      <div className="flex gap-4">
                        <Avatar>
                          <AvatarImage src={review.user.image || "/placeholder.svg"} alt={review.user.name} />
                          <AvatarFallback>{review.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{review.user.name}</p>
                            <p className="text-xs text-muted-foreground">
                              <CalendarIcon className="h-3 w-3 inline mr-1" />
                              {new Date(review.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <StarRating rating={review.rating} />
                          </div>
                          <p className="text-sm">{review.content}</p>
                          <div className="flex items-center justify-end">
                            <Button variant="ghost" size="sm" className="text-muted-foreground">
                              <ThumbsUpIcon className="h-4 w-4 mr-1" />
                              {review.likes}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="flex justify-center">
                  <Button variant="outline">Load More Reviews</Button>
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
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Actions</h3>
                </div>
                <div className="grid gap-2">
                  <Button asChild className="w-full btn-navy">
                    <Link href={`/courses/${course.id}/log`}>Log Play</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/courses/${course.id}/review`}>Write Review</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/courses/${course.id}/add-to-list`}>Add to List</Link>
                  </Button>
                  <Button variant="ghost" className="w-full">
                    <Share2Icon className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>

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
                      <p className="text-xs text-muted-foreground">15.1 km away</p>
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
