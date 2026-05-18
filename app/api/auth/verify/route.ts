import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'
import { UserProfileDTO } from '@/types/dtos'

interface VerifyResponseDTO {
  success: boolean
  message: string
  user?: UserProfileDTO
}

export async function GET(request: NextRequest): Promise<NextResponse<VerifyResponseDTO>> {
  try {
    const authHeader = request.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader)

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'No token provided',
        },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)

    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid or expired token',
        },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Token is valid',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred during token verification',
      },
      { status: 500 }
    )
  }
}
