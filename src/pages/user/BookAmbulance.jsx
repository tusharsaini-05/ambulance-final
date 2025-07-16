// import { useState, useEffect } from 'react';
// import { useAuth } from '../../contexts/AuthContext';
// import { useBooking } from '../../contexts/BookingContext';
// import { useNavigate } from 'react-router-dom';
// import GoogleMap from '../../components/GoogleMap';
// import LoadingSpinner from '../../components/LoadingSpinner';

// const BookAmbulance = () => {
//   const { user } = useAuth();
//   const { createBooking } = useBooking();
//   const navigate = useNavigate();
  
//   const [loading, setLoading] = useState(false);
//   const [pickupLocation, setPickupLocation] = useState(null);
//   const [dropoffLocation, setDropoffLocation] = useState(null);
//   const [formData, setFormData] = useState({
//     patientName: '',
//     patientPhone: '',
//     emergencyLevel: 'medium',
//     pickupAddress: '',
//     dropoffAddress: ''
//   });

//   const handleLocationSelect = (location, type) => {
//     if (type === 'pickup') {
//       setPickupLocation(location);
//       setFormData(prev => ({ ...prev, pickupAddress: location.address }));
//     } else {
//       setDropoffLocation(location);
//       setFormData(prev => ({ ...prev, dropoffAddress: location.address }));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!pickupLocation || !dropoffLocation) {
//       alert('Please select both pickup and dropoff locations');
//       return;
//     }

//     setLoading(true);
//     try {
//       const bookingData = {
//         pickup_location: pickupLocation,
//         pickup_address: formData.pickupAddress,
//         dropoff_location: dropoffLocation,
//         dropoff_address: formData.dropoffAddress,
//         patient_name: formData.patientName,
//         patient_phone: formData.patientPhone,
//         emergency_level: formData.emergencyLevel,
//         user_id: user.id
//       };

//       const booking = await createBooking(bookingData);
//       navigate(`/user/track/${booking.id}`);
//     } catch (error) {
//       console.error('Error creating booking:', error);
//       alert('Failed to create booking. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleInputChange = (e) => {
//     setFormData(prev => ({
//       ...prev,
//       [e.target.name]: e.target.value
//     }));
//   };

//   if (loading) {
//     return <LoadingSpinner />;
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//           <div className="px-6 py-4 bg-red-600 text-white">
//             <h1 className="text-2xl font-bold">Book Emergency Ambulance</h1>
//             <p className="text-red-100">Fill in the details and select locations on the map</p>
//           </div>

//           <div className="p-6">
//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Patient Name *
//                   </label>
//                   <input
//                     type="text"
//                     name="patientName"
//                     value={formData.patientName}
//                     onChange={handleInputChange}
//                     required
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
//                     placeholder="Enter patient name"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Patient Phone *
//                   </label>
//                   <input
//                     type="tel"
//                     name="patientPhone"
//                     value={formData.patientPhone}
//                     onChange={handleInputChange}
//                     required
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
//                     placeholder="Enter phone number"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Emergency Level *
//                   </label>
//                   <select
//                     name="emergencyLevel"
//                     value={formData.emergencyLevel}
//                     onChange={handleInputChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
//                   >
//                     <option value="low">Low Priority</option>
//                     <option value="medium">Medium Priority</option>
//                     <option value="high">High Priority</option>
//                     <option value="critical">Critical Emergency</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Pickup Address
//                   </label>
//                   <input
//                     type="text"
//                     name="pickupAddress"
//                     value={formData.pickupAddress}
//                     onChange={handleInputChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
//                     placeholder="Click on map to select pickup location"
//                     readOnly
//                   />
//                 </div>

//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Dropoff Address
//                   </label>
//                   <input
//                     type="text"
//                     name="dropoffAddress"
//                     value={formData.dropoffAddress}
//                     onChange={handleInputChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
//                     placeholder="Click on map to select dropoff location"
//                     readOnly
//                   />
//                 </div>
//               </div>

//               <div className="mt-6">
//                 <h3 className="text-lg font-medium text-gray-900 mb-4">Select Locations</h3>
//                 <div className="h-96 rounded-lg overflow-hidden border border-gray-300">
//                   <GoogleMap
//                     onLocationSelect={handleLocationSelect}
//                     pickupLocation={pickupLocation}
//                     dropoffLocation={dropoffLocation}
//                   />
//                 </div>
//               </div>

//               <div className="flex justify-end space-x-4">
//                 <button
//                   type="button"
//                   onClick={() => navigate('/user/dashboard')}
//                   className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={loading || !pickupLocation || !dropoffLocation}
//                   className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {loading ? 'Booking...' : 'Book Ambulance'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BookAmbulance;

import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useBooking } from '../../contexts/BookingContext'
import { useNavigate } from 'react-router-dom'
import { db, mapsHelper } from '../../lib/supabase'
import GoogleMap from '../../components/GoogleMap'
import LoadingSpinner from '../../components/LoadingSpinner'
import { MapPin, Plus, Clock, Navigation } from 'lucide-react'

const BookAmbulance = () => {
  const { user } = useAuth()
  const { createBooking } = useBooking()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(false)
  const [pickupLocations, setPickupLocations] = useState([])
  const [hospitalLocations, setHospitalLocations] = useState([])
  const [selectedPickup, setSelectedPickup] = useState(null)
  const [selectedHospital, setSelectedHospital] = useState(null)
  const [routeInfo, setRouteInfo] = useState(null)
  const [showNewPickupForm, setShowNewPickupForm] = useState(false)
  const [newPickupName, setNewPickupName] = useState('')
  const [mapClickedLocation, setMapClickedLocation] = useState(null)
  
  const [formData, setFormData] = useState({
    patientName: '',
    patientPhone: '',
    emergencyLevel: 'medium'
  })

  // Load pickup locations and hospitals on mount
  useEffect(() => {
    loadLocations()
  }, [])

  // Calculate route when both locations are selected
  useEffect(() => {
    if (selectedPickup && selectedHospital) {
      calculateRoute()
    } else {
      setRouteInfo(null)
    }
  }, [selectedPickup, selectedHospital])

  const loadLocations = async () => {
    try {
      const [pickups, hospitals] = await Promise.all([
        db.getPickupLocations(),
        db.getHospitalLocations()
      ])
      setPickupLocations(pickups)
      setHospitalLocations(hospitals)
    } catch (error) {
      console.error('Error loading locations:', error)
    }
  }

  const calculateRoute = async () => {
    if (!selectedPickup || !selectedHospital) return

    try {
      const origin = { lat: selectedPickup.latitude, lng: selectedPickup.longitude }
      const destination = { lat: selectedHospital.latitude, lng: selectedHospital.longitude }
      
      const route = await mapsHelper.calculateRoute(origin, destination)
      setRouteInfo(route)
    } catch (error) {
      console.error('Error calculating route:', error)
    }
  }

  const handlePickupSelect = (pickupId) => {
    const pickup = pickupLocations.find(p => p.id === pickupId)
    setSelectedPickup(pickup)
    setShowNewPickupForm(false)
    setMapClickedLocation(null)
  }

  const handleHospitalSelect = (hospitalId) => {
    const hospital = hospitalLocations.find(h => h.id === hospitalId)
    setSelectedHospital(hospital)
  }

  const handleMapClick = (location) => {
    setMapClickedLocation(location)
    setSelectedPickup(null)
    setShowNewPickupForm(true)
  }

  const handleSaveNewPickup = async () => {
    if (!newPickupName.trim() || !mapClickedLocation) return

    try {
      const newPickup = await db.createPickupLocation({
        name: newPickupName.trim(),
        latitude: mapClickedLocation.lat,
        longitude: mapClickedLocation.lng
      })

      setPickupLocations(prev => [newPickup, ...prev])
      setSelectedPickup(newPickup)
      setShowNewPickupForm(false)
      setNewPickupName('')
      setMapClickedLocation(null)
    } catch (error) {
      console.error('Error saving new pickup location:', error)
      alert('Failed to save pickup location. Please try again.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedPickup || !selectedHospital) {
      alert('Please select both pickup and hospital locations')
      return
    }

    setLoading(true)
    try {
      const bookingData = {
        pickup_location_id: selectedPickup.id,
        hospital_location_id: selectedHospital.id,
        pickup_address: selectedPickup.name,
        dropoff_address: selectedHospital.name,
        patient_name: formData.patientName,
        patient_phone: formData.patientPhone,
        emergency_level: formData.emergencyLevel,
        user_id: user.id,
        route_distance: routeInfo?.distance,
        route_duration: routeInfo?.duration,
        route_polyline: routeInfo?.polyline
      }

      const booking = await createBooking(bookingData)
      navigate(`/track/${booking.id}`)
    } catch (error) {
      console.error('Error creating booking:', error)
      alert('Failed to create booking. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (loading) {
    return <LoadingSpinner text="Creating booking..." />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-emergency-600 text-white">
            <h1 className="text-2xl font-bold">Book Emergency Ambulance</h1>
            <p className="text-emergency-100">Fill in the details and select locations</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* Patient Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Name *
                </label>
                <input
                  type="text"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleInputChange}
                  required
                  className="input"
                  placeholder="Enter patient name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Phone *
                </label>
                <input
                  type="tel"
                  name="patientPhone"
                  value={formData.patientPhone}
                  onChange={handleInputChange}
                  required
                  className="input"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Level *
                </label>
                <select
                  name="emergencyLevel"
                  value={formData.emergencyLevel}
                  onChange={handleInputChange}
                  className="input"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="critical">Critical Emergency</option>
                </select>
              </div>
            </div>

            {/* Location Selection */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Pickup Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pickup Location *
                </label>
                <select
                  value={selectedPickup?.id || ''}
                  onChange={(e) => handlePickupSelect(e.target.value)}
                  className="input mb-4"
                  disabled={showNewPickupForm}
                >
                  <option value="">Select pickup location</option>
                  {pickupLocations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>

                {showNewPickupForm && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-blue-900 mb-2">Add New Pickup Location</h4>
                    <input
                      type="text"
                      value={newPickupName}
                      onChange={(e) => setNewPickupName(e.target.value)}
                      placeholder="Enter location name"
                      className="input mb-3"
                    />
                    {mapClickedLocation && (
                      <p className="text-sm text-blue-700 mb-3">
                        <MapPin className="h-4 w-4 inline mr-1" />
                        Selected: {mapClickedLocation.address || `${mapClickedLocation.lat.toFixed(6)}, ${mapClickedLocation.lng.toFixed(6)}`}
                      </p>
                    )}
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={handleSaveNewPickup}
                        disabled={!newPickupName.trim() || !mapClickedLocation}
                        className="btn btn-primary btn-sm"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Save Location
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewPickupForm(false)
                          setNewPickupName('')
                          setMapClickedLocation(null)
                        }}
                        className="btn btn-secondary btn-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {selectedPickup && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-900">{selectedPickup.name}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Hospital Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hospital Destination *
                </label>
                <select
                  value={selectedHospital?.id || ''}
                  onChange={(e) => handleHospitalSelect(e.target.value)}
                  className="input mb-4"
                >
                  <option value="">Select hospital</option>
                  {hospitalLocations.map((hospital) => (
                    <option key={hospital.id} value={hospital.id}>
                      {hospital.name}
                    </option>
                  ))}
                </select>

                {selectedHospital && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <MapPin className="h-4 w-4 text-red-600" />
                      <span className="font-medium text-red-900">{selectedHospital.name}</span>
                    </div>
                    {selectedHospital.address && (
                      <p className="text-sm text-red-700 ml-6">{selectedHospital.address}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Route Information */}
            {routeInfo && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                <h3 className="font-medium text-blue-900 mb-2 flex items-center">
                  <Navigation className="h-4 w-4 mr-2" />
                  Route Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-700">
                      <strong>Duration:</strong> {routeInfo.duration}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-700">
                      <strong>Distance:</strong> {routeInfo.distance}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Map */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Select Locations on Map
              </h3>
              <div className="h-96 rounded-lg overflow-hidden border border-gray-300">
                <GoogleMap
                  onMapClick={handleMapClick}
                  pickupLocation={selectedPickup ? {
                    lat: selectedPickup.latitude,
                    lng: selectedPickup.longitude
                  } : mapClickedLocation}
                  dropoffLocation={selectedHospital ? {
                    lat: selectedHospital.latitude,
                    lng: selectedHospital.longitude
                  } : null}
                  showRoute={!!(selectedPickup && selectedHospital)}
                  className="w-full h-full"
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Click on the map to add a new pickup location, or select from existing locations above.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn btn-secondary btn-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !selectedPickup || !selectedHospital}
                className="btn btn-emergency btn-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Booking...' : 'Book Ambulance'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default BookAmbulance
