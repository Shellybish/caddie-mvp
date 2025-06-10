"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getPublicLists, getListLikesCount, hasUserLikedList } from "@/lib/api/profiles"
import { ListLikeButton } from "./ListLikeButton"
import { useUser } from "@/contexts/user-context"

interface PopularList {
  id: string;
  title: string;
  description?: string;
  author: {
    name: string;
  };
  courseCount: number;
  likesCount: number;
  userHasLiked: boolean;
}

export function PopularListsSection() {
  const { user } = useUser()
  const [popularLists, setPopularLists] = useState<PopularList[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchPopularLists() {
      try {
        setIsLoading(true)
        
        // Fetch public lists (limit to 3 for the home page)
        const lists = await getPublicLists(3, 0)
        
        if (!lists || lists.length === 0) {
          setPopularLists([])
          return
        }

        // Add like data to each list
        const listsWithLikes = await Promise.all(
          lists.map(async (list: any) => {
            const [likesCount, userHasLiked] = await Promise.all([
              getListLikesCount(list.id),
              user ? hasUserLikedList(user.id, list.id) : Promise.resolve(false)
            ])

            return {
              id: list.id,
              title: list.title,
              description: list.description,
              author: {
                name: list.profiles?.full_name || list.profiles?.username || 'Anonymous'
              },
              courseCount: list.list_courses?.length || 0,
              likesCount,
              userHasLiked
            }
          })
        )

        setPopularLists(listsWithLikes)
      } catch (error) {
        console.error("Error fetching popular lists:", error)
        setPopularLists([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchPopularLists()
  }, [user])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <div className="space-y-2 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
              <div className="h-8 bg-muted rounded w-full"></div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (popularLists.length === 0) {
    return (
      <div className="space-y-4">
        <Card className="p-4">
          <div className="text-center py-4">
            <p className="text-muted-foreground">No public lists available yet.</p>
            <p className="text-sm text-muted-foreground">Be the first to create a public list!</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {popularLists.map((list) => (
        <Card key={list.id} className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <h4 className="font-medium">{list.title}</h4>
              <ListLikeButton
                listId={list.id}
                initialLiked={list.userHasLiked}
                initialLikesCount={list.likesCount}
              />
            </div>
            <div className="flex justify-between items-center text-sm">
              <p className="text-muted-foreground">By {list.author.name}</p>
              <p className="text-muted-foreground">{list.courseCount} courses</p>
            </div>
            <Button asChild variant="outline" size="sm" className="w-full mt-2">
              <Link href={`/lists/${list.id}`}>View List</Link>
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
} 