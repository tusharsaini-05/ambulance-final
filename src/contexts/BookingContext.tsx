"use client"

import type React from "react"
import { createContext, useState, useContext, type ReactNode } from "react"

interface BookingContextProps {
  selectedDate: Date | null
  setSelectedDate: (date: Date | null) => void
  selectedTime: string | null
  setSelectedTime: (time: string | null) => void
  bookingDetails: any // Replace 'any' with a more specific type if possible
  setBookingDetails: (details: any) => void // Replace 'any' with a more specific type if possible
  clearBooking: () => void
}

const BookingContext = createContext<BookingContextProps | undefined>(undefined)

interface BookingProviderProps {
  children: ReactNode
}

export const BookingProvider: React.FC<BookingProviderProps> = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [bookingDetails, setBookingDetails] = useState<any>(null)

  const clearBooking = () => {
    setSelectedDate(null)
    setSelectedTime(null)
    setBookingDetails(null)
  }

  const value: BookingContextProps = {
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    bookingDetails,
    setBookingDetails,
    clearBooking,
  }

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
}

export const useBooking = (): BookingContextProps => {
  const context = useContext(BookingContext)
  if (!context) {
    throw new Error("useBooking must be used within a BookingProvider")
  }
  return context
}
