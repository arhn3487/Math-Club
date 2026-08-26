'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Leadership } from '@/types'

export default function LeadershipPage() {
  const [members, setMembers] = useState<Leadership[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/leadership', { cache: 'no-store' })
        if (!response.ok) return
        const data = await response.json()
        setMembers(Array.isArray(data) ? data : [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const current = members.filter((member) => member.is_current)
  const past = members.filter((member) => !member.is_current)

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
            <span className="text-xl font-black tracking-tight text-neutral-950 md:text-2xl">Math Club</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/achievements" className="mono-button mono-button--light px-4 py-2 text-sm font-semibold">
              Achievements
            </Link>
            <Link href="/login" className="mono-button px-4 py-2 text-sm font-semibold">
              Login
            </Link>
          </div>
        </div>
      </nav>

      <section className="mono-section">
        <div className="mono-container text-center">
          <span className="mono-badge">Club Leadership</span>
          <h1 className="mt-6 text-4xl font-black tracking-tight text-neutral-950 md:text-6xl">
            Presidents of MIST Math Club
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-neutral-600">
            Meet the students who have led the club, past and present.
          </p>
        </div>
      </section>

      {loading ? (
        <div className="mono-container px-4 pb-20 text-center text-sm text-neutral-600">Loading leadership...</div>
      ) : members.length === 0 ? (
        <div className="mono-container px-4 pb-20">
          <div className="mono-card p-12 text-center text-sm text-neutral-600">
            Leadership information hasn't been added yet. Please check back soon.
          </div>
        </div>
      ) : (
        <>
          {current.length > 0 && (
            <section className="mono-section pt-0">
              <div className="mono-container">
                <h2 className="mb-6 text-2xl font-black tracking-tight text-neutral-950">Currently Leading</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {current.map((member) => (
                    <div key={member.id} className="mono-surface flex flex-col gap-5 rounded-[2rem] p-6 sm:flex-row sm:items-center">
                      {member.photo_url ? (
                        <img
                          src={member.photo_url}
                          alt={member.full_name}
                          className="h-28 w-28 flex-shrink-0 rounded-full border border-neutral-200 object-cover"
                        />
                      ) : (
                        <div className="flex h-28 w-28 flex-shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 text-3xl font-black text-neutral-400">
                          {member.full_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <span className="mono-badge">{member.position}</span>
                        <h3 className="mt-3 text-2xl font-black tracking-tight text-neutral-950">{member.full_name}</h3>
                        {(member.term_start || member.batch_year) && (
                          <p className="mt-1 text-sm text-neutral-500">
                            {member.term_start ? `Since ${member.term_start}` : `Batch ${member.batch_year}`}
                          </p>
                        )}
                        {member.bio && <p className="mt-3 text-sm leading-7 text-neutral-600">{member.bio}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section className="mono-section bg-neutral-50/70 pt-10">
              <div className="mono-container">
                <h2 className="mb-6 text-2xl font-black tracking-tight text-neutral-950">Past Presidents</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {past.map((member) => (
                    <div key={member.id} className="mono-card mono-card-hover p-6 text-center">
                      {member.photo_url ? (
                        <img
                          src={member.photo_url}
                          alt={member.full_name}
                          className="mx-auto h-24 w-24 rounded-full border border-neutral-200 object-cover"
                        />
                      ) : (
                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 text-2xl font-black text-neutral-400">
                          {member.full_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <h3 className="mt-4 text-lg font-bold text-neutral-950">{member.full_name}</h3>
                      <p className="mt-1 text-sm font-semibold text-neutral-600">{member.position}</p>
                      {(member.term_start || member.term_end) && (
                        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-neutral-500">
                          {member.term_start ?? '—'} – {member.term_end ?? 'Present'}
                        </p>
                      )}
                      {member.bio && <p className="mt-3 text-sm leading-6 text-neutral-600">{member.bio}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      <footer className="border-t border-neutral-200 bg-white py-10">
        <div className="mono-container text-center text-sm text-neutral-500">
          <Link href="/" className="font-semibold text-neutral-900 hover:underline">
            Back to Home
          </Link>
        </div>
      </footer>
    </div>
  )
}
