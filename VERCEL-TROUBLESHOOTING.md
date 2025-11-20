# 🔧 Vercel Deployment Troubleshooting Guide

## ❌ Problem: Products Not Loading (Database Connection Failed)

### Kemungkinan Penyebab:

#### 1. **Environment Variables Tidak Terset**
**Solusi:**
1. Buka Vercel Dashboard → Project Settings → Environment Variables
2. Pastikan ada variable berikut:
   ```
   DATABASE_URL = postgresql://USER:PASSWORD@HOST:PORT/DATABASE
   NODE_ENV = production
   ```
3. Setelah menambah/mengubah environment variables, **WAJIB redeploy**:
   - Deployments → ⋯ (menu) → Redeploy

#### 2. **DATABASE_URL Format Salah**
**Cek format URL:**
- ✅ BENAR: `postgresql://user:pass@host.neon.tech/dbname?sslmode=require`
- ❌ SALAH: `postgres://` (harus `postgresql://`)
- ❌ SALAH: Missing password atau host

**Untuk Neon.tech:**
```
postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
```

**Untuk Supabase:**
```
postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:5432/postgres
```

**Untuk Railway:**
```
postgresql://postgres:password@containers-us-west-xxx.railway.app:7533/railway
```

#### 3. **Database Belum Di-Migrate**
**Solusi dari local machine:**
```bash
# Set DATABASE_URL ke production database
$env:DATABASE_URL="postgresql://your-production-url"

# Run migration
npx prisma migrate deploy

# Seed data (jika perlu)
npx prisma db seed
```

**Atau jalankan di Vercel:**
- Build Command akan otomatis run `vercel-build` script yang sudah include `prisma migrate deploy`

#### 4. **Prisma Client Tidak Ter-generate**
**Solusi:**
- Pastikan `package.json` sudah ada `postinstall` script:
  ```json
  "postinstall": "prisma generate"
  ```
- Redeploy project di Vercel
- Cek build logs untuk memastikan `prisma generate` berjalan

#### 5. **Firewall Database Memblokir Vercel**
**Solusi:**
- Neon.tech: Biasanya tidak ada masalah (allow all by default)
- Supabase: Pastikan "Allow all IP addresses" di settings
- Railway: Allow 0.0.0.0/0 di Network settings
- Others: Whitelist Vercel IPs atau allow all (0.0.0.0/0)

---

## 🔍 Cara Debugging di Vercel

### 1. Cek Build Logs
1. Vercel Dashboard → Deployments
2. Klik deployment terakhir
3. Lihat "Building" tab
4. Cari error message, khususnya terkait:
   - `prisma`
   - `DATABASE_URL`
   - `Cannot find module`

### 2. Cek Runtime Logs
1. Deployment → Functions tab
2. Klik `/api/products` atau endpoint lain
3. Lihat logs real-time
4. Cari error:
   ```
   PrismaClientInitializationError
   Can't reach database server
   Invalid connection string
   ```

### 3. Test Direct API Call
Buka browser atau Postman:
```
https://your-app.vercel.app/api/products
```

Jika error, lihat response detail:
```json
{
  "error": "Failed to fetch products",
  "details": "message detail nya"
}
```

---

## ✅ Checklist Vercel Deployment

- [ ] Database sudah dibuat (Neon, Supabase, Railway, dll)
- [ ] `DATABASE_URL` sudah di-set di Vercel Environment Variables
- [ ] `NODE_ENV=production` sudah di-set di Vercel
- [ ] Database sudah di-migrate (`npx prisma migrate deploy`)
- [ ] Database sudah ada data (seed jika perlu)
- [ ] Firewall database allow Vercel IPs
- [ ] Sudah redeploy setelah set environment variables
- [ ] Build logs tidak ada error
- [ ] API endpoint `/api/products` bisa diakses

---

## 📝 Step-by-Step Fix untuk Database Issue

### Step 1: Pastikan Database Online
```bash
# Test koneksi ke database
npx prisma db pull
```
Jika error, database tidak bisa diakses.

### Step 2: Set Environment Variables di Vercel
1. Vercel Dashboard → Project
2. Settings → Environment Variables
3. Add:
   - Key: `DATABASE_URL`
   - Value: `postgresql://...` (copy dari database provider)
   - Environment: Production, Preview, Development (select all)
4. Save

### Step 3: Migrate Database
```bash
# Di local, set DATABASE_URL production
$env:DATABASE_URL="your-production-url"

# Migrate
npx prisma migrate deploy

# Generate client
npx prisma generate

# Test query
npx prisma studio
```

### Step 4: Redeploy Vercel
1. Vercel Dashboard → Deployments
2. Klik ⋯ pada deployment terakhir
3. Klik "Redeploy"
4. Tunggu build selesai

### Step 5: Verify
Buka: `https://your-app.vercel.app/api/products`
Harus return array products, bukan error.

---

## 🚨 Common Errors & Solutions

### Error: "Environment variable not found: DATABASE_URL"
**Solusi:**
- Set `DATABASE_URL` di Vercel Environment Variables
- Redeploy

### Error: "Can't reach database server"
**Solusi:**
- Cek DATABASE_URL format benar
- Cek database online
- Cek firewall/whitelist IP

### Error: "PrismaClient is unable to run in this browser environment"
**Solusi:**
- Jangan import Prisma di frontend code
- Prisma hanya boleh di server-side (folder `server/` dan `api/`)

### Error: "Invalid `prisma.product.findMany()` invocation"
**Solusi:**
- Database belum di-migrate
- Run `npx prisma migrate deploy`
- Atau schema tidak match dengan database

### Error: "No Prisma Client found"
**Solusi:**
- Run `npm install`
- Run `npx prisma generate`
- Redeploy

---

## 💡 Best Practices

1. **Gunakan Database dengan Connection Pooling**
   - Neon.tech (recommended) - built-in pooling
   - Supabase - gunakan pooler URL
   - PlanetScale - built-in

2. **Set Connection Limit**
   - Tambahkan `?connection_limit=1` di DATABASE_URL
   - Untuk serverless, 1 connection per function instance cukup

3. **Monitor Database**
   - Cek database dashboard untuk usage
   - Set alerts untuk connection limits
   - Monitor slow queries

4. **Backup Database**
   - Enable automatic backups
   - Export data berkala
   - Test restore procedure

---

## 📞 Masih Bermasalah?

Jika masih error setelah mengikuti semua langkah:

1. **Copy paste error message lengkap** dari:
   - Vercel build logs
   - Vercel function logs
   - Browser console

2. **Share informasi:**
   - Database provider (Neon, Supabase, dll)
   - Vercel project URL
   - Last deployment time

3. **Cek dokumentasi:**
   - [Vercel Docs](https://vercel.com/docs)
   - [Prisma Docs](https://www.prisma.io/docs/)
   - Database provider docs
