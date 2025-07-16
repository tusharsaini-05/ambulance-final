"use client"
// Update the import paths for AuthContext, BookingContext, BookingCard, GoogleMap, AmbulanceSimulator, and useSocket
import { useAuth } from "../../contexts/AuthContext.tsx"
import { useBooking } from "../../contexts/BookingContext.tsx"
import BookingCard from "../../components/BookingCard.tsx"
import GoogleMap from "../../components/GoogleMap.tsx"
import AmbulanceSimulator from "../../components/AmbulanceSimulator.tsx"
import { useSocket } from "../../hooks/useSocket.js"

const Dashboard = () => {
  const { authData } = useAuth()
  const { booking } = useBooking()
  const { socket } = useSocket()

  return (
    <div>
      <h1>Driver Dashboard</h1>
      {authData && <p>Welcome, Driver {authData.name}!</p>}
      {booking && <BookingCard booking={booking} />}
      <GoogleMap />
      <AmbulanceSimulator socket={socket} />
    </div>
  )
}

export default Dashboard
