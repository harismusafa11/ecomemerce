# 🚀 Quick Fix: Vercel Database Connection

## Langkah-Langkah Perbaikan (5 Menit)

### 1️⃣ Cek Environment Variables di Vercel

1. Buka: https://vercel.com/dashboard
2. Pilih project kamu
3. Settings → Environment Variables
4. **WAJIB ada 2 variables ini:**

   ```
   DATABASE_URL = postgresql://user:pass@host:port/dbname
   NODE_ENV = production
   ```

5. Jika belum ada, tambahkan sekarang!

### 2️⃣ Pastikan Format DATABASE_URL Benar

**Contoh yang BENAR:**
```
postgresql://username:password@ep-cool-disk-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**Cek:**
- ✅ Dimulai dengan `postgresql://` (bukan `postgres://`)
- ✅ Ada username dan password
- ✅ Ada host yang benar
- ✅ Ada nama database di akhir

### 3️⃣ Migrate Database (Jalankan dari Local)

```powershell
# Set DATABASE_URL production
$env:DATABASE_URL="postgresql://your-production-database-url"

# Migrate database
npx prisma migrate deploy

# Seed data (opsional, kalau database kosong)
npx prisma db seed
```

### 4️⃣ Redeploy Vercel

**Cara 1: Auto deploy** (sudah push ke GitHub tadi)
- Tunggu beberapa menit, Vercel akan auto deploy

**Cara 2: Manual redeploy**
1. Vercel Dashboard → Deployments
2. Klik titik tiga (⋯) di deployment terakhir
3. Klik "Redeploy"

### 5️⃣ Verify/Test

1. Tunggu deployment selesai (1-2 menit)
2. Buka: `https://your-app.vercel.app/api/products`
3. Harus muncul data products (array JSON)

---

## ❌ Masih Error?

### Cek Build Logs:
1. Vercel → Deployments → Klik deployment terakhir
2. Lihat tab "Building"
3. Cari error terkait `prisma` atau `DATABASE_URL`

### Cek Runtime Logs:
1. Deployment → Functions
2. Klik `/api/products`
3. Lihat error message

### Error yang Umum:

#### "Environment variable not found: DATABASE_URL"
➡️ Set `DATABASE_URL` di Vercel Environment Variables

#### "Can't reach database server"
➡️ Cek:
- DATABASE_URL format benar?
- Database online?
- Firewall database allow all IPs?

#### "Invalid prisma.product.findMany() invocation"
➡️ Database belum di-migrate
- Run: `npx prisma migrate deploy`

---

## 🎯 Ringkasan Perubahan

Saya sudah memperbaiki:
1. ✅ **Prisma schema** - Hapus `directUrl` yang tidak perlu
2. ✅ **Database connection** - Optimasi untuk Vercel serverless
3. ✅ **Build script** - Tambah `vercel-build` yang auto-migrate
4. ✅ **Dokumentasi** - Panduan troubleshooting lengkap

**File yang diubah:**
- `prisma/schema.prisma` - Simplifikasi konfigurasi
- `server/db.ts` - Better connection pooling
- `package.json` - Tambah vercel-build script
- `DEPLOYMENT.md` - Update instruksi
- `VERCEL-TROUBLESHOOTING.md` - Panduan lengkap (BARU)

---

## 📞 Next Steps

1. **Pastikan DATABASE_URL sudah di-set di Vercel**
2. **Migrate database dari local** (step 3 di atas)
3. **Tunggu auto-deploy Vercel selesai** (dari git push tadi)
4. **Test** `https://your-app.vercel.app/api/products`

Jika masih bermasalah, cek `VERCEL-TROUBLESHOOTING.md` untuk panduan detail! 🚀
