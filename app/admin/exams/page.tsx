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
  created_by: string
  is_active: boolean
  created_at: string
}

interface Question {
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: 'A' | 'B' | 'C' | 'D'
  marks_per_question: number
}

export default function AdminExamsPage() {
  const router = useRouter()
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    exam_name: '',
    description: '',
    total_marks: 100,
    duration_minutes: 60,
  })
  const [questions, setQuestions] = useState<Question[]>([
    {
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'A',
      marks_per_question: 1,
    },
  ])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const userType = localStorage.getItem('user_type')

    if (!token || userType !== 'admin') {
      router.push('/login')
      return
    }

    fetchExams()
  }, [router])

  const fetchExams = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/exams', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch exams')
      }

      const data = await response.json()
      setExams(data.exams)
    } catch (err) {
      setError('Failed to load exams')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'total_marks' || name === 'duration_minutes' ? parseInt(value) : value,
    }))
  }

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const newQuestions = [...questions]
    ;(newQuestions[index] as any)[field] = value
    setQuestions(newQuestions)
  }

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: 'A',
        marks_per_question: 1,
      },
    ])
  }

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.exam_name.trim()) {
      setError('Exam name is required')
      return
    }

    if (questions.some((q) => !q.question_text.trim() || !q.option_a.trim() || !q.option_b.trim() || !q.option_c.trim() || !q.option_d.trim())) {
      setError('All questions and options must be filled')
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch('/api/admin/exams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          ...formData,
          questions,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to create exam')
      }

      // Reset form
      setFormData({
        exam_name: '',
        description: '',
        total_marks: 100,
        duration_minutes: 60,
      })
      setQuestions([
        {
          question_text: '',
          option_a: '',
          option_b: '',
          option_c: '',
          option_d: '',
          correct_answer: 'A',
          marks_per_question: 1,
        },
      ])
      setShowCreateForm(false)

      // Refresh exams
      fetchExams()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create exam')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteExam = async (examId: number) => {
    if (confirm('Are you sure you want to delete this exam?')) {
      try {
        const response = await fetch(`/api/admin/exams/${examId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to delete exam')
        }

        setExams(exams.filter((e) => e.id !== examId))
      } catch (err) {
        setError('Failed to delete exam')
        console.error(err)
      }
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
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard">
            <div className="text-2xl font-bold text-indigo-600 cursor-pointer">Math Club</div>
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Exam Management</h1>
            <p className="text-gray-600 mt-2">Create and manage exams for students</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            {showCreateForm ? 'Cancel' : '+ Create Exam'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow mb-8 p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Create New Exam</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Exam Details */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Exam Name *</label>
                  <input
                    type="text"
                    name="exam_name"
                    value={formData.exam_name}
                    onChange={handleFormChange}
                    placeholder="e.g., Competitive Programming Basics"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Marks *</label>
                  <input
                    type="number"
                    name="total_marks"
                    value={formData.total_marks}
                    onChange={handleFormChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes) *</label>
                  <input
                    type="number"
                    name="duration_minutes"
                    value={formData.duration_minutes}
                    onChange={handleFormChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Exam description..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Questions */}
              <div className="border-t pt-6">
                <h3 className="text-xl font-bold mb-4 text-gray-900">Questions</h3>
                <div className="space-y-6">
                  {questions.map((question, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-gray-900">Question {index + 1}</h4>
                        {questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeQuestion(index)}
                            className="text-red-600 hover:text-red-900 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Question Text *</label>
                          <textarea
                            value={question.question_text}
                            onChange={(e) => handleQuestionChange(index, 'question_text', e.target.value)}
                            placeholder="Enter question..."
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            required
                          />
                        </div>

                        <div className="grid md:grid-cols-2 gap-3">
                          {['A', 'B', 'C', 'D'].map((option) => (
                            <div key={option}>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Option {option} *</label>
                              <input
                                type="text"
                                value={question[`option_${option.toLowerCase()}` as keyof Question]}
                                onChange={(e) => handleQuestionChange(index, `option_${option.toLowerCase()}`, e.target.value)}
                                placeholder={`Option ${option}...`}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                required
                              />
                            </div>
                          ))}
                        </div>

                        <div className="grid md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer *</label>
                            <select
                              value={question.correct_answer}
                              onChange={(e) => handleQuestionChange(index, 'correct_answer', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                              required
                            >
                              {['A', 'B', 'C', 'D'].map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Marks *</label>
                            <input
                              type="number"
                              value={question.marks_per_question}
                              onChange={(e) => handleQuestionChange(index, 'marks_per_question', parseInt(e.target.value))}
                              min="1"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addQuestion}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  + Add Question
                </button>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Exam'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Exams List */}
        <div className="grid gap-6">
          {exams.length > 0 ? (
            exams.map((exam) => (
              <div key={exam.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{exam.exam_name}</h3>
                    <p className="text-gray-600 text-sm mt-1">{exam.description}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      exam.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {exam.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div className="bg-blue-50 p-3 rounded">
                    <div className="text-gray-600">Total Marks</div>
                    <div className="text-xl font-bold text-blue-600">{exam.total_marks}</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <div className="text-gray-600">Duration</div>
                    <div className="text-xl font-bold text-green-600">{exam.duration_minutes} min</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded">
                    <div className="text-gray-600">Created By</div>
                    <div className="text-xl font-bold text-purple-600">{exam.created_by}</div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded">
                    <div className="text-gray-600">Created</div>
                    <div className="text-sm font-bold text-orange-600">{new Date(exam.created_at).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/admin/exams/${exam.id}/results`}>
                    <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50">
                      View Results
                    </button>
                  </Link>
                  <button
                    onClick={() => handleDeleteExam(exam.id)}
                    className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-600 mb-4">No exams created yet.</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Create First Exam
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
