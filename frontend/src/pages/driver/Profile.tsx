"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { supabase } from "../../lib/supabase.ts"
import { useAuth } from "../../contexts/AuthContext.tsx"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.tsx"
import { Label } from "../../components/ui/label.tsx"
import { Input } from "../../components/ui/input.tsx"
import { Button } from "../../components/ui/button.tsx"
import LoadingSpinner from "../../components/LoadingSpinner.tsx"

interface DriverProfileData {
  full_name: string
  phone_number: string | null
  vehicle_model: string | null
  vehicle_plate: string | null
}

const DriverProfile: React.FC = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<DriverProfileData>({
    full_name: "",
    phone_number: "",
    vehicle_model: "",
    vehicle_plate: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from("users")
        .select("full_name, phone_number, vehicle_model, vehicle_plate")
        .eq("id", user.id)
        .single()

      if (error) throw error
      if (data) {
        setProfile({
          full_name: data.full_name || "",
          phone_number: data.phone_number || "",
          vehicle_model: data.vehicle_model || "",
          vehicle_plate: data.vehicle_plate || "",
        })
      }
    } catch (err: any) {
      console.error("Error fetching profile:", err.message)
      setError("Failed to fetch profile: " + err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setProfile((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const { error } = await supabase.from("users").update(profile).eq("id", user.id)

      if (error) throw error
      setSuccess("Profile updated successfully!")
    } catch (err: any) {
      console.error("Error updating profile:", err.message)
      setError("Failed to update profile: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-160px)] px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Driver Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input id="full_name" type="text" value={profile.full_name} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input id="phone_number" type="tel" value={profile.phone_number || ""} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicle_model">Vehicle Model</Label>
              <Input id="vehicle_model" type="text" value={profile.vehicle_model || ""} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicle_plate">Vehicle Plate</Label>
              <Input id="vehicle_plate" type="text" value={profile.vehicle_plate || ""} onChange={handleChange} />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">{success}</p>}
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? <LoadingSpinner /> : "Save Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default DriverProfile
