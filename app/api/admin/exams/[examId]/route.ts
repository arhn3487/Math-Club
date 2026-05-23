import { getSupabaseAdmin } from '@/lib/supabaseClient'
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

async function verifyAdmin(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
    if (!decoded || decoded.user_type !== 'admin') {
      return null
    }
    return decoded
  } catch {
    return null
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { examId: string } }) {
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
    // Ensure the exam exists and was created by this admin
    const { data: exam, error: fetchError } = await supabase.from('exams').select('id, created_by').eq('id', params.examId).single()
    if (fetchError) {
      console.error('Error fetching exam for delete:', fetchError)
      return NextResponse.json({ message: 'Exam not found' }, { status: 404 })
    }

    if (String(exam.created_by) !== String(admin.user_id)) {
      return NextResponse.json({ message: 'Forbidden: only the exam creator can delete this exam' }, { status: 403 })
    }

    const { error } = await supabase.from('exams').delete().eq('id', params.examId)
    if (error) throw error

    return NextResponse.json({ message: 'Exam deleted successfully' })
  } catch (error) {
    console.error('Error deleting exam:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
