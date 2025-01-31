# CSMCL Auth Service

Authentication and user management service for the CSMCL platform.

## System Requirements

- Node.js 18+
- MongoDB 4.4+
- Postfix mail server
- systemd (for service management)

## Local Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure MongoDB**
   - Ensure MongoDB is running
   - Create auth database and user:
     ```bash
     mongosh
     use auth
     db.createUser({
       user: "csmcladmin",
       pwd: "csmcl.space.adventures",
       roles: [{ role: "readWrite", db: "auth" }]
     })
     ```

3. **Configure Postfix**
   - Install Postfix and Maildir utilities:
     ```bash
     sudo apt-get install postfix mailutils
     ```
   - Configure virtual domains in `/etc/postfix/main.cf`:
     ```
     myhostname = local-csmcl-nexus
     mydestination = $myhostname, localhost.$mydomain, localhost, localmail
     virtual_alias_domains = ld-csmlmail.test
     ```
   - Restart Postfix:
     ```bash
     sudo systemctl restart postfix
     ```

4. **Configure Service**
   - Copy service file:
     ```bash
     sudo cp deployment/preprod-auth.service /etc/systemd/system/
     ```
   - Update environment variables in service file:
     ```ini
     Environment=MONGO_USER=csmcladmin
     Environment=MONGO_PASS=csmcl.space.adventures
     Environment=MONGODB_URI=mongodb://csmcladmin:csmcl.space.adventures@localhost:27017/auth?authSource=admin
     Environment=CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
     Environment=NODE_ENV=development
     Environment=PORT=3001
     Environment=DEBUG=auth:*
     Environment=JWT_SECRET=your-secret-key
     Environment=API_SERVICE_URL=http://auth.preprod.local:3001
     Environment=SMTP_HOST=localhost
     Environment=SMTP_PORT=25
     Environment=SMTP_SECURE=false
     Environment=SMTP_FROM=noreply@ld-csmlmail.test
     Environment=FRONTEND_URL=http://localhost:5173
     ```
   - Reload and start service:
     ```bash
     sudo systemctl daemon-reload
     sudo systemctl enable preprod-auth
     sudo systemctl start preprod-auth
     ```

## VPS Deployment Guide

1. **System Preparation**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js 18
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install MongoDB
   sudo apt-get install -y mongodb-org
   ```

2. **Project Setup**
   ```bash
   # Create project directory
   sudo mkdir -p /var/www/preprod.local/auth
   sudo chown -R $USER:$USER /var/www/preprod.local/auth
   
   # Clone repository
   git clone [repository-url] /var/www/preprod.local/auth
   cd /var/www/preprod.local/auth
   npm install
   ```

3. **MongoDB Configuration**
   - Follow the same MongoDB setup as local development
   - Update firewall rules:
     ```bash
     sudo ufw allow from localhost to any port 27017
     ```

4. **Postfix Configuration**
   ```bash
   sudo apt-get install -y postfix mailutils
   ```
   - During Postfix installation, select "Internet Site"
   - Update `/etc/postfix/main.cf`:
     ```
     myhostname = your-vps-hostname
     mydestination = $myhostname, localhost.$mydomain, localhost
     virtual_alias_domains = ld-csmlmail.test
     ```
   - Configure mail forwarding if needed

5. **Service Configuration**
   - Update service file with VPS-specific settings:
     ```ini
     Environment=NODE_ENV=production
     Environment=FRONTEND_URL=https://your-frontend-domain
     Environment=CORS_ORIGINS=https://your-frontend-domain
     ```
   - Set strong JWT secret
   - Enable and start service

## Common Issues and Troubleshooting

1. **MongoDB Connection Issues**
   - Check MongoDB service status: `sudo systemctl status mongodb`
   - Verify credentials in service file
   - Check MongoDB logs: `sudo journalctl -u mongodb`

2. **Email Delivery Problems**
   - Check Postfix status: `sudo systemctl status postfix`
   - View mail logs: `sudo tail -f /var/log/mail.log`
   - Test mail delivery:
     ```bash
     echo "Test" | mail -s "Test Subject" user@ld-csmlmail.test
     ```
   - Check mail queue: `mailq`

3. **Service Start Failures**
   - Check service logs: `sudo journalctl -u preprod-auth`
   - Verify environment variables
   - Check file permissions

4. **API Connection Issues**
   - Verify CORS settings
   - Check API service URL configuration
   - Test API endpoints with curl

## Status Flow

The registration process follows these status transitions:
1. INITIATED
2. USERNAME_VALIDATED
3. USER_CREATED
4. SYSTEM_USER_CREATED
5. VERIFICATION_SENT
6. VERIFIED

## API Endpoints

### Registration Flow
- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify-email` - Verify email address
- `POST /api/auth/login` - User login

### Required Fields
- username: Must start with letter, only lowercase letters/numbers/underscores/hyphens
- displayName: Minimum 3 characters
- personalEmail: Valid email format
- password: Minimum 8 characters
- phoneNumber: E.164 format (e.g., +12345678901)
- emailAccount: Automatically generated as username@ld-csmlmail.test

## Security Notes

1. Always use HTTPS in production
2. Set strong JWT secrets
3. Keep MongoDB secure and accessible only from localhost
4. Regularly update dependencies
5. Monitor logs for suspicious activities
