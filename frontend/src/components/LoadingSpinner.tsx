import type React from "react"
import { Loader2 } from "lucide-react"

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export default LoadingSpinner
