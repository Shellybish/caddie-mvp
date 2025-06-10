"use client"

import { useState } from "react"
import { HeartIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUser } from "@/contexts/user-context"
import { likeList, unlikeList } from "@/lib/api/profiles"
import { useToast } from "@/components/ui/use-toast"

interface ListLikeButtonProps {
  listId: string
  initialLiked: boolean
  initialLikesCount: number
}

export function ListLikeButton({ listId, initialLiked = false, initialLikesCount = 0 }: ListLikeButtonProps) {
  const { user } = useUser()
  const { toast } = useToast()
  const [isLiked, setIsLiked] = useState(initialLiked)
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [isLoading, setIsLoading] = useState(false)

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to like lists.",
        variant: "destructive",
      })
      return
    }

    if (isLoading) return

    setIsLoading(true)
    
    try {
      if (isLiked) {
        await unlikeList(user.id, listId)
        setIsLiked(false)
        setLikesCount(prev => Math.max(0, prev - 1))
        toast({
          title: "List unliked",
          description: "You have removed your like from this list.",
        })
      } else {
        await likeList(user.id, listId)
        setIsLiked(true)
        setLikesCount(prev => prev + 1)
        toast({
          title: "List liked",
          description: "You have liked this list.",
        })
      }
    } catch (error) {
      console.error("Error toggling list like:", error)
      
      // Check if it's a database table not found error
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('list_likes') && errorMessage.includes('does not exist')) {
        toast({
          title: "Feature not available",
          description: "List likes feature is not yet available. Please run the database migration.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update like status. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      disabled={isLoading}
      className="flex items-center gap-2 text-muted-foreground hover:text-red-500 transition-colors"
    >
      <HeartIcon 
        className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} 
      />
      {likesCount}
    </Button>
  )
} 