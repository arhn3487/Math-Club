'use client'

import { useParams } from 'next/navigation'
import { useFetchById } from '@/hooks/useFetch'
import { Batch, Course } from '@/types'
import { Loading, Error, Button, Card } from '@/components/ui/BaseComponents'
import { CourseCard } from '@/components/cards/FeatureCards'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function BatchDetailPage() {
  const params = useParams()
  const batchId = params?.id as string
  const { data: batch, loading: batchLoading, error: batchError } = useFetchById<Batch>(
    '/api/batches',
    batchId
  )

  const [courses, setCourses] = useState<Course[]>([])
  const [coursesLoading, setCoursesLoading] = useState(false)

  useEffect(() => {
    if (batchId && !batchLoading && batch) {
      fetchBatchCourses()
    }
  }, [batchId, batch, batchLoading])

  const fetchBatchCourses = async () => {
    try {
      setCoursesLoading(true)
      const response = await fetch(`/api/courses?batchId=${batchId}`)
      if (response.ok) {
        const data = await response.json()
        setCourses(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    } finally {
      setCoursesLoading(false)
    }
  }

  return (
    <div className="w-full">
      {batchLoading && <Loading message="Loading batch details..." />}
      {batchError && <Error message={batchError} />}

      {batch && (
        <>
          <section className="page-header">
            <div className="container">
              <h1 className="page-title">{batch.name || 'Batch'}</h1>
              <p className="page-subtitle">
                Created: {new Date(batch.created_at).toLocaleDateString()}
              </p>
            </div>
          </section>

          <section className="py-12">
            <div className="container">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <Card>
                  <p className="text-gray-600 text-sm mb-2">Batch ID</p>
                  <p className="text-lg font-mono truncate">{batch.id}</p>
                </Card>
                <Card>
                  <p className="text-gray-600 text-sm mb-2">Created At</p>
                  <p className="text-lg">
                    {new Date(batch.created_at).toLocaleDateString()}
                  </p>
                </Card>
                <Card>
                  <p className="text-gray-600 text-sm mb-2">Status</p>
                  <p className="text-lg font-bold text-green-600">Active</p>
                </Card>
              </div>

              <h2 className="text-3xl font-bold mb-6">Courses</h2>
              {coursesLoading && <Loading message="Loading courses..." />}

              {!coursesLoading && courses.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-4">No courses in this batch yet</p>
                  <Link href="/courses">
                    <Button>View All Courses</Button>
                  </Link>
                </div>
              )}

              {!coursesLoading && courses.length > 0 && (
                <div className="card-grid">
                  {courses.map((course) => (
                    <Link key={course.id} href={`/courses/${course.id}`}>
                      <CourseCard course={course} />
                    </Link>
                  ))}
                </div>
              )}

              <div className="mt-12 flex gap-4">
                <Link href="/batches">
                  <Button>Back to Batches</Button>
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
