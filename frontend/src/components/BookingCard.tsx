"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card.tsx"
import { Button } from "./ui/button.tsx"
import { format } from "date-fns"

interface BookingCardProps {
  booking: {
    id: string
    pickup_location: string
    destination: string
    status: string
    created_at: string
    driver_id?: string | null
    user_id?: string
    driver_name?: string | null
    user_name?: string | null
  }
  onAccept?: (bookingId: string) => void
  onTrack?: (bookingId: string) => void
  onCancel?: (bookingId: string) => void
  showActions?: boolean
  isDriverView?: boolean
}

const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onAccept,
  onTrack,
  onCancel,
  showActions = true,
  isDriverView = false,
}) => {
  const formattedDate = format(new Date(booking.created_at), "PPP p")

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Booking ID: {booking.id.substring(0, 8)}...</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p>
          <strong>From:</strong> {booking.pickup_location}
        </p>
        <p>
          <strong>To:</strong> {booking.destination}
        </p>
        <p>
          <strong>Status:</strong>{" "}
          <span
            className={`font-semibold ${
              booking.status === "pending"
                ? "text-yellow-600"
                : booking.status === "accepted"
                  ? "text-green-600"
                  : booking.status === "completed"
                    ? "text-blue-600"
                    : booking.status === "cancelled"
                      ? "text-red-600"
                      : ""
            }`}
          >
            {booking.status.toUpperCase()}
          </span>
        </p>
        <p>
          <strong>Booked On:</strong> {formattedDate}
        </p>
        {isDriverView && booking.user_name && (
          <p>
            <strong>User:</strong> {booking.user_name}
          </p>
        )}
        {!isDriverView && booking.driver_name && (
          <p>
            <strong>Driver:</strong> {booking.driver_name}
          </p>
        )}

        {showActions && (
          <div className="flex flex-wrap gap-2 mt-4">
            {booking.status === "pending" && isDriverView && onAccept && (
              <Button onClick={() => onAccept(booking.id)} className="bg-green-500 hover:bg-green-600">
                Accept
              </Button>
            )}
            {(booking.status === "accepted" || booking.status === "in_progress") && onTrack && (
              <Button onClick={() => onTrack(booking.id)} className="bg-blue-500 hover:bg-blue-600">
                Track
              </Button>
            )}
            {(booking.status === "pending" || booking.status === "accepted") && onCancel && (
              <Button onClick={() => onCancel(booking.id)} variant="destructive">
                Cancel
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default BookingCard
