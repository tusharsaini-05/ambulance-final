import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import cors from "cors"

const app = express()
const server = createServer(app)

// Configure CORS for both Express and Socket.IO
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173", "https://ambulance-frontend-*.vercel.app"], // Adjust origins as needed for deployment
    credentials: true,
  }),
)

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173", "https://ambulance-frontend-*.vercel.app"], // Adjust origins as needed for deployment
    methods: ["GET", "POST"],
    credentials: true,
  },
})

app.use(express.json())

// Store active ambulances and their locations
const ambulanceLocations = new Map()
const bookingAmbulances = new Map() // Maps booking ID to ambulance ID
const ambulanceBookings = new Map() // Maps ambulance ID to booking ID

// Store connected clients by type
const connectedClients = {
  users: new Map(), // userId -> socket
  drivers: new Map(), // driverId -> socket
  ambulances: new Map(), // ambulanceId -> socket
}

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id)

  // Handle user connection
  socket.on("user:connect", (data) => {
    const { userId, userType } = data
    console.log(`${userType} connected:`, userId)

    if (userType === "user") {
      connectedClients.users.set(userId, socket)
      socket.userId = userId
      socket.userType = "user"
    } else if (userType === "driver") {
      connectedClients.drivers.set(userId, socket)
      socket.userId = userId
      socket.userType = "driver"
    }

    socket.emit("connection:confirmed", { userId, userType })
  })

  // Handle ambulance connection
  socket.on("ambulance:connect", (data) => {
    const { ambulanceId, driverId } = data
    console.log("Ambulance connected:", ambulanceId, "Driver:", driverId)

    connectedClients.ambulances.set(ambulanceId, socket)
    socket.ambulanceId = ambulanceId
    socket.driverId = driverId
    socket.userType = "ambulance"

    socket.emit("ambulance:connected", { ambulanceId })
  })

  // Handle ambulance location updates
  socket.on("ambulance:location", (data) => {
    const { ambulanceId, location, bookingId } = data

    // Store the location
    ambulanceLocations.set(ambulanceId, {
      ...location,
      timestamp: Date.now(),
      ambulanceId,
    })

    console.log(`Ambulance ${ambulanceId} location update:`, location)

    // If this ambulance is assigned to a booking, notify the user
    if (bookingId) {
      const booking = bookingAmbulances.get(bookingId)
      if (booking === ambulanceId) {
        // Find the user socket for this booking
        const userSockets = Array.from(connectedClients.users.values())
        userSockets.forEach((userSocket) => {
          userSocket.emit("ambulance:location:update", {
            ambulanceId,
            bookingId,
            location,
            timestamp: Date.now(),
          })
        })

        // Also emit to the booking room if it exists
        socket.to(`booking:${bookingId}`).emit("ambulance:location:update", {
          ambulanceId,
          bookingId,
          location,
          timestamp: Date.now(),
        })
      }
    }

    // Broadcast to all connected clients (for admin/monitoring)
    socket.broadcast.emit("ambulance:location:broadcast", {
      ambulanceId,
      location,
      timestamp: Date.now(),
    })
  })

  // Handle booking assignment
  socket.on("booking:assign", (data) => {
    const { bookingId, ambulanceId, userId } = data
    console.log(`Booking ${bookingId} assigned to ambulance ${ambulanceId}`)

    // Store the assignment
    bookingAmbulances.set(bookingId, ambulanceId)
    ambulanceBookings.set(ambulanceId, bookingId)

    // Join the booking room
    socket.join(`booking:${bookingId}`)

    // Notify the user
    const userSocket = connectedClients.users.get(userId)
    if (userSocket) {
      userSocket.join(`booking:${bookingId}`)
      userSocket.emit("booking:assigned", {
        bookingId,
        ambulanceId,
        location: ambulanceLocations.get(ambulanceId),
      })
    }

    // Notify the ambulance
    const ambulanceSocket = connectedClients.ambulances.get(ambulanceId)
    if (ambulanceSocket) {
      ambulanceSocket.join(`booking:${bookingId}`)
      ambulanceSocket.emit("booking:assigned", {
        bookingId,
        ambulanceId,
      })
    }
  })

  // Handle booking status updates
  socket.on("booking:status", (data) => {
    const { bookingId, status, ambulanceId } = data
    console.log(`Booking ${bookingId} status updated to:`, status)

    // Emit to all clients in the booking room
    io.to(`booking:${bookingId}`).emit("booking:status:update", {
      bookingId,
      status,
      timestamp: Date.now(),
    })

    // If booking is completed or cancelled, clean up
    if (status === "completed" || status === "cancelled") {
      bookingAmbulances.delete(bookingId)
      if (ambulanceId) {
        ambulanceBookings.delete(ambulanceId)
      }
    }
  })

  // Handle user tracking a booking
  socket.on("booking:track", (data) => {
    const { bookingId, userId } = data
    console.log(`User ${userId} tracking booking ${bookingId}`)

    socket.join(`booking:${bookingId}`)

    // Send current ambulance location if available
    const ambulanceId = bookingAmbulances.get(bookingId)
    if (ambulanceId) {
      const location = ambulanceLocations.get(ambulanceId)
      if (location) {
        socket.emit("ambulance:location:update", {
          ambulanceId,
          bookingId,
          location,
          timestamp: Date.now(),
        })
      }
    }
  })

  // Handle user stopping tracking
  socket.on("booking:untrack", (data) => {
    const { bookingId } = data
    socket.leave(`booking:${bookingId}`)
  })

  // Handle driver location updates
  socket.on("driver:location", (data) => {
    const { driverId, location } = data

    // Broadcast driver location to relevant clients
    socket.broadcast.emit("driver:location:update", {
      driverId,
      location,
      timestamp: Date.now(),
    })
  })

  // Handle ETA updates
  socket.on("ambulance:eta", (data) => {
    const { ambulanceId, bookingId, eta, distance } = data

    // Emit ETA update to booking room
    io.to(`booking:${bookingId}`).emit("ambulance:eta:update", {
      ambulanceId,
      bookingId,
      eta,
      distance,
      timestamp: Date.now(),
    })
  })

  // Handle emergency alerts
  socket.on("emergency:alert", (data) => {
    const { bookingId, message, level } = data
    console.log("Emergency alert:", data)

    // Broadcast emergency alert to all relevant parties
    io.to(`booking:${bookingId}`).emit("emergency:alert", {
      bookingId,
      message,
      level,
      timestamp: Date.now(),
    })
  })

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id)

    // Clean up based on client type
    if (socket.userType === "user" && socket.userId) {
      connectedClients.users.delete(socket.userId)
    } else if (socket.userType === "driver" && socket.userId) {
      connectedClients.drivers.delete(socket.userId)
    } else if (socket.userType === "ambulance" && socket.ambulanceId) {
      connectedClients.ambulances.delete(socket.ambulanceId)
      // Remove location data for disconnected ambulance
      ambulanceLocations.delete(socket.ambulanceId)
    }
  })

  // Handle ping for connection health
  socket.on("ping", () => {
    socket.emit("pong")
  })
})

// API endpoints
app.get("/api/ambulances/locations", (req, res) => {
  const locations = Array.from(ambulanceLocations.values())
  res.json(locations)
})

app.get("/api/ambulances/:id/location", (req, res) => {
  const { id } = req.params
  const location = ambulanceLocations.get(id)

  if (location) {
    res.json(location)
  } else {
    res.status(404).json({ error: "Ambulance not found" })
  }
})

app.get("/api/bookings/:id/ambulance", (req, res) => {
  const { id } = req.params
  const ambulanceId = bookingAmbulances.get(id)

  if (ambulanceId) {
    const location = ambulanceLocations.get(ambulanceId)
    res.json({
      ambulanceId,
      location: location || null,
    })
  } else {
    res.status(404).json({ error: "No ambulance assigned to this booking" })
  }
})

app.get("/api/status", (req, res) => {
  res.json({
    status: "online",
    connectedClients: {
      users: connectedClients.users.size,
      drivers: connectedClients.drivers.size,
      ambulances: connectedClients.ambulances.size,
    },
    activeAmbulances: ambulanceLocations.size,
    activeBookings: bookingAmbulances.size,
  })
})

const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`)
  console.log(`WebSocket endpoint: ws://localhost:${PORT}`)
})
