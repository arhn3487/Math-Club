import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { verifyToken, extractTokenFromHeader, hashPassword } from '@/lib/auth'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    // Verify admin token
    const authHeader = req.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader)

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload || !['admin', 'superuser'].includes(payload.user_type)) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    const {
      signup_request_id,
      action,
      reason: review_comment,
      password,
    } = await req.json()

    if (!signup_request_id || !action) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, message: 'Invalid action' },
        { status: 400 }
      )
    }

    // Get signup request
    const { data: signupRequest, error: fetchError } = await supabase
      .from('signup_requests')
      .select('*')
      .eq('id', signup_request_id)
      .single()

    if (fetchError || !signupRequest) {
      return NextResponse.json(
        { success: false, message: 'Signup request not found' },
        { status: 404 }
      )
    }

    const now = new Date().toISOString()

    if (action === 'approve') {
      if (!password) {
        return NextResponse.json(
          { success: false, message: 'Password is required for approval' },
          { status: 400 }
        )
      }

      // Hash password
      const password_hash = await hashPassword(password)

      // Create user account
      const user_id = `student_${crypto.randomBytes(4).toString('hex')}`

      const { error: createUserError } = await supabase
        .from('users')
        .insert([
          {
            user_id,
            password_hash,
            user_type: 'student',
            full_name: signupRequest.full_name,
            email: signupRequest.email,
            phone: signupRequest.phone,
            profile_image_url: signupRequest.profile_image_url,
            is_active: true,
            is_approved: true,
            email_verified: signupRequest.is_email_verified,
          },
        ])

      if (createUserError) {
        console.error('User creation error:', createUserError)
        return NextResponse.json(
          { success: false, message: 'Failed to create user account' },
          { status: 500 }
        )
      }

      // Update signup request status
      const { error: updateError } = await supabase
        .from('signup_requests')
        .update({
          status: 'approved',
          reviewed_by: payload.id,
          reviewed_at: now,
          updated_at: now,
        })
        .eq('id', signup_request_id)

      if (updateError) {
        console.error('Update error:', updateError)
        return NextResponse.json(
          { success: false, message: 'Failed to update signup request' },
          { status: 500 }
        )
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Student approved successfully',
          user_id,
        },
        { status: 200 }
      )
    } else if (action === 'reject') {
      // Update signup request status to rejected
      const { error: updateError } = await supabase
        .from('signup_requests')
        .update({
          status: 'rejected',
          reviewed_by: payload.id,
          reviewed_at: now,
          review_comment,
          updated_at: now,
        })
        .eq('id', signup_request_id)

      if (updateError) {
        console.error('Update error:', updateError)
        return NextResponse.json(
          { success: false, message: 'Failed to update signup request' },
          { status: 500 }
        )
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Signup request rejected',
        },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
