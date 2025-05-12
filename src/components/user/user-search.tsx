"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SearchIcon, UserPlusIcon, UserCheckIcon } from "lucide-react"
import { searchUsersByUsername, followUser, unfollowUser, isFollowing } from "@/lib/api/profiles"
import { useUser } from "@/contexts/user-context"
import { useDebounce } from "@/lib/hooks/use-debounce"

type SearchResult = {
  id: string
  user_id: string
  username: string
  avatar_url?: string
  isFollowing?: boolean
}

export function UserSearch() {
  const { user: currentUser } = useUser()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [followLoading, setFollowLoading] = useState<Record<string, boolean>>({})
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Search for users when the debounced search term changes
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) {
        setSearchResults([])
        return
      }
      
      setIsSearching(true)
      
      try {
        const results = await searchUsersByUsername(debouncedSearchTerm)
        
        // Check which users the current user is following
        if (currentUser?.id) {
          const resultsWithFollowing = await Promise.all(
            results.map(async (result) => {
              const following = await isFollowing(currentUser.id, result.user_id)
              return { ...result, isFollowing: following }
            })
          )
          setSearchResults(resultsWithFollowing)
        } else {
          setSearchResults(results)
        }
      } catch (error) {
        console.error("Error searching users:", error)
      } finally {
        setIsSearching(false)
      }
    }
    
    performSearch()
  }, [debouncedSearchTerm, currentUser?.id])
  
  // Handle follow/unfollow
  const handleFollowToggle = useCallback(async (userId: string, isFollowed: boolean) => {
    if (!currentUser?.id) return
    
    setFollowLoading((prev) => ({ ...prev, [userId]: true }))
    
    try {
      if (isFollowed) {
        await unfollowUser(currentUser.id, userId)
      } else {
        await followUser(currentUser.id, userId)
      }
      
      // Update the search results
      setSearchResults((prev) =>
        prev.map((result) =>
          result.user_id === userId
            ? { ...result, isFollowing: !isFollowed }
            : result
        )
      )
    } catch (error) {
      console.error("Error toggling follow:", error)
    } finally {
      setFollowLoading((prev) => ({ ...prev, [userId]: false }))
    }
  }, [currentUser?.id])
  
  // Handle user selection
  const handleUserSelect = (username: string) => {
    router.push(`/user/${username}`)
    // Clear search
    setSearchTerm("")
  }
  
  // Focus the input when the component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])
  
  return (
    <div className="w-full max-w-sm">
      <div className="relative">
        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search users by username..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {(searchResults.length > 0 || isSearching) && (
        <Card className="mt-1 p-2 max-h-80 overflow-y-auto">
          {isSearching ? (
            <div className="flex justify-center p-4">
              <p className="text-sm text-muted-foreground">Searching...</p>
            </div>
          ) : (
            <ul className="space-y-1">
              {searchResults.map((result) => (
                <li key={result.id} className="p-2 hover:bg-muted rounded flex items-center justify-between">
                  <div 
                    className="flex items-center space-x-2 cursor-pointer flex-1" 
                    onClick={() => handleUserSelect(result.username)}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={result.avatar_url || "/placeholder.svg"} alt={result.username} />
                      <AvatarFallback>
                        {result.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>@{result.username}</span>
                  </div>
                  
                  {currentUser?.id && currentUser.id !== result.user_id && (
                    <Button 
                      variant={result.isFollowing ? "outline" : "secondary"}
                      size="sm"
                      onClick={() => handleFollowToggle(result.user_id, !!result.isFollowing)}
                      disabled={!!followLoading[result.user_id]}
                    >
                      {result.isFollowing ? (
                        <>
                          <UserCheckIcon className="h-4 w-4 mr-1" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlusIcon className="h-4 w-4 mr-1" />
                          Follow
                        </>
                      )}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  )
} 