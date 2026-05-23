'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ProfileUser {
  id: string
  user_id: string
  user_type: 'student' | 'admin'
  full_name: string
  email: string
  batch_year?: number | null
  profile_image_url?: string | null
  student_id?: string | null
  admin_id?: string | null
}

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [user, setUser] = useState<ProfileUser | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    batch_year: '',
    profile_image: null as File | null,
  })

  const isStudent = user?.user_type === 'student'

  const batchYears = useMemo(() => {
    const currentYear = new Date().getFullYear()
    return Array.from({ length: currentYear - 2013 }, (_, index) => 2014 + index).reverse()
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      router.push('/login')
      return
    }

    const loadProfile = async () => {
      try {
        const response = await fetch('/api/profile', {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
          throw new Error('Failed to load profile')
        }

        const data = await response.json()
        const profileUser: ProfileUser = data.user
        setUser(profileUser)
        setPreviewUrl(profileUser.profile_image_url || null)
        setFormData({
          full_name: profileUser.full_name || '',
          email: profileUser.email || '',
          password: '',
          batch_year: profileUser.batch_year ? String(profileUser.batch_year) : '',
          profile_image: null,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    void loadProfile()
  }, [router])

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setFormData((prev) => ({ ...prev, profile_image: file }))
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!user) return

    const token = localStorage.getItem('auth_token')
    if (!token) return

    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const payload = new FormData()
      payload.append('full_name', formData.full_name)
      payload.append('email', formData.email)
      payload.append('password', formData.password)
      if (isStudent) {
        payload.append('batch_year', formData.batch_year)
      }
      if (formData.profile_image) {
        payload.append('profile_image', formData.profile_image)
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: payload,
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile')
      }

      const updatedUser: ProfileUser = data.user
      setUser(updatedUser)
      setPreviewUrl(updatedUser.profile_image_url || null)
      setFormData((prev) => ({
        ...prev,
        password: '',
        batch_year: updatedUser.batch_year ? String(updatedUser.batch_year) : '',
        profile_image: null,
      }))

      localStorage.setItem('full_name', updatedUser.full_name)
      if (updatedUser.profile_image_url) {
        localStorage.setItem('profile_image_url', updatedUser.profile_image_url)
      }
      setSuccess('Profile updated successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm font-medium tracking-[0.2em] text-neutral-500 uppercase">Loading profile</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 text-neutral-900">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">Account</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-neutral-950">Edit Profile</h1>
          </div>
          <Link href="/dashboard" className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50">
            Back
          </Link>
        </div>

        {error && <div className="mb-4 rounded border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
        {success && <div className="mb-4 rounded border border-green-200 bg-green-50 p-4 text-green-700">{success}</div>}

        <form onSubmit={handleSubmit} className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-neutral-200">
          <div className="mb-6 flex items-center gap-4">
            {previewUrl ? (
              <img src={previewUrl} alt="Profile" className="h-20 w-20 rounded-full object-cover ring-1 ring-neutral-200" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 text-2xl font-black text-neutral-900 ring-1 ring-neutral-200">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-neutral-950">{user.full_name}</h2>
              <p className="text-sm text-neutral-600">{user.user_type === 'student' ? 'Student account' : 'Admin account'}</p>
              <label className="mt-3 inline-flex cursor-pointer rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800">
                Change photo
                <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleImageChange} />
              </label>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-neutral-700">Full Name</label>
              <input
                value={formData.full_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, full_name: e.target.value }))}
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-900"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-neutral-700">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-900"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-neutral-700">New Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="Leave blank to keep current password"
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-900"
              />
            </div>

            {isStudent ? (
              <div>
                <label className="mb-1 block text-sm font-semibold text-neutral-700">Batch Year</label>
                <select
                  value={formData.batch_year}
                  onChange={(e) => setFormData((prev) => ({ ...prev, batch_year: e.target.value }))}
                  className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-900"
                >
                  <option value="">Select batch year</option>
                  {batchYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="mb-1 block text-sm font-semibold text-neutral-700">Admin ID</label>
                <input
                  value={user.admin_id || ''}
                  readOnly
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-500 outline-none"
                />
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-semibold text-neutral-700">User ID</label>
              <input
                value={user.user_id}
                readOnly
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-500 outline-none"
              />
            </div>

            {!isStudent && (
              <div>
                <label className="mb-1 block text-sm font-semibold text-neutral-700">Student ID</label>
                <input
                  value={user.student_id || ''}
                  readOnly
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-500 outline-none"
                />
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-full border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
