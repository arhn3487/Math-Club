import { NextRequest, NextResponse } from 'next/server'
import {
  validateUserId,
  validatePassword,
  getUserByUserIdWithPassword,
  verifyPassword,
  generateToken,
  getUserById,
} from '@/lib/auth'
import { LoginRequestDTO, LoginResponseDTO } from '@/types/dtos'

export async function POST(request: NextRequest): Promise<NextResponse<LoginResponseDTO>> {
  try {
    const body = await request.json() as LoginRequestDTO

    // ==================== VALIDATION ====================
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
          message: 'Invalid password format',
        },
        { status: 400 }
      )
    }

    // ==================== AUTHENTICATION ====================
    const user = await getUserByUserIdWithPassword(body.user_id)

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid credentials',
        },
        { status: 401 }
      )
    }

    if (!user.is_active) {
      return NextResponse.json(
        {
          success: false,
          message: 'User account is inactive',
        },
        { status: 403 }
      )
    }

    const passwordMatch = await verifyPassword(body.password, user.password_hash)

    if (!passwordMatch) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid credentials',
        },
        { status: 401 }
      )
    }

    // ==================== TOKEN GENERATION ====================
    const token = generateToken({
      id: user.id,
      user_id: user.user_id,
      user_type: user.user_type,
    })

    const userProfile = await getUserById(user.user_id)

    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        token,
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
      { status: 200 }
    )
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred during login',
      },
      { status: 500 }
    )
  }
}
