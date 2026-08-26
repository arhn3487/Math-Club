'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Leadership } from '@/types'

type LeadershipForm = {
  full_name: string
  position: string
  batch_year: string
  term_start: string
  term_end: string
  is_current: boolean
  bio: string
  display_order: string
  photo_url: string
}

const emptyForm: LeadershipForm = {
  full_name: '',
  position: 'President',
  batch_year: '',
  term_start: '',
  term_end: '',
  is_current: false,
  bio: '',
  display_order: '0',
  photo_url: '',
}

export default function SuperuserLeadershipPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [members, setMembers] = useState<Leadership[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<LeadershipForm>(emptyForm)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const userType = localStorage.getItem('user_type')

    if (!token || userType !== 'superuser') {
      router.push('/dashboard')
      return
    }

    loadMembers()
  }, [router])

  const loadMembers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/leadership', { cache: 'no-store' })
      if (!response.ok) throw new Error('Failed to load leadership members')
      const data = await response.json()
      setMembers(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leadership members')
    } finally {
      setLoading(false)
    }
  }

  const uploadImage = async (): Promise<string> => {
    if (!selectedFile) return form.photo_url

    const token = localStorage.getItem('auth_token')
    const formData = new FormData()
    formData.append('file', selectedFile)

    const response = await fetch('/api/uploads/leadership-image', {
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
    if (!form.full_name.trim()) {
      setError('Full name is required')
      return
    }

    setSaving(true)
    setError('')
    setMessage('')

    try {
      const photoUrl = await uploadImage()
      const token = localStorage.getItem('auth_token')
      const isEditing = Boolean(editingId)

      const response = await fetch(
        isEditing ? `/api/leadership?id=${editingId}` : '/api/leadership',
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            full_name: form.full_name,
            position: form.position || 'President',
            batch_year: form.batch_year ? Number(form.batch_year) : null,
            term_start: form.term_start ? Number(form.term_start) : null,
            term_end: form.term_end ? Number(form.term_end) : null,
            is_current: form.is_current,
            bio: form.bio || null,
            display_order: form.display_order ? Number(form.display_order) : 0,
            photo_url: photoUrl || null,
          }),
        }
      )

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save leadership entry')
      }

      setMessage(isEditing ? 'Leadership entry updated successfully' : 'Leadership entry added successfully')
      setForm(emptyForm)
      setSelectedFile(null)
      setEditingId(null)
      await loadMembers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save leadership entry')
    } finally {
      setSaving(false)
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this leadership entry?')) return

    const token = localStorage.getItem('auth_token')
    const response = await fetch(`/api/leadership?id=${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      setError('Failed to delete leadership entry')
      return
    }

    setMembers((current) => current.filter((member) => member.id !== id))
  }

  const handleEdit = (member: Leadership) => {
    setEditingId(member.id)
    setForm({
      full_name: member.full_name,
      position: member.position || 'President',
      batch_year: member.batch_year ? String(member.batch_year) : '',
      term_start: member.term_start ? String(member.term_start) : '',
      term_end: member.term_end ? String(member.term_end) : '',
      is_current: member.is_current,
      bio: member.bio || '',
      display_order: member.display_order != null ? String(member.display_order) : '0',
      photo_url: member.photo_url || '',
    })
    setSelectedFile(null)
    setMessage('')
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setForm(emptyForm)
    setSelectedFile(null)
    setMessage('')
    setError('')
  }

  if (loading) {
    return <div className="page-shell flex items-center justify-center px-4 py-10 text-sm text-neutral-600">Loading leadership...</div>
  }

  return (
    <div className="page-shell px-4 py-10">
      <div className="mono-container space-y-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="mono-badge">Superuser</span>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-neutral-950">Leadership Manager</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-neutral-600">
              Add past and present club presidents (or other committee roles) for the public "Leadership" page.
              Mark exactly one entry per role as current so it's featured at the top.
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
              <span className="mb-2 block text-sm font-semibold text-neutral-700">Full Name *</span>
              <input
                className="mono-input w-full"
                value={form.full_name}
                onChange={(e) => setForm((current) => ({ ...current, full_name: e.target.value }))}
                placeholder="Full name"
                required
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-neutral-700">Position</span>
              <input
                className="mono-input w-full"
                value={form.position}
                onChange={(e) => setForm((current) => ({ ...current, position: e.target.value }))}
                placeholder="President, Vice President, General Secretary..."
              />
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-neutral-700">Batch Year</span>
              <input
                type="number"
                className="mono-input w-full"
                value={form.batch_year}
                onChange={(e) => setForm((current) => ({ ...current, batch_year: e.target.value }))}
                placeholder="2021"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-neutral-700">Term Start (year)</span>
              <input
                type="number"
                className="mono-input w-full"
                value={form.term_start}
                onChange={(e) => setForm((current) => ({ ...current, term_start: e.target.value }))}
                placeholder="2023"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-neutral-700">Term End (year)</span>
              <input
                type="number"
                className="mono-input w-full"
                value={form.term_end}
                onChange={(e) => setForm((current) => ({ ...current, term_end: e.target.value }))}
                placeholder="2024 (leave blank if current)"
              />
            </label>
          </div>

          <label className="flex items-center gap-3 text-sm font-semibold text-neutral-700">
            <input
              type="checkbox"
              checked={form.is_current}
              onChange={(e) => setForm((current) => ({ ...current, is_current: e.target.checked }))}
              className="h-4 w-4 rounded border-neutral-300"
            />
            This is the current holder of this position
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-neutral-700">Short Bio (optional)</span>
            <textarea
              className="mono-input w-full"
              rows={3}
              value={form.bio}
              onChange={(e) => setForm((current) => ({ ...current, bio: e.target.value }))}
              placeholder="A short line or two about their time leading the club..."
            />
          </label>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-neutral-700">Photo</span>
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
                value={form.photo_url}
                onChange={(e) => setForm((current) => ({ ...current, photo_url: e.target.value }))}
                placeholder="https://..."
              />
            </label>
          </div>

          <label className="block max-w-xs">
            <span className="mb-2 block text-sm font-semibold text-neutral-700">Display Order</span>
            <input
              type="number"
              className="mono-input w-full"
              value={form.display_order}
              onChange={(e) => setForm((current) => ({ ...current, display_order: e.target.value }))}
            />
            <span className="mt-1 block text-xs text-neutral-500">Lower numbers appear first within the same current/past group.</span>
          </label>

          <button
            type="submit"
            disabled={saving || uploading}
            className="mono-button px-6 py-3 text-sm font-semibold disabled:opacity-50"
          >
            {saving ? 'Saving...' : editingId ? 'Update Entry' : 'Add Leadership Entry'}
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
          <h2 className="text-2xl font-black tracking-tight text-neutral-950">Existing Leadership Entries</h2>
          {members.length === 0 ? (
            <div className="mono-card p-8 text-center text-sm text-neutral-600">No leadership entries added yet.</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {members.map((member) => (
                <article key={member.id} className="rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm">
                  {member.photo_url && (
                    <img src={member.photo_url} alt={member.full_name} className="mb-4 h-48 w-full rounded-2xl object-cover" />
                  )}
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-neutral-950">{member.full_name}</h3>
                    {member.is_current && <span className="mono-badge">Current</span>}
                  </div>
                  <p className="mt-1 text-sm font-semibold text-neutral-700">{member.position}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-neutral-500">
                    {member.term_start || member.term_end
                      ? `${member.term_start ?? '—'} – ${member.term_end ?? 'Present'}`
                      : member.batch_year
                        ? `Batch ${member.batch_year}`
                        : ''}
                  </p>
                  {member.bio && <p className="mt-3 text-sm leading-6 text-neutral-600">{member.bio}</p>}
                  <div className="mt-4 flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => handleEdit(member)}
                      className="text-sm font-semibold text-neutral-900 hover:text-neutral-600"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(member.id)}
                      className="text-sm font-semibold text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
