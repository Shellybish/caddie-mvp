"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StarRating } from "@/components/common/star-rating"
import { LikeButton } from "@/components/reviews/LikeButton"
import { LatestReviewsSkeleton } from "./latest-reviews-skeleton"
import { getRecentReviews, RecentReview } from "@/lib/api/courses"
import { formatTimeAgo, truncateText } from "@/lib/utils"
import { useUser } from "@/contexts/user-context"

export function LatestReviews() {
  const [reviews, setReviews] = useState<RecentReview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useUser()

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getRecentReviews(5, user?.id)
        setReviews(data)
      } catch (err) {
        console.error("Error fetching recent reviews:", err)
        setError("Failed to load reviews")
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [user?.id])

  if (isLoading) {
    return <LatestReviewsSkeleton />
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">No reviews yet.</p>
        <Button asChild>
          <Link href="/courses">Find Courses to Review</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id} className="p-4 hover:shadow-md transition-shadow duration-200">
          <div className="flex gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage 
                src={review.user?.avatar_url || "/placeholder.svg"} 
                alt={review.user?.username || "User"} 
              />
              <AvatarFallback>
                {(review.user?.username || "U").substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <p className="font-medium">{review.user?.username || "Anonymous User"}</p>
                <p className="text-xs text-muted-foreground">
                  {formatTimeAgo(review.created_at)}
                </p>
              </div>
              <p className="text-sm font-medium">
                <Link 
                  href={`/courses/${review.course_id}`} 
                  className="hover:underline text-primary"
                >
                  {review.course?.name || "Unknown Course"}
                </Link>
              </p>
              <div className="flex items-center">
                <StarRating rating={review.rating} />
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {review.review_text ? truncateText(review.review_text, 150) : ""}
              </p>
              <div className="flex items-center justify-between">
                <Button asChild variant="link" className="p-0 h-auto text-sm text-primary">
                  <Link href={`/courses/${review.course_id}#reviews`}>
                    Read Full Review
                  </Link>
                </Button>
                <LikeButton
                  reviewId={review.id}
                  initialLiked={review.user_has_liked || false}
                  initialLikesCount={review.likes_count}
                />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
} 