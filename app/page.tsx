'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Home() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    setIsAuthenticated(!!token)
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center text-white max-w-md">
          <h1 className="text-5xl font-bold mb-4">Math Club</h1>
          <p className="text-xl text-blue-100 mb-8">
            Competitive Programming Excellence
          </p>

          {isAuthenticated ? (
            <>
              <p className="text-blue-100 mb-8">
                Welcome back! You are logged in.
              </p>
              <Link href="/dashboard">
                <button className="w-full bg-white text-blue-600 font-bold py-3 px-8 rounded-lg hover:bg-blue-50 transition duration-200 mb-4">
                  Go to Dashboard
                </button>
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem('auth_token')
                  localStorage.removeItem('user_type')
                  localStorage.removeItem('user_id')
                  setIsAuthenticated(false)
                }}
                className="w-full bg-blue-400 hover:bg-blue-300 text-white font-bold py-3 px-8 rounded-lg transition duration-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <p className="text-blue-100 mb-8">
                Sign in to access your account or manage the platform.
              </p>
              <Link href="/login">
                <button className="w-full bg-white text-blue-600 font-bold py-3 px-8 rounded-lg hover:bg-blue-50 transition duration-200">
                  Sign In
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

