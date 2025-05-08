"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  rating?: number
  maxRating?: number
  size?: "default" | "large"
  interactive?: boolean
  onChange?: (rating: number) => void
  className?: string
}

export function StarRating({
  rating = 0,
  maxRating = 5,
  size = "default",
  interactive = false,
  onChange,
  className,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)
  const [hoverPosition, setHoverPosition] = useState<number | null>(null)

  // Helper to determine if device is touch
  const isTouchDevice = () => {
    return typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }

  const handleMouseEnter = (index: number, event: React.MouseEvent<SVGElement>) => {
    if (interactive && !isTouchDevice()) {
      const rect = event.currentTarget.getBoundingClientRect()
      const mouseX = event.clientX - rect.left
      const starWidth = rect.width
      if (mouseX < starWidth / 2) {
        setHoverRating(index - 0.5)
        setHoverPosition(index - 0.5)
      } else {
        setHoverRating(index)
        setHoverPosition(index)
      }
    }
  }

  const handleMouseMove = (index: number, event: React.MouseEvent<SVGElement>) => {
    if (interactive && !isTouchDevice()) {
      const rect = event.currentTarget.getBoundingClientRect()
      const mouseX = event.clientX - rect.left
      const starWidth = rect.width
      if (mouseX < starWidth / 2) {
        setHoverRating(index - 0.5)
        setHoverPosition(index - 0.5)
      } else {
        setHoverRating(index)
        setHoverPosition(index)
      }
    }
  }

  const handleMouseLeave = () => {
    if (interactive && !isTouchDevice()) {
      setHoverRating(0)
      setHoverPosition(null)
    }
  }

  // Click handler for both desktop and mobile
  const handleClick = (index: number, event: React.MouseEvent<SVGElement> | React.TouchEvent<SVGElement>) => {
    if (interactive && onChange) {
      let starWidth = 24 // fallback
      let mouseX = 0
      if ('clientX' in event && 'currentTarget' in event) {
        const rect = (event.currentTarget as SVGElement).getBoundingClientRect()
        mouseX = event.clientX - rect.left
        starWidth = rect.width
      }
      // On touch, always treat as full star unless toggling
      if (isTouchDevice()) {
        if (rating === index) {
          onChange(index - 0.5)
        } else {
          onChange(index)
        }
      } else {
        if (mouseX < starWidth / 2) {
          onChange(index - 0.5)
        } else {
          // Toggle to half if already full
          if (rating === index) {
            onChange(index - 0.5)
          } else {
            onChange(index)
          }
        }
      }
    }
  }

  const displayRating = hoverRating > 0 ? hoverRating : rating

  return (
    <div
      className={cn("star-rating", {
        large: size === "large",
        "cursor-pointer": interactive,
      }, className)}
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
            className={isFilled || isHalfFilled ? "filled" : ""}
            onMouseEnter={(e) => handleMouseEnter(starValue, e)}
            onMouseMove={(e) => handleMouseMove(starValue, e)}
            onMouseLeave={handleMouseLeave}
            onClick={(e) => handleClick(starValue, e)}
            onTouchEnd={(e) => handleClick(starValue, e)}
            style={{ cursor: interactive ? 'pointer' : 'default', width: size === 'large' ? 36 : 24, height: size === 'large' ? 36 : 24 }}
          >
            {/* Full star background (for half fill) */}
            {isHalfFilled ? (
              <g>
                <defs>
                  <linearGradient id={`half-gradient-${index}`} x1="0" x2="1" y1="0" y2="0">
                    <stop offset="50%" stopColor="currentColor" />
                    <stop offset="50%" stopColor="transparent" />
                  </linearGradient>
                </defs>
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  fill={`url(#half-gradient-${index})`}
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </g>
            ) : (
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                fill={isFilled ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.5"
              />
            )}
          </svg>
        )
      })}
    </div>
  )
}
