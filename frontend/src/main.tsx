import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.tsx"
import "./index.css"
import { AuthProvider } from "./contexts/AuthContext.tsx"
import { BookingProvider } from "./contexts/BookingContext.tsx"

// Ensure the Google Maps script is loaded with the API key
// This assumes VITE_GOOGLE_MAPS_API_KEY is available in your .env.local or similar
// and is exposed via Vite's import.meta.env
const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

if (googleMapsApiKey) {
  // @ts-ignore
  window.initGoogleMaps(googleMapsApiKey)
} else {
  console.error("VITE_GOOGLE_MAPS_API_KEY is not defined. Google Maps may not load correctly.")
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <BookingProvider>
        <App />
      </BookingProvider>
    </AuthProvider>
  </React.StrictMode>,
)
