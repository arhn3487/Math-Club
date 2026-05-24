import { NextRequest, NextResponse } from 'next/server'
import { fetchData, fetchDataById } from '@/lib/db'
import { getSupabaseAdmin } from '@/lib/supabaseClient'
import { extractTokenFromHeader, verifyToken } from '@/lib/auth'
import { Achievement } from '@/types'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (id) {
      const achievement = await fetchDataById<Achievement>(
        'achievements',
        id
      )
      return NextResponse.json(achievement)
    }

    const achievements = await fetchData<Achievement>('achievements', undefined, {
      orderBy: 'date',
    })

    return NextResponse.json(achievements)
  } catch (error) {
    console.error('Failed to fetch achievements:', error)
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
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('achievements')
      .insert([
        {
          title: body.title,
          image: body.image ?? null,
          date: body.date ?? null,
          created_by: auth.payload.user_id,
        },
      ])
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(data as Achievement, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create achievement' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await requireSuperuser(req)
    if ('error' in auth) return auth.error

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Achievement ID is required' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('achievements')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(data as Achievement)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update achievement' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireSuperuser(req)
    if ('error' in auth) return auth.error

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Achievement ID is required' },
        { status: 400 }
      )
    }
    const supabase = getSupabaseAdmin()
    const { error } = await supabase.from('achievements').delete().eq('id', id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete achievement' },
      { status: 500 }
    )
  }
}
