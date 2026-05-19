import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseClient'
import { verifyPassword, generateToken } from '@/lib/auth'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, password, user_type } = body

    // Validation
    if (!user_id || !password || !user_type) {
      return NextResponse.json(
        { success: false, message: 'User ID, password, and user type are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Invalid password' },
        { status: 400 }
      )
    }

    const admin = getSupabaseAdmin()
    let user = null

    // Query based on user_type
    if (user_type === 'student') {
      const { data } = await admin
        .from('users')
        .select('*')
        .eq('student_id', user_id)
        .eq('user_type', 'student')
        .single()
      user = data
      console.log('Searching student with student_id:', user_id, 'Found:', !!user)
    } else if (user_type === 'admin') {
      const { data } = await admin
        .from('users')
        .select('*')
        .eq('admin_id', user_id)
        .eq('user_type', 'admin')
        .single()
      user = data
      console.log('Searching admin with admin_id:', user_id, 'Found:', !!user)
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid user type' },
        { status: 400 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check if account is active
    if (!user.is_active) {
      return NextResponse.json(
        { success: false, message: 'Account is inactive' },
        { status: 403 }
      )
    }

    // Check if account is approved
    if (!user.is_approved) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Your account is pending admin approval. You will be notified once approved.' 
        },
        { status: 403 }
      )
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash)

    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        user_id: user.user_id,
        user_type: user.user_type,
        email: user.email,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        token,
        user: {
          user_id: user.user_id,
          user_type: user.user_type,
          full_name: user.full_name,
          email: user.email,
          profile_image_url: user.profile_image_url,
          student_id: user.student_id,
          admin_id: user.admin_id,
          batch_year: user.batch_year,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
