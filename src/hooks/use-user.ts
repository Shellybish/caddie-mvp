import { useQuery } from "@tanstack/react-query"
import { getUser } from "@/lib/actions/user"

export function useUser() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: getUser,
  })

  return { user, isLoading }
} 