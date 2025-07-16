function loadGoogleMapsScript(apiKey) {
  const script = document.createElement("script")
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
  script.async = true
  script.defer = true
  document.head.appendChild(script)
}

// Load the script when the window loads, using the environment variable
window.onload = () => {
  if (import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
    loadGoogleMapsScript(import.meta.env.VITE_GOOGLE_MAPS_API_KEY)
  } else {
    console.error("Google Maps API Key is not set. Please set VITE_GOOGLE_MAPS_API_KEY in your .env file.")
  }
}
