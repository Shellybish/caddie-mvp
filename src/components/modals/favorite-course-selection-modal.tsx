import { Button } from "@/components/ui/button"

interface FavoriteCourseSelectionModalProps {
  onCourseAdded: () => void;
  maxFavorites: number;
  currentFavoriteCount: number;
  buttonText?: string;
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function FavoriteCourseSelectionModal({
  onCourseAdded,
  maxFavorites,
  currentFavoriteCount,
  buttonText = "Find Courses",
  buttonVariant = "outline"
}: FavoriteCourseSelectionModalProps) {
  return (
    <Button variant={buttonVariant} onClick={onCourseAdded}>
      {buttonText}
    </Button>
  )
} 