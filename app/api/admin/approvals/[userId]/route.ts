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

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
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

    const body = await request.json()
    const { approve } = body

    const supabase = getSupabaseAdmin()

    if (approve) {
      // Approve user
      const { error } = await supabase
        .from('users')
        .update({ is_approved: true })
        .eq('id', params.userId)

      if (error) throw error

      return NextResponse.json({ message: 'User approved successfully' })
    } else {
      // Reject/Delete user
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', params.userId)

      if (error) throw error

      return NextResponse.json({ message: 'User rejected successfully' })
    }
  } catch (error) {
    console.error('Error processing approval:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
