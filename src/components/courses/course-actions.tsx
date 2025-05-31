"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { StarRating } from "@/components/common/star-rating"
import { 
  CalendarIcon, 
  ListIcon, 
  Share2Icon, 
  ThumbsUpIcon,
  HeartIcon,
  CheckIcon,
  BookmarkIcon
} from "lucide-react"
import { FavoriteCourseButton } from "@/components/courses/favorite-course-button"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@/contexts/user-context"
import { logRound } from "@/lib/api/client"
import { hasUserPlayedCourse, markCourseAsPlayed } from "@/lib/api/courses"
import { addBucketListCourse, removeBucketListCourse, getBucketListCourses } from "@/lib/api/profiles"

interface CourseActionsProps {
  courseId: string
  courseName: string
}

export function CourseActions({ courseId, courseName }: CourseActionsProps) {
  const [isSubmittingRating, setIsSubmittingRating] = useState(false)
  const [hasPlayed, setHasPlayed] = useState(false)
  const [isInBucketList, setIsInBucketList] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { user } = useUser()

  // Check played and bucket list status on component mount
  useEffect(() => {
    const checkStatuses = async () => {
      if (!user?.id) {
        setIsLoading(false)
        return
      }

      try {
        // Check if user has played this course
        const playedStatus = await hasUserPlayedCourse(user.id, courseId)
        setHasPlayed(playedStatus)

        // Check if course is in bucket list
        const bucketList = await getBucketListCourses(user.id)
        const inBucketList = bucketList.some(item => item.course_id === courseId)
        setIsInBucketList(inBucketList)
      } catch (error) {
        console.error("Error checking course statuses:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkStatuses()
  }, [user?.id, courseId])

  const handleRatingSubmit = async (rating: number) => {
    if (rating === 0) return
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to rate courses."
      })
      return
    }

    setIsSubmittingRating(true)
    
    try {
      // Log a play with the rating - use today's date
      await logRound(courseId, {
        date: new Date(),
        rating: rating
      })
      
      // Update played status
      setHasPlayed(true)
      
      toast({
        title: "Rating submitted!",
        description: `You've rated ${courseName} ${rating} stars and logged a play.`,
      })
    } catch (error) {
      console.error("Error submitting rating:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit your rating. Please try again."
      })
    } finally {
      setIsSubmittingRating(false)
    }
  }

  const handlePlayedClick = async () => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to mark courses as played."
      })
      return
    }

    try {
      if (!hasPlayed) {
        await markCourseAsPlayed(user.id, courseId)
        setHasPlayed(true)
        toast({
          title: "Course marked as played!",
          description: `You've marked ${courseName} as played.`,
        })
      }
    } catch (error) {
      console.error("Error marking course as played:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to mark course as played. Please try again."
      })
    }
  }

  const handleBucketListClick = async () => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to manage your bucket list."
      })
      return
    }

    try {
      if (isInBucketList) {
        await removeBucketListCourse(user.id, courseId)
        setIsInBucketList(false)
        toast({
          title: "Removed from bucket list",
          description: `${courseName} has been removed from your bucket list.`,
        })
      } else {
        await addBucketListCourse(user.id, courseId)
        setIsInBucketList(true)
        toast({
          title: "Added to bucket list!",
          description: `${courseName} has been added to your bucket list.`,
        })
      }
    } catch (error) {
      console.error("Error updating bucket list:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update bucket list. Please try again."
      })
    }
  }

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-6 space-y-6">
        {/* Quick Actions - Played, Like, Bucket List */}
        <div className="flex justify-center space-x-8">
          <button 
            className={`flex flex-col items-center space-y-2 transition-colors ${
              hasPlayed 
                ? "text-green-600" 
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={handlePlayedClick}
            disabled={isLoading}
          >
            <CheckIcon className="h-6 w-6" />
            <span className="text-sm font-medium">
              {hasPlayed ? "Played" : "Mark Played"}
            </span>
          </button>
          
          <button className="flex flex-col items-center space-y-2 text-muted-foreground hover:text-foreground transition-colors">
            <HeartIcon className="h-6 w-6" />
            <span className="text-sm font-medium">Like</span>
          </button>
          
          <button 
            className={`flex flex-col items-center space-y-2 transition-colors ${
              isInBucketList 
                ? "text-blue-600" 
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={handleBucketListClick}
            disabled={isLoading}
          >
            <BookmarkIcon className={`h-6 w-6 ${isInBucketList ? "fill-current" : ""}`} />
            <span className="text-sm font-medium">
              {isInBucketList ? "In Bucket List" : "Bucket List"}
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="border-t border-border"></div>

        {/* Rate Section */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-center">Rate</h3>
          <div className="flex justify-center py-2">
            <StarRating
              rating={0}
              size="large"
              interactive={true}
              onChange={handleRatingSubmit}
              className="text-yellow-500"
            />
          </div>
          {isSubmittingRating && (
            <p className="text-sm text-muted-foreground text-center">
              Submitting rating...
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Separate card for actions to match the inspiration layout
export function CourseActionsButtons({ courseId }: { courseId: string }) {
  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Actions</h3>
        </div>
        <div className="grid gap-2">
          <Button asChild className="w-full bg-green-700 hover:bg-green-800">
            <Link href={`/courses/${courseId}/log`}>
              <CalendarIcon className="h-4 w-4 mr-2" />
              Log Play
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href={`/courses/${courseId}/review`}>
              <ThumbsUpIcon className="h-4 w-4 mr-2" />
              Write Review
            </Link>
          </Button>
          <FavoriteCourseButton courseId={courseId} />
          <Button asChild variant="outline" className="w-full">
            <Link href={`/courses/${courseId}/add-to-list`}>
              <ListIcon className="h-4 w-4 mr-2" />
              Add to List
            </Link>
          </Button>
          <Button variant="ghost" className="w-full">
            <Share2Icon className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 