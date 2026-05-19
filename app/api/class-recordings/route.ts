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

    // Get user's batch year
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('batch_year')
      .eq('user_id', user.user_id)
      .single()

    if (userError) throw userError

    // Get recordings for user's batch or all batches
    let query = supabase
      .from('class_recordings')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (userData.batch_year) {
      query = query.or(`batch_year.eq.${userData.batch_year},batch_year.is.null`)
    }

    const { data: recordings, error } = await query

    if (error) throw error

    return NextResponse.json({ recordings })
  } catch (error) {
    console.error('Error fetching recordings:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
