# Test User Setup Documentation

## Purpose
This document outlines the process of creating test users for the CSMCL Space user management system. These test users simulate external users attempting to register for CSMCL Space accounts.

## Domain Structure
### Development Environment
- **Web Content**: `ld-csmclnexux.test` (maps to production's `csmcl.space`)
- **Mail Server**: `ld-csmlmail.test` (maps to production cosmical.me)
- **Mail Domain**: `@ld-csmlmail.test`

### Production Environment
- **Web Content**: `csmcl.space`
- **Mail Domain**: `@cosmical.me`

## User Naming Convention
- Format: `regular_XXXX` (where XXXX is a sequential number starting from 0001)
- Example: `regular_0001`

## User Types
1. **Local Linux User**: Represents an external user (not yet in CSMCL Space)
   - Email: `regular_XXXX@ld-csmlmail.test`
   - Home Directory: `/home/regular_XXXX`
   - Purpose: Simulates external users trying to register

2. **Future CSMCL Space User**: The account they're registering for
   - Email: `regular_XXXX@ld-csmlmail.test`
   - Purpose: Represents their future CSMCL Space account

## Directory Structure Setup
```bash
/home/regular_XXXX/
├── Maildir/                 # Maildir format email storage
│   ├── cur/                # Current messages
│   ├── new/                # New messages
│   ├── tmp/                # Temporary messages
│   ├── .Sent/             # Sent messages
│   ├── .Drafts/           # Draft messages
│   └── .Trash/            # Deleted messages
├── .config/
│   └── neomutt/           # Neomutt mail client configuration
│       └── neomuttrc      # Mail client settings
└── public_html/           # Public web directory
```

## Permissions
- Maildir: 700 (drwx------)
- public_html: 755 (drwxr-xr-x)
- .config/neomutt: 700 (drwx------)
- neomuttrc: 600 (-rw-------)

## Creation Process
1. Create Linux user:
   ```bash
   sudo useradd -m -s /bin/bash regular_XXXX
   sudo passwd regular_XXXX
   ```

2. Set up Maildir structure:
   ```bash
   sudo -u regular_XXXX mkdir -p /home/regular_XXXX/Maildir/{cur,new,tmp}
   sudo -u regular_XXXX mkdir -p /home/regular_XXXX/Maildir/.Sent/{cur,new,tmp}
   sudo -u regular_XXXX mkdir -p /home/regular_XXXX/Maildir/.Drafts/{cur,new,tmp}
   sudo -u regular_XXXX mkdir -p /home/regular_XXXX/Maildir/.Trash/{cur,new,tmp}
   sudo chmod -R 700 /home/regular_XXXX/Maildir
   ```

3. Configure Neomutt:
   ```bash
   sudo -u regular_XXXX mkdir -p /home/regular_XXXX/.config/neomutt
   # Create neomuttrc with appropriate settings
   sudo chmod 700 /home/regular_XXXX/.config/neomutt
   sudo chmod 600 /home/regular_XXXX/.config/neomutt/neomuttrc
   ```

4. Create public directory:
   ```bash
   sudo -u regular_XXXX mkdir -p /home/regular_XXXX/public_html
   sudo chmod 755 /home/regular_XXXX/public_html
   ```

## Space Explorer Validation

### Validation Script
The `validate_space_explorer.sh` script performs comprehensive checks on test user setup:

1. **Basic Configuration**
   - Linux user existence
   - Home directory presence

2. **Directory Structure**
   - Maildir hierarchy
   - Required subdirectories
   - public_html directory

3. **Permissions**
   - Maildir permissions (700)
   - public_html permissions (755)
   - Configuration file permissions

4. **Mail Configuration**
   - Neomutt configuration
   - Required mail settings
   - Space-themed headers

5. **Mail Routing**
   - Postfix virtual aliases
   - Domain configuration

### Usage
```bash
# Validate a single explorer
sudo ./scripts/validate_space_explorer.sh 0001

# Validate all explorers
for id in {0001..0004}; do
    sudo ./scripts/validate_space_explorer.sh $id
done
```

### Validation Output
The script provides:
- 🔍 Detailed scan of each component
- ✅ Success indicators for passing checks
- ❌ Failure indicators with required actions
- 📊 Summary report of all systems

### Creating New Explorers
When creating new test users:
1. Create the user following the setup instructions
2. Run the validation script to verify the setup
3. Fix any reported issues
4. Re-run validation to confirm fixes

## Current Space Explorers

### Active Team Members
1. **Explorer regular_0001**
   - Role: First Contact Specialist
   - SIM Frequency: CSMC0001
   - Local Mail: regular_0001@ld-csmlmail.test
   - Space Mail: regular_0001@csmcl.space
   - Status: Active
   - Special Skills: Initial contact protocols, diplomatic relations

2. **Explorer regular_0002**
   - Role: Quantum Communications Expert
   - SIM Frequency: CSMC2510
   - Local Mail: regular_0002@ld-csmlmail.test
   - Space Mail: regular_0002@csmcl.space
   - Status: Active
   - Special Skills: Quantum entanglement, deep space transmissions

3. **Explorer regular_0003**
   - Role: Space-Time Navigator
   - SIM Frequency: CSMC8174
   - Local Mail: regular_0003@ld-csmlmail.test
   - Space Mail: regular_0003@csmcl.space
   - Status: Created, Awaiting Setup
   - Special Skills: Temporal mechanics, route plotting

4. **Explorer regular_0004**
   - Role: Cosmic Data Analyst
   - SIM Frequency: CSMC0357
   - Local Mail: regular_0004@ld-csmlmail.test
   - Space Mail: regular_0004@csmcl.space
   - Status: Created, Awaiting Setup
   - Special Skills: Data pattern analysis, cosmic trends

### System Status
- **Fully Configured**: regular_0001, regular_0002
- **Pending Setup**: regular_0003, regular_0004
- **Total Explorers**: 4

### Communication Channels
- **Development Mail Server**: `ld-csmlmail.test`
- **Development Web Server**: `ld-csmclnexux.test`
- **Production Domain**: `csmcl.space`

### Team Communication Structure
```
regular_0001 (First Contact) ←→ regular_0002 (Communications)
         ↑                            ↑
         ↓                            ↓
regular_0003 (Navigator)  ←→  regular_0004 (Analyst)
```

### Validation Status
To check an explorer's system status:
```bash
./scripts/validate_space_explorer.sh <explorer_id>
# Example: ./scripts/validate_space_explorer.sh 0001
```

## Thematic Testing Approach

### Space Theme Integration
The test environment is designed to mirror the cosmic nature of the CSMCL Space project:

1. **Test User Personas**
   - Each test user is treated as a potential "space explorer"
   - SIM frequencies (CSMC-XXXX) give each user a unique cosmic identity
   - Email communications use space-themed language and emoji

2. **Development Benefits**
   - Makes test data more memorable and traceable
   - Helps catch inconsistencies in the space theme
   - Creates a more engaging testing experience
   - Validates the production environment's thematic elements

3. **Communication Templates**
   Example space-themed elements:
   - 🛸 Deep Space Signal (for notifications)
   - 🌌 Transmission IDs (for message tracking)
   - 📡 Quantum frequencies (for user identifiers)
   - ⚠️ Security protocols (for authentication)

4. **Local Development Integration**
   - Uses `ld-csmlmail.test` as the local "space communication array"
   - Test domains mirror production cosmic themes
   - Development environment feels like a "training ground" for space operations

This thematic approach ensures that testing isn't just functional but also validates the user experience and brand consistency.

## Testing Process
1. Send test email to `regular_XXXX@ld-csmlmail.test`
2. Verify email appears in Maildir
3. Test registration process for `regular_XXXX@csmcl.space`
4. Verify registration emails are received

## Troubleshooting Guide

### Mail System Configuration

#### Common Issues and Solutions

1. **SSL/TLS Certificate Issues**
   - **Symptom**: "Untrusted server certificate" errors
   - **Solution**: For test environment, disable SSL verification in neomutt:
     ```conf
     # Test environment settings
     set ssl_starttls=no
     set ssl_force_tls=no
     set ssl_verify_host=no
     set ssl_verify_dates=no
     ```
   - **Note**: Production environment should use proper SSL certificates

2. **Mail Delivery Problems**
   - **Symptom**: Messages not appearing in recipient's Maildir
   - **Solution**: 
     - Verify Maildir structure exists and has correct permissions (700)
     - Ensure postfix is configured for local delivery
     - Check mail logs: `/var/log/mail.log`

3. **Neomutt Configuration**
   - **Development Settings**:
     ```conf
     # Basic settings
     set mbox_type=Maildir
     set folder="~/Maildir"
     set spoolfile="+/"
     set record="+.Sent"
     set postponed="+.Drafts"
     set trash="+.Trash"

     # Local mail settings
     set smtp_url="smtp://localhost:25"
     
     # Character and display settings
     set send_charset="utf-8"
     set assumed_charset="utf-8"
     set allow_8bit=yes
     set sort=threads
     set sort_aux=reverse-last-date-received
     ```

   - **Production Settings**:
     ```conf
     # Additional SSL/TLS settings for production
     set ssl_starttls=yes
     set ssl_force_tls=yes
     set ssl_verify_host=yes
     set ssl_verify_dates=yes
     set certificate_file=/etc/ssl/certs/your-cert.pem
     set smtp_url="smtps://mail.csmcl.space:465"
     ```

### Environment-Specific Configurations

#### Development Environment
- Domain: `ld-csmlmail.test`
- SSL: Disabled for testing
- SMTP: Local port 25
- Mail Storage: Local Maildir

#### Production Environment
- Domain: `cosmical.me`
- SSL: Required with valid certificates
- SMTP: Port 465 (SMTPS) or 587 (STARTTLS)
- Mail Storage: Production Maildir

### Validation Process
1. Check mail system status:
   ```bash
   systemctl status postfix
   ```

2. Verify mail directories:
   ```bash
   ls -la /home/regular_XXXX/Maildir/{new,cur,tmp}
   ```

3. Test mail delivery:
   ```bash
   echo "Test message" | neomutt -s "Test" user@ld-csmlmail.test
   ```

4. Monitor mail logs:
   ```bash
   tail -f /var/log/mail.log
   ```

### Best Practices
1. Always use appropriate SSL settings for the environment
2. Maintain proper directory permissions
3. Regular monitoring of mail logs
4. Separate configurations for development and production

## Notes
- This setup is for development/testing only
- In production, actual email domains and VPS configurations will be used
- User numbering helps track test cases and maintain order
- All test users should be documented for future reference
