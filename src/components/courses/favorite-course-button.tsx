"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { HeartIcon } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@/contexts/user-context"
import { getFavoriteCourses, addFavoriteCourse, removeFavoriteCourse } from "@/lib/api/profiles"

interface FavoriteCourseButtonProps {
  courseId: string
  className?: string
}

export function FavoriteCourseButton({ courseId, className }: FavoriteCourseButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [favoriteCount, setFavoriteCount] = useState(0)
  const { user } = useUser()
  const { toast } = useToast()

  // Check if the course is already a favorite
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!user?.id) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const favorites = await getFavoriteCourses(user.id)
        
        // Update favorite count
        setFavoriteCount(favorites.length)
        
        // Check if this course is in favorites
        const isFav = favorites.some(fav => fav.course_id === courseId)
        setIsFavorite(isFav)
      } catch (error) {
        console.error("Error checking favorite status:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkFavoriteStatus()
  }, [user?.id, courseId])

  const toggleFavorite = async () => {
    if (!user?.id) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add favorites",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      if (isFavorite) {
        // Remove from favorites
        await removeFavoriteCourse(user.id, courseId)
        setIsFavorite(false)
        setFavoriteCount(prev => prev - 1)
        toast({
          title: "Removed from favorites",
          description: "Course removed from your favorites",
        })
      } else {
        // Check if at limit before adding
        if (favoriteCount >= 4) {
          toast({
            title: "Limit reached",
            description: "You can only have 4 favorite courses. Remove one to add another.",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }
        
        // Add to favorites
        await addFavoriteCourse(user.id, courseId)
        setIsFavorite(true)
        setFavoriteCount(prev => prev + 1)
        toast({
          title: "Added to favorites",
          description: "Course added to your favorites",
        })
      }
    } catch (error: any) {
      console.error("Error toggling favorite status:", error)
      
      // Handle specific limit error
      if (error.message && error.message.includes("up to 4 favorite")) {
        toast({
          title: "Limit reached",
          description: "You can only have 4 favorite courses. Remove one to add another.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update favorites",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Combine the class names
  const buttonClasses = `
    ${className || 'w-full'}
    ${isFavorite ? 'bg-red-500 hover:bg-red-600 text-white border-red-500' : ''}
  `.trim()

  if (!user) {
    return null // Don't show the button if user is not logged in
  }

  return (
    <Button
      variant={isFavorite ? "default" : "outline"}
      size="sm"
      onClick={toggleFavorite}
      disabled={isLoading}
      className={buttonClasses}
    >
      <HeartIcon className={`h-4 w-4 mr-2 ${isFavorite ? "fill-current" : ""}`} />
      {isFavorite ? "Favorite" : "Add to Favorites"}
    </Button>
  )
} 