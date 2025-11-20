# ✨ Serverless API - Setup Complete!

## 📦 Yang Telah Dibuat

### 1. **Serverless Functions** (folder `api/`)

| File | Endpoint | Deskripsi |
|------|----------|-----------|
| `index.ts` | `/api/*` | Main handler - Export semua Express endpoints |
| `products.ts` | `/api/products` | Dedicated endpoint untuk products |
| `users.ts` | `/api/users` | Dedicated endpoint untuk users |
| `orders.ts` | `/api/orders` | Dedicated endpoint untuk orders |
| `health.ts` | `/api/health` | Health check & database status |

### 2. **Dokumentasi**

| File | Isi |
|------|-----|
| `api/README.md` | Dokumentasi lengkap struktur API |
| `api/API-TESTING.md` | Testing guide dengan curl commands |
| `SERVERLESS-DEPLOYMENT.md` | Step-by-step deployment guide |

### 3. **Dependencies**

✅ `@vercel/node` - TypeScript types untuk Vercel  
✅ `@prisma/client` - Database ORM  
✅ `express` - Web framework  
✅ `cors` - CORS handling  

## 🎯 Cara Menggunakan

### Opsi 1: Gunakan Main Handler (Recommended)

File `api/index.ts` sudah mengexport **semua endpoint** dari `server/index.ts`, jadi saat deploy ke Vercel, semua endpoint ini otomatis tersedia:

```
✅ /api/products
✅ /api/products/:id
✅ /api/users
✅ /api/login
✅ /api/register
✅ /api/orders
✅ /api/orders/user/:userId
✅ /api/cart/:userId
✅ /api/wishlist/:userId
✅ /api/vouchers
... dan semua endpoint lainnya
```

**Tidak perlu konfigurasi tambahan!** Vercel akan otomatis detect dan deploy.

### Opsi 2: Gunakan Dedicated Endpoints (Opsional)

Jika ingin performa lebih optimal, gunakan dedicated endpoints:
- `/api/products` → menggunakan `api/products.ts`
- `/api/users` → menggunakan `api/users.ts`
- `/api/orders` → menggunakan `api/orders.ts`

Untuk ini, perlu update `vercel.json` routing.

## 🚀 Deploy ke Vercel

### Step 1: Push ke GitHub
```bash
git add .
git commit -m "Add serverless API functions"
git push origin main
```

### Step 2: Import di Vercel
1. Buka https://vercel.com
2. Klik "Add New Project"
3. Import repository
4. Vercel otomatis detect konfigurasi

### Step 3: Set Environment Variables
Di Vercel Dashboard → Settings → Environment Variables:

```env
DATABASE_URL=postgresql://user:password@host:5432/database
NODE_ENV=production
```

**PENTING:** Untuk production, gunakan connection pooling:
- Supabase: Automatic pooling ✅
- Neon: Built-in pooling ✅
- Railway: Add `?pgbouncer=true` ✅

### Step 4: Deploy!
Klik "Deploy" dan tunggu beberapa menit.

## ✅ Testing

### Test Health Check
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

### Test Products
```bash
curl https://your-app.vercel.app/api/products
```

### Test di Browser
Buka:
```
https://your-app.vercel.app/api/health
https://your-app.vercel.app/api/products
```

## 🔧 Struktur Project

```
ecommerce/
├── api/                      # 🆕 Serverless Functions
│   ├── index.ts             # Main handler
│   ├── products.ts          # Products endpoint
│   ├── users.ts             # Users endpoint
│   ├── orders.ts            # Orders endpoint
│   ├── health.ts            # Health check
│   ├── README.md            # Dokumentasi
│   └── API-TESTING.md       # Testing guide
├── server/                   # Express backend (untuk local dev)
│   ├── index.ts             # Express app
│   └── db.ts                # Prisma client
├── prisma/                   # Database schema
│   └── schema.prisma
├── vercel.json              # ✅ Vercel config (sudah benar)
├── package.json             # ✅ Dependencies updated
└── SERVERLESS-DEPLOYMENT.md # 🆕 Deployment guide
```

## 🎨 Fitur Utama

### ✅ CORS Support
Semua endpoints sudah include CORS headers:
```typescript
res.setHeader('Access-Control-Allow-Origin', '*');
```

### ✅ Error Handling
Semua endpoints dengan try-catch dan proper error response:
```typescript
try {
  // Logic here
} catch (error) {
  res.status(500).json({ error: 'Message', details: error.message });
}
```

### ✅ Database Connection
Auto disconnect setelah request:
```typescript
finally {
  await prisma.$disconnect();
}
```

### ✅ TypeScript Support
Full type safety dengan `@vercel/node`:
```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
```

## 📊 Monitoring

### Vercel Dashboard
- **Function Logs**: Real-time logs
- **Analytics**: Response times, error rates
- **Deployment**: Deployment history

### Custom Monitoring
Setup monitoring dengan health endpoint:
```bash
# Cron job setiap 5 menit
*/5 * * * * curl https://your-app.vercel.app/api/health
```

## 🔐 Security Best Practices

1. ✅ **Environment Variables**: Sensitive data di `.env`
2. ✅ **Password Handling**: Never return password in response
3. ✅ **CORS**: Configured properly
4. ✅ **Rate Limiting**: Implemented in main handler
5. ✅ **Input Validation**: Basic validation in place

## 🆘 Troubleshooting

### Database Connection Error
```
Error: Can't reach database server
```
**Fix:**
- Pastikan `DATABASE_URL` benar di Vercel
- Gunakan connection pooling (Supabase/Neon recommended)
- Check database firewall settings

### Module Not Found
```
Error: Cannot find module '@prisma/client'
```
**Fix:**
```bash
npm install
npm run vercel-build
```

### CORS Error
```
Access to fetch has been blocked by CORS policy
```
**Fix:** Sudah di-handle, tapi jika masih error, check:
```typescript
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
```

## 📚 Documentation Files

1. **README Ini**: Overview dan quick start
2. **`api/README.md`**: Detail struktur API
3. **`api/API-TESTING.md`**: Testing dengan curl
4. **`SERVERLESS-DEPLOYMENT.md`**: Step-by-step deployment

## 🎯 Next Steps

1. ✅ **Deploy to Vercel** - Follow SERVERLESS-DEPLOYMENT.md
2. 🔒 **Add JWT Auth** - Implement token-based auth
3. 📈 **Monitor** - Setup monitoring alerts
4. 🚀 **Optimize** - Add caching, optimize queries
5. 🔐 **Secure** - Add more security layers

## 💡 Tips

- **Auto Deploy**: Setiap push ke main branch → auto deploy
- **Preview Deployments**: PR otomatis dapat preview URL
- **Rollback**: Easy rollback di Vercel dashboard
- **Environment**: Different env vars untuk production/preview

---

## 🎉 Ready to Deploy!

Semua sudah siap! Tinggal:
1. Push ke GitHub
2. Import ke Vercel
3. Set environment variables
4. Deploy!

**Good luck! 🚀**
