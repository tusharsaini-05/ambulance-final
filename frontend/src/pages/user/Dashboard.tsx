"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../../contexts/AuthContext.tsx"
import { supabase } from "../../lib/supabase.ts"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.tsx"
import { Button } from "../../components/ui/button.tsx"
import LoadingSpinner from "../../components/LoadingSpinner.tsx"
import { Link } from "react-router-dom"

interface UserProfile {
  id: string
  full_name: string
  email: string
}

const UserDashboard: React.FC = () => {
  const { user } = useAuth()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUserProfile = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase.from("users").select("id, full_name, email").eq("id", user.id).single()

      if (error) throw error
      if (data) {
        setUserProfile(data)
      }
    } catch (err: any) {
      console.error("Error fetching user profile:", err.message)
      setError("Failed to fetch profile: " + err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchUserProfile()
  }, [fetchUserProfile])

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>
  }

  if (!userProfile) {
    return <div className="text-center text-gray-600">User profile not found.</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">User Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {userProfile.full_name || userProfile.email}!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Quickly book an ambulance or view your past bookings.</p>
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              <Link to="/user/book">Book an Ambulance</Link>
            </Button>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link to="/user/history">View Booking History</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>In case of emergency, you can quickly alert authorities.</p>
            <Button className="w-full bg-red-600 hover:bg-red-700 text-white">Panic Button (Coming Soon)</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Manage your profile information.</p>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link to="/user/profile">Edit Profile (Coming Soon)</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default UserDashboard
