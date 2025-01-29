# Local Email Configuration

## Overview
This document describes the email configuration setup for the local development environment using neomutt and postfix.

## Domain Configuration
- Primary domain: `local-dev.test`
- Previous domain (`local-dev.domain`) has been removed from all configurations

## Neomutt Configuration
Location: `~/.neomuttrc`

### Key Settings
```conf
# Account Settings
set realname = "Local Dev User"
set from = "zero-innerpixel@local-dev.test"

# SMTP Settings
set smtp_url = "smtp://localhost:25"
unset smtp_pass
set ssl_starttls = no
set ssl_force_tls = no

# Alias settings for consistent domain usage
alias zero-innerpixel zero-innerpixel <zero-innerpixel@local-dev.test>
set reverse_alias = yes
```

### Alias Configuration
- Aliases file location: `~/.neomutt/aliases`
- Contains email aliases for consistent domain usage

## Postfix Configuration
Key settings in `/etc/postfix/main.cf`:
```conf
myhostname = local-dev.test
mydomain = local-dev.test
inet_interfaces = loopback-only
mynetworks = 127.0.0.0/8 [::ffff:127.0.0.0]/104 [::1]/128
```

## SSL Certificates
- Location: `/etc/nginx/ssl/`
- Current certificates: `local-dev.test.crt` and `local-dev.test.key`
- Old certificates (`local-dev.domain.*`) have been removed

## Testing Email
To test email functionality:
1. Open neomutt: `neomutt`
2. Compose new message (press `m`)
3. Verify the From address shows: `zero-innerpixel@local-dev.test`
4. Send to another local address (e.g., `zero-innerpixel@local-dev.test`)

## Troubleshooting
If email sending fails:
1. Check postfix status: `systemctl status postfix`
2. Verify postfix configuration: `sudo postconf -n`
3. Check mail logs: `sudo tail -f /var/log/mail.log`
4. Restart services if needed:
   ```bash
   sudo systemctl restart postfix
   killall neomutt && neomutt
   ```
