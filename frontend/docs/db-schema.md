# MongoDB Schema Design

## Users Collection

```javascript
{
  _id: ObjectId,
  name: String,
  displayName: String,
  email: String,
  password: String,  // Hashed password
  simNumber: String,
  status: {
    type: String,
    enum: ['unverified', 'email_verified', 'sim_verified', 'active'],
    default: 'unverified'
  },
  emailVerified: Boolean,
  simVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{
  email: 1,      // unique: true
  name: 1,       // unique: true
  displayName: 1, // unique: true  
  simNumber: 1   // unique: true
}
```

## Verification Tokens Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId,    // Reference to Users collection
  type: {
    type: String,
    enum: ['email', 'sim']
  },
  token: String,       // Verification token
  expiresAt: Date,     // Token expiration
  createdAt: Date
}

// Indexes
{
  token: 1,      // unique: true
  expiresAt: 1   // TTL index to auto-delete expired tokens
  userId: 1      // For quick lookups
}
```

## Development Mocks Collection
(For development environment only)

```javascript
{
  _id: ObjectId,
  email: String,
  simNumber: String,
  verificationCode: String,
  createdAt: Date,
  expiresAt: Date
}

// Indexes
{
  email: 1,
  simNumber: 1,
  expiresAt: 1  // TTL index
}
```

## Key Features

1. **User Status Flow**:
   - `unverified` → Initial state
   - `email_verified` → After email verification
   - `sim_verified` → After SIM verification
   - `active` → Fully verified user

2. **Security Features**:
   - Passwords are hashed before storage
   - Verification tokens have expiration
   - Unique indexes on email, displayName, and simNumber
   - TTL indexes for automatic cleanup of expired tokens

3. **Development Mode**:
   - Separate collection for mock verifications
   - Auto-cleanup of old mock data
   - Simplified verification process

## API Endpoints Required

1. **User Registration**:
   ```
   POST /api/users/register
   → Creates document in Users collection
   → Creates email verification token
   ```

2. **Email Verification**:
   ```
   POST /api/users/verify-email
   → Updates user status
   → Deletes used verification token
   ```

3. **Mock Verification (Dev Only)**:
   ```
   POST /api/users/mock-verify
   → Updates user status directly
   → Creates mock verification record
   ```
