import { getSupabaseAdmin } from '@/lib/supabaseClient'
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

async function verifyAdmin(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
    if (!decoded || !['admin', 'superuser'].includes(decoded.user_type)) {
      return null
    }
    return decoded
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const admin = await verifyAdmin(token)
    if (!admin) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { exam_name, description, total_marks, duration_minutes, questions } = body

    // Validate question marks do not exceed exam total_marks
    if (questions && Array.isArray(questions) && questions.length > 0) {
      const sumMarks = questions.reduce((s: number, q: any) => s + (Number(q.marks_per_question) || 0), 0)
      if (sumMarks > Number(total_marks)) {
        return NextResponse.json({ message: 'Total question marks cannot exceed the exam total marks' }, { status: 400 })
      }
    }

    const supabase = getSupabaseAdmin()

    // Create exam
    const { data: examData, error: examError } = await supabase
      .from('exams')
      .insert([
        {
          exam_name,
          description,
          total_marks,
          duration_minutes,
          created_by: admin.user_id,
          is_active: true,
        },
      ])
      .select()
      .single()

    if (examError) throw examError

    // Create questions
    if (questions && questions.length > 0) {
      const questionRecords = questions.map((q: any, index: number) => ({
        exam_id: examData.id,
        question_text: q.question_text,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_answer: q.correct_answer,
        marks_per_question: q.marks_per_question,
        question_order: index,
      }))

      const { error: questionError } = await supabase.from('exam_questions').insert(questionRecords)

      if (questionError) throw questionError
    }

    return NextResponse.json({ exam: examData })
  } catch (error) {
    console.error('Error creating exam:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const admin = await verifyAdmin(token)
    if (!admin) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.from('exams').select('*').order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ exams: data })
  } catch (error) {
    console.error('Error fetching exams:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
