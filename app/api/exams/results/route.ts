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

export async function GET(request: NextRequest) {
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

    // Get student's exam results
    const { data: results, error } = await supabase
      .from('exam_results')
      .select(
        `
        id,
        exam_id,
        total_questions,
        correct_answers,
        total_marks_obtained,
        total_marks,
        percentage,
        completed_at,
        exams(exam_name)
      `
      )
      .eq('user_id', user.user_id)
      .order('completed_at', { ascending: false })

    if (error) throw error

    // Transform results
    const transformedResults = results.map((r: any) => ({
      id: r.id,
      exam_id: r.exam_id,
      exam_name: r.exams?.exam_name || 'Unknown',
      total_marks_obtained: r.total_marks_obtained,
      total_marks: r.total_marks,
      percentage: r.percentage,
      completed_at: r.completed_at,
    }))

    return NextResponse.json({ results: transformedResults })
  } catch (error) {
    console.error('Error fetching results:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
