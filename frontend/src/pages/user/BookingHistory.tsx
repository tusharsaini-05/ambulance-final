"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { supabase } from "../../lib/supabase.ts"
import { useAuth } from "../../contexts/AuthContext.tsx"
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
  driver_id?: string | null
  user_id?: string
  driver_name?: string | null
}

const UserBookingHistory: React.FC = () => {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const fetchBookings = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id,
          pickup_location,
          destination,
          status,
          created_at,
          driver_id,
          user_id,
          users!bookings_driver_id_fkey(full_name)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      const formattedBookings = data.map((b) => ({
        ...b,
        driver_name: b.users?.full_name || "N/A",
      })) as Booking[]
      setBookings(formattedBookings)
    } catch (err: any) {
      console.error("Error fetching bookings:", err.message)
      setError("Failed to fetch bookings: " + err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchBookings()

    // Set up real-time listener for booking status updates
    const bookingChannel = supabase
      .channel(`user_bookings:${user?.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bookings",
          filter: `user_id=eq.${user?.id}`,
        },
        (payload) => {
          const updatedBooking = payload.new as Booking
          setBookings((prev) =>
            prev.map((b) =>
              b.id === updatedBooking.id
                ? {
                    ...b,
                    status: updatedBooking.status,
                    driver_id: updatedBooking.driver_id,
                    // If driver_id is updated, refetch driver name
                    driver_name: updatedBooking.driver_id ? b.driver_name || "Fetching..." : null,
                  }
                : b,
            ),
          )
          // If a driver was assigned, fetch their name
          if (updatedBooking.driver_id && updatedBooking.driver_id !== user?.id) {
            supabase
              .from("users")
              .select("full_name")
              .eq("id", updatedBooking.driver_id)
              .single()
              .then(({ data, error }) => {
                if (!error && data) {
                  setBookings((prev) =>
                    prev.map((b) => (b.id === updatedBooking.id ? { ...b, driver_name: data.full_name } : b)),
                  )
                }
              })
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(bookingChannel)
    }
  }, [fetchBookings, user])

  const handleTrackBooking = (bookingId: string) => {
    navigate(`/user/track/${bookingId}`)
  }

  const handleCancelBooking = async (bookingId: string) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId)
        .eq("user_id", user?.id) // Ensure only the booking owner can cancel

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
      <h1 className="text-3xl font-bold mb-6 text-center">My Booking History</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bookings.length === 0 ? (
          <p className="col-span-full text-center text-gray-600">You haven't made any bookings yet.</p>
        ) : (
          bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onTrack={
                booking.status === "accepted" || booking.status === "in_progress" ? handleTrackBooking : undefined
              }
              onCancel={booking.status === "pending" || booking.status === "accepted" ? handleCancelBooking : undefined}
              showActions={true}
              isDriverView={false}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default UserBookingHistory
