'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ClassRecording {
  id: number
  title: string
  description: string
  youtube_url: string
  batch_year: number | null
  created_at: string
}

export default function StudentClassRecordingsPage() {
  const router = useRouter()
  const [recordings, setRecordings] = useState<ClassRecording[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const userType = localStorage.getItem('user_type')

    if (!token || userType !== 'student') {
      router.push('/login')
      return
    }

    fetchRecordings()
  }, [router])

  const fetchRecordings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/class-recordings', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch recordings')
      }

      const data = await response.json()
      setRecordings(data.recordings)
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

  const filteredRecordings = recordings.filter((recording) =>
    recording.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recording.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Class Recordings</h1>
          <p className="text-gray-600 mt-2">Watch recorded class sessions and tutorials</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search recordings..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Recordings Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecordings.length > 0 ? (
            filteredRecordings.map((recording) => {
              const videoId = extractYouTubeId(recording.youtube_url)
              return (
                <div key={recording.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition">
                  {/* Thumbnail */}
                  {videoId && (
                    <a
                      href={recording.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block relative pb-[56.25%] h-0 overflow-hidden bg-gray-200 hover:opacity-80 transition"
                    >
                      <img
                        src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                        alt={recording.title}
                        className="absolute top-0 left-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition flex items-center justify-center">
                        <div className="text-white text-5xl">▶</div>
                      </div>
                    </a>
                  )}

                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{recording.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{recording.description}</p>

                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>{new Date(recording.created_at).toLocaleDateString()}</span>
                      <a
                        href={recording.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-600 hover:text-red-700 font-medium"
                      >
                        Watch on YouTube →
                      </a>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="col-span-full bg-white rounded-lg shadow p-12 text-center">
              <div className="text-6xl mb-4">🎥</div>
              <p className="text-gray-600">
                {searchTerm ? 'No recordings found matching your search.' : 'No recordings available yet.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
