# 🐛 Debug Guide - Admin Login & Vouchers

## Status Saat Ini

### ✅ Yang Sudah Bekerja
1. **Database**: Admin user exists dengan `isAdmin: true`
   - Email: admin@tapakpamungkas.com
   - Password: admin123
   - IsAdmin: ✅ true

2. **API Endpoint**: Login API mengembalikan data yang benar
   ```json
   {
     "id": 1,
     "name": "Admin Pamungkas",
     "email": "admin@tapakpamungkas.com",
     "isAdmin": true
   }
   ```

3. **Vouchers API**: Endpoint `/api/vouchers` mengembalikan voucher dengan benar

### 🔍 Yang Perlu Di-Check

#### Admin Login Issue

**Langkah Debug:**

1. **Buka Browser Developer Console** (F12)
   - Tab: Console

2. **Coba Login sebagai Admin**
   - Email: `admin@tapakpamungkas.com`
   - Password: `admin123`

3. **Check Console Logs**
   - Lihat apakah ada log: `Login response: {...}`
   - Verify `isAdmin: true` dalam response

4. **Check localStorage**
   - Di Console, ketik: `localStorage.getItem('currentUser')`
   - Pastikan user ter-save dengan `isAdmin: true`

#### Voucher Display Issue

**Langkah Debug:**

1. **Check Network Tab**
   - Buka tab Network di Developer Tools
   - Navigate ke halaman Vouchers
   - Lihat request ke `/api/vouchers`
   - Verify response contains voucher data

2. **Check Console for Errors**
   - Lihat apakah ada error saat fetch vouchers
   - Check apakah `allVouchers` state populated

## 🔧 Code Changes Made

### App.tsx - Login Logic Fixed

**Before:**
```typescript
handleNavigate(user.isAdmin ? 'adminPanel' : 'home');
```

**After:**
```typescript
// Check both isAdmin and email
const targetPage = user.isAdmin && user.email === ADMIN_EMAIL ? 'adminPanel' : 'home';
handleNavigate(targetPage);
```

**Benefits:**
- Double verification (isAdmin flag + email match)
- Debug logs added
- Skip cart/wishlist fetch for admin (faster login)

### handleAdminLogin Fixed

**Before:**
```typescript
if (user.email === ADMIN_EMAIL) {
```

**After:**
```typescript
// Check both isAdmin flag AND email match
if (user.isAdmin && user.email === ADMIN_EMAIL) {
```

## 🧪 Testing Steps

### Test Admin Login

1. **Clear Browser Cache**
   ```
   Ctrl + Shift + R (Chrome)
   Ctrl + F5 (Firefox)
   ```

2. **Clear localStorage**
   ```javascript
   localStorage.clear();
   ```

3. **Go to Login Page**

4. **Login with Admin Credentials**
   - Email: admin@tapakpamungkas.com
   - Password: admin123

5. **Expected Behavior:**
   - Should redirect to Admin Panel
   - Console should show:
     ```
     Login response: {id: 1, name: "Admin Pamungkas", email: "admin@...", isAdmin: true, ...}
     ```

6. **If Failed:**
   - Check console for error logs
   - Verify API response in Network tab
   - Check if `user.isAdmin` is actually `true`

### Test Vouchers

1. **Navigate to Vouchers Page**
   - Click menu atau navigate ke `/vouchers`

2. **Check Developer Console**
   - Should see fetch to `/api/vouchers`
   - Should receive array of vouchers

3. **Expected Display:**
   - Voucher cards should appear
   - Should show "WELCOME10" voucher

4. **If Not Showing:**
   - Check Network tab for `/api/vouchers` request
   - Check Console for errors
   - Verify `allVouchers` state in React DevTools

## 🚀 Quick Fixes

### If Still Can't Login as Admin

**Option 1: Re-seed Admin**
```bash
npm run seed-admin
```

**Option 2: Manual Database Update**
```bash
npx prisma studio
```
Then verify:
- isAdmin = true
- email = admin@tapakpamungkas.com

### If Vouchers Not Showing

**Option 1: Check if Vouchers Exist**
```bash
node scripts/checkAdmin.js
```

**Option 2: Add Sample Voucher via API**
```javascript
fetch('http://localhost:3001/api/vouchers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    code: 'TEST50',
    discountPercentage: 50,
    startDate: '2025-01-01',
    endDate: '2025-12-31'
  })
});
```

## 📝 Common Issues

### Issue 1: Login works but redirects to home instead of admin panel

**Cause:** localStorage might have stale data

**Fix:**
```javascript
// In browser console:
localStorage.clear();
location.reload();
```

### Issue 2: "Admin access denied" even with correct credentials

**Cause:** isAdmin flag not properly checked

**Fix:** Code already updated - check console logs to verify API response

### Issue 3: Vouchers array is empty

**Cause:** No vouchers in database OR API fetch failed

**Fix:**
1. Check Network tab for `/api/vouchers` request
2. Verify database has vouchers: `node scripts/checkAdmin.js`
3. Add voucher from Admin Panel

## 📊 Verification Checklist

- [ ] Database has admin user with `isAdmin: true`
- [ ] API `/api/login` returns `isAdmin: true`
- [ ] Frontend receives admin user object
- [ ] localStorage stores admin user correctly
- [ ] Redirect to admin panel works
- [ ] API `/api/vouchers` returns voucher array
- [ ] Vouchers display on Voucher Page
- [ ] Can claim vouchers when logged in

## 💡 Development Tips

1. **Always check Console first** for errors/logs
2. **Use Network tab** to verify API responses
3. **React DevTools** to inspect component state
4. **localStorage inspector** to check saved data

---

**Status:** Code updated, ready for testing!
