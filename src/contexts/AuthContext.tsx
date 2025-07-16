"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase, db } from "../lib/supabase.js" // Corrected import path

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await loadUserProfile(session.user.id)
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId) => {
    try {
      const profile = await db.getUser(userId)
      setUserProfile(profile)
    } catch (error) {
      console.error("Error loading user profile:", error)
    }
  }

  const signUp = async (email, password, userData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    })

    if (error) throw error

    // Create user profile
    if (data.user) {
      const { error: profileError } = await supabase.from("users").insert([
        {
          id: data.user.id,
          email: data.user.email,
          full_name: userData.full_name,
          phone: userData.phone,
          role: userData.role || "user",
        },
      ])

      if (profileError) throw profileError

      // If driver, create driver profile
      if (userData.role === "driver") {
        const { error: driverError } = await supabase.from("drivers").insert([
          {
            id: data.user.id,
            vehicle_number: userData.vehicle_number,
            vehicle_type: userData.vehicle_type,
            license_number: userData.license_number,
            is_available: false,
            is_verified: false,
          },
        ])

        if (driverError) throw driverError
      }
    }

    return data
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const updateProfile = async (updates) => {
    if (!user) throw new Error("No user logged in")

    const updatedProfile = await db.updateUser(user.id, updates)
    setUserProfile(updatedProfile)
    return updatedProfile
  }

  const value = {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    isDriver: userProfile?.role === "driver",
    isUser: userProfile?.role === "user",
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
