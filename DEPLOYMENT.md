# 🚀 Deployment Guide - Tapak Pamungkas

## ✅ Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrated and seeded
- [ ] Build tested locally
- [ ] Security headers configured
- [ ] CORS settings updated for production
- [ ] SSL certificate ready (auto via hosting)

---

## 🔒 Security Features Implemented

### ✅ HTTPS/SSL
- Automatic SSL via Vercel/Netlify
- HSTS (HTTP Strict Transport Security)
- Force HTTPS redirect in production

### ✅ Security Headers
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security`
- `Content-Security-Policy`
- `Referrer-Policy`
- `Permissions-Policy`

### ✅ Application Security
- Rate limiting (100 requests/minute per IP)
- CORS protection
- Input validation
- SQL injection protection (Prisma ORM)
- XSS protection
- JSON payload size limit (10MB)

---

## 📦 Option 1: Deploy to Vercel (Recommended)

### Prerequisites
```bash
npm install -g vercel
```

### Steps
```bash
# 1. Login to Vercel
vercel login

# 2. Deploy
vercel

# 3. Follow prompts:
#    - Link to existing project? No
#    - Project name: tapak-pamungkas
#    - Directory: ./
#    - Override settings? No

# 4. Deploy to production
vercel --prod
```

### Environment Variables (Vercel Dashboard)
1. Go to Project Settings → Environment Variables
2. Add:
   - `DATABASE_URL` = your production database URL
   - `NODE_ENV` = production

### Custom Domain
1. Go to Project Settings → Domains
2. Add your domain: `tapakpamungkas.com`
3. Update DNS records as instructed
4. SSL will auto-activate within 24 hours

---

## 📦 Option 2: Deploy to Netlify

### Prerequisites
```bash
npm install -g netlify-cli
```

### Steps
```bash
# 1. Login
netlify login

# 2. Initialize
netlify init

# 3. Deploy
netlify deploy --prod
```

### Environment Variables
```bash
netlify env:set DATABASE_URL "your_database_url"
netlify env:set NODE_ENV "production"
```

---

## 📦 Option 3: Deploy to Railway.app

### Steps
1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Connect your repository
5. Add environment variables in dashboard
6. Deploy automatically starts

### Database Setup
Railway provides PostgreSQL:
1. Add PostgreSQL service
2. Copy DATABASE_URL
3. Add to environment variables

---

## 📦 Option 4: Deploy to Render.com

### Backend (Web Service)
1. Create new Web Service
2. Connect repository
3. Build command: `npm install && npx prisma generate`
4. Start command: `npm run server`
5. Add environment variables

### Frontend (Static Site)
1. Create new Static Site
2. Build command: `npm run build`
3. Publish directory: `dist`

---

## 🗄️ Database Migration

### Production Database Setup
```bash
# 1. Set production DATABASE_URL
export DATABASE_URL="your_production_url"

# 2. Run migrations
npx prisma migrate deploy

# 3. Generate Prisma Client
npx prisma generate

# 4. (Optional) Seed data
npx prisma db seed
```

---

## 🌐 DNS Configuration

### For Cloudflare (Recommended)
1. Add A record: `@` → Vercel IP
2. Add CNAME: `www` → `cname.vercel-dns.com`
3. Enable SSL/TLS → Full (strict)
4. Enable "Always Use HTTPS"

### For Other DNS Providers
Follow hosting provider's DNS instructions

---

## 🧪 Testing After Deployment

### 1. SSL Test
Visit: https://www.ssllabs.com/ssltest/
- Target: A+ rating

### 2. Security Headers
Visit: https://securityheaders.com/
- Target: A rating

### 3. Performance
Visit: https://pagespeed.web.dev/
- Target: 90+ score

### 4. Functionality
- [ ] Homepage loads
- [ ] Products display
- [ ] Cart works
- [ ] Checkout works
- [ ] Admin panel accessible
- [ ] API endpoints respond
- [ ] Database connected

---

## 🔧 Troubleshooting

### SSL Not Active
- Wait 24-48 hours for DNS propagation
- Clear browser cache
- Check DNS settings

### CORS Errors
Update `server/index.ts`:
```typescript
const allowedOrigins = ['https://yourdomain.com'];
```

### Database Connection Failed
- Verify DATABASE_URL in environment variables
- Check database is accessible from hosting IP
- Run `npx prisma generate`

### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

---

## 📊 Monitoring

### Vercel Analytics
- Automatic in Vercel dashboard
- View traffic, performance, errors

### Custom Monitoring
Consider adding:
- Sentry (error tracking)
- LogRocket (session replay)
- Google Analytics

---

## 🔐 Security Best Practices

1. **Never commit `.env` files**
2. **Use strong passwords** for database
3. **Enable 2FA** on hosting accounts
4. **Regular backups** of database
5. **Monitor logs** for suspicious activity
6. **Keep dependencies updated**
7. **Use environment variables** for secrets

---

## 📞 Support

For deployment issues:
- Check hosting provider documentation
- Review error logs in dashboard
- Contact hosting support

---

## 🎉 Post-Deployment

After successful deployment:
1. ✅ Test all features
2. ✅ Monitor error logs
3. ✅ Set up backups
4. ✅ Configure monitoring
5. ✅ Update DNS records
6. ✅ Announce launch! 🚀

---

**Website will be secure with HTTPS and SSL automatically activated!** 🔒
