'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [userType, setUserType] = useState<'student' | 'admin' | ''>('')
  const [signupId, setSignupId] = useState('')
  
  const currentYear = new Date().getFullYear()
  const batchYears = Array.from({ length: currentYear - 2013 }, (_, i) => 2014 + i).reverse()

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    student_id: '',
    admin_id: '',
    batch_year: currentYear,
    password: '',
    confirm_password: '',
    profile_image: null as File | null,
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({ ...prev, profile_image: file }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('full_name', formData.full_name)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('password', formData.password)
      formDataToSend.append('confirm_password', formData.confirm_password)
      formDataToSend.append('user_type', userType)
      
      if (userType === 'student') {
        formDataToSend.append('student_id', formData.student_id)
        formDataToSend.append('batch_year', formData.batch_year.toString())
      } else {
        formDataToSend.append('admin_id', formData.admin_id)
      }

      if (formData.profile_image) {
        formDataToSend.append('profile_image', formData.profile_image)
      }

      const signupResponse = await fetch('/api/auth/signup', {
        method: 'POST',
        body: formDataToSend,
      })

      const signupData = await signupResponse.json()

      if (!signupResponse.ok) {
        setError(signupData.message || 'Signup failed')
        setLoading(false)
        return
      }

      setSuccess(true)
      setSignupId(signupData.user_id)
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Signup error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Signup Successful!</h2>
            <p className="mt-2 text-gray-600">
              Check your email to verify your account. An admin will review your request and approve or reject it.
            </p>
            <Link
              href="/login"
              className="mt-6 block w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition text-center"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!userType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Join Math Club</h1>
          <p className="text-gray-600 mb-8 text-center">Select your account type to continue</p>

          <div className="space-y-4">
            <button
              onClick={() => setUserType('student')}
              className="w-full p-4 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 transition text-left"
            >
              <div className="font-bold text-indigo-600">Student Account</div>
              <div className="text-sm text-gray-600">Access courses, exams, and resources</div>
            </button>
            
            <button
              onClick={() => setUserType('admin')}
              className="w-full p-4 border-2 border-green-600 rounded-lg hover:bg-green-50 transition text-left"
            >
              <div className="font-bold text-green-600">Admin Account</div>
              <div className="text-sm text-gray-600">Manage content, exams, and users</div>
            </button>
          </div>

          <p className="text-center text-gray-600 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Login
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 py-12">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <button
          onClick={() => setUserType('')}
          className="mb-4 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
        >
          ← Back to Account Type
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          {userType === 'student' ? 'Student' : 'Admin'} Signup
        </h1>
        <p className="text-gray-600 mb-6">Join the Math Club</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="you@example.com"
            />
          </div>

          {userType === 'student' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student ID *</label>
                <input
                  type="text"
                  name="student_id"
                  value={formData.student_id}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., STU001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batch Year *</label>
                <select
                  name="batch_year"
                  value={formData.batch_year}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {batchYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {userType === 'admin' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin ID *</label>
              <input
                type="text"
                name="admin_id"
                value={formData.admin_id}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., ADM001"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
            <input
              type="file"
              name="profile_image"
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-500 mt-1">JPEG, PNG or WebP. Max 5MB.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Min 8 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
            <input
              type="password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Confirm your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 font-medium"
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
