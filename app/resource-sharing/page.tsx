'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
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

function LazyPdfPreview({ url, title }: { url: string; title: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [shouldLoad, setShouldLoad] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!shouldLoad || !canvasRef.current) return

    const loadPdfJsAndRender = async () => {
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
    <div ref={containerRef} className="relative mb-3 h-44 w-full overflow-hidden rounded bg-gray-100">
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
  const [userType, setUserType] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const userType = localStorage.getItem('user_type')

    if (!token || (userType !== 'student' && userType !== 'superuser')) {
      router.push('/login')
      return
    }
    setUserType(userType)
    fetchResources()
    fetchFolders()
  }, [router])

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

      // Build list of GitHub/resource items but exclude any that are the same URL as a video
      const videoUrlSet = new Set<string>()
      videoItems.forEach((vi) => {
        if (vi.resource_url) videoUrlSet.add(String(vi.resource_url).toLowerCase())
        if (vi.youtube_url) videoUrlSet.add(String(vi.youtube_url).toLowerCase())
      })

      const githubItems: Resource[] = (resourceData.resources || []).filter((r: any) => {
        const url = String(r.resource_url || '').toLowerCase()
        const type = String(r.resource_type || '').toLowerCase()
        // exclude resources that are actually the same as a video entry
        if (!url) return false
        if (videoUrlSet.has(url)) return false
        // exclude YouTube links that may have been added as generic resources
        if (url.includes('youtube.com') || url.includes('youtu.be')) return false
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
        // If it's a PDF file on GitHub, don't set an OG thumbnail so the PDF renderer shows page 1
        thumbnail_url: (r.resource_url && !isLikelyPdfUrl(String(r.resource_url))) ? getGithubPreview(String(r.resource_url)) : undefined,
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

    // Convert to sorted array of [folderName, items] and sort ascending by folder name
    let entries = Object.entries(map)
      .map(([k, v]) => [k, v.sort((a, b) => (a.title || '').localeCompare(b.title || ''))] as [string, Resource[]])
      .sort((a, b) => a[0].localeCompare(b[0]))

    return entries
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
            {groupedByFolder.map(([folderName, items]) => (
              <div key={folderName}>
                <h4 className="text-lg font-semibold mb-4">{folderName}</h4>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((item) => (
                    <div key={`${activeTab}-${item.id}`} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition">
                      {item.thumbnail_url ? (
                        <img src={item.thumbnail_url} alt={item.title} className="w-full h-44 object-cover rounded mb-3" />
                      ) : activeTab === 'github' && item.resource_url && isLikelyPdfUrl(item.resource_url) ? (
                        <LazyPdfPreview url={getPdfPreviewUrl(item.resource_url)} title={item.title} />
                      ) : (
                        <div className="w-full h-44 bg-gray-100 rounded mb-3 flex items-center justify-center text-gray-400">No preview</div>
                      )}
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description || 'No description'}</p>
                      <div className="flex gap-2">
                        <a
                          href={item.resource_url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`px-3 py-2 rounded text-center text-sm ${
                            activeTab === 'videos'
                              ? 'w-full bg-red-600 hover:bg-red-700 text-white'
                              : 'flex-1 border border-indigo-600 text-indigo-600 hover:bg-indigo-50'
                          }`}
                        >
                          {activeTab === 'videos' ? 'Watch' : 'Open Link'}
                        </a>
                        {activeTab === 'github' && item.resource_url && (
                          <a
                            href={getDownloadUrl(item.resource_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="rounded border border-emerald-600 px-3 py-2 text-center text-sm text-emerald-700 hover:bg-emerald-50"
                          >
                            Download PDF
                          </a>
                        )}
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
