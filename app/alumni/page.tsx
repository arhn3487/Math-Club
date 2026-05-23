'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Member {
  id: string
  user_id: string
  full_name: string
  email: string
  user_type: 'student' | 'admin'
  batch_year?: number
  profile_image_url?: string
  student_id?: string
  admin_id?: string
}

export default function AlumniPage() {
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userType, setUserType] = useState<'student' | 'admin' | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBatch, setFilterBatch] = useState<number | 'all'>('all')
  const [batches, setBatches] = useState<number[]>([])

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const type = localStorage.getItem('user_type')

    if (!token) {
      router.push('/login')
      return
    }

    setUserType(type as 'student' | 'admin')
    fetchMembers()
  }, [router])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/members', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      })

      if (!response.ok) throw new Error('Failed to fetch members')

      const data = await response.json()
      setMembers(data.members)

      // Extract unique batch years for filtering
      const uniqueBatches = Array.from(new Set(data.members.map((m: Member) => m.batch_year).filter(Boolean))) as number[]
      setBatches(uniqueBatches.sort((a, b) => b - a))

      // For students, default to their batch
      if (userType === 'student' && localStorage.getItem('user_batch')) {
        setFilterBatch(parseInt(localStorage.getItem('user_batch') || ''))
      }

      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.user_id.toLowerCase().includes(searchTerm.toLowerCase())

    if (userType === 'student') {
      // Students only see their batchmates
      return matchesSearch
    } else {
      // Admins can filter by batch
      const matchesBatch = filterBatch === 'all' ? true : member.batch_year === filterBatch
      return matchesSearch && matchesBatch
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading members...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {userType === 'student' ? 'Batchmates' : 'All Members'}
          </h1>
          <p className="text-gray-600 mt-2">
            {userType === 'student'
              ? 'Connect with your batch members'
              : 'Manage and view all members in the community'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or user ID..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {userType === 'admin' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Batch Year</label>
                <select
                  value={filterBatch}
                  onChange={(e) => setFilterBatch(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Batches</option>
                  {batches.map((batch) => (
                    <option key={batch} value={batch}>
                      {batch}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Members List */}
        <div className="space-y-3 w-full">
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-4 flex items-center gap-6"
              >
                {member.profile_image_url ? (
                  <img
                    src={member.profile_image_url}
                    alt={member.full_name}
                    className="w-12 h-12 rounded-full flex-shrink-0 object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full flex-shrink-0 bg-indigo-600 flex items-center justify-center text-white font-bold">
                    {member.full_name.charAt(0)}
                  </div>
                )}

                <div className="flex-1 flex items-center gap-6">
                  <h3 className="text-base font-semibold text-gray-900 min-w-fit">{member.full_name}</h3>
                  <p className="text-gray-600 text-sm">
                    {member.user_type === 'admin' 
                      ? `Admin ID: ${member.admin_id}` 
                      : `Student ID: ${member.student_id}`
                    }
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-6xl mb-4">👥</div>
              <p className="text-gray-600">
                {searchTerm ? 'No members found matching your search.' : 'No members available.'}
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-gray-600">
          Total members: {filteredMembers.length}
        </div>
      </div>
    </div>
  )
}
