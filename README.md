# 🛍️ E-Commerce Platform

> **Full-stack e-commerce platform** dengan React, Express, Prisma, dan PostgreSQL  
> **Ready for Vercel Deployment** dengan Serverless Functions

![Project Status](https://img.shields.io/badge/Status-Production%20Ready-success)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)
![React](https://img.shields.io/badge/React-19.2-61dafb)
![Prisma](https://img.shields.io/badge/Prisma-6.19-2d3748)

---

## 🚀 Quick Start

### Local Development

```bash
# 1. Install dependencies
npm install

# 2. Setup environment variables
# Create .env file with:
# DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce"

# 3. Generate Prisma Client
npx prisma generate

# 4. Push database schema
npx prisma db push

# 5. Run development servers
npm run dev      # Frontend (Port 5173)
npm run server   # Backend (Port 3001)
```

### Deploy to Vercel

**📚 Baca dokumentasi lengkap:** [DOCUMENTATION-INDEX.md](./DOCUMENTATION-INDEX.md)

**Quick Deploy:**
1. Read [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md)
2. Follow [SERVERLESS-DEPLOYMENT.md](./SERVERLESS-DEPLOYMENT.md)
3. Deploy! 🎉

---

## 📚 Documentation

| File | Description |
|------|-------------|
| **[📖 DOCUMENTATION-INDEX.md](./DOCUMENTATION-INDEX.md)** | **⭐ START HERE** - Main navigation untuk semua dokumentasi |
| [API-SETUP-SUMMARY.md](./API-SETUP-SUMMARY.md) | Overview serverless API setup |
| [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md) | Pre-deployment checklist & verification |
| [SERVERLESS-DEPLOYMENT.md](./SERVERLESS-DEPLOYMENT.md) | Step-by-step deployment guide |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture & diagrams |
| [api/README.md](./api/README.md) | API endpoints documentation |
| [api/API-TESTING.md](./api/API-TESTING.md) | API testing guide |

---

## ✨ Features

### 🛒 Frontend (React + Vite)
- Product browsing & search
- Shopping cart
- Wishlist
- User authentication
- Checkout process
- Order tracking
- Voucher system
- Admin panel

### 🔧 Backend (Express + Prisma)
- RESTful API
- PostgreSQL database
- User management
- Product CRUD
- Order processing
- Cart & Wishlist persistence
- Voucher management

### ☁️ Serverless Functions (Vercel)
- Auto-scaling API endpoints
- Optimized cold starts
- Built-in CDN
- Environment management

---

## 🗂️ Project Structure

```
ecommerce/
├── api/                    # ⭐ Serverless Functions (Vercel)
│   ├── index.ts           # Main API handler (semua endpoint Express)
│   └── [...slug].ts       # Catch-all handler untuk /api/*
├── server/                # Express backend (local dev)
├── prisma/                # Database schema
├── components/            # React components
├── pages/                 # React pages
└── services/              # API services
```

---

## 🔌 API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)

### Users
- `POST /api/register` - Register user
- `POST /api/login` - Login user
- `GET /api/users` - Get all users (admin)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get all orders (admin)
- `GET /api/orders/user/:userId` - Get user orders

### Cart & Wishlist
- `GET /api/cart/:userId` - Get user cart
- `POST /api/cart` - Add to cart
- `GET /api/wishlist/:userId` - Get wishlist
- `POST /api/wishlist` - Add to wishlist

### Vouchers
- `GET /api/vouchers` - Get all vouchers
- `POST /api/vouchers/claim` - Claim voucher
- `POST /api/vouchers/validate` - Validate voucher

### Health
- `GET /api/health` - Health check & DB status

**📚 Complete docs:** [api/API-TESTING.md](./api/API-TESTING.md)

---

## 🛠️ Tech Stack

### Frontend
- **React 19.2** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Framer Motion** - Animations

### Backend
- **Express 5.1** - Web framework
- **Prisma 6.19** - ORM
- **PostgreSQL** - Database
- **TypeScript** - Type safety

### Deployment
- **Vercel** - Hosting & serverless
- **GitHub** - Version control

---

## 🔐 Environment Variables

### Development (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce"
PORT=3001
```

### Production (Vercel)
```env
DATABASE_URL="postgresql://..."
NODE_ENV="production"
```

---

## 📊 Database Schema

- **User** - User accounts & authentication
- **Product** - Product catalog
- **Order** - Order records & tracking
- **Cart** - Shopping cart items
- **Wishlist** - User wishlists
- **Voucher** - Discount vouchers

**View full schema:** [prisma/schema.prisma](./prisma/schema.prisma)

---

## 🧪 Testing

```bash
# Unit test (node:test)
npm test

# Type check
npm run typecheck

# Test API locally
curl http://localhost:3001/api/health

# Test products endpoint
curl http://localhost:3001/api/products

# See more examples
cat api/API-TESTING.md
```

---

## 📈 Deployment Status

| Component | Status |
|-----------|--------|
| Frontend | ✅ Ready |
| Backend API | ✅ Ready |
| Serverless Functions | ✅ Ready |
| Database | ✅ Ready |
| Documentation | ✅ Complete |

**🟢 Ready for Production Deployment**

---

## 🆘 Support

- 📖 **Documentation:** [DOCUMENTATION-INDEX.md](./DOCUMENTATION-INDEX.md)
- 🐛 **Common Issues:** [QUICK-FIX.md](./QUICK-FIX.md)
- 🔒 **Security:** [SECURITY.md](./SECURITY.md)
- 🚀 **Deployment Help:** [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md)

---

## 📝 License

This project is for educational purposes.

---

## 🎯 Next Steps

1. ✅ **Read Documentation** - Start with [DOCUMENTATION-INDEX.md](./DOCUMENTATION-INDEX.md)
2. 🧪 **Test Locally** - Run `npm run dev` & `npm run server`
3. 🚀 **Deploy** - Follow [SERVERLESS-DEPLOYMENT.md](./SERVERLESS-DEPLOYMENT.md)
4. 📈 **Monitor** - Check Vercel dashboard
5. 🔒 **Secure** - Review [SECURITY.md](./SECURITY.md)

---

**Built with ❤️ using React, TypeScript, and Prisma**

