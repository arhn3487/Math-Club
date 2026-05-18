import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Find signup request by token
    const { data: signupRequest, error: fetchError } = await supabase
      .from('signup_requests')
      .select('*')
      .eq('verification_token', token)
      .single()

    if (fetchError || !signupRequest) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }

    // Check if token is expired
    const tokenExpiry = new Date(signupRequest.verification_token_expires)
    if (tokenExpiry < new Date()) {
      return NextResponse.json(
        { success: false, message: 'Verification token has expired' },
        { status: 400 }
      )
    }

    // Check if already verified
    if (signupRequest.is_email_verified) {
      return NextResponse.json(
        {
          success: true,
          message: 'Email already verified. Awaiting admin approval.',
        },
        { status: 200 }
      )
    }

    // Update signup request to mark email as verified
    const { error: updateError } = await supabase
      .from('signup_requests')
      .update({
        is_email_verified: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', signupRequest.id)

    if (updateError) {
      console.error('Email verification error:', updateError)
      return NextResponse.json(
        { success: false, message: 'Failed to verify email' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message:
          'Email verified successfully! An admin will review your request soon.',
        signup_request_id: signupRequest.id,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Find signup request by token
    const { data: signupRequest, error: fetchError } = await supabase
      .from('signup_requests')
      .select('*')
      .eq('verification_token', token)
      .single()

    if (fetchError || !signupRequest) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }

    // Check if token is expired
    const tokenExpiry = new Date(signupRequest.verification_token_expires)
    if (tokenExpiry < new Date()) {
      return NextResponse.json(
        { success: false, message: 'Verification token has expired' },
        { status: 400 }
      )
    }

    // Update signup request to mark email as verified
    const { error: updateError } = await supabase
      .from('signup_requests')
      .update({
        is_email_verified: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', signupRequest.id)

    if (updateError) {
      console.error('Email verification error:', updateError)
      return NextResponse.json(
        { success: false, message: 'Failed to verify email' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message:
          'Email verified successfully! An admin will review your request soon.',
        signup_request_id: signupRequest.id,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
