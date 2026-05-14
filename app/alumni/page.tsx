'use client'

import { useEffect, useState } from 'react'
import { Loading, Error, Button } from '@/components/ui/BaseComponents'
import { AlumniCard } from '@/components/cards/FeatureCards'
import { AlumniMember } from '@/types'
import Link from 'next/link'

export default function AlumniPage() {
  const [alumni, setAlumni] = useState<AlumniMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAlumni()
  }, [])

  const fetchAlumni = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/alumni')
      if (!response.ok) throw new Error('Failed to fetch alumni')
      const data = await response.json()
      setAlumni(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <section className="page-header">
        <div className="container">
          <h1 className="page-title">Alumni</h1>
          <p className="page-subtitle">Meet our accomplished alumni</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          {loading && <Loading message="Loading alumni..." />}
          {error && <Error message={error} onRetry={fetchAlumni} />}

          {!loading && !error && alumni.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">No alumni members yet</p>
              <Link href="/">
                <Button>Back to Home</Button>
              </Link>
            </div>
          )}

          {!loading && !error && alumni.length > 0 && (
            <div className="card-grid">
              {alumni.map((member) => (
                <Link key={member.id} href={`/alumni/${member.id}`}>
                  <AlumniCard alumni={member} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
