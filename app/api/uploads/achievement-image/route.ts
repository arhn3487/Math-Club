import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseClient'
import { extractTokenFromHeader, verifyToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const token = extractTokenFromHeader(req.headers.get('authorization'))
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.user_type !== 'superuser') {
      return NextResponse.json({ success: false, message: 'Superuser access required' }, { status: 403 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 })
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      )
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const fileName = `achievement-${Date.now()}.${fileExtension}`
    const filePath = `achievements/${fileName}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabase.storage
      .from('math-club-images')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Achievement image upload error:', uploadError)
      return NextResponse.json({ success: false, message: 'Failed to upload image' }, { status: 500 })
    }

    const { data: publicUrlData } = supabase.storage.from('math-club-images').getPublicUrl(filePath)

    return NextResponse.json({
      success: true,
      image_url: publicUrlData?.publicUrl || null,
    })
  } catch (error) {
    console.error('Achievement image upload error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}