"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ListIcon, PlusIcon, SearchIcon, ThumbsUpIcon } from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { getListsByUserId, getListById, getPublicLists, getListLikesCount, hasUserLikedList } from "@/lib/api/profiles"
import { useToast } from "@/components/ui/use-toast"
import { ListLikeButton } from "@/components/lists/ListLikeButton"

// Define proper type for list
type ListWithCourses = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  is_public: boolean;
  created_at: string;
  list_courses: {
    id: string;
    course_id: string;
    position: number;
    courses: {
      id: string;
      name: string;
      location: string;
      province: string;
      image_url?: string;
      [key: string]: any;
    };
  }[];
  author?: {
    name: string;
    image: string;
  };
  likesCount?: number;
  userHasLiked?: boolean;
};

export default function ListsPage() {
  const { user } = useUser()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [userLists, setUserLists] = useState<ListWithCourses[]>([])
  const [publicLists, setPublicLists] = useState<ListWithCourses[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch user's lists
  useEffect(() => {
    async function fetchUserLists() {
      if (!user) return;
      
      try {
        // Fetch user's lists with "includePrivate" set to true to get all lists
        const lists = await getListsByUserId(user.id, true);
        
        // Fetch courses for each list
        const listsWithCourses = await Promise.all(
          lists.map(async (list) => {
            const listWithCourses = await getListById(list.id);
            
            // Try to get like data, but don't fail if it's not available
            let likesCount = 0;
            let userHasLiked = false;
            
            try {
              [likesCount, userHasLiked] = await Promise.all([
                getListLikesCount(list.id),
                hasUserLikedList(user.id, list.id)
              ]);
            } catch (error) {
              console.warn('Could not fetch like data for list:', list.id, error);
              // Keep default values (0, false)
            }
            
            return {
              ...listWithCourses,
              author: {
                name: user.name || user.email || 'Anonymous',
                image: user.image || "/placeholder.svg?height=40&width=40",
              },
              likesCount,
              userHasLiked
            };
          })
        );
        
        setUserLists(listsWithCourses);
      } catch (error) {
        console.error("Error fetching user lists:", error);
        toast({
          title: "Error loading your lists",
          description: "There was a problem fetching your lists. Please try again.",
          variant: "destructive",
        });
      }
    }

    fetchUserLists();
  }, [user, toast]);

  // Fetch public lists (this could be from a different API endpoint in the future)
  useEffect(() => {
    async function fetchPublicLists() {
      setIsLoading(true);
      try {
        const lists = await getPublicLists(10, 0);
        
        // Handle case where no lists are returned
        if (!lists || lists.length === 0) {
          setPublicLists([]);
          return;
        }
        
        // Format the public lists with like data
        const formattedLists = await Promise.all(
          lists.map(async (list: any) => {
            // Try to get like data, but don't fail if it's not available
            let likesCount = 0;
            let userHasLiked = false;
            
            try {
              [likesCount, userHasLiked] = await Promise.all([
                getListLikesCount(list.id),
                user ? hasUserLikedList(user.id, list.id) : Promise.resolve(false)
              ]);
            } catch (error) {
              console.warn('Could not fetch like data for public list:', list.id, error);
              // Keep default values (0, false)
            }
            
            return {
              ...list,
              author: {
                name: list.profiles?.full_name || list.profiles?.username || 'Anonymous',
                image: list.profiles?.avatar_url || "/placeholder.svg?height=40&width=40",
              },
              likesCount,
              userHasLiked
            };
          })
        );
        
        setPublicLists(formattedLists);
      } catch (error) {
        console.error("Error fetching public lists:", JSON.stringify(error, null, 2));
        // Set empty array instead of showing error to user
        setPublicLists([]);
        // Only show toast for actual errors (not empty results)
        if (error && typeof error === 'object' && 'message' in error) {
          toast({
            title: "Error loading public lists",
            description: `There was a problem fetching public lists: ${error.message}`,
            variant: "destructive",
          });
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchPublicLists();
  }, [toast]);

  // Filter lists based on search query
  const filteredUserLists = userLists.filter(
    (list) =>
      list.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (list.description && list.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredPublicLists = publicLists.filter(
    (list) =>
      list.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (list.description && list.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Helper to get preview images from a list
  const getListPreviewImages = (list: ListWithCourses) => {
    if (!list.list_courses || list.list_courses.length === 0) {
      return ["/placeholder.svg?height=100&width=100"];
    }
    
    return list.list_courses
      .sort((a, b) => a.position - b.position)
      .slice(0, 3)
      .map(course => course.courses?.image_url || "/placeholder.svg?height=100&width=100");
  };

  // Helper to get course count from a list
  const getListCourseCount = (list: ListWithCourses) => {
    return list.list_courses?.length || 0;
  };

  // Render a list card
  const renderListCard = (list: ListWithCourses) => (
    <Card key={list.id} className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-lg">{list.title}</h3>
              <div className="flex items-center text-sm text-muted-foreground gap-2">
                <div className="flex items-center">
                  <Avatar className="h-5 w-5 mr-1">
                    <AvatarImage src={list.author?.image || "/placeholder.svg"} alt={list.author?.name || "User"} />
                    <AvatarFallback>{(list.author?.name || "User").substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  {list.author?.name || "User"}
                </div>
                <span>•</span>
                <div className="flex items-center">
                  <ListIcon className="h-3.5 w-3.5 mr-1" />
                  {getListCourseCount(list)} courses
                </div>
              </div>
            </div>
            <ListLikeButton
              listId={list.id}
              initialLiked={list.userHasLiked || false}
              initialLikesCount={list.likesCount || 0}
            />
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{list.description}</p>
          <div className="flex gap-2 pt-1">
            {getListPreviewImages(list).map((image: string, index: number) => (
              <div key={index} className="w-20 h-14 rounded overflow-hidden">
                <img
                  src={image}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {getListCourseCount(list) > 3 && (
              <div className="w-20 h-14 rounded bg-muted flex items-center justify-center text-muted-foreground">
                +{getListCourseCount(list) - 3}
              </div>
            )}
          </div>
          <Button asChild variant="outline" className="w-full">
            <Link href={`/lists/${list.id}`}>View List</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container py-8 md:py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Course Lists</h1>
          <p className="text-muted-foreground">Discover and create collections of golf courses</p>
        </div>
        <div className="w-full md:w-auto flex gap-2">
          <div className="relative flex-1 md:w-[300px]">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search lists..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button asChild>
            <Link href="/lists/create">
              <PlusIcon className="h-4 w-4 mr-2" />
              Create List
            </Link>
          </Button>
        </div>
      </div>

      {/* User's Lists Section */}
      {user && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Your Lists</h2>
            <Button asChild variant="outline" size="sm">
              <Link href="/lists/create">
                <PlusIcon className="h-4 w-4 mr-2" />
                New List
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading your lists...</div>
          ) : filteredUserLists.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6 mb-10">{filteredUserLists.map(renderListCard)}</div>
          ) : (
            <Card className="mb-10">
              <CardContent className="p-6 text-center">
                <h3 className="font-medium mb-2">You haven't created any lists yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first list to organize courses you love or want to play
                </p>
                <Button asChild>
                  <Link href="/lists/create">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create Your First List
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Public Lists Section */}
      <div className="mb-4">
        <h2 className="text-xl font-bold">Public Lists</h2>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading public lists...</div>
      ) : filteredPublicLists.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">{filteredPublicLists.map(renderListCard)}</div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="max-w-md mx-auto">
              <ListIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No public lists yet</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? "No public lists match your search. Try adjusting your search terms." 
                  : "Be the first to create a public list and share your favorite golf courses with the community!"
                }
              </p>
              {!searchQuery && (
                <Button asChild>
                  <Link href="/lists/create">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create First Public List
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {filteredPublicLists.length > 0 && (
        <div className="flex justify-center mt-8">
          <Button variant="outline">Load More</Button>
        </div>
      )}
    </div>
  )
}
