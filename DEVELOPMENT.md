# Development Guide

## Overview

This guide explains how to extend the Math Club website following the DRY (Don't Repeat Yourself) principles established in the project.

## Architecture Pattern

The project follows a layered architecture:

```
Pages (UI) → Hooks (Logic) → Components (UI Elements) → Utils (Helpers) → API Routes → Database
```

## Adding New Features

### Step 1: Define Types

Add types to `types/index.ts`:

```typescript
export interface NewFeature {
  id: string
  created_at: string
  name: string
  description?: string
}
```

### Step 2: Create API Route

Create `app/api/newfeature/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import {
  fetchData,
  fetchDataById,
  createData,
  updateData,
  deleteData,
} from '@/lib/db'
import { NewFeature } from '@/types'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (id) {
      const item = await fetchDataById<NewFeature>('table_name', id)
      return NextResponse.json(item)
    }

    const items = await fetchData<NewFeature>('table_name', undefined, {
      orderBy: 'created_at',
    })
    return NextResponse.json(items)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const item = await createData<NewFeature>('table_name', body)
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create' },
      { status: 500 }
    )
  }
}

// ... PUT and DELETE handlers follow same pattern
```

### Step 3: Create Feature Card Component

Create `components/cards/NewFeatureCard.tsx`:

```typescript
'use client'

import { Card, Badge } from '../ui/BaseComponents'
import { NewFeature } from '@/types'

export function NewFeatureCard({ item }: { item: NewFeature }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <h3 className="text-lg font-bold">{item.name}</h3>
      <p className="text-gray-600 text-sm">{item.description}</p>
    </Card>
  )
}
```

### Step 4: Create Page

Create `app/newfeature/page.tsx`:

```typescript
'use client'

import { useFetch } from '@/hooks/useFetch'
import { NewFeature } from '@/types'
import { Loading, Error, Button } from '@/components/ui/BaseComponents'
import { NewFeatureCard } from '@/components/cards/NewFeatureCard'
import Link from 'next/link'

export default function NewFeaturePage() {
  const { data, loading, error, refetch } = useFetch<NewFeature>('/api/newfeature')

  return (
    <div className="w-full">
      <section className="page-header">
        <div className="container">
          <h1 className="page-title">New Feature</h1>
          <p className="page-subtitle">Manage new features</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          {loading && <Loading />}
          {error && <Error message={error} onRetry={refetch} />}
          
          {!loading && !error && (
            <div className="card-grid">
              {data.map((item) => (
                <NewFeatureCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
```

### Step 5: Update Navigation

Update `components/layout/Navigation.tsx` to include your new feature in the navigation menu.

## DRY Principles Used

### 1. Generic Database Functions

Don't write SQL queries directly. Use generic functions:

```typescript
// ❌ Bad - Repetitive code
export async function fetchUsers() {
  const { data } = await supabase.from('users').select('*')
  return data
}

export async function fetchBatches() {
  const { data } = await supabase.from('batches').select('*')
  return data
}

// ✅ Good - Reusable function
export async function fetchData<T>(table: string) {
  const { data } = await supabase.from(table).select('*')
  return data as T[]
}
```

### 2. Reusable Components

Create generic components and reuse them:

```typescript
// ✅ Good - Single Card component with props
export function Card({ children, className }: CardProps) {
  return <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>{children}</div>
}

// Use it everywhere
<Card>
  <h3>Title</h3>
  <p>Content</p>
</Card>
```

### 3. Custom Hooks for Data Fetching

```typescript
// ✅ Good - Custom hook eliminates repetition
const { data, loading, error, refetch } = useFetch<User>('/api/users')

// Instead of:
const [data, setData] = useState([])
const [loading, setLoading] = useState(false)
// ... repeated in every component
```

### 4. Constants Instead of Magic Values

```typescript
// ❌ Bad
const limit = 10
const offset = 0

// ✅ Good
import { PAGINATION } from '@/lib/constants'
const limit = PAGINATION.DEFAULT_LIMIT
```

### 5. Utility Functions for Common Operations

```typescript
// ❌ Bad - Repeated formatting
{new Date(date).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})}

// ✅ Good - Use utility function
import { formatDate } from '@/lib/utils'
{formatDate(date)}
```

## File Naming Conventions

- **Pages**: `PascalCase` + `Page` suffix (e.g., `HomePage`, `BatchesPage`)
- **Components**: `PascalCase` (e.g., `UserCard`, `Navigation`)
- **Utilities**: `camelCase` (e.g., `formatDate`, `useFetch`)
- **Types**: `PascalCase` (e.g., `User`, `Course`)
- **Constants**: `UPPER_CASE` (e.g., `API_ENDPOINTS`, `DEFAULT_LIMIT`)

## Component Structure

Every feature component should follow this structure:

```typescript
// imports
'use client'

import { ReactNode } from 'react'
import { SomeType } from '@/types'
import { BaseComponent } from '@/components/ui/BaseComponents'

// interfaces
interface ComponentProps {
  data: SomeType
  onAction?: () => void
}

// component
export function FeatureComponent({ data, onAction }: ComponentProps) {
  return (
    // JSX
  )
}
```

## Page Structure

Every page should follow this structure:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useFetch } from '@/hooks/useFetch'
import { SomeType } from '@/types'
import { FeatureCard } from '@/components/cards/FeatureCard'
import { Loading, Error, Button } from '@/components/ui/BaseComponents'

export default function FeaturePage() {
  const { data, loading, error, refetch } = useFetch<SomeType>('/api/endpoint')

  return (
    <div className="w-full">
      {/* Header section */}
      <section className="page-header">
        {/* ... */}
      </section>

      {/* Content section */}
      <section className="py-12">
        <div className="container">
          {loading && <Loading />}
          {error && <Error message={error} onRetry={refetch} />}
          {/* ... */}
        </div>
      </section>
    </div>
  )
}
```

## Common Patterns

### Filtering Data

```typescript
const filtered = filterBy(data, (item) => item.active === true)
```

### Sorting Data

```typescript
const sorted = sortBy(data, 'name', 'asc')
```

### Grouping Data

```typescript
const grouped = groupBy(data, 'batch_id')
```

### Date Formatting

```typescript
import { formatDate, formatDateTime, getTimeAgo } from '@/lib/utils'

formatDate(date) // "January 15, 2024"
formatDateTime(date) // "January 15, 2024, 2:30 PM"
getTimeAgo(date) // "2 hours ago"
```

## Testing

Run tests with:

```bash
bun test
```

## Performance Tips

1. Use pagination for large datasets:
   ```typescript
   const { data } = useFetch('/api/users', { limit: 10, offset: 0 })
   ```

2. Cache data when possible using React's built-in mechanisms or Zustand

3. Use `Next/Image` for image optimization

4. Lazy load components using `dynamic()` if needed

## Debugging

1. Enable browser DevTools for React debugging
2. Check `.next/` folder for build issues
3. Use `console.log()` or browser debugger
4. Check server logs for API errors

## Deployment Checklist

- [ ] Environment variables set correctly
- [ ] Database tables created
- [ ] API routes tested
- [ ] Components responsive
- [ ] No console errors
- [ ] Build successful (`bun run build`)
- [ ] All pages accessible

## Common Issues & Solutions

### Issue: Data not loading
**Solution**: Check API endpoint, verify Supabase credentials, check browser network tab

### Issue: TypeScript errors
**Solution**: Ensure types are exported from `types/index.ts`, check imports

### Issue: Styling not applied
**Solution**: Check Tailwind CSS configuration, verify class names, clear `.next/` cache

### Issue: Build failures
**Solution**: Run `bun install` again, check for missing dependencies, verify TypeScript

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase Documentation](https://supabase.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev)
