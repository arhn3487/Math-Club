'use client'

import { useEffect, useState } from 'react'
import { Loading, Error, Button } from '@/components/ui/BaseComponents'
import { AchievementCard } from '@/components/cards/FeatureCards'
import { Achievement } from '@/types'
import Link from 'next/link'

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAchievements()
  }, [])

  const fetchAchievements = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/achievements')
      if (!response.ok) throw new Error('Failed to fetch achievements')
      const data = await response.json()
      setAchievements(data)
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
          <h1 className="page-title">Achievements</h1>
          <p className="page-subtitle">Celebrate our milestones and victories</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          {loading && <Loading message="Loading achievements..." />}
          {error && <Error message={error} onRetry={fetchAchievements} />}

          {!loading && !error && achievements.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">No achievements yet</p>
              <Link href="/">
                <Button>Back to Home</Button>
              </Link>
            </div>
          )}

          {!loading && !error && achievements.length > 0 && (
            <div className="card-grid">
              {achievements.map((achievement) => (
                <Link key={achievement.id} href={`/achievements/${achievement.id}`}>
                  <AchievementCard achievement={achievement} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
