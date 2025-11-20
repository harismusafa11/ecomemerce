# 🎯 Quick Start - Serverless API Deployment

## ✅ Yang Sudah Dikonfigurasi

### 1. **Folder `api/`** ✅
```
api/
├── index.ts         ✅ Main handler (semua endpoints)
├── products.ts      ✅ Products endpoint
├── users.ts         ✅ Users endpoint  
├── orders.ts        ✅ Orders endpoint
├── health.ts        ✅ Health check
├── README.md        ✅ Dokumentasi lengkap
└── API-TESTING.md   ✅ Testing guide
```

### 2. **Dependencies Installed** ✅
- `@vercel/node` untuk TypeScript types
- `@prisma/client` untuk database
- Semua dependencies sudah terinstall

### 3. **Vercel Configuration** ✅
File `vercel.json` sudah dikonfigurasi dengan routing:
- `/api/*` → Serverless functions
- Semua routes lainnya → React app

## 🚀 Deploying to Vercel

### Via Vercel Dashboard (Recommended)

1. **Push ke GitHub**
   ```bash
   git add .
   git commit -m "Add serverless API functions"
   git push origin main
   ```

2. **Import di Vercel**
   - Buka https://vercel.com
   - Klik "Add New Project"
   - Import repository GitHub Anda
   - Vercel otomatis detect konfigurasi

3. **Set Environment Variables**
   Di Vercel Dashboard → Settings → Environment Variables:
   ```
   DATABASE_URL = your_postgres_connection_string
   NODE_ENV = production
   ```

4. **Deploy!**
   - Klik "Deploy"
   - Tunggu beberapa menit
   - Aplikasi live! 🎉

### Via Vercel CLI (Alternative)

```bash
# Install Vercel CLI (jika belum)
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

## 🔍 Testing After Deploy

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

### 2. Test Products Endpoint
```bash
curl https://your-app.vercel.app/api/products
```

### 3. Test in Browser
Buka browser:
```
https://your-app.vercel.app/api/health
https://your-app.vercel.app/api/products
```

## 📊 Monitoring

### Vercel Dashboard
- **Function Logs**: Lihat error dan logs real-time
- **Analytics**: Monitor response times
- **Deployment**: History semua deployment

### Health Endpoint
Gunakan untuk monitoring uptime:
```bash
# Setup cron job atau monitoring service
*/5 * * * * curl https://your-app.vercel.app/api/health
```

## 🔧 Troubleshooting

### ❌ Error: "Cannot find module @prisma/client"
**Fix:**
```bash
npm install
npm run vercel-build
```
Pastikan di `package.json` ada:
```json
"scripts": {
  "vercel-build": "prisma generate && vite build"
}
```

### ❌ Error: Database connection failed
**Fix:**
1. Cek `DATABASE_URL` di Vercel Environment Variables
2. Pastikan database accessible dari internet
3. Test connection string locally

### ❌ Error: CORS issues
**Fix:**
Sudah di-handle di setiap endpoint dengan:
```typescript
res.setHeader('Access-Control-Allow-Origin', '*');
```

### ❌ Error: 404 on /api endpoints
**Fix:**
Check `vercel.json` - harus ada:
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

## 📝 Development vs Production

### Local Development
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
npm run server
```

### Production (Vercel)
- Frontend: Static files served by Vercel CDN
- Backend: Serverless functions auto-scale
- Database: PostgreSQL (recommend: Supabase, Neon, etc.)

## 🎯 Next Steps

1. ✅ **Deploy to Vercel** - Follow steps above
2. 🔒 **Add Authentication** - Consider JWT tokens
3. 📈 **Monitor Performance** - Use Vercel Analytics
4. 🚀 **Scale Up** - Add caching, optimize queries
5. 🔐 **Security** - Add rate limiting, input validation

## 📚 Resources

- [Vercel Docs](https://vercel.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Serverless Functions](https://vercel.com/docs/functions/serverless-functions)

---

**💡 Tip**: Setiap push ke GitHub akan otomatis trigger deployment di Vercel!
