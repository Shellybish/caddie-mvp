import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function LatestReviewsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-4 w-32" />
              <div className="flex items-center">
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
} 