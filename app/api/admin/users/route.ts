import { fetchData, deleteData, fetchDataById, updateData } from '@/lib/db'
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
    const { data, error } = await supabase.from('users').select('*').eq('is_active', true)

    if (error) throw error

    return NextResponse.json({ users: data })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { userId: string } }) {
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
    const { error } = await supabase.from('users').delete().eq('id', params.userId)

    if (error) throw error

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
