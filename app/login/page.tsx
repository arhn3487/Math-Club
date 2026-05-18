'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

interface LoginError {
  field?: 'user_id' | 'password' | 'general'
  message: string
}

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    user_id: '',
    password: '',
  })
  const [errors, setErrors] = useState<LoginError[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      router.push('/dashboard')
    }
  }, [router])

  const validateForm = (): boolean => {
    const newErrors: LoginError[] = []

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
      const response = await axios.post('/api/auth/login', {
        user_id: formData.user_id.trim(),
        password: formData.password,
      })

      if (response.data.success) {
        // Store token and user info
        localStorage.setItem('auth_token', response.data.token)
        localStorage.setItem('user_type', response.data.user?.user_type)
        localStorage.setItem('user_id', response.data.user?.user_id)

        setSuccessMessage('Login successful! Redirecting...')
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || 'Login failed. Please try again.'
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Math Club</h1>
          <p className="text-blue-100">Competitive Programming Excellence</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Login</h2>

          {/* General Error Message */}
          {generalError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
              {generalError.message}
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded text-green-700">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="Enter your user ID"
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
                placeholder="Enter your password"
              />
              {getFieldError('password') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('password')}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Demo Credentials (for testing):</p>
            <p className="text-gray-500">Student ID: student_001</p>
            <p className="text-gray-500">Admin ID: admin_001</p>
          </div>
        </div>
      </div>
    </div>
  )
}
