# Math Club Website - Authentication System

A complete, production-ready authentication system for the Math Club website built with Next.js, PostgreSQL, and JWT.

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ or Bun
- PostgreSQL v12+

### Setup (5 minutes)

1. **Create Database**
```bash
psql -U postgres
CREATE DATABASE math_club;
\q
```

2. **Load Schema**
```bash
psql -U postgres -d math_club -f database.sql
```

3. **Configure Environment**
```bash
cp .env.local.example .env.local
# Edit .env.local with your PostgreSQL credentials
```

4. **Install & Run**
```bash
npm install && npm run dev
# or with Bun:
bun install && bun run dev
```

5. **Test Login**
- Visit http://localhost:3000
- Login as `student_001` / `password123`
- Or as `admin_001` / `password123`

## 📋 Features

### ✅ Authentication
- JWT token-based authentication (7-day expiration)
- Bcryptjs password hashing (salt: 10)
- Role-based access control (Student/Admin)
- Secure token verification
- Automatic session management

### ✅ User Management
- Login page with validation
- User dashboard with role-specific content
- Admin user registration
- Account status management
- Email uniqueness enforcement

### ✅ Database
- PostgreSQL with connection pooling
- Optimized schema with indexes
- Demo data included
- Proper constraints and validation
- Timestamp tracking

### ✅ Security
- Input field validation
- Password strength requirements
- Email format validation
- Bearer token scheme
- Secure password comparison
- SQL injection prevention

### ✅ Error Handling
- User-friendly error messages
- Proper HTTP status codes
- Field-level validation errors
- Token expiration handling
- Graceful degradation

## 📁 Project Structure

```
Math Club Website/
├── app/
│   ├── api/auth/
│   │   ├── login/route.ts          # Login endpoint
│   │   ├── register/route.ts       # Admin registration
│   │   └── verify/route.ts         # Token verification
│   ├── admin/
│   │   └── register/page.tsx       # Admin user registration
│   ├── dashboard/page.tsx          # User dashboard
│   ├── login/page.tsx              # Login page
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Home page
├── lib/
│   ├── auth.ts                     # Auth utilities
│   ├── postgres.ts                 # DB connection
│   └── utils.ts                    # Helper functions
├── types/
│   ├── dtos.ts                     # Data Transfer Objects
│   └── index.ts                    # Type definitions
├── components/                     # Reusable components
├── database.sql                    # Database schema
├── .env.local.example              # Environment template
├── QUICKSTART.md                   # Quick start guide
├── SETUP.md                        # Detailed setup guide
├── AUTH_SYSTEM.md                  # System documentation
└── package.json                    # Dependencies
```

## 🔐 Authentication Flow

```
User → Login Page → POST /api/auth/login → Verify Password
                          ↓
                    Generate JWT Token
                          ↓
                Store Token (localStorage)
                          ↓
                Redirect to Dashboard
                          ↓
        Dashboard → GET /api/auth/verify → Validate Token
                          ↓
                  Display Role-Based Content
```

## 📚 API Documentation

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "user_id": "student_001",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": { ... }
}
```

### Register (Admin Only)
```
POST /api/auth/register
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "user_id": "student_002",
  "password": "newpass123",
  "full_name": "Jane Doe",
  "email": "jane@example.com",
  "user_type": "student"
}
```

### Verify Token
```
GET /api/auth/verify
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Token is valid"
}
```

## 🗄️ Database Schema

**users table**
```sql
id              VARCHAR(255)  PRIMARY KEY
user_id         VARCHAR(50)   UNIQUE (login username)
password_hash   VARCHAR(255)  bcryptjs hash
user_type       VARCHAR(20)   'student' or 'admin'
full_name       VARCHAR(100)  user's full name
email           VARCHAR(100)  UNIQUE, contact email
is_active       BOOLEAN       account status
created_at      TIMESTAMP     account creation
updated_at      TIMESTAMP     last modification
```

## 🔑 Demo Credentials

| User Type | User ID | Password |
|-----------|---------|----------|
| Student   | student_001 | password123 |
| Admin     | admin_001 | password123 |

## ⚙️ Configuration

Create `.env.local`:
```bash
# PostgreSQL
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=math_club

# JWT
JWT_SECRET=change-this-in-production

# Supabase (optional, for images)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## 🛠️ Development

### Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run linter
```

### Database Management
```bash
# View users
psql -U postgres -d math_club -c "SELECT * FROM users;"

# Deactivate user
psql -U postgres -d math_club -c "UPDATE users SET is_active = false WHERE user_id = 'student_001';"

# Delete user
psql -U postgres -d math_club -c "DELETE FROM users WHERE user_id = 'student_001';"
```

## 🧪 Testing

```bash
# Login test
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"user_id":"student_001","password":"password123"}'

# Verify token
curl -X GET http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🚨 Troubleshooting

**Database Connection Error**
- Ensure PostgreSQL is running
- Check DB credentials in `.env.local`
- Verify database exists

**Invalid Credentials**
- Use `user_id` not email for login
- Check password spelling
- Verify user is active

**Token Expired**
- Token expires after 7 days
- User must login again

**Port Already in Use**
```bash
npm run dev -- -p 3001
```

## 📖 Documentation

- **QUICKSTART.md** - 5-minute setup guide
- **SETUP.md** - Detailed installation & configuration
- **AUTH_SYSTEM.md** - Complete system documentation
- **DATABASE.SQL** - Full schema with examples

## 🔒 Security Notes

⚠️ **Before Production:**
1. Change JWT_SECRET to strong random value
2. Enable HTTPS/TLS
3. Use strong database password
4. Implement rate limiting
5. Add CSRF protection
6. Enable request logging
7. Set up monitoring & alerts
8. Regular security audits

## 📦 Dependencies

- **next**: v14.2.3 - React framework
- **pg**: v8.11.3 - PostgreSQL driver
- **bcryptjs**: v2.4.3 - Password hashing
- **jsonwebtoken**: v9.1.2 - JWT tokens
- **zod**: v3.22.4 - Input validation
- **axios**: v1.6.2 - HTTP client
- **zustand**: v4.4.1 - State management

## 🤝 Contributing

1. Follow the existing code structure
2. Use TypeScript for type safety
3. Add validation for all inputs
4. Include error handling
5. Test changes locally

## 📝 License

Math Club Authentication System

## 🆘 Support

For issues or questions:
1. Check SETUP.md or AUTH_SYSTEM.md
2. Review error messages
3. Check database connectivity
4. Verify environment configuration

---

**Happy Coding!** 🎉

For detailed information, see:
- Implementation details: [AUTH_SYSTEM.md](AUTH_SYSTEM.md)
- Setup instructions: [SETUP.md](SETUP.md)
- Quick start: [QUICKSTART.md](QUICKSTART.md)
