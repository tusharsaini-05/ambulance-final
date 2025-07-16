"use client"

import { Label } from "@/components/ui/label"
import { Switch } from "../../components/ui/switch"
import LoadingSpinner from "../../components/LoadingSpinner"
import type React from "react"
import { useEffect, useState, useCallback, useRef } from "react"
import { useAuth } from "../../contexts/AuthContext.tsx"
import { supabase } from "../../lib/supabase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MapPin } from "lucide-react"
import { socketService } from "../../lib/socket.ts"
import AmbulanceSimulator from "../../components/AmbulanceSimulator.tsx"
import { useNavigate } from "react-router-dom"
import BookingCard from "../../components/BookingCard.tsx"
import { useBooking } from "../../contexts/BookingContext"

interface Booking {
  id: string
  pickup_location: string
  destination: string
  booking_time: string
  status: string
  user_id: string
  driver_id?: string | null
  user_name?: string | null
  user_phone?: string | null
}

interface DriverProfile {
  id: string
  full_name: string
  email: string
  is_available: boolean
  current_lat: number | null
  current_lng: number | null
}

const DriverDashboard: React.FC = () => {
  const { pendingBookings, fetchPendingBookings, acceptBooking, setPendingBookings } = useBooking()
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAvailable, setIsAvailable] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null)
  const locationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchDriverProfile = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, full_name, email, is_available, current_lat, current_lng")
        .eq("id", user.id)
        .single()

      if (error) throw error
      if (data) {
        setDriverProfile(data)
        setIsAvailable(data.is_available)
      }
    } catch (err: any) {
      console.error("Error fetching driver profile:", err.message)
      setError("Failed to fetch profile: " + err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!authLoading && user && user.user_metadata.role === "driver") {
      fetchPendingBookings()
      fetchDriverProfile()
      // Initialize availability based on user metadata or a default
      setIsAvailable(user.user_metadata.is_available ?? false)
    }
  }, [user, authLoading, fetchPendingBookings])

  const handleAcceptBooking = async (bookingId: string) => {
    if (user) {
      await acceptBooking(bookingId, user.id)
      fetchPendingBookings() // Refresh pending bookings
      navigate(`/driver/track-booking/${bookingId}`) // Navigate to track page
    }
  }

  const handleAvailabilityChange = async (checked: boolean) => {
    if (!user) return

    setIsAvailable(checked)
    try {
      const { error } = await supabase.from("users").update({ is_available: checked }).eq("id", user.id)

      if (error) throw error
      // Optionally, emit availability status via socket if needed for other drivers/admin
    } catch (err: any) {
      console.error("Error updating availability:", err.message)
      setError("Failed to update availability: " + err.message)
      setIsAvailable(!checked) // Revert if error
    }
  }

  const startLocationTracking = useCallback(() => {
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current)
    }

    locationIntervalRef.current = setInterval(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            setCurrentLocation({ lat: latitude, lng: longitude })
            if (user) {
              socketService.emit("driverLocationUpdate", {
                driverId: user.id,
                lat: latitude,
                lng: longitude,
                isAvailable: isAvailable, // Send current availability status
              })
            }
          },
          (err) => {
            console.error("Error getting geolocation:", err)
            setError("Geolocation error: " + err.message)
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
        )
      } else {
        setError("Geolocation is not supported by your browser.")
        clearInterval(locationIntervalRef.current)
      }
    }, 5000) // Update location every 5 seconds
  }, [user, isAvailable])

  const stopLocationTracking = useCallback(() => {
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current)
      locationIntervalRef.current = null
    }
    if (user && currentLocation) {
      socketService.emit("driverLocationUpdate", {
        driverId: user.id,
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        isAvailable: false, // Set to unavailable when stopping tracking
      })
    }
    console.log("Location tracking stopped.")
  }, [user, currentLocation])

  useEffect(() => {
    if (isAvailable && !locationIntervalRef.current) {
      startLocationTracking()
    } else if (!isAvailable && locationIntervalRef.current) {
      stopLocationTracking()
    }
  }, [isAvailable, startLocationTracking, stopLocationTracking])

  useEffect(() => {
    const pendingBookingsChannel = supabase
      .channel("pending_bookings_channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bookings", filter: "status=eq.pending" },
        (payload) => {
          console.log("New pending booking received:", payload.new)
          fetchPendingBookings() // Re-fetch to update the pending list
        },
      )
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "bookings" }, (payload) => {
        console.log("Booking updated:", payload.new)
        // If a pending booking is accepted by someone else, remove it from pending list
        // If an active booking for this driver changes status, update it
        fetchPendingBookings()
      })
      .subscribe()

    socketService.on("bookingAccepted", (data: { bookingId: string; driverId: string }) => {
      if (data.driverId === user?.id) {
        console.log(`You accepted booking ${data.bookingId}`)
        fetchPendingBookings()
      } else {
        console.log(`Booking ${data.bookingId} accepted by another driver.`)
        // Remove from pending if it was there
        setPendingBookings((prev) => prev.filter((b) => b.id !== data.bookingId))
      }
    })

    socketService.on("bookingCancelled", (data: { bookingId: string; cancelledBy: string }) => {
      console.log(`Booking ${data.bookingId} cancelled by ${data.cancelledBy}`)
      fetchPendingBookings()
    })

    socketService.on("bookingCompleted", (data: { bookingId: string; driverId: string }) => {
      console.log(`Booking ${data.bookingId} completed by ${data.driverId}`)
      fetchPendingBookings()
    })

    return () => {
      supabase.removeChannel(pendingBookingsChannel)
      socketService.off("bookingAccepted")
      socketService.off("bookingCancelled")
      socketService.off("bookingCompleted")
      stopLocationTracking() // Ensure tracking stops on unmount
    }
  }, [user, fetchPendingBookings, stopLocationTracking])

  if (authLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>
  }

  if (!driverProfile || !user || user.user_metadata.role !== "driver") {
    return <div className="text-center text-gray-600">Driver profile not found.</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Driver Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {driverProfile.full_name || driverProfile.email}!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Manage your availability and view your assigned bookings.</p>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="availability-mode">Set Availability</Label>
              <Switch id="availability-mode" checked={isAvailable} onCheckedChange={handleAvailabilityChange} />
            </div>
            <p className="text-sm text-gray-500">Status: {isAvailable ? "Online (Accepting Bookings)" : "Offline"}</p>
            <button
              onClick={() => navigate("/driver/bookings")}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              View My Bookings
            </button>
            <button
              onClick={() => navigate("/driver/profile")}
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
            >
              Edit Profile
            </button>
          </CardContent>
        </Card>

        {user && <AmbulanceSimulator driverId={user.id} />}

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <button
              onClick={() => navigate("/driver/bookings")}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              Check Pending Requests
            </button>
            <button className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">
              View Completed Trips (Coming Soon)
            </button>
            {/* Add more quick actions as needed */}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">Driver Status</CardTitle>
            <CardDescription>Manage your availability and location tracking.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentLocation ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>
                  Current Location: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                </span>
              </div>
            ) : (
              <p className="text-sm text-red-500">Waiting for location data. Please enable geolocation.</p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Active Booking</CardTitle>
            <CardDescription>Your currently assigned and active ambulance booking.</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingBookings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onAccept={handleAcceptBooking}
                    showActions={true}
                    isDriverView={true}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">
                No active bookings. Accept a new request to start a trip.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DriverDashboard
