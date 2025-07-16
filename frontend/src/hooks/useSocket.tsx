"use client"

import { useEffect, useState, useCallback } from "react"
import { socketService } from "../lib/socket.ts"

interface SocketStatus {
  isConnected: boolean
  lastMessage: string | null
  error: string | null
}

export const useSocket = () => {
  const [status, setStatus] = useState<SocketStatus>({
    isConnected: socketService.isConnected(),
    lastMessage: null,
    error: null,
  })

  const updateStatus = useCallback(() => {
    setStatus({
      isConnected: socketService.isConnected(),
      lastMessage: socketService.getLastMessage(),
      error: socketService.getError(),
    })
  }, [])

  useEffect(() => {
    socketService.connect()

    socketService.onConnect(updateStatus)
    socketService.onDisconnect(updateStatus)
    socketService.onMessage(updateStatus)
    socketService.onError(updateStatus)

    // Initial status update
    updateStatus()

    return () => {
      socketService.offConnect(updateStatus)
      socketService.offDisconnect(updateStatus)
      socketService.offMessage(updateStatus)
      socketService.offError(updateStatus)
      socketService.disconnect() // Disconnect on unmount
    }
  }, [updateStatus])

  return { socket: socketService.socket, status, emit: socketService.emit }
}
