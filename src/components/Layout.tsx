import type React from "react"
// src/components/Layout.tsx
import Header from "./Header.tsx"
import Footer from "./components/Footer.tsx"

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  )
}

export default Layout
