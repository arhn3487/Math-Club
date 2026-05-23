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

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const user = await verifyUser(token)
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const supabase = getSupabaseAdmin()

    // Get user's batch year
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('batch_year')
      .eq('user_id', user.user_id)
      .single()

    if (userError) throw userError

    const type = new URL(request.url).searchParams.get('type')
    const userBatchYear = userData?.batch_year

    if (type === 'video') {
      // Query video resources for user's batch
      // Either shared with their specific batch or shared with all batches (batch_year IS NULL)
      let query = supabase
        .from('video_resources')
        .select(`
          id,
          title,
          description,
          resource_url,
          added_by,
          created_at,
          updated_at,
          folder_id,
          resource_folders!folder_id(folder_name),
          video_resource_batches(batch_year)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      const { data: videos, error } = await query

      if (error) throw error

      // Filter videos to only show those accessible to this user
      const filteredVideos = videos?.filter((video: any) => {
        // If no batch assignments, it's available to all
        if (!video.video_resource_batches || video.video_resource_batches.length === 0) {
          return true
        }
        // Check if user's batch is in the resource's batches
        return video.video_resource_batches.some((batch: any) => batch.batch_year === userBatchYear)
      })

      return NextResponse.json({ videos: filteredVideos })
    }

    if (type === 'resource') {
      // Query shared resources for user's batch
      let query = supabase
        .from('shared_resources')
        .select(`
          id,
          title,
          description,
          resource_type,
          resource_url,
          file_size,
          added_by,
          created_at,
          updated_at,
          folder_id,
          resource_folders!folder_id(folder_name),
          shared_resource_batches(batch_year)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      const { data: resources, error } = await query

      if (error) throw error

      // Filter resources to only show those accessible to this user
      const filteredResources = resources?.filter((resource: any) => {
        // If no batch assignments, it's available to all
        if (!resource.shared_resource_batches || resource.shared_resource_batches.length === 0) {
          return true
        }
        // Check if user's batch is in the resource's batches
        return resource.shared_resource_batches.some((batch: any) => batch.batch_year === userBatchYear)
      })

      return NextResponse.json({ resources: filteredResources })
    }

    // Default: return both videos and resources
    const videoQuery = supabase
      .from('video_resources')
      .select(`
        id,
        title,
        description,
        resource_url,
        added_by,
        created_at,
        updated_at,
        folder_id,
        resource_folders!folder_id(folder_name),
        video_resource_batches(batch_year)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    const resourceQuery = supabase
      .from('shared_resources')
      .select(`
        id,
        title,
        description,
        resource_type,
        resource_url,
        file_size,
        added_by,
        created_at,
        updated_at,
        folder_id,
        resource_folders!folder_id(folder_name),
        shared_resource_batches(batch_year)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    const [vRes, rRes] = await Promise.all([videoQuery, resourceQuery])

    if (vRes.error) throw vRes.error
    if (rRes.error) throw rRes.error

    // Filter videos accessible to this user
    const filteredVideos = vRes.data?.filter((video: any) => {
      if (!video.video_resource_batches || video.video_resource_batches.length === 0) {
        return true
      }
      return video.video_resource_batches.some((batch: any) => batch.batch_year === userBatchYear)
    })

    // Filter resources accessible to this user
    const filteredResources = rRes.data?.filter((resource: any) => {
      if (!resource.shared_resource_batches || resource.shared_resource_batches.length === 0) {
        return true
      }
      return resource.shared_resource_batches.some((batch: any) => batch.batch_year === userBatchYear)
    })

    return NextResponse.json({ videos: filteredVideos, resources: filteredResources })
  } catch (err) {
    console.error('Error fetching resources/videos:', err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const user = await verifyUser(token)
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    // Verify user is admin
    const supabase = getSupabaseAdmin()
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('user_type')
      .eq('user_id', user.user_id)
      .single()

    if (userError || userData?.user_type !== 'admin') {
      return NextResponse.json({ message: 'Only admins can upload resources' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, resource_url, resource_type, folder_id, batch_years, file_size, isVideo } = body

    if (isVideo) {
      // Create video resource
      const { data: videoData, error: videoError } = await supabase
        .from('video_resources')
        .insert([
          {
            title,
            description,
            resource_url,
            folder_id: folder_id || null,
            added_by: user.user_id,
            is_active: true,
          },
        ])
        .select()
        .single()

      if (videoError) throw videoError

      // Add batch associations
      if (batch_years && batch_years.length > 0) {
        const batchInserts = batch_years.map((batch_year: number) => ({
          video_resource_id: videoData.id,
          batch_year,
        }))

        const { error: batchError } = await supabase
          .from('video_resource_batches')
          .insert(batchInserts)

        if (batchError) throw batchError
      }

      return NextResponse.json({ message: 'Video resource created', data: videoData }, { status: 201 })
    } else {
      // Create shared resource
      const { data: resourceData, error: resourceError } = await supabase
        .from('shared_resources')
        .insert([
          {
            title,
            description,
            resource_type,
            resource_url,
            file_size: file_size || null,
            folder_id: folder_id || null,
            added_by: user.user_id,
            is_active: true,
          },
        ])
        .select()
        .single()

      if (resourceError) throw resourceError

      // Add batch associations
      if (batch_years && batch_years.length > 0) {
        const batchInserts = batch_years.map((batch_year: number) => ({
          shared_resource_id: resourceData.id,
          batch_year,
        }))

        const { error: batchError } = await supabase
          .from('shared_resource_batches')
          .insert(batchInserts)

        if (batchError) throw batchError
      }

      return NextResponse.json({ message: 'Shared resource created', data: resourceData }, { status: 201 })
    }
  } catch (err) {
    console.error('Error creating resource:', err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
