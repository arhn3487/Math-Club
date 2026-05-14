# Math Club Website

A modern, scalable website for the Math Olympiad Club built with Next.js, React, TypeScript, and Supabase.

## 🚀 Features

- **User Management**: Members, admins, profile management
- **Batch Management**: Organize students into learning groups
- **Course Management**: Create and manage courses with content
- **Contest Management**: Schedule and manage programming contests
- **Achievements**: Track and showcase club achievements
- **Alumni Management**: Maintain alumni directory
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Type-Safe**: Full TypeScript support
- **Reusable Components**: DRY architecture with shared utilities

## 📁 Project Structure

```
math-club-website/
├── app/                      # Next.js app directory
│   ├── api/                 # API routes
│   │   ├── users/          # User CRUD operations
│   │   ├── batches/        # Batch CRUD operations
│   │   ├── courses/        # Course CRUD operations
│   │   ├── contests/       # Contest CRUD operations
│   │   ├── achievements/   # Achievement CRUD operations
│   │   └── alumni/         # Alumni CRUD operations
│   ├── batches/            # Batch pages
│   ├── courses/            # Course pages
│   ├── contests/           # Contest pages
│   ├── achievements/       # Achievement pages
│   ├── alumni/             # Alumni pages
│   ├── dashboard/          # Dashboard page
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Homepage
│   └── globals.css         # Global styles
├── components/              # React components
│   ├── ui/                 # Base UI components
│   │   └── BaseComponents.tsx
│   ├── cards/              # Feature cards
│   │   └── FeatureCards.tsx
│   └── layout/             # Layout components
│       └── Navigation.tsx
├── lib/                     # Utility functions
│   ├── db.ts               # Generic database functions
│   └── supabaseClient.ts   # Supabase client setup
├── hooks/                   # Custom React hooks
│   └── useFetch.ts         # Data fetching hook
├── types/                   # TypeScript types
│   └── index.ts            # All database types
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── tailwind.config.ts      # Tailwind CSS config
└── .env.local              # Environment variables
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14+
- **Language**: TypeScript
- **Runtime**: Bun
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (via Supabase)
- **State Management**: React Hooks + Zustand (optional)
- **API**: RESTful API with Next.js Routes

## 🔧 Setup & Installation

### Prerequisites
- Node.js 18+ or Bun 1.0+
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   cd "Math Club Website"
   ```

2. **Install dependencies with Bun**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   Create `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Run the development server**
   ```bash
   bun run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:3000`

## 📚 Usage Guide

### Adding New Features

#### 1. Create API Route
Create a new file in `app/api/feature/route.ts`:
```typescript
import { fetchData, createData } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const data = await fetchData('table_name')
  return NextResponse.json(data)
}
```

#### 2. Create Component
Create a component in `components/`:
```typescript
export function FeatureName({ data }: { data: YourType }) {
  return <div>{/* Your JSX */}</div>
}
```

#### 3. Create Page
Create a page in `app/feature/page.tsx`:
```typescript
'use client'
import { useFetch } from '@/hooks/useFetch'

export default function FeaturePage() {
  const { data, loading, error } = useFetch('/api/feature')
  // Your page logic
}
```

### Database Operations

Use the generic `db.ts` functions to avoid repetition:

```typescript
// Fetch multiple records
const users = await fetchData('users', { batch_name: 'Batch1' }, { limit: 10 })

// Fetch single record
const user = await fetchDataById('users', 'user-id')

// Create record
const newUser = await createData('users', { email: 'test@test.com' })

// Update record
const updated = await updateData('users', 'user-id', { full_name: 'John' })

// Delete record
await deleteData('users', 'user-id')

// Count records
const count = await countRecords('users', { admin: true })
```

### Using Custom Hooks

```typescript
import { useFetch, useFetchById } from '@/hooks/useFetch'

// Fetch multiple items
const { data, loading, error, refetch } = useFetch<User>('/api/users')

// Fetch single item
const { data: user, loading, error } = useFetchById<User>('/api/users', userId)
```

## 🎨 Component Library

### Base Components
- `Button` - Customizable button
- `Input` - Text input with validation
- `Card` - Container component
- `Badge` - Status indicator
- `Loading` - Loading spinner
- `Error` - Error message

### Feature Cards
- `UserCard` - Display user profile
- `CourseCard` - Display course
- `AchievementCard` - Display achievement
- `AlumniCard` - Display alumni member
- `ContestCard` - Display contest
- `StatCard` - Display statistic

## 📊 Database Schema

The database includes tables for:
- **users**: Club members
- **batches**: Learning groups
- **courses**: Educational courses
- **course_contents**: Lessons and problems
- **custom_contests**: Programming contests
- **achievements**: Club accomplishments
- **alumni_member**: Alumni directory
- **team_collections**: Team formation for contests
- **rooms**: Typing practice rooms
- **words**: Word database for typing practice

## 🔐 Security

- Use Supabase Row Level Security (RLS) policies
- Never expose service role key in client code
- Validate all user inputs
- Use HTTPS in production
- Keep dependencies updated

## 📦 Deployment

### Deploy to Vercel (Recommended)

```bash
bun install -g vercel
vercel deploy
```

### Environment Variables on Vercel
1. Go to Vercel Dashboard
2. Project Settings → Environment Variables
3. Add your Supabase credentials

## 🤝 Contributing

1. Create a feature branch
2. Make changes following the project structure
3. Use TypeScript and components
4. Test locally before committing
5. Submit a pull request

## 📝 Notes

- Keep components small and reusable
- Use TypeScript for type safety
- Follow the existing folder structure
- Use Tailwind CSS for styling
- Leverage generic functions to avoid code duplication

## 🆘 Troubleshooting

### Bun not found
```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash
```

### Supabase connection issues
- Verify credentials in `.env.local`
- Check Supabase project is active
- Verify table names match database schema

### Build errors
```bash
bun run build
```

## 📄 License

This project is for the Math Club. All rights reserved.

## 📧 Support

For issues or questions, contact the club administrator.
