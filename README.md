# Local Development Environment

This repository contains the development environment setup with the following services:

## Services & Subdomains

1. **Web Service** (`www.local-dev.test`)
   - Static content served via Nginx
   - Location: `/html`
   - Main frontend application

2. **API Service** (`api.local-dev.test`)
   - Main application API
   - Port: 3000
   - Location: `/api`
   - Handles business logic and data operations

3. **Auth Service** (`auth.local-dev.test`)
   - User authentication and management
   - Port: 3001
   - Location: `/auth`
   - Handles user authentication and management

4. **Admin Service** (`admin.local-dev.test`)
   - Administrative interface
   - Location: `/admin`
   - Restricted access for system administrators

5. **Mail Service** (`mail.local-dev.test`)
   - Local mail server (Postfix)
   - SMTP, IMAP support
   - Integrated with user management

## Architecture

The system uses a subdomain-based microservices architecture where each service runs independently:
- Each service has its own subdomain for clear separation
- Services can be deployed and scaled independently
- Independent SSL/TLS certificates per service
- Cross-Origin Resource Sharing (CORS) configured between services

## Setup

1. Configure hosts file:
   ```bash
   # Add to /etc/hosts
   127.0.0.1 www.local-dev.test
   127.0.0.1 api.local-dev.test
   127.0.0.1 auth.local-dev.test
   127.0.0.1 admin.local-dev.test
   127.0.0.1 mail.local-dev.test
   ```

2. Install dependencies:
   ```bash
   cd api && npm install
   cd ../auth && npm install
   ```

3. Configure environment:
   - Copy `.env.example` to `.env` in both api and auth directories
   - Update environment variables as needed
   - Configure CORS settings for your subdomains

4. Start services:
   ```bash
   # Start API service
   cd api && npm start

   # Start Auth service
   cd auth && npm start
   ```

## Development

- API documentation available in `/docs`
- Frontend static files in `/html`
- Mail configuration in `/mail`

## Security

- SSL certificates required for HTTPS
- JWT-based authentication
- Email verification system
- Role-based access control
- CORS security between services
