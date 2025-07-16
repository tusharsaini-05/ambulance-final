import type React from "react"

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white p-4 text-center mt-8">
      <div className="container mx-auto">
        <p>&copy; {new Date().getFullYear()} Ambulance Finder. All rights reserved.</p>
        <p className="text-sm mt-2">Designed and Developed with ❤️</p>
      </div>
    </footer>
  )
}

export default Footer
