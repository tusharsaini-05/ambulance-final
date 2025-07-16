"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { socketService } from "../lib/socket.ts"
import { Button } from "./ui/button.tsx"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card.tsx"
import { Input } from "./ui/input.tsx"
import { Label } from "./ui/label.tsx"

interface AmbulanceSimulatorProps {
  driverId: string
}

const AmbulanceSimulator: React.FC<AmbulanceSimulatorProps> = ({ driverId }) => {
  const [currentLat, setCurrentLat] = useState(28.7041) // Delhi latitude
  const [currentLng, setCurrentLng] = useState(77.1025) // Delhi longitude
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [speed, setSpeed] = useState(0.001) // Degrees per update
  const [targetLat, setTargetLat] = useState(28.7041)
  const [targetLng, setTargetLng] = useState(77.1025)

  const simulationRef = useRef<{
    currentLat: number
    currentLng: number
    targetLat: number
    targetLng: number
    speed: number
    driverId: string
  }>({
    currentLat,
    currentLng,
    targetLat,
    targetLng,
    speed,
    driverId,
  })

  useEffect(() => {
    simulationRef.current = { currentLat, currentLng, targetLat, targetLng, speed, driverId }
  }, [currentLat, currentLng, targetLat, targetLng, speed, driverId])

  const startSimulation = () => {
    if (intervalId) clearInterval(intervalId)

    setIsSimulating(true)
    const id = setInterval(() => {
      const { currentLat, currentLng, targetLat, targetLng, speed, driverId } = simulationRef.current

      const latDiff = targetLat - currentLat
      const lngDiff = targetLng - currentLng
      const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff)

      if (distance < speed) {
        // Reached target, stop or pick new target
        setCurrentLat(targetLat)
        setCurrentLng(targetLng)
        socketService.emitLocationUpdate(driverId, targetLat, targetLng)
        // Optionally, set a new random target or stop
        // stopSimulation();
        return
      }

      const ratio = speed / distance
      const newLat = currentLat + latDiff * ratio
      const newLng = currentLng + lngDiff * ratio

      setCurrentLat(newLat)
      setCurrentLng(newLng)
      socketService.emitLocationUpdate(driverId, newLat, newLng)
    }, 1000) // Update every 1 second
    setIntervalId(id)
  }

  const stopSimulation = () => {
    if (intervalId) {
      clearInterval(intervalId)
      setIntervalId(null)
    }
    setIsSimulating(false)
  }

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [intervalId])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Ambulance Location Simulator (Driver: {driverId.substring(0, 8)})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="currentLat">Current Latitude:</Label>
          <Input
            id="currentLat"
            type="number"
            value={currentLat}
            onChange={(e) => setCurrentLat(Number.parseFloat(e.target.value))}
            step="0.0001"
          />
        </div>
        <div>
          <Label htmlFor="currentLng">Current Longitude:</Label>
          <Input
            id="currentLng"
            type="number"
            value={currentLng}
            onChange={(e) => setCurrentLng(Number.parseFloat(e.target.value))}
            step="0.0001"
          />
        </div>
        <div>
          <Label htmlFor="targetLat">Target Latitude:</Label>
          <Input
            id="targetLat"
            type="number"
            value={targetLat}
            onChange={(e) => setTargetLat(Number.parseFloat(e.target.value))}
            step="0.0001"
          />
        </div>
        <div>
          <Label htmlFor="targetLng">Target Longitude:</Label>
          <Input
            id="targetLng"
            type="number"
            value={targetLng}
            onChange={(e) => setTargetLng(Number.parseFloat(e.target.value))}
            step="0.0001"
          />
        </div>
        <div>
          <Label htmlFor="speed">Speed (degrees/sec):</Label>
          <Input
            id="speed"
            type="number"
            value={speed}
            onChange={(e) => setSpeed(Number.parseFloat(e.target.value))}
            step="0.0001"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={startSimulation} disabled={isSimulating}>
            Start Simulation
          </Button>
          <Button onClick={stopSimulation} disabled={!isSimulating} variant="destructive">
            Stop Simulation
          </Button>
        </div>
        <p className="text-sm text-gray-500">Status: {isSimulating ? "Simulating..." : "Idle"}</p>
      </CardContent>
    </Card>
  )
}

export default AmbulanceSimulator
