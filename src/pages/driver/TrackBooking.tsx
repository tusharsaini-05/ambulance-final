"use client"

// src/pages/driver/TrackBooking.tsx
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext.tsx"
import { useBooking } from "../../contexts/BookingContext.tsx"
import GoogleMap from "../../components/GoogleMap.tsx"
import { useSocket } from "../../hooks/useSocket.js"

const TrackBooking = () => {
  const { bookingId } = useParams<{ bookingId: string }>()
  const { authData } = useAuth()
  const { booking, fetchBooking } = useBooking()
  const { socket } = useSocket()
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    if (bookingId) {
      fetchBooking(bookingId)
    }
  }, [bookingId, fetchBooking])

  useEffect(() => {
    if (socket && bookingId) {
      socket.emit("join_room", bookingId)

      socket.on("driver_location", (data) => {
        setDriverLocation(data)
      })

      return () => {
        socket.off("driver_location")
        socket.emit("leave_room", bookingId)
      }
    }
  }, [socket, bookingId])

  if (!booking) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>Track Booking {bookingId}</h1>
      {driverLocation && (
        <div>
          <p>
            Driver Location: Lat: {driverLocation.lat}, Lng: {driverLocation.lng}
          </p>
        </div>
      )}
      <GoogleMap
        driverLocation={driverLocation}
        pickupLocation={{ lat: booking.pickup_latitude, lng: booking.pickup_longitude }}
        dropoffLocation={{ lat: booking.dropoff_latitude, lng: booking.dropoff_longitude }}
      />
    </div>
  )
}

export default TrackBooking
