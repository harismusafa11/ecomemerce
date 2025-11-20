# 🚀 Vercel Deployment Fix Guide

## 🐛 Masalah yang Teridentifikasi

Dari screenshot error:
```
❌ Failed to load resource: 500 error
❌ Failed to fetch vouchers
❌ Login error: Invalid credentials
```

## ✅ Solusi

### 1. **Database Connection** (PALING PENTING!)

Vercel serverless functions butuh **connection pooling**. Database URL biasa akan habis connections.

#### Format DATABASE_URL yang Benar:

**❌ SALAH (Direct Connection):**
```
DATABASE_URL="postgresql://user:password@host:5432/database"
```

**✅ BENAR (Dengan Connection Pooling):**

**Opsi A: Prisma Accelerate (Recommended)**
```
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_API_KEY"
```

**Opsi B: Supabase (Gratis)**
```
DATABASE_URL="postgresql://user:password@db.xxx.supabase.co:6543/postgres?pgbouncer=true"
```

**Opsi C: Neon (Serverless)**
```
DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/database?sslmode=require"
```

**Opsi D: Railway**
```
DATABASE_URL="postgresql://user:password@containers-us-west-xxx.railway.app:5432/railway?pgbouncer=true"
```

### 2. **Environment Variables di Vercel**

**CRITICAL:** Set these in Vercel Dashboard:

1. Go to: **Project Settings → Environment Variables**

2. Add:
```
Name: DATABASE_URL
Value: your_pooled_connection_string
Environment: Production, Preview, Development
```

3. Add (Optional tapi recommended):
```
Name: NODE_ENV
Value: production
Environment: Production
```

### 3. **Rebuild & Redeploy**

After setting environment variables:
```
1. Go to Deployments tab
2. Click "..." on latest deployment
3. Click "Redeploy"
OR
4. Push new commit to trigger rebuild
```

---

## 📋 Step-by-Step Fix

### Step 1: Pilih Database Provider

**Recommendation: Supabase (Gratis & Mudah)**

1. Go to https://supabase.com
2. Create free account
3. Create new project
4. Go to **Settings → Database**
5. Copy **Connection String** (Transaction Mode)
6. Important: Use **port 6543** with `?pgbouncer=true`

Format:
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Step 2: Set di Vercel

1. Open Vercel Dashboard
2. Select your project
3. **Settings → Environment Variables**
4. Add new variable:
   - **Name:** `DATABASE_URL`
   - **Value:** (paste connection string)
   - **Environments:** Check all (Production, Preview, Development)
5. Click **Save**

### Step 3: Redeploy

**Option A: Trigger via Git Push**
```bash
git commit --allow-empty -m "Trigger Vercel redeploy"
git push origin main
```

**Option B: Manual Redeploy**
1. Vercel Dashboard → **Deployments**
2. Click "..." on latest deployment
3. Click **Redeploy**

### Step 4: Verify

After deployment completes:

1. **Check Logs:**
   - Vercel Dashboard → Deployments → View Function Logs
   - Look for Prisma connection errors

2. **Test Health Endpoint:**
   ```bash
   curl https://your-app.vercel.app/api/health
   ```
   
   Expected:
   ```json
   {
     "status": "ok",
     "database": "connected",
     "timestamp": "..."
   }
   ```

3. **Test Login:**
   - Go to your deployed site
   - Try login with: admin@tapakpamungkas.com / admin123

---

## 🔍 Debugging Vercel Issues

### Check Function Logs

1. Vercel Dashboard → **Deployments**
2. Click on latest deployment
3. **Functions** tab
4. Click on any `/api/*` function
5. View **Logs** for errors

### Common Errors & Fixes

#### Error: "Can't reach database server"
**Fix:** DATABASE_URL salah atau database not accessible
- Check connection string format
- Ensure database allows connections from `0.0.0.0/0`
- Verify credentials

#### Error: "Too many connections"
**Fix:** Not using connection pooling
- Add `?pgbouncer=true` to Supabase URL
- Use Prisma Accelerate
- Use Neon (auto pooling)

#### Error: "Prisma Client not generated"
**Fix:** Build script issue
- Ensure `"postinstall": "prisma generate"` in package.json ✅ (Already added)
- Check build logs for errors

#### Error: "Module not found: @prisma/client"
**Fix:** 
```bash
# Ensure prisma is in dependencies, not devDependencies
# Already correct in your package.json ✅
```

---

## 🧪 Test After Deploy

### 1. Test API Endpoints

```bash
# Health check
curl https://your-app.vercel.app/api/health

# Products
curl https://your-app.vercel.app/api/products

# Vouchers
curl https://your-app.vercel.app/api/vouchers

# Users (might need auth)
curl https://your-app.vercel.app/api/users
```

### 2. Test in Browser

1. Open: `https://your-app.vercel.app`
2. Check browser console (F12)
3. Navigate to Vouchers page
4. Check if vouchers load
5. Try login dengan admin credentials

### 3. Verify Database Connection

```bash
# This should return database: "connected"
curl https://your-app.vercel.app/api/health
```

---

## 💾 Migrate Local Data to Production

Once Vercel is connected to database:

### Option 1: Prisma Studio (Recommended)

1. Connect to production database:
   ```bash
   # Create .env.production
   DATABASE_URL="your_production_db_url"
   ```

2. Run Prisma Studio:
   ```bash
   npx prisma studio --schema=./prisma/schema.prisma
   ```

3. Manually add:
   - Admin user
   - Products
   - Vouchers

### Option 2: Run Seed Script

Create `prisma/seed.ts`:
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create admin
  await prisma.user.upsert({
    where: { email: 'admin@tapakpamungkas.com' },
    update: {},
    create: {
      name: 'Admin Pamungkas',
      email: 'admin@tapakpamungkas.com',
      password: 'admin123',
      isAdmin: true,
    },
  });

  // Add more seed data...
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run:
```bash
DATABASE_URL="your_production_url" npx prisma db seed
```

---

## 📝 Checklist

Before deployment works:
- [ ] DATABASE_URL set in Vercel with pooling
- [ ] Using Supabase/Neon/Accelerate (not direct connection)
- [ ] Environment variables saved for all environments
- [ ] Redeployed after setting env vars
- [ ] Checked function logs for errors
- [ ] Tested /api/health endpoint
- [ ] Database has admin user
- [ ] Database has sample data (products, vouchers)
- [ ] Tested login functionality
- [ ] Vouchers loading correctly
- [ ] No 500 errors in console

---

## 🚨 Important Notes

1. **Never use direct PostgreSQL connection** for serverless
   - Serverless creates new connection per request
   - Will exhaust database connections quickly
   - Always use connection pooling

2. **After changing env vars:**
   - You MUST redeploy for changes to take effect
   - Environment changes don't apply to existing deployments

3. **Database migrations:**
   ```bash
   # Push schema to production database
   DATABASE_URL="production_url" npx prisma db push
   ```

4. **Check build logs:**
   - Vercel Dashboard → Deployments → Build Logs
   - Look for "prisma generate" success

---

## 🆘 Still Not Working?

### Get Detailed Logs

1. Add more logging to API endpoints:
```typescript
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
console.log('Attempting database connection...');
```

2. Check Vercel Function Logs after making request

3. Check if database allows external connections

4. Verify Supabase/Neon dashboard shows connection attempts

---

## 📞 Quick Support Commands

```bash
# Test local connection to production DB
DATABASE_URL="production_url" npm run server

# Generate Prisma Client
npx prisma generate

# Push schema to production
DATABASE_URL="production_url" npx prisma db push

# View production data
DATABASE_URL="production_url" npx prisma studio
```

---

**IMPORTANT:** Make sure to use **connection pooling** URL in Vercel!
This is the #1 cause of 500 errors in serverless deployments.
