# Quick Start Guide - Math Club Authentication System

## 5-Minute Setup

### Step 1: Create PostgreSQL Database
```bash
psql -U postgres
```

```sql
CREATE DATABASE math_club;
\q
```

### Step 2: Load Schema
```bash
psql -U postgres -d math_club -f database.sql
```

### Step 3: Environment Setup
```bash
# Copy the example environment file
cp .env.local.example .env.local
```

Edit `.env.local` and set:
```
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=math_club
JWT_SECRET=change-this-in-production
```

### Step 4: Install & Run
```bash
npm install
npm run dev
# or with Bun:
bun install
bun run dev
```

### Step 5: Test Login
Open http://localhost:3000 and login with:
- **Student**: user_id: `student_001`, password: `password123`
- **Admin**: user_id: `admin_001`, password: `password123`

## File Organization

### Authentication Files
- `lib/auth.ts` - Auth utilities (hashing, tokens, validation)
- `lib/postgres.ts` - PostgreSQL connection pool
- `types/dtos.ts` - Data Transfer Objects

### API Routes
- `app/api/auth/login/route.ts` - Login endpoint
- `app/api/auth/register/route.ts` - User registration (admin only)
- `app/api/auth/verify/route.ts` - Token verification

### Pages
- `app/login/page.tsx` - Login page
- `app/dashboard/page.tsx` - User dashboard
- `app/admin/register/page.tsx` - Admin user registration
- `app/page.tsx` - Home page (with redirection)

### Database
- `database.sql` - Complete schema with demo data

## Database Schema

**users table:**
```
- id: Primary key (auto-generated)
- user_id: Unique identifier (required for login)
- password_hash: Bcrypt hashed password
- user_type: 'student' or 'admin'
- full_name: User's name
- email: User's email
- is_active: Account status
- created_at, updated_at: Timestamps
```

## Key Features Implemented

✅ **Authentication**
- JWT token generation (7-day expiration)
- Bcryptjs password hashing
- Role-based access control

✅ **Validation**
- Input field validation
- Email format checking
- Password strength requirements

✅ **Error Handling**
- User-friendly error messages
- Proper HTTP status codes
- Token expiration handling

✅ **Database**
- PostgreSQL integration with pg driver
- Connection pooling
- Proper indexes for performance

## Common Commands

```bash
# View all users
psql -U postgres -d math_club -c "SELECT user_id, user_type, full_name FROM users;"

# Deactivate user
psql -U postgres -d math_club -c "UPDATE users SET is_active = false WHERE user_id = 'student_001';"

# Delete user
psql -U postgres -d math_club -c "DELETE FROM users WHERE user_id = 'student_001';"

# Reset password (requires bcrypt hash)
psql -U postgres -d math_club -c "UPDATE users SET password_hash = 'NEW_HASH' WHERE user_id = 'student_001';"
```

## Architecture

```
┌─────────────────────────────────────────┐
│         Client (React/Next.js)          │
│  - Login Page                           │
│  - Dashboard                            │
│  - Admin Registration                   │
└──────────────┬──────────────────────────┘
               │ HTTP(S)
               ▼
┌─────────────────────────────────────────┐
│    API Routes (Next.js Backend)         │
│  - POST /api/auth/login                 │
│  - POST /api/auth/register              │
│  - GET /api/auth/verify                 │
└──────────────┬──────────────────────────┘
               │ pg driver
               ▼
┌─────────────────────────────────────────┐
│       PostgreSQL Database               │
│  - users table                          │
│  - Indexes for performance              │
└─────────────────────────────────────────┘
```

## Next Steps

1. **Customize Demo Data**: Update `database.sql` with real user data
2. **Add User Profile Page**: Create `/app/dashboard/profile/page.tsx`
3. **Implement Admin Dashboard**: Create user management interface
4. **Add Password Reset**: Implement forgot password flow
5. **Enable Supabase Images**: Configure image storage
6. **Add Rate Limiting**: Protect auth endpoints
7. **Implement Logging**: Add authentication audit logs

## Troubleshooting

**Error: Could not connect to database**
- Ensure PostgreSQL is running: `pg_ctl status`
- Check connection string in `.env.local`
- Verify database exists: `psql -U postgres -l`

**Error: Password incorrect**
- Check username (user_id, not email)
- Demo credentials: student_001/password123 or admin_001/password123

**Token verification failed**
- Token may be expired (7 days)
- User needs to log in again
- Check JWT_SECRET matches between login and verify

**Port 3000 already in use**
```bash
# Use different port
npm run dev -- -p 3001
```

## Production Checklist

- [ ] Change JWT_SECRET
- [ ] Enable HTTPS
- [ ] Set secure database password
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Add request logging
- [ ] Set up database backups
- [ ] Use environment-specific configs
- [ ] Enable CSRF protection
- [ ] Add security headers

# Deploy
vercel deploy
```

## 📱 Available Pages

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Landing page |
| Batches | `/batches` | List of batches |
| Courses | `/courses` | List of courses |
| Contests | `/contests` | List of contests |
| Achievements | `/achievements` | List of achievements |
| Alumni | `/alumni` | Alumni directory |
| Dashboard | `/dashboard` | Statistics dashboard |

## 🔨 Available Commands

```bash
bun run dev      # Start development server
bun run build    # Build for production
bun run start    # Run production build
bun run lint     # Run ESLint
```

## 📚 Documentation

- [README.md](README.md) - Full documentation
- [DEVELOPMENT.md](DEVELOPMENT.md) - Developer guide
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Architecture overview

## 🐛 Troubleshooting

### Q: Pages not loading
**A**: Check browser console for errors, verify Supabase credentials

### Q: Database connection failed
**A**: Ensure Supabase URL and keys are correct in `.env.local`

### Q: Build fails
**A**: Run `bun install` again, clear `.next/` folder

### Q: Port 3000 already in use
**A**: Change port: `bun run dev -- -p 3001`

## 💡 Next Steps

1. ✅ Set up environment variables
2. ✅ Create database tables
3. ✅ Add sample data
4. ✅ Customize branding (colors, logo, text)
5. ✅ Add more features
6. ✅ Deploy to Vercel

## 📝 Key Files to Customize

| File | Purpose | What to Change |
|------|---------|----------------|
| `components/layout/Navigation.tsx` | Menu items | Add your links |
| `app/page.tsx` | Homepage content | Add club info |
| `tailwind.config.ts` | Colors | Customize theme |
| `types/index.ts` | Data types | Match your schema |
| `lib/constants.ts` | Settings | Configure app |

## 🎨 Customization Tips

### Change Color Scheme
Edit `tailwind.config.ts`:
```typescript
colors: {
  primary: '#your-color',
  secondary: '#your-color',
  accent: '#your-color',
}
```

### Add Your Logo
1. Add image to `public/` folder
2. Update `Navigation.tsx`:
```typescript
<Image src="/logo.png" alt="Logo" width={40} height={40} />
```

### Change App Name
Update `lib/constants.ts`:
```typescript
export const APP_NAME = 'Your Club Name'
```

## 🔐 Security Checklist

- [ ] Change default passwords
- [ ] Enable Row Level Security (RLS) in Supabase
- [ ] Keep `.env.local` secret
- [ ] Never commit `.env.local`
- [ ] Use strong API keys
- [ ] Enable HTTPS in production

## 📞 Support

For detailed help:
1. Read [DEVELOPMENT.md](DEVELOPMENT.md)
2. Check [Supabase Docs](https://supabase.com/docs)
3. Check [Next.js Docs](https://nextjs.org/docs)
4. Review error messages carefully

## ✨ You're Ready!

Your Math Club website is ready to go. Start by:

1. Adding your club information to the homepage
2. Creating batches and courses
3. Adding member data
4. Customizing the theme
5. Deploying to the web

Good luck! 🚀
