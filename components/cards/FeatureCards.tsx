'use client'

import { Card, Badge } from '@/components/ui/BaseComponents'
import { User, Course, Achievement, AlumniMember } from '@/types'

// User Profile Card
export function UserCard({ user }: { user: User }) {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
      {user.profile_pic && (
        <img
          src={user.profile_pic}
          alt={user.full_name || 'User'}
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
      )}
      <div className="space-y-2">
        <h3 className="text-lg font-bold">{user.full_name || 'No Name'}</h3>
        <p className="text-gray-600 text-sm">{user.email}</p>
        {user.batch_name && (
          <Badge variant="primary">{user.batch_name}</Badge>
        )}
        <div className="flex gap-2 flex-wrap mt-2">
          {user.vjudge_id && user.vjudge_verified && (
            <Badge variant="success">VJudge ✓</Badge>
          )}
          {user.cf_id && user.cf_verified && (
            <Badge variant="success">Codeforces ✓</Badge>
          )}
        </div>
      </div>
    </Card>
  )
}

// Course Card
export function CourseCard({ course }: { course: Course }) {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
      {course.image && (
        <img
          src={course.image}
          alt={course.title || 'Course'}
          className="w-full h-40 object-cover rounded-lg mb-4"
        />
      )}
      <div className="space-y-2">
        <h3 className="text-lg font-bold">{course.title || 'Untitled Course'}</h3>
        <p className="text-gray-600 text-sm line-clamp-2">
          {course.description || 'No description'}
        </p>
      </div>
    </Card>
  )
}

// Achievement Card
export function AchievementCard({ achievement }: { achievement: Achievement }) {
  return (
    <Card className="text-center">
      {achievement.image && (
        <img
          src={achievement.image}
          alt={achievement.title || 'Achievement'}
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
      )}
      <div className="space-y-2">
        <h3 className="text-lg font-bold">{achievement.title || 'Achievement'}</h3>
        <p className="text-gray-600 text-sm">{achievement.intro || ''}</p>
        {achievement.date && (
          <p className="text-gray-500 text-xs">{achievement.date}</p>
        )}
      </div>
    </Card>
  )
}

// Alumni Card
export function AlumniCard({ alumni }: { alumni: AlumniMember }) {
  return (
    <Card className="text-center">
      {alumni.image_url && (
        <img
          src={alumni.image_url}
          alt={alumni.full_name}
          className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
        />
      )}
      <div className="space-y-2">
        <h3 className="text-lg font-bold">{alumni.full_name}</h3>
        {alumni.position_in_club && (
          <Badge variant="secondary">{alumni.position_in_club}</Badge>
        )}
        {alumni.designation && (
          <p className="text-gray-600 text-sm font-semibold">
            {alumni.designation}
          </p>
        )}
        {alumni.company_name && (
          <p className="text-gray-600 text-sm">{alumni.company_name}</p>
        )}
        {alumni.linkedin_url && (
          <a
            href={alumni.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm"
          >
            LinkedIn
          </a>
        )}
      </div>
    </Card>
  )
}

// Contest Card
export function ContestCard({
  title,
  status,
  startTime,
  endTime,
  onClick,
}: {
  title: string
  status: string
  startTime?: string
  endTime?: string
  onClick?: () => void
}) {
  return (
    <Card
      onClick={onClick}
      className="cursor-pointer hover:shadow-lg transition-shadow"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-bold">{title}</h3>
        <Badge
          variant={
            status === 'active'
              ? 'success'
              : status === 'upcoming'
                ? 'warning'
                : 'danger'
          }
        >
          {status}
        </Badge>
      </div>
      {startTime && (
        <p className="text-gray-600 text-sm">
          Start: {new Date(startTime).toLocaleString()}
        </p>
      )}
      {endTime && (
        <p className="text-gray-600 text-sm">
          End: {new Date(endTime).toLocaleString()}
        </p>
      )}
    </Card>
  )
}

// Stat Card for landing page
export function StatCard({
  title,
  value,
  suffix = '',
}: {
  title: string
  value: number
  suffix?: string
}) {
  return (
    <Card className="text-center">
      <p className="text-gray-600 text-sm mb-2">{title}</p>
      <p className="text-4xl font-bold text-blue-600">
        {value}
        {suffix}
      </p>
    </Card>
  )
}
