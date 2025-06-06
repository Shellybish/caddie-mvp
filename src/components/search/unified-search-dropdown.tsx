"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StarRating } from "@/components/common/star-rating"
import { 
  MapPinIcon, 
  SearchIcon, 
  UserIcon, 
  ListIcon,
  ClubIcon as GolfIcon,
  BookOpenIcon
} from "lucide-react"
import { UnifiedSearchResults, UnifiedSearchResult } from "@/hooks/use-unified-search"

interface UnifiedSearchDropdownProps {
  results: UnifiedSearchResults
  isLoading: boolean
  error: string | null
  searchTerm: string
  onResultClick?: () => void
  onViewAllResults?: (type: 'courses' | 'users' | 'lists') => void
}

export function UnifiedSearchDropdown({
  results,
  isLoading,
  error,
  searchTerm,
  onResultClick,
  onViewAllResults
}: UnifiedSearchDropdownProps) {
  if (!searchTerm || searchTerm.trim().length < 2) {
    return null
  }

  const totalResults = results.courses.length + results.users.length + results.lists.length

  return (
    <Card className="absolute top-full left-0 right-0 mt-1 max-h-[500px] overflow-hidden shadow-lg z-50 bg-background border">
      {isLoading ? (
        <div className="flex items-center justify-center p-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <SearchIcon className="h-4 w-4 animate-pulse" />
            <span className="text-sm">Searching...</span>
          </div>
        </div>
      ) : error ? (
        <div className="p-4 text-center">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : totalResults === 0 ? (
        <div className="p-6 text-center">
          <SearchIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-1">No results found for "{searchTerm}"</p>
          <p className="text-xs text-muted-foreground">Try searching for courses, users, or lists</p>
        </div>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 rounded-none border-b bg-transparent h-auto p-1">
            <TabsTrigger value="all" className="text-xs">
              All ({totalResults})
            </TabsTrigger>
            <TabsTrigger value="courses" className="text-xs">
              <GolfIcon className="h-3 w-3 mr-1" />
              Courses ({results.courses.length})
            </TabsTrigger>
            <TabsTrigger value="users" className="text-xs">
              <UserIcon className="h-3 w-3 mr-1" />
              Users ({results.users.length})
            </TabsTrigger>
            <TabsTrigger value="lists" className="text-xs">
              <ListIcon className="h-3 w-3 mr-1" />
              Lists ({results.lists.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="p-2 max-h-[400px] overflow-y-auto">
            <div className="space-y-1">
              {results.all.map((result) => (
                <SearchResultItem
                  key={`${result.type}-${result.id}`}
                  result={result}
                  onResultClick={onResultClick}
                />
              ))}
              {results.all.length > 0 && (
                <div className="pt-2 border-t">
                  <div className="flex gap-1 text-xs">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs h-7 px-2 flex-1"
                      onClick={() => onViewAllResults?.('courses')}
                    >
                      All courses
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs h-7 px-2 flex-1"
                      onClick={() => onViewAllResults?.('users')}
                    >
                      All users
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs h-7 px-2 flex-1"
                      onClick={() => onViewAllResults?.('lists')}
                    >
                      All lists
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="courses" className="p-2 max-h-[400px] overflow-y-auto">
            <div className="space-y-1">
              {results.courses.map((course) => (
                <SearchResultItem
                  key={course.id}
                  result={course}
                  onResultClick={onResultClick}
                />
              ))}
              {results.courses.length > 0 && (
                <div className="pt-2 border-t">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-xs"
                    onClick={() => onViewAllResults?.('courses')}
                  >
                    View all {results.courses.length} course results
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="users" className="p-2 max-h-[400px] overflow-y-auto">
            <div className="space-y-1">
              {results.users.map((user) => (
                <SearchResultItem
                  key={user.id}
                  result={user}
                  onResultClick={onResultClick}
                />
              ))}
              {results.users.length > 0 && (
                <div className="pt-2 border-t">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-xs"
                    onClick={() => onViewAllResults?.('users')}
                  >
                    View all users
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="lists" className="p-2 max-h-[400px] overflow-y-auto">
            <div className="space-y-1">
              {results.lists.map((list) => (
                <SearchResultItem
                  key={list.id}
                  result={list}
                  onResultClick={onResultClick}
                />
              ))}
              {results.lists.length > 0 && (
                <div className="pt-2 border-t">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-xs"
                    onClick={() => onViewAllResults?.('lists')}
                  >
                    View all lists
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </Card>
  )
}

function SearchResultItem({
  result,
  onResultClick
}: {
  result: UnifiedSearchResult
  onResultClick?: () => void
}) {
  const handleClick = () => {
    onResultClick?.()
  }

  if (result.type === 'course') {
    return (
      <Link
        href={`/courses/${result.id}`}
        className="block p-3 rounded-md hover:bg-muted/50 transition-colors"
        onClick={handleClick}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
            <GolfIcon className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-sm truncate">{result.name}</h4>
              {result.average_rating > 0 && (
                <div className="flex items-center gap-1">
                                     <StarRating rating={result.average_rating} />
                  <span className="text-xs text-muted-foreground">
                    ({result.total_reviews})
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPinIcon className="h-3 w-3" />
              <span className="truncate">{result.location}, {result.province}</span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  if (result.type === 'user') {
    return (
      <Link
        href={`/user/${result.username}`}
        className="block p-3 rounded-md hover:bg-muted/50 transition-colors"
        onClick={handleClick}
      >
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={result.avatar_url || "/placeholder.svg"} alt={result.username} />
            <AvatarFallback className="text-xs">
              {result.username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">@{result.username}</h4>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <UserIcon className="h-3 w-3" />
              <span>User profile</span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  if (result.type === 'list') {
    return (
      <Link
        href={`/lists/${result.id}`}
        className="block p-3 rounded-md hover:bg-muted/50 transition-colors"
        onClick={handleClick}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
            <BookOpenIcon className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-sm truncate">{result.title}</h4>
              <Badge variant="secondary" className="text-xs">
                {result.course_count} courses
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate mb-1">
              {result.description || 'No description'}
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>by {result.author_name}</span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return null
} 