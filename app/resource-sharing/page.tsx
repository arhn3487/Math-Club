'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Resource {
  id: number
  title: string
  description: string
  file_name?: string
  file_url?: string
  resource_url?: string
  file_type?: string
  youtube_url?: string
  folder_id?: number
  created_at: string
  folder_name?: string
}

interface Folder {
  id: number
  folder_name: string
  description: string
}

export default function StudentResourcesPage() {
  const router = useRouter()
  const [resources, setResources] = useState<Resource[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'videos' | 'files' | 'folders'>('videos')
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const userType = localStorage.getItem('user_type')

    if (!token || userType !== 'student') {
      router.push('/login')
      return
    }

    fetchResources()
    fetchFolders()
  }, [router])

  const fetchResources = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/resource-sharing', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch resources')
      }

      const data = await response.json()
      const allResources = [
        ...(data.videos || []),
        ...(data.resources || []),
      ]
      setResources(allResources)
    } catch (err) {
      setError('Failed to load resources')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchFolders = async () => {
    try {
      const response = await fetch('/api/resource-folders', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setFolders(data.folders || [])
      }
    } catch (err) {
      console.error('Failed to fetch folders:', err)
    }
  }

  const extractYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const getResourceIcon = (resource: Resource) => {
    if (resource.resource_url) return '🔗'
    if (resource.youtube_url) return '📹'
    if (resource.file_type === 'pdf') return '📄'
    if (resource.file_type === 'doc') return '📑'
    if (resource.file_type === 'image') return '🖼️'
    return '📦'
  }

  let filteredResources = resources.filter(r =>
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (activeTab === 'videos') {
    filteredResources = filteredResources.filter(r => r.resource_url || r.youtube_url)
  } else if (activeTab === 'files') {
    filteredResources = filteredResources.filter(r => r.file_url && !r.youtube_url && !r.resource_url)
    if (selectedFolder) {
      filteredResources = filteredResources.filter(r => r.folder_id === selectedFolder)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading resources...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-3">
            <img 
              src="https://zxkeolkojkoenkszekiy.supabase.co/storage/v1/object/public/math-club-images/Math%20Club%20Logo/math%20club%20logo.png" 
              alt="Math Club Logo" 
              className="h-10 w-auto object-contain"
            />
            <span className="text-2xl font-bold text-indigo-600">Math Club</span>
          </Link>
          <div className="flex gap-4 items-center">
            <Link href="/class-recordings" className="text-gray-600 hover:text-gray-900">
              Class Resources
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
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shared Resources</h1>
          <p className="text-gray-600 mt-2">Access study materials, videos, and files shared by your instructors</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex gap-4 border-b border-gray-300">
          <button
            onClick={() => { setActiveTab('videos'); setSelectedFolder(null) }}
            className={`px-4 py-3 font-semibold transition ${
              activeTab === 'videos'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📹 Videos
          </button>
          <button
            onClick={() => { setActiveTab('files'); setSelectedFolder(null) }}
            className={`px-4 py-3 font-semibold transition ${
              activeTab === 'files'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📄 Study Materials
          </button>
          <button
            onClick={() => { setActiveTab('folders'); setSelectedFolder(null) }}
            className={`px-4 py-3 font-semibold transition ${
              activeTab === 'folders'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📁 Folders
          </button>
        </div>

        {/* Search Bar */}
        {(activeTab === 'videos' || activeTab === 'files') && (
          <div className="mb-8">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search resources..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}

        {/* Folders Tab */}
        {activeTab === 'folders' && (
          <div>
            {folders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-600">No folders available yet</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {folders.map(folder => (
                  <div key={folder.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                    <div className="text-4xl mb-3">📁</div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{folder.folder_name}</h3>
                    <p className="text-gray-600 text-sm">{folder.description || 'No description'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <div>
            {filteredResources.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-600">No videos available yet</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map(resource => {
                  const videoId = resource.youtube_url ? extractYouTubeId(resource.youtube_url) : null
                  return (
                    <div key={`${resource.id}-video`} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition">
                      {videoId && (
                        <a
                          href={resource.youtube_url || resource.resource_url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block relative pb-[56.25%] h-0 overflow-hidden bg-gray-200"
                        >
                          <img
                            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                            alt={resource.title}
                            className="absolute top-0 left-0 w-full h-full object-cover"
                          />
                        </a>
                      )}
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{resource.title}</h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{resource.description}</p>
                        <div className="flex gap-2 pt-4">
                          <a
                            href={resource.youtube_url || resource.resource_url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 px-3 py-2 bg-indigo-600 text-white text-sm rounded text-center hover:bg-indigo-700"
                          >
                            Watch
                          </a>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Files Tab */}
        {activeTab === 'files' && (
          <div>
            {folders.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Filter by Folder</label>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setSelectedFolder(null)}
                    className={`px-4 py-2 rounded text-sm font-semibold transition ${
                      selectedFolder === null
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    All Files
                  </button>
                  {folders.map(folder => (
                    <button
                      key={folder.id}
                      onClick={() => setSelectedFolder(folder.id)}
                      className={`px-4 py-2 rounded text-sm font-semibold transition ${
                        selectedFolder === folder.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      }`}
                    >
                      {folder.folder_name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {filteredResources.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-600">No files available yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredResources.map(resource => (
                  <div key={`${resource.id}-file`} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{getResourceIcon(resource)}</span>
                          <div>
                            <h3 className="font-bold text-gray-900">{resource.title}</h3>
                            <p className="text-gray-600 text-sm">{resource.file_type?.toUpperCase() || 'File'}</p>
                          </div>
                        </div>
                        {resource.description && (
                          <p className="text-gray-600 text-sm ml-11">{resource.description}</p>
                        )}
                      </div>
                      <a
                        href={resource.file_url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 whitespace-nowrap ml-4"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
