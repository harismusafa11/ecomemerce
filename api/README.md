# 🚀 API Serverless Functions - Vercel Deployment

Folder `api/` berisi serverless functions yang akan otomatis di-deploy oleh Vercel.

## 📁 Struktur File

```
api/
├── index.ts         # Main API handler (semua endpoints Express)
├── products.ts      # Dedicated endpoint untuk products
├── users.ts         # Dedicated endpoint untuk users
├── orders.ts        # Dedicated endpoint untuk orders
└── health.ts        # Health check endpoint
```

## 🔧 Cara Kerja

### 1. **Main API Handler** (`api/index.ts`)
File ini mengexport seluruh Express app, sehingga semua endpoint di `server/index.ts` tersedia sebagai serverless function.

**Endpoint yang tersedia:**
```
GET  /api/products
POST /api/products
PUT  /api/products/:id
DELETE /api/products/:id

POST /api/login
POST /api/register
GET  /api/users
PUT  /api/users/:id
DELETE /api/users/:id

GET  /api/orders
POST /api/orders
GET  /api/orders/user/:userId
PUT  /api/orders/:id/status

GET  /api/cart/:userId
POST /api/cart
DELETE /api/cart/:userId/item/:productId
DELETE /api/cart/:userId

GET  /api/wishlist/:userId
POST /api/wishlist
DELETE /api/wishlist/:userId/item/:productId

GET  /api/vouchers
POST /api/vouchers
POST /api/vouchers/claim
GET  /api/vouchers/user/:userId
POST /api/vouchers/validate
PUT  /api/vouchers/:id
DELETE /api/vouchers/:id
```

### 2. **Dedicated Endpoints** (Opsional)
File-file tambahan seperti `products.ts`, `users.ts`, `orders.ts` adalah **alternative endpoints** yang bisa digunakan jika Anda ingin:
- Lebih optimal (hanya load code yang diperlukan)
- Custom logic berbeda dari main API
- Isolasi error per endpoint

**Contoh penggunaan:**
- `/api/products` → menggunakan `api/products.ts`
- `/api/users` → menggunakan `api/users.ts`
- `/api/orders` → menggunakan `api/orders.ts`

### 3. **Health Check** (`api/health.ts`)
Endpoint untuk monitoring kesehatan aplikasi dan koneksi database.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-20T11:16:03.000Z",
  "database": "connected",
  "environment": "production"
}
```

## 🌐 URL Endpoints di Vercel

Setelah deploy, endpoints akan tersedia di:

```
https://your-app.vercel.app/api/products
https://your-app.vercel.app/api/users
https://your-app.vercel.app/api/orders
https://your-app.vercel.app/api/health
```

## ⚙️ Environment Variables

Pastikan menambahkan di Vercel Dashboard:

```bash
DATABASE_URL=your_postgres_connection_string
NODE_ENV=production
```

## 🔒 Keamanan

Semua endpoints sudah include:
- ✅ CORS configuration
- ✅ Error handling
- ✅ Input validation
- ✅ Database connection pooling
- ✅ Prisma Client disconnect setelah request

## 📝 Custom Endpoint

Untuk membuat endpoint baru:

1. Buat file baru di folder `api/`, contoh: `api/newsletter.ts`

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Your logic here
    return res.status(200).json({ message: 'Success' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed' });
  } finally {
    await prisma.$disconnect();
  }
}
```

2. File akan otomatis menjadi endpoint: `/api/newsletter`

## 🚨 Troubleshooting

### Error: Module not found
```bash
npm install
npm run vercel-build
```

### Database connection issues
Pastikan `DATABASE_URL` sudah di-set di Vercel Environment Variables

### CORS errors
Sudah di-handle dengan:
```typescript
res.setHeader('Access-Control-Allow-Origin', '*');
```

## 📚 Resources

- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
