import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const signup_request_id = formData.get('signup_request_id') as string

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      )
    }

    if (!signup_request_id) {
      return NextResponse.json(
        { success: false, message: 'Signup request ID is required' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    // Create unique filename
    const fileExtension = file.name.split('.').pop()
    const fileName = `signup-${signup_request_id}-${Date.now()}.${fileExtension}`
    const filePath = `profile-images/${fileName}`

    // Upload to Supabase Storage
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { success: false, message: 'Failed to upload image' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath)

    const image_url = urlData?.publicUrl

    // Update signup request with image URL
    const { error: updateError } = await supabase
      .from('signup_requests')
      .update({
        profile_image_url: image_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', signup_request_id)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { success: false, message: 'Failed to save image reference' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Image uploaded successfully',
        image_url,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
