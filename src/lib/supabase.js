import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Database helper functions
export const db = {
  // Users
  async getUser(userId) {
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

    if (error) throw error

    // Separately fetch driver data if user is a driver
    if (data && data.role === "driver") {
      const { data: driverData, error: driverError } = await supabase
        .from("drivers")
        .select("*")
        .eq("id", userId)
        .single()

      if (!driverError && driverData) {
        data.drivers = driverData
      }
    }

    return data
  },

  async updateUser(userId, updates) {
    const { data, error } = await supabase.from("users").update(updates).eq("id", userId).select().single()

    if (error) throw error
    return data
  },

  // Drivers
  async getAvailableDrivers() {
    const { data, error } = await supabase
      .from("drivers")
      .select(`
        *,
        users (
          id,
          full_name,
          phone,
          email
        )
      `)
      .eq("is_available", true)
      .eq("is_verified", true)
      .order("last_location_update", { ascending: false })

    if (error) throw error
    return data
  },

  async updateDriverAvailability(driverId, isAvailable) {
    const { data, error } = await supabase
      .from("drivers")
      .update({
        is_available: isAvailable,
        last_location_update: new Date().toISOString(),
      })
      .eq("id", driverId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateDriverLocation(driverId, lat, lng) {
    const { data, error } = await supabase
      .from("drivers")
      .update({
        current_lat: lat,
        current_lng: lng,
        last_location_update: new Date().toISOString(),
      })
      .eq("id", driverId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async findNearestDriver(pickupLat, pickupLng) {
    // Get all available drivers
    const drivers = await this.getAvailableDrivers()

    if (drivers.length === 0) {
      throw new Error("No drivers available")
    }

    // Calculate distance using Haversine formula
    const calculateDistance = (lat1, lng1, lat2, lng2) => {
      const R = 6371 // Earth's radius in kilometers
      const dLat = ((lat2 - lat1) * Math.PI) / 180
      const dLng = ((lng2 - lng1) * Math.PI) / 180
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      return R * c
    }

    // Find nearest driver
    let nearestDriver = null
    let minDistance = Number.POSITIVE_INFINITY

    drivers.forEach((driver) => {
      if (driver.current_lat && driver.current_lng) {
        const distance = calculateDistance(pickupLat, pickupLng, driver.current_lat, driver.current_lng)
        if (distance < minDistance) {
          minDistance = distance
          nearestDriver = driver
        }
      }
    })

    if (!nearestDriver) {
      // If no driver has location data, return the first available one
      nearestDriver = drivers[0]
    }

    return nearestDriver
  },

  // Pickup Locations
  async getPickupLocations() {
    const { data, error } = await supabase
      .from("pickup_locations")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  },

  async createPickupLocation(locationData) {
    const { data, error } = await supabase.from("pickup_locations").insert([locationData]).select().single()

    if (error) throw error
    return data
  },

  // Hospital Locations
  async getHospitalLocations() {
    const { data, error } = await supabase.from("hospital_locations").select("*").order("name", { ascending: true })

    if (error) throw error
    return data
  },

  // Bookings
  async createBooking(bookingData) {
    // Create the booking without driver assignment
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert([
        {
          ...bookingData,
          status: "pending", // Always start as pending
        },
      ])
      .select(`
        *,
        users (
          id,
          full_name,
          phone
        ),
        pickup_locations (
          id,
          name,
          latitude,
          longitude
        ),
        hospital_locations (
          id,
          name,
          address,
          latitude,
          longitude
        )
      `)
      .single()

    if (bookingError) throw bookingError

    // Notify all available drivers about the new booking
    try {
      const availableDrivers = await this.getAvailableDrivers()

      // Here you would typically send notifications to drivers
      // For now, we'll just log it
      console.log(`New booking ${booking.id} available for ${availableDrivers.length} drivers`)
    } catch (error) {
      console.warn("Could not notify drivers:", error)
    }

    return booking
  },

  async getBooking(bookingId) {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        users (
          id,
          full_name,
          phone,
          avatar_url
        ),
        drivers (
          id,
          vehicle_number,
          vehicle_type,
          current_lat,
          current_lng,
          last_location_update,
          users (
            id,
            full_name,
            phone,
            avatar_url
          )
        ),
        pickup_locations (
          id,
          name,
          latitude,
          longitude
        ),
        hospital_locations (
          id,
          name,
          address,
          latitude,
          longitude
        )
      `)
      .eq("id", bookingId)
      .single()

    if (error) throw error
    return data
  },

  async acceptBooking(bookingId, driverId) {
    // First check if booking is still available
    const { data: currentBooking } = await supabase
      .from("bookings")
      .select("status, driver_id")
      .eq("id", bookingId)
      .single()

    if (currentBooking.status !== "pending") {
      throw new Error("Booking is no longer available")
    }

    // Accept the booking
    const { data, error } = await supabase
      .from("bookings")
      .update({
        driver_id: driverId,
        status: "accepted",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", bookingId)
      .eq("status", "pending") // Ensure it's still pending
      .select(`
        *,
        users (
          id,
          full_name,
          phone
        ),
        pickup_locations (
          id,
          name,
          latitude,
          longitude
        ),
        hospital_locations (
          id,
          name,
          address,
          latitude,
          longitude
        )
      `)
      .single()

    if (error) throw error

    // Mark driver as unavailable
    await this.updateDriverAvailability(driverId, false)

    return data
  },

  async updateBookingStatus(bookingId, status, updates = {}) {
    const { data, error } = await supabase
      .from("bookings")
      .update({
        status,
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId)
      .select(`
        *,
        drivers (
          id,
          vehicle_number,
          vehicle_type,
          current_lat,
          current_lng,
          users (
            id,
            full_name,
            phone
          )
        )
      `)
      .single()

    if (error) throw error

    // If booking is completed or cancelled, make driver available again
    if (status === "completed" || status === "cancelled") {
      const booking = await this.getBooking(bookingId)
      if (booking.driver_id) {
        await this.updateDriverAvailability(booking.driver_id, true)
      }
    }

    return data
  },

  async getUserBookings(userId) {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        drivers (
          id,
          vehicle_number,
          vehicle_type,
          current_lat,
          current_lng,
          users (
            id,
            full_name,
            phone
          )
        ),
        pickup_locations (
          id,
          name,
          latitude,
          longitude
        ),
        hospital_locations (
          id,
          name,
          address,
          latitude,
          longitude
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  },

  async getDriverBookings(driverId) {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        users (
          id,
          full_name,
          phone,
          avatar_url
        ),
        pickup_locations (
          id,
          name,
          latitude,
          longitude
        ),
        hospital_locations (
          id,
          name,
          address,
          latitude,
          longitude
        )
      `)
      .eq("driver_id", driverId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  },

  async getPendingBookings() {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        users (
          id,
          full_name,
          phone
        ),
        pickup_locations (
          id,
          name,
          latitude,
          longitude
        ),
        hospital_locations (
          id,
          name,
          address,
          latitude,
          longitude
        )
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: true }) // Oldest first

    if (error) throw error
    return data
  },
}

// Google Maps helper functions
export const mapsHelper = {
  async calculateRoute(origin, destination) {
    if (!window.google || !window.google.maps) {
      throw new Error("Google Maps not loaded")
    }

    const directionsService = new window.google.maps.DirectionsService()

    return new Promise((resolve, reject) => {
      directionsService.route(
        {
          origin: origin,
          destination: destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
          unitSystem: window.google.maps.UnitSystem.METRIC,
          avoidHighways: false,
          avoidTolls: false,
        },
        (result, status) => {
          if (status === "OK") {
            const route = result.routes[0]
            const leg = route.legs[0]

            resolve({
              distance: leg.distance.text,
              duration: leg.duration.text,
              polyline: route.overview_polyline,
              steps: leg.steps,
            })
          } else {
            reject(new Error(`Directions request failed: ${status}`))
          }
        },
      )
    })
  },

  async geocodeAddress(address) {
    if (!window.google || !window.google.maps) {
      throw new Error("Google Maps not loaded")
    }

    const geocoder = new window.google.maps.Geocoder()

    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === "OK" && results[0]) {
          const location = results[0].geometry.location
          resolve({
            lat: location.lat(),
            lng: location.lng(),
            formatted_address: results[0].formatted_address,
          })
        } else {
          reject(new Error(`Geocoding failed: ${status}`))
        }
      })
    })
  },

  async reverseGeocode(lat, lng) {
    if (!window.google || !window.google.maps) {
      throw new Error("Google Maps not loaded")
    }

    const geocoder = new window.google.maps.Geocoder()

    return new Promise((resolve, reject) => {
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results[0]) {
          resolve(results[0].formatted_address)
        } else {
          reject(new Error(`Reverse geocoding failed: ${status}`))
        }
      })
    })
  },
}

// Real-time subscriptions with better error handling
export const subscriptions = {
  // Subscribe to booking updates
  subscribeToBooking(bookingId, callback) {
    try {
      const channel = supabase.channel(`booking:${bookingId}`)

      return channel
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "bookings",
            filter: `id=eq.${bookingId}`,
          },
          callback,
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            console.log("Successfully subscribed to booking updates")
          } else if (status === "CHANNEL_ERROR") {
            console.error("Error subscribing to booking updates")
          }
        })
    } catch (error) {
      console.error("Error creating booking subscription:", error)
      return { unsubscribe: () => {} }
    }
  },

  // Subscribe to new pending bookings for drivers
  subscribeToNewBookings(callback) {
    try {
      const channel = supabase.channel("new-bookings")

      return channel
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "bookings",
          },
          callback,
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            console.log("Successfully subscribed to new bookings")
          } else if (status === "CHANNEL_ERROR") {
            console.error("Error subscribing to new bookings")
          }
        })
    } catch (error) {
      console.error("Error creating new bookings subscription:", error)
      return { unsubscribe: () => {} }
    }
  },

  // Subscribe to driver location updates
  subscribeToDriverLocation(driverId, callback) {
    try {
      const channel = supabase.channel(`driver:${driverId}`)

      return channel
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "drivers",
            filter: `id=eq.${driverId}`,
          },
          callback,
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            console.log("Successfully subscribed to driver location updates")
          } else if (status === "CHANNEL_ERROR") {
            console.error("Error subscribing to driver location updates")
          }
        })
    } catch (error) {
      console.error("Error creating driver subscription:", error)
      return { unsubscribe: () => {} }
    }
  },
}
