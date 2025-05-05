"use client"

import type React from "react"

import { useState } from "react"
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

export default function LogPlayPage({ params }: { params: { id: string } }) {
  const [date, setDate] = useState<Date>()
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
        title: "Round logged successfully",
        description: `You've logged a round at ${course.name}.`,
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
          <CardTitle>Log a Round</CardTitle>
          <CardDescription>Record your play at {course.name}</CardDescription>
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
                    onSelect={setDate}
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
              <Textarea id="notes" placeholder="Share your thoughts about the round..." className="min-h-[100px]" />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button type="submit" disabled={!date || isSubmitting} className="flex-1">
                {isSubmitting ? "Submitting..." : "Log Round"}
              </Button>
              <Button type="button" variant="outline" asChild className="flex-1">
                <Link href={`/courses/${params.id}/review`}>Write a Full Review</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
