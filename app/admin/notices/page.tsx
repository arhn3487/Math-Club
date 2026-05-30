'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Notice {
  id: number
  title: string
  description: string
  notice_type: 'event' | 'announcement' | 'general'
  event_date: string | null
  created_by: string
  is_active: boolean
  created_at: string
}

export default function AdminNoticesPage() {
  const router = useRouter()
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    notice_type: 'general' as 'event' | 'announcement' | 'general',
    event_date: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const userType = localStorage.getItem('user_type')

    if (!token || (userType !== 'admin' && userType !== 'superuser')) {
      router.push('/login')
      return
    }

    fetchNotices()
  }, [router])

  const fetchNotices = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/notices', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch notices')
      }

      const data = await response.json()
      setNotices(data.notices)
    } catch (err) {
      setError('Failed to load notices')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Title and description are required')
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch('/api/admin/notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          ...formData,
          event_date: formData.event_date || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to create notice')
      }

      setFormData({
        title: '',
        description: '',
        notice_type: 'general',
        event_date: '',
      })
      setShowForm(false)
      fetchNotices()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create notice')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (noticeId: number) => {
    try {
      const response = await fetch(`/api/admin/notices/${noticeId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete notice')
      }

      setNotices(notices.filter((n) => n.id !== noticeId))
      setDeleteConfirm(null)
    } catch (err) {
      setError('Failed to delete notice')
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'event':
        return 'bg-blue-100 text-blue-800'
      case 'announcement':
        return 'bg-purple-100 text-purple-800'
      case 'general':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notices...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notices & Announcements</h1>
            <p className="text-gray-600 mt-2">Create and manage notices for the community</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            {showForm ? 'Cancel' : '+ New Notice'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        {/* Create Notice Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow mb-8 p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Create New Notice</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Upcoming Competition"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed description..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notice Type *</label>
                  <select
                    value={formData.notice_type}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        notice_type: e.target.value as 'event' | 'announcement' | 'general',
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="general">General</option>
                    <option value="announcement">Announcement</option>
                    <option value="event">Event</option>
                  </select>
                </div>

                {formData.notice_type === 'event' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Event Date</label>
                    <input
                      type="date"
                      value={formData.event_date}
                      onChange={(e) => setFormData((prev) => ({ ...prev, event_date: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}
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
                  {submitting ? 'Creating...' : 'Create Notice'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Notices List */}
        <div className="space-y-4">
          {notices.length > 0 ? (
            notices.map((notice) => (
              <div key={notice.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{notice.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getTypeColor(notice.notice_type)}`}>
                        {notice.notice_type}
                      </span>
                    </div>
                    <p className="text-gray-600">{notice.description}</p>
                  </div>
                  <button
                    onClick={() => setDeleteConfirm(notice.id)}
                    className="text-red-600 hover:text-red-900 font-medium text-sm ml-4"
                  >
                    Delete
                  </button>
                </div>

                <div className="flex gap-4 text-sm text-gray-600 border-t pt-3 mt-3">
                  <div>
                    <span className="font-medium">Posted by:</span> {notice.created_by}
                  </div>
                  <div>
                    <span className="font-medium">Date:</span> {new Date(notice.created_at).toLocaleDateString()}
                  </div>
                  {notice.event_date && (
                    <div>
                      <span className="font-medium">Event Date:</span> {new Date(notice.event_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-6xl mb-4">📢</div>
              <p className="text-gray-600 mb-4">No notices created yet.</p>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Create First Notice
              </button>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Notice?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this notice? This action cannot be undone.
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
