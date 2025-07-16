import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Plane as Ambulance, Eye, EyeOff, AlertCircle, User, Car } from 'lucide-react'

const Register = () => {
  const [searchParams] = useSearchParams()
  const initialRole = searchParams.get('role') || 'user'
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: '',
    role: initialRole,
    // Driver specific fields
    vehicle_number: '',
    vehicle_type: 'ambulance',
    license_number: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleRoleChange = (role) => {
    setFormData({
      ...formData,
      role
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      await signUp(formData.email, formData.password, {
        full_name: formData.full_name,
        phone: formData.phone,
        role: formData.role,
        ...(formData.role === 'driver' && {
          vehicle_number: formData.vehicle_number,
          vehicle_type: formData.vehicle_type,
          license_number: formData.license_number
        })
      })
      
      navigate('/dashboard')
    } catch (error) {
      setError(error.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Ambulance className="h-12 w-12 text-emergency-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link
            to="/login"
            className="font-medium text-emergency-600 hover:text-emergency-500"
          >
            sign in to existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              I want to register as:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRoleChange('user')}
                className={`p-3 border rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                  formData.role === 'user'
                    ? 'border-emergency-600 bg-emergency-50 text-emergency-600'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <User className="h-6 w-6" />
                <span className="text-sm font-medium">Patient</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('driver')}
                className={`p-3 border rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                  formData.role === 'driver'
                    ? 'border-emergency-600 bg-emergency-50 text-emergency-600'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Car className="h-6 w-6" />
                <span className="text-sm font-medium">Driver</span>
              </button>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  className="input"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="input"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input pr-10"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input pr-10"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Driver Specific Fields */}
            {formData.role === 'driver' && (
              <>
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Driver Information
                  </h3>
                </div>

                <div>
                  <label htmlFor="license_number" className="block text-sm font-medium text-gray-700">
                    Driver's License Number
                  </label>
                  <div className="mt-1">
                    <input
                      id="license_number"
                      name="license_number"
                      type="text"
                      required
                      value={formData.license_number}
                      onChange={handleChange}
                      className="input"
                      placeholder="Enter your license number"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="vehicle_number" className="block text-sm font-medium text-gray-700">
                    Vehicle Number
                  </label>
                  <div className="mt-1">
                    <input
                      id="vehicle_number"
                      name="vehicle_number"
                      type="text"
                      required
                      value={formData.vehicle_number}
                      onChange={handleChange}
                      className="input"
                      placeholder="Enter vehicle number"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="vehicle_type" className="block text-sm font-medium text-gray-700">
                    Vehicle Type
                  </label>
                  <div className="mt-1">
                    <select
                      id="vehicle_type"
                      name="vehicle_type"
                      value={formData.vehicle_type}
                      onChange={handleChange}
                      className="input"
                    >
                      <option value="ambulance">Ambulance</option>
                      <option value="emergency_van">Emergency Van</option>
                      <option value="medical_transport">Medical Transport</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-emergency btn-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Emergency?</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                For immediate medical emergencies, call{' '}
                <a href="tel:911" className="font-bold text-emergency-600">
                  911
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
