"use client"

import { useState, useEffect } from "react"
import { useSocket } from "../hooks/useSocket.js"

interface AmbulanceData {
  id: string
  latitude: number
  longitude: number
  status: string
}

const AmbulanceSimulator = () => {
  const [ambulances, setAmbulances] = useState<AmbulanceData[]>([])
  const { socket, isConnected } = useSocket()

  useEffect(() => {
    if (isConnected) {
      socket.on("ambulances", (data: AmbulanceData[]) => {
        setAmbulances(data)
      })

      socket.emit("requestAmbulances")
    }

    return () => {
      if (isConnected) {
        socket.off("ambulances")
      }
    }
  }, [socket, isConnected])

  return (
    <div>
      <h2>Ambulance Simulator</h2>
      {isConnected ? (
        <div>
          <p>Connected to server!</p>
          <ul>
            {ambulances.map((ambulance) => (
              <li key={ambulance.id}>
                Ambulance ID: {ambulance.id}, Latitude: {ambulance.latitude}, Longitude: {ambulance.longitude}, Status:{" "}
                {ambulance.status}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>Connecting to server...</p>
      )}
    </div>
  )
}

export default AmbulanceSimulator
