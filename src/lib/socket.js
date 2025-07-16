import { io } from "socket.io-client"

class SocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
  }

  connect(serverUrl = "http://localhost:3001") {
    if (this.socket && this.isConnected) {
      console.log("Socket already connected")
      return this.socket
    }

    console.log("Connecting to Socket.IO server:", serverUrl)

    this.socket = io(serverUrl, {
      transports: ["websocket", "polling"],
      timeout: 20000,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    })

    this.setupEventListeners()
    return this.socket
  }

  setupEventListeners() {
    if (!this.socket) return

    this.socket.on("connect", () => {
      console.log("Connected to Socket.IO server:", this.socket.id)
      this.isConnected = true
      this.reconnectAttempts = 0
    })

    this.socket.on("disconnect", (reason) => {
      console.log("Disconnected from Socket.IO server:", reason)
      this.isConnected = false
    })

    this.socket.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error)
      this.isConnected = false
      this.reconnectAttempts++
    })

    this.socket.on("reconnect", (attemptNumber) => {
      console.log("Reconnected to Socket.IO server, attempt:", attemptNumber)
      this.isConnected = true
      this.reconnectAttempts = 0
    })

    this.socket.on("reconnect_error", (error) => {
      console.error("Socket.IO reconnection error:", error)
    })

    this.socket.on("reconnect_failed", () => {
      console.error("Socket.IO reconnection failed after max attempts")
    })
  }

  // User methods
  connectAsUser(userId) {
    if (!this.socket) return

    this.socket.emit("user:connect", {
      userId,
      userType: "user",
    })
  }

  connectAsDriver(driverId) {
    if (!this.socket) return

    this.socket.emit("user:connect", {
      userId: driverId,
      userType: "driver",
    })
  }

  connectAsAmbulance(ambulanceId, driverId) {
    if (!this.socket) return

    this.socket.emit("ambulance:connect", {
      ambulanceId,
      driverId,
    })
  }

  // Location tracking methods
  updateAmbulanceLocation(ambulanceId, location, bookingId = null) {
    if (!this.socket) return

    this.socket.emit("ambulance:location", {
      ambulanceId,
      location,
      bookingId,
    })
  }

  updateDriverLocation(driverId, location) {
    if (!this.socket) return

    this.socket.emit("driver:location", {
      driverId,
      location,
    })
  }

  // Booking methods
  assignBooking(bookingId, ambulanceId, userId) {
    if (!this.socket) return

    this.socket.emit("booking:assign", {
      bookingId,
      ambulanceId,
      userId,
    })
  }

  updateBookingStatus(bookingId, status, ambulanceId = null) {
    if (!this.socket) return

    this.socket.emit("booking:status", {
      bookingId,
      status,
      ambulanceId,
    })
  }

  trackBooking(bookingId, userId) {
    if (!this.socket) return

    this.socket.emit("booking:track", {
      bookingId,
      userId,
    })
  }

  untrackBooking(bookingId) {
    if (!this.socket) return

    this.socket.emit("booking:untrack", {
      bookingId,
    })
  }

  // ETA methods
  updateETA(ambulanceId, bookingId, eta, distance) {
    if (!this.socket) return

    this.socket.emit("ambulance:eta", {
      ambulanceId,
      bookingId,
      eta,
      distance,
    })
  }

  // Emergency methods
  sendEmergencyAlert(bookingId, message, level = "high") {
    if (!this.socket) return

    this.socket.emit("emergency:alert", {
      bookingId,
      message,
      level,
    })
  }

  // Event listeners
  onAmbulanceLocationUpdate(callback) {
    if (!this.socket) return

    this.socket.on("ambulance:location:update", callback)
  }

  onBookingAssigned(callback) {
    if (!this.socket) return

    this.socket.on("booking:assigned", callback)
  }

  onBookingStatusUpdate(callback) {
    if (!this.socket) return

    this.socket.on("booking:status:update", callback)
  }

  onETAUpdate(callback) {
    if (!this.socket) return

    this.socket.on("ambulance:eta:update", callback)
  }

  onEmergencyAlert(callback) {
    if (!this.socket) return

    this.socket.on("emergency:alert", callback)
  }

  onDriverLocationUpdate(callback) {
    if (!this.socket) return

    this.socket.on("driver:location:update", callback)
  }

  // Remove event listeners
  offAmbulanceLocationUpdate(callback) {
    if (!this.socket) return

    this.socket.off("ambulance:location:update", callback)
  }

  offBookingAssigned(callback) {
    if (!this.socket) return

    this.socket.off("booking:assigned", callback)
  }

  offBookingStatusUpdate(callback) {
    if (!this.socket) return

    this.socket.off("booking:status:update", callback)
  }

  offETAUpdate(callback) {
    if (!this.socket) return

    this.socket.off("ambulance:eta:update", callback)
  }

  offEmergencyAlert(callback) {
    if (!this.socket) return

    this.socket.off("emergency:alert", callback)
  }

  offDriverLocationUpdate(callback) {
    if (!this.socket) return

    this.socket.off("driver:location:update", callback)
  }

  // Utility methods
  ping() {
    if (!this.socket) return

    this.socket.emit("ping")
  }

  isSocketConnected() {
    return this.socket && this.isConnected
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  // Get socket instance for custom events
  getSocket() {
    return this.socket
  }
}

// Create singleton instance
const socketService = new SocketService()

export default socketService
