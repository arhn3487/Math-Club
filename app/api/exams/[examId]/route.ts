import { getSupabaseAdmin } from '@/lib/supabaseClient'
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

async function verifyStudent(token: string) {
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
  { params }: { params: { examId: string } }
) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const user = await verifyStudent(token)
    if (!user) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const supabase = getSupabaseAdmin()

    // Get exam
    const { data: exam, error: examError } = await supabase
      .from('exams')
      .select('*')
      .eq('id', params.examId)
      .eq('is_active', true)
      .single()

    if (examError) throw examError

    // Get questions (shuffled)
    const { data: questions, error: questionsError } = await supabase
      .from('exam_questions')
      .select('id, question_text, option_a, option_b, option_c, option_d, marks_per_question')
      .eq('exam_id', params.examId)

    if (questionsError) throw questionsError

    // Shuffle questions for this student
    const shuffled = questions.sort(() => Math.random() - 0.5)

    return NextResponse.json({
      exam,
      questions: shuffled,
    })
  } catch (error) {
    console.error('Error fetching exam:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
