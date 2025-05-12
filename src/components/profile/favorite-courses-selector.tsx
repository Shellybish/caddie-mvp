"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core"
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { X, GripVertical, Plus } from "lucide-react"
import { getFavoriteCourses, updateFavoriteCoursePositions, addFavoriteCourse, removeFavoriteCourse } from "@/lib/api/profiles"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { FavoriteCourseSelectionModal } from "@/components/courses/favorite-course-selector-modal"

interface Course {
  id: string
  name: string
  location: string
  province: string
}

interface FavoriteCourse {
  id: string
  course_id: string
  position: number
  courses: {
    id: string
    name: string
    location: string
    province: string
  }
}

interface CourseItemProps {
  course: FavoriteCourse
  onRemove: (id: string) => void
}

// Sortable item component
const SortableCourseItem = ({ course, onRemove }: CourseItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: course.course_id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="flex items-center justify-between p-3 mb-2 bg-secondary/50 rounded-md"
    >
      <div className="flex items-center gap-3">
        <div {...attributes} {...listeners} className="cursor-grab">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium">{course.courses.name}</p>
          <p className="text-sm text-muted-foreground">{course.courses.location}</p>
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={() => onRemove(course.course_id)}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

interface FavoriteCoursesProps {
  userId: string
}

export function FavoriteCourseSelector({ userId }: FavoriteCoursesProps) {
  const [favoriteCourses, setFavoriteCourses] = useState<FavoriteCourse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Fetch favorite courses
  const loadFavoriteCourses = async () => {
    if (!userId) return
    
    try {
      setIsLoading(true)
      const courses = await getFavoriteCourses(userId)
      // Ensure the correct type for the courses
      setFavoriteCourses(courses as unknown as FavoriteCourse[])
    } catch (error) {
      console.error("Error loading favorite courses:", error)
      toast({
        title: "Error",
        description: "Failed to load favorite courses",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  useEffect(() => {
    loadFavoriteCourses()
  }, [userId, toast])

  // Handle drag end event for reordering
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      setFavoriteCourses((items) => {
        const oldIndex = items.findIndex(item => item.course_id === active.id)
        const newIndex = items.findIndex(item => item.course_id === over.id)
        
        const newItems = arrayMove(items, oldIndex, newIndex)
        
        // Update positions in the database
        const courseIds = newItems.map(item => item.course_id)
        updateFavoriteCoursePositions(userId, courseIds).catch(error => {
          console.error("Error updating positions:", error)
          toast({
            title: "Error",
            description: "Failed to update course order",
            variant: "destructive",
          })
        })
        
        return newItems
      })
    }
  }

  // Remove a course from favorites
  const removeCourse = async (courseId: string) => {
    try {
      await removeFavoriteCourse(userId, courseId)
      setFavoriteCourses(prev => prev.filter(item => item.course_id !== courseId))
      toast({
        title: "Course removed",
        description: "Course removed from favorites",
      })
    } catch (error) {
      console.error("Error removing course:", error)
      toast({
        title: "Error",
        description: "Failed to remove course",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Favorite Courses</h3>
          <p className="text-sm text-muted-foreground">
            Select up to 4 of your favorite courses
          </p>
        </div>
        {favoriteCourses.length < 4 && (
          <FavoriteCourseSelectionModal 
            onCourseAdded={loadFavoriteCourses}
            maxFavorites={4}
            currentFavoriteCount={favoriteCourses.length}
          />
        )}
      </div>
      
      <Separator />
      
      {isLoading ? (
        <div className="py-4 text-center">
          <p className="text-muted-foreground">Loading courses...</p>
        </div>
      ) : favoriteCourses.length > 0 ? (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={favoriteCourses.map(course => course.course_id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {favoriteCourses.map((course) => (
                <SortableCourseItem 
                  key={course.course_id} 
                  course={course} 
                  onRemove={removeCourse} 
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">
              You haven't added any favorite courses yet.
            </p>
            <FavoriteCourseSelectionModal 
              onCourseAdded={loadFavoriteCourses}
              maxFavorites={4}
              currentFavoriteCount={0}
              buttonText="Find Courses"
              buttonVariant="default"
            />
          </CardContent>
        </Card>
      )}
      
      {favoriteCourses.length > 0 && favoriteCourses.length < 4 && (
        <p className="text-sm text-muted-foreground mt-4">
          {4 - favoriteCourses.length} spot{favoriteCourses.length === 3 ? '' : 's'} remaining
        </p>
      )}
    </div>
  )
} 