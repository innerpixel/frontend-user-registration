# Local Development API

A Node.js-based API for managing users with public profiles and Maildir public folders in a local development environment.

## Features

- User Management (CRUD operations)
- Authentication using JWT
- Public Profile Management
- File Upload Support
- Email Integration
- Rate Limiting
- Security Headers

## Prerequisites

- Node.js (v18 or higher)
- MongoDB
- SMTP Server (for email functionality)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your configuration
4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user

### Users
- GET /api/users - Get all users
- GET /api/users/:id - Get user by ID
- PUT /api/users/:id - Update user
- DELETE /api/users/:id - Delete user

### Profiles
- GET /api/profiles - Get all public profiles
- GET /api/profiles/:username - Get public profile by username
- PUT /api/profiles/:username - Update public profile
- POST /api/profiles/:username/avatar - Upload profile avatar

## Development

```bash
# Run in development mode
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Security

The API implements several security measures:
- JWT Authentication
- Rate Limiting
- Security Headers (Helmet)
- Input Validation
- CORS Configuration
- File Upload Restrictions

## License

ISC
