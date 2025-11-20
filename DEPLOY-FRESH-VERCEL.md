# 🚀 Panduan Deploy Ulang ke Vercel - Step by Step

## 📋 BAGIAN 1: Hapus Project Lama di Vercel (Opsional)

### Cara 1: Hapus via Vercel Dashboard

1. **Buka:** https://vercel.com/dashboard
2. **Klik project** yang ingin dihapus
3. **Settings** (tab paling kanan atas)
4. Scroll ke bawah sampai bagian **"Delete Project"**
5. Klik **"Delete"**
6. Ketik nama project untuk konfirmasi
7. Klik **"Delete"**

✅ **Project terhapus!** Sekarang siap deploy fresh.

---

## 📋 BAGIAN 2: Deploy Fresh Project ke Vercel

### 🎯 Prerequisites

Pastikan sudah:
- ✅ Punya akun Vercel (https://vercel.com)
- ✅ Project sudah di-push ke GitHub
- ✅ Punya DATABASE_URL dari Prisma Accelerate

---

### 📝 Step 1: Login ke Vercel

1. Buka: https://vercel.com
2. Klik **"Login"** atau **"Sign In"**
3. Login dengan GitHub account

---

### 📝 Step 2: Import Project dari GitHub

1. Di Vercel Dashboard, klik **"Add New..."** → **"Project"**
   
   ![Add New Project](https://vercel.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fadd-new.png)

2. Akan muncul list repository GitHub kamu
   - Jika belum connect GitHub, klik **"Continue with GitHub"**
   - Authorize Vercel untuk access GitHub repositories

3. **Cari repository:** `ecomemerce` (atau nama repo kamu)

4. Klik **"Import"** di samping repository tersebut

---

### 📝 Step 3: Configure Project

Di halaman configure project:

#### **1. Configure Project Name**
```
Project Name: tapak-pamungkas
(atau nama lain yang kamu mau)
```

#### **2. Framework Preset**
```
Framework Preset: Vite
(biasanya auto-detect)
```

#### **3. Root Directory**
```
Root Directory: ./
(biarkan default, jangan diubah)
```

#### **4. Build and Output Settings**

**⚠️ PENTING - Override Settings:**

Klik **"Override"** dan isi:

```
Build Command: npm run vercel-build
(Script ini akan run: prisma generate && vite build)

Output Directory: dist

Install Command: npm install
```

Screenshot setting yang benar:
```
┌─────────────────────────────────────────┐
│ Build Command:                          │
│ npm run vercel-build                    │
├─────────────────────────────────────────┤
│ Output Directory:                       │
│ dist                                    │
├─────────────────────────────────────────┤
│ Install Command:                        │
│ npm install                             │
└─────────────────────────────────────────┘
```

**Catatan:** Database migration tidak diperlukan karena menggunakan Prisma Accelerate.

---

### 📝 Step 4: Set Environment Variables ⭐⭐⭐ PENTING!

**Jangan deploy dulu!** Set environment variables terlebih dahulu.

Di halaman yang sama, scroll ke bagian **"Environment Variables"**

#### Variable 1: DATABASE_URL

```
┌─────────────────────────────────────────────────────────┐
│ NAME (Key):                                             │
│ DATABASE_URL                                            │
├─────────────────────────────────────────────────────────┤
│ VALUE:                                                  │
│ prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19UWlBKOHhEVmRsUWMteG1hYnAyUTEiLCJhcGlfa2V5IjoiMDFLQUc5RTNZSkFRRkdWODNFU1ZZM1pEOVgiLCJ0ZW5hbnRfaWQiOiI1MzMwYzNjZWIzNTdmNTdiOTliZDZiOWRmYjVlMmEyNWU2OTQ1NzRhMjIzOGNmMGZjNzc2MjAwMDYzN2I3NjQzIiwiaW50ZXJuYWxfc2VjcmV0IjoiMmUwNWUyNjktNWY1Ny00ODIxLTlhMDgtYjQ2NzVkY2JjZmRlIn0.bgVNyGV_qxB3FDV3JC7dP88Kyhlq1LrqYD165jWsoQA
├─────────────────────────────────────────────────────────┤
│ ENVIRONMENTS:                                           │
│ ✅ Production                                           │
│ ✅ Preview                                              │
│ ✅ Development                                          │
└─────────────────────────────────────────────────────────┘
```

**Klik "Add"** setelah mengisi.

#### Variable 2: NODE_ENV

```
┌─────────────────────────────────────────────────────────┐
│ NAME (Key):                                             │
│ NODE_ENV                                                │
├─────────────────────────────────────────────────────────┤
│ VALUE:                                                  │
│ production                                              │
├─────────────────────────────────────────────────────────┤
│ ENVIRONMENTS:                                           │
│ ✅ Production                                           │
│ ⬜ Preview                                              │
│ ⬜ Development                                          │
└─────────────────────────────────────────────────────────┘
```

**Klik "Add"** setelah mengisi.

#### Variable 3: GEMINI_API_KEY (Opsional, jika ada fitur AI)

Jika kamu menggunakan Google Gemini API:

```
┌─────────────────────────────────────────────────────────┐
│ NAME (Key):                                             │
│ GEMINI_API_KEY                                          │
├─────────────────────────────────────────────────────────┤
│ VALUE:                                                  │
│ AIzaSyCizKURk6t-x0ZR_yNArre-LDgtSYrDp4E               │
├─────────────────────────────────────────────────────────┤
│ ENVIRONMENTS:                                           │
│ ✅ Production                                           │
│ ✅ Preview                                              │
│ ✅ Development                                          │
└─────────────────────────────────────────────────────────┘
```

**Klik "Add"** setelah mengisi.

---

### 📝 Step 5: Deploy!

Setelah semua environment variables ter-set:

1. **Review** semua settings sekali lagi:
   - ✅ Build Command: `npm run vercel-build`
   - ✅ Output Directory: `dist`
   - ✅ DATABASE_URL: sudah ter-set
   - ✅ NODE_ENV: sudah ter-set

2. **Klik tombol "Deploy"**

3. **Tunggu proses deployment** (biasanya 2-5 menit)
   - Vercel akan:
     - Install dependencies
     - Generate Prisma Client
     - Run migrations
     - Build frontend
     - Deploy ke edge network

4. **Monitor build logs**
   - Lihat progress real-time
   - Pastikan tidak ada error

---

### 📝 Step 6: Verify Deployment

#### 6.1 Cek Build Success

Setelah deployment selesai, akan muncul:
```
✅ Deployment ready!
🌐 Visit: https://your-project.vercel.app
```

#### 6.2 Test API Endpoint

**Buka browser, test endpoint:**
```
https://your-project.vercel.app/api/products
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "name": "Nama Product",
    "price": 100000,
    "description": "...",
    "imageUrls": [...],
    "category": "...",
    "stock": 10
  },
  ...
]
```

**Jika return error:**
- Baca error message
- Cek Function Logs di Vercel

#### 6.3 Test Website

**Buka:**
```
https://your-project.vercel.app
```

**Harus:**
- ✅ Homepage load
- ✅ Products tampil
- ✅ Bisa klik product
- ✅ Cart works
- ✅ Login/Register works

---

## 📋 BAGIAN 3: Setup Custom Domain (Opsional)

### Jika punya domain sendiri (tapakpamungkas.com):

1. Di Vercel Dashboard, masuk ke project
2. **Settings** → **Domains**
3. **Add Domain:**
   ```
   tapakpamungkas.com
   www.tapakpamungkas.com
   ```
4. Vercel akan kasih DNS records yang harus di-set
5. Buka DNS provider kamu (Cloudflare, Namecheap, dll)
6. Add DNS records sesuai instruksi Vercel:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21 (atau IP yang dikasih Vercel)
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
7. Tunggu DNS propagation (5 menit - 24 jam)
8. SSL auto-activated

---

## 🔍 TROUBLESHOOTING

### ❌ Build Failed

**Error: "Command failed: npm run vercel-build"**

**Solusi:**
1. Cek apakah `DATABASE_URL` sudah di-set
2. Lihat detail error di build logs
3. Pastikan `package.json` ada script `vercel-build`

---

### ❌ Environment Variable Not Found

**Error: "Environment variable not found: DATABASE_URL"**

**Solusi:**
1. Settings → Environment Variables
2. Pastikan `DATABASE_URL` ada
3. Pastikan checkbox Production ✅
4. Redeploy: Deployments → ⋯ → Redeploy

---

### ❌ API Returns Error 500

**Error di `/api/products`: 500 Internal Server Error**

**Solusi:**
1. Deployments → Functions → `/api/products`
2. Lihat error logs
3. Common issues:
   - Invalid DATABASE_URL format
   - Prisma Accelerate API key expired
   - Database source offline

---

### ❌ Products Tidak Muncul (Empty Array)

**API works tapi return `[]`**

**Solusi:**
- Database kosong
- Perlu seed data
- Dari local:
  ```powershell
  $env:DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_KEY"
  npx prisma db seed
  ```

---

### ❌ CORS Error di Browser Console

**Error: "Access to fetch blocked by CORS policy"**

**Solusi:**
- Seharusnya tidak terjadi karena API dan frontend sama domain
- Jika pakai custom domain, update `server/index.ts`:
  ```typescript
  const allowedOrigins = [
    'https://tapakpamungkas.com',
    'https://www.tapakpamungkas.com'
  ];
  ```

---

## ✅ CHECKLIST FINAL

Sebelum deploy, pastikan:

- [ ] Repository sudah di-push ke GitHub
- [ ] Build Command: `npm run vercel-build`
- [ ] Output Directory: `dist`
- [ ] Environment Variable: `DATABASE_URL` (with Prisma Accelerate URL)
- [ ] Environment Variable: `NODE_ENV=production`
- [ ] (Opsional) `GEMINI_API_KEY` jika pakai AI features

Setelah deploy:

- [ ] Build success (no errors)
- [ ] `/api/products` return data
- [ ] Homepage load
- [ ] Products tampil
- [ ] Cart funktioniert
- [ ] Login works
- [ ] Admin panel accessible (admin@tapakpamungkas.com)

---

## 🎯 QUICK REFERENCE

### Environment Variables untuk Copy-Paste:

```bash
# Variable 1
NAME: DATABASE_URL
VALUE: prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19UWlBKOHhEVmRsUWMteG1hYnAyUTEiLCJhcGlfa2V5IjoiMDFLQUc5RTNZSkFRRkdWODNFU1ZZM1pEOVgiLCJ0ZW5hbnRfaWQiOiI1MzMwYzNjZWIzNTdmNTdiOTliZDZiOWRmYjVlMmEyNWU2OTQ1NzRhMjIzOGNmMGZjNzc2MjAwMDYzN2I3NjQzIiwiaW50ZXJuYWxfc2VjcmV0IjoiMmUwNWUyNjktNWY1Ny00ODIxLTlhMDgtYjQ2NzVkY2JjZmRlIn0.bgVNyGV_qxB3FDV3JC7dP88Kyhlq1LrqYD165jWsoQA
ENVIRONMENTS: Production, Preview, Development

# Variable 2
NAME: NODE_ENV
VALUE: production
ENVIRONMENTS: Production only

# Variable 3 (Opsional)
NAME: GEMINI_API_KEY
VALUE: AIzaSyCizKURk6t-x0ZR_yNArre-LDgtSYrDp4E
ENVIRONMENTS: Production, Preview, Development
```

### Build Settings:

```
Build Command: npm run vercel-build
Output Directory: dist
Install Command: npm install
```

---

## 📞 Butuh Bantuan?

**Jika ada error:**
1. Screenshot error message
2. Check build logs di Vercel
3. Check function logs di Vercel
4. Baca error message dengan teliti

**Common Solutions:**
- Redeploy setelah set env vars
- Clear browser cache
- Wait beberapa menit untuk DNS propagation
- Check Prisma Accelerate dashboard untuk API key status

---

## 🎉 Selamat!

Jika semua langkah sudah diikuti, website kamu seharusnya sudah live di:
```
https://your-project.vercel.app
```

Dan akan auto-deploy setiap kali kamu push ke GitHub! 🚀

**Enjoy your deployment!** ✨
