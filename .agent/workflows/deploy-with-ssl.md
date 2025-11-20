---
description: Panduan Deploy Website dengan HTTPS/SSL
---

# 🔒 Panduan Deploy Website dengan HTTPS/SSL

## Pilihan Platform Hosting dengan SSL Gratis

### 1. **Vercel (Recommended - Paling Mudah)**
✅ SSL otomatis gratis
✅ Deploy super cepat
✅ Support Node.js backend
✅ Custom domain gratis

**Langkah Deploy:**

```bash
# Install Vercel CLI
npm install -g vercel

# Login ke Vercel
vercel login

# Deploy (dari root project)
vercel
```

**Konfigurasi untuk Backend:**
- Frontend akan auto-deploy
- Backend perlu setup sebagai Serverless Function atau deploy terpisah

---

### 2. **Netlify**
✅ SSL otomatis gratis
✅ Continuous deployment
✅ Custom domain support

**Langkah Deploy:**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

---

### 3. **Railway.app (Untuk Full-Stack)**
✅ SSL otomatis
✅ Support PostgreSQL database
✅ Deploy frontend + backend sekaligus

**Langkah Deploy:**
1. Buat akun di railway.app
2. Connect GitHub repository
3. Railway akan auto-detect dan deploy

---

### 4. **Render.com (Recommended untuk Full-Stack)**
✅ SSL gratis otomatis
✅ PostgreSQL database gratis
✅ Deploy frontend + backend

**Langkah Deploy:**
1. Buat akun di render.com
2. Create Web Service untuk backend
3. Create Static Site untuk frontend
4. SSL otomatis aktif

---

## Konfigurasi Security Headers

Tambahkan security headers untuk keamanan maksimal:

### File: `vercel.json` (untuk Vercel)
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ]
}
```

---

## Environment Variables

Pastikan set environment variables di hosting:

```env
DATABASE_URL=your_production_database_url
NODE_ENV=production
PORT=3001
```

---

## Custom Domain dengan SSL

### Vercel:
1. Beli domain (Namecheap, GoDaddy, dll)
2. Di Vercel Dashboard → Settings → Domains
3. Tambahkan domain Anda
4. Update DNS records sesuai instruksi Vercel
5. SSL otomatis aktif dalam 24 jam

### Cloudflare (SSL Gratis):
1. Daftar di cloudflare.com
2. Tambahkan domain Anda
3. Update nameserver domain ke Cloudflare
4. Aktifkan SSL/TLS → Full (strict)
5. SSL otomatis aktif

---

## Checklist Keamanan Website

- [ ] HTTPS/SSL aktif
- [ ] Security headers configured
- [ ] Environment variables aman (tidak di-commit ke Git)
- [ ] CORS configured dengan benar
- [ ] Input validation di backend
- [ ] Rate limiting untuk API
- [ ] Password hashing (bcrypt)
- [ ] SQL injection protection (Prisma ORM)
- [ ] XSS protection
- [ ] CSRF protection

---

## Testing SSL

Setelah deploy, test SSL Anda di:
- https://www.ssllabs.com/ssltest/
- https://securityheaders.com/

Target: Minimal rating A

---

## Troubleshooting

### Mixed Content Error:
Pastikan semua resource (images, scripts) menggunakan HTTPS

### SSL Not Active:
- Tunggu 24-48 jam untuk propagasi DNS
- Clear browser cache
- Check DNS settings

### CORS Error:
Update backend CORS config dengan production URL
