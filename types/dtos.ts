// ==================== ENTITIES ====================
// Database entities - represent actual database records

export interface UserEntity {
  id: string
  user_id: string
  password_hash: string
  user_type: 'student' | 'admin'
  full_name: string
  email: string
  is_active: boolean
  created_at: Date
  updated_at: Date
}

// ==================== DTOs ====================
// Data Transfer Objects - for API requests/responses

export interface LoginRequestDTO {
  user_id: string
  password: string
}

export interface LoginResponseDTO {
  success: boolean
  message: string
  token?: string
  user?: {
    id: string
    user_id: string
    user_type: 'student' | 'admin'
    full_name: string
    email: string
  }
}

export interface UserProfileDTO {
  id: string
  user_id: string
  user_type: 'student' | 'admin'
  full_name: string
  email: string
  is_active: boolean
}

export interface RegisterRequestDTO {
  user_id: string
  password: string
  full_name: string
  email: string
  user_type: 'student' | 'admin'
}

export interface AuthPayload {
  id: string
  user_id: string
  user_type: 'student' | 'admin'
  iat?: number
  exp?: number
}
