import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseClient'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const full_name = formData.get('full_name') as string
    const email = formData.get('email') as string
    const student_id = formData.get('student_id') as string
    const admin_id = formData.get('admin_id') as string
    const batch_year = formData.get('batch_year') as string
    const password = formData.get('password') as string
    const confirm_password = formData.get('confirm_password') as string
    const user_type = formData.get('user_type') as string
    const profile_image = formData.get('profile_image') as File | null

    // Validation
    if (!full_name || !email || !password || !user_type) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate user_type
    if (!['student', 'admin'].includes(user_type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user type' },
        { status: 400 }
      )
    }

    // Validate student_id or admin_id based on type
    if (user_type === 'student' && !student_id) {
      return NextResponse.json(
        { success: false, message: 'Student ID is required for students' },
        { status: 400 }
      )
    }

    if (user_type === 'admin' && !admin_id) {
      return NextResponse.json(
        { success: false, message: 'Admin ID is required for admins' },
        { status: 400 }
      )
    }

    if (password !== confirm_password) {
      return NextResponse.json(
        { success: false, message: 'Passwords do not match' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    const admin = getSupabaseAdmin()

    // Check if email already exists
    const { data: existingUser } = await admin
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email already registered' },
        { status: 400 }
      )
    }

    // Check if student_id or admin_id already exists
    if (user_type === 'student') {
      const { data: existingStudentId } = await admin
        .from('users')
        .select('id')
        .eq('student_id', student_id)
        .single()

      if (existingStudentId) {
        return NextResponse.json(
          { success: false, message: 'Student ID already registered' },
          { status: 400 }
        )
      }
    } else {
      const { data: existingAdminId } = await admin
        .from('users')
        .select('id')
        .eq('admin_id', admin_id)
        .single()

      if (existingAdminId) {
        return NextResponse.json(
          { success: false, message: 'Admin ID already registered' },
          { status: 400 }
        )
      }
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10)

    // Generate user_id
    const prefix = user_type === 'student' ? 'STU' : 'ADM'
    const user_id = `${prefix}-${Date.now()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`

    // Upload profile image if provided
    let profile_image_url = null
    if (profile_image && profile_image.size > 0) {
      try {
        const fileExt = profile_image.name.split('.').pop()
        const fileName = `${user_id}-${Date.now()}.${fileExt}`
        const filePath = `profiles/${fileName}`

        console.log('Starting image upload:', { fileName, filePath, size: profile_image.size })

        const arrayBuffer = await profile_image.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const { error: uploadError, data: uploadData } = await admin.storage
          .from('math-club-images')
          .upload(filePath, buffer, {
            contentType: profile_image.type,
            upsert: false,
          })

        if (uploadError) {
          console.error('Image upload error:', uploadError)
        } else {
          console.log('Image uploaded successfully:', uploadData)
          // Get public URL - getPublicUrl returns the URL directly
          const publicUrlResult = admin.storage
            .from('math-club-images')
            .getPublicUrl(filePath)

          profile_image_url = publicUrlResult.data?.publicUrl || null
          console.log('Image URL retrieved:', profile_image_url)
        }
      } catch (imageError) {
        console.error('Image processing error:', imageError)
        // Continue without image - not critical
      }
    } else {
      console.log('No profile image provided or file size is 0')
    }

    // Create user account - NOT APPROVED initially
    const { data: newUser, error: userError } = await admin
      .from('users')
      .insert([
        {
          user_id,
          email,
          password_hash,
          user_type,
          full_name,
          student_id: user_type === 'student' ? student_id : null,
          admin_id: user_type === 'admin' ? admin_id : null,
          batch_year: user_type === 'student' ? parseInt(batch_year) : null,
          profile_image_url,
          is_active: true,
          is_approved: user_type === 'admin' ? true : false, // Admins auto-approved, students need approval
          email_verified: false,
        },
      ])
      .select()
      .single()

    if (userError) {
      console.error('User creation error:', userError)
      return NextResponse.json(
        { success: false, message: 'Failed to create account' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: user_type === 'student' 
          ? 'Account created! An admin will review and approve your account shortly.'
          : 'Admin account created successfully! You can now login.',
        user_id,
        user_type,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
