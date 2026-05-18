# Developer Guide

## Working with the Authentication System

### Code Structure Overview

#### `lib/auth.ts` - Core Authentication Logic
Contains all authentication-related functions organized in sections:

```typescript
// Password utilities
hashPassword(password) - Hash password with bcryptjs
verifyPassword(password, hash) - Compare password with stored hash

// Token utilities
generateToken(payload) - Create JWT token
verifyToken(token) - Decode and validate JWT
extractTokenFromHeader(header) - Parse Bearer token

// User operations
getUserById(userId) - Fetch user profile
getUserByUserIdWithPassword(userId) - Get user with password for login
createUser(...) - Create new user account

// Validation
validateUserId(userId) - Check user_id format
validatePassword(password) - Check password requirements
validateEmail(email) - Check email format
validateFullName(fullName) - Check name format
```

#### `lib/postgres.ts` - Database Connection
Manages PostgreSQL connections:

```typescript
getPool() - Returns or creates connection pool
query(text, values) - Execute parameterized query
getClient() - Get a single client for transaction
closePool() - Clean up connections
```

#### `types/dtos.ts` - Data Models
Separates DTOs (API) from Entities (Database):

```typescript
// Entities - Database records
UserEntity - User table row with all fields

// DTOs - API requests/responses
LoginRequestDTO - Login form data
LoginResponseDTO - Login result
UserProfileDTO - User info (no password)
RegisterRequestDTO - Admin registration
AuthPayload - JWT token payload
```

### Adding a New User Field

If you need to add a new field to the user table:

1. **Update Database Schema**
   ```sql
   ALTER TABLE users ADD COLUMN phone_number VARCHAR(20);
   ```

2. **Update Entity Type**
   ```typescript
   // types/dtos.ts
   export interface UserEntity {
     // ... existing fields
     phone_number?: string;
   }
   ```

3. **Update DTOs if Needed**
   ```typescript
   export interface UserProfileDTO {
     // ... existing fields
     phone_number?: string;
   }
   ```

4. **Update Registration Endpoint**
   ```typescript
   // app/api/auth/register/route.ts
   // Add validation and include in INSERT query
   ```

5. **Update Frontend Form**
   ```typescript
   // app/admin/register/page.tsx
   // Add field to form state and input
   ```

### Modifying Validation Rules

**Password Strength**
```typescript
// lib/auth.ts
export function validatePassword(password: string): boolean {
  return password && password.length >= 6; // Change >= 6
}
```

**Email Format**
```typescript
// lib/auth.ts
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Modify regex pattern as needed
```

**User ID Rules**
```typescript
// lib/auth.ts
export function validateUserId(userId: string): boolean {
  return userId && userId.trim().length > 0 && userId.length <= 50;
  // Adjust length and add more rules
}
```

### Changing Token Expiration

```typescript
// lib/auth.ts
const TOKEN_EXPIRATION = '7d'; // Change to '30d', '1h', etc.

export function generateToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRATION, // This controls expiration
  })
}
```

### Adding Role-Based Features

**In API Routes:**
```typescript
// app/api/admin/some-endpoint/route.ts
const payload = verifyToken(token);

if (!payload || payload.user_type !== 'admin') {
  return NextResponse.json(
    { success: false, message: 'Admin only' },
    { status: 403 }
  )
}
```

**In Frontend:**
```typescript
// app/some-page/page.tsx
const userType = localStorage.getItem('user_type');

if (userType === 'admin') {
  // Show admin features
}
```

### Database Query Patterns

**Single User Query**
```typescript
import { query } from '@/lib/postgres'

const result = await query<UserEntity>(
  'SELECT * FROM users WHERE user_id = $1',
  [userId]
)
```

**Multiple Users Query**
```typescript
const result = await query<UserEntity[]>(
  'SELECT * FROM users WHERE user_type = $1 AND is_active = $2',
  ['student', true]
)
```

**Insert Query**
```typescript
const result = await query<UserEntity>(
  `INSERT INTO users (id, user_id, ...) 
   VALUES ($1, $2, ...) 
   RETURNING *`,
  [id, userId, ...]
)
```

**Update Query**
```typescript
await query(
  'UPDATE users SET is_active = $1 WHERE user_id = $2',
  [false, userId]
)
```

### Error Handling Pattern

```typescript
try {
  // Database operation
  const result = await query<UserEntity>(...);
  
  if (result.rows.length === 0) {
    return NextResponse.json(
      { success: false, message: 'User not found' },
      { status: 404 }
    )
  }
  
  return NextResponse.json({ success: true, data: result.rows[0] })
} catch (error) {
  console.error('Operation failed:', error)
  return NextResponse.json(
    { success: false, message: 'Server error' },
    { status: 500 }
  )
}
```

### Client-Side Form Pattern

```typescript
const [formData, setFormData] = useState({ field: '' })
const [errors, setErrors] = useState<Error[]>([])
const [isLoading, setIsLoading] = useState(false)

const validateForm = (): boolean => {
  const newErrors: Error[] = []
  if (!formData.field) {
    newErrors.push({ field: 'field', message: 'Required' })
  }
  setErrors(newErrors)
  return newErrors.length === 0
}

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault()
  if (!validateForm()) return
  
  setIsLoading(true)
  try {
    const response = await axios.post('/api/endpoint', formData)
    if (response.data.success) {
      // Success handling
    }
  } catch (error) {
    setErrors([{ field: 'general', message: 'Request failed' }])
  } finally {
    setIsLoading(false)
  }
}
```

### Common Tasks

#### Reset Admin Account
```bash
# Set admin_001 back to original password (password123)
psql -U postgres -d math_club << EOF
UPDATE users 
SET password_hash = '$2a$10$yzPYfnJwM0hqA0XdVHsZXuxqU8FWdvhCWnjTYM/oxYyLh.6W5KVje'
WHERE user_id = 'admin_001';
EOF
```

#### Add New Admin
```bash
# First hash a password using Node.js/JavaScript:
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('newpass123', 10).then(h => console.log(h))"

# Then insert:
psql -U postgres -d math_club << EOF
INSERT INTO users (id, user_id, password_hash, user_type, full_name, email, is_active)
VALUES (
  'admin_newadmin_1000',
  'newadmin',
  'HASH_FROM_ABOVE',
  'admin',
  'New Admin',
  'newadmin@example.com',
  true
);
EOF
```

#### List All Users
```bash
psql -U postgres -d math_club \
  -c "SELECT user_id, user_type, full_name, email, is_active, created_at FROM users;"
```

#### Deactivate Account
```bash
psql -U postgres -d math_club \
  -c "UPDATE users SET is_active = false WHERE user_id = 'student_001';"
```

### Testing Checklist

- [ ] Login with valid credentials
- [ ] Login with invalid password
- [ ] Login with non-existent user
- [ ] Token verification with valid token
- [ ] Token verification with invalid token
- [ ] Admin registration with valid data
- [ ] Admin registration by non-admin (should fail)
- [ ] Duplicate user_id registration (should fail)
- [ ] Duplicate email registration (should fail)
- [ ] Inactive account login attempt
- [ ] Dashboard access without token (redirect)
- [ ] Admin dashboard access by student (should fail)

### Performance Optimization

**Add Database Indexes**
```sql
-- Already included in database.sql
CREATE INDEX idx_users_user_id ON users(user_id);
CREATE INDEX idx_users_is_active ON users(is_active);
```

**Connection Pooling**
The system uses pg connection pooling automatically.
Adjust pool size in `lib/postgres.ts` if needed:
```typescript
new Pool({
  max: 20,  // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})
```

### Logging Enhancement

Add structured logging:
```typescript
const logger = {
  info: (msg: string, data?: any) => 
    console.log(`[INFO] ${new Date().toISOString()} ${msg}`, data),
  error: (msg: string, error?: any) => 
    console.error(`[ERROR] ${new Date().toISOString()} ${msg}`, error),
}
```

### Debugging Tips

**Enable Query Logging**
```typescript
// lib/postgres.ts
if (process.env.DEBUG_SQL) {
  console.log('Query:', text, values)
}
```

**Check Tokens**
```bash
# Decode JWT (no verification):
node -e "console.log(require('jsonwebtoken').decode('YOUR_TOKEN'))"
```

**View Database**
```bash
# Connect and run queries
psql -U postgres -d math_club
\dt  # List tables
\d users  # Show users table structure
SELECT * FROM users;  # View all users
```

### Extending with Features

**Password Reset Flow**
1. Create `app/api/auth/forgot-password/route.ts`
2. Generate temporary reset token
3. Send email with reset link
4. Create `app/reset-password/[token]/page.tsx`
5. Verify token and update password

**Two-Factor Authentication**
1. Add `mfa_enabled` and `mfa_secret` to users table
2. Create `app/api/auth/setup-2fa/route.ts`
3. Create `app/api/auth/verify-2fa/route.ts`
4. Update login flow to prompt for 2FA

**Session Management**
1. Create `sessions` table for active sessions
2. Track login timestamp and IP
3. Add device management UI
4. Implement session invalidation

**Audit Logging**
1. Create `audit_logs` table
2. Log all authentication events
3. Create admin view for audit logs
4. Implement security alerts

---

## Best Practices

✅ Always validate input on both client and server
✅ Use environment variables for all secrets
✅ Hash passwords before storing
✅ Use parameterized queries to prevent SQL injection
✅ Return ambiguous error messages for security
✅ Log errors for debugging and monitoring
✅ Use TypeScript for type safety
✅ Implement proper error handling
✅ Test authentication flows thoroughly
✅ Keep credentials out of version control

## Resources

- Next.js Docs: https://nextjs.org/docs
- PostgreSQL: https://www.postgresql.org/docs/
- bcryptjs: https://github.com/dcodeIO/bcrypt.js
- JWT: https://jwt.io/
- pg driver: https://node-postgres.com/

