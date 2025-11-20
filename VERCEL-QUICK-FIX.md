# ⚡ QUICK FIX - Vercel 500 Error

## 🚨 Problem
- Login not working (500 error)
- Vouchers not loading (500 error)
- Database connection failed

## ✅ Solution (5 Minutes)

### Step 1: Setup Database with Pooling

**USE SUPABASE (FREE & EASY):**

1. Go to **https://supabase.com** → Sign up
2. Create new project (wait 2 min for setup)
3. Go to **Settings → Database → Connection String**
4. Copy **Transaction** mode connection string
5. **IMPORTANT:** Use port **6543** and add `?pgbouncer=true`

Example:
```
postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Step 2: Set in Vercel

1. Open **Vercel Dashboard** → Your Project
2. **Settings → Environment Variables**
3. Add:
   - Name: `DATABASE_URL`
   - Value: (paste Supabase connection string from Step 1)
   - Environment: **CHECK ALL** (Production, Preview, Development)
4. Click **Save**

### Step 3: Push Schema to Database

```powershell
# Set your Supabase connection string
$env:DATABASE_URL="your_supabase_connection_string_here"

# Push schema
npx prisma db push

# Seed data (admin, products, vouchers)
npm run seed-production
```

### Step 4: Redeploy Vercel

**Option A: Auto (Recommended)**
```powershell
.\deploy-to-vercel.ps1
```

**Option B: Manual**
```bash
git add -A
git commit -m "Fix database connection"
git push origin main
```

### Step 5: Verify

1. Wait for Vercel deployment (2-3 min)
2. Test: `https://your-app.vercel.app/api/health`
3. Should see: `"database": "connected"`
4. Try login with: `admin@tapakpamungkas.com` / `admin123`

---

## 🎯 That's It!

**If still not working:**
1. Check Vercel function logs
2. Verify DATABASE_URL format (must have `?pgbouncer=true`)
3. Read **VERCEL-FIX-GUIDE.md** for detailed troubleshooting

---

## 📝 Quick Commands

```bash
# Test db connection locally
npm run server

# Seed production database
DATABASE_URL="supabase_url" npm run seed-production

# Deploy to Vercel
.\deploy-to-vercel.ps1
```

---

## ⚠️ Common Mistakes

❌ Using direct PostgreSQL connection (no pooling)
✅ Use Supabase with port 6543 + `?pgbouncer=true`

❌ Forgetting to redeploy after setting env vars
✅ Always redeploy after changing environment variables

❌ Wrong DATABASE_URL format
✅ Check VERCEL-FIX-GUIDE.md for correct formats

---

**Need more help? Check VERCEL-FIX-GUIDE.md**
