# Quick Start Guide

## 5-Minute Setup

### 1. **Install Dependencies**
```bash
cd "Math Club Website"
bun install
```

### 2. **Configure Supabase**
- Go to [Supabase](https://supabase.com)
- Create a new project or use existing one
- Copy your credentials
- Create `.env.local` (or rename `.env.example`):

```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### 3. **Initialize Database**
1. Go to Supabase SQL Editor
2. Copy the schema from the `CREATE TABLE` statements
3. Run the SQL to create all tables

### 4. **Start Development**
```bash
bun run dev
```

Visit `http://localhost:3000` 🎉

## 🚀 Common Tasks

### Add Sample Data
```bash
# Use Supabase UI to insert test data
```

### View Database
```
Supabase Dashboard → Tables → [select table]
```

### Deploy to Vercel
```bash
# Install Vercel CLI
bun install -g vercel

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
