'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Resource {
  id: number
  title: string
  description?: string
  resource_url?: string
  thumbnail_url?: string
  youtube_id?: string
  youtube_url?: string
  resource_type?: string
  folder_id?: number | null
  folder_name?: string
  created_at?: string
}

interface Folder {
  id: number
  folder_name: string
  description?: string
}

export default function StudentResourcesPage() {
  const router = useRouter()
  const [videos, setVideos] = useState<Resource[]>([])
  const [githubLinks, setGithubLinks] = useState<Resource[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [activeTab, setActiveTab] = useState<'videos' | 'github'>('videos')
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
      setError('')
      const token = localStorage.getItem('auth_token')

      const [videoRes, resourceRes] = await Promise.all([
        fetch('/api/resource-sharing?type=video', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/resource-sharing?type=resource', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (!videoRes.ok || !resourceRes.ok) {
        throw new Error('Failed to fetch resources')
      }

      const videoData = await videoRes.json()
      const resourceData = await resourceRes.json()

      const extractYouTubeId = (url: string) => {
        try {
          const u = new URL(url)
          if (u.hostname.includes('youtube.com')) {
            return u.searchParams.get('v')
          }
          if (u.hostname === 'youtu.be') {
            return u.pathname.slice(1)
          }
        } catch (e) {
          return null
        }
        return null
      }

      const getThumbnailFor = (url: string | undefined) => {
        if (!url) return null
        const id = extractYouTubeId(String(url))
        if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`
        return null
      }

      const videoItems: Resource[] = (videoData.videos || []).map((v: any) => {
        const src = v.resource_url || v.youtube_url
        const youtubeId = src ? extractYouTubeId(src) : null
        return {
          id: v.id,
          title: v.title,
          description: v.description,
          resource_url: src,
          youtube_url: src,
          youtube_id: youtubeId || undefined,
          thumbnail_url: youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : undefined,
          folder_id: v.folder_id ?? null,
          folder_name: v.folder_name,
          created_at: v.created_at,
        }
      })

      const githubItems: Resource[] = (resourceData.resources || []).filter((r: any) => {
        const url = String(r.resource_url || '').toLowerCase()
        const type = String(r.resource_type || '').toLowerCase()
        return url.includes('github.com') || type === 'github'
      }).map((r: any) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        resource_url: r.resource_url,
        resource_type: r.resource_type,
        folder_id: r.folder_id ?? null,
        folder_name: r.folder_name,
        created_at: r.created_at,
      }))

      setVideos(videoItems)
      setGithubLinks(githubItems)
    } catch (err) {
      setError('Failed to load resources')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchFolders = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/resource-folders', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) return
      const data = await response.json()
      setFolders(data.folders || [])
    } catch (err) {
      console.error('Failed to fetch folders:', err)
    }
  }

  const activeList = activeTab === 'videos' ? videos : githubLinks

  const filteredItems = useMemo(() => {
    return activeList.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(item.description || '').toLowerCase().includes(searchTerm.toLowerCase())

      const matchesFolder = selectedFolder === null || item.folder_id === selectedFolder
      return matchesSearch && matchesFolder
    })
  }, [activeList, searchTerm, selectedFolder])

  const groupedByFolder = useMemo(() => {
    const map: Record<string, Resource[]> = {}
    filteredItems.forEach((item) => {
      const key = item.folder_name || 'No Folder'
      if (!map[key]) map[key] = []
      map[key].push(item)
    })
    return map
  }, [filteredItems])

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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shared Resources</h1>
          <p className="text-gray-600 mt-2">Videos and GitHub PDF/resource links shared by admin</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        <div className="tabs-shell">
          <div className="tabs-track grid-cols-2">
            <button
              onClick={() => { setActiveTab('videos'); setSelectedFolder(null) }}
              className={`tab-button ${activeTab === 'videos' ? 'tab-button-active' : ''}`}
            >
              Videos
            </button>
            <button
              onClick={() => { setActiveTab('github'); setSelectedFolder(null) }}
              className={`tab-button ${activeTab === 'github' ? 'tab-button-active' : ''}`}
            >
              GitHub
            </button>
          </div>
        </div>

        <div className="mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={activeTab === 'videos' ? 'Search videos...' : 'Search GitHub links...'}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {folders.length > 0 && (
          <div className="mb-8">
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
                All
              </button>
              {folders.map((folder) => (
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

        {filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600">No resources found.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedByFolder).map(([folderName, items]) => (
              <div key={folderName}>
                <h4 className="text-lg font-semibold mb-4">{folderName}</h4>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((item) => (
                    <div key={`${activeTab}-${item.id}`} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition">
                      {item.thumbnail_url ? (
                        <img src={item.thumbnail_url} alt={item.title} className="w-full h-44 object-cover rounded mb-3" />
                      ) : (
                        <div className="w-full h-44 bg-gray-100 rounded mb-3 flex items-center justify-center text-gray-400">No preview</div>
                      )}
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description || 'No description'}</p>
                      <a
                        href={item.resource_url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`block w-full px-3 py-2 rounded text-center text-sm ${
                          activeTab === 'videos'
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'border border-indigo-600 text-indigo-600 hover:bg-indigo-50'
                        }`}
                      >
                        {activeTab === 'videos' ? 'Watch' : 'Open Link'}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
