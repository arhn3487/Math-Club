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

    // ==================== TYPE: VIDEO (from both class_recordings + video_resources) ====================
    if (type === 'video') {
      // Get legacy class_recordings videos
      let legacyQuery = supabase
        .from('class_recordings')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (userBatchYear) {
        legacyQuery = legacyQuery.or(`batch_year.eq.${userBatchYear},batch_year.is.null`)
      }

      // Get new video_resources
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

      const [legacyRes, newVRes] = await Promise.all([legacyQuery, newVideoQuery])

      if (legacyRes.error) throw legacyRes.error
      if (newVRes.error) throw newVRes.error

      // Process new video_resources
      const filteredNewVideos = newVRes.data?.filter((video: any) => {
        if (!video.video_resource_batches || video.video_resource_batches.length === 0) {
          return true
        }
        return video.video_resource_batches.some((batch: any) => batch.batch_year === userBatchYear)
      }) || []

      // Combine both
      const allVideos = [...(legacyRes.data || []), ...filteredNewVideos]

      return NextResponse.json({ videos: allVideos })
    }

    // ==================== TYPE: RESOURCE (from resources + shared_resources) ====================
    if (type === 'resource') {
      // Get resources table
      let resourceQuery = supabase
        .from('resources')
        .select(`
          id,
          title,
          description,
          file_name,
          file_url,
          file_type,
          file_size,
          folder_id,
          batch_year,
          uploaded_by,
          created_at,
          updated_at,
          resource_folders(id, folder_name),
          resource_batch_access(batch_year)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      // Get shared_resources table
      let sharedQuery = supabase
        .from('shared_resources')
        .select(`
          id,
          title,
          description,
          resource_type,
          resource_url,
          file_size,
          folder_id,
          added_by,
          created_at,
          updated_at,
          resource_folders!folder_id(folder_name),
          shared_resource_batches(batch_year)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      const [rRes, sRes] = await Promise.all([resourceQuery, sharedQuery])

      if (rRes.error) throw rRes.error
      if (sRes.error) throw sRes.error

      // Filter resources
      const filteredResources = rRes.data?.filter((resource: any) => {
        if (resource.batch_year) {
          return resource.batch_year === userBatchYear
        }

        if (resource.resource_batch_access && resource.resource_batch_access.length > 0) {
          return resource.resource_batch_access.some((batch: any) => batch.batch_year === userBatchYear)
        }

        return true
      }) || []

      // Filter shared_resources
      const filteredShared = sRes.data?.filter((resource: any) => {
        if (!resource.shared_resource_batches || resource.shared_resource_batches.length === 0) {
          return true
        }
        return resource.shared_resource_batches.some((batch: any) => batch.batch_year === userBatchYear)
      }) || []

      // Combine both
      const allResources = [...filteredResources, ...filteredShared]

      return NextResponse.json({ resources: allResources })
    }

    // ==================== DEFAULT: RETURN ALL ====================
    // Legacy videos
    let legacyQuery = supabase
      .from('class_recordings')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (userBatchYear) {
      legacyQuery = legacyQuery.or(`batch_year.eq.${userBatchYear},batch_year.is.null`)
    }

    // New video_resources
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

    // Resources
    let resourceQuery = supabase
      .from('resources')
      .select(`
        id,
        title,
        description,
        file_name,
        file_url,
        file_type,
        file_size,
        folder_id,
        batch_year,
        uploaded_by,
        created_at,
        updated_at,
        resource_folders(id, folder_name),
        resource_batch_access(batch_year)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    // Shared resources
    let sharedQuery = supabase
      .from('shared_resources')
      .select(`
        id,
        title,
        description,
        resource_type,
        resource_url,
        file_size,
        folder_id,
        added_by,
        created_at,
        updated_at,
        resource_folders!folder_id(folder_name),
        shared_resource_batches(batch_year)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    const [legacyRes, newVRes, rRes, sRes] = await Promise.all([
      legacyQuery,
      newVideoQuery,
      resourceQuery,
      sharedQuery,
    ])

    if (legacyRes.error) throw legacyRes.error
    if (newVRes.error) throw newVRes.error
    if (rRes.error) throw rRes.error
    if (sRes.error) throw sRes.error

    // Filter new videos
    const filteredNewVideos = newVRes.data?.filter((video: any) => {
      if (!video.video_resource_batches || video.video_resource_batches.length === 0) {
        return true
      }
      return video.video_resource_batches.some((batch: any) => batch.batch_year === userBatchYear)
    }) || []

    // Combine videos
    const allVideos = [...(legacyRes.data || []), ...filteredNewVideos]

    // Filter resources
    const filteredResources = rRes.data?.filter((resource: any) => {
      if (resource.batch_year) {
        return resource.batch_year === userBatchYear
      }

      if (resource.resource_batch_access && resource.resource_batch_access.length > 0) {
        return resource.resource_batch_access.some((batch: any) => batch.batch_year === userBatchYear)
      }

      return true
    }) || []

    // Filter shared resources
    const filteredShared = sRes.data?.filter((resource: any) => {
      if (!resource.shared_resource_batches || resource.shared_resource_batches.length === 0) {
        return true
      }
      return resource.shared_resource_batches.some((batch: any) => batch.batch_year === userBatchYear)
    }) || []

    const allResources = [...filteredResources, ...filteredShared]

    return NextResponse.json({ videos: allVideos, resources: allResources })
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
    const { title, description, resource_url, file_url, file_name, file_type, file_size, folder_id, batch_years, batch_year, resourceType } = body

    // Upload to resources table
    if (resourceType === 'resource' || file_url) {
      const { data: resourceData, error: resourceError } = await supabase
        .from('resources')
        .insert([
          {
            title,
            description,
            file_name: file_name || title,
            file_url: file_url || resource_url,
            file_type: file_type || 'file',
            file_size: file_size || null,
            folder_id: folder_id || null,
            batch_year: batch_year || null,
            uploaded_by: user.user_id,
            is_active: true,
          },
        ])
        .select()
        .single()

      if (resourceError) throw resourceError

      if (batch_years && batch_years.length > 0) {
        const batchInserts = batch_years.map((year: number) => ({
          resource_id: resourceData.id,
          batch_year: year,
        }))

        const { error: batchError } = await supabase
          .from('resource_batch_access')
          .insert(batchInserts)

        if (batchError) throw batchError
      }

      return NextResponse.json(
        { message: 'Resource created successfully', data: resourceData },
        { status: 201 }
      )
    }

    // Upload to video_resources table
    if (resourceType === 'video' || resource_url) {
      const { data: videoData, error: videoError } = await supabase
        .from('video_resources')
        .insert([
          {
            title,
            description,
            resource_url: resource_url || file_url,
            folder_id: folder_id || null,
            added_by: user.user_id,
            is_active: true,
          },
        ])
        .select()
        .single()

      if (videoError) throw videoError

      if (batch_years && batch_years.length > 0) {
        const batchInserts = batch_years.map((year: number) => ({
          video_resource_id: videoData.id,
          batch_year: year,
        }))

        const { error: batchError } = await supabase
          .from('video_resource_batches')
          .insert(batchInserts)

        if (batchError) throw batchError
      }

      return NextResponse.json(
        { message: 'Video resource created successfully', data: videoData },
        { status: 201 }
      )
    }

    // Upload to shared_resources table
    const { data: sharedData, error: sharedError } = await supabase
      .from('shared_resources')
      .insert([
        {
          title,
          description,
          resource_type: file_type || resourceType || 'file',
          resource_url: file_url || resource_url,
          file_size: file_size || null,
          folder_id: folder_id || null,
          added_by: user.user_id,
          is_active: true,
        },
      ])
      .select()
      .single()

    if (sharedError) throw sharedError

    if (batch_years && batch_years.length > 0) {
      const batchInserts = batch_years.map((year: number) => ({
        shared_resource_id: sharedData.id,
        batch_year: year,
      }))

      const { error: batchError } = await supabase
        .from('shared_resource_batches')
        .insert(batchInserts)

      if (batchError) throw batchError
    }

    return NextResponse.json(
      { message: 'Shared resource created successfully', data: sharedData },
      { status: 201 }
    )
  } catch (err) {
    console.error('Error creating resource:', err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const user = await verifyUser(token)
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const supabase = getSupabaseAdmin()
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('user_type')
      .eq('user_id', user.user_id)
      .single()

    if (userError || userData?.user_type !== 'admin') {
      return NextResponse.json({ message: 'Only admins can edit resources' }, { status: 403 })
    }

    const body = await request.json()
    const { id, title, description, file_url, file_name, file_type, file_size, folder_id, batch_years, resourceType } = body

    if (!id) {
      return NextResponse.json({ message: 'Resource ID is required' }, { status: 400 })
    }

    // Update resources table
    if (resourceType === 'resource' || file_url) {
      const { data: resourceData, error: resourceError } = await supabase
        .from('resources')
        .update({
          title,
          description,
          file_name: file_name || title,
          file_url,
          file_type: file_type || 'file',
          file_size: file_size || null,
          folder_id: folder_id || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (resourceError) throw resourceError

      if (batch_years) {
        await supabase.from('resource_batch_access').delete().eq('resource_id', id)

        if (batch_years.length > 0) {
          const batchInserts = batch_years.map((year: number) => ({
            resource_id: id,
            batch_year: year,
          }))

          const { error: batchError } = await supabase
            .from('resource_batch_access')
            .insert(batchInserts)

          if (batchError) throw batchError
        }
      }

      return NextResponse.json({ message: 'Resource updated successfully', data: resourceData })
    }

    // Update video_resources table
    if (resourceType === 'video') {
      const { data: videoData, error: videoError } = await supabase
        .from('video_resources')
        .update({
          title,
          description,
          resource_url: file_url,
          folder_id: folder_id || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (videoError) throw videoError

      if (batch_years) {
        await supabase.from('video_resource_batches').delete().eq('video_resource_id', id)

        if (batch_years.length > 0) {
          const batchInserts = batch_years.map((year: number) => ({
            video_resource_id: id,
            batch_year: year,
          }))

          const { error: batchError } = await supabase
            .from('video_resource_batches')
            .insert(batchInserts)

          if (batchError) throw batchError
        }
      }

      return NextResponse.json({ message: 'Video updated successfully', data: videoData })
    }

    return NextResponse.json({ message: 'Invalid resource type' }, { status: 400 })
  } catch (err) {
    console.error('Error updating resource:', err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const user = await verifyUser(token)
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const supabase = getSupabaseAdmin()
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('user_type')
      .eq('user_id', user.user_id)
      .single()

    if (userError || userData?.user_type !== 'admin') {
      return NextResponse.json({ message: 'Only admins can delete resources' }, { status: 403 })
    }

    const body = await request.json()
    const { id, resourceType } = body

    if (!id) {
      return NextResponse.json({ message: 'Resource ID is required' }, { status: 400 })
    }

    // Delete from appropriate table
    if (resourceType === 'resource') {
      const { error } = await supabase.from('resources').update({ is_active: false }).eq('id', id)
      if (error) throw error
    } else if (resourceType === 'video') {
      const { error } = await supabase.from('video_resources').update({ is_active: false }).eq('id', id)
      if (error) throw error
    } else {
      const { error } = await supabase.from('shared_resources').update({ is_active: false }).eq('id', id)
      if (error) throw error
    }

    return NextResponse.json({ message: 'Resource deleted successfully' })
  } catch (err) {
    console.error('Error deleting resource:', err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
