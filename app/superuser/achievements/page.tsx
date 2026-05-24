'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Achievement } from '@/types'

type AchievementForm = {
  title: string
  date: string
  image: string
}

export default function SuperuserAchievementsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<AchievementForm>({
    title: '',
    date: '',
    image: '',
  })

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const userType = localStorage.getItem('user_type')

    if (!token || userType !== 'superuser') {
      router.push('/dashboard')
      return
    }

    loadAchievements()
  }, [router])

  const loadAchievements = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/achievements')
      if (!response.ok) throw new Error('Failed to load achievements')
      const data = await response.json()
      setAchievements(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load achievements')
    } finally {
      setLoading(false)
    }
  }

  const uploadImage = async (): Promise<string> => {
    if (!selectedFile) return form.image

    const token = localStorage.getItem('auth_token')
    const formData = new FormData()
    formData.append('file', selectedFile)

    const response = await fetch('/api/uploads/achievement-image', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Image upload failed')
    }

    return data.image_url as string
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    try {
      const imageUrl = await uploadImage()
      const token = localStorage.getItem('auth_token')
      const isEditing = Boolean(editingId)

      const response = await fetch(
        isEditing ? `/api/achievements?id=${editingId}` : '/api/achievements',
        {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: form.title,
          date: form.date,
          image: imageUrl || null,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save achievement')
      }

      setMessage(isEditing ? 'Achievement updated successfully' : 'Achievement added successfully')
      setForm({ title: '', date: '', image: '' })
      setSelectedFile(null)
      setEditingId(null)
      await loadAchievements()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save achievement')
    } finally {
      setSaving(false)
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem('auth_token')
    const response = await fetch(`/api/achievements?id=${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      setError('Failed to delete achievement')
      return
    }

    setAchievements((current) => current.filter((achievement) => achievement.id !== id))
  }

  const handleEdit = (achievement: Achievement) => {
    setEditingId(achievement.id)
    setForm({
      title: achievement.title || '',
      date: achievement.date || '',
      image: achievement.image || '',
    })
    setSelectedFile(null)
    setMessage('')
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setForm({ title: '', date: '', image: '' })
    setSelectedFile(null)
    setMessage('')
    setError('')
  }

  if (loading) {
    return <div className="page-shell flex items-center justify-center px-4 py-10 text-sm text-neutral-600">Loading achievements...</div>
  }

  return (
    <div className="page-shell px-4 py-10">
      <div className="mono-container space-y-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="mono-badge">Superuser</span>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-neutral-950">Achievements Manager</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-neutral-600">
              Add club photos and event details for the public landing page. Only the superuser can manage this content.
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="mono-button mono-button--light px-5 py-3 text-sm font-semibold"
          >
            Back to Dashboard
          </button>
        </div>

        {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {message && <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">{message}</div>}

        <form onSubmit={handleSubmit} className="mono-surface rounded-[2rem] p-6 md:p-8 space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-neutral-700">Title</span>
              <input
                className="mono-input w-full"
                value={form.title}
                onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))}
                placeholder="Inter University Math Olympiad"
                required
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-neutral-700">Event Date</span>
              <input
                type="date"
                className="mono-input w-full"
                value={form.date}
                onChange={(e) => setForm((current) => ({ ...current, date: e.target.value }))}
                required
              />
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-neutral-700">Achievement Photo</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="mono-input w-full"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-neutral-700">Or Image URL</span>
              <input
                className="mono-input w-full"
                value={form.image}
                onChange={(e) => setForm((current) => ({ ...current, image: e.target.value }))}
                placeholder="https://..."
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={saving || uploading}
            className="mono-button px-6 py-3 text-sm font-semibold disabled:opacity-50"
          >
            {saving ? 'Saving...' : editingId ? 'Update Achievement' : 'Add Achievement'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="ml-3 px-6 py-3 text-sm font-semibold text-neutral-600 underline underline-offset-4"
            >
              Cancel Edit
            </button>
          )}
        </form>

        <section className="space-y-4">
          <h2 className="text-2xl font-black tracking-tight text-neutral-950">Existing Achievements</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {achievements.map((achievement) => (
              <article key={achievement.id} className="rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm">
                {achievement.image && (
                  <img src={achievement.image} alt={achievement.title || 'Achievement'} className="mb-4 h-48 w-full rounded-2xl object-cover" />
                )}
                <h3 className="text-lg font-bold text-neutral-950">{achievement.title}</h3>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-neutral-500">{achievement.date}</p>
                <div className="mt-4 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => handleEdit(achievement)}
                    className="text-sm font-semibold text-neutral-900 hover:text-neutral-600"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(achievement.id)}
                    className="text-sm font-semibold text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}