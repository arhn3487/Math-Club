import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { AuthPayload, UserProfileDTO } from '@/types/dtos'
import { query } from './postgres'
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
    const result = await query<UserEntity>(
      'SELECT * FROM users WHERE user_id = $1',
      [userId]
    )

    if (result.rows.length === 0) return null

    const user = result.rows[0]
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
  userId: string
): Promise<UserEntity | null> {
  try {
    const result = await query<UserEntity>(
      'SELECT * FROM users WHERE user_id = $1',
      [userId]
    )
    return result.rows.length > 0 ? result.rows[0] : null
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

    const result = await query<UserEntity>(
      `INSERT INTO users (id, user_id, password_hash, user_type, full_name, email, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [id, userId, passwordHash, userType, fullName, email, true, now, now]
    )

    if (result.rows.length === 0) {
      throw new Error('Failed to create user')
    }

    return result.rows[0]
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
