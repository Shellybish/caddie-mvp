import { Star } from "lucide-react"

interface StarRatingProps {
  rating: number
  size?: "sm" | "md" | "lg"
  disabled?: boolean
}

export function StarRating({ rating, size = "md", disabled = true }: StarRatingProps) {
  const maxRating = 5
  const roundedRating = Math.round(rating * 2) / 2
  
  // Set sizes based on the size prop
  const starSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  }
  
  const starSize = starSizes[size]
  
  return (
    <div className="flex items-center">
      {[...Array(maxRating)].map((_, i) => {
        const value = i + 1
        
        // Determine if star should be filled, half-filled, or empty
        let fillClass = ""
        if (value <= roundedRating) {
          fillClass = "text-yellow-500 fill-current"
        } else if (value - 0.5 === roundedRating) {
          fillClass = "text-yellow-500 fill-[url('#half-star-gradient')]"
        } else {
          fillClass = "text-gray-300"
        }
        
        return (
          <span key={i} className={`${fillClass} ${disabled ? "" : "cursor-pointer"}`}>
            <Star className={starSize} strokeWidth={1.5} />
          </span>
        )
      })}
      
      {/* Optional SVG defs for half-filled stars */}
      <svg width="0" height="0">
        <defs>
          <linearGradient id="half-star-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
} 