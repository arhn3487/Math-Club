'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AdminNavigation } from '@/components/layout/AdminNavigation'

interface DashboardData {
  userType: 'student' | 'admin' | 'superuser'
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
    const decodedUserType = userType as 'student' | 'admin' | 'superuser'
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
  const isAdmin = dashboardData.userType === 'admin' || dashboardData.userType === 'superuser'
  const isSuperuser = dashboardData.userType === 'superuser'

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

  const superuserActions = [
    { label: 'Manage Members', href: '/admin/users', icon: '◫' },
    { label: 'Manage Achievements', href: '/superuser/achievements', icon: '★' },
    { label: 'Register User', href: '/admin/register', icon: '✚' },
    { label: 'Approve Students', href: '/admin/users', icon: '✓' },
    { label: 'Review Records', href: '/admin/exams', icon: '✎' },
  ]

  return (
    <div className="page-shell">
      {isAdmin ? <AdminNavigation /> : null}

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
            : isSuperuser
              ? 'Superuser access gives you member control, approvals, and registration tools in one place.'
              : 'Organize everything from one clean dashboard made for the club.'}
        </p>

        {isSuperuser && (
          <div className="mt-12 w-full max-w-5xl rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 text-left">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">Superuser Console</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-neutral-950">Member Control Center</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-neutral-600">
                This area is reserved for the superuser account and is separate from normal admin tools.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {superuserActions.map((action) => (
                <Link
                  key={action.href + action.label}
                  href={action.href}
                  className="group rounded-2xl border border-neutral-200 bg-neutral-50 p-5 text-left transition hover:-translate-y-0.5 hover:border-neutral-900 hover:bg-white"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 bg-white text-sm font-black text-neutral-900 transition group-hover:border-neutral-900">
                    {action.icon}
                  </div>
                  <p className="mt-4 text-lg font-bold text-neutral-950">{action.label}</p>
                  <p className="mt-1 text-sm leading-6 text-neutral-600">
                    Open the superuser-only workflow for {action.label.toLowerCase()}.
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}