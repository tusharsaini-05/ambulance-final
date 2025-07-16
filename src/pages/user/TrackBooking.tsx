"use client"

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext.tsx"
import { useBooking } from "../../contexts/BookingContext.tsx"
import GoogleMap from "../../components/GoogleMap.tsx"
import { useSocket } from "../../hooks/useSocket.js"

const TrackBooking = () => {
  const { bookingId } = useParams<{ bookingId: string }>()
  const { authData } = useAuth()
  const { getBooking } = useBooking()
  const [booking, setBooking] = useState<any>(null)
  const [driverLocation, setDriverLocation] = useState<any>(null)
  const { socket } = useSocket()

  useEffect(() => {
    const fetchBooking = async () => {
      if (bookingId && authData?.token) {
        try {
          const fetchedBooking = await getBooking(bookingId, authData.token)
          setBooking(fetchedBooking)
        } catch (error) {
          console.error("Error fetching booking:", error)
        }
      }
    }

    fetchBooking()
  }, [bookingId, authData?.token, getBooking])

  useEffect(() => {
    if (socket && booking?.driverId) {
      socket.emit("join-driver-room", booking.driverId)

      socket.on("driver-location", (location) => {
        setDriverLocation(location)
      })

      return () => {
        socket.off("driver-location")
        socket.emit("leave-driver-room", booking.driverId)
      }
    }
  }, [socket, booking?.driverId])

  if (!booking) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>Track Your Booking</h1>
      <p>Booking ID: {booking.id}</p>
      <p>Status: {booking.status}</p>
      {driverLocation && (
        <div>
          <h2>Driver Location</h2>
          <p>Latitude: {driverLocation.latitude}</p>
          <p>Longitude: {driverLocation.longitude}</p>
          <GoogleMap
            userLocation={{
              lat: booking.pickupLocation.latitude,
              lng: booking.pickupLocation.longitude,
            }}
            driverLocation={{
              lat: driverLocation.latitude,
              lng: driverLocation.longitude,
            }}
          />
        </div>
      )}
    </div>
  )
}

export default TrackBooking
