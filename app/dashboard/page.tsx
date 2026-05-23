'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AdminNavigation } from '@/components/layout/AdminNavigation'

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
      <div className="page-shell flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-neutral-900"></div>
          <p className="text-sm font-medium tracking-[0.2em] text-neutral-500 uppercase">Loading dashboard</p>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return null
  }

  const isStudent = dashboardData.userType === 'student'
  const isAdmin = dashboardData.userType === 'admin'

  const studentActions = [
    { label: 'Exams', href: '/exams', icon: '⌂' },
    { label: 'Recordings', href: '/class-recordings', icon: '◔' },
    { label: 'Resources', href: '/resource-sharing', icon: '▣' },
    { label: 'Alumni', href: '/alumni', icon: '◉' },
    { label: 'Notices', href: '/notices', icon: '◌' },
  ]

  const adminActions = [
    { label: 'User', href: '/admin/users', icon: '◫' },
    { label: 'Exams', href: '/admin/exams', icon: '✎' },
    { label: 'Resources', href: '/admin/class-recordings', icon: '◔' },
    { label: 'Notices', href: '/admin/notices', icon: '◌' },
  ]

  return (
    <div className="page-shell">
      {dashboardData.userType === 'admin' ? <AdminNavigation /> : null}

      <div className="mx-auto flex min-h-[calc(100vh-5.5rem)] max-w-7xl flex-col items-center justify-center px-4 py-16 text-center">
        <p className="text-4xl font-black uppercase tracking-tight text-neutral-900 sm:text-6xl lg:text-7xl">
          HELLO <span className="text-[#7a4d35]">MEMBER,</span>
        </p>
        <h1 className="mt-4 text-3xl font-black uppercase tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
          Welcome to
        </h1>

        <div className="mt-10 flex items-center justify-center">
          <img
            src="https://zxkeolkojkoenkszekiy.supabase.co/storage/v1/object/public/math-club-images/Math%20Club%20Logo/math%20club%20logo.png"
            alt="Math Club Logo"
            className="w-[19rem] max-w-[80vw] object-contain sm:w-[24rem] lg:w-[30rem]"
          />
        </div>

        <p className="mt-12 max-w-4xl text-lg font-semibold leading-8 text-neutral-500 sm:text-2xl">
          {isStudent
            ? 'A community for problem solving, growth, and collaborative learning.'
            : 'A place to manage members, exams, recordings, and announcements with ease.'}
        </p>
        <p className="mt-3 max-w-4xl text-base leading-7 text-neutral-500 sm:text-xl">
          {isStudent
            ? 'Compete, learn, build, and grow with peers pushing the same limits as you.'
            : 'Organize everything from one clean dashboard made for the club.'}
        </p>
      </div>
    </div>
  )
}