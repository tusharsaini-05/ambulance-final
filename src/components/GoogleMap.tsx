"use client"

// src/components/GoogleMap.tsx
import type React from "react"
import { useState, useEffect, useRef } from "react"
import { MapPin } from "lucide-react"
import type * as google from "google.maps"

interface GoogleMapProps {
  apiKey: string
  center: { lat: number; lng: number }
  zoom: number
  markers?: { lat: number; lng: number; info?: string }[]
  onMapClick?: (location: { lat: number; lng: number }) => void
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void
  pickupLocation?: { lat: number; lng: number }
  dropoffLocation?: { lat: number; lng: number }
  ambulanceLocation?: { lat: number; lng: number }
  showUserLocation?: boolean
  showRoute?: boolean
  trackingMode?: boolean
  routeData?: any
  className?: string
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  apiKey,
  center,
  zoom = 13,
  markers = [],
  onMapClick,
  onLocationSelect,
  pickupLocation,
  dropoffLocation,
  ambulanceLocation,
  showUserLocation = true,
  showRoute = false,
  trackingMode = false,
  routeData = null,
  className = "w-full h-96",
}) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])

  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (document.querySelector(`[src*="maps.googleapis.com"]`)) {
        return Promise.resolve()
      }

      return new Promise((resolve, reject) => {
        const script = document.createElement("script")
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`
        script.async = true
        script.defer = true
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      })
    }

    const initializeMap = async () => {
      try {
        await loadGoogleMapsScript()

        if (mapRef.current && window.google) {
          const mapInstance = new window.google.maps.Map(mapRef.current, {
            center: center || { lat: 40.7128, lng: -74.006 }, // Default to NYC
            zoom,
            styles: [
              {
                featureType: "poi.business",
                stylers: [{ visibility: "off" }],
              },
              {
                featureType: "poi.park",
                elementType: "labels.text",
                stylers: [{ visibility: "off" }],
              },
            ],
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          })

          setMap(mapInstance)

          // Initialize directions renderer
          const renderer = new window.google.maps.DirectionsRenderer({
            suppressMarkers: false,
            polylineOptions: {
              strokeColor: "#dc2626",
              strokeWeight: 4,
              strokeOpacity: 0.8,
            },
          })
          renderer.setMap(mapInstance)
          setDirectionsRenderer(renderer)

          // Add click listener (only if not in tracking mode)
          if (!trackingMode && (onMapClick || onLocationSelect)) {
            mapInstance.addListener("click", async (event) => {
              const lat = event.latLng.lat()
              const lng = event.latLng.lng()

              if (onMapClick) {
                onMapClick({ lat, lng })
              }

              if (onLocationSelect) {
                try {
                  // Reverse geocode to get address
                  const geocoder = new window.google.maps.Geocoder()
                  geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                    if (status === "OK" && results[0]) {
                      onLocationSelect({
                        lat,
                        lng,
                        address: results[0].formatted_address,
                      })
                    } else {
                      onLocationSelect({
                        lat,
                        lng,
                        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
                      })
                    }
                  })
                } catch (error) {
                  console.error("Error reverse geocoding:", error)
                  onLocationSelect({
                    lat,
                    lng,
                    address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
                  })
                }
              }
            })
          }
        }
      } catch (error) {
        console.error("Failed to load Google Maps:", error)
      }
    }

    initializeMap()

    return () => {
      // Cleanup markers
      markersRef.current.forEach((marker) => marker.setMap(null))
      markersRef.current = []
    }
  }, [apiKey, center, zoom, onMapClick, onLocationSelect, trackingMode])

  // Get user location
  useEffect(() => {
    if (showUserLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setUserLocation(location)

          if (map && !center) {
            map.setCenter(location)
          }
        },
        (error) => {
          console.warn("Error getting user location:", error)
        },
      )
    }
  }, [map, showUserLocation, center])

  // Update markers
  useEffect(() => {
    if (!map) return

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []

    // Add pickup location marker
    if (pickupLocation) {
      const pickupMarker = new window.google.maps.Marker({
        position: { lat: pickupLocation.lat, lng: pickupLocation.lng },
        map,
        title: "Pickup Location",
        icon: {
          url:
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="green" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
        },
      })
      markersRef.current.push(pickupMarker)
    }

    // Add dropoff location marker
    if (dropoffLocation) {
      const dropoffMarker = new window.google.maps.Marker({
        position: { lat: dropoffLocation.lat, lng: dropoffLocation.lng },
        map,
        title: "Hospital Location",
        icon: {
          url:
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="red" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <path d="M9 10h6"/>
              <path d="M12 7v6"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
        },
      })
      markersRef.current.push(dropoffMarker)
    }

    // Add ambulance location marker
    if (ambulanceLocation) {
      const ambulanceMarker = new window.google.maps.Marker({
        position: { lat: ambulanceLocation.lat, lng: ambulanceLocation.lng },
        map,
        title: "Ambulance Location",
        icon: {
          url:
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="red" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 10H6"/>
              <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
              <path d="M19 18h2a1 1 0 0 0 1-1v-3.28a1 1 0 0 0-.684-.948l-1.923-.641a1 1 0 0 1-.578-.502l-1.539-3.076A1 1 0 0 0 16.382 8H14"/>
              <path d="M8 8v4"/>
              <path d="M9 18h6"/>
              <circle cx="17" cy="18" r="2"/>
              <circle cx="7" cy="18" r="2"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 20),
        },
        animation: window.google.maps.Animation.BOUNCE,
      })
      markersRef.current.push(ambulanceMarker)
    }

    // Add other markers
    markers.forEach((markerData) => {
      const marker = new window.google.maps.Marker({
        position: markerData.position,
        map,
        title: markerData.title,
        icon: markerData.icon || {
          url:
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="blue" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
        },
      })

      if (markerData.infoWindow) {
        const infoWindow = new window.google.maps.InfoWindow({
          content: markerData.infoWindow,
        })

        marker.addListener("click", () => {
          infoWindow.open(map, marker)
        })
      }

      markersRef.current.push(marker)
    })

    // Add user location marker
    if (userLocation && showUserLocation && !trackingMode) {
      const userMarker = new window.google.maps.Marker({
        position: userLocation,
        map,
        title: "Your Location",
        icon: {
          url:
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="blue" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="4"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(24, 24),
        },
      })

      markersRef.current.push(userMarker)
    }
  }, [map, markers, userLocation, showUserLocation, pickupLocation, dropoffLocation, ambulanceLocation, trackingMode])

  // Handle route display
  useEffect(() => {
    if (!map || !directionsRenderer || !showRoute) return

    if (pickupLocation && dropoffLocation) {
      const directionsService = new window.google.maps.DirectionsService()

      directionsService.route(
        {
          origin: { lat: pickupLocation.lat, lng: pickupLocation.lng },
          destination: { lat: dropoffLocation.lat, lng: dropoffLocation.lng },
          travelMode: window.google.maps.TravelMode.DRIVING,
          unitSystem: window.google.maps.UnitSystem.METRIC,
          avoidHighways: false,
          avoidTolls: false,
        },
        (result, status) => {
          if (status === "OK") {
            directionsRenderer.setDirections(result)

            // Fit map to show entire route
            const bounds = new window.google.maps.LatLngBounds()
            bounds.extend({ lat: pickupLocation.lat, lng: pickupLocation.lng })
            bounds.extend({ lat: dropoffLocation.lat, lng: dropoffLocation.lng })
            if (ambulanceLocation) {
              bounds.extend({ lat: ambulanceLocation.lat, lng: ambulanceLocation.lng })
            }
            map.fitBounds(bounds)
          } else {
            console.error("Directions request failed:", status)
          }
        },
      )
    } else {
      // Clear directions if no route should be shown
      directionsRenderer.setDirections({ routes: [] })
    }
  }, [map, directionsRenderer, showRoute, pickupLocation, dropoffLocation, ambulanceLocation])

  return (
    <div className={`relative ${className}`}>
      <div ref={mapRef} className="w-full h-full rounded-lg" />

      {!window.google && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default GoogleMap
