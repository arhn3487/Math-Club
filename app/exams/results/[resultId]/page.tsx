'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface PaperQuestion {
  question_id: number
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: string
  marks_per_question: number
  selected_answer: string
  is_correct: boolean
}

interface PaperResponse {
  result: {
    id: number
    exam_id: number
    user_id: string
    total_questions: number
    correct_answers: number
    total_marks_obtained: number
    total_marks: number
    percentage: number
    started_at: string
    completed_at: string
  }
  exam: {
    exam_name: string
    description: string
    duration_minutes: number
    total_marks: number
  }
  student: {
    full_name: string
    student_id?: string
    user_type?: string
  }
  paper: PaperQuestion[]
}

export default function ExamPaperPage() {
  const router = useRouter()
  const params = useParams()
  const resultId = params.resultId as string

  const [paper, setPaper] = useState<PaperResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      router.push('/login')
      return
    }

    fetchPaper()
  }, [router, resultId])

  const fetchPaper = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/exams/results/${resultId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch exam paper')
      }

      const data = await response.json()
      setPaper(data)
    } catch (err) {
      setError('Failed to load exam paper')
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
          <p className="text-gray-600">Loading exam paper...</p>
        </div>
      </div>
    )
  }

  if (!paper) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <p className="text-red-600 mb-4">{error || 'Exam paper not found'}</p>
          <Link href="/exams">
            <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Back to Exams
            </button>
          </Link>
        </div>
      </div>
    )
  }

  const percentage = paper.result.percentage.toFixed(2)
  const isPassed = paper.result.percentage >= 40

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Exam Paper Review</p>
            <h1 className="text-3xl font-bold text-gray-900 mt-2">{paper.exam.exam_name}</h1>
            <p className="text-gray-600 mt-2">
              {paper.student.full_name}
              {paper.student.student_id ? ` • ${paper.student.student_id}` : ''}
            </p>
          </div>
          <Link href="/exams">
            <button className="px-5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
              Back
            </button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500">Score</div>
            <div className="mt-2 text-2xl font-bold text-indigo-600">
              {paper.result.total_marks_obtained}/{paper.result.total_marks}
            </div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500">Percentage</div>
            <div className={`mt-2 text-2xl font-bold ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
              {percentage}%
            </div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500">Correct</div>
            <div className="mt-2 text-2xl font-bold text-gray-900">
              {paper.result.correct_answers}/{paper.result.total_questions}
            </div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500">Status</div>
            <div className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${isPassed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {isPassed ? 'Passed' : 'Failed'}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {paper.paper.map((question, index) => {
            const selectedLabel = question.selected_answer || 'Not answered'

            return (
              <div key={question.question_id} className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">
                      Question {index + 1}
                    </div>
                    <h2 className="mt-2 text-lg font-bold text-gray-900">{question.question_text}</h2>
                  </div>
                  <div className="text-sm font-semibold text-gray-600">
                    Marks: {question.marks_per_question}
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    ['A', question.option_a],
                    ['B', question.option_b],
                    ['C', question.option_c],
                    ['D', question.option_d],
                  ].map(([optionKey, optionText]) => {
                    const isSelected = question.selected_answer === optionKey
                    const isCorrect = question.correct_answer === optionKey

                    return (
                      <div
                        key={optionKey}
                        className={`rounded-xl border p-4 text-sm ${
                          isCorrect
                            ? 'border-green-300 bg-green-50'
                            : isSelected
                              ? 'border-indigo-300 bg-indigo-50'
                              : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="font-semibold text-gray-900">{optionKey}.</div>
                        <div className="mt-1 text-gray-700">{optionText}</div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3 text-sm">
                  <div className="rounded-xl bg-gray-50 p-4">
                    <div className="text-gray-500">Student answer</div>
                    <div className="mt-1 font-semibold text-gray-900">{selectedLabel}</div>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-4">
                    <div className="text-gray-500">Correct answer</div>
                    <div className="mt-1 font-semibold text-gray-900">{question.correct_answer}</div>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-4">
                    <div className="text-gray-500">Result</div>
                    <div className={`mt-1 font-semibold ${question.is_correct ? 'text-green-600' : 'text-red-600'}`}>
                      {question.is_correct ? 'Correct' : 'Wrong'}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}