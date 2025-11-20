# 📸 Visual Guide - Deploy ke Vercel

## Screenshot Reference untuk Environment Variables

### 🎯 Tampilan Environment Variables di Vercel

Ketika kamu ada di halaman "Configure Project" atau di Settings → Environment Variables, tampilannya seperti ini:

```
┌──────────────────────────────────────────────────────────────────┐
│  Environment Variables                                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Key (NAME)                                                 │ │
│  │ ┌────────────────────────────────────────────────────────┐ │ │
│  │ │ DATABASE_URL                                           │ │ │
│  │ └────────────────────────────────────────────────────────┘ │ │
│  │                                                            │ │
│  │ Value                                                      │ │
│  │ ┌────────────────────────────────────────────────────────┐ │ │
│  │ │ prisma+postgres://accelerate.prisma-data.net/?api_... │ │ │
│  │ └────────────────────────────────────────────────────────┘ │ │
│  │                                                            │ │
│  │ Select Environments:                                       │ │
│  │ ☑ Production   ☑ Preview   ☑ Development                 │ │
│  │                                                            │ │
│  │                                     [Add]                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📝 Exact Values untuk Copy-Paste

### DATABASE_URL (Variable 1)

**Copy ini untuk KEY:**
```
DATABASE_URL
```

**Copy ini untuk VALUE:**
```
prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19UWlBKOHhEVmRsUWMteG1hYnAyUTEiLCJhcGlfa2V5IjoiMDFLQUc5RTNZSkFRRkdWODNFU1ZZM1pEOVgiLCJ0ZW5hbnRfaWQiOiI1MzMwYzNjZWIzNTdmNTdiOTliZDZiOWRmYjVlMmEyNWU2OTQ1NzRhMjIzOGNmMGZjNzc2MjAwMDYzN2I3NjQzIiwiaW50ZXJuYWxfc2VjcmV0IjoiMmUwNWUyNjktNWY1Ny00ODIxLTlhMDgtYjQ2NzVkY2JjZmRlIn0.bgVNyGV_qxB3FDV3JC7dP88Kyhlq1LrqYD165jWsoQA
```

**Environments:** Check semua (Production, Preview, Development)

---

### NODE_ENV (Variable 2)

**Copy ini untuk KEY:**
```
NODE_ENV
```

**Copy ini untuk VALUE:**
```
production
```

**Environments:** Check Production saja

---

### GEMINI_API_KEY (Variable 3 - Opsional)

**Copy ini untuk KEY:**
```
GEMINI_API_KEY
```

**Copy ini untuk VALUE:**
```
AIzaSyCizKURk6t-x0ZR_yNArre-LDgtSYrDp4E
```

**Environments:** Check semua (Production, Preview, Development)

---

## 🎯 Build Settings

```
┌──────────────────────────────────────────────────────────────────┐
│  Build and Output Settings                                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Build Command                                    [Override ☑]  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ npm run vercel-build                                       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Output Directory                                 [Override ☑]  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ dist                                                       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Install Command                                  [Override ☑]  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ npm install                                                │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## ⚠️ PERHATIAN!

### ✅ Yang BENAR:

```
DATABASE_URL dimulai dengan: prisma+postgres://
```

### ❌ Yang SALAH:

```
❌ postgres:// (tanpa prisma+)
❌ postgresql:// (tanpa prisma+)
❌ http://
❌ https://
```

---

## 🔍 Cara Verify Environment Variables Sudah Benar

Setelah deploy, cek di:

1. **Project Settings → Environment Variables**
2. Harus muncul:
   ```
   DATABASE_URL    ••••••••••    Production, Preview, Development
   NODE_ENV        ••••••••••    Production
   GEMINI_API_KEY  ••••••••••    Production, Preview, Development (opsional)
   ```

3. Klik "Show" untuk verify value-nya benar

---

## 🎯 Final Check

Setelah deployment success:

### Test 1: API Endpoint
```
URL: https://your-project.vercel.app/api/products
Expected: JSON array dengan products
```

### Test 2: Health Check
```
URL: https://your-project.vercel.app/health
Expected: {"status":"ok","timestamp":"..."}
```

### Test 3: Homepage
```
URL: https://your-project.vercel.app
Expected: Homepage load dengan products
```

---

## 📞 Troubleshooting Quick Reference

| Masalah | Solusi |
|---------|--------|
| Build failed | Cek DATABASE_URL sudah di-set |
| 500 Error | Cek Function Logs untuk detail |
| Empty products | Database kosong, perlu seed |
| CORS error | Seharusnya tidak terjadi (same origin) |
| Env var not found | Redeploy setelah set env vars |

---

## ✅ Success Indicators

Kamu tahu deployment berhasil jika:

- ✅ Build logs menunjukkan "Deployment Ready"
- ✅ `/api/products` return data
- ✅ Website bisa diakses
- ✅ Products tampil di homepage
- ✅ Cart berfungsi
- ✅ Login/Register berfungsi

---

**Good luck with your deployment!** 🚀
