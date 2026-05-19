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

// ==================== EXAM SYSTEM ====================
export interface ExamDTO {
  id: number
  exam_name: string
  description: string
  total_marks: number
  duration_minutes: number
  created_by: string
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface ExamQuestionDTO {
  id: number
  exam_id: number
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: string
  marks_per_question: number
  question_order: number
}

export interface ExamResultDTO {
  id: number
  exam_id: number
  user_id: string
  total_questions: number
  correct_answers: number
  total_marks_obtained: number
  total_marks: number
  percentage: number
  started_at: Date
  completed_at: Date
}

export interface StudentExamResponseDTO {
  exam_id: number
  user_id: string
  question_id: number
  selected_answer: string
  is_correct: boolean
}

export interface CreateExamRequestDTO {
  exam_name: string
  description: string
  total_marks: number
  duration_minutes: number
  questions: {
    question_text: string
    option_a: string
    option_b: string
    option_c: string
    option_d: string
    correct_answer: string
    marks_per_question: number
  }[]
}

// ==================== CLASS RECORDINGS ====================
export interface ClassRecordingDTO {
  id: number
  title: string
  description: string
  youtube_url: string
  batch_year: number | null
  uploaded_by: string
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface CreateClassRecordingRequestDTO {
  title: string
  description: string
  youtube_url: string
  batch_year: number | null
}

// ==================== NOTICES ====================
export interface NoticeDTO {
  id: number
  title: string
  description: string
  notice_type: 'event' | 'announcement' | 'general'
  event_date: Date | null
  created_by: string
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface CreateNoticeRequestDTO {
  title: string
  description: string
  notice_type: 'event' | 'announcement' | 'general'
  event_date: Date | null
}

// ==================== USER MANAGEMENT ====================
export interface UserManagementDTO {
  id: string
  user_id: string
  student_id?: string
  admin_id?: string
  user_type: 'student' | 'admin'
  full_name: string
  email: string
  batch_year: number | null
  profile_image_url?: string
  is_active: boolean
  created_at: Date
}
