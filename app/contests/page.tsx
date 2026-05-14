'use client'

import { useEffect, useState } from 'react'
import { Loading, Error, Button } from '@/components/ui/BaseComponents'
import { ContestCard } from '@/components/cards/FeatureCards'
import { CustomContest } from '@/types'
import Link from 'next/link'

export default function ContestsPage() {
  const [contests, setContests] = useState<CustomContest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchContests()
  }, [])

  const fetchContests = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/contests')
      if (!response.ok) throw new Error('Failed to fetch contests')
      const data = await response.json()
      setContests(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getContestStatus = (contest: CustomContest) => {
    const now = new Date()
    const start = new Date(contest.start_time)
    const end = new Date(contest.end_time)

    if (now < start) return 'upcoming'
    if (now > end) return 'completed'
    return 'active'
  }

  return (
    <div className="w-full">
      <section className="page-header">
        <div className="container">
          <h1 className="page-title">Contests</h1>
          <p className="page-subtitle">Participate in our programming contests</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          {loading && <Loading message="Loading contests..." />}
          {error && <Error message={error} onRetry={fetchContests} />}

          {!loading && !error && contests.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">No contests scheduled</p>
              <Link href="/">
                <Button>Back to Home</Button>
              </Link>
            </div>
          )}

          {!loading && !error && contests.length > 0 && (
            <div className="card-grid">
              {contests.map((contest) => (
                <Link key={contest.id} href={`/contests/${contest.id}`}>
                  <ContestCard
                    title={contest.name}
                    status={getContestStatus(contest)}
                    startTime={contest.start_time}
                    endTime={contest.end_time}
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
