'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface SignupRequest {
  id: string
  full_name: string
  email: string
  phone?: string
  batch_year?: number
  reason?: string
  status: 'pending' | 'approved' | 'rejected'
  is_email_verified: boolean
  profile_image_url?: string
  created_at: string
  review_comment?: string
}

export default function AdminApprovalsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<SignupRequest[]>([])
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<SignupRequest | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)
  const [password, setPassword] = useState('')
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    fetchPendingRequests()
  }, [])

  const fetchPendingRequests = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/admin/pending-signups', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Failed to fetch requests')
        return
      }

      setRequests(data.data || [])
    } catch (err) {
      setError('An error occurred while fetching requests')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = (request: SignupRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request)
    setActionType(action)
    setPassword('')
    setRejectReason('')
    setShowModal(true)
  }

  const submitAction = async () => {
    if (!selectedRequest || !actionType) return

    if (actionType === 'approve' && !password) {
      setError('Password is required for approval')
      return
    }

    if (actionType === 'reject' && !rejectReason) {
      setError('Rejection reason is required')
      return
    }

    setProcessing(selectedRequest.id)
    setError('')

    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/admin/approve-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          signup_request_id: selectedRequest.id,
          action: actionType,
          password: actionType === 'approve' ? password : undefined,
          reason: actionType === 'reject' ? rejectReason : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Action failed')
        return
      }

      // Remove from list and show success
      setRequests((prev) => prev.filter((r) => r.id !== selectedRequest.id))
      setShowModal(false)
      setSelectedRequest(null)
    } catch (err) {
      setError('An error occurred')
      console.error('Action error:', err)
    } finally {
      setProcessing(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Signup Approvals</h1>
          <p className="text-gray-600">Review and approve pending student signups</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 text-lg">No pending signup requests</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {requests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 flex-1">
                    {request.profile_image_url && (
                      <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                          src={request.profile_image_url}
                          alt={request.full_name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">{request.full_name}</h3>
                      <p className="text-gray-600">{request.email}</p>
                      {request.phone && <p className="text-gray-600">{request.phone}</p>}
                      {request.batch_year && (
                        <p className="text-gray-600">Batch: {request.batch_year}</p>
                      )}
                      {request.reason && (
                        <p className="text-gray-700 mt-3 text-sm">
                          <span className="font-medium">Why join:</span> {request.reason}
                        </p>
                      )}
                      <div className="mt-3 flex items-center gap-4">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            request.is_email_verified
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {request.is_email_verified ? '✓ Email Verified' : 'Pending Email Verification'}
                        </span>
                        <span className="text-xs text-gray-500">
                          Applied: {new Date(request.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {!request.is_email_verified && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
                      Waiting for email verification
                    </div>
                  )}

                  {request.is_email_verified && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(request, 'approve')}
                        disabled={processing === request.id}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 text-sm font-medium"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(request, 'reject')}
                        disabled={processing === request.id}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 text-sm font-medium"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {actionType === 'approve' ? 'Approve Signup' : 'Reject Signup'}
            </h2>

            <p className="text-gray-700 mb-4">
              {actionType === 'approve'
                ? `Approve ${selectedRequest.full_name}'s account?`
                : `Reject ${selectedRequest.full_name}'s signup?`}
            </p>

            {actionType === 'approve' ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Set Initial Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Initial password"
                />
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  rows={3}
                  placeholder="Why are you rejecting this application?"
                />
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-700 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={submitAction}
                disabled={processing === selectedRequest.id}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition disabled:opacity-50 font-medium ${
                  actionType === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {processing === selectedRequest.id
                  ? 'Processing...'
                  : actionType === 'approve'
                    ? 'Approve'
                    : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
