"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Plus } from "lucide-react"
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a Favorite Course</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for a course..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-8"
            />
          </div>
          
          <ScrollArea className="h-[300px] rounded-md border">
            {isSearching ? (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Searching...</p>
              </div>
            ) : courses.length > 0 ? (
              <div className="p-4 space-y-2">
                {courses.map((course) => (
                  <Card key={course.id} className="p-3 hover:bg-accent">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{course.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {course.location}, {course.province}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleAddFavorite(course.id)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : searchQuery ? (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground">No courses found</p>
              </div>
            ) : (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Search for courses to add to your favorites
                </p>
              </div>
            )}
          </ScrollArea>
          
          {!canAddMore && (
            <p className="text-sm text-destructive text-center">
              You've reached the maximum of {maxFavorites} favorite courses
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 