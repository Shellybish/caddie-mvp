"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { BookmarkIcon } from "lucide-react"
import { addBucketListCourse, removeBucketListCourse, getBucketListCourses } from "@/lib/api/profiles"
import { toast } from "sonner"

interface AddToBucketListProps {
  courseId: string
  userId: string
}

export function AddToBucketList({ courseId, userId }: AddToBucketListProps) {
  const [isInBucketList, setIsInBucketList] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check if the course is already in bucket list
  useEffect(() => {
    const checkIfInBucketList = async () => {
      try {
        setIsLoading(true)
        const bucketList = await getBucketListCourses(userId)
        const isAlreadyInList = bucketList.some(item => item.course_id === courseId)
        setIsInBucketList(isAlreadyInList)
      } catch (error) {
        console.error("Error checking bucket list status:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkIfInBucketList()
  }, [courseId, userId])

  const toggleBucketList = async () => {
    try {
      setIsLoading(true)
      
      if (isInBucketList) {
        // Remove from bucket list
        await removeBucketListCourse(userId, courseId)
        toast.success("Removed from bucket list")
      } else {
        // Add to bucket list
        await addBucketListCourse(userId, courseId)
        toast.success("Added to bucket list")
      }
      
      // Toggle state
      setIsInBucketList(!isInBucketList)
    } catch (error) {
      console.error("Error toggling bucket list:", error)
      toast.error("Failed to update bucket list")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={isInBucketList ? "secondary" : "outline"}
      size="sm"
      onClick={toggleBucketList}
      disabled={isLoading}
      className="gap-1 text-sm bg-white/10 hover:bg-white/20 text-white border-white/20"
    >
      <BookmarkIcon className={`h-4 w-4 ${isInBucketList ? "fill-current" : ""}`} />
      {isInBucketList ? "In Bucket List" : "Add to Bucket List"}
    </Button>
  )
} 