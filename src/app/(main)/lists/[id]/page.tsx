import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StarRating } from "@/components/common/star-rating"
import { ChevronLeftIcon, ListIcon, MapPinIcon, Share2Icon, ThumbsUpIcon, UserIcon } from "lucide-react"
import { getListById, getProfileById, getListsByUserId } from "@/lib/api/profiles"
import { getCourseAverageRating } from "@/lib/api/courses"
import { type List } from "@/lib/api/profiles"

// Define the extended list type with UI-specific properties
type ExtendedList = List & {
  author: {
    id: string;
    name: string;
    username: string;
    image?: string;
  };
  courseCount: number;
  likes?: number;
  courses: Array<{
    id: string;
    name: string;
    location: string;
    rating: number;
    image?: string;
    description?: string;
  }>;
}

export default async function ListDetailPage({ params }: { params: { id: string } }) {
  // Properly await params to fix the Next.js 15.2.4 warning
  const resolvedParams = await Promise.resolve(params);
  const listId = resolvedParams.id;
  
  // Try to fetch the list from the database
  let list: ExtendedList;
  let otherListsByAuthor: List[] = [];
  
  try {
    // Get the list data
    const dbList = await getListById(listId);
    
    // Get the creator's profile
    const profile = await getProfileById(dbList.user_id);
    
    // Get ratings for each course
    const coursesWithRatings = await Promise.all(
      dbList.list_courses?.map(async (item: any) => {
        const rating = await getCourseAverageRating(item.course_id);
        return {
          id: item.courses.id,
          name: item.courses.name,
          location: `${item.courses.location}, ${item.courses.province}`,
          rating: rating,
          image: "/placeholder.svg?height=200&width=400",
          description: item.courses.description
        };
      }) || []
    );
    
    // Get other lists by the same user
    const userLists = await getListsByUserId(dbList.user_id, true);
    otherListsByAuthor = userLists.filter(otherList => otherList.id !== dbList.id).slice(0, 3);
    
    // Transform to ExtendedList with UI properties
    list = {
      ...dbList,
      author: {
        id: dbList.user_id,
        name: profile.full_name || profile.username,
        username: profile.username,
        image: profile.avatar_url || "/placeholder.svg?height=40&width=40",
      },
      courseCount: dbList.list_courses?.length || 0,
      likes: undefined, // We don't have likes functionality yet
      courses: coursesWithRatings
    } as ExtendedList;
  } catch (error) {
    console.error("Error fetching list:", error);
    // If list not found or error, use mock data as fallback
    list = {
      id: listId,
      user_id: "user1", // Required for List type
      is_public: true, // Required for List type
      created_at: new Date().toISOString(), // Required for List type
      title: "Top 10 Courses in Western Cape",
      description:
        "The most beautiful and challenging courses in the Western Cape region, featuring stunning coastal and mountain views. These courses offer a perfect blend of scenic beauty and golfing challenge.",
      author: {
        id: "user1",
        name: "User",
        username: "user",
        image: "/placeholder.svg?height=40&width=40",
      },
      courseCount: 10,
      likes: undefined,
      courses: [
        {
          id: "1",
          name: "Fancourt Links",
          location: "George, Western Cape",
          rating: 0,
          image: "/placeholder.svg?height=200&width=400",
          description:
            "Designed by Gary Player, this championship course is consistently ranked as South Africa's best. The links-style layout offers a true test of golf in a spectacular setting.",
        },
        {
          id: "2",
          name: "Arabella Golf Club",
          location: "Hermanus, Western Cape",
          rating: 0,
          image: "/placeholder.svg?height=200&width=400",
          description:
            "Set alongside the Bot River Lagoon with the Kogelberg Mountains as a backdrop, Arabella is one of the most picturesque courses in the country. The closing stretch of holes along the lagoon is particularly memorable.",
        },
        // ... more courses
      ],
    }
  }

  return (
    <div className="container py-8 md:py-12">
      <Link href="/lists" className="flex items-center text-muted-foreground hover:text-foreground mb-6">
        <ChevronLeftIcon className="h-4 w-4 mr-1" />
        Back to lists
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-3">{list.title}</h1>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center">
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarImage src={list.author.image || "/placeholder.svg"} alt={list.author.name} />
                  <AvatarFallback>{list.author.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <Link href={`/profile/${list.author.username}`} className="text-sm font-medium hover:underline">
                  {list.author.name}
                </Link>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <ListIcon className="h-4 w-4 mr-1" />
                {list.courseCount} courses
              </div>
              {list.likes !== undefined && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <ThumbsUpIcon className="h-4 w-4 mr-1" />
                  {list.likes} likes
                </div>
              )}
            </div>
            <p className="text-muted-foreground">{list.description}</p>
          </div>

          <div className="space-y-6">
            {list.courses.map((course, index) => (
              <Card key={course.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3 aspect-video md:aspect-auto relative">
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-sm font-medium py-1 px-3 rounded-full">
                      #{index + 1}
                    </div>
                    <img
                      src={course.image || "/placeholder.svg"}
                      alt={course.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="flex-1 p-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-lg">{course.name}</h3>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPinIcon className="h-3.5 w-3.5 mr-1" />
                            <span>{course.location}</span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <StarRating rating={course.rating} />
                          <span className="text-sm text-muted-foreground ml-1">
                            {course.rating ? course.rating.toFixed(1) : "N/A"}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{course.description}</p>
                      <div className="flex justify-between items-center pt-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/courses/${course.id}`}>View Course</Link>
                        </Button>
                        <Button asChild className="btn-navy" size="sm">
                          <Link href={`/courses/${course.id}/log`}>Log Play</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-[300px] space-y-6">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Actions</h3>
              </div>
              <div className="grid gap-2">
                <Button variant="outline" className="w-full">
                  <ThumbsUpIcon className="h-4 w-4 mr-2" />
                  Like List
                </Button>
                <Button variant="outline" className="w-full">
                  <UserIcon className="h-4 w-4 mr-2" />
                  Follow Creator
                </Button>
                <Button variant="ghost" className="w-full">
                  <Share2Icon className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>

          {otherListsByAuthor.length > 0 && (
            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-medium">More by {list.author.name}</h3>
                <div className="space-y-3">
                  {otherListsByAuthor.map(otherList => (
                    <Link key={otherList.id} href={`/lists/${otherList.id}`} className="block hover:underline">
                      {otherList.title}
                    </Link>
                  ))}
                  {otherListsByAuthor.length === 0 && (
                    <p className="text-sm text-muted-foreground">No other lists from this user</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-medium">Similar Lists</h3>
              <div className="space-y-3">
                <Link href="#" className="block hover:underline">
                  Top Courses in KwaZulu-Natal
                </Link>
                <Link href="#" className="block hover:underline">
                  Best Value Courses Under R500
                </Link>
                <Link href="#" className="block hover:underline">
                  Most Challenging Courses
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
