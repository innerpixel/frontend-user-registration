# Cosmic User Registration System - Microservices Architecture

## System Overview

### Services Architecture
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Auth Service  │     │   API Service   │     │  Mail Service   │
│    (Port 3001)  │────▶│    (Port 3000)  │────▶│    (Future)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                        │                       │
        │                        │                       │
        ▼                        ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  MongoDB Auth   │     │  Linux System   │     │   Mail System   │
│    Database     │     │    Users        │     │    (Postfix)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## 1. Auth Service (Port 3001)

### Purpose
- User authentication and registration
- Status tracking
- User data management
- Registration flow orchestration

### Key Components

#### A. Enhanced User Model
```javascript
const UserSchema = {
    // System Identifiers
    username: String,          // Linux username
    displayName: String,       // Public display name
    systemEmail: String,       // username@local.domain
    personalEmail: String,     // External contact email
    
    // Authentication
    password: String,          // Bcrypt hashed
    
    // Registration Status
    registrationStatus: String,// Current status
    statusDetails: {
        lastStep: String,
        error: String,
        lastUpdated: Date
    },
    
    // Verification
    isVerified: Boolean,
    verificationToken: String,
    verificationExpires: Date,
    
    // Timestamps
    createdAt: Date,
    verifiedAt: Date,
    lastLoginAt: Date
}
```

#### B. Status Flow States
1. `INITIATED` - Registration started
2. `USERNAME_VALIDATED` - Username checks passed
3. `USER_CREATED` - MongoDB user created
4. `SYSTEM_USER_CREATED` - Linux user created
5. `MAIL_CONFIGURED` - Mail system setup
6. `VERIFICATION_SENT` - Verification email sent
7. `VERIFIED` - Email verified
8. `FAILED` - Error occurred

#### C. API Endpoints

1. **Status Endpoints**
```
GET /api/auth/status/check-username/:username
- Check username availability
- Returns: { available: boolean, message: string }

GET /api/auth/status/registration/:username
- Get registration progress
- Returns: {
    status: string,
    progress: number,
    message: string,
    details: object,
    canProceed: boolean
  }

GET /api/auth/status/user-status (Protected)
- Get detailed user status
- Requires: JWT Token
- Returns: Full user status details
```

2. **Authentication Endpoints**
```
POST /api/auth/register
- Register new user
- Body: {
    username: string,
    displayName: string,
    personalEmail: string,
    password: string,
    simFrequency: string
  }

POST /api/auth/verify-email
- Verify email address
- Body: { token: string }
```

## 2. API Service (Port 3000)

### Purpose
- System user management
- Mail directory setup
- System configuration

### Key Components

#### A. System User Creation
```javascript
async function createSystemUser(userData) {
    // 1. Create Linux user
    await execAsync(`sudo useradd -m -s /bin/bash ${userData.username}`);
    
    // 2. Set up mail directories
    const mailDir = `/home/${userData.username}/Maildir`;
    await execAsync(`sudo mkdir -p ${mailDir}/{new,cur,tmp}`);
    
    // 3. Configure permissions
    await execAsync(`sudo chmod 700 ${mailDir}`);
    
    // 4. Set up neomutt config
    await configureNeomutt(userData);
}
```

#### B. API Endpoints
```
POST /api/users/system-setup
- Create system user and mail directories
- Body: { username: string, email: string }

GET /api/users/:username/system-status
- Check system user status
- Returns: { exists: boolean, maildir: boolean }
```

## 3. Status Service

### Purpose
- Track registration progress
- Validate status transitions
- Provide status information

### Key Features

#### A. Status Validation
```javascript
isValidTransition(currentStatus, newStatus) {
    if (newStatus === 'FAILED') return true;
    const currentIndex = statusFlow.indexOf(currentStatus);
    const newIndex = statusFlow.indexOf(newStatus);
    return newIndex === currentIndex + 1;
}
```

#### B. Progress Tracking
```javascript
getStatusProgress(status) {
    const index = statusFlow.indexOf(status);
    return Math.round((index / (statusFlow.length - 1)) * 100);
}
```

## 4. Security Implementation

### A. Password Security
- Bcrypt hashing with salt
- Minimum length: 8 characters
- Complexity requirements enforced

### B. JWT Implementation
```javascript
const token = jwt.sign(
    { 
        userId: user._id,
        username: user.username
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
);
```

### C. File Permissions
```bash
# Mail directory: 700 (rwx------)
chmod 700 ~/Maildir

# Public directory: 755 (rwxr-xr-x)
chmod 755 ~/public

# Neomutt config: 600 (rw-------)
chmod 600 ~/.neomuttrc
```

## 5. Error Handling

### A. Registration Errors
```javascript
try {
    // 1. Create user in MongoDB
    const user = await createUser(userData);
    
    // 2. Create system user
    await createSystemUser(userData);
    
} catch (error) {
    // Rollback MongoDB user if system user creation fails
    if (error.code === 'SYSTEM_USER_ERROR') {
        await User.findByIdAndDelete(user._id);
    }
    throw error;
}
```

### B. Status Update Errors
```javascript
async function updateStatus(user, newStatus, details) {
    try {
        await validateTransition(user.status, newStatus);
        await user.updateStatus(newStatus, details);
    } catch (error) {
        await user.updateStatus('FAILED', {
            error: error.message,
            lastStep: user.status
        });
        throw error;
    }
}
```

## 6. Testing Strategy

### A. Unit Tests
- User model validation
- Status transitions
- Password hashing
- JWT generation

### B. Integration Tests
- Complete registration flow
- Error scenarios
- Status updates
- System user creation

### C. Load Tests
- Concurrent registrations
- System user creation under load
- Status updates performance

## 7. Monitoring

### A. Health Checks
```
GET /api/auth/health
GET /api/health
```

### B. Logging
```javascript
logger.info(`Registration started for user: ${username}`);
logger.error(`Failed to create system user: ${error.message}`);
```

### C. Metrics
- Registration success rate
- Average registration time
- Error frequency
- Status transition times

## 8. Development Environment

### A. Required Services
- MongoDB
- Postfix
- Neomutt
- Node.js v20.18.2

### B. Environment Variables
```env
# Auth Service
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/preprod_auth
JWT_SECRET=your_secret_here
CORS_ORIGINS=http://localhost:3000

# API Service
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/preprod_api
```

## 9. Deployment Considerations

### A. Service Dependencies
1. MongoDB must be running
2. Postfix must be configured
3. System user creation requires sudo privileges

### B. Security Checklist
- [ ] JWT secret properly configured
- [ ] CORS origins restricted
- [ ] File permissions verified
- [ ] Rate limiting implemented
- [ ] Input validation complete
- [ ] Error messages sanitized

### C. Monitoring Setup
- [ ] Logging configured
- [ ] Health checks implemented
- [ ] Error tracking enabled
- [ ] Performance monitoring active
