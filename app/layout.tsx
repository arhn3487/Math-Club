import type { Metadata } from 'next'
import { Navbar, Footer } from '@/components/layout/Navigation'
import './globals.css'

export const metadata: Metadata = {
  title: 'Math Club - Competitive Programming',
  description: 'Join our math olympiad club for competitive programming excellence',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
