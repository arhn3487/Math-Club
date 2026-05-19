'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface DashboardData {
  userType: 'student' | 'admin'
  userName: string
  userId: string
  profileImage?: string
  isApproved?: boolean
}

export default function DashboardPage() {
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const userType = localStorage.getItem('user_type')
    const userId = localStorage.getItem('user_id')
    const fullName = localStorage.getItem('full_name')
    const profileImage = localStorage.getItem('profile_image_url')

    if (!token || !userType) {
      router.push('/login')
      return
    }

    // Get user name from API or decode token
    const decodedUserType = userType as 'student' | 'admin'
    setDashboardData({
      userType: decodedUserType,
      userName: 'Welcome',
      userId: fullName || userId || 'User',
      profileImage: profileImage || undefined,
    })
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return null
  }

  const isStudent = dashboardData.userType === 'student'
  const isAdmin = dashboardData.userType === 'admin'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-indigo-600">Math Club</div>
          <div className="flex items-center gap-6">
            {/* Profile Section */}
            <div className="flex items-center gap-3">
              {dashboardData.profileImage ? (
                <img 
                  src={dashboardData.profileImage} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full object-cover border-2 border-indigo-600"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600 border-2 border-indigo-600">
                  {dashboardData.userId.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="text-sm font-medium text-gray-700">{dashboardData.userId}</div>
                <div className="text-xs text-gray-500 capitalize">{dashboardData.userType}</div>
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('auth_token')
                localStorage.removeItem('user_type')
                localStorage.removeItem('user_id')
                localStorage.removeItem('full_name')
                localStorage.removeItem('profile_image_url')
                router.push('/')
              }}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Profile Card */}
        <div className="mb-12 bg-white rounded-lg shadow p-8 flex items-center gap-8">
          {dashboardData.profileImage ? (
            <img 
              src={dashboardData.profileImage} 
              alt="Profile" 
              className="w-24 h-24 rounded-lg object-cover border-4 border-indigo-600"
            />
          ) : (
            <div className="w-24 h-24 rounded-lg bg-indigo-100 flex items-center justify-center text-3xl font-bold text-indigo-600 border-4 border-indigo-600">
              {dashboardData.userId.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome to Math Club!</h2>
            <p className="text-gray-600 mt-1">
              {isStudent
                ? 'Access exams, class recordings, and connect with your batchmates'
                : 'Manage users, exams, class recordings, and announcements'}
            </p>
          </div>
        </div>

        {/* Student Dashboard */}
        {isStudent && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/exams">
              <div className="bg-white rounded-lg shadow p-8 hover:shadow-lg transition cursor-pointer">
                <div className="text-5xl mb-4">📝</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Exams</h2>
                <p className="text-gray-600">Take exams and view your results with instant scoring</p>
              </div>
            </Link>

            <Link href="/class-recordings">
              <div className="bg-white rounded-lg shadow p-8 hover:shadow-lg transition cursor-pointer">
                <div className="text-5xl mb-4">🎥</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Class Recordings</h2>
                <p className="text-gray-600">Watch recorded class sessions and tutorials</p>
              </div>
            </Link>

            <Link href="/alumni">
              <div className="bg-white rounded-lg shadow p-8 hover:shadow-lg transition cursor-pointer">
                <div className="text-5xl mb-4">👥</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Batchmates</h2>
                <p className="text-gray-600">Connect with members of your batch</p>
              </div>
            </Link>

            <Link href="/notices">
              <div className="bg-white rounded-lg shadow p-8 hover:shadow-lg transition cursor-pointer">
                <div className="text-5xl mb-4">📢</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Notices</h2>
                <p className="text-gray-600">Stay updated with latest announcements and events</p>
              </div>
            </Link>
          </div>
        )}

        {/* Admin Dashboard */}
        {isAdmin && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/admin/users">
              <div className="bg-white rounded-lg shadow p-8 hover:shadow-lg transition cursor-pointer">
                <div className="text-5xl mb-4">👤</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">User Management</h2>
                <p className="text-gray-600">Manage students and admins, filter by batch</p>
              </div>
            </Link>

            <Link href="/admin/exams">
              <div className="bg-white rounded-lg shadow p-8 hover:shadow-lg transition cursor-pointer">
                <div className="text-5xl mb-4">✏️</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Exam Management</h2>
                <p className="text-gray-600">Create exams, add questions, and view results</p>
              </div>
            </Link>

            <Link href="/admin/class-recordings">
              <div className="bg-white rounded-lg shadow p-8 hover:shadow-lg transition cursor-pointer">
                <div className="text-5xl mb-4">🎬</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Class Recordings</h2>
                <p className="text-gray-600">Upload and manage YouTube class recordings</p>
              </div>
            </Link>

            <Link href="/admin/notices">
              <div className="bg-white rounded-lg shadow p-8 hover:shadow-lg transition cursor-pointer">
                <div className="text-5xl mb-4">📣</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Notices</h2>
                <p className="text-gray-600">Post announcements and event notices</p>
              </div>
            </Link>

            <Link href="/admin/approvals">
              <div className="bg-white rounded-lg shadow p-8 hover:shadow-lg transition cursor-pointer">
                <div className="text-5xl mb-4">✅</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Approve Students</h2>
                <p className="text-gray-600">Review and approve pending student accounts</p>
              </div>
            </Link>

            <Link href="/alumni">
              <div className="bg-white rounded-lg shadow p-8 hover:shadow-lg transition cursor-pointer">
                <div className="text-5xl mb-4">👥</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">All Members</h2>
                <p className="text-gray-600">View and manage all community members</p>
              </div>
            </Link>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-16 grid md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-indigo-600">500+</div>
            <p className="text-gray-600 mt-2">Active Members</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-indigo-600">50+</div>
            <p className="text-gray-600 mt-2">Available Exams</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-indigo-600">100+</div>
            <p className="text-gray-600 mt-2">Class Recordings</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-indigo-600">20+</div>
            <p className="text-gray-600 mt-2">Batches</p>
          </div>
        </div>
      </div>
    </div>
  )
}