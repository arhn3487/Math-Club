'use client'

import Link from 'next/link'
import { useState } from 'react'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navItems = [
    { label: 'Home', href: '/', icon: '⌂' },
    { label: 'Batches', href: '/batches', icon: '▦' },
    { label: 'Courses', href: '/courses', icon: '◫' },
    { label: 'Contests', href: '/contests', icon: '◌' },
    { label: 'Achievements', href: '/achievements', icon: '✦' },
    { label: 'Alumni', href: '/alumni', icon: '◉' },
    { label: 'Dashboard', href: '/dashboard', icon: '▣' },
  ]

  return (
    <nav className="border-b border-neutral-200 bg-white/95 text-neutral-900 shadow-sm backdrop-blur">
      <div className="mx-auto grid max-w-7xl grid-cols-[auto,1fr,auto] items-center gap-4 px-4 py-4">
        <Link href="/" className="flex items-center gap-3">
          <img 
            src="https://zxkeolkojkoenkszekiy.supabase.co/storage/v1/object/public/math-club-images/Math%20Club%20Logo/math%20club%20logo.png" 
            alt="Math Club Logo" 
            className="h-10 w-auto object-contain"
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden items-center justify-center gap-2 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-100"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-neutral-300 text-[10px] font-bold text-neutral-500">
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="justify-self-end lg:hidden" />

        <button
          className="rounded-full border border-neutral-200 p-2 lg:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="border-t border-neutral-200 bg-white px-4 py-4 md:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 py-2 text-sm font-semibold text-neutral-900 transition-colors hover:text-neutral-950"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-neutral-300 text-[10px] font-bold text-neutral-500">
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}

// Footer Component
export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-neutral-200 bg-white py-10 mt-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img 
                src="https://zxkeolkojkoenkszekiy.supabase.co/storage/v1/object/public/math-club-images/Math%20Club%20Logo/math%20club%20logo.png" 
                alt="Math Club Logo" 
                className="h-10 w-auto object-contain"
              />
              <h3 className="text-lg font-bold text-neutral-900">Math Club</h3>
            </div>
            <p className="text-sm leading-6 text-neutral-600">
              Empowering students through competitive programming and mathematics.
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-bold text-neutral-900">Quick Links</h3>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>
                <Link href="/batches" className="transition-colors hover:text-neutral-950">
                  Batches
                </Link>
              </li>
              <li>
                <Link href="/courses" className="transition-colors hover:text-neutral-950">
                  Courses
                </Link>
              </li>
              <li>
                <Link href="/contests" className="transition-colors hover:text-neutral-950">
                  Contests
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-bold text-neutral-900">Contact</h3>
            <p className="text-sm text-neutral-600">Email: info@mathclub.com</p>
            <p className="text-sm text-neutral-600">Phone: +1 (555) 123-4567</p>
          </div>
        </div>
        <div className="border-t border-neutral-200 pt-8 text-center text-sm text-neutral-500">
          <p>&copy; {currentYear} Math Club. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
