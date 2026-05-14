'use client'

import { useEffect, useState } from 'react'
import { Card, Loading, Error, Button, Badge } from '@/components/ui/BaseComponents'
import Link from 'next/link'

interface DashboardStats {
  totalUsers: number
  totalBatches: number
  totalCourses: number
  totalContests: number
  totalAchievements: number
  totalAlumni: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [users, batches, courses, contests, achievements, alumni] =
        await Promise.all([
          fetch('/api/users').then((r) => r.json()),
          fetch('/api/batches').then((r) => r.json()),
          fetch('/api/courses').then((r) => r.json()),
          fetch('/api/contests').then((r) => r.json()),
          fetch('/api/achievements').then((r) => r.json()),
          fetch('/api/alumni').then((r) => r.json()),
        ])

      setStats({
        totalUsers: Array.isArray(users) ? users.length : 0,
        totalBatches: Array.isArray(batches) ? batches.length : 0,
        totalCourses: Array.isArray(courses) ? courses.length : 0,
        totalContests: Array.isArray(contests) ? contests.length : 0,
        totalAchievements: Array.isArray(achievements) ? achievements.length : 0,
        totalAlumni: Array.isArray(alumni) ? alumni.length : 0,
      })
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const dashboardItems = [
    {
      label: 'Users',
      value: stats?.totalUsers || 0,
      href: '/users',
      color: 'bg-blue-100',
    },
    {
      label: 'Batches',
      value: stats?.totalBatches || 0,
      href: '/batches',
      color: 'bg-green-100',
    },
    {
      label: 'Courses',
      value: stats?.totalCourses || 0,
      href: '/courses',
      color: 'bg-purple-100',
    },
    {
      label: 'Contests',
      value: stats?.totalContests || 0,
      href: '/contests',
      color: 'bg-orange-100',
    },
    {
      label: 'Achievements',
      value: stats?.totalAchievements || 0,
      href: '/achievements',
      color: 'bg-pink-100',
    },
    {
      label: 'Alumni',
      value: stats?.totalAlumni || 0,
      href: '/alumni',
      color: 'bg-yellow-100',
    },
  ]

  return (
    <div className="w-full">
      <section className="page-header">
        <div className="container">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Club overview and statistics</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          {loading && <Loading message="Loading dashboard..." />}
          {error && <Error message={error} onRetry={fetchDashboardData} />}

          {!loading && !error && stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Card className={`cursor-pointer hover:shadow-lg transition-shadow ${item.color}`}>
                    <p className="text-gray-600 text-sm mb-2">{item.label}</p>
                    <p className="text-4xl font-bold text-blue-600">
                      {item.value}
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      View all →
                    </p>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {!loading && !error && stats && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link href="/batches">
                  <Button fullWidth className="py-3">
                    View Batches
                  </Button>
                </Link>
                <Link href="/courses">
                  <Button fullWidth className="py-3">
                    View Courses
                  </Button>
                </Link>
                <Link href="/contests">
                  <Button fullWidth className="py-3">
                    View Contests
                  </Button>
                </Link>
                <Link href="/achievements">
                  <Button fullWidth className="py-3">
                    View Achievements
                  </Button>
                </Link>
                <Link href="/alumni">
                  <Button fullWidth className="py-3">
                    View Alumni
                  </Button>
                </Link>
                <Link href="/">
                  <Button fullWidth variant="secondary" className="py-3">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
