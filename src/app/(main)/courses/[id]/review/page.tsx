"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { StarRating } from "@/components/common/star-rating"
import { ChevronLeftIcon } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { fetchCourseById, submitReview } from "@/lib/api/client"

export default function ReviewPage({ params }: { params: { id: string } }) {
  const courseId = params.id
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [course, setCourse] = useState({ id: "", name: "Loading...", location: "" })
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Fetch the actual course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        console.log(`Fetching course data for ID: ${courseId}`)
        setIsLoading(true)
        const courseData = await fetchCourseById(courseId)
        console.log("Received course data:", courseData)
        setCourse({
          id: courseData.id,
          name: courseData.name,
          location: courseData.location
        })
      } catch (error) {
        console.error("Error fetching course:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load course information."
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchCourse()
  }, [courseId, toast])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (rating === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide a rating."
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      console.log(`Submitting review for course ID: ${courseId}`)
      const result = await submitReview(courseId, {
        rating: rating,
        review_text: reviewText
      })
      
      console.log("Review submission result:", result)
      
      toast({
        title: "Review submitted successfully",
        description: `Your review for ${course.name} has been posted.`,
      })
      
      // Redirect back to course page
      router.push(`/courses/${courseId}`)
    } catch (error) {
      console.error("Error submitting review:", error)
      toast({
        variant: "destructive", 
        title: "Error",
        description: "Failed to submit your review. Please try again."
      })
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
          <CardTitle>Write a Review</CardTitle>
          <CardDescription>
            {isLoading ? "Loading..." : `Share your experience at ${course.name}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-medium">Your Rating</h3>
              <div className="py-2">
                <StarRating rating={rating} size="large" interactive={true} onChange={setRating} />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Your Review</h3>
              <Textarea
                placeholder="Share your thoughts about the course, including conditions, layout, difficulty, facilities, and overall experience..."
                className="min-h-[200px]"
                required
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button type="submit" disabled={rating === 0 || isSubmitting || isLoading} className="flex-1">
                {isSubmitting ? "Submitting..." : "Post Review"}
              </Button>
              <Button type="button" variant="outline" asChild className="flex-1">
                <Link href={`/courses/${courseId}`}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
