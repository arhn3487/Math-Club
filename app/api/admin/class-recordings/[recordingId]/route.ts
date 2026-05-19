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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { recordingId: string } }
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
    const { error } = await supabase
      .from('class_recordings')
      .delete()
      .eq('id', params.recordingId)

    if (error) throw error

    return NextResponse.json({ message: 'Recording deleted successfully' })
  } catch (error) {
    console.error('Error deleting recording:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
