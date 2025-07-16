"use client"

// src/components/BookingCard.tsx
import type React from "react"
import { useAuth } from "../contexts/AuthContext.tsx"
import { useBooking } from "../contexts/BookingContext.tsx"

interface BookingCardProps {
  bookingId: string
}

const BookingCard: React.FC<BookingCardProps> = ({ bookingId }) => {
  const { user } = useAuth()
  const { bookings } = useBooking()

  const booking = bookings.find((b) => b.id === bookingId)

  if (!booking) {
    return <div>Booking not found.</div>
  }

  return (
    <div style={{ border: "1px solid #ccc", padding: "10px", margin: "10px" }}>
      <h3>Booking Details</h3>
      <p>Booking ID: {booking.id}</p>
      <p>User ID: {booking.userId}</p>
      <p>Room ID: {booking.roomId}</p>
      <p>Start Date: {booking.startDate}</p>
      <p>End Date: {booking.endDate}</p>
      {user && user.id === booking.userId && <p>This is your booking!</p>}
    </div>
  )
}

export default BookingCard
