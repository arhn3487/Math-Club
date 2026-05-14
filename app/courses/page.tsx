'use client'

import { useEffect, useState } from 'react'
import { Loading, Error, Button } from '@/components/ui/BaseComponents'
import { CourseCard } from '@/components/cards/FeatureCards'
import { Course } from '@/types'
import Link from 'next/link'

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/courses')
      if (!response.ok) throw new Error('Failed to fetch courses')
      const data = await response.json()
      setCourses(data)
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
          <h1 className="page-title">Courses</h1>
          <p className="page-subtitle">Master competitive programming concepts</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          {loading && <Loading message="Loading courses..." />}
          {error && <Error message={error} onRetry={fetchCourses} />}

          {!loading && !error && courses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">No courses available yet</p>
              <Link href="/">
                <Button>Back to Home</Button>
              </Link>
            </div>
          )}

          {!loading && !error && courses.length > 0 && (
            <div className="card-grid">
              {courses.map((course) => (
                <div key={course.id}>
                  <Link href={`/courses/${course.id}`}>
                    <CourseCard course={course} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
