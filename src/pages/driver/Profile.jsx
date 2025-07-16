import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { User, Car, Phone, Mail, MapPin, Calendar, Shield, Star, Edit3, Save, X } from 'lucide-react'
import LoadingSpinner from '../../components/LoadingSpinner'

const DriverProfile = () => {
  const { user, userProfile, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    vehicle_number: '',
    vehicle_type: '',
    license_number: '',
    is_available: true
  })

  useEffect(() => {
    if (userProfile) {
      setFormData({
        full_name: userProfile.full_name || '',
        phone: userProfile.phone || '',
        email: user?.email || '',
        vehicle_number: userProfile.drivers?.vehicle_number || '',
        vehicle_type: userProfile.drivers?.vehicle_type || '',
        license_number: userProfile.drivers?.license_number || '',
        is_available: userProfile.drivers?.is_available || true
      })
    }
  }, [userProfile, user])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await updateProfile(formData)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    // Reset form data
    if (userProfile) {
      setFormData({
        full_name: userProfile.full_name || '',
        phone: userProfile.phone || '',
        email: user?.email || '',
        vehicle_number: userProfile.drivers?.vehicle_number || '',
        vehicle_type: userProfile.drivers?.vehicle_type || '',
        license_number: userProfile.drivers?.license_number || '',
        is_available: userProfile.drivers?.is_available || true
      })
    }
    setIsEditing(false)
  }

  if (!userProfile) {
    return <LoadingSpinner text="Loading profile..." />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Driver Profile</h1>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-secondary btn-sm flex items-center space-x-2"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="btn btn-primary btn-sm flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{loading ? 'Saving...' : 'Save'}</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="btn btn-secondary btn-sm flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center space-x-6 mb-8">
              <div className="w-24 h-24 bg-emergency-100 rounded-full flex items-center justify-center">
                <User className="h-12 w-12 text-emergency-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {userProfile.full_name || 'Driver'}
                </h2>
                <p className="text-gray-600">Emergency Medical Driver</p>
                <div className="flex items-center space-x-2 mt-2">
                  <div className={`w-3 h-3 rounded-full ${
                    userProfile.drivers?.is_available ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                  <span className="text-sm text-gray-600">
                    {userProfile.drivers?.is_available ? 'Available' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        className="input"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">{userProfile.full_name || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="input"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">{userProfile.phone || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{user?.email || 'Not provided'}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Member Since
                    </label>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">
                        {new Date(user?.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vehicle Number
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="vehicle_number"
                        value={formData.vehicle_number}
                        onChange={handleInputChange}
                        className="input"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Car className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">
                          {userProfile.drivers?.vehicle_number || 'Not provided'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vehicle Type
                    </label>
                    {isEditing ? (
                      <select
                        name="vehicle_type"
                        value={formData.vehicle_type}
                        onChange={handleInputChange}
                        className="input"
                      >
                        <option value="">Select vehicle type</option>
                        <option value="ambulance">Ambulance</option>
                        <option value="emergency_van">Emergency Van</option>
                        <option value="medical_transport">Medical Transport</option>
                      </select>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Car className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900 capitalize">
                          {userProfile.drivers?.vehicle_type?.replace('_', ' ') || 'Not provided'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      License Number
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="license_number"
                        value={formData.license_number}
                        onChange={handleInputChange}
                        className="input"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">
                          {userProfile.drivers?.license_number || 'Not provided'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Verification Status
                    </label>
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-gray-400" />
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        userProfile.drivers?.is_verified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {userProfile.drivers?.is_verified ? 'Verified' : 'Pending Verification'}
                      </span>
                    </div>
                  </div>

                  {isEditing && (
                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="is_available"
                          checked={formData.is_available}
                          onChange={handleInputChange}
                          className="rounded border-gray-300 text-emergency-600 focus:ring-emergency-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Available for bookings
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">0</div>
                  <div className="text-sm text-gray-600">Total Trips</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-2xl font-bold text-gray-900">0.0</span>
                  </div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">0 min</div>
                  <div className="text-sm text-gray-600">Avg Response Time</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">0%</div>
                  <div className="text-sm text-gray-600">Completion Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DriverProfile
