"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { HeartIcon } from "lucide-react"
import { addFavoriteCourse, removeFavoriteCourse, getFavoriteCourses } from "@/lib/api/profiles"
import { toast } from "sonner"

interface AddToFavoritesProps {
  courseId: string
  userId: string
}

export function AddToFavorites({ courseId, userId }: AddToFavoritesProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check if the course is already in favorites
  useEffect(() => {
    const checkIfFavorite = async () => {
      try {
        setIsLoading(true)
        const favorites = await getFavoriteCourses(userId)
        const isAlreadyFavorite = favorites.some(fav => fav.course_id === courseId)
        setIsFavorite(isAlreadyFavorite)
      } catch (error) {
        console.error("Error checking favorite status:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkIfFavorite()
  }, [courseId, userId])

  const toggleFavorite = async () => {
    try {
      setIsLoading(true)
      
      if (isFavorite) {
        // Remove from favorites
        await removeFavoriteCourse(userId, courseId)
        toast.success("Removed from favorites")
      } else {
        // Add to favorites
        await addFavoriteCourse(userId, courseId)
        toast.success("Added to favorites")
      }
      
      // Toggle state
      setIsFavorite(!isFavorite)
    } catch (error) {
      console.error("Error toggling favorite:", error)
      toast.error("Failed to update favorites")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={isFavorite ? "secondary" : "outline"}
      size="sm"
      onClick={toggleFavorite}
      disabled={isLoading}
      className="gap-1 text-sm bg-white/10 hover:bg-white/20 text-white border-white/20"
    >
      <HeartIcon className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
      {isFavorite ? "Favorited" : "Add to Favorites"}
    </Button>
  )
} 