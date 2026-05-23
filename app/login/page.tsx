'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
    user_type: 'student' as 'student' | 'admin',
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
        user_type: formData.user_type,
      })

      if (response.data.success) {
        // Store token and user info
        localStorage.setItem('auth_token', response.data.token)
        localStorage.setItem('user_type', response.data.user?.user_type)
        localStorage.setItem('user_id', response.data.user?.user_id)
        localStorage.setItem('full_name', response.data.user?.full_name || 'User')
        if (response.data.user?.profile_image_url) {
          localStorage.setItem('profile_image_url', response.data.user.profile_image_url)
        } else {
          localStorage.removeItem('profile_image_url')
        }

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
    <div className="page-shell flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:text-neutral-950">
            Back to Home
          </Link>
          <img
            src="https://zxkeolkojkoenkszekiy.supabase.co/storage/v1/object/public/math-club-images/Math%20Club%20Logo/math%20club%20logo%202.png"
            alt="Math Club Logo"
            className="mx-auto my-6 h-28 w-auto object-contain"
          />
          <h1 className="text-4xl font-black tracking-tight text-neutral-950">Math Club</h1>
          <p className="mt-2 text-sm font-medium tracking-[0.2em] uppercase text-neutral-500">
            
          </p>
        </div>

        <div className="mono-surface rounded-[2rem] p-8 md:p-10">
          <h2 className="text-2xl font-black tracking-tight text-neutral-950">Login</h2>

          {/* General Error Message */}
          {generalError && (
            <div className="mb-4 rounded-xl border border-neutral-300 bg-neutral-50 p-4 text-sm text-neutral-700">
              {generalError.message}
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 rounded-xl border border-neutral-300 bg-neutral-50 p-4 text-sm text-neutral-700">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Account Type Selection */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-neutral-700">Account Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, user_type: 'student' }))
                  }}
                  className={`mono-button px-3 py-3 text-sm font-semibold ${
                    formData.user_type === 'student'
                      ? ''
                      : 'mono-button--light'
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, user_type: 'admin' }))
                  }}
                  className={`mono-button px-3 py-3 text-sm font-semibold ${
                    formData.user_type === 'admin'
                      ? ''
                      : 'mono-button--light'
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>

            {/* User ID Field */}
            <div>
              <label htmlFor="user_id" className="mb-1 block text-sm font-semibold text-neutral-700">
                {formData.user_type === 'student' ? 'Student ID' : 'Admin ID'}
              </label>
              <input
                type="text"
                id="user_id"
                name="user_id"
                value={formData.user_id}
                onChange={handleChange}
                disabled={isLoading}
                className={`mono-input ${getFieldError('user_id') ? 'border-red-500' : ''}`}
                placeholder={formData.user_type === 'student' ? 'e.g., STU001' : 'e.g., ADM001'}
              />
              {getFieldError('user_id') && (
                <p className="mt-1 text-sm text-neutral-600">{getFieldError('user_id')}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-semibold text-neutral-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                className={`mono-input ${getFieldError('password') ? 'border-red-500' : ''}`}
                placeholder="Enter your password"
              />
              {getFieldError('password') && (
                <p className="mt-1 text-sm text-neutral-600">{getFieldError('password')}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mono-button w-full px-4 py-3 text-sm font-semibold disabled:opacity-50"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-600">
            Need an account?{' '}
            <Link href="/signup" className="font-semibold text-neutral-900 underline underline-offset-4">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
