"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Loader } from "@googlemaps/js-api-loader"
import * as google from "google.maps"

interface GoogleMapProps {
  center: google.maps.LatLngLiteral
  zoom: number
  markers?: { lat: number; lng: number; title?: string; icon?: string }[]
  polylinePath?: google.maps.LatLngLiteral[]
  onMapClick?: (latLng: google.maps.LatLngLiteral) => void
}

const GoogleMap: React.FC<GoogleMapProps> = ({ center, zoom, markers, polylinePath, onMapClick }) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const googleMap = useRef<google.maps.Map | null>(null)
  const currentMarkers = useRef<google.maps.Marker[]>([])
  const currentPolyline = useRef<google.maps.Polyline | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      console.error("Google Maps API Key is not set. Cannot load map.")
      return
    }

    const loader = new Loader({
      apiKey: apiKey,
      version: "weekly",
      libraries: ["places"],
    })

    loader
      .load()
      .then(() => {
        if (mapRef.current) {
          googleMap.current = new google.maps.Map(mapRef.current, {
            center,
            zoom,
            mapId: "YOUR_MAP_ID", // Optional: Use a Cloud-based map ID for custom styling
          })
          setMapLoaded(true)

          if (onMapClick) {
            googleMap.current.addListener("click", (e: google.maps.MapMouseEvent) => {
              if (e.latLng) {
                onMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() })
              }
            })
          }
        }
      })
      .catch((e) => {
        console.error("Error loading Google Maps API: ", e)
      })
  }, [center, zoom, onMapClick])

  useEffect(() => {
    if (!mapLoaded || !googleMap.current) return

    // Update markers
    currentMarkers.current.forEach((marker) => marker.setMap(null))
    currentMarkers.current = []
    markers?.forEach((markerData) => {
      const marker = new google.maps.Marker({
        position: { lat: markerData.lat, lng: markerData.lng },
        map: googleMap.current,
        title: markerData.title,
        icon: markerData.icon,
      })
      currentMarkers.current.push(marker)
    })

    // Update polyline
    if (currentPolyline.current) {
      currentPolyline.current.setMap(null)
    }
    if (polylinePath && polylinePath.length > 1) {
      currentPolyline.current = new google.maps.Polyline({
        path: polylinePath,
        geodesic: true,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 2,
      })
      currentPolyline.current.setMap(googleMap.current)
    }

    // Center map if center prop changes
    googleMap.current.setCenter(center)
  }, [mapLoaded, center, markers, polylinePath])

  return <div ref={mapRef} style={{ width: "100%", height: "500px" }} className="rounded-lg shadow-md" />
}

export default GoogleMap
