'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Exam {
  id: number
  exam_name: string
  description: string
  total_marks: number
  duration_minutes: number
  is_active: boolean
}

interface ExamResult {
  id: number
  exam_id: number
  exam_name: string
  total_marks_obtained: number
  total_marks: number
  percentage: number
  completed_at: string
}

export default function ExamsPage() {
  const router = useRouter()
  const [exams, setExams] = useState<Exam[]>([])
  const [results, setResults] = useState<ExamResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'available' | 'results'>('available')
  const completedResultsByExamId = new Map(results.map((result) => [result.exam_id, result]))

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const userType = localStorage.getItem('user_type')

    if (!token || (userType !== 'student' && userType !== 'superuser')) {
      router.push('/login')
      return
    }

    fetchExamsAndResults()
  }, [router])

  const fetchExamsAndResults = async () => {
    try {
      setLoading(true)
      const [examsRes, resultsRes] = await Promise.all([
        fetch('/api/exams', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }),
        fetch('/api/exams/results', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }),
      ])

      if (examsRes.ok) {
        const examsData = await examsRes.json()
        setExams(examsData.exams)
      }

      if (resultsRes.ok) {
        const resultsData = await resultsRes.json()
        setResults(resultsData.results)
      }
    } catch (err) {
      setError('Failed to load exams')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exams...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Exams</h1>
          <p className="text-gray-600 mt-2">Take exams and view your results</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="tabs-shell">
          <div className="tabs-track grid-cols-2">
          <button
            onClick={() => setActiveTab('available')}
            className={`tab-button ${activeTab === 'available' ? 'tab-button-active' : ''}`}
          >
            Available Exams
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`tab-button ${activeTab === 'results' ? 'tab-button-active' : ''}`}
          >
            My Results
          </button>
          </div>
        </div>

        {/* Available Exams */}
        {activeTab === 'available' && (
          <div className="grid gap-6">
            {exams.length > 0 ? (
              exams.map((exam) => (
                <div key={exam.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                  {completedResultsByExamId.has(exam.id) && (
                    <div className="mb-4 inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                      Completed
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">{exam.exam_name}</h3>
                      <p className="text-gray-600 mt-2">{exam.description}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-4 ${
                        exam.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {exam.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm">
                    <div className="bg-blue-50 p-3 rounded">
                      <div className="text-gray-600">Total Marks</div>
                      <div className="text-2xl font-bold text-blue-600">{exam.total_marks}</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded">
                      <div className="text-gray-600">Duration</div>
                      <div className="text-2xl font-bold text-green-600">{exam.duration_minutes} min</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded">
                      <div className="text-gray-600">Questions</div>
                      <div className="text-2xl font-bold text-purple-600">MCQ</div>
                    </div>
                  </div>

                    {completedResultsByExamId.has(exam.id) ? (
                      <Link href={`/exams/results/${completedResultsByExamId.get(exam.id)?.id}`}>
                        <button className="w-full px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium">
                          View Paper
                        </button>
                      </Link>
                    ) : (
                      <Link href={`/exams/${exam.id}`}>
                        <button className="w-full px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
                          Start Exam
                        </button>
                      </Link>
                    )}
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-gray-600 mb-4">No exams available at the moment.</p>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {activeTab === 'results' && (
          <div className="grid gap-6">
            {results.length > 0 ? (
              results.map((result) => {
                const isPassed = result.percentage >= 40
                return (
                  <div key={result.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900">{result.exam_name}</h3>
                        <p className="text-gray-600 text-sm mt-1">
                          Completed on {new Date(result.completed_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-bold ${
                          isPassed
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {isPassed ? 'Passed' : 'Failed'}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded">
                        <div className="text-gray-600 text-sm">Score</div>
                        <div className="text-3xl font-bold text-blue-600">
                          {result.total_marks_obtained}/{result.total_marks}
                        </div>
                      </div>
                      <div className="bg-green-50 p-4 rounded">
                        <div className="text-gray-600 text-sm">Percentage</div>
                        <div className="text-3xl font-bold text-green-600">{result.percentage.toFixed(2)}%</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded">
                        <div className="text-gray-600 text-sm">Status</div>
                        <div className={`text-lg font-bold ${isPassed ? 'text-purple-600' : 'text-red-600'}`}>
                          {isPassed ? '✓ Passed' : '✗ Failed'}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Link href={`/exams/results/${result.id}`}>
                        <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium">
                          View Paper
                        </button>
                      </Link>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-gray-600 mb-4">You haven't completed any exams yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
