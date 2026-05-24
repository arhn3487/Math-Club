'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

interface RegistrationError {
  field?: 'user_id' | 'password' | 'full_name' | 'email' | 'user_type' | 'general'
  message: string
}

export default function AdminRegisterPage() {
  const router = useRouter()
  const [isSuperuser, setIsSuperuser] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    user_id: '',
    password: '',
    full_name: '',
    email: '',
    user_type: 'student' as 'student' | 'admin',
  })
  const [errors, setErrors] = useState<RegistrationError[]>([])
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        const userType = localStorage.getItem('user_type')

        if (!token || userType !== 'superuser') {
          router.push('/login')
          return
        }

        setIsSuperuser(true)
        setIsLoading(false)
      } catch (error) {
        console.error('Verification error:', error)
        router.push('/login')
      }
    }

    verifyAdmin()
  }, [router])

  const validateForm = (): boolean => {
    const newErrors: RegistrationError[] = []

    if (!formData.user_id.trim()) {
      newErrors.push({
        field: 'user_id',
        message: 'User ID is required',
      })
    } else if (formData.user_id.trim().length > 50) {
      newErrors.push({
        field: 'user_id',
        message: 'User ID must be less than 50 characters',
      })
    }

    if (!formData.password) {
      newErrors.push({
        field: 'password',
        message: 'Password is required',
      })
    } else if (formData.password.length < 6) {
      newErrors.push({
        field: 'password',
        message: 'Password must be at least 6 characters',
      })
    }

    if (!formData.full_name.trim()) {
      newErrors.push({
        field: 'full_name',
        message: 'Full name is required',
      })
    }

    if (!formData.email.trim()) {
      newErrors.push({
        field: 'email',
        message: 'Email is required',
      })
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        newErrors.push({
          field: 'email',
          message: 'Invalid email format',
        })
      }
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMessage('')

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const token = localStorage.getItem('auth_token')
      const response = await axios.post('/api/auth/register', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        setSuccessMessage(`User ${formData.user_id} registered successfully!`)
        // Reset form
        setFormData({
          user_id: '',
          password: '',
          full_name: '',
          email: '',
          user_type: 'student',
        })
        setErrors([])
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || 'Registration failed. Please try again.'
        setErrors([
          {
            field: 'general',
            message,
          },
        ])
      } else {
        setErrors([
          {
            field: 'general',
            message: 'An unexpected error occurred',
          },
        ])
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear errors for this field
    setErrors((prev) => prev.filter((err) => err.field !== name))
  }

  const getFieldError = (field: string) => {
    return errors.find((err) => err.field === field)?.message
  }

  const generalError = errors.find((err) => err.field === 'general')

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

  if (!isSuperuser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Unauthorized</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Register New User</h1>
            <a
              href="/dashboard"
              className="text-blue-600 hover:text-blue-700"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow p-8">
          {generalError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700">
              {generalError.message}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded text-green-700">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User ID Field */}
              <div>
                <label htmlFor="user_id" className="block text-sm font-medium text-gray-700 mb-1">
                  User ID
                </label>
                <input
                  type="text"
                  id="user_id"
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    getFieldError('user_id')
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300'
                  }`}
                  placeholder="e.g., student_001"
                />
                {getFieldError('user_id') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('user_id')}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    getFieldError('password')
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300'
                  }`}
                  placeholder="Minimum 6 characters"
                />
                {getFieldError('password') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('password')}</p>
                )}
              </div>

              {/* Full Name Field */}
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    getFieldError('full_name')
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300'
                  }`}
                  placeholder="Full name"
                />
                {getFieldError('full_name') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('full_name')}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    getFieldError('email')
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300'
                  }`}
                  placeholder="user@example.com"
                />
                {getFieldError('email') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('email')}</p>
                )}
              </div>

              {/* User Type Field */}
              <div>
                <label htmlFor="user_type" className="block text-sm font-medium text-gray-700 mb-1">
                  User Type
                </label>
                <select
                  id="user_type"
                  name="user_type"
                  value={formData.user_type}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
            >
              {isLoading ? 'Registering...' : 'Register User'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
