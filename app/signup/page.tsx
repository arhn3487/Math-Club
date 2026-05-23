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
      <div className="page-shell flex items-center justify-center px-4 py-10">
        <div className="mono-surface w-full max-w-md rounded-[2rem] p-8 md:p-10">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-neutral-300 bg-neutral-50">
              <svg
                className="h-6 w-6 text-neutral-900"
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
            <h2 className="mt-4 text-2xl font-black tracking-tight text-neutral-950">Signup Successful!</h2>
            <p className="mt-2 text-sm leading-7 text-neutral-600">
              Check your email to verify your account. An admin will review your request and approve or reject it.
            </p>
            <Link
              href="/login"
              className="mono-button mt-6 block w-full px-4 py-3 text-center text-sm font-semibold"
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
      <div className="page-shell flex items-center justify-center px-4 py-10">
        <div className="mono-surface w-full max-w-md rounded-[2rem] p-8 md:p-10">
          <h1 className="text-center text-3xl font-black tracking-tight text-neutral-950">Join Math Club</h1>
          <p className="mb-8 mt-2 text-center text-sm leading-7 text-neutral-600">Select your account type to continue</p>

          <div className="space-y-4">
            <button
              onClick={() => setUserType('student')}
              className="mono-button mono-button--light w-full p-4 text-left"
            >
              <div className="font-bold text-neutral-950">Student Account</div>
              {/* <div className="text-sm text-neutral-600">Access courses, exams, and resources</div> */}
            </button>
            
            <button
              onClick={() => setUserType('admin')}
              className="mono-button mono-button--light w-full p-4 text-left"
            >
              <div className="font-bold text-neutral-950">Admin Account</div>
              {/* <div className="text-sm text-neutral-600">Manage content, exams, and users</div> */}
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-neutral-600">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-neutral-900 underline underline-offset-4">
              Login
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-shell flex items-center justify-center px-4 py-10">
      <div className="mono-surface w-full max-w-md rounded-[2rem] p-8 md:p-10">
        <button
          onClick={() => setUserType('')}
          className="mb-4 text-sm font-semibold text-neutral-600 transition-colors hover:text-neutral-950"
        >
          ← Back to Account Type
        </button>

        <h1 className="text-3xl font-black tracking-tight text-neutral-950 mb-1">
          {userType === 'student' ? 'Student' : 'Admin'} Signup
        </h1>
        <p className="text-sm leading-7 text-neutral-600 mb-6">Join the Math Club</p>

        {error && (
          <div className="mb-4 rounded-xl border border-neutral-300 bg-neutral-50 p-3 text-sm text-neutral-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-neutral-700">Full Name *</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              className="mono-input"
              placeholder="Arafat Hasan"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-neutral-700">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mono-input"
              placeholder="2023........mist.ac.bd"
            />
          </div>

          {userType === 'student' && (
            <>
              <div>
                <label className="mb-1 block text-sm font-semibold text-neutral-700">Student ID *</label>
                <input
                  type="text"
                  name="student_id"
                  value={formData.student_id}
                  onChange={handleChange}
                  required
                  className="mono-input"
                  placeholder="2023............"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-neutral-700">Batch Year *</label>
                <select
                  name="batch_year"
                  value={formData.batch_year}
                  onChange={handleChange}
                  required
                  className="mono-input"
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
              <label className="mb-1 block text-sm font-semibold text-neutral-700">Admin ID *</label>
              <input
                type="text"
                name="admin_id"
                value={formData.admin_id}
                onChange={handleChange}
                required
                className="mono-input"
                placeholder="ADM001"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-semibold text-neutral-700">Profile Photo</label>
            <input
              type="file"
              name="profile_image"
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp"
              className="mono-input"
            />
            <p className="mt-1 text-xs text-neutral-500">JPEG, PNG Max 1 MB.</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-neutral-700">Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="mono-input"
              placeholder="Min 8 characters"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-neutral-700">Confirm Password *</label>
            <input
              type="password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              required
              className="mono-input"
              placeholder="Confirm your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mono-button w-full px-4 py-3 text-sm font-semibold disabled:opacity-50"
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-600">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-neutral-950 underline underline-offset-4">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
