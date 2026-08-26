'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AchievementCard } from '@/components/cards/FeatureCards'
import { Achievement, Leadership } from '@/types'

export default function Home() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [achievementsLoading, setAchievementsLoading] = useState(true)
  const [currentPresident, setCurrentPresident] = useState<Leadership | null>(null)

  const navItems = [
    { label: 'Achievements', href: '/achievements' },
    { label: 'Leadership', href: '/leadership' },
    { label: 'Alumni', href: '/alumni' },
  ]

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    setIsAuthenticated(!!token)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    const loadAchievements = async () => {
      try {
        setAchievementsLoading(true)
        const response = await fetch('/api/achievements')
        if (!response.ok) {
          return
        }

        const data = await response.json()
        setAchievements(Array.isArray(data) ? data : [])
      } finally {
        setAchievementsLoading(false)
      }
    }

    loadAchievements()
  }, [])

  useEffect(() => {
    const loadLeadership = async () => {
      try {
        const response = await fetch('/api/leadership')
        if (!response.ok) return
        const data = await response.json()
        const list: Leadership[] = Array.isArray(data) ? data : []
        setCurrentPresident(list.find((member) => member.is_current) || null)
      } catch {
        // Non-critical for the homepage; the Leadership page still works.
      }
    }

    loadLeadership()
  }, [])

  if (isLoading) {
    return (
      <div className="page-shell flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-neutral-900"></div>
          <p className="text-sm font-medium tracking-[0.2em] text-neutral-600 uppercase">Loading</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return (
      <div className="page-shell flex items-center justify-center px-4 py-10">
        <div className="mono-surface w-full max-w-xl rounded-[2rem] p-8 text-center md:p-12">
          <span className="mono-badge">Signed in</span>
          <h1 className="mt-6 text-4xl font-black tracking-tight text-neutral-950 md:text-5xl">
            Math Club
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-neutral-600">
            Welcome back. Your dashboard is ready in a clean monochrome workspace.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Link href="/dashboard" className="mono-button mono-button--light px-6 py-3 text-sm font-semibold">
              Go to Dashboard
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem('auth_token')
                localStorage.removeItem('user_type')
                localStorage.removeItem('user_id')
                router.push('/')
              }}
              className="mono-button px-6 py-3 text-sm font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-shell">
      <nav className="border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mono-container flex items-center justify-between gap-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="https://zxkeolkojkoenkszekiy.supabase.co/storage/v1/object/public/math-club-images/Math%20Club%20Logo/math%20club%20logo%202.png"
              alt="Math Club Logo"
              className="h-10 w-auto object-contain"
            />
            <span className="text-xl font-black tracking-tight text-neutral-950 md:text-2xl">
              Math Club
            </span>
          </Link>

          <div className="hidden items-center gap-6 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-950"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="mono-button mono-button--light px-4 py-2 text-sm font-semibold">
              Login
            </Link>
            <Link href="/signup" className="mono-button px-4 py-2 text-sm font-semibold">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      <section className="mono-section">
        <div className="mono-container text-center">
          <span className="mono-badge">MIST Math Club</span>
          <h1 className="mt-8 text-5xl font-black tracking-tight text-neutral-950 md:text-7xl">
            HELLO ,
            <span className="block mt-3">WELCOME TO</span>
          </h1>
          <div className="mt-10 flex justify-center">
            <img
              src="https://zxkeolkojkoenkszekiy.supabase.co/storage/v1/object/public/math-club-images/Math%20Club%20Logo/math%20club%20logo%202.png"
              alt="Math Club Logo"
              className="h-40 w-auto object-contain md:h-52"
            />
          </div>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-8 text-neutral-600 md:text-lg">
            A focused club space for news, events, alumni updates, and public highlights.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup" className="mono-button px-8 py-4 text-base font-semibold">
              Join Now
            </Link>
            <Link href="/achievements" className="mono-button mono-button--light px-8 py-4 text-base font-semibold">
              View Achievements
            </Link>
          </div>
        </div>
      </section>

      {currentPresident && (
        <section className="mono-section pt-0">
          <div className="mono-container">
            <Link
              href="/leadership"
              className="mono-surface mono-card-hover flex flex-col items-center gap-5 rounded-[2rem] p-6 text-center sm:flex-row sm:text-left"
            >
              {currentPresident.photo_url ? (
                <img
                  src={currentPresident.photo_url}
                  alt={currentPresident.full_name}
                  className="h-20 w-20 flex-shrink-0 rounded-full border border-neutral-200 object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 text-2xl font-black text-neutral-400">
                  {currentPresident.full_name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <span className="mono-badge">Club {currentPresident.position}</span>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-neutral-950">{currentPresident.full_name}</h2>
                <p className="mt-1 text-sm text-neutral-600">See past and present club leadership &rarr;</p>
              </div>
            </Link>
          </div>
        </section>
      )}

      <section className="mono-section bg-neutral-50/70">
        <div className="mono-container">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="mono-badge">Achievements</span>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-neutral-950 md:text-5xl">
                Club moments and events
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-600 md:text-base">
                Public updates from club events, contests, and milestones appear here for everyone to see.
              </p>
            </div>
            <Link href="/achievements" className="mono-button mono-button--light px-5 py-3 text-sm font-semibold">
              View All
            </Link>
          </div>

          {achievementsLoading ? (
            <div className="mono-card p-8 text-center text-sm text-neutral-600">Loading achievements...</div>
          ) : achievements.length === 0 ? (
            <div className="mono-card p-8 text-center text-sm text-neutral-600">No achievements added yet.</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {achievements.slice(0, 6).map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mono-section bg-neutral-50/70">
        <div className="mono-container">
          <div className="mono-surface rounded-[2rem] px-8 py-10 text-center md:px-12 md:py-14">
            <h2 className="text-3xl font-black tracking-tight text-neutral-950 md:text-5xl">
              Stay connected with the club
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-neutral-600 md:text-base">
              Browse public updates, review achievements, and sign in when you need the full dashboard.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/signup" className="mono-button px-8 py-4 text-base font-semibold">
                Sign Up Now
              </Link>
              <Link href="/login" className="mono-button mono-button--light px-8 py-4 text-base font-semibold">
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-neutral-200 bg-white py-10">
        <div className="mono-container flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <span className="text-lg font-black tracking-tight text-neutral-950">Math Club</span>
            <p className="mt-3 max-w-sm text-sm leading-7 text-neutral-600">
              MIST MATH CLUB, mathematics, and a focused community with a calm monochrome interface.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500">Quick Links</h3>
              <ul className="mt-4 space-y-2 text-sm text-neutral-600">
                <li><Link href="/signup" className="transition-colors hover:text-neutral-950">Sign Up</Link></li>
                <li><Link href="/login" className="transition-colors hover:text-neutral-950">Login</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500">Explore</h3>
              <ul className="mt-4 space-y-2 text-sm text-neutral-600">
                <li><Link href="/achievements" className="transition-colors hover:text-neutral-950">Achievements</Link></li>
                <li><Link href="/leadership" className="transition-colors hover:text-neutral-950">Leadership</Link></li>
                <li><Link href="/alumni" className="transition-colors hover:text-neutral-950">Alumni</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500">Support</h3>
              <ul className="mt-4 space-y-2 text-sm text-neutral-600">
                <li><a href="mailto:info@mathclub.com" className="transition-colors hover:text-neutral-950">Contact Us</a></li>
                <li><Link href="/signup" className="transition-colors hover:text-neutral-950">How to Join</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

