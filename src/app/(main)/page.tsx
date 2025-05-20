import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { StarRating } from "@/components/common/star-rating"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ClipboardIcon, CompassIcon, ListIcon, Share2Icon, MapPinIcon } from "lucide-react"
import { 
  getHighestRatedCourses, 
  getTrendingCourses, 
  getHiddenGemCourses,
  HighRatedCourse,
  TrendingCourse,
  HiddenGemCourse
} from "@/lib/api/courses"

// Define types for our featured courses data
type FeaturedCourse = {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  image: string;
  badgeText?: string;
}

export default async function HomePage() {
  // Fetch real featured courses with error handling
  let highestRatedData: HighRatedCourse[] = [];
  let trendingData: TrendingCourse[] = [];
  let hiddenGemData: HiddenGemCourse[] = [];
  
  try {
    // Use Promise.allSettled to ensure we get at least some data if one API fails
    const [highestRatedResult, trendingResult, hiddenGemResult] = await Promise.allSettled([
      getHighestRatedCourses(1),
      getTrendingCourses(1),
      getHiddenGemCourses(1)
    ]);

    // Extract data from fulfilled promises, empty array for rejected ones
    if (highestRatedResult.status === 'fulfilled') highestRatedData = highestRatedResult.value;
    if (trendingResult.status === 'fulfilled') trendingData = trendingResult.value;
    if (hiddenGemResult.status === 'fulfilled') hiddenGemData = hiddenGemResult.value;
    
    // If we have no real data at all, use fallback data
    if (highestRatedData.length === 0 && trendingData.length === 0 && hiddenGemData.length === 0) {
      console.warn("No course data available from API, using fallback data");
      // Fallback to mock data if all APIs fail
      highestRatedData = [{
        id: '1',
        name: 'Royal Johannesburg & Kensington Golf Club',
        location: 'Johannesburg, Gauteng',
        province: 'Gauteng',
        avg_rating: '4.8',
        review_count: '42'
      }];
      
      trendingData = [{
        id: '2',
        name: 'Durban Country Club',
        location: 'Durban, KwaZulu-Natal',
        province: 'KwaZulu-Natal',
        latest_review: new Date().toISOString(),
        avg_rating: '4.5',
        review_count: '36'
      }];
      
      hiddenGemData = [{
        id: '3',
        name: 'Fancourt Links',
        location: 'George, Western Cape',
        province: 'Western Cape',
        avg_rating: '4.6',
        review_count: '5'
      }];
    }
  } catch (error) {
    console.error("Error fetching featured courses:", error);
    // Fallback to mock data if API call fails completely
    highestRatedData = [{
      id: '1',
      name: 'Royal Johannesburg & Kensington Golf Club',
      location: 'Johannesburg, Gauteng',
      province: 'Gauteng',
      avg_rating: '4.8',
      review_count: '42'
    }];
    
    trendingData = [{
      id: '2',
      name: 'Durban Country Club',
      location: 'Durban, KwaZulu-Natal',
      province: 'KwaZulu-Natal',
      latest_review: new Date().toISOString(),
      avg_rating: '4.5',
      review_count: '36'
    }];
    
    hiddenGemData = [{
      id: '3',
      name: 'Fancourt Links',
      location: 'George, Western Cape',
      province: 'Western Cape',
      avg_rating: '4.6',
      review_count: '5'
    }];
  }

  // Format the data consistently for display
  const featuredCourses: FeaturedCourse[] = [
    ...highestRatedData.map((course: HighRatedCourse) => ({
      id: course.id,
      name: course.name,
      location: course.location || "South Africa",
      rating: Number(course.avg_rating) || 4.5,
      reviewCount: Number(course.review_count) || 0,
      image: "/placeholder.svg?height=200&width=400",
      badgeText: "Highest Rated"
    })),
    ...trendingData.map((course: TrendingCourse) => ({
      id: course.id,
      name: course.name,
      location: course.location || "South Africa",
      rating: Number(course.avg_rating) || 4.0,
      reviewCount: Number(course.review_count) || 0,
      image: "/placeholder.svg?height=200&width=400",
      badgeText: "Trending"
    })),
    ...hiddenGemData.map((course: HiddenGemCourse) => ({
      id: course.id,
      name: course.name,
      location: course.location || "South Africa",
      rating: Number(course.avg_rating) || 4.2,
      reviewCount: Number(course.review_count) || 0,
      image: "/placeholder.svg?height=200&width=400",
      badgeText: "Hidden Gem"
    }))
  ];

  // Mock data for the homepage - only for reviews and lists sections
  const recentReviews = [
    {
      id: "1",
      user: {
        name: "John Smith",
        image: "/placeholder.svg?height=40&width=40",
      },
      course: "Leopard Creek Country Club",
      rating: 5,
      content:
        "Absolutely stunning course with amazing views of Kruger National Park. The condition was impeccable and the wildlife sightings made it unforgettable.",
      date: "2 days ago",
    },
    {
      id: "2",
      user: {
        name: "Sarah Johnson",
        image: "/placeholder.svg?height=40&width=40",
      },
      course: "Gary Player Country Club",
      rating: 4,
      content:
        "Challenging layout that tests every aspect of your game. The greens were rolling perfectly, though the bunkers were a bit inconsistent.",
      date: "5 days ago",
    },
  ]

  const popularLists = [
    {
      id: "1",
      title: "Top 10 Courses in Western Cape",
      author: "Golf Enthusiast",
      courseCount: 10,
      likes: 24,
    },
    {
      id: "2",
      title: "Best Value Courses in Gauteng",
      author: "Budget Golfer",
      courseCount: 8,
      likes: 18,
    },
    {
      id: "3",
      title: "Must-Play Coastal Courses",
      author: "Ocean Lover",
      courseCount: 12,
      likes: 32,
    },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-12 md:py-20 flex-grow">
        <div className="container px-4 md:px-6 h-full flex items-center">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">
                  <div className="mb-2">Track courses you've played.</div>
                  <div className="mb-2">Discover & save those you want to.</div>
                  <div>Tell your friends what's good.</div>
                </h1>
                <p className="text-lg text-primary-foreground/80 mt-3">The social network for South African golf lovers.</p>
              </div>
              <div className="pt-2">
                <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                  <Link href="/register">Get started - it's free!</Link>
                </Button>
              </div>
            </div>
            <div className="relative h-[250px] md:h-[350px] rounded-lg overflow-hidden">
              <img
                src="/images/leopard-creek.png"
                alt="Beautiful aerial view of Leopard Creek golf course with island green"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="bg-primary/10 p-3 rounded-full">
                <ClipboardIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold">Track Your Golf Journey</h3>
              <p className="text-sm text-muted-foreground">Log every play and build your golf passport</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="bg-primary/10 p-3 rounded-full">
                <CompassIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold">Discover Hidden Gems</h3>
              <p className="text-sm text-muted-foreground">Find new courses based on real golfer reviews</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="bg-primary/10 p-3 rounded-full">
                <ListIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold">Create Dream Course Lists</h3>
              <p className="text-sm text-muted-foreground">Organise your bucket list and favorite courses</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="bg-primary/10 p-3 rounded-full">
                <Share2Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold">Share Your Experiences</h3>
              <p className="text-sm text-muted-foreground">Rate, review and become a trusted voice</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Featured Courses</h2>
              <p className="text-muted-foreground">Discover some of South Africa's finest golf courses</p>
            </div>
            <Button asChild variant="outline" className="mt-4 md:mt-0">
              <Link href="/courses">View All Courses</Link>
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden">
                <div className="aspect-video relative">
                  <img
                    src={course.image || "/placeholder.svg"}
                    alt={course.name}
                    className="object-cover w-full h-full"
                  />
                  {course.badgeText && (
                    <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-md">
                      {course.badgeText}
                    </div>
                  )}
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
        </div>
      </section>

      {/* Recent Activity */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">Recent Activity</h2>
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Recent Reviews */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-medium">Latest Reviews</h3>
                <Button asChild variant="link" className="p-0">
                  <Link href="/reviews">View All</Link>
                </Button>
              </div>
              <div className="space-y-4">
                {recentReviews.map((review) => (
                  <Card key={review.id} className="p-4">
                    <div className="flex gap-4">
                      <Avatar>
                        <AvatarImage src={review.user.image || "/placeholder.svg"} alt={review.user.name} />
                        <AvatarFallback>{review.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{review.user.name}</p>
                          <p className="text-xs text-muted-foreground">{review.date}</p>
                        </div>
                        <p className="text-sm font-medium">{review.course}</p>
                        <div className="flex items-center">
                          <StarRating rating={review.rating} />
                        </div>
                        <p className="text-sm line-clamp-2">{review.content}</p>
                        <Button asChild variant="link" className="p-0 h-auto text-sm">
                          <Link href={`/reviews/${review.id}`}>Read Full Review</Link>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Popular Lists */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-medium">Popular Lists</h3>
                <Button asChild variant="link" className="p-0">
                  <Link href="/lists">View All</Link>
                </Button>
              </div>
              <div className="space-y-4">
                {popularLists.map((list) => (
                  <Card key={list.id} className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{list.title}</h4>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-1"
                          >
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                          </svg>
                          {list.likes}
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <p className="text-muted-foreground">By {list.author}</p>
                        <p className="text-muted-foreground">{list.courseCount} courses</p>
                      </div>
                      <Button asChild variant="outline" size="sm" className="w-full mt-2">
                        <Link href={`/lists/${list.id}`}>View List</Link>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Hidden on initial view */}
      <section className="py-12 md:py-16 hidden">
        <div className="container px-4 md:px-6">
          <div className="bg-primary rounded-lg p-6 md:p-10 text-primary-foreground">
            <div className="max-w-2xl mx-auto text-center space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold">Join Caddie Community</h2>
              <p className="text-primary-foreground/80">
                Create your account today to start logging your rounds, rating courses, and connecting with fellow golf
                enthusiasts.
              </p>
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                <Link href="/register">Sign Up Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
