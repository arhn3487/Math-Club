'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const adminLinks = [
  { label: 'User', href: '/admin/users', icon: '◫' },
  { label: 'Exams', href: '/admin/exams', icon: '✎' },
  { label: 'Resources', href: '/admin/resource-sharing', icon: '◔' },
  { label: 'Notices', href: '/admin/notices', icon: '◌' },
]

export function AdminNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [profileLabel, setProfileLabel] = useState('A')

  useEffect(() => {
    setProfileImage(localStorage.getItem('profile_image_url'))
    const fullName = localStorage.getItem('full_name')
    const userId = localStorage.getItem('user_id')
    setProfileLabel((fullName || userId || 'A').charAt(0).toUpperCase())
  }, [])

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`)

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_type')
    localStorage.removeItem('user_id')
    localStorage.removeItem('full_name')
    localStorage.removeItem('profile_image_url')
    router.push('/')
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <img
            src="https://zxkeolkojkoenkszekiy.supabase.co/storage/v1/object/public/math-club-images/Math%20Club%20Logo/math%20club%20logo.png"
            alt="Math Club Logo"
            className="h-10 w-auto object-contain"
          />
          {/* <span className="text-lg font-black tracking-tight text-neutral-900 sm:text-2xl">
            Admin Panelll
          </span> */}
        </Link>

        <div className="hidden flex-1 items-center justify-center gap-8 lg:flex">
          {adminLinks.map((item) => {
            const active = isActive(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className="mono-nav-button group inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-neutral-900 transition"
              >
                <span className={[
                  'flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold transition',
                  active
                    ? 'border-neutral-900 text-neutral-900'
                    : 'border-neutral-300 text-neutral-900 group-hover:border-neutral-900 group-hover:text-neutral-900',
                ].join(' ')}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/profile" className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-2 transition hover:bg-neutral-50">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="h-8 w-8 rounded-full object-cover border border-neutral-300"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 bg-neutral-100 text-sm font-bold text-neutral-900">
                {profileLabel}
              </div>
            )}
          </Link>
          <button
            onClick={handleLogout}
            className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}