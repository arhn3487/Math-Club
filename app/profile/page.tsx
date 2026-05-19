"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type User = {
  id: string
  user_id: string
  full_name: string
  email: string
  phone?: string
  batch_year?: number
  profile_image_url?: string | null
  user_type: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<any>({})
  const [results, setResults] = useState<any[] | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      router.push('/login')
      return
    }

    async function load() {
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) {
          router.push('/login')
          return
        }

        const data = await res.json()
        if (data?.user) {
          setUser(data.user)
          setForm({
            full_name: data.user.full_name || '',
            phone: data.user.phone || '',
            email: data.user.email || '',
          })

          // load results
          const r = await fetch('/api/exams/results', {
            headers: { Authorization: `Bearer ${token}` },
          })

          if (r.ok) {
            const rr = await r.json()
            setResults(rr.results || [])
          } else {
            setResults([])
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [router])

  if (loading) return <div className="p-8">Loading...</div>
  if (!user) return <div className="p-8">Not authenticated</div>

  async function save() {
    const token = localStorage.getItem('auth_token')
    try {
      const res = await fetch(`/api/users?id=${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: form.full_name,
          phone: form.phone,
          email: form.email,
        }),
      })

      if (!res.ok) throw new Error('Failed to save')

      const updated = await res.json()
      setUser(updated)
      setEditing(false)
    } catch (err) {
      console.error(err)
      alert('Failed to save profile')
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>

      <div className="flex items-center gap-6 mb-6">
        <img
          src={user.profile_image_url || '/default-avatar.png'}
          alt="Profile"
          className="h-24 w-24 rounded-full object-cover"
        />
        <div>
          <div className="text-lg font-semibold">{user.full_name || 'Unnamed'}</div>
          <div className="text-sm text-gray-600">{user.email}</div>
          <div className="text-sm text-gray-600">Role: {user.user_type}</div>
        </div>
      </div>

      <div className="mb-6">
        {editing ? (
          <div className="space-y-3">
            <div>
              <label className="block text-sm">Full name</label>
              <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm">Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border p-2 rounded" />
            </div>
            <div className="flex gap-2">
              <button onClick={save} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
              <button onClick={() => setEditing(false)} className="px-4 py-2 border rounded">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div><strong>Phone:</strong> {user.phone || 'Vacant'}</div>
            <div><strong>Batch year:</strong> {user.batch_year || 'Vacant'}</div>
            <div className="mt-3">
              <button onClick={() => setEditing(true)} className="px-4 py-2 bg-indigo-600 text-white rounded">Edit Profile</button>
            </div>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-3">Exam Results</h2>
        {results === null ? (
          <div>Loading results…</div>
        ) : results.length === 0 ? (
          <div className="text-gray-500">No results — Vacant</div>
        ) : (
          <div className="space-y-3">
            {results.map((r: any) => (
              <div key={r.id} className="p-3 border rounded">
                <div className="font-semibold">{r.exam_name}</div>
                <div>Score: {r.total_marks_obtained}/{r.total_marks} ({r.percentage}%)</div>
                <div className="text-sm text-gray-500">Completed: {new Date(r.completed_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
