# API Documentation

## Authentication Service (https://auth.preprod.local/api/auth)

The authentication service is running on a secure HTTPS connection. All HTTP requests are automatically redirected to HTTPS.

### Base URL
```
https://auth.preprod.local/api/auth
```

### Health Check
```http
GET /health

Response: 200 OK
{
  "status": "healthy",
  "service": "auth",
  "timestamp": "2025-01-30T06:58:33.549Z"
}
```

### User Registration
```http
POST /register
Content-Type: application/json

{
  "username": "string",       // Must start with a letter, only lowercase letters, numbers, _, -
  "displayName": "string",    // At least 3 characters
  "personalEmail": "string",  // Valid email address
  "password": "string",       // At least 8 characters
  "simFrequency": "string"   // Format: CSMC followed by 3 digits (e.g., CSMC123)
}

Response: 201 Created
{
  "success": true,
  "message": "Registration successful. Please check your email for verification.",
  "data": {
    "username": "string",
    "displayName": "string",
    "systemEmail": "string",
    "registrationStatus": "string"
  }
}

Error Response: 400 Bad Request
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "username",
      "message": "Username must start with a letter and can only contain lowercase letters, numbers, underscores and hyphens"
    }
  ]
}
```

### User Login
```http
POST /login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}

Response: 200 OK
{
  "success": true,
  "token": "JWT_TOKEN",
  "user": {
    "username": "string",
    "displayName": "string",
    "systemEmail": "string"
  }
}

Error Response: 401 Unauthorized
{
  "success": false,
  "message": "Invalid credentials"
}
```

### Email Verification
```http
POST /verify-email
Content-Type: application/json

{
  "token": "string"
}

Response: 200 OK
{
  "success": true,
  "message": "Email verified successfully"
}

Error Response: 400 Bad Request
{
  "success": false,
  "message": "Invalid or expired verification token"
}
```

### User Logout
```http
POST /logout
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "message": "Logged out successfully"
}

Error Response: 401 Unauthorized
{
  "success": false,
  "message": "Authentication required"
}
```

## Status Endpoints

### Check Username Availability
```http
GET /status/check-username/:username

Response: 200 OK
{
  "success": true,
  "available": true,
  "message": "Username is available"
}

Error Response: 400 Bad Request
{
  "success": false,
  "available": false,
  "message": "Invalid username format"
}
```

### Get Registration Status
```http
GET /status/registration/:username

Response: 200 OK
{
  "success": true,
  "data": {
    "status": "string",
    "progress": number,
    "message": "string",
    "details": {
      "lastStep": "string",
      "error": "string",
      "lastUpdated": "string"
    },
    "canProceed": boolean
  }
}

Error Response: 404 Not Found
{
  "success": false,
  "message": "User not found"
}
```

### Get User Status (Protected)
```http
GET /status/me
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "username": "string",
    "displayName": "string",
    "systemEmail": "string",
    "personalEmail": "string",
    "registrationStatus": "string",
    "isVerified": boolean,
    "createdAt": "string",
    "verifiedAt": "string",
    "lastLoginAt": "string"
  }
}

Error Response: 401 Unauthorized
{
  "success": false,
  "message": "Authentication required"
}
```

## Registration Status Flow
The registration process follows these states:
1. `INITIATED` - Initial registration started
2. `USERNAME_VALIDATED` - Username checked and available
3. `USER_CREATED` - User created in database
4. `SYSTEM_USER_CREATED` - System user account created
5. `MAIL_CONFIGURED` - Email configuration completed
6. `VERIFICATION_SENT` - Verification email sent
7. `VERIFIED` - Email verified
8. `FAILED` - Registration failed (with error details)

## Common Error Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (email not verified)
- `404` - Not Found (user/resource not found)
- `409` - Conflict (username/email already exists)
- `422` - Unprocessable Entity (invalid input format)
- `500` - Internal Server Error

## Troubleshooting Guide

### Common Issues and Solutions

1. **502 Bad Gateway**
   - **Symptom**: Nginx returns 502 when accessing auth.preprod.local
   - **Possible Causes**:
     - Auth service not running
     - Wrong port configuration
   - **Solutions**:
     - Check if service is running: `systemctl status preprod-auth.service`
     - Verify port 3001 is listening: `netstat -tlpn | grep 3001`
     - Check Nginx logs: `tail -f /var/log/nginx/error.log`

2. **Authentication Failures**
   - **Symptom**: "Invalid credentials" even with correct password
   - **Possible Causes**:
     - Email not verified
     - Token expired
   - **Solutions**:
     - Check email verification status via `/status/me`
     - Request new verification email if needed
     - Check token expiration (JWT tokens expire after 24h)

3. **Registration Issues**
   - **Symptom**: Registration fails with system user creation error
   - **Possible Causes**:
     - System integration service unavailable
     - Invalid SIM frequency format
   - **Solutions**:
     - Check system integration service status
     - Verify SIM frequency follows CSMC### format
     - Check registration status for detailed error

4. **Email Verification Problems**
   - **Symptom**: Verification email not received
   - **Possible Causes**:
     - Email service configuration issues
     - Email in spam folder
   - **Solutions**:
     - Check email service logs
     - Verify email configuration in .env
     - Request new verification email

5. **Performance Issues**
   - **Symptom**: Slow response times
   - **Possible Causes**:
     - MongoDB connection issues
     - High server load
   - **Solutions**:
     - Check MongoDB connection status
     - Monitor server resources
     - Review application logs

### Monitoring and Debugging

1. **Service Status**
   ```bash
   systemctl status preprod-auth.service
   journalctl -u preprod-auth.service -n 50
   ```

2. **Application Logs**
   ```bash
   tail -f /var/www/preprod.local/auth/logs/error.log
   tail -f /var/www/preprod.local/auth/logs/access.log
   ```

3. **Nginx Logs**
   ```bash
   tail -f /var/log/nginx/access.log
   tail -f /var/log/nginx/error.log
   ```

4. **MongoDB Connection**
   ```bash
   mongo --eval "db.serverStatus()"
   ```

### Security Best Practices

1. **Token Management**
   - Store tokens securely (HttpOnly cookies)
   - Never expose tokens in URLs
   - Implement token refresh mechanism

2. **Password Security**
   - Use strong password requirements
   - Implement rate limiting for login attempts
   - Hash passwords using bcrypt

3. **API Security**
   - Use HTTPS only
   - Implement CORS properly
   - Validate all inputs
   - Use parameterized queries

4. **Environment Configuration**
   - Keep .env file secure
   - Use different configs for dev/prod
   - Regularly rotate secrets

### Support Contacts

For urgent issues:
1. System Administrator: admin@preprod.local
2. Security Team: security@preprod.local
3. Development Team: dev@preprod.local
