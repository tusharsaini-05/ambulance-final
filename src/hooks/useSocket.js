"use client"

import { useEffect, useRef, useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import socketService from "../lib/socket"

export const useSocket = () => {
  const { user, isDriver } = useAuth()
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState(null)
  const connectionAttempted = useRef(false)

  useEffect(() => {
    if (!user || connectionAttempted.current) return

    const connectSocket = async () => {
      try {
        setError(null)

        // Connect to Socket.IO server
        const socket = socketService.connect()

        // Connect as appropriate user type
        if (isDriver) {
          socketService.connectAsDriver(user.id)
        } else {
          socketService.connectAsUser(user.id)
        }

        // Set up connection status listeners
        socket.on("connect", () => {
          setIsConnected(true)
          setError(null)
        })

        socket.on("disconnect", () => {
          setIsConnected(false)
        })

        socket.on("connect_error", (err) => {
          setError(err.message)
          setIsConnected(false)
        })

        connectionAttempted.current = true
      } catch (err) {
        setError(err.message)
        setIsConnected(false)
      }
    }

    connectSocket()

    // Cleanup on unmount
    return () => {
      if (connectionAttempted.current) {
        socketService.disconnect()
        connectionAttempted.current = false
      }
    }
  }, [user, isDriver])

  return {
    isConnected,
    error,
    socket: socketService.getSocket(),
    socketService,
  }
}

export default useSocket
