import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const {
      full_name,
      email,
      phone,
      batch_year,
      reason,
      password,
      confirm_password,
    } = await req.json()

    // Validation
    if (!full_name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
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

    // Check if email already exists
    const { data: existingUser } = await supabase
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

    // Generate verification token
    const verification_token = crypto.randomBytes(32).toString('hex')
    const verification_token_expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // Hash password
    const password_hash = await bcrypt.hash(password, 10)

    // Create signup request
    const { data: signupRequest, error: signupError } = await supabase
      .from('signup_requests')
      .insert([
        {
          full_name,
          email,
          phone,
          batch_year,
          reason,
          verification_token,
          verification_token_expires: verification_token_expires.toISOString(),
          status: 'pending',
          is_email_verified: false,
        },
      ])
      .select()
      .single()

    if (signupError) {
      console.error('Signup request error:', signupError)
      return NextResponse.json(
        { success: false, message: 'Failed to create signup request' },
        { status: 500 }
      )
    }

    // TODO: Send verification email using SendGrid
    // const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verification_token}`
    // await sendVerificationEmail(email, full_name, verificationLink)

    return NextResponse.json(
      {
        success: true,
        message:
          'Signup request created! Please check your email to verify your account. Admin will review and approve your request.',
        signup_request_id: signupRequest?.id,
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
