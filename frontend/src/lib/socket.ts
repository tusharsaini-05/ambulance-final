import { io, type Socket } from "socket.io-client"

class SocketService {
  public socket: Socket | null = null
  private _isConnected = false
  private _lastMessage: string | null = null
  private _error: string | null = null

  private connectListeners: (() => void)[] = []
  private disconnectListeners: (() => void)[] = []
  private messageListeners: (() => void)[] = []
  private errorListeners: (() => void)[] = []

  constructor() {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001"
    this.socket = io(backendUrl, {
      transports: ["websocket"],
      autoConnect: false, // Prevent auto-connection
    })

    this.socket.on("connect", () => {
      this._isConnected = true
      this._error = null
      this._lastMessage = "Connected to socket server"
      this.connectListeners.forEach((listener) => listener())
      console.log("Socket connected:", this.socket?.id)
    })

    this.socket.on("disconnect", (reason) => {
      this._isConnected = false
      this._lastMessage = `Disconnected: ${reason}`
      this.disconnectListeners.forEach((listener) => listener())
      console.log("Socket disconnected:", reason)
    })

    this.socket.on("connect_error", (error) => {
      this._error = `Connection Error: ${error.message}`
      this._lastMessage = null
      this.errorListeners.forEach((listener) => listener())
      console.error("Socket connection error:", error)
    })

    this.socket.on("message", (msg: string) => {
      this._lastMessage = msg
      this.messageListeners.forEach((listener) => listener())
      console.log("Socket message:", msg)
    })

    // Custom event listeners for ambulance app
    this.socket.on("locationUpdate", (data: { driverId: string; lat: number; lng: number }) => {
      console.log("Received location update:", data)
      // This event is handled by specific components (e.g., TrackBooking)
    })

    this.socket.on("bookingAssigned", (data: { bookingId: string; driverId: string; eta: number }) => {
      console.log("Received booking assigned:", data)
    })

    this.socket.on("bookingStatusUpdate", (data: { bookingId: string; status: string }) => {
      console.log("Received booking status update:", data)
    })

    this.socket.on("emergencyAlert", (data: { userId: string; message: string }) => {
      console.log("Received emergency alert:", data)
    })
  }

  connect() {
    if (this.socket && !this.socket.connected) {
      this.socket.connect()
    }
  }

  disconnect() {
    if (this.socket && this.socket.connected) {
      this.socket.disconnect()
    }
  }

  isConnected(): boolean {
    return this._isConnected
  }

  getLastMessage(): string | null {
    return this._lastMessage
  }

  getError(): string | null {
    return this._error
  }

  // Event listener registration
  onConnect(listener: () => void) {
    this.connectListeners.push(listener)
  }

  offConnect(listener: () => void) {
    this.connectListeners = this.connectListeners.filter((l) => l !== listener)
  }

  onDisconnect(listener: () => void) {
    this.disconnectListeners.push(listener)
  }

  offDisconnect(listener: () => void) {
    this.disconnectListeners = this.disconnectListeners.filter((l) => l !== listener)
  }

  onMessage(listener: () => void) {
    this.messageListeners.push(listener)
  }

  offMessage(listener: () => void) {
    this.messageListeners = this.messageListeners.filter((l) => l !== listener)
  }

  onError(listener: () => void) {
    this.errorListeners.push(listener)
  }

  offError(listener: () => void) {
    this.errorListeners = this.errorListeners.filter((l) => l !== listener)
  }

  // Emit functions
  emitLocationUpdate(driverId: string, lat: number, lng: number) {
    if (this.socket?.connected) {
      this.socket.emit("locationUpdate", { driverId, lat, lng })
    } else {
      console.warn("Socket not connected, cannot emit location update.")
    }
  }

  emitBookingRequest(bookingDetails: any) {
    if (this.socket?.connected) {
      this.socket.emit("bookingRequest", bookingDetails)
    } else {
      console.warn("Socket not connected, cannot emit booking request.")
    }
  }

  emitBookingAccept(bookingId: string, driverId: string) {
    if (this.socket?.connected) {
      this.socket.emit("bookingAccept", { bookingId, driverId })
    } else {
      console.warn("Socket not connected, cannot emit booking accept.")
    }
  }

  emitBookingStatusUpdate(bookingId: string, status: string) {
    if (this.socket?.connected) {
      this.socket.emit("bookingStatusUpdate", { bookingId, status })
    } else {
      console.warn("Socket not connected, cannot emit booking status update.")
    }
  }

  emitEmergencyAlert(userId: string, message: string) {
    if (this.socket?.connected) {
      this.socket.emit("emergencyAlert", { userId, message })
    } else {
      console.warn("Socket not connected, cannot emit emergency alert.")
    }
  }
}

export const socketService = new SocketService()
