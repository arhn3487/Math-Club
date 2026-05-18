# Online Deployment Guide - Math Club Website

## Overview
This guide explains how to deploy the Math Club Website online using:
- **Database & Storage**: Supabase (PostgreSQL + File Storage)
- **Hosting**: Vercel (Next.js hosting platform)
- **Authentication**: JWT tokens with email verification
- **Images**: Supabase Storage with profile images for all users

---

## Prerequisites
1. A Supabase account (https://supabase.com)
2. A Vercel account (https://vercel.com)
3. Git and GitHub account (for easy Vercel deployment)
4. Node.js 18+ installed locally

---

## Step 1: Set Up Supabase Database

### 1.1 Create a Supabase Project
1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Fill in:
   - **Project Name**: `math-club-website`
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose the closest to your location
4. Wait for project to initialize (5-10 minutes)

### 1.2 Get Your Supabase Credentials
Once the project is ready:
1. Click "Project Settings" (gear icon)
2. Go to "Database" section
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service Role key** → `SUPABASE_SERVICE_ROLE_KEY`
4. Go to "API" section and copy these values again to be sure

### 1.3 Create Database Tables
1. In Supabase, go to "SQL Editor"
2. Click "New Query"
3. Copy the entire content from `database-updated.sql` file
4. Paste it in the SQL editor
5. Click "Run" to create all tables

### 1.4 Set Up Storage Bucket
1. In Supabase, go to "Storage"
2. Click "New Bucket"
3. Create a bucket named: `profile-images`
4. Set it to **Public** (allow anyone to view images)
5. Click "Create"

---

## Step 2: Configure Local Environment

### 2.1 Update .env.local
Copy `.env.local.example` to `.env.local` and fill in:

```bash
# ============== SUPABASE CONFIGURATION ==============
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# ============== JWT SECRETS ==============
JWT_SECRET=your_super_secret_key_at_least_32_characters_long

# ============== EMAIL CONFIGURATION ==============
# (Optional: For SendGrid email verification)
NEXT_PUBLIC_APP_URL=http://localhost:3000
SENDGRID_API_KEY=your_sendgrid_api_key_here
EMAIL_FROM=noreply@mathclub.com
ADMIN_EMAIL=admin@mathclub.com

# ============== ENVIRONMENT ==============
NODE_ENV=development
```

### 2.2 Test Locally
```bash
npm install
npm run dev
```
Visit http://localhost:3000 to test

---

## Step 3: Deploy to Vercel

### 3.1 Prepare Your Repository
If you haven't already:
```bash
git init
git add .
git commit -m "Initial commit with online features"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/math-club-website.git
git push -u origin main
```

### 3.2 Deploy on Vercel
1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework**: Next.js
   - **Root Directory**: ./
   - **Build & Output Settings**: Keep defaults
5. Click "Environment Variables" and add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET` (use a new strong value)
   - `NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app`
6. Click "Deploy"
7. Wait for deployment (2-5 minutes)

### 3.3 Get Your Live URL
After deployment completes, Vercel will show your app URL. It will be something like:
`https://math-club-website.vercel.app`

Update `NEXT_PUBLIC_APP_URL` environment variable to your live URL for email links to work correctly.

---

## Step 4: Create Admin Account

### 4.1 Via Supabase Console
1. Go to Supabase → SQL Editor
2. Run this query:
```sql
INSERT INTO users (
  id, user_id, password_hash, user_type, 
  full_name, email, phone, is_active, is_approved, email_verified
) VALUES (
  gen_random_uuid(),
  'admin_001',
  '$2a$10$yzPYfnJwM0hqA0XdVHsZXuxqU8FWdvhCWnjTYM/oxYyLh.6W5KVje',
  'admin',
  'Your Admin Name',
  'admin@mathclub.com',
  '+1234567890',
  true,
  true,
  true
);
```

**Default Credentials:**
- User ID: `admin_001`
- Password: `password123`
- ⚠️ **Change this immediately after first login!**

---

## Step 5: Features & User Flows

### Student Signup Flow
1. Student visits `/signup` page
2. Fills in: Name, Email, Phone, Batch Year, Reason, Password, Profile Photo
3. System sends verification email
4. Student clicks email verification link
5. Admin reviews request at `/admin/approvals`
6. Admin can:
   - **Approve**: Creates account with initial password
   - **Reject**: Sends rejection reason
7. Student logs in with credentials

### Image Handling
- **Profile Photos**: Auto-uploaded during signup or approval
- **Storage Location**: Supabase Storage (`profile-images` bucket)
- **Public URLs**: Automatically generated for display on ID cards
- **Max Size**: 5MB per image
- **Formats**: JPEG, PNG, WebP

### Admin Panel
- URL: `/admin/approvals`
- View all pending student signups
- See email verification status
- Preview student profile photos
- Approve with initial password
- Reject with reason comment

---

## Step 6: Email Setup (Optional)

### Using SendGrid for Email Verification
1. Create account at https://sendgrid.com
2. Create an API key
3. Add to Vercel environment variables:
   - `SENDGRID_API_KEY=your_key_here`
4. Update `lib/emails.ts` to send emails (create this file)

---

## Security Checklist

- [ ] Change default admin password immediately
- [ ] Use strong JWT_SECRET (32+ characters, random)
- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Set up email verification (SendGrid or similar)
- [ ] Configure CORS if using subdomains
- [ ] Review Supabase RLS policies
- [ ] Enable database backups
- [ ] Set up monitoring/alerts

---

## Troubleshooting

### Images Not Uploading
- Check CORS settings in Supabase Storage
- Verify bucket is set to Public
- Check file size (max 5MB)

### Email Verification Not Working
- Verify `SENDGRID_API_KEY` is set
- Check email domain is verified in SendGrid
- Test with console logs

### Deployment Failing
- Check Node.js version (must be 18+)
- Verify all environment variables are set
- Check build logs in Vercel dashboard
- Run `npm run build` locally first

### Database Connection Issues
- Verify all Supabase credentials are correct
- Check if project is on free or paid plan
- Ensure database is not suspended
- Check PostgreSQL connection limits

---

## Useful Commands

```bash
# Local development
npm run dev

# Build for production
npm run build

# Test production build locally
npm run start

# View logs
npm run lint

# Format code
npx prettier --write .
```

---

## Database Queries

### View All Users
```sql
SELECT id, user_id, full_name, email, user_type, is_active, is_approved 
FROM users;
```

### View Pending Signups
```sql
SELECT * FROM signup_requests 
WHERE status = 'pending' 
ORDER BY created_at DESC;
```

### Approve a Student Manually
```sql
UPDATE users SET is_approved = true, is_active = true 
WHERE user_id = 'student_username_here';
```

### Delete a Signup Request
```sql
DELETE FROM signup_requests WHERE id = 'request_id_here';
```

---

## Next Steps

1. ✅ Set up Supabase database
2. ✅ Deploy to Vercel
3. ✅ Create admin account
4. ✅ Test signup and approval flow
5. ✅ Configure email (optional)
6. ✅ Add more admins as needed
7. ✅ Monitor user signups
8. ✅ Customize email templates

---

## Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Support**: https://supabase.com/support

---

**Deployment Complete!** Your Math Club Website is now live with student signups, email verification, and admin approval system! 🎉
