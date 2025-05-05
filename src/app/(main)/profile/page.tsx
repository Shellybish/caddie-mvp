"use client"

import Link from "next/link"
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
} from "lucide-react"

export default function ProfilePage() {
  // Mock user data
  const user = {
    id: "user1",
    name: "John Smith",
    username: "golfenthusiast",
    location: "Cape Town, Western Cape",
    bio: "Avid golfer with a passion for discovering new courses. Currently playing off a 12 handicap and working to get it lower. Love links-style courses and challenging layouts.",
    image: "/placeholder.svg?height=200&width=200",
    stats: {
      coursesPlayed: 42,
      reviews: 28,
      lists: 5,
      followers: 124,
      following: 87,
    },
  }

  // Mock recent plays
  const recentPlays = [
    {
      id: "1",
      course: {
        id: "course1",
        name: "Fancourt Links",
        location: "George, Western Cape",
        image: "/placeholder.svg?height=100&width=100",
      },
      date: "2023-11-15",
      rating: 4.5,
    },
    {
      id: "2",
      course: {
        id: "course2",
        name: "Arabella Golf Club",
        location: "Hermanus, Western Cape",
        image: "/placeholder.svg?height=100&width=100",
      },
      date: "2023-10-28",
      rating: 4.0,
    },
    {
      id: "3",
      course: {
        id: "course3",
        name: "Royal Johannesburg & Kensington Golf Club",
        location: "Johannesburg, Gauteng",
        image: "/placeholder.svg?height=100&width=100",
      },
      date: "2023-10-05",
      rating: 4.5,
    },
  ]

  // Mock reviews
  const reviews = [
    {
      id: "1",
      course: {
        id: "course1",
        name: "Fancourt Links",
        location: "George, Western Cape",
        image: "/placeholder.svg?height=100&width=100",
      },
      date: "2023-11-15",
      rating: 4.5,
      content:
        "Absolutely stunning course with amazing views. The condition was impeccable and the staff were incredibly friendly. The par 3s are particularly challenging and memorable. Will definitely be back!",
      likes: 12,
    },
    {
      id: "2",
      course: {
        id: "course2",
        name: "Arabella Golf Club",
        location: "Hermanus, Western Cape",
        image: "/placeholder.svg?height=100&width=100",
      },
      date: "2023-10-28",
      rating: 4.0,
      content:
        "Great layout and excellent condition. The greens were rolling perfectly, though the bunkers were a bit inconsistent. The clubhouse facilities are top-notch and the food was excellent. A must-play if you're in the area.",
      likes: 8,
    },
  ]

  // Mock lists
  const lists = [
    {
      id: "1",
      title: "Top 10 Courses in Western Cape",
      description: "The most beautiful and challenging courses in the Western Cape region.",
      courseCount: 10,
      likes: 24,
      preview: [
        "/placeholder.svg?height=100&width=100",
        "/placeholder.svg?height=100&width=100",
        "/placeholder.svg?height=100&width=100",
      ],
    },
    {
      id: "2",
      title: "Best Value Courses in South Africa",
      description: "Great golf experiences that won't break the bank.",
      courseCount: 12,
      likes: 18,
      preview: [
        "/placeholder.svg?height=100&width=100",
        "/placeholder.svg?height=100&width=100",
        "/placeholder.svg?height=100&width=100",
      ],
    },
  ]

  return (
    <div className="container py-8 md:py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full lg:w-[300px] space-y-6">
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <h1 className="text-xl font-bold">{user.name}</h1>
              <p className="text-sm text-muted-foreground mb-2">@{user.username}</p>
              <div className="flex items-center text-sm text-muted-foreground mb-4">
                <MapPinIcon className="h-3.5 w-3.5 mr-1" />
                <span>{user.location}</span>
              </div>
              <p className="text-sm mb-4">{user.bio}</p>
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
              <h2 className="font-medium mb-3">Stats</h2>
              <div className="grid grid-cols-2 gap-y-4">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mb-1">
                    <GolfIcon className="h-5 w-5" />
                  </div>
                  <p className="font-medium">{user.stats.coursesPlayed}</p>
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
                  <p className="font-medium">{user.stats.reviews}</p>
                  <p className="text-xs text-muted-foreground">Reviews</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mb-1">
                    <ListIcon className="h-5 w-5" />
                  </div>
                  <p className="font-medium">{user.stats.lists}</p>
                  <p className="text-xs text-muted-foreground">Lists</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mb-1">
                    <UserIcon className="h-5 w-5" />
                  </div>
                  <p className="font-medium">{user.stats.followers}</p>
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
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Recent Plays</h2>
                <Button asChild variant="outline">
                  <Link href="/courses">Log New Play</Link>
                </Button>
              </div>

              <div className="space-y-4">
                {recentPlays.map((play) => (
                  <Card key={play.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex">
                        <div className="w-24 h-24 shrink-0">
                          <img
                            src={play.course.image || "/placeholder.svg"}
                            alt={play.course.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4 flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium line-clamp-1">{play.course.name}</h3>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <MapPinIcon className="h-3.5 w-3.5 mr-1" />
                                <span>{play.course.location}</span>
                              </div>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                              <span>{new Date(play.date).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center mt-2">
                            <StarRating rating={play.rating} />
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/courses/${play.course.id}`}>View Course</Link>
                            </Button>
                            <Button asChild className="btn-navy" size="sm">
                              <Link href={`/courses/${play.course.id}/review`}>Write Review</Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-center">
                <Button variant="outline">View All Plays</Button>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Reviews</h2>
              </div>

              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-16 h-12 rounded overflow-hidden shrink-0">
                            <img
                              src={review.course.image || "/placeholder.svg"}
                              alt={review.course.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-medium">{review.course.name}</h3>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPinIcon className="h-3.5 w-3.5 mr-1" />
                              <span>{review.course.location}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                          <span>{new Date(review.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <StarRating rating={review.rating} />
                      </div>
                      <p className="text-sm">{review.content}</p>
                      <div className="flex justify-between items-center">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/courses/${review.course.id}`}>View Course</Link>
                        </Button>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <ThumbsUpIcon className="h-3.5 w-3.5 mr-1" />
                          <span>{review.likes} likes</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="flex justify-center">
                <Button variant="outline">View All Reviews</Button>
              </div>
            </TabsContent>

            <TabsContent value="lists" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Lists</h2>
                <Button asChild>
                  <Link href="/lists/create">Create New List</Link>
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {lists.map((list) => (
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
                        {list.preview.map((image, index) => (
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

              <div className="flex justify-center">
                <Button variant="outline">View All Lists</Button>
              </div>
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
    </div>
  )
}
