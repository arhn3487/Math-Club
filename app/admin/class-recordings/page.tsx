'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ClassRecording {
  id: number
  title: string
  description: string
  youtube_url: string
  batch_year: number | null
  uploaded_by: string
  is_active: boolean
  created_at: string
}

export default function AdminClassRecordingsPage() {
  const router = useRouter()
  const [recordings, setRecordings] = useState<ClassRecording[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [batches, setBatches] = useState<number[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtube_url: '',
    batch_year: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const userType = localStorage.getItem('user_type')

    if (!token || userType !== 'admin') {
      router.push('/login')
      return
    }

    fetchRecordings()
  }, [router])

  const fetchRecordings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/class-recordings', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch recordings')
      }

      const data = await response.json()
      setRecordings(data.recordings)

      // Extract unique batch years
      const uniqueBatches = Array.from(
        new Set(data.recordings.map((r: ClassRecording) => r.batch_year).filter(Boolean))
      ) as number[]
      setBatches(uniqueBatches.sort((a, b) => b - a))
    } catch (err) {
      setError('Failed to load recordings')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const extractYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.title.trim() || !formData.youtube_url.trim()) {
      setError('Title and YouTube URL are required')
      return
    }

    if (!extractYouTubeId(formData.youtube_url)) {
      setError('Invalid YouTube URL')
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch('/api/admin/class-recordings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          ...formData,
          batch_year: formData.batch_year ? parseInt(formData.batch_year) : null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to create recording')
      }

      setFormData({
        title: '',
        description: '',
        youtube_url: '',
        batch_year: '',
      })
      setShowForm(false)
      fetchRecordings()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create recording')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (recordingId: number) => {
    try {
      const response = await fetch(`/api/admin/class-recordings/${recordingId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete recording')
      }

      setRecordings(recordings.filter((r) => r.id !== recordingId))
      setDeleteConfirm(null)
    } catch (err) {
      setError('Failed to delete recording')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading recordings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard">
            <div className="text-2xl font-bold text-indigo-600 cursor-pointer">Math Club</div>
          </Link>
          <button
            onClick={() => {
              localStorage.removeItem('auth_token')
              localStorage.removeItem('user_type')
              localStorage.removeItem('user_id')
              router.push('/')
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Class Recordings</h1>
            <p className="text-gray-600 mt-2">Manage video recordings for students</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            {showForm ? 'Cancel' : '+ Add Recording'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        {/* Add Recording Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow mb-8 p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Add Class Recording</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Session 1: Introduction to Algorithms"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the class..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">YouTube URL *</label>
                <input
                  type="url"
                  value={formData.youtube_url}
                  onChange={(e) => setFormData((prev) => ({ ...prev, youtube_url: e.target.value }))}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Batch Year (Optional)</label>
                <select
                  value={formData.batch_year}
                  onChange={(e) => setFormData((prev) => ({ ...prev, batch_year: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Batches</option>
                  {batches.map((batch) => (
                    <option key={batch} value={batch}>
                      {batch}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add Recording'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Recordings Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recordings.length > 0 ? (
            recordings.map((recording) => {
              const videoId = extractYouTubeId(recording.youtube_url)
              return (
                <div key={recording.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition">
                  {/* Thumbnail */}
                  {videoId && (
                    <div className="relative pb-[56.25%] h-0 overflow-hidden bg-gray-200">
                      <img
                        src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                        alt={recording.title}
                        className="absolute top-0 left-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition flex items-center justify-center cursor-pointer">
                        <div className="text-white text-4xl">▶</div>
                      </div>
                    </div>
                  )}

                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{recording.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{recording.description}</p>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div>
                        <span className="font-medium">Batch:</span> {recording.batch_year || 'All Batches'}
                      </div>
                      <div>
                        <span className="font-medium">Added:</span> {new Date(recording.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <a
                        href={recording.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 text-center"
                      >
                        Watch
                      </a>
                      <button
                        onClick={() => setDeleteConfirm(recording.id)}
                        className="flex-1 px-3 py-2 text-red-600 border border-red-600 text-sm rounded hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="col-span-full bg-white rounded-lg shadow p-12 text-center">
              <div className="text-6xl mb-4">🎥</div>
              <p className="text-gray-600 mb-4">No recordings added yet.</p>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Add First Recording
              </button>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Recording?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this recording? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
