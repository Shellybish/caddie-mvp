import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StarRating } from "@/components/star-rating"
import { ChevronLeftIcon, ListIcon, MapPinIcon, Share2Icon, ThumbsUpIcon, UserIcon } from "lucide-react"

export default function ListDetailPage({ params }: { params: { id: string } }) {
  // Mock data for a list
  const list = {
    id: params.id,
    title: "Top 10 Courses in Western Cape",
    description:
      "The most beautiful and challenging courses in the Western Cape region, featuring stunning coastal and mountain views. These courses offer a perfect blend of scenic beauty and golfing challenge.",
    author: {
      id: "user1",
      name: "Golf Enthusiast",
      image: "/placeholder.svg?height=40&width=40",
    },
    courseCount: 10,
    likes: 24,
    createdAt: "2023-08-15",
    courses: [
      {
        id: "1",
        name: "Fancourt Links",
        location: "George, Western Cape",
        rating: 4.9,
        image: "/placeholder.svg?height=200&width=400",
        description:
          "Designed by Gary Player, this championship course is consistently ranked as South Africa's best. The links-style layout offers a true test of golf in a spectacular setting.",
      },
      {
        id: "2",
        name: "Arabella Golf Club",
        location: "Hermanus, Western Cape",
        rating: 4.6,
        image: "/placeholder.svg?height=200&width=400",
        description:
          "Set alongside the Bot River Lagoon with the Kogelberg Mountains as a backdrop, Arabella is one of the most picturesque courses in the country. The closing stretch of holes along the lagoon is particularly memorable.",
      },
      {
        id: "3",
        name: "Pearl Valley Golf Estate",
        location: "Paarl, Western Cape",
        rating: 4.7,
        image: "/placeholder.svg?height=200&width=400",
        description:
          "This Jack Nicklaus signature course is set in the beautiful Franschhoek Valley, surrounded by mountains and vineyards. The course features numerous water hazards and well-placed bunkers.",
      },
      {
        id: "4",
        name: "Erinvale Golf Club",
        location: "Somerset West, Western Cape",
        rating: 4.5,
        image: "/placeholder.svg?height=200&width=400",
        description:
          "Designed by Gary Player, Erinvale has hosted the World Cup of Golf and offers stunning views of False Bay and the Hottentots Holland Mountains. The back nine climbs into the foothills, providing dramatic elevation changes.",
      },
      {
        id: "5",
        name: "Steenberg Golf Club",
        location: "Cape Town, Western Cape",
        rating: 4.8,
        image: "/placeholder.svg?height=200&width=400",
        description:
          "Set in the oldest wine farm in the Cape, Steenberg offers a parkland-style course with mountain backdrops and challenging water features. The course is known for its excellent conditioning year-round.",
      },
    ],
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
                  <AvatarFallback>{list.author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <Link href={`/users/${list.author.id}`} className="text-sm font-medium hover:underline">
                  {list.author.name}
                </Link>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <ListIcon className="h-4 w-4 mr-1" />
                {list.courseCount} courses
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <ThumbsUpIcon className="h-4 w-4 mr-1" />
                {list.likes} likes
              </div>
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
                          <span className="text-sm text-muted-foreground ml-1">{course.rating}</span>
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

          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-medium">More by {list.author.name}</h3>
              <div className="space-y-3">
                <Link href="#" className="block hover:underline">
                  Best Value Courses in South Africa
                </Link>
                <Link href="#" className="block hover:underline">
                  Golf Courses with Mountain Views
                </Link>
                <Link href="#" className="block hover:underline">
                  Must-Play Courses for Visitors
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-medium">Similar Lists</h3>
              <div className="space-y-3">
                <Link href="#" className="block hover:underline">
                  Top Courses in KwaZulu-Natal
                </Link>
                <Link href="#" className="block hover:underline">
                  Best Coastal Courses in South Africa
                </Link>
                <Link href="#" className="block hover:underline">
                  Championship Courses Worth Playing
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
