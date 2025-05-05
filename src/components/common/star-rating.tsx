"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  rating?: number
  maxRating?: number
  size?: "default" | "large"
  interactive?: boolean
  onChange?: (rating: number) => void
}

export function StarRating({
  rating = 0,
  maxRating = 5,
  size = "default",
  interactive = false,
  onChange,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)

  const handleMouseEnter = (index: number) => {
    if (interactive) {
      setHoverRating(index)
    }
  }

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0)
    }
  }

  const handleClick = (index: number) => {
    if (interactive && onChange) {
      onChange(index)
    }
  }

  const displayRating = hoverRating > 0 ? hoverRating : rating

  return (
    <div
      className={cn("star-rating", {
        large: size === "large",
        "cursor-pointer": interactive,
      })}
    >
      {Array.from({ length: maxRating }).map((_, index) => {
        const starValue = index + 1
        const isFilled = starValue <= displayRating
        const isHalfFilled = !isFilled && starValue - 0.5 <= displayRating

        return (
          <svg
            key={index}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className={isFilled ? "filled" : ""}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(starValue)}
          >
            {isHalfFilled ? (
              <path d="M12 17.8 5.8 21 7 14.1 2 9.3l7-1L12 2" />
            ) : (
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            )}
          </svg>
        )
      })}
    </div>
  )
}
