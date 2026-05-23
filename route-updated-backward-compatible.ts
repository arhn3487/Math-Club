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
      // Query BOTH video_resources (new system) AND class_recordings (legacy/existing videos)
      
      // 1. Get new video_resources
      let newVideoQuery = supabase
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

      // 2. Get legacy class_recordings (existing videos for backward compatibility)
      let legacyQuery = supabase
        .from('class_recordings')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      const [newVRes, legacyRes] = await Promise.all([newVideoQuery, legacyQuery])

      if (newVRes.error) throw newVRes.error
      if (legacyRes.error) throw legacyRes.error

      // Process new video_resources
      const filteredNewVideos = newVRes.data?.filter((video: any) => {
        if (!video.video_resource_batches || video.video_resource_batches.length === 0) {
          return true
        }
        return video.video_resource_batches.some((batch: any) => batch.batch_year === userBatchYear)
      }) || []

      // Process legacy class_recordings (map to same format as video_resources)
      const filteredLegacyVideos = legacyRes.data?.filter((video: any) => {
        // If batch_year is null, visible to all
        if (video.batch_year === null) return true
        // If batch_year is set, only visible to that batch
        return video.batch_year === userBatchYear
      }).map((video: any) => ({
        id: video.id,
        title: video.title,
        description: video.description,
        resource_url: video.youtube_url,
        added_by: video.uploaded_by,
        created_at: video.created_at,
        updated_at: video.updated_at,
        folder_id: null,
        resource_folders: null,
        video_resource_batches: video.batch_year ? [{ batch_year: video.batch_year }] : [],
        source: 'class_recordings' // Mark as legacy
      })) || []

      // Combine both (new system + legacy)
      const allVideos = [...filteredNewVideos, ...filteredLegacyVideos]

      return NextResponse.json({ videos: allVideos })
    }

    if (type === 'resource') {
      // Query only new shared_resources (no legacy equivalent)
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

      const filteredResources = resources?.filter((resource: any) => {
        if (!resource.shared_resource_batches || resource.shared_resource_batches.length === 0) {
          return true
        }
        return resource.shared_resource_batches.some((batch: any) => batch.batch_year === userBatchYear)
      })

      return NextResponse.json({ resources: filteredResources })
    }

    // Default: return both videos and resources
    // Videos from both new system AND legacy class_recordings
    const newVideoQuery = supabase
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

    const legacyQuery = supabase
      .from('class_recordings')
      .select('*')
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

    const [newVRes, legacyRes, rRes] = await Promise.all([newVideoQuery, legacyQuery, resourceQuery])

    if (newVRes.error) throw newVRes.error
    if (legacyRes.error) throw legacyRes.error
    if (rRes.error) throw rRes.error

    // Filter new videos
    const filteredNewVideos = newVRes.data?.filter((video: any) => {
      if (!video.video_resource_batches || video.video_resource_batches.length === 0) {
        return true
      }
      return video.video_resource_batches.some((batch: any) => batch.batch_year === userBatchYear)
    }) || []

    // Filter legacy videos and map to standard format
    const filteredLegacyVideos = legacyRes.data?.filter((video: any) => {
      if (video.batch_year === null) return true
      return video.batch_year === userBatchYear
    }).map((video: any) => ({
      id: video.id,
      title: video.title,
      description: video.description,
      resource_url: video.youtube_url,
      added_by: video.uploaded_by,
      created_at: video.created_at,
      updated_at: video.updated_at,
      folder_id: null,
      resource_folders: null,
      video_resource_batches: video.batch_year ? [{ batch_year: video.batch_year }] : [],
      source: 'class_recordings'
    })) || []

    // Filter resources
    const filteredResources = rRes.data?.filter((resource: any) => {
      if (!resource.shared_resource_batches || resource.shared_resource_batches.length === 0) {
        return true
      }
      return resource.shared_resource_batches.some((batch: any) => batch.batch_year === userBatchYear)
    })

    // Combine videos from both systems
    const allVideos = [...filteredNewVideos, ...filteredLegacyVideos]

    return NextResponse.json({ videos: allVideos, resources: filteredResources })
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
    const { title, description, resource_url, resource_type, folder_id, batch_years, file_size, isVideo, batch_year } = body

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
        const batchInserts = batch_years.map((batch_year_val: number) => ({
          video_resource_id: videoData.id,
          batch_year: batch_year_val,
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
        const batchInserts = batch_years.map((batch_year_val: number) => ({
          shared_resource_id: resourceData.id,
          batch_year: batch_year_val,
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
