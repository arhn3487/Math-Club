// Reusable constants
export const APP_NAME = 'Math Club'
export const APP_VERSION = '1.0.0'

export const API_ENDPOINTS = {
  USERS: '/api/users',
  BATCHES: '/api/batches',
  COURSES: '/api/courses',
  CONTESTS: '/api/contests',
  ACHIEVEMENTS: '/api/achievements',
  ALUMNI: '/api/alumni',
}

export const NAVIGATION_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Batches', href: '/batches' },
  { label: 'Courses', href: '/courses' },
  { label: 'Contests', href: '/contests' },
  { label: 'Achievements', href: '/achievements' },
  { label: 'Alumni', href: '/alumni' },
  { label: 'Dashboard', href: '/dashboard' },
]

export const TSHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL']

export const CONTEST_PLATFORMS = [
  'Codeforces',
  'AtCoder',
  'CodeChef',
  'VJudge',
  'LeetCode',
  'Other',
]

export const PAGINATION = {
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
}

export const DATE_FORMAT = 'YYYY-MM-DD'
export const TIME_FORMAT = 'HH:mm:ss'
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'

export const BADGE_VARIANTS = ['primary', 'success', 'warning', 'danger'] as const

export const BUTTON_VARIANTS = ['primary', 'secondary', 'danger'] as const

export const ERROR_MESSAGES = {
  FETCH_FAILED: 'Failed to fetch data',
  CREATE_FAILED: 'Failed to create record',
  UPDATE_FAILED: 'Failed to update record',
  DELETE_FAILED: 'Failed to delete record',
  NETWORK_ERROR: 'Network error occurred',
  VALIDATION_ERROR: 'Validation error',
}

export const SUCCESS_MESSAGES = {
  CREATED: 'Created successfully',
  UPDATED: 'Updated successfully',
  DELETED: 'Deleted successfully',
}

export const COLORS = {
  primary: '#3b82f6',
  secondary: '#1e40af',
  accent: '#f97316',
  success: '#22c55e',
  warning: '#eab308',
  danger: '#ef4444',
  gray: '#6b7280',
}
