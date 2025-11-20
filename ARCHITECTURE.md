# 🏗️ Arsitektur Serverless API

## 📊 Diagram Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        VERCEL PLATFORM                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐         ┌─────────────────────────┐  │
│  │   Static Files   │         │  Serverless Functions   │  │
│  │   (React App)    │         │      (API Folder)       │  │
│  │                  │         │                         │  │
│  │  • index.html    │         │  • api/index.ts         │  │
│  │  • JS bundles    │         │  • api/products.ts      │  │
│  │  • CSS files     │         │  • api/users.ts         │  │
│  │  • Images        │         │  • api/orders.ts        │  │
│  │                  │         │  • api/health.ts        │  │
│  └──────────────────┘         └─────────────────────────┘  │
│         │                                │                  │
│         │                                │                  │
└─────────┼────────────────────────────────┼──────────────────┘
          │                                │
          ▼                                ▼
    ┌──────────┐                    ┌──────────────┐
    │  Browser │                    │   Database   │
    │   User   │                    │  PostgreSQL  │
    └──────────┘                    └──────────────┘
```

## 🔄 Request Flow

### Frontend Request
```
User Browser
    │
    ├─→ https://your-app.vercel.app/
    │       │
    │       ▼
    │   Vercel CDN (Static Files)
    │       │
    │       ▼
    │   React App (index.html + JS)
    │
    └─→ https://your-app.vercel.app/api/products
            │
            ▼
        Vercel Routing (vercel.json)
            │
            ▼
        api/index.ts (Serverless Function)
            │
            ▼
        server/index.ts (Express App)
            │
            ▼
        Prisma Client
            │
            ▼
        PostgreSQL Database
            │
            ▼
        Response JSON ← ← ← ← ← ← ← ← User Browser
```

## 🗂️ File Structure Mapping

```
Project Root (h:\Download\ecommerce\)
│
├── 📁 api/                    → Vercel Serverless Functions
│   ├── index.ts              → /api/* (Main handler)
│   ├── products.ts           → /api/products (Optional)
│   ├── users.ts              → /api/users (Optional)
│   ├── orders.ts             → /api/orders (Optional)
│   └── health.ts             → /api/health
│
├── 📁 server/                 → Local Development Only
│   ├── index.ts              → Express app (used by api/index.ts)
│   └── db.ts                 → Prisma initialization
│
├── 📁 prisma/                 → Database Schema
│   └── schema.prisma         → Models definition
│
├── 📁 dist/                   → Build output (auto-generated)
│   └── [Vite build files]    → Served as static files
│
├── vercel.json               → Routing configuration
└── package.json              → Dependencies & scripts
```

## 🌐 URL Routing

### Production (Vercel)
```
https://your-app.vercel.app/
    │
    ├─ /                      → React App (index.html)
    ├─ /products              → React App (client-side routing)
    ├─ /cart                  → React App (client-side routing)
    ├─ /checkout              → React App (client-side routing)
    │
    └─ /api/                  → Serverless Functions
         ├─ /api/health       → api/health.ts
         ├─ /api/products     → api/index.ts → server/index.ts
         ├─ /api/users        → api/index.ts → server/index.ts
         ├─ /api/orders       → api/index.ts → server/index.ts
         ├─ /api/cart         → api/index.ts → server/index.ts
         └─ /api/vouchers     → api/index.ts → server/index.ts
```

### Local Development
```
Frontend:  http://localhost:5173/
Backend:   http://localhost:3001/api/*

┌─────────────────┐         ┌─────────────────┐
│  Vite Dev       │   →     │  Express Server │
│  Port 5173      │  CORS   │  Port 3001      │
│  (npm run dev)  │   ←     │  (npm run server)│
└─────────────────┘         └─────────────────┘
```

## 🔐 Environment Variables Flow

```
Development (.env)
    ↓
LOCAL SERVER (server/index.ts)
    ↓
DATABASE_URL → Prisma Client → PostgreSQL


Production (Vercel Dashboard)
    ↓
SERVERLESS FUNCTION (api/index.ts)
    ↓
DATABASE_URL → Prisma Client → PostgreSQL
```

## ⚡ Serverless Function Lifecycle

```
1. Request Received
    ↓
2. Function Cold Start (if needed)
    ├─ Load code
    ├─ Initialize runtime
    └─ Execute prisma generate
    ↓
3. Execute Handler
    ├─ Import dependencies
    ├─ Connect to database
    ├─ Process request
    └─ Return response
    ↓
4. Cleanup
    └─ Disconnect database
    ↓
5. Function Idle (kept warm ~15 min)
```

## 📦 Build Process

### Local Build
```bash
npm run build
    ↓
Vite Build
    ├─ Compile TypeScript
    ├─ Bundle React app
    ├─ Optimize assets
    └─ Output to /dist
```

### Vercel Build
```bash
vercel-build command
    ↓
1. prisma generate
    ├─ Generate Prisma Client
    └─ Schema validation
    ↓
2. vite build
    ├─ Build React app
    └─ Output to /dist
    ↓
3. Serverless Functions Detection
    ├─ Scan /api folder
    ├─ Compile TypeScript
    └─ Create function bundles
    ↓
4. Deploy
    ├─ Static files → CDN
    ├─ Functions → Serverless
    └─ Routes → Configuration
```

## 🎯 Request Examples

### Example 1: Get Products
```
User → https://your-app.vercel.app/api/products
         │
         ▼
    vercel.json routing
         │
         ▼
    api/index.ts (serverless)
         │
         ▼
    server/index.ts
         │
         ▼
    GET /api/products handler
         │
         ▼
    prisma.product.findMany()
         │
         ▼
    PostgreSQL Query
         │
         ▼
    Response JSON → User
```

### Example 2: Create Order
```
User → POST https://your-app.vercel.app/api/orders
       Body: { userId: 1, items: [...] }
         │
         ▼
    api/index.ts
         │
         ▼
    server/index.ts
         │
         ▼
    POST /api/orders handler
         │
         ▼
    Validation
         │
         ▼
    prisma.order.create()
         │
         ▼
    Database Transaction
         │
         ▼
    Response: Order object → User
```

## 🔄 Deployment Workflow

```
Developer
    ↓
git push origin main
    ↓
GitHub Repository
    ↓
Webhook → Vercel
    ↓
Vercel Build Process
    ├─ Install dependencies (npm install)
    ├─ Run vercel-build script
    ├─ Build static files
    └─ Bundle serverless functions
    ↓
Deploy to Edge Network
    ├─ Static files → CDN (100+ locations)
    └─ Serverless → AWS Lambda regions
    ↓
Live! 🎉
    ├─ https://your-app.vercel.app
    └─ Auto SSL certificate
```

## 📊 Performance Metrics

```
Cold Start:     ~500ms - 2s
Warm Start:     ~50ms - 200ms
Database Query: Depends on connection pooling
Total Response: ~100ms - 3s (first request)
                ~50ms - 500ms (subsequent)
```

## 🎯 Scalability

```
Concurrent Requests
    │
    ▼
Vercel Auto-Scale
    │
    ├─ Spin up more instances
    ├─ Load balancing
    └─ Global CDN distribution
    │
    ▼
Database Connection
    │
    ├─ Use connection pooling (important!)
    └─ Recommended: Supabase, Neon, PlanetScale
```

---

**💡 Understanding this architecture helps with:**
- Debugging issues
- Optimizing performance  
- Planning scaling strategy
- Cost estimation
