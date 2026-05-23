'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface ExamResult {
  id: number
  user_id: string
  full_name: string
  student_id?: string
  total_questions: number
  correct_answers: number
  total_marks_obtained: number
  total_marks: number
  percentage: number
  completed_at: string
}

export default function AdminExamResultsPage() {
  const router = useRouter()
  const params = useParams()
  const examId = params.id as string

  const [results, setResults] = useState<ExamResult[]>([])
  const [examName, setExamName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'percentage' | 'name'>('percentage')

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const userType = localStorage.getItem('user_type')

    if (!token || userType !== 'admin') {
      router.push('/login')
      return
    }

    fetchResults()
  }, [router, examId, sortBy])

  const fetchResults = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/exams/${examId}/results?sortBy=${sortBy}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch results')
      }

      const data = await response.json()
      setResults(data.results)
      setExamName(data.examName)
    } catch (err) {
      setError('Failed to load results')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredResults = results.filter((result) =>
    result.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (result.student_id && result.student_id.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const stats = {
    total: results.length,
    passed: results.filter((r) => r.percentage >= 40).length,
    avgPercentage: results.length > 0 ? (results.reduce((sum, r) => sum + r.percentage, 0) / results.length).toFixed(2) : 0,
    maxScore: results.length > 0 ? Math.max(...results.map((r) => r.percentage)) : 0,
    minScore: results.length > 0 ? Math.min(...results.map((r) => r.percentage)) : 0,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/admin/exams" className="flex items-center gap-3">
            <img 
              src="https://zxkeolkojkoenkszekiy.supabase.co/storage/v1/object/public/math-club-images/Math%20Club%20Logo/math%20club%20logo.png" 
              alt="Math Club Logo" 
              className="h-10 w-auto object-contain"
            />
            <span className="text-2xl font-bold text-indigo-600">Math Club</span>
          </Link>
          <button
            onClick={() => {
              localStorage.removeItem('auth_token')
              localStorage.removeItem('user_type')
              localStorage.removeItem('user_id')
              router.push('/')
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/exams">
            <button className="text-indigo-600 hover:text-indigo-700 font-medium">← Back</button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{examName}</h1>
            <p className="text-gray-600 mt-2">Exam Results & Analytics</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium">Total Attempts</div>
            <div className="text-3xl font-bold text-indigo-600 mt-2">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium">Passed (≥40%)</div>
            <div className="text-3xl font-bold text-green-600 mt-2">{stats.passed}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium">Average %</div>
            <div className="text-3xl font-bold text-blue-600 mt-2">{stats.avgPercentage}%</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium">Highest %</div>
            <div className="text-3xl font-bold text-purple-600 mt-2">{stats.maxScore.toFixed(2)}%</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium">Lowest %</div>
            <div className="text-3xl font-bold text-orange-600 mt-2">{stats.minScore.toFixed(2)}%</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex gap-4 flex-col md:flex-row">
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, user ID, or student ID..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'percentage' | 'name')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="percentage">Sort by Percentage (Desc)</option>
                <option value="name">Sort by Name (Asc)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Rank</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Student Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Student ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">User ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Correct</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Score</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Percentage</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredResults.length > 0 ? (
                  filteredResults.map((result, index) => {
                    const isPassed = result.percentage >= 40
                    return (
                      <tr key={result.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">{index + 1}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{result.full_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{result.student_id || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{result.user_id}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                          {result.correct_answers}/{result.total_questions}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                          {result.total_marks_obtained}/{result.total_marks}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold">
                          <span className={isPassed ? 'text-green-600' : 'text-red-600'}>
                            {result.percentage.toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium text-white ${
                              isPassed ? 'bg-green-600' : 'bg-red-600'
                            }`}
                          >
                            {isPassed ? 'Passed' : 'Failed'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(result.completed_at).toLocaleDateString()}
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                      No results found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-gray-50 border-t text-sm text-gray-600">
            Showing {filteredResults.length} of {results.length} results
          </div>
        </div>
      </div>
    </div>
  )
}
