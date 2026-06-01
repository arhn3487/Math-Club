"use client"

import { useEffect, useRef, useState } from 'react'
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

function LazyPdfPreview({ url, title }: { url: string; title: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [shouldLoad, setShouldLoad] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!shouldLoad || !canvasRef.current) return

    const loadPdfJsAndRender = async () => {
      // Load pdfjs from CDN if not already present
      if (!(window as any).pdfjsLib) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement('script')
          s.src = 'https://unpkg.com/pdfjs-dist@3.7.107/build/pdf.min.js'
          s.onload = () => resolve()
          s.onerror = () => reject(new Error('Failed to load pdfjs'))
          document.head.appendChild(s)
        })
      }

      const pdfjsLib = (window as any).pdfjsLib
      try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.7.107/build/pdf.worker.min.js'
        // Try to fetch the PDF as an ArrayBuffer first (better CORS handling),
        // then fall back to loading by URL.
        let pdf
        try {
          const resp = await fetch(url, { mode: 'cors' })
          if (!resp.ok) throw new Error('Fetch failed')
          const data = await resp.arrayBuffer()
          const loadingTask = pdfjsLib.getDocument({ data })
          pdf = await loadingTask.promise
        } catch (fetchErr) {
          const loadingTask = pdfjsLib.getDocument({ url, withCredentials: false })
          pdf = await loadingTask.promise
        }
        
        const page = await pdf.getPage(1)
        const viewport = page.getViewport({ scale: 1.8 })
        const sourceCanvas = document.createElement('canvas')
        sourceCanvas.width = viewport.width
        sourceCanvas.height = viewport.height
        const sourceCtx = sourceCanvas.getContext('2d')!
        await page.render({ canvasContext: sourceCtx, viewport }).promise

        const canvas = canvasRef.current!
        canvas.width = viewport.width
        canvas.height = viewport.height * 0.42
        const ctx = canvas.getContext('2d')!
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(
          sourceCanvas,
          0,
          0,
          sourceCanvas.width,
          sourceCanvas.height * 0.42,
          0,
          0,
          canvas.width,
          canvas.height
        )
        setLoaded(true)
      } catch (err) {
        console.error('PDF render failed', err)
      }
    }

    void loadPdfJsAndRender()
  }, [shouldLoad, url])

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true)
          observer.disconnect()
        }
      },
      { rootMargin: '220px' }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="relative mb-3 h-40 w-full overflow-hidden rounded bg-gray-100">
      {!shouldLoad && <div className="h-full w-full animate-pulse bg-gray-200" />}
      {shouldLoad && (
        <>
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-xs text-gray-500">
              Loading preview...
            </div>
          )}
          <canvas ref={canvasRef} className="h-full w-full object-cover" />
        </>
      )}
    </div>
  )
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

    if (!token || (userType !== 'admin' && userType !== 'superuser')) {
      router.push('/login')
      return
    }

    void fetchAll()
    void fetchBatches()
    void fetchFolders()
  }, [router])

  const getGithubPreview = (url: string) => {
    try {
      const parsed = new URL(url)
      if (!parsed.hostname.includes('github.com')) return undefined

      const parts = parsed.pathname.split('/').filter(Boolean)
      if (parts.length < 2) return undefined

      const owner = parts[0]
      const repo = parts[1]
      return `https://opengraph.githubassets.com/1/${owner}/${repo}`
    } catch {
      return undefined
    }
  }

  const getDownloadUrl = (url: string) => {
    try {
      const parsed = new URL(url)

      if (parsed.hostname.includes('github.com') && parsed.pathname.includes('/blob/')) {
        return url.replace('/blob/', '/raw/')
      }

      if (parsed.hostname.includes('raw.githubusercontent.com')) {
        parsed.searchParams.set('download', '1')
        return parsed.toString()
      }

      return url
    } catch {
      return url
    }
  }

  const isLikelyPdfUrl = (url: string) => {
    try {
      const parsed = new URL(url)
      return parsed.pathname.toLowerCase().endsWith('.pdf')
    } catch {
      return url.toLowerCase().includes('.pdf')
    }
  }

  const getPdfPreviewUrl = (url: string) => {
    try {
      const parsed = new URL(url)

      if (parsed.hostname.includes('github.com') && parsed.pathname.includes('/blob/')) {
        const parts = parsed.pathname.split('/').filter(Boolean)
        if (parts.length >= 5) {
          const owner = parts[0]
          const repo = parts[1]
          const branch = parts[3]
          const filePath = parts.slice(4).join('/')
          return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`
        }
      }

      return url
    } catch {
      return url
    }
  }

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
        .map((item: any) => {
          const urlStr = String(item.resource_url || '')
          const isPdf = isLikelyPdfUrl(urlStr)
          return {
            ...item,
            folder_name: item.resource_folders?.folder_name || null,
            batch_year: item.shared_resource_batches?.[0]?.batch_year ?? null,
            // If it's a PDF file on GitHub, prefer rendering the PDF first-page preview
            thumbnail_url: !isPdf && item.resource_url ? getGithubPreview(urlStr) : undefined,
          }
        })

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
                      ) : activeTab === 'github' && item.resource_url && isLikelyPdfUrl(item.resource_url) ? (
                        <LazyPdfPreview url={getPdfPreviewUrl(item.resource_url)} title={item.title} />
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
                          className={`rounded px-3 py-2 text-center ${activeTab === 'videos' ? 'flex-1 bg-red-600 text-white' : 'flex-1 border border-indigo-600 bg-white text-indigo-600'}`}
                        >
                          Open
                        </a>
                        {activeTab === 'github' && item.resource_url && (
                          <a
                            href={getDownloadUrl(item.resource_url)}
                            target="_blank"
                            rel="noreferrer"
                            download
                            className="rounded border border-emerald-600 px-3 py-2 text-emerald-700"
                          >
                            Download
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(item.id, activeTab === 'videos' ? 'video' : 'resource')}
                          className={`rounded border border-red-600 px-3 py-2 text-red-600 ${activeTab === 'videos' ? 'flex-1' : ''}`}
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
