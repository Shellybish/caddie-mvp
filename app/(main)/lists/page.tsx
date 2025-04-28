"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ListIcon, PlusIcon, SearchIcon, ThumbsUpIcon } from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { useState } from "react"

export default function ListsPage() {
  const { user } = useUser()
  const [searchQuery, setSearchQuery] = useState("")

  // Mock data for user's lists
  const userLists = user
    ? [
        {
          id: "user1",
          title: "My Favorite Courses",
          description: "A collection of my personal favorite courses that I've played in South Africa.",
          author: {
            name: user.name,
            image: user.image || "/placeholder.svg?height=40&width=40",
          },
          courseCount: 5,
          likes: 8,
          preview: [
            "/placeholder.svg?height=100&width=100",
            "/placeholder.svg?height=100&width=100",
            "/placeholder.svg?height=100&width=100",
          ],
        },
        {
          id: "user2",
          title: "Courses I Want to Play",
          description: "My personal bucket list of courses I'm planning to play in the future.",
          author: {
            name: user.name,
            image: user.image || "/placeholder.svg?height=40&width=40",
          },
          courseCount: 7,
          likes: 3,
          preview: [
            "/placeholder.svg?height=100&width=100",
            "/placeholder.svg?height=100&width=100",
            "/placeholder.svg?height=100&width=100",
          ],
        },
      ]
    : []

  // Mock data for public lists
  const publicLists = [
    {
      id: "1",
      title: "Top 10 Courses in Western Cape",
      description:
        "The most beautiful and challenging courses in the Western Cape region, featuring stunning coastal and mountain views.",
      author: {
        name: "Golf Enthusiast",
        image: "/placeholder.svg?height=40&width=40",
      },
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
      title: "Best Value Courses in Gauteng",
      description:
        "Great golf experiences that won't break the bank. These courses offer excellent conditions and layouts at reasonable green fees.",
      author: {
        name: "Budget Golfer",
        image: "/placeholder.svg?height=40&width=40",
      },
      courseCount: 8,
      likes: 18,
      preview: [
        "/placeholder.svg?height=100&width=100",
        "/placeholder.svg?height=100&width=100",
        "/placeholder.svg?height=100&width=100",
      ],
    },
    {
      id: "3",
      title: "Must-Play Coastal Courses",
      description:
        "Spectacular seaside courses with ocean views and challenging winds. A bucket list for any serious golfer visiting South Africa.",
      author: {
        name: "Ocean Lover",
        image: "/placeholder.svg?height=40&width=40",
      },
      courseCount: 12,
      likes: 32,
      preview: [
        "/placeholder.svg?height=100&width=100",
        "/placeholder.svg?height=100&width=100",
        "/placeholder.svg?height=100&width=100",
      ],
    },
    {
      id: "4",
      title: "Hidden Gems of KwaZulu-Natal",
      description:
        "Lesser-known but exceptional courses in KZN that deserve more recognition. Avoid the crowds and discover these treasures.",
      author: {
        name: "Local Expert",
        image: "/placeholder.svg?height=40&width=40",
      },
      courseCount: 7,
      likes: 15,
      preview: [
        "/placeholder.svg?height=100&width=100",
        "/placeholder.svg?height=100&width=100",
        "/placeholder.svg?height=100&width=100",
      ],
    },
  ]

  // Filter lists based on search query
  const filteredUserLists = userLists.filter(
    (list) =>
      list.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      list.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredPublicLists = publicLists.filter(
    (list) =>
      list.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      list.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Render a list card
  const renderListCard = (list: any) => (
    <Card key={list.id} className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-lg">{list.title}</h3>
              <div className="flex items-center text-sm text-muted-foreground gap-2">
                <div className="flex items-center">
                  <Avatar className="h-5 w-5 mr-1">
                    <AvatarImage src={list.author.image || "/placeholder.svg"} alt={list.author.name} />
                    <AvatarFallback>{list.author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  {list.author.name}
                </div>
                <span>•</span>
                <div className="flex items-center">
                  <ListIcon className="h-3.5 w-3.5 mr-1" />
                  {list.courseCount} courses
                </div>
              </div>
            </div>
            <div className="flex items-center text-muted-foreground">
              <ThumbsUpIcon className="h-4 w-4 mr-1" />
              {list.likes}
            </div>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{list.description}</p>
          <div className="flex gap-2 pt-1">
            {list.preview.map((image: string, index: number) => (
              <div key={index} className="w-20 h-14 rounded overflow-hidden">
                <img
                  src={image || "/placeholder.svg"}
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
  )

  return (
    <div className="container py-8 md:py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Course Lists</h1>
          <p className="text-muted-foreground">Discover and create collections of golf courses</p>
        </div>
        <div className="w-full md:w-auto flex gap-2">
          <div className="relative flex-1 md:w-[300px]">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search lists..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button asChild>
            <Link href="/lists/create">
              <PlusIcon className="h-4 w-4 mr-2" />
              Create List
            </Link>
          </Button>
        </div>
      </div>

      {/* User's Lists Section */}
      {user && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Your Lists</h2>
            <Button asChild variant="outline" size="sm">
              <Link href="/lists/create">
                <PlusIcon className="h-4 w-4 mr-2" />
                New List
              </Link>
            </Button>
          </div>

          {filteredUserLists.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6 mb-10">{filteredUserLists.map(renderListCard)}</div>
          ) : (
            <Card className="mb-10">
              <CardContent className="p-6 text-center">
                <h3 className="font-medium mb-2">You haven't created any lists yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first list to organize courses you love or want to play
                </p>
                <Button asChild>
                  <Link href="/lists/create">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create Your First List
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Public Lists Section */}
      <div className="mb-4">
        <h2 className="text-xl font-bold">Public Lists</h2>
      </div>

      {filteredPublicLists.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">{filteredPublicLists.map(renderListCard)}</div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No public lists match your search</p>
          </CardContent>
        </Card>
      )}

      {filteredPublicLists.length > 0 && (
        <div className="flex justify-center mt-8">
          <Button variant="outline">Load More</Button>
        </div>
      )}
    </div>
  )
}
