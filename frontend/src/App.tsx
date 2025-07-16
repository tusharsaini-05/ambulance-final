"use client"

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./contexts/AuthContext.tsx"
import Layout from "./components/Layout.tsx"
import Home from "./pages/Home.tsx"
import About from "./pages/About.tsx"
import Login from "./pages/auth/Login.tsx"
import Register from "./pages/auth/Register.tsx"
import UserDashboard from "./pages/user/Dashboard.tsx"
import BookAmbulance from "./pages/user/BookAmbulance.tsx"
import UserBookingHistory from "./pages/user/BookingHistory.tsx"
import UserTrackBooking from "./pages/user/TrackBooking.tsx"
import DriverDashboard from "./pages/driver/Dashboard.tsx"
import DriverBookings from "./pages/driver/Bookings.tsx"
import DriverProfile from "./pages/driver/Profile.tsx"
import DriverTrackBooking from "./pages/driver/TrackBooking.tsx"

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Loading application...</div> // Or a proper loading spinner
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
        <Route
          path="/about"
          element={
            <Layout>
              <About />
            </Layout>
          }
        />
        <Route
          path="/login"
          element={
            <Layout>
              <Login />
            </Layout>
          }
        />
        <Route
          path="/register"
          element={
            <Layout>
              <Register />
            </Layout>
          }
        />

        {/* User Routes */}
        <Route
          path="/user/dashboard"
          element={
            user && user.user_metadata.role === "user" ? (
              <Layout>
                <UserDashboard />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/user/book"
          element={
            user && user.user_metadata.role === "user" ? (
              <Layout>
                <BookAmbulance />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/user/history"
          element={
            user && user.user_metadata.role === "user" ? (
              <Layout>
                <UserBookingHistory />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/user/track/:bookingId"
          element={
            user && user.user_metadata.role === "user" ? (
              <Layout>
                <UserTrackBooking />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Driver Routes */}
        <Route
          path="/driver/dashboard"
          element={
            user && user.user_metadata.role === "driver" ? (
              <Layout>
                <DriverDashboard />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/driver/bookings"
          element={
            user && user.user_metadata.role === "driver" ? (
              <Layout>
                <DriverBookings />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/driver/profile"
          element={
            user && user.user_metadata.role === "driver" ? (
              <Layout>
                <DriverProfile />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/driver/track/:bookingId"
          element={
            user && user.user_metadata.role === "driver" ? (
              <Layout>
                <DriverTrackBooking />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Redirect unauthenticated users */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  )
}

export default App
