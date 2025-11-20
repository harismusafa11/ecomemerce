# Security Policy

## Reporting Security Issues

If you discover a security vulnerability, please email: security@tapakpamungkas.com

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## Security Measures

This application implements:
- HTTPS/SSL encryption
- Security headers (HSTS, CSP, X-Frame-Options, etc.)
- Input validation and sanitization
- SQL injection protection via Prisma ORM
- XSS protection
- CORS configuration
- Rate limiting
- Secure password storage

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Security Headers

We implement the following security headers:
- `Strict-Transport-Security`
- `X-Content-Type-Options`
- `X-Frame-Options`
- `X-XSS-Protection`
- `Content-Security-Policy`
- `Referrer-Policy`
- `Permissions-Policy`

## SSL/TLS

All connections must use HTTPS. HTTP requests are automatically redirected to HTTPS.

## Data Protection

- User passwords are hashed using bcrypt
- Sensitive data is encrypted in transit and at rest
- Database connections use SSL
- Environment variables are stored securely

## Third-Party Services

We use the following trusted services:
- Prisma (Database ORM)
- PostgreSQL (Database)
- Vercel/Netlify (Hosting with SSL)

## Updates

This security policy is reviewed and updated regularly.

Last updated: 2025-11-20
