# Quick Start Guide

## Initial Setup

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd local-dev.test
   ```

2. **Install Dependencies**
   ```bash
   # API Service
   cd api
   npm install

   # Auth Service
   cd ../auth
   npm install
   ```

3. **Configure Environment**
   ```bash
   # API Service
   cp api/.env.example api/.env
   
   # Auth Service
   cp auth/.env.example auth/.env
   ```

4. **Start Services**
   ```bash
   # Terminal 1 - API Service
   cd api
   npm start

   # Terminal 2 - Auth Service
   cd auth
   npm start
   ```

5. **Verify Setup**
   ```bash
   # Check web service
   curl https://local-dev.test

   # Check auth service
   curl https://auth.local-dev.test/health

   # Check API service
   curl https://api.local-dev.test/health

   # Check mail service
   telnet localhost 25
   ```

## Common Development Tasks

### 1. User Management
```bash
# Create new user
curl -X POST https://auth.local-dev.test/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@local-dev.test",
    "password": "your_password"
  }'

# Login
curl -X POST https://auth.local-dev.test/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@local-dev.test",
    "password": "your_password"
  }'
```

### 2. Check Emails
```bash
# Using neomutt
neomutt

# Check mail logs
tail -f /var/log/mail.log
```

### 3. View Logs
```bash
# Nginx logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# Service logs
tail -f api/logs/app.log
tail -f auth/logs/app.log
```

### 4. SSL Certificates
```bash
# Check certificate expiry
openssl x509 -enddate -noout -in /etc/nginx/ssl/local-dev.test.crt
```

## Troubleshooting

### 1. Service Issues
```bash
# Check service status
ps aux | grep node
netstat -tlnp

# Restart services
sudo systemctl restart nginx
sudo systemctl restart postfix
```

### 2. Mail Issues
```bash
# Check mail queue
mailq

# Check mail logs
tail -f /var/log/mail.log
```

### 3. Database Issues
```bash
# Connect to MongoDB
mongo

# Check database status
show dbs
use auth
show collections
```

## Security Notes

1. **Never commit sensitive data**:
   - `.env` files
   - SSL certificates
   - Private keys
   - User data

2. **Always use HTTPS** in development
3. **Keep dependencies updated**:
   ```bash
   npm audit
   npm update
   ```

## Additional Resources

- Full documentation: `/docs/system-documentation.md`
- API documentation: `/docs/api.md`
- Mail setup guide: `/docs/mail-setup.md`
