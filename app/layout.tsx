import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Math Club ',
  description: 'Join our math club for build up your logical thinking',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-white text-neutral-900 antialiased">
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  )
}
