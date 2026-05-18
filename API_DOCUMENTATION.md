# API Endpoints Documentation

## Authentication Endpoints

### POST `/api/auth/login`
Login a user and get JWT token

**Request:**
```json
{
  "user_id": "student_001",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "user_id": "student_001",
    "full_name": "John Doe",
    "email": "john@example.com",
    "user_type": "student",
    "is_active": true,
    "is_approved": true,
    "email_verified": true,
    "profile_image_url": "https://..."
  }
}
```

---

### POST `/api/auth/signup`
Create a new student signup request

**Request:**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "batch_year": 2025,
  "reason": "Love competitive programming",
  "password": "securePass123!",
  "confirm_password": "securePass123!"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Signup request created! Please check your email to verify your account.",
  "signup_request_id": "uuid"
}
```

---

### GET/POST `/api/auth/verify-email`
Verify student email address

**GET Request:**
```
/api/auth/verify-email?token=verification_token_here
```

**POST Request:**
```json
{
  "token": "verification_token_here"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Email verified successfully! An admin will review your request soon.",
  "signup_request_id": "uuid"
}
```

---

### GET `/api/auth/verify`
Verify JWT token validity

**Request Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (Valid Token):**
```json
{
  "success": true,
  "message": "Token is valid"
}
```

---

## Admin Endpoints

### GET `/api/admin/pending-signups`
Get all pending student signup requests (Admin only)

**Request Headers:**
```
Authorization: Bearer ADMIN_JWT_TOKEN
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Pending signup requests fetched successfully",
  "data": [
    {
      "id": "uuid",
      "full_name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "batch_year": 2025,
      "reason": "Love competitive programming",
      "status": "pending",
      "is_email_verified": true,
      "profile_image_url": "https://...",
      "created_at": "2024-05-18T10:30:00Z"
    }
  ]
}
```

---

### POST `/api/admin/approve-signup`
Approve or reject a student signup request (Admin only)

**Request Headers:**
```
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: application/json
```

**Approve Request:**
```json
{
  "signup_request_id": "uuid",
  "action": "approve",
  "password": "initialPassword123!"
}
```

**Reject Request:**
```json
{
  "signup_request_id": "uuid",
  "action": "reject",
  "reason": "Personal email address required"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Student approved successfully",
  "user_id": "student_xyz123"
}
```

---

## Upload Endpoints

### POST `/api/uploads/profile-image`
Upload a profile image for a student

**Request (multipart/form-data):**
- `file`: Image file (JPEG, PNG, WebP, max 5MB)
- `signup_request_id`: UUID of signup request

**Response (Success):**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "image_url": "https://supabase-storage-url.../profile-images/..."
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Missing required fields"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "No token provided"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Admin access required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Signup request not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Authentication Flow

### Student Registration Process
1. **POST** `/api/auth/signup` - Create signup request
2. Student receives verification email with token
3. Student clicks email link or **POST** `/api/auth/verify-email`
4. Admin reviews at `/admin/approvals`
5. Admin **POST** `/api/admin/approve-signup` with action="approve"
6. Student can now login with **POST** `/api/auth/login`

### JWT Token Usage
Include JWT token in all authenticated requests:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Database Schema

### Users Table
- `id`: UUID primary key
- `user_id`: Unique username
- `password_hash`: Bcrypt hashed password
- `user_type`: 'student', 'admin', or 'pending'
- `full_name`: User's full name
- `email`: Email address
- `phone`: Phone number (optional)
- `profile_image_url`: URL to profile image
- `is_active`: Account active status
- `is_approved`: Admin approval status
- `email_verified`: Email verification status
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp

### Signup Requests Table
- `id`: UUID primary key
- `full_name`: Student's full name
- `email`: Email address
- `phone`: Phone number (optional)
- `batch_year`: Academic year
- `reason`: Why joining club
- `status`: 'pending', 'approved', or 'rejected'
- `is_email_verified`: Email verification flag
- `profile_image_url`: Student's profile photo URL
- `verification_token`: Email verification token
- `verification_token_expires`: Token expiry timestamp
- `reviewed_by`: Admin ID who reviewed
- `reviewed_at`: Review timestamp
- `review_comment`: Rejection reason or notes
- `created_at`: Request creation timestamp

---

## Rate Limiting
Currently no rate limiting. Consider adding if needed in production.

---

## CORS & Security
- CORS enabled for Vercel deployment domain
- JWT tokens required for admin endpoints
- Passwords hashed with bcryptjs (10 rounds)
- Email verification tokens expire after 7 days
- All API responses use HTTPS in production
