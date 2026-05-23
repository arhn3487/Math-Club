import { getSupabaseAdmin } from '@/lib/supabaseClient'
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

async function verifyUser(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
    if (!decoded) return null
    return decoded
  } catch {
    return null
  }
}

async function verifyAdminUserId(userId: string) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('users')
    .select('user_type')
    .eq('user_id', userId)
    .single()

  if (error || data?.user_type !== 'admin') {
    return false
  }

  return true
}

function hasBatchAccess(resourceBatches: any[] | undefined, userBatchYear: number | null | undefined) {
  if (!resourceBatches || resourceBatches.length === 0) {
    return true
  }
  if (!userBatchYear) {
    return false
  }
  return resourceBatches.some((b: any) => b.batch_year === userBatchYear)
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const user = await verifyUser(token)
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const supabase = getSupabaseAdmin()

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('batch_year')
      .eq('user_id', user.user_id)
      .single()

    if (userError) throw userError

    const type = new URL(request.url).searchParams.get('type')
    const userBatchYear = userData?.batch_year || null

    const fetchVideos = async () => {
      const { data, error } = await supabase
        .from('video_resources')
        .select(`
          id,
          title,
          description,
          resource_url,
          folder_id,
          created_at,
          resource_folders!folder_id(folder_name),
          video_resource_batches(batch_year)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || [])
        .filter((item: any) => hasBatchAccess(item.video_resource_batches, userBatchYear))
        .map((item: any) => ({
          ...item,
          folder_name: item.resource_folders?.folder_name || null,
        }))
    }

    const fetchResources = async () => {
      const { data, error } = await supabase
        .from('shared_resources')
        .select(`
          id,
          title,
          description,
          resource_type,
          resource_url,
          folder_id,
          created_at,
          resource_folders!folder_id(folder_name),
          shared_resource_batches(batch_year)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || [])
        .filter((item: any) => hasBatchAccess(item.shared_resource_batches, userBatchYear))
        .map((item: any) => ({
          ...item,
          folder_name: item.resource_folders?.folder_name || null,
        }))
    }

    if (type === 'video') {
      const videos = await fetchVideos()
      return NextResponse.json({ videos })
    }

    if (type === 'resource') {
      const resources = await fetchResources()
      return NextResponse.json({ resources })
    }

    const [videos, resources] = await Promise.all([fetchVideos(), fetchResources()])
    return NextResponse.json({ videos, resources })
  } catch (err) {
    console.error('Error fetching resources:', err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const user = await verifyUser(token)
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const isAdmin = await verifyAdminUserId(user.user_id)
    if (!isAdmin) {
      return NextResponse.json({ message: 'Only admins can upload resources' }, { status: 403 })
    }

    const body = await request.json()
    const {
      title,
      description,
      resource_type,
      resource_url,
      folder_id,
      folder_name,
      batch_year,
      batch_years,
    } = body

    if (!title || !resource_url) {
      return NextResponse.json({ message: 'Title and URL are required' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    let usedFolderId = folder_id || null
    if (!usedFolderId && folder_name && String(folder_name).trim()) {
      const { data: folderData, error: folderError } = await supabase
        .from('resource_folders')
        .insert([{ folder_name: String(folder_name).trim(), created_by: user.user_id }])
        .select()
        .single()

      if (folderError) throw folderError
      usedFolderId = folderData.id
    }

    const selectedYears: number[] = Array.isArray(batch_years)
      ? batch_years.map((y: any) => Number(y)).filter((y: number) => Number.isFinite(y))
      : batch_year
      ? [Number(batch_year)]
      : []

    if (resource_type === 'video') {
      const { data, error } = await supabase
        .from('video_resources')
        .insert([
          {
            title,
            description,
            resource_url,
            folder_id: usedFolderId,
            added_by: user.user_id,
            is_active: true,
          },
        ])
        .select()
        .single()

      if (error) throw error

      if (selectedYears.length > 0) {
        const inserts = selectedYears.map((year) => ({
          video_resource_id: data.id,
          batch_year: year,
        }))
        const { error: batchError } = await supabase.from('video_resource_batches').insert(inserts)
        if (batchError) throw batchError
      }

      return NextResponse.json({ message: 'Video resource created', data }, { status: 201 })
    }

    const { data, error } = await supabase
      .from('shared_resources')
      .insert([
        {
          title,
          description,
          resource_type: resource_type || 'github',
          resource_url,
          folder_id: usedFolderId,
          added_by: user.user_id,
          is_active: true,
        },
      ])
      .select()
      .single()

    if (error) throw error

    if (selectedYears.length > 0) {
      const inserts = selectedYears.map((year) => ({
        shared_resource_id: data.id,
        batch_year: year,
      }))
      const { error: batchError } = await supabase.from('shared_resource_batches').insert(inserts)
      if (batchError) throw batchError
    }

    return NextResponse.json({ message: 'Shared resource created', data }, { status: 201 })
  } catch (err) {
    console.error('Error creating resource:', err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const user = await verifyUser(token)
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const isAdmin = await verifyAdminUserId(user.user_id)
    if (!isAdmin) {
      return NextResponse.json({ message: 'Only admins can delete resources' }, { status: 403 })
    }

    const body = await request.json()
    const { id, type } = body

    if (!id || !type) {
      return NextResponse.json({ message: 'Missing id or type' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    if (type === 'video') {
      const { error } = await supabase.from('video_resources').update({ is_active: false }).eq('id', id)
      if (error) throw error
      return NextResponse.json({ success: true })
    }

    const { error } = await supabase.from('shared_resources').update({ is_active: false }).eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error deleting resource:', err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
