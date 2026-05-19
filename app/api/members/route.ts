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

    if (user.user_type === 'student') {
      // Students see only their batch members
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('batch_year')
        .eq('user_id', user.user_id)
        .single()

      if (userError) throw userError

      const { data: members, error } = await supabase
        .from('users')
        .select('id, user_id, full_name, email, user_type, batch_year, profile_image_url, student_id, admin_id')
        .eq('batch_year', userData.batch_year)
        .eq('is_active', true)

      if (error) throw error

      return NextResponse.json({ members })
    } else {
      // Admins see all members
      const { data: members, error } = await supabase
        .from('users')
        .select('id, user_id, full_name, email, user_type, batch_year, profile_image_url, student_id, admin_id')
        .eq('is_active', true)
        .order('full_name', { ascending: true })

      if (error) throw error

      return NextResponse.json({ members })
    }
  } catch (error) {
    console.error('Error fetching members:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
