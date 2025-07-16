import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Plane as Ambulance, Clock, MapPin, Shield, Users, Star, ArrowRight, Phone } from 'lucide-react'

const Home = () => {
  const { user, isDriver } = useAuth()

  const features = [
    {
      icon: Clock,
      title: '24/7 Availability',
      description: 'Emergency medical services available round the clock, every day of the year.'
    },
    {
      icon: MapPin,
      title: 'Real-time Tracking',
      description: 'Track your ambulance in real-time with live GPS updates and estimated arrival times.'
    },
    {
      icon: Shield,
      title: 'Verified Drivers',
      description: 'All our drivers are certified medical professionals with verified credentials.'
    },
    {
      icon: Users,
      title: 'Professional Care',
      description: 'Experienced medical staff equipped to handle various emergency situations.'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Patient',
      content: 'The response time was incredible. The ambulance arrived within 8 minutes and the medical team was professional and caring.',
      rating: 5
    },
    {
      name: 'Dr. Michael Chen',
      role: 'Emergency Physician',
      content: 'This platform has revolutionized how we coordinate emergency medical transport. Highly recommended.',
      rating: 5
    },
    {
      name: 'Lisa Rodriguez',
      role: 'Family Member',
      content: 'During my father\'s emergency, this service was a lifesaver. Quick, reliable, and professional.',
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emergency-600 to-emergency-800 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Emergency Medical Services
              <span className="block text-emergency-200">When Every Second Counts</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-emergency-100 max-w-3xl mx-auto">
              Connect with verified ambulance services instantly. Real-time tracking, 
              professional medical care, and 24/7 availability.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {user ? (
                <>
                  {!isDriver ? (
                    <Link
                      to="/book"
                      className="btn btn-emergency btn-lg emergency-glow flex items-center space-x-2"
                    >
                      <Ambulance className="h-5 w-5" />
                      <span>Book Emergency Ambulance</span>
                    </Link>
                  ) : (
                    <Link
                      to="/dashboard"
                      className="btn btn-emergency btn-lg flex items-center space-x-2"
                    >
                      <span>Go to Dashboard</span>
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="btn btn-emergency btn-lg emergency-glow flex items-center space-x-2"
                  >
                    <Ambulance className="h-5 w-5" />
                    <span>Get Started</span>
                  </Link>
                  <Link
                    to="/register?role=driver"
                    className="btn bg-white text-emergency-600 hover:bg-gray-100 btn-lg flex items-center space-x-2"
                  >
                    <Users className="h-5 w-5" />
                    <span>Become a Driver</span>
                  </Link>
                </>
              )}
            </div>

            <div className="mt-8 flex items-center justify-center space-x-2 text-emergency-200">
              <Phone className="h-5 w-5" />
              <span className="text-lg">Emergency Hotline: 911</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Service?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide reliable, fast, and professional emergency medical transportation 
              with cutting-edge technology and experienced medical professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emergency-100 text-emergency-600 rounded-full mb-6 group-hover:bg-emergency-600 group-hover:text-white transition-colors">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple steps to get emergency medical help when you need it most
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-emergency-600 text-white rounded-full text-xl font-bold mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Request Ambulance
              </h3>
              <p className="text-gray-600">
                Provide your location and emergency details through our easy-to-use platform
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-emergency-600 text-white rounded-full text-xl font-bold mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Get Matched
              </h3>
              <p className="text-gray-600">
                We instantly connect you with the nearest available ambulance and medical team
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-emergency-600 text-white rounded-full text-xl font-bold mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Track & Receive Care
              </h3>
              <p className="text-gray-600">
                Track the ambulance in real-time and receive professional medical care
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600">
              Real experiences from people who trusted us during their emergencies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-emergency-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-emergency-100 max-w-2xl mx-auto">
            Join thousands of users who trust our platform for their emergency medical needs.
          </p>
          
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="btn bg-white text-emergency-600 hover:bg-gray-100 btn-lg flex items-center space-x-2"
              >
                <span>Sign Up as Patient</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/register?role=driver"
                className="btn border-2 border-white text-white hover:bg-white hover:text-emergency-600 btn-lg flex items-center space-x-2"
              >
                <span>Join as Driver</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Home
