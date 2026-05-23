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
  const totalQuestionMarks = questions.reduce(
    (sum, question) => sum + (Number.isFinite(question.marks_per_question) ? question.marks_per_question : 0),
    0,
  )
  const exceedsTotalMarks = totalQuestionMarks > formData.total_marks

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
      [name]: name === 'total_marks' || name === 'duration_minutes' ? Number(value) || 0 : value,
    }))
  }

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const newQuestions = [...questions]
    ;(newQuestions[index] as any)[field] = field === 'marks_per_question' ? Number(value) || 0 : value
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

    if (totalQuestionMarks > formData.total_marks) {
      setError('Total question marks cannot exceed the exam total marks')
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 mx-auto mb-4"></div>
          <p className="text-sm font-medium tracking-[0.18em] text-neutral-500 uppercase">Loading exams</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-neutral-950">Exam Management</h1>
            <p className="mt-2 text-sm leading-7 text-neutral-600">Create and manage exams for students</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 transition hover:border-neutral-400 hover:bg-neutral-50"
          >
            {showCreateForm ? 'Cancel' : '+ Create Exam'}
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Create Form */}
        {showCreateForm && (
          <div className="mb-8 rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-[0_10px_40px_rgba(17,17,17,0.06)]">
            <h2 className="mb-6 text-2xl font-black tracking-tight text-neutral-950">Create New Exam</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Exam Details */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-neutral-700">Exam Name *</label>
                  <input
                    type="text"
                    name="exam_name"
                    value={formData.exam_name}
                    onChange={handleFormChange}
                    placeholder="e.g., Competitive Programmin Basics"
                    className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-neutral-700">Total Marks *</label>
                  <input
                    type="number"
                    name="total_marks"
                    value={formData.total_marks}
                    onChange={handleFormChange}
                    min="1"
                    className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-neutral-700">Duration (minutes) *</label>
                  <input
                    type="number"
                    name="duration_minutes"
                    value={formData.duration_minutes}
                    onChange={handleFormChange}
                    min="1"
                    className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-neutral-700">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Exam description..."
                  rows={3}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
                />
              </div>

              <div className={`rounded-2xl border p-4 ${exceedsTotalMarks ? 'border-red-200 bg-red-50' : 'border-neutral-200 bg-neutral-50'}`}>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-semibold text-neutral-900">Question marks total</p>
                  <p className={`text-sm font-semibold ${exceedsTotalMarks ? 'text-red-700' : 'text-neutral-700'}`}>
                    {totalQuestionMarks} / {formData.total_marks}
                  </p>
                </div>
                <p className={`mt-2 text-sm ${exceedsTotalMarks ? 'text-red-700' : 'text-neutral-600'}`}>
                  {exceedsTotalMarks
                    ? 'Reduce one or more question marks, or increase the exam total marks.'
                    : 'Keep the total question marks at or below the exam total marks.'}
                </p>
              </div>

              {/* Questions */}
              <div className="border-t pt-6">
                <h3 className="mb-4 text-xl font-black tracking-tight text-neutral-950">Questions</h3>
                <div className="space-y-6">
                  {questions.map((question, index) => (
                    <div key={index} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-neutral-900">Question {index + 1}</h4>
                        {questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeQuestion(index)}
                            className="text-sm font-semibold text-neutral-500 transition hover:text-neutral-900"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="mb-1 block text-sm font-semibold text-neutral-700">Question Text *</label>
                          <textarea
                            value={question.question_text}
                            onChange={(e) => handleQuestionChange(index, 'question_text', e.target.value)}
                            placeholder="Enter question..."
                            rows={2}
                            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
                            required
                          />
                        </div>

                        <div className="grid md:grid-cols-2 gap-3">
                          {['A', 'B', 'C', 'D'].map((option) => (
                            <div key={option}>
                              <label className="mb-1 block text-sm font-semibold text-neutral-700">Option {option} *</label>
                              <input
                                type="text"
                                value={question[`option_${option.toLowerCase()}` as keyof Question]}
                                onChange={(e) => handleQuestionChange(index, `option_${option.toLowerCase()}`, e.target.value)}
                                placeholder={`Option ${option}...`}
                                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
                                required
                              />
                            </div>
                          ))}
                        </div>

                        <div className="grid md:grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1 block text-sm font-semibold text-neutral-700">Correct Answer *</label>
                            <select
                              value={question.correct_answer}
                              onChange={(e) => handleQuestionChange(index, 'correct_answer', e.target.value)}
                              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
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
                            <label className="mb-1 block text-sm font-semibold text-neutral-700">Marks *</label>
                            <input
                              type="number"
                              value={question.marks_per_question}
                              onChange={(e) => handleQuestionChange(index, 'marks_per_question', parseInt(e.target.value))}
                              min="1"
                              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
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
                  className="mt-4 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:border-neutral-400 hover:bg-neutral-50"
                >
                  + Add Question
                </button>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 rounded-full border border-neutral-300 bg-white px-4 py-3 font-semibold text-neutral-900 transition hover:border-neutral-400 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || exceedsTotalMarks}
                  className="flex-1 rounded-full border border-neutral-900 bg-neutral-900 px-4 py-3 font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
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
              <div key={exam.id} className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-neutral-950">{exam.exam_name}</h3>
                    <p className="mt-1 text-sm text-neutral-600">{exam.description}</p>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      exam.is_active ? 'border-neutral-300 bg-neutral-50 text-neutral-800' : 'border-neutral-200 bg-white text-neutral-500'
                    }`}
                  >
                    {exam.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Total Marks</div>
                    <div className="mt-2 text-xl font-black text-neutral-950">{exam.total_marks}</div>
                  </div>
                  <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Duration</div>
                    <div className="mt-2 text-xl font-black text-neutral-950">{exam.duration_minutes} min</div>
                  </div>
                  <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Created By</div>
                    <div className="mt-2 text-lg font-semibold text-neutral-900">{exam.created_by}</div>
                  </div>
                  <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Created</div>
                    <div className="mt-2 text-sm font-semibold text-neutral-900">{new Date(exam.created_at).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/admin/exams/${exam.id}/results`}>
                    <button className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:border-neutral-400 hover:bg-neutral-50">
                      View Results
                    </button>
                  </Link>
                  <button
                    onClick={() => handleDeleteExam(exam.id)}
                    className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:border-neutral-400 hover:bg-neutral-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[2rem] border border-neutral-200 bg-white p-12 text-center shadow-sm">
              <div className="text-6xl mb-4">📝</div>
              <p className="mb-4 text-neutral-600">No exams created yet.</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="rounded-full border border-neutral-900 bg-neutral-900 px-6 py-2.5 font-semibold text-white transition hover:bg-neutral-800"
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
