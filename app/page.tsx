'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Home() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const navItems = [
    //{ label: 'Batches', href: '/batches' },
    //{ label: 'Courses', href: '/courses' },
    //{ label: 'Contests', href: '/contests' },
    //{ label: 'Achievements', href: '/achievements' },
    { label: 'Alumni', href: '/alumni' },
  ]

  const features = [
    {
      title: 'Learn and Practice',
      description:
        'Access study materials, recordings, and practice problems in one clean workspace.',
    },
    {
      title: 'Take Exams',
      description:
        'Attempt MCQ exams with clear results, structured review, and progress tracking.',
    },
    {
      title: 'Connect with Members',
      description:
        'Stay close to your batch, alumni, and club updates with a simple information flow.',
    },
  ]

  const stats = [
    { value: '500+', label: 'Active Members' },
    { value: '100+', label: 'Practice Problems' },
    { value: '50+', label: 'Video Tutorials' },
    { value: '20+', label: 'Expert Mentors' },
  ]

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    setIsAuthenticated(!!token)
    setIsLoading(false)
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
            A clean, structured space for algorithms, problem solving, and collaborative learning.
            Compete, learn, build, and grow with peers pushing the same limits as you.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup" className="mono-button px-8 py-4 text-base font-semibold">
              Join Now
            </Link>
            <Link href="/dashboard" className="mono-button mono-button--light px-8 py-4 text-base font-semibold">
              Explore Platform
            </Link>
          </div>
        </div>
      </section>

      <section className="mono-section border-t border-neutral-200 bg-neutral-50/70">
        <div className="mono-container grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="mono-card mono-card-hover p-8">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-neutral-300 text-sm font-bold text-neutral-700">
                0{features.indexOf(feature) + 1}
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-neutral-950">
                {feature.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-neutral-600">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mono-section">
        <div className="mono-container grid gap-6 md:grid-cols-2">
          <div className="mono-card mono-card-hover p-8 md:p-10">
            <span className="mono-badge">Class Recordings</span>
            <h3 className="mt-6 text-3xl font-black tracking-tight text-neutral-950">
              Organized, searchable learning
            </h3>
            <p className="mt-4 text-sm leading-7 text-neutral-600">
              Access class sessions, download resources, and review everything in a quiet black-and-white interface.
            </p>
          </div>
          <div className="mono-card mono-card-hover p-8 md:p-10">
            <span className="mono-badge">Advanced Exams</span>
            <h3 className="mt-6 text-3xl font-black tracking-tight text-neutral-950">
              Clear progress and result flow
            </h3>
            <p className="mt-4 text-sm leading-7 text-neutral-600">
              Randomized exams, instant feedback, and structured analytics, all without visual noise.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-neutral-200 bg-white">
        <div className="mono-container grid grid-cols-2 gap-4 py-10 md:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="rounded-2xl border border-neutral-200 px-4 py-6 text-center">
              <div className="text-3xl font-black text-neutral-950">{item.value}</div>
              <p className="mt-2 text-xs font-medium uppercase tracking-[0.22em] text-neutral-500">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mono-section bg-neutral-50/70">
        <div className="mono-container">
          <div className="mono-surface rounded-[2rem] px-8 py-10 text-center md:px-12 md:py-14">
            <h2 className="text-3xl font-black tracking-tight text-neutral-950 md:text-5xl">
              Ready to start your journey?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-neutral-600 md:text-base">
              Join thousands of students already learning, practicing, and excelling with Math Club.
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
                <li><Link href="/courses" className="transition-colors hover:text-neutral-950">Courses</Link></li>
                <li><Link href="/contests" className="transition-colors hover:text-neutral-950">Contests</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500">Support</h3>
              <ul className="mt-4 space-y-2 text-sm text-neutral-600">
                <li><a href="#" className="transition-colors hover:text-neutral-950">Contact Us</a></li>
                <li><a href="#" className="transition-colors hover:text-neutral-950">FAQ</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

