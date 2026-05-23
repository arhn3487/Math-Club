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
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const admin = await verifyAdmin(token)
    if (!admin) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { title, description, resource_type, resource_url, folder_id, folder_name, batch_year } = body

    const supabase = getSupabaseAdmin()

    // ensure folder creation if provided
    let usedFolderId = folder_id || null
    if (!usedFolderId && folder_name) {
      const { data: fdata, error: ferr } = await supabase
        .from('resource_folders')
        .insert([{ folder_name: folder_name.trim(), created_by: admin.user_id }])
        .select()
        .single()
      if (ferr) throw ferr
      usedFolderId = fdata.id
    }

    if (resource_type === 'video') {
      const { data, error } = await supabase
        .from('video_resources')
        .insert([
          {
            title,
            description,
            youtube_url: resource_url,
            batch_year: batch_year || null,
            uploaded_by: admin.user_id,
            folder_id: usedFolderId,
            is_active: true,
          },
        ])
        .select()
        .single()
      if (error) throw error
      return NextResponse.json({ video: data })
    } else {
      const { data, error } = await supabase
        .from('shared_resources')
        .insert([
          {
            title,
            description,
            resource_url,
            folder_id: usedFolderId,
            batch_year: batch_year || null,
            added_by: admin.user_id,
            is_active: true,
          },
        ])
        .select()
        .single()
      if (error) throw error
      return NextResponse.json({ resource: data })
    }
  } catch (err) {
    console.error('Error creating resource/video:', err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const admin = await verifyAdmin(token)
    if (!admin) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const supabase = getSupabaseAdmin()
    const type = new URL(request.url).searchParams.get('type')

    if (type === 'video') {
      const { data, error } = await supabase
        .from('video_resources')
        .select('*, resource_folders(folder_name)')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      if (error) throw error
      return NextResponse.json({ videos: data })
    }

    if (type === 'resource') {
      const { data, error } = await supabase
        .from('shared_resources')
        .select('*, resource_folders(folder_name)')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      if (error) throw error
      return NextResponse.json({ resources: data })
    }

    // default: return both
    const [vRes, rRes] = await Promise.all([
      supabase.from('video_resources').select('*, resource_folders(folder_name)').eq('is_active', true).order('created_at', { ascending: false }),
      supabase.from('shared_resources').select('*, resource_folders(folder_name)').eq('is_active', true).order('created_at', { ascending: false }),
    ])

    if (vRes.error) throw vRes.error
    if (rRes.error) throw rRes.error

    return NextResponse.json({ videos: vRes.data, resources: rRes.data })
  } catch (err) {
    console.error('Error fetching resources/videos:', err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const admin = await verifyAdmin(token)
    if (!admin) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { id, type } = body
    if (!id || !type) return NextResponse.json({ message: 'Missing id or type' }, { status: 400 })

    const supabase = getSupabaseAdmin()
    if (type === 'video') {
      const { error } = await supabase.from('video_resources').delete().eq('id', id)
      if (error) throw error
      return NextResponse.json({ success: true })
    }

    const { error } = await supabase.from('shared_resources').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error deleting resource/video:', err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
