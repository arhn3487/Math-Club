"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface VideoResource {
  id: number
  title: string
  description: string
  resource_url: string
  folder_id?: number
  folder_name?: string | null
  batch_year?: number | null
  thumbnail_url?: string
  added_by?: string
  created_at?: string
}

interface SharedResource extends VideoResource {
  resource_type?: string
}

interface Folder {
  id: number
  folder_name: string
}

export default function AdminResourceSharingPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'videos' | 'github' | 'add'>('videos')
  const [videos, setVideos] = useState<VideoResource[]>([])
  const [githubs, setGithubs] = useState<SharedResource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [batches, setBatches] = useState<number[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    resource_url: '',
    resource_type: 'github',
    folder_id: '',
    folder_name: '',
    batch_year: '' as string | number | null,
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const userType = localStorage.getItem('user_type')

    if (!token || userType !== 'admin') {
      router.push('/login')
      return
    }

    void fetchAll()
    void fetchBatches()
    void fetchFolders()
  }, [router])

  const fetchAll = async () => {
    try {
      setLoading(true)

      const [vRes, rRes] = await Promise.all([
        fetch('/api/admin/resource-sharing?type=video', {
          headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
        }),
        fetch('/api/admin/resource-sharing?type=resource', {
          headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
        }),
      ])

      if (!vRes.ok || !rRes.ok) {
        throw new Error('Failed to load resources')
      }

      const vjson = await vRes.json()
      const rjson = await rRes.json()

      const extractYouTubeId = (url: string) => {
        try {
          const parsedUrl = new URL(url)
          if (parsedUrl.hostname.includes('youtube.com')) return parsedUrl.searchParams.get('v')
          if (parsedUrl.hostname === 'youtu.be') return parsedUrl.pathname.slice(1)
        } catch {
          return null
        }
        return null
      }

      const mappedVideos: VideoResource[] = (vjson.videos || []).map((item: any) => {
        const youtubeId = item.resource_url ? extractYouTubeId(item.resource_url) : null
        return {
          ...item,
          folder_name: item.resource_folders?.folder_name || null,
          batch_year: item.video_resource_batches?.[0]?.batch_year ?? null,
          thumbnail_url: youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : undefined,
        }
      })

      const mappedGithubs: SharedResource[] = (rjson.resources || [])
        .filter((item: any) => {
          if (!item.resource_url) return false
          return String(item.resource_url).toLowerCase().includes('github.com') || String(item.resource_type || '').toLowerCase() === 'github'
        })
        .map((item: any) => ({
          ...item,
          folder_name: item.resource_folders?.folder_name || null,
          batch_year: item.shared_resource_batches?.[0]?.batch_year ?? null,
        }))

      setVideos(mappedVideos)
      setGithubs(mappedGithubs)
    } catch (err) {
      setError('Failed to load resources')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchBatches = async () => {
    try {
      const res = await fetch('/api/batches')
      if (!res.ok) return

      const data = await res.json()
      const list = Array.isArray(data.batches) ? data.batches : data
      const years = list.map((item: any) => item.batch_year || item.year).filter(Boolean)
      const numericYears = years.map((year: any) => Number(year)).filter((year: number) => !Number.isNaN(year))
      setBatches(Array.from(new Set<number>(numericYears)).sort((a, b) => b - a))
    } catch (err) {
      console.error('Failed to fetch batches', err)
    }
  }

  const fetchFolders = async () => {
    try {
      const res = await fetch('/api/resource-folders', {
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
      })
      if (!res.ok) return

      const data = await res.json()
      setFolders(data.folders || [])
    } catch (err) {
      console.error('Failed to fetch folders', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.title.trim() || !formData.resource_url.trim()) {
      setError('Title and URL are required')
      return
    }

    try {
      setSubmitting(true)

      const payload = {
        title: formData.title,
        description: formData.description,
        resource_type: formData.resource_type,
        resource_url: formData.resource_url,
        folder_id: formData.folder_id ? Number(formData.folder_id) : null,
        folder_name: formData.folder_name || undefined,
        batch_year: formData.batch_year ? Number(formData.batch_year) : null,
      }

      const res = await fetch('/api/admin/resource-sharing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Failed to create resource')
      }

      setFormData({
        title: '',
        description: '',
        resource_url: '',
        resource_type: 'github',
        folder_id: '',
        folder_name: '',
        batch_year: '',
      })
      setActiveTab('videos')
      await fetchAll()
      await fetchFolders()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create resource')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number, type: 'video' | 'resource') => {
    try {
      const res = await fetch('/api/admin/resource-sharing', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ id, type }),
      })

      if (!res.ok) throw new Error('Failed to delete')
      await fetchAll()
    } catch (err) {
      setError('Failed to delete resource')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600"></div>
          <p className="text-gray-600">Loading resources...</p>
        </div>
      </div>
    )
  }

  const isViewingResources = activeTab === 'videos' || activeTab === 'github'
  const currentList = activeTab === 'videos' ? videos : githubs
  const filteredList = isViewingResources && selectedFolder !== null
    ? currentList.filter((item) => item.folder_id === selectedFolder)
    : currentList

  const grouped: Record<string, typeof currentList> = {}
  filteredList.forEach((item) => {
    const key = item.folder_name || 'No Folder'
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(item)
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {error && <div className="mb-4 rounded border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}

        <div className="tabs-shell">
          <div className="tabs-track grid-cols-3">
            <button
              onClick={() => setActiveTab('videos')}
              className={`tab-button ${activeTab === 'videos' ? 'tab-button-active' : ''}`}
            >
              Videos
            </button>
            <button
              onClick={() => setActiveTab('github')}
              className={`tab-button ${activeTab === 'github' ? 'tab-button-active' : ''}`}
            >
              GitHub
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`tab-button ${activeTab === 'add' ? 'tab-button-active' : ''}`}
            >
              Add Resource
            </button>
          </div>
        </div>

        {activeTab === 'add' && (
          <div className="mb-6 rounded-lg bg-white p-6 shadow">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Title *</label>
                <input
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full rounded border px-4 py-2"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full rounded border px-4 py-2"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Type</label>
                <div className="tabs-shell mb-0">
                  <div className="tabs-track grid-cols-2">
                    <label className={`tab-button text-center ${formData.resource_type === 'video' ? 'tab-button-active' : ''}`}>
                    <input
                      type="radio"
                      name="type"
                      value="video"
                      checked={formData.resource_type === 'video'}
                      onChange={() => setFormData((prev) => ({ ...prev, resource_type: 'video' }))}
                      className="hidden"
                    />
                    Video (YouTube)
                    </label>
                    <label className={`tab-button text-center ${formData.resource_type === 'github' ? 'tab-button-active' : ''}`}>
                    <input
                      type="radio"
                      name="type"
                      value="github"
                      checked={formData.resource_type === 'github'}
                      onChange={() => setFormData((prev) => ({ ...prev, resource_type: 'github' }))}
                      className="hidden"
                    />
                    GitHub Link
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">URL *</label>
                <input
                  value={formData.resource_url}
                  onChange={(e) => setFormData((prev) => ({ ...prev, resource_url: e.target.value }))}
                  className="w-full rounded border px-4 py-2"
                  placeholder="https://github.com/your/repo or https://youtube.com/..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Choose Existing Folder (optional)</label>
                <select
                  value={formData.folder_id}
                  onChange={(e) => setFormData((prev) => ({ ...prev, folder_id: e.target.value }))}
                  className="w-full rounded border px-4 py-2"
                >
                  <option value="">No Folder</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.folder_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Folder (optional)</label>
                <input
                  value={formData.folder_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, folder_name: e.target.value }))}
                  className="w-full rounded border px-4 py-2"
                  placeholder="Create or choose a folder"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Batch Year (optional)</label>
                <select
                  value={formData.batch_year ?? ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, batch_year: e.target.value }))}
                  className="w-full rounded border px-4 py-2"
                >
                  <option value="">All Batches</option>
                  {batches.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setActiveTab('videos')} className="flex-1 rounded border px-4 py-2">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 rounded bg-indigo-600 px-4 py-2 text-white">
                  {submitting ? 'Adding...' : 'Add Resource'}
                </button>
              </div>
            </form>
          </div>
        )}

        {isViewingResources && folders.length > 0 && (
          <div className="mb-6">
            <label className="mb-2 block text-sm font-semibold text-gray-700">Filter by Folder</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedFolder(null)}
                className={`rounded px-4 py-2 text-sm font-semibold transition ${selectedFolder === null ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
              >
                All
              </button>
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder.id)}
                  className={`rounded px-4 py-2 text-sm font-semibold transition ${selectedFolder === folder.id ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                >
                  {folder.folder_name}
                </button>
              ))}
            </div>
          </div>
        )}

        {isViewingResources && (
          <div className="space-y-8">
            {Object.entries(grouped).map(([folderName, items]) => (
              <div key={folderName}>
                <h4 className="mb-4 text-lg font-semibold">{folderName}</h4>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => (
                    <div key={item.id} className="rounded-lg bg-white p-4 shadow">
                      {item.thumbnail_url ? (
                        <img src={item.thumbnail_url} alt={item.title} className="mb-3 h-40 w-full rounded object-cover" />
                      ) : (
                        <div className="mb-3 flex h-40 w-full items-center justify-center rounded bg-gray-100 text-gray-400">
                          No preview
                        </div>
                      )}
                      <div className="mb-2 text-sm text-gray-500">{item.folder_name || 'No Folder'}</div>
                      <h3 className="mb-2 font-bold text-gray-900">{item.title}</h3>
                      <p className="mb-3 text-sm text-gray-600">{item.description}</p>
                      <div className="mb-3 text-sm text-gray-600">Batch: {item.batch_year || 'All'}</div>
                      <div className="flex gap-2">
                        <a
                          href={item.resource_url}
                          target="_blank"
                          rel="noreferrer"
                          className={`flex-1 rounded px-3 py-2 text-center ${activeTab === 'videos' ? 'bg-red-600 text-white' : 'border border-indigo-600 bg-white text-indigo-600'}`}
                        >
                          Open
                        </a>
                        <button
                          onClick={() => handleDelete(item.id, activeTab === 'videos' ? 'video' : 'resource')}
                          className="flex-1 rounded border border-red-600 px-3 py-2 text-red-600"
                        >
                          Delete
                        </button>
                      </div>
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
