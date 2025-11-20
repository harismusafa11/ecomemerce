# ✅ Pre-Deployment Checklist

## 📋 Checklist Sebelum Deploy ke Vercel

### 1. ✅ API Serverless Functions
- [x] Folder `api/` dibuat
- [x] `api/index.ts` - Main handler yang export Express app
- [x] `api/products.ts` - Products endpoint (optional)
- [x] `api/users.ts` - Users endpoint (optional)
- [x] `api/orders.ts` - Orders endpoint (optional)
- [x] `api/health.ts` - Health check endpoint
- [x] CORS configuration di setiap endpoint
- [x] Error handling di setiap endpoint
- [x] TypeScript types dari `@vercel/node`

### 2. ✅ Dependencies
- [x] `@vercel/node` installed
- [x] `@prisma/client` installed
- [x] `express` installed
- [x] `cors` installed
- [x] `dotenv` installed
- [x] All dev dependencies installed

### 3. ✅ Configuration Files
- [x] `vercel.json` dengan routing configuration
- [x] `package.json` dengan `vercel-build` script
- [x] `tsconfig.json` configured
- [x] `.env` file (untuk local development)
- [x] `.gitignore` exclude `.env`

### 4. ✅ Database
- [x] Prisma schema defined (`prisma/schema.prisma`)
- [x] Models untuk: User, Product, Order, Cart, Wishlist, Voucher
- [x] Database URL ready (PostgreSQL recommended)

### 5. ✅ Documentation
- [x] `API-SETUP-SUMMARY.md` - Overview
- [x] `SERVERLESS-DEPLOYMENT.md` - Deployment guide
- [x] `ARCHITECTURE.md` - Architecture diagram
- [x] `api/README.md` - API documentation
- [x] `api/API-TESTING.md` - Testing guide

---

## 🚀 Ready to Deploy!

### Pre-Deploy Actions

#### 1. Test Local Build
```bash
npm run build
```
**Expected:** Build successful without errors

#### 2. Test Prisma Generate
```bash
npx prisma generate
```
**Expected:** Prisma Client generated successfully

#### 3. Verify Environment Variables
**Check `.env` file has:**
```env
DATABASE_URL="postgresql://..."
```

#### 4. Test Health Endpoint Locally
```bash
# Terminal 1
npm run server

# Terminal 2
curl http://localhost:3001/api/health
```
**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "...",
  "database": "connected"
}
```

---

## 🎯 Deployment Steps

### Step 1: Commit and Push
```bash
git add .
git commit -m "Add serverless API functions for Vercel"
git push origin main
```

### Step 2: Vercel Setup
1. Go to https://vercel.com
2. Login with GitHub
3. Click "Add New Project"
4. Import your repository
5. Vercel will auto-detect configuration

### Step 3: Environment Variables
**CRITICAL:** Set these in Vercel Dashboard

Go to: **Settings → Environment Variables**

Add:
```
Variable Name: DATABASE_URL
Value: your_postgresql_connection_string
Environment: Production, Preview, Development
```

**For Production Database, Use:**
- ✅ Supabase (recommended) - Built-in pooling
- ✅ Neon - Serverless PostgreSQL
- ✅ Railway - Add `?pgbouncer=true`
- ❌ Not recommended: Direct connection without pooling

### Step 4: Deploy
Click "Deploy" button and wait!

**Deployment typically takes:** 2-5 minutes

---

## ✅ Post-Deployment Verification

### 1. Health Check
```bash
curl https://your-app.vercel.app/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-20T11:16:03.000Z",
  "database": "connected",
  "environment": "production"
}
```

**If you get error:**
- ❌ `"database": "disconnected"` → Check DATABASE_URL
- ❌ 500 error → Check Vercel function logs
- ❌ 404 error → Check vercel.json routing

### 2. Test Products Endpoint
```bash
curl https://your-app.vercel.app/api/products
```

**Expected:** Array of products or empty array `[]`

### 3. Test in Browser
Open browser and visit:
```
https://your-app.vercel.app/api/health
https://your-app.vercel.app/api/products
```

### 4. Test Frontend
```
https://your-app.vercel.app/
```

**Check:**
- [ ] Homepage loads
- [ ] Products page shows data
- [ ] Cart functionality works
- [ ] Login/Register works
- [ ] Checkout works

---

## 🔍 Troubleshooting

### Issue: "Cannot find module @prisma/client"

**Solution:**
```bash
# Local
npm install
npm run vercel-build

# Vercel
Check build logs - should run "prisma generate"
```

### Issue: Database connection failed

**Solution:**
1. Check DATABASE_URL in Vercel environment variables
2. Verify database is accessible from internet
3. Use connection pooling (Supabase recommended)
4. Check database firewall allows Vercel IPs

**Test connection string:**
```bash
# Local test
DATABASE_URL="your_url" npx prisma db push
```

### Issue: 404 on /api endpoints

**Solution:**
Check `vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index"
    }
  ]
}
```

### Issue: CORS error

**Solution:**
Already handled in all endpoints with:
```typescript
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
```

If still error, check browser console for exact error.

### Issue: Function timeout

**Solution:**
- Optimize database queries
- Add indexes to Prisma schema
- Use connection pooling
- Consider upgrading Vercel plan

---

## 📊 Monitoring

### Vercel Dashboard
After deploy, monitor:

1. **Functions**
   - Execution time
   - Invocations count
   - Error rate

2. **Analytics**
   - Page views
   - API requests
   - Response times

3. **Logs**
   - Real-time function logs
   - Error traces
   - Request details

### Custom Monitoring
Setup external monitoring:

```bash
# Cron job example (every 5 minutes)
*/5 * * * * curl https://your-app.vercel.app/api/health

# Or use services like:
# - UptimeRobot
# - Pingdom
# - Better Uptime
```

---

## 🎨 Optional Enhancements

### 1. Add Sentry for Error Tracking
```bash
npm install @sentry/node
```

### 2. Add Response Caching
```typescript
res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
```

### 3. Add API Rate Limiting
Already implemented in `server/index.ts`!

### 4. Add JWT Authentication
```bash
npm install jsonwebtoken
```

### 5. Add API Documentation
Use Swagger/OpenAPI

---

## 🎯 Success Criteria

Your deployment is successful if:

✅ Health check returns `"status": "ok"`  
✅ Products endpoint returns data  
✅ Frontend can fetch from API  
✅ No errors in Vercel function logs  
✅ Database connection working  
✅ All pages load correctly  

---

## 📞 Next Steps After Deployment

1. **Test All Features**
   - User registration/login
   - Product browsing
   - Cart operations
   - Checkout process
   - Admin panel

2. **Setup Domain (Optional)**
   - Add custom domain in Vercel
   - Configure DNS
   - Auto SSL certificate

3. **Enable Analytics**
   - Vercel Analytics
   - Google Analytics
   - Custom tracking

4. **Security**
   - Review CORS settings
   - Add rate limiting per user
   - Implement JWT tokens
   - Add input sanitization

5. **Performance**
   - Add Redis caching
   - Optimize images
   - Enable compression
   - Monitor slow queries

---

## 📚 Important Files Reference

| File | Purpose |
|------|---------|
| `api/index.ts` | Main serverless handler |
| `server/index.ts` | Express app (used by api/index.ts) |
| `vercel.json` | Routing configuration |
| `package.json` | Dependencies & build scripts |
| `prisma/schema.prisma` | Database models |

---

## 💡 Tips

1. **Auto-Deploy**: Every push to `main` triggers deployment
2. **Preview Deployments**: PRs get preview URLs automatically
3. **Rollback**: Easy rollback in Vercel dashboard
4. **Environments**: Different env vars for production/preview/development
5. **Team**: Invite team members in Vercel settings

---

## 🎉 You're Ready!

Semua sudah siap untuk deployment. Ikuti checklist di atas dan aplikasi Anda akan live dalam beberapa menit!

**Good luck! 🚀**

---

## 📝 Deployment Log Template

```
Deployment Date: ___________
Deployed By: ___________
Vercel URL: ___________
GitHub Commit: ___________

Pre-Deployment Checks:
[ ] Local build successful
[ ] Prisma generate working
[ ] Environment variables set
[ ] Database accessible

Post-Deployment Checks:
[ ] Health check passed
[ ] Products endpoint working
[ ] Frontend loading
[ ] All features tested
[ ] No errors in logs

Issues Encountered:
_________________________
_________________________

Resolution:
_________________________
_________________________

Deployment Status: [ ] SUCCESS  [ ] FAILED  [ ] PARTIAL
```
