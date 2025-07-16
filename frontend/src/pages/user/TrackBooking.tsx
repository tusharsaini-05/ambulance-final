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
  driver_id: string | null
  driver_name: string | null
  driver_phone: string | null
  driver_vehicle_model: string | null
  driver_vehicle_plate: string | null
}

const UserTrackBooking: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [driverLocation, setDriverLocation] = useState<google.maps.LatLngLiteral | null>(null)
  const [routePath, setRoutePath] = useState<google.maps.LatLngLiteral[]>([])
  const [eta, setEta] = useState<string | null>(null)
  const { status: socketStatus } = useSocket()

  const bookingSubscriptionRef = useRef<any>(null)
  const driverLocationListenerRef = useRef<((data: { driverId: string; lat: number; lng: number }) => void) | null>(
    null,
  )

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
          users!bookings_driver_id_fkey(full_name, phone_number, vehicle_model, vehicle_plate, current_lat, current_lng)
        `)
        .eq("id", bookingId)
        .single()

      if (error) throw error
      if (data) {
        const driverData = data.users
        setBooking({
          ...data,
          driver_name: driverData?.full_name || null,
          driver_phone: driverData?.phone_number || null,
          driver_vehicle_model: driverData?.vehicle_model || null,
          driver_vehicle_plate: driverData?.vehicle_plate || null,
        })
        if (driverData?.current_lat && driverData?.current_lng) {
          setDriverLocation({ lat: driverData.current_lat, lng: driverData.current_lng })
        }
      }
    } catch (err: any) {
      console.error("Error fetching booking details:", err.message)
      setError("Failed to fetch booking details: " + err.message)
    } finally {
      setLoading(false)
    }
  }, [bookingId])

  useEffect(() => {
    fetchBookingDetails()

    // Setup Supabase Realtime for booking status and driver assignment updates
    try {
      bookingSubscriptionRef.current = supabase
        .channel(`booking_updates:${bookingId}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "bookings",
            filter: `id=eq.${bookingId}`,
          },
          async (payload) => {
            const updatedBooking = payload.new as Booking
            setBooking((prev) => {
              if (!prev) return null
              const newBooking = { ...prev, status: updatedBooking.status, driver_id: updatedBooking.driver_id }
              // If driver was just assigned, fetch driver details
              if (updatedBooking.driver_id && !prev.driver_id) {
                supabase
                  .from("users")
                  .select("full_name, phone_number, vehicle_model, vehicle_plate, current_lat, current_lng")
                  .eq("id", updatedBooking.driver_id)
                  .single()
                  .then(({ data, error }) => {
                    if (!error && data) {
                      setBooking((current) =>
                        current
                          ? {
                              ...current,
                              driver_name: data.full_name,
                              driver_phone: data.phone_number,
                              driver_vehicle_model: data.vehicle_model,
                              driver_vehicle_plate: data.vehicle_plate,
                            }
                          : null,
                      )
                      if (data.current_lat && data.current_lng) {
                        setDriverLocation({ lat: data.current_lat, lng: data.current_lng })
                      }
                    }
                  })
              }
              return newBooking
            })
            console.log("Booking status updated via Supabase:", updatedBooking.status)
          },
        )
        .subscribe()
    } catch (e) {
      console.error("Error subscribing to booking status:", e)
    }

    // Setup Socket.IO listener for driver location updates
    driverLocationListenerRef.current = (data: { driverId: string; lat: number; lng: number }) => {
      if (booking && booking.driver_id && data.driverId === booking.driver_id) {
        setDriverLocation({ lat: data.lat, lng: data.lng })
        console.log("Driver location updated via Socket.IO:", data)
      }
    }
    socketService.socket?.on("locationUpdate", driverLocationListenerRef.current)

    return () => {
      // Cleanup Supabase subscription
      if (bookingSubscriptionRef.current) {
        supabase.removeChannel(bookingSubscriptionRef.current)
        bookingSubscriptionRef.current = null
      }
      // Cleanup Socket.IO listener
      if (driverLocationListenerRef.current) {
        socketService.socket?.off("locationUpdate", driverLocationListenerRef.current)
        driverLocationListenerRef.current = null
      }
    }
  }, [bookingId, fetchBookingDetails, booking]) // Depend on booking to ensure driver_id is available for socket listener

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
      const destination = { lat: booking.pickup_lat, lng: booking.pickup_lng } // Driver goes to pickup first

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

  const handleCancelBooking = async () => {
    if (!bookingId) return

    setLoading(true)
    try {
      const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", bookingId)

      if (error) throw error

      // Emit socket event for booking status update
      socketService.emitBookingStatusUpdate(bookingId, "cancelled")
      setBooking((prev) => (prev ? { ...prev, status: "cancelled" } : null)) // Optimistic update
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

  if (!booking) {
    return <div className="text-center text-gray-600">Booking not found.</div>
  }

  const mapCenter = driverLocation || { lat: booking.pickup_lat, lng: booking.pickup_lng }
  const markers = []

  if (driverLocation) {
    markers.push({
      lat: driverLocation.lat,
      lng: driverLocation.lng,
      title: "Driver Location",
      icon: "/ambulance-icon.svg", // Custom ambulance icon
    })
  }
  markers.push({
    lat: booking.pickup_lat,
    lng: booking.pickup_lng,
    title: "Pickup Location",
    icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
  })
  if (booking.status === "in_progress" || booking.status === "completed") {
    markers.push({
      lat: booking.destination_lat,
      lng: booking.destination_lng,
      title: "Destination",
      icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
    })
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Track Your Ambulance</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <strong>Booking ID:</strong> {booking.id.substring(0, 8)}...
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

            {booking.driver_id ? (
              <>
                <p>
                  <strong>Driver:</strong> {booking.driver_name || "N/A"}
                </p>
                {booking.driver_phone && (
                  <p>
                    <strong>Driver Phone:</strong>{" "}
                    <a href={`tel:${booking.driver_phone}`} className="text-blue-500 hover:underline">
                      {booking.driver_phone}
                    </a>
                  </p>
                )}
                {booking.driver_vehicle_model && (
                  <p>
                    <strong>Vehicle:</strong> {booking.driver_vehicle_model} ({booking.driver_vehicle_plate})
                  </p>
                )}
                {eta && (
                  <p>
                    <strong>ETA to Pickup:</strong> {eta}
                  </p>
                )}
              </>
            ) : (
              <p className="text-yellow-600 font-medium">Searching for an available driver...</p>
            )}
            <p className="text-sm text-gray-500">
              Socket Status: {socketStatus.isConnected ? "Connected" : "Disconnected"}
            </p>

            {(booking.status === "pending" || booking.status === "accepted") && (
              <div className="mt-4">
                <Button onClick={handleCancelBooking} variant="destructive" disabled={loading}>
                  {loading ? "Cancelling..." : "Cancel Booking"}
                </Button>
              </div>
            )}
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

export default UserTrackBooking
