# 🚀 How to Start the Math Club Website

This project includes automated setup scripts that handle everything for you. Choose your preferred method below:

## ✨ Easy Setup (Recommended)

### Option 1: Windows Batch (start.bat)
```bash
start.bat
```
This will:
1. ✓ Check if Node.js and PostgreSQL are installed
2. ✓ Create `.env.local` with default values
3. ✓ Install npm dependencies
4. ✓ Create PostgreSQL database
5. ✓ Load database schema
6. ✓ Start the development server

### Option 2: PowerShell (start.ps1)
```powershell
.\start.ps1
```
Same features as start.bat, but for PowerShell users.

### Option 3: Manual Setup

If you prefer to set up manually or the scripts don't work:

#### 1. Create Database
```bash
psql -U postgres
CREATE DATABASE math_club;
\q
```

#### 2. Load Schema
```bash
psql -U postgres -d math_club -f database.sql
```

#### 3. Configure Environment
```bash
cp .env.local.example .env.local
# Edit .env.local with your PostgreSQL credentials
```

#### 4. Install Dependencies
```bash
npm install
```

#### 5. Start Development Server
```bash
npm run dev
```

## 📋 Prerequisites

Before running the setup scripts, ensure you have:

### Required
- **Node.js** v18+ ([Download](https://nodejs.org/))
- **PostgreSQL** v12+ ([Download](https://www.postgresql.org/download/windows/))

### Verify Installation
```bash
# Check Node.js
node --version

# Check npm
npm --version

# Check PostgreSQL
psql --version
```

## ⚙️ Configuration

### .env.local
The setup script creates `.env.local` from `.env.local.example`. Edit it with your values:

```env
# PostgreSQL
DB_USER=postgres
DB_PASSWORD=postgres          # Change this!
DB_HOST=localhost
DB_PORT=5432
DB_NAME=math_club

# JWT Secret - MUST change in production!
JWT_SECRET=change-this-secret-in-production

# Supabase (optional, for image storage)
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

## 🧪 Test Login

Once the server is running, open http://localhost:3000 and login with:

| Role | User ID | Password |
|------|---------|----------|
| **Student** | student_001 | password123 |
| **Admin** | admin_001 | password123 |

## 🗄️ Database Setup Details

### Database: math_club
- **Host**: localhost:5432
- **User**: postgres
- **Tables**: users (with demo data)

### Demo Data Included
The `database.sql` file includes:
- 1 student account (student_001)
- 1 admin account (admin_001)
- Pre-configured schema with indexes

## 📁 Project Structure

```
Math Club Website/
├── app/                   # Next.js app directory
│   ├── api/auth/         # API endpoints
│   ├── login/            # Login page
│   ├── dashboard/        # User dashboard
│   └── ...
├── lib/                  # Utilities
│   ├── auth.ts          # Authentication logic
│   └── postgres.ts      # Database connection
├── start.bat            # Windows setup script
├── start.ps1            # PowerShell setup script
├── database.sql         # Database schema
├── .env.local.example   # Environment template
└── package.json         # Dependencies
```

## 🆘 Troubleshooting

### "Node.js not found"
- Install Node.js from https://nodejs.org/
- Restart your terminal

### "PostgreSQL not found"
- Install PostgreSQL from https://www.postgresql.org/download/windows/
- Add PostgreSQL bin directory to system PATH
- Restart your terminal

### "Database already exists"
- Script will skip creation and use existing database
- Run `psql -U postgres -d math_club -f database.sql` to reload schema

### "npm install failed"
- Try: `npm install --legacy-peer-deps`
- Or: `npm cache clean --force` then `npm install`

### "Cannot connect to database"
- Verify PostgreSQL is running
- Check DB_PASSWORD in .env.local is correct
- Test connection: `psql -U postgres`

### Port 3000 Already in Use
```bash
npm run dev -- -p 3001  # Use port 3001 instead
```

## 📚 Documentation

- **QUICKSTART.md** - 5-minute setup guide
- **SETUP.md** - Detailed installation guide  
- **AUTH_SYSTEM.md** - Complete system documentation
- **DEVELOPER_GUIDE.md** - Code patterns and customization
- **README_AUTH.md** - Authentication system overview

## 🔒 Security Notes

⚠️ **Important for Production:**

1. **Change JWT_SECRET**
   ```env
   JWT_SECRET=your-very-secure-random-string-here
   ```

2. **Set strong database password**
   ```env
   DB_PASSWORD=your-strong-password
   ```

3. **Enable HTTPS**
   - Don't use HTTP in production

4. **Update demo credentials**
   - Change default student_001 and admin_001 passwords

5. **Other production steps**
   - Set NODE_ENV=production
   - Configure CORS
   - Enable rate limiting
   - Set up monitoring
   - Configure backups

## 🚀 What Happens When You Run start.bat

```
1. Check Prerequisites
   ├─ Node.js installed? ✓
   ├─ npm installed? ✓
   └─ PostgreSQL installed? ✓

2. Environment Setup
   ├─ Check .env.local exists
   └─ Create from template if missing

3. Install Dependencies
   ├─ Check node_modules
   └─ Run npm install if needed

4. Database Setup
   ├─ Connect to PostgreSQL
   ├─ Create database if missing
   └─ Verify connection

5. Load Schema
   ├─ Run database.sql
   ├─ Create tables
   ├─ Load demo data
   └─ Verify setup

6. Start Server
   └─ npm run dev
      └─ http://localhost:3000
```

## 💡 Tips

- Run `start.bat` in your project directory (or use PowerShell)
- The script handles everything automatically
- You only need to edit `.env.local` if using non-default PostgreSQL password
- Leave the terminal open while developing
- Press Ctrl+C to stop the server

## 🔄 Subsequent Runs

After the first setup:
- Run `start.bat` again - it will:
  - Skip prerequisite checks (already verified)
  - Skip dependency install (already installed)
  - Skip database creation (already exists)
  - Skip schema load (already loaded)
  - Start the dev server immediately

Or directly run:
```bash
npm run dev
```

## 📞 Support

1. Check the documentation files
2. Review error messages carefully
3. Verify PostgreSQL is running
4. Check .env.local configuration
5. Ensure ports 3000 and 5432 are available

---

**Everything is automated. Just run `start.bat` and enjoy!** 🎉
