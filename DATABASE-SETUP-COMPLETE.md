# ✅ Database Updated to Prisma.io

## 🎉 Setup Complete!

### ✅ What Was Done:

1. **Updated .env** with new Prisma database URL
2. **Pushed schema** to Prisma database (`prisma db push`)
3. **Seeded database** with:
   - ✅ Admin user: `admin@tapakpamungkas.com` / `admin123`
   - ✅ 3 sample products
   - ✅ 2 vouchers (WELCOME10, FLASH50)

### 📊 Database Info:

**Provider:** Prisma.io  
**Host:** db.prisma.io  
**Pooling:** ✅ Enabled (`pool=true`)  
**SSL:** ✅ Required (`sslmode=require`)

---

## 🚀 Next Steps for Vercel:

### Step 1: Set Environment Variable in Vercel

1. Go to **Vercel Dashboard**: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings → Environment Variables**
4. Add new variable:

```
Name: DATABASE_URL

Value: postgres://5330c3ceb357f57b99bd6b9dfb5e2a25e694574a2238cf0fc7762000637b7643:sk_wVeV4rh7vgyWzNGqAQHHK@db.prisma.io:5432/postgres?sslmode=require&pool=true

Environment: ✅ Production ✅ Preview ✅ Development
```

5. Click **Save**

### Step 2: Redeploy

After setting environment variable:

**Option A: Trigger via Push** (Recommended)
```bash
git add .
git commit -m "Update database to Prisma.io"
git push origin main
```

**Option B: Manual Redeploy**
1. Vercel Dashboard → **Deployments**
2. Click **"..."** on latest deployment
3. Click **Redeploy**

### Step 3: Verify Deployment

After deployment completes (2-3 minutes):

```bash
# Test health endpoint
curl https://your-app.vercel.app/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "database": "connected",
  "databaseUrl": "Set (hidden)",
  "stats": {
    "users": 1,
    "products": 3
  }
}
```

### Step 4: Test Features

1. **Open your deployed site:** `https://your-app.vercel.app`
2. **Test Products:** Should see 3 products on homepage
3. **Test Vouchers:** Navigate to Voucher page
4. **Test Login:**
   - Email: `admin@tapakpamungkas.com`
   - Password: `admin123`
5. **Test Admin Panel:** Should redirect to admin panel after login

---

## 🔄 Local Development

**Restart your local server** to use new database:

```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run server
npm run dev
```

**Test locally:**
```
http://localhost:3000
```

---

## 📦 Database Contains:

### Admin User:
- **Email:** admin@tapakpamungkas.com
- **Password:** admin123
- **isAdmin:** true

### Products (3):
1. Mahaguru Mata Bathin (Keilmuan) - Rp 500,000
2. Batu Akik Bertuah (Media Bertuah) - Rp 750,000
3. Minyak Herbal Mistis (Media Herbal) - Rp 300,000

### Vouchers (2):
1. **WELCOME10** - 10% discount (Valid until Dec 31, 2025)
2. **FLASH50** - 50% discount (Valid until Jun 30, 2025)

---

## 🎯 Why This Database Works for Vercel:

✅ **Connection Pooling:** `pool=true` prevents connection exhaustion  
✅ **SSL Required:** Secure connection  
✅ **Hosted by Prisma:** Reliable infrastructure  
✅ **Optimized for Serverless:** Built for functions-as-a-service  

---

## 🔍 Troubleshooting

### If Vercel still shows 500 error:

1. **Check Environment Variable:**
   - Ensure DATABASE_URL is set in Vercel
   - Check all 3 environments (Production, Preview, Development)

2. **Check Deployment Logs:**
   - Vercel Dashboard → Deployments → View Function Logs
   - Look for database connection errors

3. **Test Health Endpoint:**
   ```bash
   curl https://your-app.vercel.app/api/health
   ```

4. **Verify Database:**
   - Ensure schema is pushed: `npx prisma db push`
   - Check data exists: `npx prisma studio`

### Common Issues:

**Issue:** "Can't reach database server"  
**Fix:** Check DATABASE_URL is exactly as provided (with pool=true)

**Issue:** "No admin user found"  
**Fix:** Run seed again: `npm run seed-production`

**Issue:** "Products not showing"  
**Fix:** Check if products seeded: Open Prisma Studio

---

## 📝 Commands Reference:

```bash
# View database in browser
npx prisma studio

# Push schema changes
npx prisma db push

# Seed/re-seed database
npm run seed-production

# Test local connection
npm run server
curl http://localhost:3001/api/health

# Deploy to Vercel
git push origin main
```

---

## ✅ Checklist:

- [x] Database connection string updated in .env
- [x] Schema pushed to Prisma database
- [x] Database seeded with admin, products, vouchers
- [ ] DATABASE_URL set in Vercel environment variables
- [ ] Vercel redeployed
- [ ] Health endpoint tested (should return "connected")
- [ ] Login tested (admin@tapakpamungkas.com)
- [ ] Products displaying
- [ ] Vouchers displaying

---

**🎉 Local setup complete! Now set DATABASE_URL in Vercel and redeploy!**
