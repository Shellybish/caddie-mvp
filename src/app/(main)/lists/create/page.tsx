"use client"

import type React from "react"

import { useState } from "react"
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

export default function CreateListPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedCourses, setSelectedCourses] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
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

  // Mock search results
  const searchResults = [
    {
      id: "1",
      name: "Fancourt Links",
      location: "George, Western Cape",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: "2",
      name: "Arabella Golf Club",
      location: "Hermanus, Western Cape",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: "3",
      name: "Pearl Valley Golf Estate",
      location: "Paarl, Western Cape",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: "4",
      name: "Royal Johannesburg & Kensington Golf Club",
      location: "Johannesburg, Gauteng",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: "5",
      name: "Durban Country Club",
      location: "Durban, KwaZulu-Natal",
      image: "/placeholder.svg?height=100&width=100",
    },
  ].filter(
    (course) =>
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.location.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isPublic: checked }))
  }

  const handleAddCourse = (course: any) => {
    if (!selectedCourses.some((c) => c.id === course.id)) {
      setSelectedCourses([...selectedCourses, course])
    }
  }

  const handleRemoveCourse = (courseId: string) => {
    setSelectedCourses(selectedCourses.filter((course) => course.id !== courseId))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "List created successfully",
        description: "Your new list has been created.",
      })
      router.push("/lists")
    }, 1500)
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

              <div className="border rounded-md p-4">
                <h4 className="text-sm font-medium mb-2">Search Results</h4>
                {searchResults.length > 0 ? (
                  <div className="space-y-2">
                    {searchResults.map((course) => (
                      <div key={course.id} className="flex items-center justify-between p-2 hover:bg-muted rounded-md">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded overflow-hidden">
                            <img
                              src={course.image || "/placeholder.svg"}
                              alt={course.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{course.name}</p>
                            <p className="text-xs text-muted-foreground">{course.location}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAddCourse(course)}
                          disabled={selectedCourses.some((c) => c.id === course.id)}
                        >
                          <PlusIcon className="h-4 w-4" />
                          <span className="sr-only">Add course</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No courses found. Try a different search term.</p>
                )}
              </div>

              <div className="border rounded-md p-4">
                <h4 className="text-sm font-medium mb-2">Selected Courses ({selectedCourses.length})</h4>
                {selectedCourses.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No courses selected yet</p>
                ) : (
                  <div className="space-y-2">
                    {selectedCourses.map((course, index) => (
                      <div key={course.id} className="flex items-center justify-between p-2 hover:bg-muted rounded-md">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </div>
                          <div className="w-12 h-12 rounded overflow-hidden">
                            <img
                              src={course.image || "/placeholder.svg"}
                              alt={course.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{course.name}</p>
                            <p className="text-xs text-muted-foreground">{course.location}</p>
                          </div>
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveCourse(course.id)}>
                          <Trash2Icon className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Remove course</span>
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
