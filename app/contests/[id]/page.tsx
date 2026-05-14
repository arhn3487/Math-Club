'use client'

import { useParams } from 'next/navigation'
import { useFetchById } from '@/hooks/useFetch'
import { CustomContest } from '@/types'
import { Loading, Error, Button, Card, Badge } from '@/components/ui/BaseComponents'
import Link from 'next/link'

export default function ContestDetailPage() {
  const params = useParams()
  const contestId = params?.id as string
  const { data: contest, loading, error } = useFetchById<CustomContest>(
    '/api/contests',
    contestId
  )

  const getContestStatus = (c: CustomContest) => {
    const now = new Date()
    const start = new Date(c.start_time)
    const end = new Date(c.end_time)
    if (now < start) return 'upcoming'
    if (now > end) return 'completed'
    return 'active'
  }

  return (
    <div className="w-full">
      {loading && <Loading message="Loading contest details..." />}
      {error && <Error message={error} />}

      {contest && (
        <>
          <section className="page-header">
            <div className="container">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="page-title">{contest.name}</h1>
                  <p className="page-subtitle">{contest.description}</p>
                </div>
                <Badge
                  variant={
                    getContestStatus(contest) === 'active'
                      ? 'success'
                      : getContestStatus(contest) === 'upcoming'
                        ? 'warning'
                        : 'danger'
                  }
                >
                  {getContestStatus(contest).toUpperCase()}
                </Badge>
              </div>
            </div>
          </section>

          <section className="py-12">
            <div className="container">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <Card>
                  <p className="text-gray-600 text-sm mb-2">Platform</p>
                  <p className="text-lg font-bold">{contest.platform || 'N/A'}</p>
                </Card>
                <Card>
                  <p className="text-gray-600 text-sm mb-2">Start Time</p>
                  <p className="text-lg">
                    {new Date(contest.start_time).toLocaleString()}
                  </p>
                </Card>
                <Card>
                  <p className="text-gray-600 text-sm mb-2">End Time</p>
                  <p className="text-lg">
                    {new Date(contest.end_time).toLocaleString()}
                  </p>
                </Card>
                <Card>
                  <p className="text-gray-600 text-sm mb-2">Status</p>
                  <p className="text-lg font-bold text-green-600">
                    {contest.is_active ? 'Active' : 'Inactive'}
                  </p>
                </Card>
              </div>

              {contest.link && (
                <Card className="mb-12 bg-blue-50">
                  <h2 className="text-xl font-bold mb-4">Join Contest</h2>
                  <a
                    href={contest.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {contest.link}
                  </a>
                  <div className="mt-4">
                    <Link href={contest.link}>
                      <Button>Open Contest</Button>
                    </Link>
                  </div>
                </Card>
              )}

              {contest.description && (
                <Card className="mb-12">
                  <h2 className="text-xl font-bold mb-4">Description</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {contest.description}
                  </p>
                </Card>
              )}

              <div className="flex gap-4">
                <Link href="/contests">
                  <Button>Back to Contests</Button>
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
