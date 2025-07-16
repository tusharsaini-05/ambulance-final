import React, { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useBooking } from '../../contexts/BookingContext'
import { Link } from 'react-router-dom'
import { Clock, MapPin, User, Phone, Car, AlertTriangle } from 'lucide-react'
import LoadingSpinner from '../../components/LoadingSpinner'
import BookingCard from '../../components/BookingCard'

const DriverBookings = () => {
  const { user } = useAuth()
  const { bookings, loading, loadBookings, acceptBooking, startTrip, arriveAtPickup, completeTrip } = useBooking()
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadBookings()
  }, [])

  const handleAcceptBooking = async (booking) => {
    try {
      await acceptBooking(booking.id)
    } catch (error) {
      console.error('Error accepting booking:', error)
    }
  }

  const handleStartTrip = async (booking) => {
    try {
      await startTrip(booking.id)
    } catch (error) {
      console.error('Error starting trip:', error)
    }
  }

  const handleArriveAtPickup = async (booking) => {
    try {
      await arriveAtPickup(booking.id)
    } catch (error) {
      console.error('Error marking arrival:', error)
    }
  }

  const handleCompleteTrip = async (booking) => {
    try {
      await completeTrip(booking.id)
    } catch (error) {
      console.error('Error completing trip:', error)
    }
  }

  const getActionForBooking = (booking) => {
    switch (booking.status) {
      case 'pending':
        return {
          label: 'Accept Booking',
          action: handleAcceptBooking,
          variant: 'primary'
        }
      case 'accepted':
        return {
          label: 'Start Trip',
          action: handleStartTrip,
          variant: 'primary'
        }
      case 'en_route':
        return {
          label: 'Mark Arrived',
          action: handleArriveAtPickup,
          variant: 'primary'
        }
      case 'arrived':
        return {
          label: 'Complete Trip',
          action: handleCompleteTrip,
          variant: 'primary'
        }
      default:
        return null
    }
  }

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true
    if (filter === 'active') return ['pending', 'accepted', 'en_route', 'arrived'].includes(booking.status)
    if (filter === 'completed') return ['completed', 'cancelled'].includes(booking.status)
    return booking.status === filter
  })

  const pendingBookings = bookings.filter(b => b.status === 'pending')
  const activeBookings = bookings.filter(b => ['accepted', 'en_route', 'arrived'].includes(b.status))

  if (loading) {
    return <LoadingSpinner text="Loading bookings..." />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600 mt-2">
            Manage your ambulance service requests
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingBookings.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-blue-600">{activeBookings.length}</p>
              </div>
              <Car className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {bookings.filter(b => b.status === 'completed').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
              </div>
              <User className="h-8 w-8 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Bookings' },
              { key: 'pending', label: 'Pending' },
              { key: 'active', label: 'Active' },
              { key: 'completed', label: 'Completed' }
            ].map((filterOption) => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === filterOption.key
                    ? 'bg-emergency-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>

        {/* Urgent Pending Bookings */}
        {pendingBookings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
              Urgent Requests
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {pendingBookings.map((booking) => {
                const action = getActionForBooking(booking)
                return (
                  <div key={booking.id} className="emergency-pulse">
                    <BookingCard
                      booking={booking}
                      onAction={action?.action}
                      actionLabel={action?.label}
                      actionVariant={action?.variant}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* All Bookings */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {filter === 'all' ? 'All Bookings' : 
               filter === 'active' ? 'Active Bookings' :
               filter === 'completed' ? 'Completed Bookings' :
               `${filter.charAt(0).toUpperCase() + filter.slice(1)} Bookings`}
            </h2>
            <span className="text-sm text-gray-500">
              {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
            </span>
          </div>

          {filteredBookings.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredBookings.map((booking) => {
                const action = getActionForBooking(booking)
                return (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onAction={action?.action}
                    actionLabel={action?.label || 'View Details'}
                    actionVariant={action?.variant || 'secondary'}
                  />
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No bookings found
              </h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all' 
                  ? "You haven't received any booking requests yet."
                  : `No ${filter} bookings found.`
                }
              </p>
              <Link
                to="/dashboard"
                className="btn btn-primary btn-md"
              >
                Back to Dashboard
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DriverBookings
