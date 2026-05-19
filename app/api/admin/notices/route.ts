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
    const { title, description, notice_type, event_date } = body

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('notices')
      .insert([
        {
          title,
          description,
          notice_type,
          event_date: event_date || null,
          created_by: admin.user_id,
          is_active: true,
        },
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ notice: data })
  } catch (error) {
    console.error('Error creating notice:', error)
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
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ notices: data })
  } catch (error) {
    console.error('Error fetching notices:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
