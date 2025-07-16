"use client"

import type React from "react"
import { useEffect, useState, useRef, useCallback } from "react"
import { useParams } from "react-router-dom"
import { supabase } from "../../lib/supabase.ts"
import GoogleMap from "../../components/GoogleMap.tsx"
import LoadingSpinner from "../../components/LoadingSpinner.tsx"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.tsx"
import { Button } from "../../components/ui/button.tsx"
import { socketService } from "../../lib/socket.ts"
import { useSocket } from "../../hooks/useSocket.tsx"
import { useAuth } from "../../contexts/AuthContext.tsx"
import type { google } from "googlemaps" // Declare the google variable

interface Booking {
  id: string
  pickup_location: string
  destination: string
  status: string
  pickup_lat: number
  pickup_lng: number
  destination_lat: number
  destination_lng: number
  driver_id: string
  user_id: string
  user_name: string
}

const DriverTrackBooking: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>()
  const { user } = useAuth()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [driverLocation, setDriverLocation] = useState<google.maps.LatLngLiteral | null>(null)
  const [routePath, setRoutePath] = useState<google.maps.LatLngLiteral[]>([])
  const [eta, setEta] = useState<string | null>(null)
  const { status: socketStatus } = useSocket()

  const driverLocationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const bookingSubscriptionRef = useRef<any>(null)

  const fetchBookingDetails = useCallback(async () => {
    if (!bookingId) return

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
          pickup_lat,
          pickup_lng,
          destination_lat,
          destination_lng,
          driver_id,
          user_id,
          users!bookings_user_id_fkey(full_name)
        `)
        .eq("id", bookingId)
        .single()

      if (error) throw error
      if (data) {
        setBooking({ ...data, user_name: data.users?.full_name || "N/A" })
        // Set initial driver location if available
        if (user && data.driver_id === user.id) {
          const { data: driverData, error: driverError } = await supabase
            .from("users")
            .select("current_lat, current_lng")
            .eq("id", user.id)
            .single()
          if (!driverError && driverData && driverData.current_lat && driverData.current_lng) {
            setDriverLocation({ lat: driverData.current_lat, lng: driverData.current_lng })
          }
        }
      }
    } catch (err: any) {
      console.error("Error fetching booking details:", err.message)
      setError("Failed to fetch booking details: " + err.message)
    } finally {
      setLoading(false)
    }
  }, [bookingId, user])

  useEffect(() => {
    fetchBookingDetails()

    // Setup Supabase Realtime for booking status updates
    try {
      bookingSubscriptionRef.current = supabase
        .channel(`booking_status:${bookingId}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "bookings",
            filter: `id=eq.${bookingId}`,
          },
          (payload) => {
            const updatedBooking = payload.new as Booking
            setBooking((prev) => (prev ? { ...prev, status: updatedBooking.status } : null))
            console.log("Booking status updated via Supabase:", updatedBooking.status)
          },
        )
        .subscribe()
    } catch (e) {
      console.error("Error subscribing to booking status:", e)
    }

    // Setup Socket.IO listener for driver location updates
    const handleLocationUpdate = (data: { driverId: string; lat: number; lng: number }) => {
      if (booking && data.driverId === booking.driver_id) {
        setDriverLocation({ lat: data.lat, lng: data.lng })
        console.log("Driver location updated via Socket.IO:", data)
      }
    }

    socketService.socket?.on("locationUpdate", handleLocationUpdate)

    return () => {
      // Cleanup Supabase subscription
      if (bookingSubscriptionRef.current) {
        supabase.removeChannel(bookingSubscriptionRef.current)
        bookingSubscriptionRef.current = null
      }
      // Cleanup Socket.IO listener
      socketService.socket?.off("locationUpdate", handleLocationUpdate)
      // Clear any ongoing location simulation/tracking interval
      if (driverLocationIntervalRef.current) {
        clearInterval(driverLocationIntervalRef.current)
        driverLocationIntervalRef.current = null
      }
    }
  }, [bookingId, fetchBookingDetails, booking]) // Depend on booking to ensure driver_id is available for socket listener

  // Simulate driver location updates if this driver is tracking the booking
  useEffect(() => {
    if (
      booking &&
      user &&
      booking.driver_id === user.id &&
      booking.status === "accepted" &&
      !driverLocationIntervalRef.current
    ) {
      // Start a simple simulation or actual GPS tracking here
      // For now, let's just ensure the simulator is running or location is being emitted
      // The AmbulanceSimulator component handles emitting location updates
    }
  }, [booking, user])

  // Calculate and display route/ETA
  useEffect(() => {
    if (booking && driverLocation && window.google && window.google.maps) {
      const directionsService = new window.google.maps.DirectionsService()
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        map: window.google.maps.Map.prototype.map, // Use the map instance from GoogleMap component
        polylineOptions: { strokeColor: "#FF0000" },
        suppressMarkers: true, // We'll add custom markers
      })

      const origin = driverLocation
      const destination = { lat: booking.destination_lat, lng: booking.destination_lng }

      directionsService.route(
        {
          origin: origin,
          destination: destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (response, status) => {
          if (status === "OK" && response) {
            directionsRenderer.setDirections(response)
            const route = response.routes[0]
            const path = route.overview_path.map((point) => ({
              lat: point.lat(),
              lng: point.lng(),
            }))
            setRoutePath(path)

            const leg = route.legs[0]
            if (leg.duration) {
              setEta(leg.duration.text)
            }
          } else {
            console.error("Directions request failed due to " + status)
            setEta("N/A")
          }
        },
      )
    }
  }, [booking, driverLocation])

  const handleStatusUpdate = async (newStatus: string) => {
    if (!bookingId || !user) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: newStatus })
        .eq("id", bookingId)
        .eq("driver_id", user.id) // Ensure only assigned driver can update

      if (error) throw error

      // Emit socket event for status update
      socketService.emitBookingStatusUpdate(bookingId, newStatus)
      setBooking((prev) => (prev ? { ...prev, status: newStatus } : null)) // Optimistic update
    } catch (err: any) {
      console.error("Error updating booking status:", err.message)
      setError("Failed to update status: " + err.message)
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

  if (!booking) {
    return <div className="text-center text-gray-600">Booking not found.</div>
  }

  const mapCenter = driverLocation || { lat: booking.pickup_lat, lng: booking.pickup_lng }
  const markers = []

  if (driverLocation) {
    markers.push({
      lat: driverLocation.lat,
      lng: driverLocation.lng,
      title: "Your Location",
      icon: "/ambulance-icon.svg", // Custom ambulance icon
    })
  }
  markers.push({
    lat: booking.pickup_lat,
    lng: booking.pickup_lng,
    title: "Pickup Location",
    icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
  })
  markers.push({
    lat: booking.destination_lat,
    lng: booking.destination_lng,
    title: "Destination",
    icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
  })

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Track Booking: {booking.id.substring(0, 8)}...</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <strong>User:</strong> {booking.user_name}
            </p>
            <p>
              <strong>Pickup:</strong> {booking.pickup_location}
            </p>
            <p>
              <strong>Destination:</strong> {booking.destination}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={`font-semibold ${
                  booking.status === "pending"
                    ? "text-yellow-600"
                    : booking.status === "accepted"
                      ? "text-green-600"
                      : booking.status === "in_progress"
                        ? "text-blue-600"
                        : booking.status === "completed"
                          ? "text-gray-600"
                          : booking.status === "cancelled"
                            ? "text-red-600"
                            : ""
                }`}
              >
                {booking.status.toUpperCase()}
              </span>
            </p>
            {eta && (
              <p>
                <strong>ETA:</strong> {eta}
              </p>
            )}
            <p className="text-sm text-gray-500">
              Socket Status: {socketStatus.isConnected ? "Connected" : "Disconnected"}
            </p>

            <div className="flex flex-wrap gap-2 mt-4">
              {booking.status === "accepted" && (
                <Button onClick={() => handleStatusUpdate("in_progress")} className="bg-blue-500 hover:bg-blue-600">
                  Start Trip
                </Button>
              )}
              {booking.status === "in_progress" && (
                <Button onClick={() => handleStatusUpdate("completed")} className="bg-green-500 hover:bg-green-600">
                  Complete Trip
                </Button>
              )}
              {(booking.status === "accepted" || booking.status === "in_progress") && (
                <Button onClick={() => handleStatusUpdate("cancelled")} variant="destructive">
                  Cancel Trip
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Live Map</CardTitle>
          </CardHeader>
          <CardContent>
            <GoogleMap center={mapCenter} zoom={12} markers={markers} polylinePath={routePath} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DriverTrackBooking
