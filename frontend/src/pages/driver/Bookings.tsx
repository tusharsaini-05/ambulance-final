"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { supabase } from "../../lib/supabase.ts"
import { useAuth } from "../../contexts/AuthContext.tsx"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.tsx"
import BookingCard from "../../components/BookingCard.tsx"
import LoadingSpinner from "../../components/LoadingSpinner.tsx"
import { useNavigate } from "react-router-dom"
import { socketService } from "../../lib/socket.ts"

interface Booking {
  id: string
  pickup_location: string
  destination: string
  status: string
  created_at: string
  driver_id: string | null
  user_id: string
  user_name: string
}

const DriverBookings: React.FC = () => {
  const { user } = useAuth()
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([])
  const [acceptedBookings, setAcceptedBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const fetchBookings = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)
    try {
      // Fetch pending bookings (not assigned to any driver)
      const { data: pendingData, error: pendingError } = await supabase
        .from("bookings")
        .select(`
          id,
          pickup_location,
          destination,
          status,
          created_at,
          driver_id,
          user_id,
          users!bookings_user_id_fkey(full_name)
        `)
        .eq("status", "pending")
        .is("driver_id", null) // Only show bookings not yet accepted by any driver

      if (pendingError) throw pendingError

      const formattedPendingBookings = pendingData.map((b) => ({
        ...b,
        user_name: b.users?.full_name || "N/A",
      })) as Booking[]
      setPendingBookings(formattedPendingBookings)

      // Fetch bookings accepted by this driver
      const { data: acceptedData, error: acceptedError } = await supabase
        .from("bookings")
        .select(`
          id,
          pickup_location,
          destination,
          status,
          created_at,
          driver_id,
          user_id,
          users!bookings_user_id_fkey(full_name)
        `)
        .eq("driver_id", user.id)
        .in("status", ["accepted", "in_progress"]) // Show accepted and in-progress bookings

      if (acceptedError) throw acceptedError

      const formattedAcceptedBookings = acceptedData.map((b) => ({
        ...b,
        user_name: b.users?.full_name || "N/A",
      })) as Booking[]
      setAcceptedBookings(formattedAcceptedBookings)
    } catch (err: any) {
      console.error("Error fetching driver bookings:", err.message)
      setError("Failed to fetch bookings: " + err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchBookings()

    // Set up real-time listener for new booking requests
    const bookingChannel = supabase
      .channel("public:bookings")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "bookings" }, (payload) => {
        const newBooking = payload.new as Booking
        if (newBooking.status === "pending" && !newBooking.driver_id) {
          // Fetch user name for the new booking
          supabase
            .from("users")
            .select("full_name")
            .eq("id", newBooking.user_id)
            .single()
            .then(({ data, error }) => {
              if (!error && data) {
                setPendingBookings((prev) => [{ ...newBooking, user_name: data.full_name }, ...prev])
              } else {
                setPendingBookings((prev) => [{ ...newBooking, user_name: "N/A" }, ...prev])
              }
            })
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "bookings" }, (payload) => {
        const updatedBooking = payload.new as Booking
        if (
          updatedBooking.driver_id === user?.id &&
          (updatedBooking.status === "accepted" || updatedBooking.status === "in_progress")
        ) {
          // If this driver accepted it, move from pending to accepted
          setPendingBookings((prev) => prev.filter((b) => b.id !== updatedBooking.id))
          // Fetch user name for the updated booking
          supabase
            .from("users")
            .select("full_name")
            .eq("id", updatedBooking.user_id)
            .single()
            .then(({ data, error }) => {
              if (!error && data) {
                setAcceptedBookings((prev) => {
                  const existing = prev.find((b) => b.id === updatedBooking.id)
                  if (existing) {
                    return prev.map((b) =>
                      b.id === updatedBooking.id ? { ...updatedBooking, user_name: data.full_name } : b,
                    )
                  }
                  return [{ ...updatedBooking, user_name: data.full_name }, ...prev]
                })
              } else {
                setAcceptedBookings((prev) => {
                  const existing = prev.find((b) => b.id === updatedBooking.id)
                  if (existing) {
                    return prev.map((b) => (b.id === updatedBooking.id ? { ...updatedBooking, user_name: "N/A" } : b))
                  }
                  return [{ ...updatedBooking, user_name: "N/A" }, ...prev]
                })
              }
            })
        } else if (updatedBooking.status === "cancelled" || updatedBooking.status === "completed") {
          // Remove from both lists if cancelled or completed
          setPendingBookings((prev) => prev.filter((b) => b.id !== updatedBooking.id))
          setAcceptedBookings((prev) => prev.filter((b) => b.id !== updatedBooking.id))
        } else if (updatedBooking.status === "pending" && updatedBooking.driver_id !== user?.id) {
          // If another driver accepted it, remove from this driver's pending list
          setPendingBookings((prev) => prev.filter((b) => b.id !== updatedBooking.id))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(bookingChannel)
    }
  }, [fetchBookings, user])

  const handleAcceptBooking = async (bookingId: string) => {
    if (!user) {
      setError("You must be logged in to accept bookings.")
      return
    }
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("bookings")
        .update({ status: "accepted", driver_id: user.id })
        .eq("id", bookingId)
        .select()
        .single()

      if (error) throw error

      if (data) {
        // Emit socket event for booking acceptance
        socketService.emitBookingAccept(data.id, user.id)
        // Re-fetch to update lists correctly
        fetchBookings()
      }
    } catch (err: any) {
      console.error("Error accepting booking:", err.message)
      setError("Failed to accept booking: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleTrackBooking = (bookingId: string) => {
    navigate(`/driver/track/${bookingId}`)
  }

  const handleCancelBooking = async (bookingId: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", bookingId)

      if (error) throw error

      // Emit socket event for booking status update
      socketService.emitBookingStatusUpdate(bookingId, "cancelled")
      fetchBookings() // Re-fetch to update lists
    } catch (err: any) {
      console.error("Error cancelling booking:", err.message)
      setError("Failed to cancel booking: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Driver Bookings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingBookings.length === 0 ? (
              <p className="text-gray-600">No new booking requests at the moment.</p>
            ) : (
              pendingBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onAccept={handleAcceptBooking}
                  showActions={true}
                  isDriverView={true}
                />
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">My Accepted Bookings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {acceptedBookings.length === 0 ? (
              <p className="text-gray-600">You have no accepted bookings.</p>
            ) : (
              acceptedBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onTrack={handleTrackBooking}
                  onCancel={handleCancelBooking}
                  showActions={true}
                  isDriverView={true}
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DriverBookings
