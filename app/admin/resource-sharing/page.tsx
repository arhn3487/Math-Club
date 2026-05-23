"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface VideoResource {
  id: number
  title: string
  description: string
  resource_url: string
  folder_id?: number
  batch_year?: number | null
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
  const [activeTab, setActiveTab] = useState<'videos' | 'github'>('videos')
  const [videos, setVideos] = useState<VideoResource[]>([])
  const [githubs, setGithubs] = useState<SharedResource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
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
    fetchAll()
    fetchBatches()
    fetchFolders()
  }, [router])

  const fetchAll = async () => {
    try {
      setLoading(true)
      const [vRes, rRes] = await Promise.all([
        fetch('/api/admin/resource-sharing?type=video', { headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` } }),
        fetch('/api/admin/resource-sharing?type=resource', { headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` } }),
      ])

      if (!vRes.ok || !rRes.ok) throw new Error('Failed to load resources')

      const vjson = await vRes.json()
      const rjson = await rRes.json()
      const extractYouTubeId = (url: string) => {
        try {
          const u = new URL(url)
          if (u.hostname.includes('youtube.com')) return u.searchParams.get('v')
          if (u.hostname === 'youtu.be') return u.pathname.slice(1)
        } catch (e) {
          return null
        }
        return null
      }

      const mapVideos = (arr: any[]) => (arr || []).map((v: any) => {
        const src = v.resource_url
        const yid = src ? extractYouTubeId(src) : null
        return {
          ...v,
          folder_name: v.resource_folders?.folder_name || null,
          batch_year: (v.video_resource_batches && v.video_resource_batches[0]) ? v.video_resource_batches[0].batch_year : null,
          thumbnail_url: yid ? `https://img.youtube.com/vi/${yid}/hqdefault.jpg` : undefined,
        }
      })

      setVideos(mapVideos(vjson.videos || []))
      // Filter shared resources to GitHub links only for the "GitHub" tab
      const mapShared = (arr: any[]) => (arr || []).map((s: any) => ({
        ...s,
        folder_name: s.resource_folders?.folder_name || null,
        batch_year: (s.shared_resource_batches && s.shared_resource_batches[0]) ? s.shared_resource_batches[0].batch_year : null,
      }))

      const shared: SharedResource[] = (rjson.resources || []).filter((s: any) => {
        if (!s.resource_url) return false
        return String(s.resource_url).toLowerCase().includes('github.com') || String(s.resource_type || '').toLowerCase() === 'github'
      })
      setGithubs(mapShared(shared))
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
      const years = list.map((b: any) => b.batch_year || b.batch_year || b.year || b.id).filter(Boolean)
      setBatches(Array.from(new Set(years)).sort((a: number, b: number) => b - a))
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
      const body = {
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
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.message || 'Failed to create resource')
      }

      setFormData({ title: '', description: '', resource_url: '', resource_type: 'github', folder_id: '', folder_name: '', batch_year: '' })
      setShowForm(false)
      fetchAll()
      fetchFolders()
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
      fetchAll()
    } catch (err) {
      setError('Failed to delete resource')
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading resources...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-3">
            <img src="https://zxkeolkojkoenkszekiy.supabase.co/storage/v1/object/public/math-club-images/Math%20Club%20Logo/math%20club%20logo.png" alt="Logo" className="h-10 object-contain" />
            <span className="text-2xl font-bold text-indigo-600">Math Club</span>
          </Link>
          <div className="flex gap-4 items-center">
            <button onClick={() => { localStorage.removeItem('auth_token'); localStorage.removeItem('user_type'); localStorage.removeItem('user_id'); router.push('/') }} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shared Resources - Admin</h1>
            <p className="text-gray-600 mt-1">Upload and manage video & GitHub link resources</p>
          </div>
          <div>
            <button onClick={() => setShowForm(!showForm)} className="px-5 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">{showForm ? 'Cancel' : '+ Add Resource'}</button>
          </div>
        </div>

        {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">{error}</div>}

        {showForm && (
          <div className="bg-white rounded-lg shadow mb-6 p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input value={formData.title} onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))} className="w-full px-4 py-2 border rounded" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} rows={3} className="w-full px-4 py-2 border rounded" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <div className="flex gap-3">
                  <label className={`px-3 py-2 rounded border ${formData.resource_type === 'video' ? 'bg-indigo-600 text-white' : 'bg-white'}`}>
                    <input type="radio" name="type" value="video" checked={formData.resource_type === 'video'} onChange={() => setFormData((p) => ({ ...p, resource_type: 'video' }))} className="hidden" />
                    Video (YouTube)
                  </label>
                  <label className={`px-3 py-2 rounded border ${formData.resource_type === 'github' ? 'bg-indigo-600 text-white' : 'bg-white'}`}>
                    <input type="radio" name="type" value="github" checked={formData.resource_type === 'github'} onChange={() => setFormData((p) => ({ ...p, resource_type: 'github' }))} className="hidden" />
                    GitHub Link
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL *</label>
                <input value={formData.resource_url} onChange={(e) => setFormData((p) => ({ ...p, resource_url: e.target.value }))} className="w-full px-4 py-2 border rounded" placeholder="https://github.com/your/repo or https://youtube.com/..." />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Choose Existing Folder (optional)</label>
                <select value={formData.folder_id} onChange={(e) => setFormData((p) => ({ ...p, folder_id: e.target.value }))} className="w-full px-4 py-2 border rounded">
                  <option value="">No Folder</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>{folder.folder_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Folder (optional)</label>
                <input value={formData.folder_name} onChange={(e) => setFormData((p) => ({ ...p, folder_name: e.target.value }))} className="w-full px-4 py-2 border rounded" placeholder="Create or choose a folder" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Batch Year (optional)</label>
                <select value={formData.batch_year ?? ''} onChange={(e) => setFormData((p) => ({ ...p, batch_year: e.target.value }))} className="px-4 py-2 border rounded w-full">
                  <option value="">All Batches</option>
                  {batches.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 border rounded">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded">{submitting ? 'Adding...' : 'Add Resource'}</button>
              </div>
            </form>
          </div>
        )}

        <div className="mb-6 border-b border-gray-200">
          <button onClick={() => setActiveTab('videos')} className={`px-4 py-3 ${activeTab === 'videos' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600'}`}>📹 Videos</button>
          <button onClick={() => setActiveTab('github')} className={`px-4 py-3 ${activeTab === 'github' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600'}`}>🔗 GitHub Links</button>
        </div>

        {folders.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Folder</label>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setSelectedFolder(null)} className={`px-4 py-2 rounded text-sm font-semibold transition ${selectedFolder === null ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>All</button>
              {folders.map((folder) => (
                <button key={folder.id} onClick={() => setSelectedFolder(folder.id)} className={`px-4 py-2 rounded text-sm font-semibold transition ${selectedFolder === folder.id ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>
                  {folder.folder_name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-8">
          {(() => {
            const list = activeTab === 'videos' ? videos : githubs
            const filtered = selectedFolder === null ? list : list.filter((it) => it.folder_id === selectedFolder)
            const grouped: Record<string, typeof list> = {}
            filtered.forEach((it) => {
              const key = it.folder_name || 'No Folder'
              if (!grouped[key]) grouped[key] = []
              grouped[key].push(it)
            })
            return Object.entries(grouped).map(([folderName, items]) => (
              <div key={folderName}>
                <h4 className="text-lg font-semibold mb-4">{folderName}</h4>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((it) => (
                    <div key={it.id} className="bg-white rounded-lg shadow p-4">
                      {'thumbnail_url' in it && it.thumbnail_url ? (
                        <img src={(it as any).thumbnail_url} alt={(it as any).title} className="w-full h-40 object-cover rounded mb-3" />
                      ) : (
                        <div className="w-full h-40 bg-gray-100 rounded mb-3 flex items-center justify-center text-gray-400">No preview</div>
                      )}
                      <div className="mb-2 text-sm text-gray-500">{(it as any).folder_name || 'No Folder'}</div>
                      <h3 className="font-bold text-gray-900 mb-2">{(it as any).title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{(it as any).description}</p>
                      <div className="text-sm text-gray-600 mb-3">Batch: {(it as any).batch_year || 'All'}</div>
                      <div className="flex gap-2">
                        <a href={(it as any).resource_url} target="_blank" rel="noreferrer" className={`flex-1 px-3 py-2 ${(activeTab === 'videos') ? 'bg-red-600 text-white' : 'bg-white text-indigo-600 border border-indigo-600'} rounded text-center`}>Open</a>
                        <button onClick={() => handleDelete(it.id, activeTab === 'videos' ? 'video' : 'resource')} className="flex-1 px-3 py-2 border border-red-600 text-red-600 rounded">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          })()}
        </div>
      </div>
    </div>
  )
}
