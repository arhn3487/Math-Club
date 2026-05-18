# Authentication System Documentation

## Overview
This is a complete authentication system for the Math Club application with role-based access control (RBAC). The system uses PostgreSQL for data storage, JWT for authentication tokens, and Bcryptjs for password security.

## Architecture

### Components

#### Frontend (Client-Side)
- **Login Page** (`app/login/page.tsx`)
  - Form validation with error messages
  - Token storage in localStorage
  - Redirect to dashboard on success
  
- **Dashboard** (`app/dashboard/page.tsx`)
  - Token verification on load
  - Role-based content display
  - Logout functionality
  
- **Admin Register** (`app/admin/register/page.tsx`)
  - Admin-only user registration form
  - Comprehensive field validation
  - Success/error messaging

- **Home Page** (`app/page.tsx`)
  - Authentication state detection
  - Conditional UI based on login status
  - Quick access buttons

#### Backend (API Routes)

**Login Endpoint** (`app/api/auth/login/route.ts`)
- Validates user credentials
- Generates JWT token
- Returns user profile

**Register Endpoint** (`app/api/auth/register/route.ts`)
- Admin-only access
- Creates new user accounts
- Validates all input fields

**Verify Endpoint** (`app/api/auth/verify/route.ts`)
- Checks token validity
- Used by protected routes

#### Database Layer
- **PostgreSQL** - Primary data store
- **Connection Pool** (`lib/postgres.ts`) - Manages connections
- **Auth Utilities** (`lib/auth.ts`) - Encryption and token operations

### Database Schema

```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('student', 'admin')),
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Data Flow

```
1. User visits /login
   ↓
2. Enters credentials (user_id, password)
   ↓
3. POST /api/auth/login
   ├─ Validate input
   ├─ Query PostgreSQL for user
   ├─ Compare password with hash
   ├─ Generate JWT token
   └─ Return token + user profile
   ↓
4. Frontend stores token in localStorage
   ↓
5. User redirected to /dashboard
   ↓
6. Dashboard verifies token with GET /api/auth/verify
   ├─ Extract token from Authorization header
   ├─ Verify JWT signature
   └─ Display role-based content
```

## Security Features

### Password Security
- **Bcryptjs Hashing**: Passwords are hashed with salt factor 10
- **Never Stored Plain**: Original passwords never stored in database
- **Secure Comparison**: Uses bcrypt's constant-time comparison

### Token Security
- **JWT Tokens**: Stateless authentication
- **Expiration**: 7-day token lifetime
- **Secret Key**: Configured via environment variable
- **Bearer Scheme**: Tokens passed via Authorization header

### Input Validation
- User ID: max 50 characters, non-empty
- Password: minimum 6 characters
- Email: RFC-compliant format validation
- Full Name: max 100 characters, non-empty
- User Type: restricted to 'student' or 'admin'

### Database Security
- **Unique Constraints**: Prevents duplicate user_ids and emails
- **CHECK Constraints**: Validates user_type values
- **Indexes**: Efficient lookups without full scans
- **Connection Pooling**: Reuses database connections

## API Endpoints

### POST /api/auth/login
Login with user credentials.

**Request:**
```json
{
  "user_id": "student_001",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "student_student_001_1000",
    "user_id": "student_001",
    "user_type": "student",
    "full_name": "John Smith",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
- 400: Invalid format (missing fields, format errors)
- 401: Invalid credentials or inactive user
- 500: Server error

### POST /api/auth/register
Register a new user (admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request:**
```json
{
  "user_id": "student_002",
  "password": "newpassword123",
  "full_name": "Jane Doe",
  "email": "jane@example.com",
  "user_type": "student"
}
```

**Response (201):**
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

**Error Responses:**
- 400: Invalid input format
- 401: No token provided
- 403: Insufficient permissions (non-admin)
- 500: Server error

### GET /api/auth/verify
Verify JWT token validity.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Token is valid"
}
```

**Error Responses:**
- 401: No token or invalid token
- 500: Server error

## Implementation Details

### Authentication Utilities (lib/auth.ts)

**Password Management:**
```typescript
hashPassword(password: string): Promise<string>
  // Hashes password with bcryptjs (salt: 10)

verifyPassword(password: string, hash: string): Promise<boolean>
  // Compares password with hash
```

**Token Management:**
```typescript
generateToken(payload: AuthPayload): string
  // Creates JWT token with 7-day expiration

verifyToken(token: string): AuthPayload | null
  // Validates and decodes JWT token

extractTokenFromHeader(authHeader: string): string | null
  // Extracts bearer token from Authorization header
```

**User Operations:**
```typescript
getUserById(userId: string): Promise<UserProfileDTO | null>
  // Fetches user profile by user_id

getUserByUserIdWithPassword(userId: string): Promise<UserEntity | null>
  // Fetches complete user record (for login)

createUser(...): Promise<UserEntity>
  // Creates new user account
```

**Validation:**
```typescript
validateUserId(userId: string): boolean
validatePassword(password: string): boolean
validateEmail(email: string): boolean
validateFullName(fullName: string): boolean
```

### PostgreSQL Connection (lib/postgres.ts)

- **Connection Pooling**: Reuses connections for efficiency
- **Error Handling**: Logs connection errors
- **Query Function**: Generic typed query execution
- **Client Management**: Safe connection release

## Environment Configuration

**Required Variables:**
```
DB_USER          - PostgreSQL username
DB_PASSWORD      - PostgreSQL password
DB_HOST          - Database host (localhost)
DB_PORT          - Database port (5432)
DB_NAME          - Database name (math_club)
JWT_SECRET       - Secret key for JWT signing
```

**Optional Variables:**
```
NEXT_PUBLIC_SUPABASE_URL      - For image storage
NEXT_PUBLIC_SUPABASE_ANON_KEY - For image storage
```

## Error Handling Strategy

### Client-Side
- Input validation before submission
- Field-level error messages
- General error display with retry capability
- Success feedback with automatic redirect

### Server-Side
- Input validation with detailed error messages
- Proper HTTP status codes
- Database error logging
- Graceful failure handling

### Common Errors
1. **Invalid Credentials**: Deliberately ambiguous for security
2. **Inactive User**: Account is disabled
3. **Invalid Token**: Expired or tampered
4. **Duplicate User**: User ID or email exists
5. **Insufficient Permissions**: Non-admin attempting admin action

## Testing

### Login Tests
```bash
# Test with correct credentials
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"user_id":"student_001","password":"password123"}'

# Test with incorrect password
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"user_id":"student_001","password":"wrong"}'
```

### Token Verification
```bash
# Test token verification
curl -X GET http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer <token>"
```

### User Registration
```bash
# Test admin registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "user_id":"student_002",
    "password":"test123",
    "full_name":"Test User",
    "email":"test@example.com",
    "user_type":"student"
  }'
```

## Best Practices Used

✅ **DTO Pattern**: Separate request/response objects from database entities
✅ **Connection Pooling**: Efficient database resource usage
✅ **Bcryptjs Hashing**: Industry-standard password security
✅ **Input Validation**: Both client and server-side
✅ **Type Safety**: Full TypeScript support
✅ **Error Messages**: User-friendly feedback
✅ **Stateless Auth**: JWT enables horizontal scaling
✅ **Security Headers**: Authorization bearer scheme
✅ **Clean Separation**: Auth logic isolated in dedicated module
✅ **Reusable Functions**: Generic password and token utilities

## Production Considerations

### Security
- [ ] Change JWT_SECRET to strong random value
- [ ] Enable HTTPS/TLS
- [ ] Implement rate limiting
- [ ] Add CSRF protection
- [ ] Set secure cookie flags
- [ ] Implement request signing
- [ ] Add WAF rules

### Performance
- [ ] Database query optimization
- [ ] Add caching layer (Redis)
- [ ] Implement CDN for assets
- [ ] Database connection pooling

### Operations
- [ ] Set up logging/monitoring
- [ ] Configure error tracking (Sentry)
- [ ] Database backup strategy
- [ ] Health check endpoints
- [ ] Alerting system

### Compliance
- [ ] GDPR compliance
- [ ] Password policies
- [ ] Audit logging
- [ ] Data encryption at rest
- [ ] Regular security audits
