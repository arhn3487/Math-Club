import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { AuthPayload, UserProfileDTO } from '@/types/dtos'
import { supabase, getSupabaseAdmin } from './supabaseClient'
import { UserEntity } from '@/types/dtos'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const TOKEN_EXPIRATION = '7d'

// ==================== PASSWORD UTILITIES ====================

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// ==================== TOKEN UTILITIES ====================

export function generateToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRATION,
  })
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload
    return decoded
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null
  const parts = authHeader.split(' ')
  return parts.length === 2 && parts[0].toLowerCase() === 'bearer'
    ? parts[1]
    : null
}

// ==================== USER OPERATIONS ====================

export async function getUserById(userId: string): Promise<UserProfileDTO | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      console.error('Error fetching user:', error)
      return null
    }

    const user = data as UserEntity
    return {
      id: user.id,
      user_id: user.user_id,
      user_type: user.user_type,
      full_name: user.full_name,
      email: user.email,
      is_active: user.is_active,
    }
  } catch (error) {
    console.error('Error fetching user:', error)
    throw error
  }
}

export async function getUserByUserIdWithPassword(
  userIdOrEmail: string
): Promise<UserEntity | null> {
  try {
    const admin = getSupabaseAdmin()

    // Try to find by email first
    const { data: emailData, error: emailError } = await admin
      .from('users')
      .select('*')
      .eq('email', userIdOrEmail)
      .single()

    if (emailData) {
      return emailData as UserEntity
    }

    // If not found by email, try user_id
    const { data: userIdData, error: userIdError } = await admin
      .from('users')
      .select('*')
      .eq('user_id', userIdOrEmail)
      .single()

    if (userIdData) {
      return userIdData as UserEntity
    }

    return null
  } catch (error) {
    console.error('Error fetching user:', error)
    throw error
  }
}

export async function createUser(
  userId: string,
  passwordHash: string,
  fullName: string,
  email: string,
  userType: 'student' | 'admin'
): Promise<UserEntity> {
  try {
    const id = `${userType}_${userId}_${Date.now()}`
    const now = new Date()

    const { data, error } = await getSupabaseAdmin()
      .from('users')
      .insert({
        id,
        user_id: userId,
        password_hash: passwordHash,
        user_type: userType,
        full_name: fullName,
        email,
        is_active: true,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single()

    if (error || !data) {
      throw new Error(`Failed to create user: ${error?.message}`)
    }

    return data as UserEntity
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

// ==================== VALIDATION ====================

export function validateUserId(userId: string): boolean {
  return userId && userId.trim().length > 0 && userId.length <= 50
}

export function validatePassword(password: string): boolean {
  return password && password.length >= 6
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateFullName(fullName: string): boolean {
  return fullName && fullName.trim().length > 0 && fullName.length <= 100
}
