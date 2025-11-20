# 🚀 Panduan Deploy ke cPanel - Tapak Pamungkas

## 📋 Daftar Isi
1. [Persiapan](#persiapan)
2. [Setup Database MySQL](#setup-database-mysql)
3. [Deploy Backend (Node.js + Prisma)](#deploy-backend)
4. [Deploy Frontend](#deploy-frontend)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

---

## ✅ Persiapan

### 1. Build Project

```powershell
# Di folder project
cd h:\Download\ecommerce

# Build frontend
npm run build

# Verify build berhasil
# Folder 'dist' harus ada dengan file index.html
```

### 2. Update Prisma Schema untuk MySQL

**File**: `prisma/schema.prisma`

Ganti provider dari PostgreSQL ke MySQL:

```prisma
datasource db {
  provider = "mysql"  // ← Ganti dari "postgresql"
  url      = env("DATABASE_URL")
}
```

**Catatan**: Jika ada field type yang tidak compatible, akan error saat migrate.

### 3. Update API URL untuk Production

**File**: `services/api.ts`

```typescript
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3001/api'
    : '/api';  // Gunakan relative URL untuk production
```

Setelah edit, rebuild:
```powershell
npm run build
```

---

## 🗄️ Setup Database MySQL

### Step 1: Login ke cPanel

1. Buka browser → `https://tapakpamungkas.co-id.id:2083`
2. Login dengan credentials cPanel Anda

### Step 2: Create Database

1. Di cPanel, cari **"MySQL Databases"**
2. Di section "Create New Database":
   - Database Name: `ecommerce` (akan jadi `username_ecommerce`)
   - Klik **"Create Database"**
3. **Catat nama lengkap database** (contoh: `tapakpam_ecommerce`)

### Step 3: Create Database User

1. Scroll ke "MySQL Users"
2. Di section "Add New User":
   - Username: `ecom_user` (akan jadi `username_ecom_user`)
   - Password: **[Buat password kuat]**
   - Password Strength: Minimal "Very Strong"
   - Klik **"Create User"**
3. **Catat username dan password**

### Step 4: Add User to Database

1. Scroll ke "Add User To Database"
2. Select:
   - User: `username_ecom_user`
   - Database: `username_ecommerce`
3. Klik **"Add"**
4. Di halaman privileges, centang **"ALL PRIVILEGES"**
5. Klik **"Make Changes"**

### Step 5: Catat Database Credentials

```
Database Name: tapakpam_ecommerce
Username: tapakpam_ecom_user
Password: [your strong password]
Host: localhost
Port: 3306
```

**Database URL**:
```
mysql://tapakpam_ecom_user:YOUR_PASSWORD@localhost:3306/tapakpam_ecommerce
```

---

## 🔧 Deploy Backend

### Step 1: Upload Backend Files

#### Via File Manager (Recommended):

1. **Login cPanel** → **File Manager**
2. **Navigate** ke `public_html/`
3. **Create folder** `api`:
   - Klik "New Folder"
   - Nama: `api`
   - Create
4. **Masuk ke folder** `api/`
5. **Upload files**:
   - Klik "Upload"
   - Upload file-file ini:
     - Folder `server/` (zip dulu, lalu extract)
     - `package.json`
     - `package-lock.json`
     - Folder `prisma/` (zip dulu, lalu extract)

**Struktur akhir**:
```
public_html/
├── api/
│   ├── server/
│   │   ├── index.ts
│   │   └── db.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   └── package-lock.json
```

### Step 2: Setup Node.js Application

1. **Di cPanel**, cari **"Setup Node.js App"**
2. Klik **"Create Application"**
3. **Configure**:
   - **Node.js version**: Pilih 18.x atau 20.x (yang tersedia)
   - **Application mode**: `Production`
   - **Application root**: `/home/YOUR_USERNAME/public_html/api`
   - **Application URL**: (kosongkan atau isi `api`)
   - **Application startup file**: `server/index.js`
   - **Passenger log file**: (biarkan default)
4. Klik **"Create"**

### Step 3: Install Dependencies

1. **Di halaman Node.js App**, klik **"Run NPM Install"**
2. **Tunggu** hingga selesai (bisa 2-5 menit)
3. **Verify**: Lihat log, pastikan tidak ada error

**Atau via Terminal** (jika punya SSH):
```bash
cd ~/public_html/api
npm install --production
```

### Step 4: Create .env File

1. **Di File Manager**, navigate ke `public_html/api/`
2. **Create file** `.env`:
   - Klik "File"
   - Nama: `.env`
   - Create
3. **Edit file** `.env`:
   - Klik kanan → Edit
   - Paste content:

```env
DATABASE_URL="mysql://tapakpam_ecom_user:YOUR_PASSWORD@localhost:3306/tapakpam_ecommerce"
NODE_ENV=production
PORT=3001
```

4. **Replace**:
   - `tapakpam_ecom_user` → username database Anda
   - `YOUR_PASSWORD` → password database Anda
   - `tapakpam_ecommerce` → nama database Anda
5. **Save** file

### Step 5: Generate Prisma Client

**Via SSH** (Recommended):
```bash
cd ~/public_html/api
npx prisma generate
```

**Via cPanel Terminal** (jika tersedia):
1. Buka "Terminal" di cPanel
2. Run command di atas

**Jika tidak ada SSH/Terminal**:
- Generate di local, upload folder `node_modules/.prisma/`

### Step 6: Run Database Migration

**Via SSH**:
```bash
cd ~/public_html/api
npx prisma migrate deploy
```

**Jika tidak ada SSH** - Manual SQL:

1. **Di local**, generate SQL:
   ```bash
   npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > migration.sql
   ```

2. **Upload** `migration.sql` ke cPanel

3. **Di cPanel**, buka **phpMyAdmin**

4. **Select database** `tapakpam_ecommerce`

5. **Klik tab "SQL"**

6. **Copy-paste** isi `migration.sql`

7. **Klik "Go"**

**Verify**: Cek tab "Structure", pastikan semua table ada (User, Product, Order, dll)

### Step 7: Start Backend Server

1. **Di Node.js App page**, klik **"Restart"**
2. **Verify status**: Harus "Running" (hijau)
3. **Check logs**: Klik "Open logs" → pastikan tidak ada error

### Step 8: Test Backend API

Buka browser, test endpoint:

```
https://tapakpamungkas.co-id.id/api/health
```

**Expected response**:
```json
{"status":"ok","timestamp":"2025-11-20T..."}
```

Jika berhasil, backend sudah running! ✅

---

## 🎨 Deploy Frontend

### Step 1: Upload Frontend Files

1. **Di File Manager**, navigate ke `public_html/`
2. **Delete** file default:
   - `index.html` (yang lama)
   - `cgi-bin/` (jika ada)
   - File lain yang tidak perlu
3. **Upload** semua file dari folder `dist/`:
   - `index.html`
   - Folder `assets/`
   - File lainnya

**Cara upload**:
- Klik "Upload"
- Pilih semua file di `dist/`
- Upload
- Atau zip folder `dist/`, upload, lalu extract

**Struktur akhir**:
```
public_html/
├── index.html          ← File utama
├── assets/
│   ├── index-xxx.js
│   ├── index-xxx.css
│   └── ...
├── api/                ← Backend
│   └── ...
└── .htaccess
```

### Step 2: Verify .htaccess

File `.htaccess` sudah ada di project. Pastikan ter-upload ke `public_html/.htaccess`

**Content** (sudah ada):
```apache
# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# API Proxy (optional - jika perlu)
RewriteRule ^api/(.*)$ /api/$1 [L,P]

# SPA Routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api
RewriteRule ^(.*)$ /index.html [L]
```

### Step 3: Set File Permissions

1. **Select** semua files di `public_html/`
2. **Klik kanan** → **Change Permissions**
3. **Set**:
   - Files: `644`
   - Folders: `755`
4. **Apply** to all files

---

## 🔒 Activate SSL

### Option 1: AutoSSL (cPanel)

1. **Di cPanel**, cari **"SSL/TLS Status"**
2. **Find** domain `tapakpamungkas.co-id.id`
3. **Klik** "Run AutoSSL"
4. **Wait** 5-10 menit
5. **Refresh** page
6. **Verify**: Status harus "Certificate installed"

### Option 2: Cloudflare (Recommended)

Lihat panduan SSL yang sudah dibuat sebelumnya.

---

## ✅ Testing

### Backend Tests

1. **Health Check**:
   ```
   https://tapakpamungkas.co-id.id/api/health
   ```
   ✅ Should return: `{"status":"ok"}`

2. **Products API**:
   ```
   https://tapakpamungkas.co-id.id/api/products
   ```
   ✅ Should return: Array of products

3. **Database Connection**:
   - Jika API products berhasil, database connected ✅

### Frontend Tests

1. **Homepage**: `https://tapakpamungkas.co-id.id`
   - ✅ Loads without errors
   - ✅ Images display
   - ✅ Navigation works

2. **Products Page**:
   - ✅ Products load from database
   - ✅ Images display
   - ✅ Click product → detail page works

3. **Login/Register**:
   - ✅ Form works
   - ✅ Can create account
   - ✅ Can login

4. **Cart & Checkout**:
   - ✅ Add to cart works
   - ✅ Cart page shows items
   - ✅ Checkout works
   - ✅ Order created in database

5. **Mobile**:
   - ✅ Resize browser → responsive
   - ✅ Touch works
   - ✅ Menu works

### Console Check

1. **Open DevTools** (F12)
2. **Check Console**:
   - ✅ No errors
   - ✅ No CORS errors
   - ✅ API calls successful

---

## 🔧 Troubleshooting

### Problem 1: "Cannot find module '@prisma/client'"

**Solution**:
```bash
cd ~/public_html/api
npx prisma generate
# Restart Node.js app
```

### Problem 2: "Database connection failed"

**Check**:
1. ✅ `.env` file exists di `public_html/api/`
2. ✅ DATABASE_URL correct
3. ✅ Database user has privileges
4. ✅ Database exists

**Test connection**:
- Login phpMyAdmin dengan credentials
- Jika bisa login, credentials benar

### Problem 3: "500 Internal Server Error"

**Solutions**:
1. ✅ Check Node.js app logs
2. ✅ Verify `npm install` completed
3. ✅ Check file permissions
4. ✅ Restart Node.js app

### Problem 4: "API returns 404"

**Check**:
1. ✅ Node.js app is running (status: Running)
2. ✅ Application URL setting correct
3. ✅ File path correct
4. ✅ Restart app

### Problem 5: "CORS Error"

**Solution**: Update `server/index.ts`:
```typescript
const allowedOrigins = [
  'https://tapakpamungkas.co-id.id',
  'https://www.tapakpamungkas.co-id.id'
];
```
Rebuild & re-upload.

### Problem 6: "Blank page / White screen"

**Check**:
1. ✅ `index.html` ada di `public_html/`
2. ✅ Folder `assets/` ada
3. ✅ Check browser console for errors
4. ✅ Verify API URL correct

### Problem 7: "Products not loading"

**Check**:
1. ✅ Backend API working (`/api/products`)
2. ✅ Database has products
3. ✅ CORS configured
4. ✅ Check browser console

---

## 📊 Deployment Checklist

### Pre-Deployment
- [ ] Build frontend (`npm run build`)
- [ ] Update Prisma schema to MySQL
- [ ] Update API URL for production
- [ ] Rebuild after changes

### Database
- [ ] MySQL database created
- [ ] Database user created
- [ ] User added to database (all privileges)
- [ ] Credentials noted

### Backend
- [ ] Files uploaded to `public_html/api/`
- [ ] Node.js app created
- [ ] Dependencies installed
- [ ] `.env` file created with correct credentials
- [ ] Prisma client generated
- [ ] Database migrated
- [ ] Backend server running
- [ ] API health check passes

### Frontend
- [ ] Files uploaded to `public_html/`
- [ ] `.htaccess` configured
- [ ] File permissions set
- [ ] Homepage loads

### SSL
- [ ] SSL certificate installed
- [ ] HTTPS redirect working
- [ ] No mixed content warnings

### Testing
- [ ] All pages load
- [ ] Products display
- [ ] Login/Register works
- [ ] Cart works
- [ ] Checkout works
- [ ] Mobile responsive
- [ ] No console errors

---

## 🎉 Success!

Jika semua checklist ✅, website Anda sudah live!

**Website**: https://tapakpamungkas.co-id.id

**Next Steps**:
1. ✅ Add products via Admin Panel
2. ✅ Test all features thoroughly
3. ✅ Monitor error logs
4. ✅ Setup backups
5. ✅ Configure monitoring

---

## 📞 Need Help?

Jika ada masalah:
1. Screenshot error message
2. Check cPanel error logs
3. Check Node.js app logs
4. Contact hosting support
5. Atau tanya saya dengan detail error
