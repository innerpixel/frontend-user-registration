# API Documentation

## Authentication Service (auth.local-dev.test)

### User Registration
```http
POST /register
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string"
}

Response: 201 Created
{
  "status": "success",
  "message": "Registration successful. Please check your email to verify your account.",
  "token": "JWT_TOKEN"
}
```

### User Login
```http
POST /login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}

Response: 200 OK
{
  "status": "success",
  "token": "JWT_TOKEN"
}
```

### Get Current User
```http
GET /me
Authorization: Bearer JWT_TOKEN

Response: 200 OK
{
  "id": "string",
  "username": "string",
  "email": "string",
  "isEmailVerified": boolean,
  "createdAt": "date"
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
  "status": "success",
  "message": "Email verified successfully"
}
```

## API Service (api.local-dev.test)

### List Users (Admin Only)
```http
GET /users
Authorization: Bearer JWT_TOKEN

Response: 200 OK
{
  "users": [
    {
      "id": "string",
      "username": "string",
      "email": "string",
      "isEmailVerified": boolean,
      "createdAt": "date"
    }
  ]
}
```

### Get User by ID
```http
GET /users/:id
Authorization: Bearer JWT_TOKEN

Response: 200 OK
{
  "id": "string",
  "username": "string",
  "email": "string",
  "isEmailVerified": boolean,
  "createdAt": "date"
}
```

### Update User
```http
PUT /users/:id
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "username": "string",
  "email": "string"
}

Response: 200 OK
{
  "status": "success",
  "message": "User updated successfully"
}
```

### Delete User
```http
DELETE /users/:id
Authorization: Bearer JWT_TOKEN

Response: 200 OK
{
  "status": "success",
  "message": "User deleted successfully"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "status": "error",
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "status": "error",
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "status": "error",
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "status": "error",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "status": "error",
  "message": "Internal server error"
}
```

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```http
Authorization: Bearer <token>
```

## Rate Limiting

- 100 requests per minute per IP for public endpoints
- 1000 requests per minute per IP for authenticated endpoints

## CORS

Allowed origins:
- https://local-dev.test
- https://api.local-dev.test
- https://auth.local-dev.test
