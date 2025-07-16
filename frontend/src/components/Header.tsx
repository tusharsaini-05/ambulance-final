"use client"

import type React from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext.tsx"
import { Button } from "./ui/button.tsx"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu.tsx"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar.tsx"

const Header: React.FC = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate("/login")
  }

  const userRole = user?.user_metadata?.role

  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          Ambulance Finder
        </Link>
        <nav className="flex items-center space-x-4">
          <Link to="/about" className="hover:underline">
            About
          </Link>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user.user_metadata?.avatar_url || "/placeholder-user.jpg"}
                      alt={user.email || "User"}
                    />
                    <AvatarFallback>{user.email ? user.email[0].toUpperCase() : "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.email}</p>
                    <p className="text-xs leading-none text-muted-foreground">Role: {userRole}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {userRole === "user" && (
                  <>
                    <DropdownMenuItem onClick={() => navigate("/user/dashboard")}>Dashboard</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/user/book")}>Book Ambulance</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/user/history")}>Booking History</DropdownMenuItem>
                  </>
                )}
                {userRole === "driver" && (
                  <>
                    <DropdownMenuItem onClick={() => navigate("/driver/dashboard")}>Dashboard</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/driver/bookings")}>My Bookings</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/driver/profile")}>Profile</DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login" className="hover:underline">
                Login
              </Link>
              <Button onClick={() => navigate("/register")} variant="secondary">
                Register
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header
