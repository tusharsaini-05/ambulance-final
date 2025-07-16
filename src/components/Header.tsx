"use client"

// src/components/Header.tsx
import type React from "react"
// Update the import path for AuthContext
import { useAuth } from "../contexts/AuthContext.tsx"

const Header: React.FC = () => {
  const { user, logout } = useAuth()

  return (
    <header
      style={{
        backgroundColor: "#f0f0f0",
        padding: "10px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <h1>My App</h1>
      <div>
        {user ? (
          <>
            <span>Welcome, {user.email}</span>
            <button onClick={logout} style={{ marginLeft: "10px" }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <a href="/login" style={{ marginRight: "10px" }}>
              Login
            </a>
            <a href="/register">Register</a>
          </>
        )}
      </div>
    </header>
  )
}

export default Header
