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
  created_at: string
}

export default function StudentNoticesPage() {
  const router = useRouter()
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'event' | 'announcement' | 'general'>('all')

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const userType = localStorage.getItem('user_type')

    if (!token || userType !== 'student') {
      router.push('/login')
      return
    }

    fetchNotices()
  }, [router])

  const fetchNotices = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/notices', {
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'event':
        return '📅'
      case 'announcement':
        return '📢'
      case 'general':
        return '📝'
      default:
        return '📝'
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

  const filteredNotices = notices.filter((notice) =>
    filterType === 'all' ? true : notice.notice_type === filterType
  )

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
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Notices & Announcements</h1>
          <p className="text-gray-600 mt-2">Stay updated with latest news and events</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="tabs-shell">
          <div className="tabs-track grid-cols-2 md:grid-cols-4">
          {['all', 'event', 'announcement', 'general'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type as any)}
              className={`tab-button ${filterType === type ? 'tab-button-active' : ''}`}
            >
              {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
          </div>
        </div>

        {/* Notices List */}
        <div className="space-y-4">
          {filteredNotices.length > 0 ? (
            filteredNotices.map((notice) => (
              <div key={notice.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
                <div className="flex gap-4">
                  <div className="text-4xl">{getTypeIcon(notice.notice_type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{notice.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getTypeColor(notice.notice_type)}`}>
                        {notice.notice_type}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4 whitespace-pre-wrap">{notice.description}</p>

                    <div className="flex gap-4 text-sm text-gray-600 border-t pt-3 mt-3">
                      <div>
                        <span className="font-medium">Posted:</span> {new Date(notice.created_at).toLocaleDateString()} at{' '}
                        {new Date(notice.created_at).toLocaleTimeString()}
                      </div>
                      {notice.event_date && (
                        <div>
                          <span className="font-medium">Event Date:</span> {new Date(notice.event_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-600">
                {filterType === 'all'
                  ? 'No notices at the moment.'
                  : `No ${filterType} notices found.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
