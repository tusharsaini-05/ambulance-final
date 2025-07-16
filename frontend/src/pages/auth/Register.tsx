"use client"

import type React from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext.tsx"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card.tsx"
import { Label } from "../../components/ui/label.tsx"
import { Input } from "../../components/ui/input.tsx"
import { Button } from "../../components/ui/button.tsx"
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group.tsx"
import LoadingSpinner from "../../components/LoadingSpinner.tsx"

const Register: React.FC = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"user" | "driver">("user")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { user, error } = await signUp(email, password, role)

    if (error) {
      setError(error.message)
    } else if (user) {
      // User successfully registered and logged in
      if (role === "user") {
        navigate("/user/dashboard")
      } else {
        navigate("/driver/dashboard")
      }
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-160px)] px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Register</CardTitle>
          <CardDescription className="text-center">Create your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Register as:</Label>
              <RadioGroup
                value={role}
                onValueChange={(value: "user" | "driver") => setRole(value)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="user" id="user-role" />
                  <Label htmlFor="user-role">User</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="driver" id="driver-role" />
                  <Label htmlFor="driver-role">Driver</Label>
                </div>
              </RadioGroup>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <LoadingSpinner /> : "Register"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Register
