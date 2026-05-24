'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  user_id: string
  student_id?: string
  admin_id?: string
  user_type: 'student' | 'admin' | 'superuser'
  full_name: string
  email: string
  batch_year?: number
  is_active: boolean
  created_at: string
}

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

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingApprovals, setLoadingApprovals] = useState(true)
  const [error, setError] = useState('')
  const [approvalError, setApprovalError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'student' | 'admin'>('all')
  const [filterBatch, setFilterBatch] = useState<number | 'all'>('all')
  const [batches, setBatches] = useState<number[]>([])
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [userType, setUserType] = useState<'student' | 'admin' | 'superuser'>('student')

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const storedUserType = localStorage.getItem('user_type') as 'student' | 'admin' | 'superuser' | null
    setUserType(storedUserType)

    if (!token || !storedUserType || !['admin', 'superuser'].includes(storedUserType)) {
      router.push('/login')
      return
    }

    fetchUsers()
    fetchPendingUsers()
  }, [router])

  const canManageUsers = userType === 'superuser'

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }

      const data = await response.json()
      setUsers(data.users)

      // Extract unique batch years
      const uniqueBatches = Array.from(new Set(data.users.map((u: User) => u.batch_year).filter(Boolean))) as number[]
      setBatches(uniqueBatches.sort((a, b) => b - a))
    } catch (err) {
      setError('Failed to load users')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingUsers = async () => {
    try {
      setLoadingApprovals(true)
      const response = await fetch('/api/admin/approvals', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch pending approvals')
      }

      const data = await response.json()
      setPendingUsers(data.users || [])
    } catch (err) {
      setApprovalError('Failed to load pending approvals')
      console.error(err)
    } finally {
      setLoadingApprovals(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!canManageUsers) return

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete user')
      }

      setUsers(users.filter((u) => u.id !== userId))
      setDeleteConfirm(null)
    } catch (err) {
      setError('Failed to delete user')
      console.error(err)
    }
  }

  const handleApprove = async (userId: string, studentId: string) => {
    if (!canManageUsers) return

    setActionLoading(userId)
    setSuccessMessage('')
    try {
      const response = await fetch(`/api/admin/approvals/${userId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ approve: true }),
      })

      if (!response.ok) {
        throw new Error('Failed to approve user')
      }

      setPendingUsers(pendingUsers.filter((u) => u.id !== userId))
      setSuccessMessage(`Approved ${studentId}`)
      setTimeout(() => setSuccessMessage(''), 2500)
    } catch (err) {
      setApprovalError('Failed to approve user')
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (userId: string, studentId: string) => {
    if (!canManageUsers) return

    if (!confirm(`Reject ${studentId}?`)) return

    setActionLoading(userId)
    setSuccessMessage('')
    try {
      const response = await fetch(`/api/admin/approvals/${userId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ approve: false }),
      })

      if (!response.ok) {
        throw new Error('Failed to reject user')
      }

      setPendingUsers(pendingUsers.filter((u) => u.id !== userId))
      setSuccessMessage(`Rejected ${studentId}`)
      setTimeout(() => setSuccessMessage(''), 2500)
    } catch (err) {
      setApprovalError('Failed to reject user')
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.student_id && user.student_id.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesType = filterType === 'all' || user.user_type === filterType
    const matchesBatch = filterBatch === 'all' || user.batch_year === filterBatch

    return matchesSearch && matchesType && matchesBatch
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage users and pending approvals in one place</p>
        </div>

        {successMessage && (
          <div className="mb-4 rounded border border-green-200 bg-green-50 p-4 text-green-700">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        {approvalError && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-4 text-red-700">
            {approvalError}
          </div>
        )}

        <div className="mb-6 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-neutral-950">Pending Approvals</h2>
          {loadingApprovals ? (
            <p className="text-neutral-600">Loading pending approvals...</p>
          ) : pendingUsers.length === 0 ? (
            <p className="text-neutral-600">No pending student approvals.</p>
          ) : (
            <div className="space-y-4">
              {pendingUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col gap-4 rounded-2xl border border-neutral-200 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-semibold text-neutral-950">{user.full_name}</p>
                    <p className="text-sm text-neutral-600">{user.email}</p>
                    <p className="text-sm text-neutral-600">Student ID: {user.student_id || 'N/A'}</p>
                  </div>
                  <div className="flex gap-2">
                    {canManageUsers ? (
                      <>
                        <button
                          onClick={() => handleApprove(user.id, user.student_id || 'Unknown')}
                          disabled={actionLoading === user.id}
                          className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:border-neutral-900 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(user.id, user.student_id || 'Unknown')}
                          disabled={actionLoading === user.id}
                          className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:border-neutral-900 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="rounded-full border border-dashed border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-500">
                        View only
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Name, email, ID..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Types</option>
                <option value="student">Students</option>
                <option value="admin">Admins</option>
                <option value="superuser">Superusers</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Batch Year</label>
              <select
                value={filterBatch}
                onChange={(e) => setFilterBatch(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Batches</option>
                {batches.map((batch) => (
                  <option key={batch} value={batch}>
                    {batch}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">&nbsp;</label>
              <button
                onClick={fetchUsers}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">User ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Batch</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{user.full_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.user_id}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded text-white text-xs font-medium ${
                            user.user_type === 'superuser'
                              ? 'bg-amber-600'
                              : user.user_type === 'admin'
                                ? 'bg-purple-600'
                                : 'bg-blue-600'
                          }`}
                        >
                          {user.user_type === 'superuser'
                            ? 'Superuser'
                            : user.user_type === 'admin'
                              ? 'Admin'
                              : 'Student'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.batch_year || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            user.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {canManageUsers ? (
                          <button
                            onClick={() => setDeleteConfirm(user.id)}
                            className="text-red-600 hover:text-red-900 font-medium"
                          >
                            Delete
                          </button>
                        ) : (
                          <span className="text-sm text-neutral-400">Superuser only</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-gray-50 border-t text-sm text-gray-600">
            Total users: {filteredUsers.length}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete User?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this user? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteUser(deleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
