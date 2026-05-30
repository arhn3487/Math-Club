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

export async function GET(
  request: NextRequest,
  { params }: { params: { examId: string } }
) {
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
    const searchParams = request.nextUrl.searchParams
    const sortBy = searchParams.get('sortBy') || 'percentage'

    // Get exam name
    const { data: examData, error: examError } = await supabase
      .from('exams')
      .select('exam_name')
      .eq('id', params.examId)
      .single()

    if (examError) throw examError

    // Get results
    let query = supabase
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
        completed_at,
        users(full_name, student_id)
      `
      )
      .eq('exam_id', params.examId)

    if (sortBy === 'percentage') {
      query = query.order('percentage', { ascending: false })
    } else if (sortBy === 'name') {
      query = query.order('users.full_name', { ascending: true })
    }

    const { data: results, error: resultsError } = await query

    if (resultsError) throw resultsError

    // Transform results
    const transformedResults = results.map((r: any) => ({
      id: r.id,
      user_id: r.user_id,
      full_name: r.users?.full_name || 'Unknown',
      student_id: r.users?.student_id,
      total_questions: r.total_questions,
      correct_answers: r.correct_answers,
      total_marks_obtained: r.total_marks_obtained,
      total_marks: r.total_marks,
      percentage: r.percentage,
      completed_at: r.completed_at,
    }))

    return NextResponse.json({
      results: transformedResults,
      examName: examData.exam_name,
    })
  } catch (error) {
    console.error('Error fetching exam results:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
