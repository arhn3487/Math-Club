import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin, supabase } from '@/lib/supabaseClient'
import { extractTokenFromHeader, verifyToken } from '@/lib/auth'
import { Leadership } from '@/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Public: anyone visiting the site can see the list of past & present
// presidents / committee members. Only active rows are returned.
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('club_leadership')
      .select('*')
      .eq('is_active', true)
      .order('is_current', { ascending: false })
      .order('display_order', { ascending: true })
      .order('term_start', { ascending: false })

    if (error) throw error

    return NextResponse.json(data as Leadership[])
  } catch (error) {
    console.error('Failed to fetch leadership:', error)
    return NextResponse.json([])
  }
}

async function requireSuperuser(req: NextRequest) {
  const token = extractTokenFromHeader(req.headers.get('authorization'))
  if (!token) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const payload = verifyToken(token)
  if (!payload || payload.user_type !== 'superuser') {
    return { error: NextResponse.json({ error: 'Superuser access required' }, { status: 403 }) }
  }

  return { payload }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireSuperuser(req)
    if ('error' in auth) return auth.error

    const body = await req.json()

    if (!body.full_name || !String(body.full_name).trim()) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 })
    }

    const admin = getSupabaseAdmin()
    const { data, error } = await admin
      .from('club_leadership')
      .insert([
        {
          full_name: body.full_name,
          position: body.position || 'President',
          photo_url: body.photo_url ?? null,
          batch_year: body.batch_year ?? null,
          term_start: body.term_start ?? null,
          term_end: body.term_end ?? null,
          is_current: Boolean(body.is_current),
          bio: body.bio ?? null,
          display_order: body.display_order ?? 0,
          created_by: auth.payload.user_id,
        },
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data as Leadership, { status: 201 })
  } catch (error) {
    console.error('Failed to create leadership entry:', error)
    return NextResponse.json({ error: 'Failed to create leadership entry' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await requireSuperuser(req)
    if ('error' in auth) return auth.error

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Leadership entry ID is required' }, { status: 400 })
    }

    const body = await req.json()
    const admin = getSupabaseAdmin()
    const { data, error } = await admin
      .from('club_leadership')
      .update({
        full_name: body.full_name,
        position: body.position,
        photo_url: body.photo_url ?? null,
        batch_year: body.batch_year ?? null,
        term_start: body.term_start ?? null,
        term_end: body.term_end ?? null,
        is_current: Boolean(body.is_current),
        bio: body.bio ?? null,
        display_order: body.display_order ?? 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data as Leadership)
  } catch (error) {
    console.error('Failed to update leadership entry:', error)
    return NextResponse.json({ error: 'Failed to update leadership entry' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireSuperuser(req)
    if ('error' in auth) return auth.error

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Leadership entry ID is required' }, { status: 400 })
    }

    const admin = getSupabaseAdmin()
    const { error } = await admin.from('club_leadership').delete().eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete leadership entry:', error)
    return NextResponse.json({ error: 'Failed to delete leadership entry' }, { status: 500 })
  }
}
