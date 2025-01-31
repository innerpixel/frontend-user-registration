# User Registration System Setup Documentation

## System Architecture

### Services Overview
1. **API Service** (Port 3000)
   - Status: ✅ Running
   - Location: `/var/www/preprod.local/api`
   - Purpose: Handles system user creation and mail directory setup
   - Endpoints:
     - `GET /api/health` - Health check endpoint
     - `POST /api/users/system-setup` - Creates system user and mail directories
     - `GET /api/users/:username/system-status` - Checks user system status

2. **Auth Service** (Port 3001)
   - Status: ❌ Currently failing to start
   - Location: `/var/www/preprod.local/auth`
   - Purpose: Handles user authentication and registration
   - Endpoints:
     - `POST /api/auth/register` - User registration
     - `POST /api/auth/verify-email` - Email verification

### Database Setup
- MongoDB running on default port (27017)
- Two separate databases:
  - `preprod_api` - For API service
  - `preprod_auth` - For authentication service

### Mail System Configuration
- Using Maildir format: `~/Maildir`
- Directory structure per user:
  ```
  ~/Maildir/
  ├── new/
  ├── cur/
  └── tmp/
  ```
- Public folder: `~/public`
- Neomutt configuration: `~/.neomuttrc`

## Service Configuration

### API Service
```systemd
# /var/www/preprod.local/api/preprod-api.service
[Unit]
Description=Preprod API Service
After=network.target mongodb.service

[Service]
Type=simple
User=nsbasicus
WorkingDirectory=/var/www/preprod.local/api
ExecStart=/usr/bin/node src/index.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

### Auth Service
```systemd
# /var/www/preprod.local/auth/preprod-auth.service
[Unit]
Description=Preprod Auth Service
After=network.target mongodb.service

[Service]
Type=simple
User=nsbasicus
WorkingDirectory=/var/www/preprod.local/auth
ExecStart=/usr/bin/node src/index.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

## Current Status

### Working Features
1. API Service is running and responding to health checks
2. MongoDB connection is established
3. System user creation endpoint is implemented
4. Mail directory structure creation is implemented
5. User registration validation is in place

### Known Issues
1. Auth Service is failing to start (investigation needed)
2. Email verification flow needs to be tested
3. Frontend integration needs to be verified

## Environment Variables
```env
# API Service (.env)
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/preprod_api
JWT_SECRET=your_auth_jwt_secret_here
CORS_ORIGINS=https://www.preprod.local,https://admin.preprod.local
LOG_LEVEL=debug
API_VERSION=1.0.0

# Auth Service (.env)
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/preprod_auth
JWT_SECRET=your_auth_jwt_secret_here
CORS_ORIGINS=https://www.preprod.local,https://admin.preprod.local,https://api.preprod.local
SMTP_HOST=localhost
SMTP_PORT=25
SMTP_SECURE=false
EMAIL_FROM=noreply@preprod.local
LOG_LEVEL=debug
```

## Required System Dependencies
- Node.js v20.18.2
- MongoDB
- Postfix (for mail handling)
- Neomutt
- Systemd

## Security Notes
- JWT tokens are used for authentication
- Passwords are hashed using bcrypt
- CORS is configured to restrict allowed origins
- Mail directories are created with proper permissions (700)
- Public folders are created with 755 permissions

## Troubleshooting Guide

### Common Issues and Solutions

#### 1. Service Start-up Failures

a) **Missing Dependencies**
- **Symptom**: Error `Cannot find package 'bcryptjs' imported from /var/www/preprod.local/auth/src/models/user.js`
- **Solution**: Install required npm packages:
  ```bash
  cd /var/www/preprod.local/auth
  npm install bcryptjs express-validator jsonwebtoken
  ```

b) **Port Conflicts (EADDRINUSE)**
- **Symptom**: Error `EADDRINUSE: address already in use :::3000` or `:::3001`
- **Solution**: 
  ```bash
  # Find processes using the ports
  sudo lsof -i :3000
  sudo lsof -i :3001
  
  # Kill the conflicting process
  sudo kill -9 <PID>
  
  # Restart the services
  sudo systemctl restart preprod-api preprod-auth
  ```

#### 2. MongoDB Connection Issues
- **Warning**: `useNewUrlParser` and `useUnifiedTopology` are deprecated options
- **Solution**: These can be safely removed from the database connection options as they're default in MongoDB Driver 4.0.0+

### Health Check Endpoints

1. **API Service** (Port 3000)
   ```bash
   curl http://localhost:3000/api/health
   # Expected response:
   # {"status":"healthy","timestamp":"2025-01-29T19:42:15.319Z"}
   ```

2. **Auth Service** (Port 3001)
   ```bash
   curl http://localhost:3001/api/auth/health
   # Expected response:
   # {"status":"healthy","service":"auth","timestamp":"2025-01-29T19:42:15.330Z"}
   ```

### Service Management

```bash
# Start services
sudo systemctl start preprod-api preprod-auth

# Stop services
sudo systemctl stop preprod-api preprod-auth

# Restart services
sudo systemctl restart preprod-api preprod-auth

# Check service status
sudo systemctl status preprod-api preprod-auth

# View service logs
sudo journalctl -u preprod-api -n 50
sudo journalctl -u preprod-auth -n 50
```

### Dependency Check List

#### API Service Dependencies
- express
- mongoose
- jsonwebtoken
- cors
- helmet
- dotenv

#### Auth Service Dependencies
- express
- mongoose
- bcryptjs
- jsonwebtoken
- express-validator
- cors
- helmet
- dotenv

### Verification Steps

1. Check if services are running:
   ```bash
   sudo systemctl status preprod-api preprod-auth
   ```

2. Verify health endpoints:
   ```bash
   curl http://localhost:3000/api/health
   curl http://localhost:3001/api/auth/health
   ```

3. Check MongoDB connection:
   ```bash
   mongo preprod_auth --eval "db.stats()"
   mongo preprod_api --eval "db.stats()"
   ```

4. Verify network ports:
   ```bash
   sudo lsof -i :3000
   sudo lsof -i :3001
   ```

## Next Steps
1. Debug and fix Auth Service startup issues
2. Complete email verification flow testing
3. Set up proper logging for both services
4. Implement monitoring and alerting
5. Document backup and recovery procedures
