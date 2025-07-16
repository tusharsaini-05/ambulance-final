"use client"

import type React from "react"
import { createContext, useContext, useState, type ReactNode, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { useAuth } from "./AuthContext"

interface Booking {
  id: string
  user_id: string
  driver_id: string | null
  pickup_location: string
  destination: string
  status: "pending" | "accepted" | "en_route" | "arrived" | "completed" | "cancelled"
  created_at: string
  driver_location?: { lat: number; lng: number }
  driver_name?: string
  driver_phone?: string
}

interface BookingContextType {
  bookings: Booking[]
  userBookings: Booking[]
  driverBookings: Booking[]
  pendingBookings: Booking[]
  createBooking: (pickup: string, destination: string) => Promise<Booking | null>
  updateBookingStatus: (bookingId: string, status: Booking["status"]) => Promise<void>
  acceptBooking: (bookingId: string, driverId: string) => Promise<void>
  cancelBooking: (bookingId: string) => Promise<void>
  fetchUserBookings: () => Promise<void>
  fetchDriverBookings: () => Promise<void>
  fetchPendingBookings: () => Promise<void>
  currentBookingId: string | null
  setCurrentBookingId: (id: string | null) => void
}

const BookingContext = createContext<BookingContextType | undefined>(undefined)

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [userBookings, setUserBookings] = useState<Booking[]>([])
  const [driverBookings, setDriverBookings] = useState<Booking[]>([])
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([])
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null)

  const fetchUserBookings = async () => {
    if (!user) return
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
    if (error) {
      console.error("Error fetching user bookings:", error)
    } else {
      setUserBookings(data as Booking[])
    }
  }

  const fetchDriverBookings = async () => {
    if (!user || user.user_metadata.role !== "driver") return
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("driver_id", user.id)
      .order("created_at", { ascending: false })
    if (error) {
      console.error("Error fetching driver bookings:", error)
    } else {
      setDriverBookings(data as Booking[])
    }
  }

  const fetchPendingBookings = async () => {
    if (!user || user.user_metadata.role !== "driver") return
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("status", "pending")
      .is("driver_id", null) // Only show bookings not yet accepted by any driver
      .order("created_at", { ascending: false })
    if (error) {
      console.error("Error fetching pending bookings:", error)
    } else {
      setPendingBookings(data as Booking[])
    }
  }

  useEffect(() => {
    if (user) {
      fetchUserBookings()
      fetchDriverBookings()
      fetchPendingBookings()
    }
  }, [user])

  const createBooking = async (pickup: string, destination: string) => {
    if (!user) return null
    const { data, error } = await supabase
      .from("bookings")
      .insert([{ user_id: user.id, pickup_location: pickup, destination: destination, status: "pending" }])
      .select()
    if (error) {
      console.error("Error creating booking:", error)
      return null
    }
    const newBooking = data[0] as Booking
    setUserBookings((prev) => [newBooking, ...prev])
    return newBooking
  }

  const updateBookingStatus = async (bookingId: string, status: Booking["status"]) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", bookingId)
    if (error) {
      console.error("Error updating booking status:", error)
    } else {
      // Optimistically update state
      setUserBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status } : b)))
      setDriverBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status } : b)))
      setPendingBookings((prev) => prev.filter((b) => b.id !== bookingId))
    }
  }

  const acceptBooking = async (bookingId: string, driverId: string) => {
    const { error } = await supabase
      .from("bookings")
      .update({ driver_id: driverId, status: "accepted" })
      .eq("id", bookingId)
    if (error) {
      console.error("Error accepting booking:", error)
    } else {
      // Refresh driver's bookings and pending bookings
      fetchDriverBookings()
      fetchPendingBookings()
    }
  }

  const cancelBooking = async (bookingId: string) => {
    await updateBookingStatus(bookingId, "cancelled")
  }

  return (
    <BookingContext.Provider
      value={{
        bookings,
        userBookings,
        driverBookings,
        pendingBookings,
        createBooking,
        updateBookingStatus,
        acceptBooking,
        cancelBooking,
        fetchUserBookings,
        fetchDriverBookings,
        fetchPendingBookings,
        currentBookingId,
        setCurrentBookingId,
      }}
    >
      {children}
    </BookingContext.Provider>
  )
}

export const useBooking = () => {
  const context = useContext(BookingContext)
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider")
  }
  return context
}
