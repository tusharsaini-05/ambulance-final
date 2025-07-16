"use client"

import { useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { useBooking } from "../../contexts/BookingContext"
import { Ambulance, Clock, Plus, History, AlertTriangle, CheckCircle } from "lucide-react"
import LoadingSpinner from "../../components/LoadingSpinner"
import BookingCard from "../../components/BookingCard"

const UserDashboard = () => {
  const { userProfile } = useAuth()
  const { currentBooking, bookings, loading, loadBookings } = useBooking()
  const navigate = useNavigate()

  useEffect(() => {
    loadBookings()
  }, [])

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />
  }

  const recentBookings = bookings.slice(0, 3)
  const activeBooking =
    currentBooking ||
    bookings.find((booking) => ["pending", "accepted", "en_route", "arrived"].includes(booking.status))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {userProfile?.full_name || "User"}</h1>
          <p className="text-gray-600 mt-2">Emergency medical services at your fingertips</p>
        </div>

        {/* Emergency Alert */}
        <div className="mb-8 p-6 bg-emergency-50 border border-emergency-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-emergency-600" />
            <div>
              <h3 className="text-lg font-semibold text-emergency-900">Emergency Hotline</h3>
              <p className="text-emergency-700">
                For life-threatening emergencies, call{" "}
                <a href="tel:911" className="font-bold underline">
                  911
                </a>{" "}
                immediately
              </p>
            </div>
          </div>
        </div>

        {/* Active Booking */}
        {activeBooking && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Booking</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <BookingCard
                booking={activeBooking}
                onAction={() => {}}
                actionLabel="Track Ambulance"
                actionVariant="primary"
              />
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link
            to="/book"
            className="group p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-emergency-100 rounded-full group-hover:bg-emergency-200 transition-colors">
                <Ambulance className="h-6 w-6 text-emergency-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Book Ambulance</h3>
                <p className="text-gray-600 text-sm">Request emergency transport</p>
              </div>
            </div>
          </Link>

          <Link
            to="/history"
            className="group p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                <History className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Booking History</h3>
                <p className="text-gray-600 text-sm">View past bookings</p>
              </div>
            </div>
          </Link>

          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Account Status</h3>
                <p className="text-green-600 text-sm font-medium">Verified</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
              </div>
              <Ambulance className="h-8 w-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bookings.filter((b) => b.status === "completed").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response</p>
                <p className="text-2xl font-bold text-gray-900">8 min</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Bookings</h2>
            <Link to="/history" className="text-emergency-600 hover:text-emergency-700 font-medium text-sm">
              View all
            </Link>
          </div>

          {recentBookings.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {recentBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onAction={(booking) => {
                    // Navigate to tracking page if active
                    if (["pending", "accepted", "en_route", "arrived"].includes(booking.status)) {
                      navigate(`/track/${booking.id}`)
                    }
                  }}
                  actionLabel={
                    ["pending", "accepted", "en_route", "arrived"].includes(booking.status) ? "Track" : "View Details"
                  }
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Ambulance className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-600 mb-6">Book your first ambulance to get started</p>
              <Link to="/book" className="btn btn-emergency btn-md inline-flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Book Ambulance</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserDashboard
