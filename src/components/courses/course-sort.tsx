"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowUpDown } from "lucide-react"
import { SORT_OPTIONS, SortOption } from "@/hooks/use-course-sort"

interface CourseSortProps {
  currentSort: SortOption
  onSortChange: (sort: SortOption) => void
  className?: string
}

export function CourseSort({
  currentSort,
  onSortChange,
  className
}: CourseSortProps) {
  const getCurrentLabel = () => {
    const option = SORT_OPTIONS.find(opt => opt.value === currentSort)
    return option?.label || 'Best Rated'
  }

  return (
    <div className={className}>
      <Select value={currentSort} onValueChange={onSortChange}>
        <SelectTrigger className="w-[180px]">
          <ArrowUpDown className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Sort by">
            {getCurrentLabel()}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
} 