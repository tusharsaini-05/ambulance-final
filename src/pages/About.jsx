import React from 'react'
import { Plane as Ambulance, Heart, Users, Award, Clock, Shield } from 'lucide-react'

const About = () => {
  const stats = [
    { label: 'Lives Saved', value: '10,000+', icon: Heart },
    { label: 'Verified Drivers', value: '500+', icon: Users },
    { label: 'Cities Covered', value: '50+', icon: Ambulance },
    { label: 'Average Response Time', value: '8 min', icon: Clock }
  ]

  const values = [
    {
      icon: Heart,
      title: 'Compassionate Care',
      description: 'Every emergency is treated with the utmost care and urgency, putting patient welfare first.'
    },
    {
      icon: Shield,
      title: 'Safety & Reliability',
      description: 'All our drivers and medical staff are thoroughly vetted and certified professionals.'
    },
    {
      icon: Clock,
      title: 'Rapid Response',
      description: 'Our advanced dispatch system ensures the fastest possible response times in emergencies.'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We maintain the highest standards of medical care and service quality.'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emergency-600 to-emergency-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About Ambulance Finder
            </h1>
            <p className="text-xl md:text-2xl text-emergency-100 max-w-3xl mx-auto">
              Revolutionizing emergency medical services through technology, 
              connecting patients with life-saving care when every second matters.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                We believe that access to emergency medical care should be immediate, 
                reliable, and stress-free. Our platform bridges the gap between patients 
                in crisis and the medical professionals who can help them.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                By leveraging cutting-edge technology, real-time tracking, and a network 
                of verified medical professionals, we're making emergency medical transport 
                more efficient and accessible than ever before.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-emergency-100 text-emergency-600 rounded-full">
                  <Ambulance className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Available 24/7</p>
                  <p className="text-gray-600">Emergency services never sleep</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Emergency medical team"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Impact
            </h2>
            <p className="text-xl text-gray-600">
              Numbers that reflect our commitment to saving lives
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emergency-600 text-white rounded-full mb-4">
                  <stat.icon className="h-8 w-8" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-emergency-100 text-emergency-600 rounded-full flex-shrink-0">
                  <value.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Team
            </h2>
            <p className="text-xl text-gray-600">
              Dedicated professionals working to save lives every day
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <img
                src="https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Dr. Sarah Johnson"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Dr. Sarah Johnson
              </h3>
              <p className="text-gray-600 mb-2">Chief Medical Officer</p>
              <p className="text-sm text-gray-500">
                15+ years in emergency medicine
              </p>
            </div>

            <div className="text-center">
              <img
                src="https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Michael Chen"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Michael Chen
              </h3>
              <p className="text-gray-600 mb-2">Operations Director</p>
              <p className="text-sm text-gray-500">
                Expert in emergency response systems
              </p>
            </div>

            <div className="text-center">
              <img
                src="https://images.pexels.com/photos/5327656/pexels-photo-5327656.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Lisa Rodriguez"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Lisa Rodriguez
              </h3>
              <p className="text-gray-600 mb-2">Technology Lead</p>
              <p className="text-sm text-gray-500">
                Building the future of emergency tech
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-emergency-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Get in Touch
          </h2>
          <p className="text-xl mb-8 text-emergency-100 max-w-2xl mx-auto">
            Have questions about our services? We're here to help 24/7.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div>
              <h3 className="text-lg font-semibold mb-2">Emergency Line</h3>
              <p className="text-emergency-100">911</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Support</h3>
              <p className="text-emergency-100">+1 (555) 123-4567</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Email</h3>
              <p className="text-emergency-100">support@ambulancefinder.com</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
