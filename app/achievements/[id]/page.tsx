'use client'

import { useParams } from 'next/navigation'
import { useFetchById } from '@/hooks/useFetch'
import { Achievement } from '@/types'
import { Loading, Error, Button, Card } from '@/components/ui/BaseComponents'
import Link from 'next/link'

export default function AchievementDetailPage() {
  const params = useParams()
  const achievementId = params?.id as string
  const { data: achievement, loading, error } = useFetchById<Achievement>(
    '/api/achievements',
    achievementId
  )

  return (
    <div className="w-full">
      {loading && <Loading message="Loading achievement details..." />}
      {error && <Error message={error} />}

      {achievement && (
        <>
          <section className="page-header">
            <div className="container">
              <h1 className="page-title">{achievement.title || 'Achievement'}</h1>
              <p className="page-subtitle">
                {achievement.date ? new Date(achievement.date).toLocaleDateString() : 'Recent'}
              </p>
            </div>
          </section>

          <section className="py-12">
            <div className="container">
              {achievement.image && (
                <img
                  src={achievement.image}
                  alt={achievement.title}
                  className="w-full max-h-96 object-cover rounded-lg mb-8"
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <Card>
                  <p className="text-gray-600 text-sm mb-2">Achievement ID</p>
                  <p className="text-lg font-mono truncate">{achievement.id}</p>
                </Card>
                <Card>
                  <p className="text-gray-600 text-sm mb-2">Date</p>
                  <p className="text-lg">
                    {achievement.date
                      ? new Date(achievement.date).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </Card>
                <Card>
                  <p className="text-gray-600 text-sm mb-2">Created</p>
                  <p className="text-lg">
                    {new Date(achievement.created_at).toLocaleDateString()}
                  </p>
                </Card>
              </div>

              {achievement.intro && (
                <Card className="mb-8 bg-blue-50">
                  <h2 className="text-2xl font-bold mb-4">Introduction</h2>
                  <p className="text-lg text-gray-700">{achievement.intro}</p>
                </Card>
              )}

              {achievement.description && (
                <Card className="mb-8">
                  <h2 className="text-2xl font-bold mb-4">Details</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {achievement.description}
                  </p>
                </Card>
              )}

              <div className="flex gap-4">
                <Link href="/achievements">
                  <Button>Back to Achievements</Button>
                </Link>
                <Link href="/">
                  <Button variant="secondary">Home</Button>
                </Link>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
