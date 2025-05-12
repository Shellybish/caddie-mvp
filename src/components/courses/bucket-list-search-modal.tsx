"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SearchIcon, BookmarkIcon } from "lucide-react"
import { getAllCourses } from "@/lib/api/courses"
import { addBucketListCourse, removeBucketListCourse, getBucketListCourses } from "@/lib/api/profiles"
import { toast } from "sonner"

interface Course {
  id: string
  name: string
  location: string
  province: string
}

interface BucketListSearchModalProps {
  userId: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onCoursesAdded: () => void
}

export function BucketListSearchModal({
  userId,
  isOpen,
  onOpenChange,
  onCoursesAdded
}: BucketListSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [bucketListCourseIds, setBucketListCourseIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch all courses and the user's bucket list when the modal opens
  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen) return

      try {
        setIsLoading(true)
        // Fetch all courses
        const allCourses = await getAllCourses()
        setCourses(allCourses)
        setFilteredCourses(allCourses)

        // Fetch user's bucket list courses
        const bucketList = await getBucketListCourses(userId)
        setBucketListCourseIds(bucketList.map(item => item.course_id))
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load courses")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [isOpen, userId])

  // Filter courses based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCourses(courses)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = courses.filter(
      course =>
        course.name.toLowerCase().includes(query) ||
        course.location.toLowerCase().includes(query) ||
        course.province.toLowerCase().includes(query)
    )
    setFilteredCourses(filtered)
  }, [searchQuery, courses])

  // Toggle a course in the bucket list
  const toggleBucketList = async (courseId: string) => {
    try {
      const isInBucketList = bucketListCourseIds.includes(courseId)

      if (isInBucketList) {
        // Remove from bucket list
        await removeBucketListCourse(userId, courseId)
        setBucketListCourseIds(prev => prev.filter(id => id !== courseId))
        toast.success("Removed from bucket list")
      } else {
        // Add to bucket list
        await addBucketListCourse(userId, courseId)
        setBucketListCourseIds(prev => [...prev, courseId])
        toast.success("Added to bucket list")
      }

      // Notify parent component that courses have been updated
      onCoursesAdded()
    } catch (error) {
      console.error("Error toggling bucket list:", error)
      toast.error("Failed to update bucket list")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Courses to Bucket List</DialogTitle>
        </DialogHeader>

        <div className="relative flex w-full mb-4">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="max-h-[400px] overflow-y-auto space-y-2">
          {isLoading ? (
            <div className="py-4 text-center">
              <p className="text-sm text-muted-foreground">Loading courses...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="py-4 text-center">
              <p className="text-sm text-muted-foreground">No courses found</p>
            </div>
          ) : (
            filteredCourses.map((course) => (
              <div 
                key={course.id} 
                className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50"
              >
                <div>
                  <h4 className="font-medium">{course.name}</h4>
                  <p className="text-sm text-muted-foreground">{course.location}, {course.province}</p>
                </div>
                <Button
                  variant={bucketListCourseIds.includes(course.id) ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => toggleBucketList(course.id)}
                >
                  <BookmarkIcon 
                    className={`h-4 w-4 mr-2 ${bucketListCourseIds.includes(course.id) ? "fill-current" : ""}`} 
                  />
                  {bucketListCourseIds.includes(course.id) ? "Added" : "Add"}
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 