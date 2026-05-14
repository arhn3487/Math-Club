'use client'

import { useParams } from 'next/navigation'
import { useFetchById } from '@/hooks/useFetch'
import { Course, CourseContent } from '@/types'
import { Loading, Error, Button, Card } from '@/components/ui/BaseComponents'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function CourseDetailPage() {
  const params = useParams()
  const courseId = params?.id as string
  const { data: course, loading: courseLoading, error: courseError } = useFetchById<Course>(
    '/api/courses',
    courseId
  )

  const [contents, setContents] = useState<CourseContent[]>([])
  const [contentsLoading, setContentsLoading] = useState(false)

  useEffect(() => {
    if (courseId && !courseLoading && course) {
      fetchCourseContents()
    }
  }, [courseId, course, courseLoading])

  const fetchCourseContents = async () => {
    try {
      setContentsLoading(true)
      const response = await fetch(`/api/courses?courseId=${courseId}`)
      if (response.ok) {
        const data = await response.json()
        setContents(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Failed to fetch contents:', error)
    } finally {
      setContentsLoading(false)
    }
  }

  return (
    <div className="w-full">
      {courseLoading && <Loading message="Loading course details..." />}
      {courseError && <Error message={courseError} />}

      {course && (
        <>
          <section className="page-header">
            <div className="container">
              <h1 className="page-title">{course.title || 'Course'}</h1>
              <p className="page-subtitle">
                {course.description || 'Course description'}
              </p>
            </div>
          </section>

          <section className="py-12">
            <div className="container">
              {course.image && (
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-96 object-cover rounded-lg mb-8"
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <Card>
                  <p className="text-gray-600 text-sm mb-2">Course ID</p>
                  <p className="text-lg font-mono truncate">{course.id}</p>
                </Card>
                <Card>
                  <p className="text-gray-600 text-sm mb-2">Created At</p>
                  <p className="text-lg">
                    {new Date(course.created_at).toLocaleDateString()}
                  </p>
                </Card>
                <Card>
                  <p className="text-gray-600 text-sm mb-2">Status</p>
                  <p className="text-lg font-bold text-green-600">Active</p>
                </Card>
              </div>

              <h2 className="text-3xl font-bold mb-6">Course Content</h2>
              {contentsLoading && <Loading message="Loading contents..." />}

              {!contentsLoading && contents.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">No content available yet</p>
                </div>
              )}

              {!contentsLoading && contents.length > 0 && (
                <div className="space-y-4">
                  {contents.map((content) => (
                    <Card key={content.id}>
                      <h3 className="text-lg font-bold mb-2">{content.name}</h3>
                      {content.problem_link && (
                        <a
                          href={content.problem_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm mb-2 block"
                        >
                          📋 Problem Link
                        </a>
                      )}
                      {content.video_link && (
                        <a
                          href={content.video_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm mb-2 block"
                        >
                          🎥 Video Tutorial
                        </a>
                      )}
                      {content.code && (
                        <div className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
                          <code>{content.code}</code>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}

              <div className="mt-12 flex gap-4">
                <Link href="/courses">
                  <Button>Back to Courses</Button>
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
