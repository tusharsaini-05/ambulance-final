"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { supabase } from "../../lib/supabase.ts"
import { useAuth } from "../../contexts/AuthContext.tsx"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.tsx"
import { Label } from "../../components/ui/label.tsx"
import { Input } from "../../components/ui/input.tsx"
import { Button } from "../../components/ui/button.tsx"
import GoogleMap from "../../components/GoogleMap.tsx"
import LoadingSpinner from "../../components/LoadingSpinner.tsx"
import { useNavigate } from "react-router-dom"
import { socketService } from "../../lib/socket.ts"
import type { google } from "google-maps"

const BookAmbulance: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [pickupLocation, setPickupLocation] = useState("")
  const [destination, setDestination] = useState("")
  const [pickupCoords, setPickupCoords] = useState<google.maps.LatLngLiteral | null>(null)
  const [destinationCoords, setDestinationCoords] = useState<google.maps.LatLngLiteral | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const pickupAutocompleteRef = useRef<HTMLInputElement>(null)
  const destinationAutocompleteRef = useRef<HTMLInputElement>(null)
  const pickupAutocomplete = useRef<google.maps.places.Autocomplete | null>(null)
  const destinationAutocomplete = useRef<google.maps.places.Autocomplete | null>(null)

  const defaultCenter = { lat: 28.7041, lng: 77.1025 } // Default to Delhi, India

  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      if (pickupAutocompleteRef.current) {
        pickupAutocomplete.current = new window.google.maps.places.Autocomplete(pickupAutocompleteRef.current, {
          componentRestrictions: { country: "in" }, // Restrict to India
        })
        pickupAutocomplete.current.addListener("place_changed", () => {
          const place = pickupAutocomplete.current?.getPlace()
          if (place?.geometry?.location) {
            setPickupLocation(place.formatted_address || place.name || "")
            setPickupCoords({
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            })
          }
        })
      }

      if (destinationAutocompleteRef.current) {
        destinationAutocomplete.current = new window.google.maps.places.Autocomplete(
          destinationAutocompleteRef.current,
          {
            componentRestrictions: { country: "in" }, // Restrict to India
          },
        )
        destinationAutocomplete.current.addListener("place_changed", () => {
          const place = destinationAutocomplete.current?.getPlace()
          if (place?.geometry?.location) {
            setDestination(place.formatted_address || place.name || "")
            setDestinationCoords({
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            })
          }
        })
      }
    }
  }, [])

  const handleMapClick = (latLng: google.maps.LatLngLiteral) => {
    // Reverse geocode to get address for clicked location
    if (window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder()
      geocoder.geocode({ location: latLng }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          // For simplicity, let's set the clicked location as destination
          setDestination(results[0].formatted_address)
          setDestinationCoords(latLng)
        } else {
          console.error("Geocoder failed due to: " + status)
        }
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!user) {
      setError("You must be logged in to book an ambulance.")
      return
    }

    if (!pickupCoords || !destinationCoords) {
      setError("Please select both pickup and destination locations on the map or by typing.")
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("bookings")
        .insert({
          user_id: user.id,
          pickup_location: pickupLocation,
          pickup_lat: pickupCoords.lat,
          pickup_lng: pickupCoords.lng,
          destination: destination,
          destination_lat: destinationCoords.lat,
          destination_lng: destinationCoords.lng,
          status: "pending", // Initially pending, driver will accept
        })
        .select()
        .single()

      if (error) throw error

      if (data) {
        setSuccess("Ambulance requested successfully! Waiting for a driver to accept.")
        // Emit a socket event for the new booking request
        socketService.emitBookingRequest(data)
        navigate(`/user/track/${data.id}`) // Navigate to tracking page
      }
    } catch (err: any) {
      console.error("Error booking ambulance:", err.message)
      setError("Failed to book ambulance: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const mapMarkers = []
  if (pickupCoords) {
    mapMarkers.push({
      lat: pickupCoords.lat,
      lng: pickupCoords.lng,
      title: "Pickup",
      icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
    })
  }
  if (destinationCoords) {
    mapMarkers.push({
      lat: destinationCoords.lat,
      lng: destinationCoords.lng,
      title: "Destination",
      icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
    })
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Book an Ambulance</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pickupLocation">Pickup Location</Label>
                <Input
                  id="pickupLocation"
                  type="text"
                  placeholder="Enter pickup location"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  ref={pickupAutocompleteRef}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  type="text"
                  placeholder="Enter destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  ref={destinationAutocompleteRef}
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {success && <p className="text-green-500 text-sm">{success}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <LoadingSpinner /> : "Request Ambulance"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Select on Map</CardTitle>
          </CardHeader>
          <CardContent>
            <GoogleMap
              center={pickupCoords || defaultCenter}
              zoom={pickupCoords || destinationCoords ? 14 : 10}
              markers={mapMarkers}
              onMapClick={handleMapClick}
            />
            <p className="text-sm text-gray-500 mt-2">Click on the map to set destination.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default BookAmbulance
