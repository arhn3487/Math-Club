import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseClient'
import { verifyToken, hashPassword } from '@/lib/auth'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

async function getCurrentUser(token: string) {
  const payload = verifyToken(token)
  if (!payload) return null

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('users')
    .select('id, user_id, user_type, full_name, email, batch_year, profile_image_url, student_id, admin_id')
    .eq('user_id', payload.user_id)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const user = await getCurrentUser(token)
    if (!user) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Failed to fetch profile:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const currentUser = await getCurrentUser(token)
    if (!currentUser) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const formData = await request.formData()
    const full_name = String(formData.get('full_name') || '').trim()
    const email = String(formData.get('email') || '').trim()
    const password = String(formData.get('password') || '')
    const batch_year = String(formData.get('batch_year') || '').trim()
    const profile_image = formData.get('profile_image') as File | null

    if (!full_name || !email) {
      return NextResponse.json({ message: 'Full name and email are required' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    const { data: existingEmailUser, error: emailCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .neq('id', currentUser.id)
      .maybeSingle()

    if (emailCheckError) {
      throw emailCheckError
    }

    if (existingEmailUser) {
      return NextResponse.json({ message: 'Email is already in use' }, { status: 400 })
    }

    const updates: Record<string, unknown> = {
      full_name,
      email,
      updated_at: new Date().toISOString(),
    }

    if (currentUser.user_type === 'student') {
      updates.batch_year = batch_year ? Number(batch_year) : null
    }

    if (password.trim()) {
      updates.password_hash = await hashPassword(password)
    }

    if (profile_image && profile_image.size > 0) {
      if (!ALLOWED_IMAGE_TYPES.includes(profile_image.type)) {
        return NextResponse.json(
          { message: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
          { status: 400 }
        )
      }

      if (profile_image.size > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          { message: 'File size must be less than 5MB' },
          { status: 400 }
        )
      }

      const fileExtension = profile_image.name.split('.').pop() || 'jpg'
      const fileName = `profile-${currentUser.user_id}-${Date.now()}.${fileExtension}`
      const filePath = `profiles/${fileName}`

      const buffer = Buffer.from(await profile_image.arrayBuffer())
      const { error: uploadError } = await supabase.storage
        .from('math-club-images')
        .upload(filePath, buffer, {
          contentType: profile_image.type,
          upsert: false,
        })

      if (uploadError) {
        console.error('Profile image upload error:', uploadError)
        return NextResponse.json({ message: 'Failed to upload image' }, { status: 500 })
      }

      const { data: publicUrlData } = supabase.storage
        .from('math-club-images')
        .getPublicUrl(filePath)

      updates.profile_image_url = publicUrlData?.publicUrl || null
    }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', currentUser.id)
      .select('id, user_id, user_type, full_name, email, batch_year, profile_image_url, student_id, admin_id')
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ user: data })
  } catch (error) {
    console.error('Failed to update profile:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
