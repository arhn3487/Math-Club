# Quick Reference Card - Math Club Online Deployment

## 🚀 Deployment Checklist

### 1. Supabase Setup (10 min)
- [ ] Create account at supabase.com
- [ ] Create new project
- [ ] Save: Project URL, Anon Key, Service Role Key
- [ ] Create bucket: `profile-images` (Public)
- [ ] Run `database-updated.sql` in SQL editor

### 2. Local Testing (5 min)
```bash
# Copy environment template
cp .env.local.example .env.local

# Add credentials (use values from Supabase)
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
JWT_SECRET=generate_random_32_chars_here

# Test locally
npm install
npm run dev
# Visit http://localhost:3000/signup
```

### 3. Deploy to Vercel (10 min)
```bash
# Push to GitHub
git add .
git commit -m "Add online deployment features"
git push origin main
```
- [ ] Go to vercel.com
- [ ] Import GitHub repo
- [ ] Add environment variables (same as .env.local)
- [ ] Click Deploy
- [ ] Copy Vercel URL
- [ ] Update `NEXT_PUBLIC_APP_URL` in Vercel env vars

### 4. Create Admin Account (2 min)
In Supabase SQL Editor:
```sql
INSERT INTO users (id, user_id, password_hash, user_type, 
  full_name, email, phone, is_active, is_approved, email_verified)
VALUES (
  gen_random_uuid(),
  'admin_001',
  '$2a$10$yzPYfnJwM0hqA0XdVHsZXuxqU8FWdvhCWnjTYM/oxYyLh.6W5KVje',
  'admin',
  'Admin Name',
  'admin@mathclub.com',
  '+1234567890',
  true, true, true
);
```
Login: `admin_001` | Password: `password123`

### 5. Test Live (5 min)
- [ ] Visit your Vercel URL
- [ ] Go to `/signup`
- [ ] Create student account
- [ ] Verify email
- [ ] Go to `/admin/approvals` (login as admin)
- [ ] Approve student
- [ ] Student logs in

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `database-updated.sql` | Database schema (run in Supabase) |
| `DEPLOYMENT_GUIDE.md` | Complete step-by-step guide |
| `API_DOCUMENTATION.md` | All API endpoints |
| `FEATURES_IMPLEMENTATION.md` | Architecture & features |
| `vercel.json` | Vercel configuration |
| `.env.local.example` | Environment template |

---

## 🔗 URLs After Deployment

| Page | URL | Purpose |
|------|-----|---------|
| Home | `/` | Landing page |
| Login | `/login` | Student/Admin login |
| Student Signup | `/signup` | New student registration |
| Email Verify | `/verify-email?token=...` | Email confirmation |
| Dashboard | `/dashboard` | User dashboard (logged in) |
| Admin Panel | `/admin/approvals` | Approval dashboard (admin only) |

---

## 🛠️ Troubleshooting Quick Fixes

### Images not uploading?
- Check bucket name is `profile-images`
- Check bucket is set to **Public**
- Check file size < 5MB
- Check format is JPEG/PNG/WebP

### Deployment fails?
- Run `npm run build` locally first
- Check Node.js version: `node -v` (need 18+)
- Verify all env vars are in Vercel
- Check Vercel build logs

### Email verification not working?
- Check verification token in URL
- Check token hasn't expired (7 days)
- Verify `signup_requests` table exists

### Admin approval button not working?
- Verify logged-in user is admin (user_type='admin')
- Check JWT token is valid
- Check browser console for errors

---

## 📊 Environment Variables Needed

```
NEXT_PUBLIC_SUPABASE_URL         # From Supabase Settings → API
NEXT_PUBLIC_SUPABASE_ANON_KEY    # From Supabase Settings → API
SUPABASE_SERVICE_ROLE_KEY        # From Supabase Settings → API
JWT_SECRET                        # Generate: openssl rand -base64 32
NEXT_PUBLIC_APP_URL              # Your Vercel URL (for emails)
```

---

## 🔐 Default Demo Accounts

After running `database-updated.sql`:

| Role | User ID | Password | Email |
|------|---------|----------|-------|
| Admin | `admin_001` | `password123` | admin@mathclub.com |
| Student | `student_001` | `password123` | john@example.com |

⚠️ **Change all passwords immediately!**

---

## 📱 API Quick Reference

```bash
# Student Signup
POST /api/auth/signup
Body: {full_name, email, phone, batch_year, reason, password, confirm_password}

# Verify Email
GET /api/auth/verify-email?token=TOKEN

# Upload Photo
POST /api/uploads/profile-image
Body: FormData(file, signup_request_id)

# Admin: Get Pending
GET /api/admin/pending-signups
Headers: {Authorization: "Bearer JWT_TOKEN"}

# Admin: Approve/Reject
POST /api/admin/approve-signup
Body: {signup_request_id, action, password/reason}
Headers: {Authorization: "Bearer JWT_TOKEN"}
```

---

## ⏱️ Expected Timeline

| Step | Time | Notes |
|------|------|-------|
| Supabase setup | 10 min | Create project & get credentials |
| Database creation | 5 min | Run SQL script |
| Storage bucket | 2 min | Create public bucket |
| Local testing | 5 min | npm run dev |
| GitHub push | 2 min | git push |
| Vercel deploy | 10 min | Automatic build & deploy |
| Admin account | 2 min | Run SQL query |
| Live testing | 5 min | Test signup → approve → login |
| **Total** | **41 minutes** | ✅ Live! |

---

## 📞 Resources

- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **This Project Docs**: See DEPLOYMENT_GUIDE.md

---

## ✅ Completion Verification

Your deployment is complete when:
- ✅ Supabase project created and database loaded
- ✅ Storage bucket exists and is public
- ✅ Vercel deployment succeeds
- ✅ Environment variables are set in Vercel
- ✅ Admin account can login
- ✅ Student can signup, verify email, admin can approve
- ✅ Profile images upload and display

---

**You've got this! 🚀 Start with Step 1 above!**
