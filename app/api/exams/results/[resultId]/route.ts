import { getSupabaseAdmin } from '@/lib/supabaseClient'
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

async function verifyUser(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
    if (!decoded) {
      return null
    }
    return decoded
  } catch {
    return null
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { resultId: string } }
) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const user = await verifyUser(token)
    if (!user) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const supabase = getSupabaseAdmin()

    const { data: result, error: resultError } = await supabase
      .from('exam_results')
      .select(
        `
        id,
        exam_id,
        user_id,
        total_questions,
        correct_answers,
        total_marks_obtained,
        total_marks,
        percentage,
        started_at,
        completed_at,
        exams(exam_name, description, duration_minutes, total_marks),
        users(full_name, student_id, user_type)
      `
      )
      .eq('id', params.resultId)
      .single()

    if (resultError) throw resultError

    const isAdmin = user.user_type === 'admin'
    if (!isAdmin && result.user_id !== user.user_id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const { data: responses, error: responsesError } = await supabase
      .from('student_exam_responses')
      .select('question_id, selected_answer, is_correct')
      .eq('exam_id', result.exam_id)
      .eq('user_id', result.user_id)
      .order('question_id', { ascending: true })

    if (responsesError) throw responsesError

    const { data: questions, error: questionsError } = await supabase
      .from('exam_questions')
      .select('id, question_text, option_a, option_b, option_c, option_d, correct_answer, marks_per_question')
      .eq('exam_id', result.exam_id)
      .order('id', { ascending: true })

    if (questionsError) throw questionsError

    const responseMap = new Map(responses.map((response: any) => [response.question_id, response]))

    const paper = questions.map((question: any) => {
      const response = responseMap.get(question.id)
      return {
        question_id: question.id,
        question_text: question.question_text,
        option_a: question.option_a,
        option_b: question.option_b,
        option_c: question.option_c,
        option_d: question.option_d,
        correct_answer: question.correct_answer,
        marks_per_question: question.marks_per_question,
        selected_answer: response?.selected_answer || '',
        is_correct: Boolean(response?.is_correct),
      }
    })

    return NextResponse.json({
      result: {
        id: result.id,
        exam_id: result.exam_id,
        user_id: result.user_id,
        total_questions: result.total_questions,
        correct_answers: result.correct_answers,
        total_marks_obtained: result.total_marks_obtained,
        total_marks: result.total_marks,
        percentage: result.percentage,
        started_at: result.started_at,
        completed_at: result.completed_at,
      },
      exam: result.exams,
      student: result.users,
      paper,
    })
  } catch (error) {
    console.error('Error fetching exam paper:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}