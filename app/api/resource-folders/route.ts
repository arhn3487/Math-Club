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
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const user = await verifyUser(token)
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('resource_folders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ folders: data })
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to fetch folders' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const admin = await verifyAdmin(token)
    if (!admin) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { folder_name, description } = body

    if (!folder_name || !folder_name.trim()) {
      return NextResponse.json({ message: 'Folder name is required' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('resource_folders')
      .insert([{
        folder_name: folder_name.trim(),
        description: description || null,
        created_by: admin.user_id,
      }])
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ folder: data }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to create folder' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const admin = await verifyAdmin(token)
    if (!admin) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { id, folder_name, description } = body

    if (!id) {
      return NextResponse.json({ message: 'Folder ID is required' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('resource_folders')
      .update({
        folder_name: folder_name?.trim() || undefined,
        description: description || undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ folder: data })
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to update folder' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const admin = await verifyAdmin(token)
    if (!admin) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ message: 'Folder ID is required' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    const [videoCount, sharedCount, resourceCount] = await Promise.all([
      supabase.from('video_resources').select('id', { count: 'exact', head: true }).eq('folder_id', id),
      supabase.from('shared_resources').select('id', { count: 'exact', head: true }).eq('folder_id', id),
      supabase.from('resources').select('id', { count: 'exact', head: true }).eq('folder_id', id),
    ])

    const hasLinkedRows =
      (videoCount.count ?? 0) > 0 ||
      (sharedCount.count ?? 0) > 0 ||
      (resourceCount.count ?? 0) > 0

    if (hasLinkedRows) {
      return NextResponse.json(
        { message: 'Folder still contains resources and cannot be deleted' },
        { status: 409 }
      )
    }

    const { data, error } = await supabase.from('resource_folders').delete().eq('id', id).select().single()

    if (error) throw error
    return NextResponse.json({ folder: data })
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to delete folder' }, { status: 500 })
  }
}
