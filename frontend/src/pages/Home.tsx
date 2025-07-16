"use client"

import type React from "react"
import { Link } from "react-router-dom"
import { Button } from "../components/ui/button.tsx"
import { useAuth } from "../contexts/AuthContext.tsx"

const Home: React.FC = () => {
  const { user } = useAuth()

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] text-center px-4">
      <h1 className="text-5xl font-extrabold text-blue-700 mb-6 animate-fade-in-down">Find Your Ambulance, Fast.</h1>
      <p className="text-xl text-gray-700 mb-8 max-w-2xl animate-fade-in-up">
        Connecting you to the nearest available ambulance with real-time tracking and instant booking. Your safety is
        our priority.
      </p>
      <div className="flex space-x-4 animate-fade-in-up delay-200">
        {user ? (
          user.user_metadata.role === "user" ? (
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Link to="/user/book">Book an Ambulance Now</Link>
            </Button>
          ) : (
            <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-white">
              <Link to="/driver/dashboard">Go to Driver Dashboard</Link>
            </Button>
          )
        ) : (
          <>
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Link to="/login">Get Started</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent"
            >
              <Link to="/about">Learn More</Link>
            </Button>
          </>
        )}
      </div>
      <div className="mt-12 text-gray-600 text-sm">
        <p>Emergency services at your fingertips.</p>
      </div>
    </div>
  )
}

export default Home
