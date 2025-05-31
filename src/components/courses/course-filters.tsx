"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Filter, Star } from "lucide-react"

export interface FilterState {
  province: string
  minRating: number
}

interface CourseFiltersProps {
  isOpen: boolean
  onToggle: () => void
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onClearFilters: () => void
  availableProvinces: string[]
}

const SA_PROVINCES = [
  "Western Cape",
  "Gauteng", 
  "KwaZulu-Natal",
  "Eastern Cape",
  "Free State",
  "Mpumalanga",
  "Limpopo",
  "North West",
  "Northern Cape"
]

const RATING_OPTIONS = [
  { value: 0, label: "All Ratings" },
  { value: 1, label: "1+ Stars" },
  { value: 2, label: "2+ Stars" },
  { value: 3, label: "3+ Stars" },
  { value: 4, label: "4+ Stars" },
  { value: 5, label: "5 Stars" },
]

export function CourseFilters({
  isOpen,
  onToggle,
  filters,
  onFiltersChange,
  onClearFilters,
  availableProvinces
}: CourseFiltersProps) {
  const hasActiveFilters = filters.province !== "" || filters.minRating > 0

  const handleProvinceChange = (value: string) => {
    onFiltersChange({
      ...filters,
      province: value === "all" ? "" : value
    })
  }

  const handleRatingChange = (value: string) => {
    onFiltersChange({
      ...filters,
      minRating: parseInt(value)
    })
  }

  const provincesToShow = availableProvinces.length > 0 ? availableProvinces : SA_PROVINCES

  if (!isOpen) {
    return (
      <div className="relative">
        <Button 
          variant={hasActiveFilters ? "default" : "outline"} 
          onClick={onToggle}
          className="relative"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filter
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2 px-1 py-0 text-xs">
              {(filters.province ? 1 : 0) + (filters.minRating > 0 ? 1 : 0)}
            </Badge>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className="relative">
      <Button 
        variant={hasActiveFilters ? "default" : "outline"} 
        onClick={onToggle}
        className="relative"
      >
        <Filter className="h-4 w-4 mr-2" />
        Filter
        {hasActiveFilters && (
          <Badge variant="secondary" className="ml-2 px-1 py-0 text-xs">
            {(filters.province ? 1 : 0) + (filters.minRating > 0 ? 1 : 0)}
          </Badge>
        )}
      </Button>
      
      <Card className="absolute top-full right-0 mt-2 p-4 w-80 shadow-lg z-50 bg-background border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Filter Courses</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-4">
          {/* Province Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Province</label>
            <Select 
              value={filters.province || "all"} 
              onValueChange={handleProvinceChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Provinces" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Provinces</SelectItem>
                {provincesToShow.map((province) => (
                  <SelectItem key={province} value={province}>
                    {province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rating Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Minimum Rating</label>
            <Select 
              value={filters.minRating.toString()} 
              onValueChange={handleRatingChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Ratings" />
              </SelectTrigger>
              <SelectContent>
                {RATING_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    <div className="flex items-center gap-1">
                      {option.value > 0 && <Star className="h-3 w-3 fill-current" />}
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div>
              <label className="text-sm font-medium mb-2 block">Active Filters</label>
              <div className="flex flex-wrap gap-2">
                {filters.province && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {filters.province}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => handleProvinceChange("all")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                {filters.minRating > 0 && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {filters.minRating}+ Stars
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => handleRatingChange("0")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Clear All Button */}
          {hasActiveFilters && (
            <Button 
              variant="outline" 
              onClick={onClearFilters}
              className="w-full"
            >
              Clear All Filters
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
} 