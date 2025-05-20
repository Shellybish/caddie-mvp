import { FallbackProps } from "react-error-boundary"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-6 bg-destructive/5 rounded-lg border border-destructive/20">
      <AlertCircle className="h-10 w-10 text-destructive mb-4" />
      <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
      <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
        {error?.message || "An unexpected error occurred while loading this content."}
      </p>
      <div className="flex gap-4">
        <Button onClick={resetErrorBoundary} variant="outline">
          Try again
        </Button>
        <Button onClick={() => window.location.reload()} variant="default">
          Reload page
        </Button>
      </div>
    </div>
  )
} 