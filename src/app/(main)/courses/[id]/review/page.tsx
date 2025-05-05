"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { StarRating } from "@/components/common/star-rating"
import { ChevronLeftIcon } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function ReviewPage({ params }: { params: { id: string } }) {
  const [rating, setRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Mock course data
  const course = {
    id: params.id,
    name: "Royal Johannesburg & Kensington Golf Club",
    location: "Johannesburg, Gauteng",
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "Review submitted successfully",
        description: `Your review for ${course.name} has been posted.`,
      })
    }, 1500)
  }

  return (
    <div className="container max-w-2xl py-8 md:py-12">
      <Link
        href={`/courses/${params.id}`}
        className="flex items-center text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeftIcon className="h-4 w-4 mr-1" />
        Back to course
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Write a Review</CardTitle>
          <CardDescription>Share your experience at {course.name}</CardDescription>
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
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button type="submit" disabled={rating === 0 || isSubmitting} className="flex-1">
                {isSubmitting ? "Submitting..." : "Post Review"}
              </Button>
              <Button type="button" variant="outline" asChild className="flex-1">
                <Link href={`/courses/${params.id}`}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
