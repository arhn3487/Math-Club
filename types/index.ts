// User Types
export interface User {
  id: string
  created_at: string
  full_name?: string
  profile_pic?: string
  mist_id_card?: string
  mist_id?: number
  email: string
  password?: string
  granted?: boolean
  phone?: string
  admin?: boolean
  vjudge_id?: string
  cf_id?: string
  codechef_id?: string
  atcoder_id?: string
  vjudge_verified?: boolean
  cf_verified?: boolean
  tshirt_size?: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | '3XL' | '4XL'
  batch_name?: string
}

// Batch Types
export interface Batch {
  id: string
  created_at: string
  name?: string
}

export interface BatchMember {
  id: string
  created_at: string
  batch_id?: string
  mem_id?: string
}

export interface BatchInstructor {
  id: string
  created_at: string
  batch_id?: string
  ins_id?: string
}

// Course Types
export interface Course {
  id: string
  created_at: string
  title?: string
  description?: string
  batch_id?: string
  image?: string
}

export interface CourseContent {
  id: string
  created_at: string
  name?: string
  hints?: string[]
  problem_link?: string
  video_link?: string
  course_id?: string
  code?: string
  oj?: string
  problem_id?: string
}

export interface Schedule {
  id: string
  created_at: string
  course_id?: string
  time?: string
  event_name?: string
  link?: string
}

// Contest Types
export interface ContestReportRoom {
  id: string
  created_at: string
  room_name: string
  contest_type: string
  tfc_room_id?: string
  tfc_percentage: number
  tsc_percentage: number
}

export interface ContestRoomContests {
  id: string
  created_at: string
  room_id?: string
  contest_id: string
  weight: number
  contest_name: string
}

export interface CustomContest {
  id: number
  name: string
  platform?: string
  link?: string
  description?: string
  start_time: string
  end_time: string
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface PublicContestReport {
  id: string
  created_at: string
  shared_contest_id?: string
  json_string?: string
  updated_at?: string
}

// Team Collection Types
export interface TeamCollection {
  id: string
  created_at: string
  room_id: string
  contest_id?: string
  token: string
  is_open: boolean
  title?: string
  allow_non_participants: boolean
  finalized: boolean
  finalized_at?: string
  phase: number
  phase1_deadline?: string
  phase2_started_at?: string
  phase2_email_sent: boolean
  collection_name?: string
}

export interface TeamCollectionTeam {
  id: string
  created_at: string
  collection_id: string
  team_title: string
  member_vjudge_ids: string[]
  approved: boolean
  approved_by?: string
  approved_at?: string
  coach?: string
  coach_vjudge_id?: string
}

export interface TeamCollectionParticipation {
  id: string
  created_at: string
  collection_id: string
  user_id: string
  vjudge_id?: string
  will_participate: boolean
  updated_at: string
}

// Achievement Types
export interface Achievement {
  id: string
  created_at: string
  title?: string
  image?: string
  description?: string
  date?: string
  intro?: string
}

export interface AchievementTag {
  achievement_id: string
  tag_id: number
}

export interface Tag {
  id: number
  name: string
  created_at?: string
}

export interface FeaturedAchievement {
  id: number
  created_at: string
  achievement_id: string
}

// Alumni Types
export interface AlumniBatch {
  id: string
  label: string
  created_at?: string
  updated_at?: string
}

export interface AlumniMember {
  id: string
  batch_id?: string
  full_name: string
  position_in_club?: string
  image_url?: string
  linkedin_url?: string
  highlight?: boolean
  created_at?: string
  updated_at?: string
  cf_handle?: string
  club_position_year?: number
  designation?: string
  company_name?: string
}

// Landing Page Types
export interface LandingFeature {
  id: number
  title: string
  description: string
  position: number
  active: boolean
  created_at?: string
  updated_at?: string
}

export interface LandingStat {
  id: number
  title: string
  value: number
  suffix?: string
  position: number
  active: boolean
  created_at?: string
  updated_at?: string
}

export interface LandingTestimonial {
  id: number
  name: string
  title: string
  quote: string
  image_url?: string
  position: number
  active: boolean
  created_at?: string
  updated_at?: string
}

export interface LandingTimeline {
  id: number
  year: string
  title: string
  body: string
  position: number
  active: boolean
  created_at?: string
  updated_at?: string
}

export interface ICPCJourney {
  id: string
  created_at: string
  year?: string
  competition?: string
  hosted_uni?: string
  num_of_teams?: number
  images?: string[]
  description?: string
  references?: string
  best_rank?: number
}

// Typing Game Types
export interface Room {
  id: string
  name?: string
  room_code: string
  time: number
  status: string
  scheduled_start_time?: string
  max_participants?: number
  word_set?: Record<string, unknown>
  created_by?: string
  created_at?: string
  started_at?: string
  completed_at?: string
}

export interface RoomParticipant {
  id: string
  room_id: string
  user_name: string
  wpm?: number
  accuracy?: number
  progress?: number
  current_wpm?: number
  completed?: boolean
  finished_at?: string
  joined_at?: string
}

export interface Word {
  id: string
  word: string
  difficulty?: number
  length?: number
  created_at?: string
}

// Demerit Types
export interface Demerit {
  id: string
  created_at: string
  contest_id?: string
  vjudge_id?: string
  demerit_point?: number
  reason?: string
}
