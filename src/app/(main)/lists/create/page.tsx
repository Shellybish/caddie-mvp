"use client"

import type { ChangeEvent, FormEvent } from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ChevronLeftIcon, PlusIcon, SearchIcon, Trash2Icon } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@/contexts/user-context"
import { getAllCourses } from "@/lib/api/courses"
import { createList, addCourseToList } from "@/lib/api/profiles"

interface Course {
  id: string
  name: string
  location: string
  province: string
  [key: string]: any
}

export default function CreateListPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [allCourses, setAllCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isPublic: true,
  })
  const { toast } = useToast()
  const router = useRouter()
  const { user } = useUser()

  // If no user is logged in, redirect to login
  if (typeof window !== "undefined" && !user) {
    router.push("/login")
  }

  // Fetch all courses on component mount
  useEffect(() => {
    async function fetchCourses() {
      setIsLoading(true)
      try {
        const courses = await getAllCourses()
        setAllCourses(courses)
        setFilteredCourses(courses)
      } catch (error) {
        console.error("Error fetching courses:", error)
        toast({
          title: "Error loading courses",
          description: "There was a problem fetching courses. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourses()
  }, [toast])

  // Filter courses based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCourses(allCourses)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = allCourses.filter(
      course =>
        course.name.toLowerCase().includes(query) ||
        course.location.toLowerCase().includes(query) ||
        course.province.toLowerCase().includes(query)
    )
    setFilteredCourses(filtered)
  }, [searchQuery, allCourses])

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isPublic: checked }))
  }

  const handleAddCourse = (course: Course) => {
    if (!selectedCourses.some((c) => c.id === course.id)) {
      setSelectedCourses([...selectedCourses, course])
    }
  }

  const handleRemoveCourse = (courseId: string) => {
    setSelectedCourses(selectedCourses.filter((course) => course.id !== courseId))
  }

  const isInSelectedCourses = (courseId: string) => {
    return selectedCourses.some(course => course.id === courseId)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Make sure user is logged in
      if (!user) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to create a list.",
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      // Create the list
      const newList = await createList(
        user.id,
        formData.title,
        formData.description,
        formData.isPublic
      )

      // Add courses to the list
      const addCoursesPromises = selectedCourses.map((course, index) => 
        addCourseToList(newList.id, course.id, index + 1)
      )
      
      await Promise.all(addCoursesPromises)

      toast({
        title: "List created successfully",
        description: "Your new list has been created.",
      })
      
      router.push("/lists")
    } catch (error) {
      console.error("Error creating list:", error)
      toast({
        title: "Error creating list",
        description: "There was a problem creating your list. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container max-w-3xl py-8 md:py-12">
      <Link href="/lists" className="flex items-center text-muted-foreground hover:text-foreground mb-6">
        <ChevronLeftIcon className="h-4 w-4 mr-1" />
        Back to lists
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Create a New List</CardTitle>
          <CardDescription>Curate and share your own collection of golf courses</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">List Title</Label>
              <Input
                id="title"
                placeholder="e.g., My Favorite Courses in Gauteng"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what makes this collection special..."
                className="min-h-[100px]"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label>Privacy</Label>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-medium">Public List</h4>
                  <p className="text-sm text-muted-foreground">Anyone can view this list</p>
                </div>
                <Switch checked={formData.isPublic} onCheckedChange={handleSwitchChange} />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Add Courses</Label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search for courses to add..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="border rounded-md p-4 max-h-[400px] overflow-y-auto">
                <h4 className="text-sm font-medium mb-2">Search Results</h4>
                {isLoading ? (
                  <div className="py-4 text-center">
                    <p className="text-sm text-muted-foreground">Loading courses...</p>
                  </div>
                ) : filteredCourses.length === 0 ? (
                  <div className="py-4 text-center">
                    <p className="text-sm text-muted-foreground">No courses found</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredCourses.map((course) => (
                      <div key={course.id} className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50">
                        <div>
                          <h4 className="font-medium">{course.name}</h4>
                          <p className="text-sm text-muted-foreground">{course.location}, {course.province}</p>
                        </div>
                        <Button
                          type="button"
                          variant={isInSelectedCourses(course.id) ? "secondary" : "outline"}
                          size="sm"
                          onClick={() => isInSelectedCourses(course.id) 
                            ? handleRemoveCourse(course.id) 
                            : handleAddCourse(course)
                          }
                        >
                          {isInSelectedCourses(course.id) ? (
                            <>
                              <Trash2Icon className="h-4 w-4 mr-2" />
                              Remove
                            </>
                          ) : (
                            <>
                              <PlusIcon className="h-4 w-4 mr-2" />
                              Add
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border rounded-md p-4">
                <h4 className="text-sm font-medium mb-2">Selected Courses ({selectedCourses.length})</h4>
                {selectedCourses.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No courses selected yet</p>
                ) : (
                  <div className="space-y-2">
                    {selectedCourses.map((course, index) => (
                      <div key={course.id} className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-medium">{course.name}</h4>
                            <p className="text-sm text-muted-foreground">{course.location}, {course.province}</p>
                          </div>
                        </div>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleRemoveCourse(course.id)}
                        >
                          <Trash2Icon className="h-4 w-4 mr-2 text-destructive" />
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                type="submit"
                disabled={selectedCourses.length === 0 || !formData.title || isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? "Creating..." : "Create List"}
              </Button>
              <Button type="button" variant="outline" asChild className="flex-1">
                <Link href="/lists">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
