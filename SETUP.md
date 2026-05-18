# Setup Guide

## Prerequisites
- Node.js (v18+)
- Bun (JavaScript runtime)
- PostgreSQL (v12+)

## Installation Steps

### 1. Install Dependencies
```bash
npm install
# or
bun install
```

### 2. Database Setup

#### Create PostgreSQL Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE math_club;

# Exit psql
\q
```

#### Load Schema
```bash
# Run the SQL schema file
psql -U postgres -d math_club -f database.sql
```

### 3. Environment Configuration

Create `.env.local` file in the root directory:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:
- `DB_USER`: PostgreSQL username (default: postgres)
- `DB_PASSWORD`: PostgreSQL password
- `DB_HOST`: Database host (default: localhost)
- `DB_PORT`: Database port (default: 5432)
- `DB_NAME`: Database name (default: math_club)
- `JWT_SECRET`: Secret key for JWT tokens (change in production)

### 4. Run Development Server
```bash
npm run dev
# or
bun run dev
```

The application will be available at `http://localhost:3000`

## Default Demo Credentials

### Student Account
- **User ID**: student_001
- **Password**: password123

### Admin Account
- **User ID**: admin_001
- **Password**: password123

## Project Structure

```
├── app/
│   ├── api/
│   │   └── auth/              # Authentication endpoints
│   │       ├── login/         # POST /api/auth/login
│   │       ├── register/      # POST /api/auth/register (admin only)
│   │       └── verify/        # GET /api/auth/verify
│   ├── dashboard/             # User dashboard
│   ├── login/                 # Login page
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home page
├── lib/
│   ├── auth.ts                # Authentication utilities
│   ├── postgres.ts            # PostgreSQL connection
│   ├── db.ts                  # Old Supabase utilities
│   └── utils.ts
├── types/
│   ├── dtos.ts                # Data Transfer Objects
│   └── index.ts               # Old types
├── components/
│   └── ...
├── database.sql               # Database schema
└── .env.local.example         # Environment variables template
```

## Key Features

✅ **Authentication**
- Login with User ID and Password
- JWT token-based sessions
- Admin and Student roles

✅ **Database**
- PostgreSQL with proper schema
- Password hashing with bcryptjs
- Token expiration (7 days)

✅ **Validation**
- Input validation on login/register
- Email format validation
- Password strength requirements

✅ **Error Handling**
- Graceful error messages
- Invalid token handling
- User status verification

## API Documentation

### Login Endpoint
**POST** `/api/auth/login`

Request:
```json
{
  "user_id": "student_001",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {
    "id": "student_student_001_1000",
    "user_id": "student_001",
    "user_type": "student",
    "full_name": "John Smith",
    "email": "john@example.com"
  }
}
```

### Verify Token Endpoint
**GET** `/api/auth/verify`

Headers:
```
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "message": "Token is valid"
}
```

### Register User Endpoint (Admin Only)
**POST** `/api/auth/register`

Headers:
```
Authorization: Bearer <admin_token>
```

Request:
```json
{
  "user_id": "student_002",
  "password": "newpassword123",
  "full_name": "Jane Doe",
  "email": "jane@example.com",
  "user_type": "student"
}
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "student_student_002_1001",
    "user_id": "student_002",
    "user_type": "student",
    "full_name": "Jane Doe",
    "email": "jane@example.com"
  }
}
```

## Building for Production

```bash
npm run build
npm run start
```

## Troubleshooting

### Connection Refused
- Ensure PostgreSQL is running
- Check DB_HOST and DB_PORT in .env.local

### Token Expired
- User needs to log in again
- Tokens expire after 7 days

### Password Mismatch
- Ensure password is correct
- Check if account is active (is_active = true)

## Security Notes

⚠️ **Important for Production:**
1. Change JWT_SECRET to a strong, random value
2. Use environment variables for all secrets
3. Enable HTTPS
4. Implement rate limiting on auth endpoints
5. Add CSRF protection
6. Monitor authentication logs
