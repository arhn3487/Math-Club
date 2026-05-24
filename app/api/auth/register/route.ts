import { NextRequest, NextResponse } from 'next/server'
import {
  validateUserId,
  validatePassword,
  validateEmail,
  validateFullName,
  hashPassword,
  createUser,
  getUserById,
  verifyToken,
  extractTokenFromHeader,
} from '@/lib/auth'
import { RegisterRequestDTO, LoginResponseDTO } from '@/types/dtos'

export async function POST(request: NextRequest): Promise<NextResponse<LoginResponseDTO>> {
  try {
    // ==================== ADMIN VERIFICATION ====================
    const authHeader = request.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader)

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized: No token provided',
        },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)

    if (!payload || payload.user_type !== 'superuser') {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized: Only superusers can register new users',
        },
        { status: 403 }
      )
    }

    // ==================== REQUEST VALIDATION ====================
    const body = await request.json() as RegisterRequestDTO

    if (!validateUserId(body.user_id)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid user ID format',
        },
        { status: 400 }
      )
    }

    if (!validatePassword(body.password)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Password must be at least 6 characters long',
        },
        { status: 400 }
      )
    }

    if (!validateEmail(body.email)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email format',
        },
        { status: 400 }
      )
    }

    if (!validateFullName(body.full_name)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid full name format',
        },
        { status: 400 }
      )
    }

    if (!['student', 'admin'].includes(body.user_type)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid user type',
        },
        { status: 400 }
      )
    }

    // ==================== USER CREATION ====================
    const passwordHash = await hashPassword(body.password)

    const newUser = await createUser(
      body.user_id,
      passwordHash,
      body.full_name,
      body.email,
      body.user_type
    )

    const userProfile = await getUserById(newUser.user_id)

    return NextResponse.json(
      {
        success: true,
        message: 'User registered successfully',
        user: userProfile
          ? {
              id: userProfile.id,
              user_id: userProfile.user_id,
              user_type: userProfile.user_type,
              full_name: userProfile.full_name,
              email: userProfile.email,
            }
          : undefined,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred during registration',
      },
      { status: 500 }
    )
  }
}
