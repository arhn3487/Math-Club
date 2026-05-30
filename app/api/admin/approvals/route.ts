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

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.split(' ')[1]

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const admin = await verifyAdmin(token)
    if (!admin) {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 })
    }

    const supabase = getSupabaseAdmin()

    const { data: users, error } = await supabase
      .from('users')
      .select('id, user_id, full_name, email, student_id, batch_year, profile_image_url, created_at')
      .eq('user_type', 'student')
      .eq('is_approved', false)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    console.log('Fetched pending users:', users)
    return NextResponse.json({ users: users || [] })
  } catch (error) {
    console.error('Error fetching pending users:', error)
    return NextResponse.json({ message: 'Internal server error', error: String(error) }, { status: 500 })
  }
}