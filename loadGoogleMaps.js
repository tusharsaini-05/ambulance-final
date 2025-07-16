export function loadGoogleMapsScript() {
  return new Promise((resolve, reject) => {
    if (typeof window.google === 'object' && window.google.maps) {
      resolve(); // Already loaded
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
