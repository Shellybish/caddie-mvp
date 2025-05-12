"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ThumbsUpIcon } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@/contexts/user-context"
import { likeReview } from "@/lib/api/courses"

interface LikeButtonProps {
  reviewId: string
  initialLikesCount: number
  initialLiked?: boolean
}

export function LikeButton({ reviewId, initialLikesCount = 0, initialLiked = false }: LikeButtonProps) {
  const { user } = useUser()
  const { toast } = useToast()
  const [isLiked, setIsLiked] = useState(initialLiked)
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [isLoading, setIsLoading] = useState(false)

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to like reviews",
        variant: "destructive"
      })
      return
    }

    try {
      setIsLoading(true)
      const result = await likeReview(reviewId, user.id)
      
      if (result.liked) {
        setLikesCount(prev => prev + 1)
        setIsLiked(true)
      } else {
        setLikesCount(prev => Math.max(0, prev - 1))
        setIsLiked(false)
      }
    } catch (error) {
      console.error("Error liking review:", error)
      toast({
        title: "Error",
        description: "There was a problem processing your request",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className={`text-muted-foreground ${isLiked ? 'text-primary' : ''}`}
      onClick={handleLike}
      disabled={isLoading}
    >
      <ThumbsUpIcon className={`h-4 w-4 mr-1 ${isLiked ? 'fill-primary' : ''}`} />
      {likesCount}
    </Button>
  )
} 