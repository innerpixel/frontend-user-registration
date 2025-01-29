# System Documentation - Local Development Environment

## System Overview

### Microservices Architecture
The system is designed as a collection of microservices, each running on its own subdomain:

1. **Web Frontend** (`www.local-dev.test`)
   - Served by Nginx on ports 80/443
   - SSL/TLS enabled
   - Static files in `/var/www/local-dev.test/html`
   - HTTPS enforced with automatic HTTP to HTTPS redirection
   - Main user interface

2. **Authentication Service** (`auth.local-dev.test`)
   - Port: 3001
   - Location: `/var/www/local-dev.test/auth`
   - Dedicated subdomain for authentication
   - Handles:
     - User registration
     - Authentication
     - Email verification
     - Password management

3. **API Service** (`api.local-dev.test`)
   - Port: 3000
   - Location: `/var/www/local-dev.test/api`
   - Dedicated subdomain for API operations
   - Handles business logic and data management

4. **Admin Interface** (`admin.local-dev.test`)
   - Dedicated admin panel
   - Restricted access
   - System administration features
   - User management interface

5. **Mail Service** (`mail.local-dev.test`)
   - Postfix for SMTP
     - Port 25 (SMTP)
     - Port 465 (SMTPS)
     - Port 587 (Submission)
   - IMAP access
     - Port 143 (IMAP)
     - Port 993 (IMAPS)
   - Local mail delivery only (loopback interface)
   - Maildir format for mail storage

## Service Details

### 1. Nginx Configuration per Subdomain
```nginx
# Main site (www.local-dev.test)
server {
    server_name www.local-dev.test;
    root /var/www/local-dev.test/html;
    # Static file serving
    # Frontend routing
}

# API service (api.local-dev.test)
server {
    server_name api.local-dev.test;
    # API proxy to port 3000
    # Enhanced security headers
}

# Auth service (auth.local-dev.test)
server {
    server_name auth.local-dev.test;
    # Auth proxy to port 3001
    # Enhanced security headers
}

# Admin panel (admin.local-dev.test)
server {
    server_name admin.local-dev.test;
    # Admin interface
    # Restricted access
}

# Mail server (mail.local-dev.test)
server {
    server_name mail.local-dev.test;
    # Mail service configuration
    # SMTP/IMAP ports
}
```

### 2. Authentication Service
- **Framework**: Express.js
- **Database**: MongoDB
- **Security Features**:
  - JWT-based authentication
  - Password hashing (bcrypt)
  - Email verification
  - Rate limiting
  - CORS protection
  - Helmet security headers

**API Endpoints**:
- `POST /register` - New user registration
- `POST /login` - User authentication
- `GET /me` - Current user profile
- `POST /verify-email` - Email verification
- `POST /reset-password` - Password reset

### 3. API Service
- **Framework**: Express.js
- **Database**: MongoDB
- **Protected Routes**:
  - `GET /users` - List users (admin only)
  - `GET /users/:id` - Get user details
  - `PUT /users/:id` - Update user
  - `DELETE /users/:id` - Delete user

### 4. Mail System
- **MTA**: Postfix
- **Configuration**:
  ```
  mydomain = local-dev.test
  myhostname = mail.local-dev.test
  inet_interfaces = loopback-only
  home_mailbox = Maildir/
  ```
- **Security**:
  - TLS enabled
  - SASL authentication
  - Modern TLS protocols only

## Development Environment

### Directory Structure
```
/var/www/local-dev.test/
├── html/          # Main frontend (www.local-dev.test)
├── api/           # API service (api.local-dev.test)
├── auth/          # Auth service (auth.local-dev.test)
├── admin/         # Admin panel (admin.local-dev.test)
└── mail/          # Mail configuration (mail.local-dev.test)
```

### Cross-Origin Resource Sharing (CORS)
- Each service maintains its own CORS configuration
- Allowed origins are explicitly defined
- Credentials are supported for authenticated requests
- Example configuration:
  ```javascript
  cors({
    origin: [
      'https://www.local-dev.test',
      'https://admin.local-dev.test',
      'https://api.local-dev.test',
      'https://auth.local-dev.test'
    ],
    credentials: true
  })
  ```

### SSL/TLS Configuration
- Each subdomain requires its own SSL certificate
- Modern TLS protocols (TLSv1.2, TLSv1.3)
- Strong cipher suites
- HSTS enabled

### Health Checks
- Each service provides its own health endpoint
- API service: `GET /health`
- Auth service: `GET /health`
- Mail service: System mail logs

## Testing Environment

### Available Test Users
- User: zero-innerpizel (configured for neomutt)

### Test URLs
- Main site: https://local-dev.test
- Auth service: https://auth.local-dev.test
- API service: https://api.local-dev.test

### Mail Testing
- Local mail delivery
- Mail client: neomutt
- Mail storage: Maildir format

### SSL Certificates
- Self-signed certificates for development
- Located in:
  - `/etc/nginx/ssl/` (web services)
  - `/etc/postfix/ssl/` (mail service)

## Deployment Notes

### Prerequisites
1. Node.js and npm
2. MongoDB
3. Nginx
4. Postfix
5. SSL certificates

### Service Dependencies
- MongoDB for data storage
- Postfix for email functionality
- Nginx for web serving and reverse proxy

### Environment Variables
Required environment variables for each service:
1. **API Service**
   - `PORT`
   - `MONGODB_URI`
   - `JWT_SECRET`

2. **Auth Service**
   - `PORT`
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `SMTP_HOST`
   - `SMTP_PORT`

## Monitoring and Logging

### Log Locations
1. **Nginx Logs**
   - Access logs: `/var/log/nginx/access.log`
   - Error logs: `/var/log/nginx/error.log`

2. **Auth Service Logs**
   - `/var/www/local-dev.test/auth/logs/`

3. **API Service Logs**
   - `/var/www/local-dev.test/api/logs/`

4. **Mail Logs**
   - Postfix logs in system mail log

### Health Checks
- API service: `GET /health`
- Auth service: `GET /health`
- Mail: SMTP port checks

## Backup and Maintenance

### Backup Locations
1. MongoDB data: `/var/www/local-dev.test/api/data/`
2. Mail data: User Maildir directories
3. Configuration files: `/etc/nginx/`, `/etc/postfix/`

### Regular Maintenance Tasks
1. Log rotation
2. SSL certificate renewal
3. Database backups
4. Security updates

## Development Workflow

### Local Development
1. Clone repository
2. Install dependencies
3. Configure environment variables
4. Start services
5. Access via https://local-dev.test

### Testing
1. Unit tests in `/api/tests/`
2. API tests using Postman/curl
3. Mail testing with local mail client

### Debugging
1. Service logs in respective `/logs` directories
2. Nginx error logs
3. Mail logs in system mail log
