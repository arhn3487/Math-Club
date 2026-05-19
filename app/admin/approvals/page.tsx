'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface PendingUser {
  id: string
  user_id: string
  full_name: string
  email: string
  student_id?: string
  batch_year?: number
  profile_image_url?: string
  created_at: string
}

export default function ApprovalsPage() {
  const router = useRouter()
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchPendingUsers()
  }, [])

  const fetchPendingUsers = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/admin/approvals', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login')
          return
        }
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch pending users')
      }

      const data = await response.json()
      console.log('Fetched pending users:', data.users)
      setPendingUsers(data.users || [])
    } catch (err) {
      setError(`Failed to load pending approvals: ${err instanceof Error ? err.message : String(err)}`)
      console.error('Error fetching pending users:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (userId: string, studentId: string) => {
    setActionLoading(userId)
    setSuccessMessage('')
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`/api/admin/approvals/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ approve: true }),
      })

      if (!response.ok) {
        throw new Error('Failed to approve user')
      }

      setPendingUsers(pendingUsers.filter(u => u.id !== userId))
      setSuccessMessage(`✅ ${studentId} approved successfully!`)
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError(`Failed to approve user: ${err instanceof Error ? err.message : String(err)}`)
      console.error('Error approving user:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (userId: string, studentId: string) => {
    if (!confirm(`Are you sure you want to reject ${studentId}?`)) return

    setActionLoading(userId)
    setSuccessMessage('')
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`/api/admin/approvals/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ approve: false }),
      })

      if (!response.ok) {
        throw new Error('Failed to reject user')
      }

      setPendingUsers(pendingUsers.filter(u => u.id !== userId))
      setSuccessMessage(`❌ ${studentId} rejected and deleted`)
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError(`Failed to reject user: ${err instanceof Error ? err.message : String(err)}`)
      console.error('Error rejecting user:', err)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pending approvals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-indigo-600">Approve Students</h1>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Back
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded text-green-700">
            {successMessage}
          </div>
        )}

        {pendingUsers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">All Caught Up!</h2>
            <p className="text-gray-600">No pending student approvals at the moment.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Pending Approvals ({pendingUsers.length})
              </h2>

              <div className="space-y-4">
                {pendingUsers.map((user) => (
                  <div
                    key={user.id}
                    className="border rounded-lg p-6 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between gap-6">
                      {/* User Info */}
                      <div className="flex items-start gap-4 flex-1">
                        {user.profile_image_url ? (
                          <img
                            src={user.profile_image_url}
                            alt={user.full_name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600">
                            {user.full_name.charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900">
                            {user.full_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Student ID: <span className="font-mono font-semibold">{user.student_id}</span>
                          </p>
                          <p className="text-sm text-gray-600">
                            Email: <span className="font-semibold">{user.email}</span>
                          </p>
                          {user.batch_year && (
                            <p className="text-sm text-gray-600">
                              Batch: <span className="font-semibold">{user.batch_year}</span>
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            Applied: {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleApprove(user.id, user.student_id || 'Unknown')}
                          disabled={actionLoading === user.id}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 font-medium whitespace-nowrap"
                        >
                          {actionLoading === user.id ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleReject(user.id, user.student_id || 'Unknown')}
                          disabled={actionLoading === user.id}
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 font-medium whitespace-nowrap"
                        >
                          {actionLoading === user.id ? 'Processing...' : 'Reject'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
