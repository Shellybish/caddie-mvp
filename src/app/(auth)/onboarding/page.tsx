"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { StarRating } from "@/components/common/star-rating"
import { ClubIcon as GolfIcon, MapPinIcon, ListPlusIcon } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@/contexts/user-context"

export default function OnboardingPage() {
  const [currentCourseIndex, setCurrentCourseIndex] = useState(0)
  const [ratings, setRatings] = useState<Record<string, number>>({})
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({})
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useUser()

  // If no user is logged in, redirect to login
  if (typeof window !== "undefined" && !user) {
    router.push("/login")
  }

  // Mock courses based on location
  const localCourses = [
    {
      id: "1",
      name: "Royal Johannesburg & Kensington Golf Club",
      location: "Johannesburg, Gauteng",
      image: "/placeholder.svg?height=300&width=500",
    },
    {
      id: "2",
      name: "Randpark Golf Club",
      location: "Johannesburg, Gauteng",
      image: "/placeholder.svg?height=300&width=500",
    },
    {
      id: "3",
      name: "Glendower Golf Club",
      location: "Johannesburg, Gauteng",
      image: "/placeholder.svg?height=300&width=500",
    },
    {
      id: "4",
      name: "Houghton Golf Club",
      location: "Johannesburg, Gauteng",
      image: "/placeholder.svg?height=300&width=500",
    },
    {
      id: "5",
      name: "Bryanston Country Club",
      location: "Johannesburg, Gauteng",
      image: "/placeholder.svg?height=300&width=500",
    },
  ]

  const handleAddToWishlist = () => {
    const currentCourse = localCourses[currentCourseIndex]
    setWishlist({ ...wishlist, [currentCourse.id]: true })
    toast({
      title: "Added to bucket list",
      description: `${currentCourse.name} has been added to your bucket list.`,
    })
    moveToNextCourse()
  }

  const handleRatingSubmit = (rating: number) => {
    const currentCourse = localCourses[currentCourseIndex]
    setRatings({ ...ratings, [currentCourse.id]: rating })

    if (rating > 0) {
      toast({
        title: "Rating submitted",
        description: `You've rated ${currentCourse.name} ${rating} stars.`,
      })
      moveToNextCourse()
    }
  }

  const moveToNextCourse = () => {
    if (currentCourseIndex < localCourses.length - 1) {
      setCurrentCourseIndex(currentCourseIndex + 1)
    } else {
      // Onboarding complete
      finishOnboarding()
    }
  }

  const finishOnboarding = () => {
    toast({
      title: "Onboarding complete!",
      description: "Your profile has been set up successfully.",
    })
    router.push("/")
  }

  const currentCourse = localCourses[currentCourseIndex]

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex justify-center mb-6">
            <GolfIcon className="h-8 w-8 text-primary" />
          </div>

          {currentCourse && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold">Discover courses near you</h1>
                <div className="flex items-center justify-center text-sm text-muted-foreground">
                  <MapPinIcon className="h-3.5 w-3.5 mr-1" />
                  <span>{currentCourse.location}</span>
                </div>
              </div>

              <div className="aspect-video rounded-lg overflow-hidden mb-4">
                <img
                  src={currentCourse.image || "/placeholder.svg"}
                  alt={currentCourse.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <h2 className="text-xl font-bold text-center">{currentCourse.name}</h2>

              <div className="space-y-5">
                <div className="space-y-2">
                  <p className="text-center text-sm font-medium">Rate this course</p>
                  <div className="flex justify-center">
                    <StarRating
                      rating={ratings[currentCourse.id] || 0}
                      size="large"
                      interactive={true}
                      onChange={handleRatingSubmit}
                    />
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-center text-sm font-medium mb-2">or</p>
                  <Button onClick={handleAddToWishlist} variant="outline" className="w-full">
                    <ListPlusIcon className="h-4 w-4 mr-2" />
                    Add to Bucket List
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Course {currentCourseIndex + 1} of {localCourses.length}
                </span>
                <Button onClick={moveToNextCourse} variant="ghost" size="sm">
                  Skip
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
