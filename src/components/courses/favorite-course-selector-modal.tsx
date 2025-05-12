"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { SearchIcon, Plus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@/contexts/user-context"
import { addFavoriteCourse } from "@/lib/api/profiles"
import { supabase } from "@/lib/supabase/client"

interface Course {
  id: string
  name: string
  location: string
  province: string
}

interface FavoriteCourseSelectionProps {
  onCourseAdded?: () => void
  maxFavorites: number
  currentFavoriteCount: number
  buttonText?: string
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null | undefined
}

export function FavoriteCourseSelectionModal({ 
  onCourseAdded, 
  maxFavorites = 4,
  currentFavoriteCount = 0,
  buttonText = "Add Favorite",
  buttonVariant = "outline"
}: FavoriteCourseSelectionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const { user } = useUser()
  const { toast } = useToast()
  
  const canAddMore = currentFavoriteCount < maxFavorites

  // Mock search function - replace with actual API call
  const searchCourses = async (query: string) => {
    if (!query.trim()) return []
    
    setIsSearching(true)
    
    try {
      // This would be your actual API call
      const { data, error } = await supabase
        .from('courses')
        .select('id, name, location, province')
        .ilike('name', `%${query}%`)
        .limit(10)
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error searching courses:", error)
      return []
    } finally {
      setIsSearching(false)
    }
  }
  
  // Handle search input changes
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    
    if (query.trim().length >= 2) {
      const results = await searchCourses(query)
      setCourses(results)
    } else {
      setCourses([])
    }
  }
  
  // Add a course to favorites
  const handleAddFavorite = async (courseId: string) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to add favorite courses",
        variant: "destructive",
      })
      return
    }
    
    try {
      await addFavoriteCourse(user.id, courseId)
      
      toast({
        title: "Course added",
        description: "Course added to your favorites",
      })
      
      // Close modal and refresh parent
      setIsOpen(false)
      if (onCourseAdded) onCourseAdded()
    } catch (error: any) {
      // Check for limit exceeded error
      if (error.message && error.message.includes("up to 4 favorite")) {
        toast({
          title: "Limit reached",
          description: "You can only add up to 4 favorite courses",
          variant: "destructive",
        })
      } else {
        console.error("Error adding favorite course:", error)
        toast({
          title: "Error",
          description: "Failed to add course to favorites",
          variant: "destructive",
        })
      }
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={buttonVariant} 
          size="sm"
          disabled={!canAddMore}
        >
          <Plus className="h-4 w-4 mr-2" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add a Favorite Course</DialogTitle>
        </DialogHeader>
        
        <div className="relative flex w-full mb-4">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search for a course..."
            className="pl-9"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        
        <div className="max-h-[400px] overflow-y-auto space-y-2">
          {isSearching ? (
            <div className="py-4 text-center">
              <p className="text-sm text-muted-foreground">Searching...</p>
            </div>
          ) : courses.length > 0 ? (
            courses.map((course) => (
              <div 
                key={course.id} 
                className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50"
              >
                <div>
                  <h4 className="font-medium">{course.name}</h4>
                  <p className="text-sm text-muted-foreground">{course.location}, {course.province}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleAddFavorite(course.id)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            ))
          ) : searchQuery ? (
            <div className="py-4 text-center">
              <p className="text-sm text-muted-foreground">No courses found</p>
            </div>
          ) : (
            <div className="py-4 text-center">
              <p className="text-sm text-muted-foreground">
                Search for courses to add to your favorites
              </p>
            </div>
          )}
        </div>
          
        {!canAddMore && (
          <p className="text-sm text-destructive text-center mt-4">
            You've reached the maximum of {maxFavorites} favorite courses
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
} 