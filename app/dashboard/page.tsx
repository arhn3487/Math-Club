'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { UserProfileDTO } from '@/types/dtos'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfileDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = localStorage.getItem('auth_token')

        if (!token) {
          router.push('/login')
          return
        }

        // Verify token
        const response = await axios.get('/api/auth/verify', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.data.success) {
          localStorage.removeItem('auth_token')
          router.push('/login')
          return
        }

        // Load user data from localStorage
        const userType = localStorage.getItem('user_type')
        const userId = localStorage.getItem('user_id')

        if (userType && userId) {
          setUser({
            id: '',
            user_id: userId,
            user_type: (userType as 'student' | 'admin') || 'student',
            full_name: 'User',
            email: 'user@example.com',
            is_active: true,
          })
        }

        setIsLoading(false)
      } catch (err) {
        console.error('Verification error:', err)
        localStorage.removeItem('auth_token')
        router.push('/login')
      }
    }

    verifyToken()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_type')
    localStorage.removeItem('user_id')
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || 'Failed to load user data'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back to Math Club</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">User Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-600 text-sm font-medium">User ID</p>
              <p className="text-gray-900 text-lg font-semibold">{user.user_id}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">User Type</p>
              <p className="text-gray-900 text-lg font-semibold capitalize">{user.user_type}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Full Name</p>
              <p className="text-gray-900 text-lg font-semibold">{user.full_name}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Email</p>
              <p className="text-gray-900 text-lg font-semibold">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Role-based Content */}
        {user.user_type === 'admin' && (
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Panel</h2>
            <p className="text-gray-600 mb-4">
              You have administrative access to manage users and system settings.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="/admin/users"
                className="block p-4 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition duration-200"
              >
                <h3 className="font-semibold text-blue-600">Manage Users</h3>
                <p className="text-gray-600 text-sm">View and manage all users</p>
              </a>
              <a
                href="/admin/register"
                className="block p-4 border-2 border-green-600 rounded-lg hover:bg-green-50 transition duration-200"
              >
                <h3 className="font-semibold text-green-600">Register User</h3>
                <p className="text-gray-600 text-sm">Create new user accounts</p>
              </a>
            </div>
          </div>
        )}

        {user.user_type === 'student' && (
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Student Dashboard</h2>
            <p className="text-gray-600 mb-4">Welcome to your student dashboard.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900">Courses</h3>
                <p className="text-blue-600 text-lg">0</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-900">Achievements</h3>
                <p className="text-green-600 text-lg">0</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-900">Progress</h3>
                <p className="text-purple-600 text-lg">0%</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
