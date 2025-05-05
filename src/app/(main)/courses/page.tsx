import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { StarRating } from "@/components/common/star-rating"
import { MapPinIcon, SearchIcon } from "lucide-react"
import { getAllCourses, getCourseReviews, getCourseAverageRating } from "@/lib/api/courses"

export default async function CoursesPage() {
  // Fetch real courses from Supabase
  const courses = await getAllCourses();
  
  // Get ratings for each course - this would be better optimized with a single query
  // but for now we'll fetch them individually
  const enhancedCourses = await Promise.all(
    courses.map(async (course) => {
      try {
        const reviews = await getCourseReviews(course.id);
        const avgRating = await getCourseAverageRating(course.id);
        return {
          ...course,
          rating: avgRating,
          reviewCount: reviews.length,
          image: "/placeholder.svg?height=200&width=400" // Placeholder image until we have real images
        };
      } catch (error) {
        // Return default values if there's an error
        return {
          ...course,
          rating: 0,
          reviewCount: 0,
          image: "/placeholder.svg?height=200&width=400"
        };
      }
    })
  );

  return (
    <div className="container py-8 md:py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Golf Courses</h1>
          <p className="text-muted-foreground">Discover and explore golf courses across South Africa</p>
        </div>
        <div className="w-full md:w-auto flex gap-2">
          <div className="relative flex-1 md:w-[300px]">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search courses..." className="pl-9" />
          </div>
          <Button>Filter</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enhancedCourses.map((course) => (
          <Card key={course.id} className="overflow-hidden">
            <div className="aspect-video relative">
              <img src={course.image || "/placeholder.svg"} alt={course.name} className="object-cover w-full h-full" />
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

      <div className="flex justify-center mt-8">
        <Button variant="outline">Load More</Button>
      </div>
    </div>
  )
}
