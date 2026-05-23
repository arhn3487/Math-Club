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

    // ==================== TYPE: VIDEO (from class_recordings) ====================
    if (type === 'video') {
      let query = supabase
        .from('class_recordings')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      // Filter by batch if user has batch_year set
      if (userBatchYear) {
        query = query.or(`batch_year.eq.${userBatchYear},batch_year.is.null`)
      }

      const { data: videos, error } = await query

      if (error) throw error

      return NextResponse.json({ videos: videos || [] })
    }

    // ==================== TYPE: RESOURCE (from resources table) ====================
    if (type === 'resource') {
      // Get resources either:
      // 1. Directly assigned to user's batch via batch_year column
      // 2. Assigned to user's batch via resource_batch_access table
      // 3. Visible to all (batch_year is null)

      let query = supabase
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

      const { data: resources, error } = await query

      if (error) throw error

      // Filter resources based on batch access
      const filteredResources = resources?.filter((resource: any) => {
        // If direct batch_year is set
        if (resource.batch_year) {
          return resource.batch_year === userBatchYear
        }

        // If resource_batch_access has entries, check if user's batch is there
        if (resource.resource_batch_access && resource.resource_batch_access.length > 0) {
          return resource.resource_batch_access.some((batch: any) => batch.batch_year === userBatchYear)
        }

        // If no batch restrictions, visible to all
        return true
      })

      return NextResponse.json({ resources: filteredResources || [] })
    }

    // ==================== DEFAULT: RETURN BOTH ====================
    let videoQuery = supabase
      .from('class_recordings')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (userBatchYear) {
      videoQuery = videoQuery.or(`batch_year.eq.${userBatchYear},batch_year.is.null`)
    }

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

    const [vRes, rRes] = await Promise.all([videoQuery, resourceQuery])

    if (vRes.error) throw vRes.error
    if (rRes.error) throw rRes.error

    // Filter resources by batch
    const filteredResources = rRes.data?.filter((resource: any) => {
      if (resource.batch_year) {
        return resource.batch_year === userBatchYear
      }

      if (resource.resource_batch_access && resource.resource_batch_access.length > 0) {
        return resource.resource_batch_access.some((batch: any) => batch.batch_year === userBatchYear)
      }

      return true
    })

    return NextResponse.json({
      videos: vRes.data || [],
      resources: filteredResources || []
    })
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
    const { title, description, file_name, file_url, file_type, file_size, folder_id, batch_years, batch_year } = body

    // Create resource
    const { data: resourceData, error: resourceError } = await supabase
      .from('resources')
      .insert([
        {
          title,
          description,
          file_name,
          file_url,
          file_type,
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

    // Add batch access for multiple batches if provided
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

    // Verify user is admin
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
    const { id, title, description, file_name, file_url, file_type, file_size, folder_id, batch_years, batch_year } = body

    if (!id) {
      return NextResponse.json({ message: 'Resource ID is required' }, { status: 400 })
    }

    // Update resource
    const { data: resourceData, error: resourceError } = await supabase
      .from('resources')
      .update({
        title,
        description,
        file_name,
        file_url,
        file_type,
        file_size: file_size || null,
        folder_id: folder_id || null,
        batch_year: batch_year || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (resourceError) throw resourceError

    // Update batch access if batch_years provided
    if (batch_years && batch_years.length > 0) {
      // Delete old batch access
      await supabase.from('resource_batch_access').delete().eq('resource_id', id)

      // Insert new batch access
      const batchInserts = batch_years.map((year: number) => ({
        resource_id: id,
        batch_year: year,
      }))

      const { error: batchError } = await supabase
        .from('resource_batch_access')
        .insert(batchInserts)

      if (batchError) throw batchError
    }

    return NextResponse.json({ message: 'Resource updated successfully', data: resourceData })
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

    // Verify user is admin
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
    const { id } = body

    if (!id) {
      return NextResponse.json({ message: 'Resource ID is required' }, { status: 400 })
    }

    // Soft delete (set is_active to false)
    const { error } = await supabase.from('resources').update({ is_active: false }).eq('id', id)

    if (error) throw error

    return NextResponse.json({ message: 'Resource deleted successfully' })
  } catch (err) {
    console.error('Error deleting resource:', err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
