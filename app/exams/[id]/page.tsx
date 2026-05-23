'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface Question {
  id: number
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  marks_per_question: number
}

interface Exam {
  id: number
  exam_name: string
  description: string
  total_marks: number
  duration_minutes: number
}

export default function TakeExamPage() {
  const router = useRouter()
  const params = useParams()
  const examId = params.id as string

  const [exam, setExam] = useState<Exam | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<Record<number, string>>({})
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [resultId, setResultId] = useState<number | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const userType = localStorage.getItem('user_type')

    if (!token || userType !== 'student') {
      router.push('/login')
      return
    }

    fetchExamData()
  }, [router, examId])

  useEffect(() => {
    if (!timeRemaining || submitted) return

    const timer = setTimeout(() => {
      setTimeRemaining(timeRemaining - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [timeRemaining, submitted])

  // Auto-submit if time runs out
  useEffect(() => {
    if (timeRemaining === 0 && exam && !submitted) {
      handleSubmit()
    }
  }, [timeRemaining, exam, submitted])

  const fetchExamData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/exams/${examId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      })

      if (response.status === 409) {
        const data = await response.json()
        setResultId(data.resultId || null)
        setError(data.message || 'You have already completed this exam.')
        return
      }

      if (!response.ok) {
        throw new Error('Failed to fetch exam')
      }

      const data = await response.json()
      setExam(data.exam)
      
      // Shuffle questions for this student
      const shuffled = data.questions.sort(() => Math.random() - 0.5)
      setQuestions(shuffled)
      setTimeRemaining(data.exam.duration_minutes * 60)
    } catch (err) {
      setError('Failed to load exam')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAnswer = (questionId: number, answer: string) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmit = async () => {
    if (submitted) return

    try {
      const response = await fetch(`/api/exams/${examId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ responses }),
      })

      if (!response.ok) {
        if (response.status === 409) {
          const data = await response.json()
          setResultId(data.resultId || null)
          setSubmitted(true)
          return
        }

        throw new Error('Failed to submit exam')
      }

      const data = await response.json()
      setResultId(data.resultId || null)
      setSubmitted(true)
    } catch (err) {
      setError('Failed to submit exam')
      console.error(err)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exam...</p>
        </div>
      </div>
    )
  }

  if (!exam) {
    if (resultId) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
            <div className="text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Exam already submitted</h2>
            <p className="text-gray-600 mb-6">
              You have already completed this exam. You can review your paper below.
            </p>
            <div className="space-y-3">
              <Link href={`/exams/results/${resultId}`}>
                <button className="w-full px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  View Paper
                </button>
              </Link>
              <Link href="/exams">
                <button className="w-full px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Back to Exams
                </button>
              </Link>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Exam not found</p>
          <Link href="/exams">
            <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Back to Exams
            </button>
          </Link>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
          <div className="text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Exam Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your exam has been submitted successfully. Check your results in the results section.
          </p>
          {resultId && (
            <Link href={`/exams/results/${resultId}`}>
              <button className="w-full px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 mb-3">
                View Paper
              </button>
            </Link>
          )}
          <Link href="/exams">
            <button className="w-full px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Back to Exams
            </button>
          </Link>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const answered = Object.keys(responses).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Timer */}
      <div className="bg-indigo-600 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold">{exam.exam_name}</h1>
            </div>
            <div className={`text-3xl font-bold ${timeRemaining < 300 ? 'text-red-300' : ''}`}>
              {formatTime(timeRemaining)}
            </div>
          </div>
          <div className="w-full bg-indigo-400 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all"
              style={{
                width: `${((exam.duration_minutes * 60 - timeRemaining) / (exam.duration_minutes * 60)) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Question Area */}
          <div className="lg:col-span-3">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
                {error}
              </div>
            )}

            <div className="bg-white rounded-lg shadow p-8">
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </h2>
                <h3 className="text-2xl font-bold text-gray-900">{currentQuestion.question_text}</h3>
                <p className="text-gray-600 mt-2">Marks: {currentQuestion.marks_per_question}</p>
              </div>

              {/* Options */}
              <div className="space-y-3 mb-8">
                {['A', 'B', 'C', 'D'].map((option) => (
                  <label
                    key={option}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                      responses[currentQuestion.id] === option
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="answer"
                      value={option}
                      checked={responses[currentQuestion.id] === option}
                      onChange={(e) => handleSelectAnswer(currentQuestion.id, e.target.value)}
                      className="mr-4"
                    />
                    <span className="text-gray-900">
                      <strong>{option}:</strong> {currentQuestion[`option_${option.toLowerCase()}` as keyof Question]}
                    </span>
                  </label>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>

                {currentQuestionIndex === questions.length - 1 ? (
                  <button
                    onClick={handleSubmit}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                  >
                    Submit Exam
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Next →
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Question Navigator */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h3 className="font-bold text-gray-900 mb-4">Questions ({answered}/{questions.length})</h3>
              <div className="grid grid-cols-4 gap-2">
                {questions.map((q, index) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`aspect-square rounded font-bold text-sm transition ${
                      index === currentQuestionIndex
                        ? 'bg-indigo-600 text-white'
                        : responses[q.id]
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-600 rounded"></div>
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    <span>Not Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-indigo-600 rounded"></div>
                    <span>Current</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
