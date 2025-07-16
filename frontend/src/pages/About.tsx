import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.tsx"

const About: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-blue-700">About Ambulance Finder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-lg text-gray-700">
          <p>
            Ambulance Finder is a cutting-edge platform designed to revolutionize emergency medical services by
            connecting users directly with available ambulance drivers in real-time. Our mission is to provide swift,
            efficient, and reliable ambulance services when every second counts.
          </p>
          <p>
            Leveraging modern web technologies, our application allows users to quickly request an ambulance from their
            current location to a specified destination. Drivers receive instant notifications of new booking requests,
            enabling them to accept and manage trips seamlessly.
          </p>
          <p>
            Key features include:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Real-time ambulance tracking on an interactive map.</li>
              <li>Instant booking requests and driver assignment.</li>
              <li>Driver availability toggle for flexible service.</li>
              <li>Comprehensive booking history for both users and drivers.</li>
              <li>Secure user authentication and role-based access.</li>
            </ul>
          </p>
          <p>
            We are committed to enhancing public safety and providing peace of mind during critical moments. Ambulance
            Finder is built with a focus on speed, reliability, and user-friendliness.
          </p>
          <p className="text-center font-semibold text-blue-600">Your safety is our priority.</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default About
