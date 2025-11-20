# ⚡ Quick Deploy Checklist - Vercel

## 🎯 LANGKAH SINGKAT

### 1️⃣ Delete Project Lama (Opsional)
- Vercel Dashboard → Project → Settings → Delete Project

---

### 2️⃣ Import Project ke Vercel
1. Vercel Dashboard → **Add New** → **Project**
2. Import dari GitHub: **ecomemerce**
3. Klik **Import**

---

### 3️⃣ Configure Settings

**Framework:** Vite (auto-detect)

**Build Settings:** (Override!)
```
Build Command: npm run vercel-build
Output Directory: dist
Install Command: npm install
```

---

### 4️⃣ Environment Variables ⭐ PENTING!

Copy-paste exact seperti ini:

#### Variable 1:
```
NAME: DATABASE_URL
VALUE: prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19UWlBKOHhEVmRsUWMteG1hYnAyUTEiLCJhcGlfa2V5IjoiMDFLQUc5RTNZSkFRRkdWODNFU1ZZM1pEOVgiLCJ0ZW5hbnRfaWQiOiI1MzMwYzNjZWIzNTdmNTdiOTliZDZiOWRmYjVlMmEyNWU2OTQ1NzRhMjIzOGNmMGZjNzc2MjAwMDYzN2I3NjQzIiwiaW50ZXJuYWxfc2VjcmV0IjoiMmUwNWUyNjktNWY1Ny00ODIxLTlhMDgtYjQ2NzVkY2JjZmRlIn0.bgVNyGV_qxB3FDV3JC7dP88Kyhlq1LrqYD165jWsoQA
Environments: ✅ Production ✅ Preview ✅ Development
```

#### Variable 2:
```
NAME: NODE_ENV
VALUE: production
Environments: ✅ Production
```

#### Variable 3 (Opsional):
```
NAME: GEMINI_API_KEY
VALUE: AIzaSyCizKURk6t-x0ZR_yNArre-LDgtSYrDp4E
Environments: ✅ Production ✅ Preview ✅ Development
```

---

### 5️⃣ Deploy
- Klik **Deploy**
- Tunggu 2-5 menit

---

### 6️⃣ Test
- Buka: `https://your-project.vercel.app/api/products`
- Harus return JSON array products
- Test homepage: `https://your-project.vercel.app`

---

## ✅ DONE!

Jika ada masalah, baca: `DEPLOY-FRESH-VERCEL.md` untuk panduan lengkap.
