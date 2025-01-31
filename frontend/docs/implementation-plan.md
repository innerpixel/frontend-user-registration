# User Registration System Implementation Plan

## Phase 1: Service Integration
### 1. Auth-API Service Integration
- [ ] Create HTTP client in Auth service to communicate with API service
- [ ] Add system user creation call after successful registration
- [ ] Implement rollback mechanism if system user creation fails
- [ ] Add proper error handling and logging

### 2. Email Verification Flow
- [ ] Add `verified` field to User model
- [ ] Create verification token generation
- [ ] Set up local SMTP for development
- [ ] Create email templates for:
  - [ ] Verification email
  - [ ] Welcome email after verification
  - [ ] Password reset (future feature)
- [ ] Add verification endpoints:
  - [ ] `POST /api/auth/send-verification`
  - [ ] `GET /api/auth/verify/:token`

## Phase 2: Frontend Development
### 1. Registration Page
- [ ] Create registration form with fields:
  - Username
  - Display Name
  - Email
  - Password
  - SIM Number
- [ ] Add client-side validation
- [ ] Implement error handling and user feedback
- [ ] Add loading states

### 2. Email Verification Page
- [ ] Create verification success/failure pages
- [ ] Add resend verification email functionality
- [ ] Implement redirect after successful verification

### 3. User Dashboard
- [ ] Show user profile information
- [ ] Display verification status
- [ ] Show Maildir information
- [ ] Add email client link (future feature)

## Phase 3: Testing & Security
### 1. Integration Testing
- [ ] Test complete registration flow
- [ ] Test email verification flow
- [ ] Test error scenarios and rollbacks
- [ ] Test concurrent registrations

### 2. Security Audit
- [ ] Review password hashing
- [ ] Audit JWT implementation
- [ ] Check file permissions
- [ ] Review API endpoints security
- [ ] Test rate limiting
- [ ] Implement request validation

### 3. Load Testing
- [ ] Test multiple concurrent registrations
- [ ] Verify system user creation under load
- [ ] Check email sending performance
- [ ] Monitor MongoDB performance

## Phase 4: Documentation & Deployment
### 1. User Documentation
- [ ] Registration guide
- [ ] Email verification instructions
- [ ] System usage guidelines
- [ ] Troubleshooting guide

### 2. Developer Documentation
- [ ] API documentation
- [ ] System architecture
- [ ] Database schema
- [ ] Deployment guide
- [ ] Environment setup

### 3. Monitoring & Maintenance
- [ ] Set up logging
- [ ] Add performance monitoring
- [ ] Create backup procedures
- [ ] Document recovery procedures

## Current Progress
### Completed ✅
1. Basic Auth Service
   - User registration endpoint
   - Input validation
   - Password hashing
   - JWT generation

2. Basic API Service
   - System user creation
   - Maildir setup
   - Public directory creation
   - Neomutt configuration

3. Infrastructure
   - Service systemd configurations
   - MongoDB setup
   - Health check endpoints

### In Progress 🔄
1. Service Integration
   - Auth and API service communication
   - Error handling
   - Rollback mechanisms

### Next Steps 🎯
1. Complete Auth-API integration
2. Implement email verification
3. Start frontend development

## Development Environment
- Local domain: preprod.local
- Auth Service: http://localhost:3001
- API Service: http://localhost:3000
- MongoDB: localhost:27017
- Mail: Local SMTP for development

## Notes
- Keep local/development configuration separate from production
- Maintain comprehensive error logging
- Focus on user experience and clear error messages
- Ensure proper cleanup in case of failures
- Build with scalability in mind
