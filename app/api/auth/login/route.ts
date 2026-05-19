import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseClient'
import { verifyPassword, generateToken } from '@/lib/auth'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, password } = body

    // Validation
    if (!user_id || !password) {
      return NextResponse.json(
        { success: false, message: 'User ID/Email and password are required' },
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

    // Find user by student_id, admin_id, or email
    let user = null
    const userIdUpper = user_id.toUpperCase()
    
    // Try student_id first (STU-xxxxx format)
    if (userIdUpper.startsWith('STU')) {
      const { data } = await admin
        .from('users')
        .select('*')
        .eq('student_id', user_id)
        .single()
      user = data
      console.log('Trying student_id:', user_id, 'Found:', !!user)
    } 
    // Try admin_id (ADM-xxxxx format)
    else if (userIdUpper.startsWith('ADM')) {
      const { data } = await admin
        .from('users')
        .select('*')
        .eq('admin_id', user_id)
        .single()
      user = data
      console.log('Trying admin_id:', user_id, 'Found:', !!user)
    } 
    // Try email
    else {
      const { data } = await admin
        .from('users')
        .select('*')
        .eq('email', user_id)
        .single()
      user = data
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
