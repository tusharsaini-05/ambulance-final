import React from 'react'
import { Plane as Ambulance } from 'lucide-react'

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="relative">
        <Ambulance className={`${sizeClasses[size]} text-emergency-600 animate-bounce`} />
        <div className="absolute inset-0 rounded-full border-2 border-emergency-200 border-t-emergency-600 animate-spin"></div>
      </div>
      {text && (
        <p className="mt-4 text-gray-600 text-sm font-medium">{text}</p>
      )}
    </div>
  )
}

export default LoadingSpinner
