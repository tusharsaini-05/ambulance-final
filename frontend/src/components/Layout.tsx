import type React from "react"
import type { ReactNode } from "react"
import Header from "./Header.tsx"
import Footer from "./Footer.tsx"

interface LayoutProps {
  children: ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
      <Footer />
    </div>
  )
}

export default Layout
