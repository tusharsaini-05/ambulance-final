"use client"

import { useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext.tsx"
import { useBooking } from "../../contexts/BookingContext.tsx"
import BookingCard from "../../components/BookingCard.tsx"

const BookingHistory = () => {
  const { user } = useAuth()
  const { bookings, fetchBookings } = useBooking()

  useEffect(() => {
    if (user) {
      fetchBookings(user.uid)
    }
  }, [user, fetchBookings])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Booking History</h1>
      {bookings && bookings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      ) : (
        <p>No bookings found.</p>
      )}
    </div>
  )
}

export default BookingHistory
