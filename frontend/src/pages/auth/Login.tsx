"use client"

import type React from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext.tsx"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card.tsx"
import { Label } from "../../components/ui/label.tsx"
import { Input } from "../../components/ui/input.tsx"
import { Button } from "../../components/ui/button.tsx"
import LoadingSpinner from "../../components/LoadingSpinner.tsx"

const Login: React.FC = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { user, error } = await signIn(email, password)

    if (error) {
      setError(error.message)
    } else if (user) {
      const role = user.user_metadata.role
      if (role === "user") {
        navigate("/user/dashboard")
      } else if (role === "driver") {
        navigate("/driver/dashboard")
      } else {
        setError("Unknown user role.")
      }
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-160px)] px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Enter your email and password to access your account
          </CardDescription>
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
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <LoadingSpinner /> : "Login"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <Link to="/register" className="underline">
              Register
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
