"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { StarRating } from "@/components/common/star-rating"
import { CalendarIcon, ChevronLeftIcon } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { fetchCourse, logRound } from "@/lib/api/client"

export default function LogPlayPage({ params }: { params: { id: string } }) {
  const courseId = params.id
  const router = useRouter()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [rating, setRating] = useState(0)
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [course, setCourse] = useState({ id: "", name: "Loading...", location: "", province: "", created_at: "" })
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const [error, setError] = useState("")
  
  // Fetch the actual course data
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const courseData = await fetchCourse(courseId)
        setCourse(courseData)
      } catch (error) {
        console.error("Error fetching course:", error)
        // Set fallback course data
        setCourse({
          id: courseId,
          name: "Course Not Found",
          location: "Unknown Location",
          province: "Unknown Province",
          created_at: new Date().toISOString()
        })
      }
    }

    fetchCourseData()
  }, [courseId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!date) {
      setError("Please select a date")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const result = await logRound(courseId, {
        date: date.toISOString().split('T')[0], // Convert Date to string format
        rating: rating || 0,
        notes
      })

      // Redirect to course page on success
      router.push(`/courses/${courseId}`)
    } catch (error) {
      console.error("Error logging round:", error)
      setError("Failed to log round. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container max-w-2xl py-8 md:py-12">
      <Link
        href={`/courses/${courseId}`}
        className="flex items-center text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeftIcon className="h-4 w-4 mr-1" />
        Back to course
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Log a Round</CardTitle>
          <CardDescription>
            {isLoading ? "Loading..." : `Record your play at ${course.name}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="date">Date Played</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(day) => setDate(day)}
                    initialFocus
                    disabled={(date) => date > new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Your Rating</Label>
              <div className="py-2">
                <StarRating rating={rating} size="large" interactive={true} onChange={setRating} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea 
                id="notes" 
                placeholder="Share your thoughts about the round..." 
                className="min-h-[100px]"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button type="submit" disabled={!date || isSubmitting || isLoading} className="flex-1">
                {isSubmitting ? "Submitting..." : "Log Round"}
              </Button>
              <Button type="button" variant="outline" asChild className="flex-1">
                <Link href={`/courses/${courseId}/review`}>Write a Full Review</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
