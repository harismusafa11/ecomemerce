# Test API Endpoints

## Base URL
```
Local: http://localhost:3001
Production: https://your-app.vercel.app
```

## Health Check
```bash
curl https://your-app.vercel.app/api/health
```

## Products

### Get All Products
```bash
curl https://your-app.vercel.app/api/products
```

### Get Single Product
```bash
curl https://your-app.vercel.app/api/products/1
```

### Create Product (Admin)
```bash
curl -X POST https://your-app.vercel.app/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Produk Baru",
    "description": "Deskripsi produk",
    "price": 100000,
    "imageUrls": ["https://example.com/image.jpg"],
    "category": "Kategori",
    "stock": 10
  }'
```

## Users

### Register
```bash
curl -X POST https://your-app.vercel.app/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST https://your-app.vercel.app/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get All Users
```bash
curl https://your-app.vercel.app/api/users
```

## Orders

### Create Order
```bash
curl -X POST https://your-app.vercel.app/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "total": 150000,
    "items": [
      {
        "id": 1,
        "quantity": 2,
        "price": 75000
      }
    ]
  }'
```

### Get All Orders
```bash
curl https://your-app.vercel.app/api/orders
```

### Get User Orders
```bash
curl https://your-app.vercel.app/api/orders/user/1
```

### Update Order Status
```bash
curl -X PUT https://your-app.vercel.app/api/orders/ORDER_ID/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Shipped",
    "trackingNumber": "JNE123456"
  }'
```

## Cart

### Get User Cart
```bash
curl https://your-app.vercel.app/api/cart/1
```

### Add to Cart
```bash
curl -X POST https://your-app.vercel.app/api/cart \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "productId": 1,
    "quantity": 2
  }'
```

### Remove from Cart
```bash
curl -X DELETE https://your-app.vercel.app/api/cart/1/item/1
```

### Clear Cart
```bash
curl -X DELETE https://your-app.vercel.app/api/cart/1
```

## Wishlist

### Get User Wishlist
```bash
curl https://your-app.vercel.app/api/wishlist/1
```

### Add to Wishlist
```bash
curl -X POST https://your-app.vercel.app/api/wishlist \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "productId": 1
  }'
```

### Remove from Wishlist
```bash
curl -X DELETE https://your-app.vercel.app/api/wishlist/1/item/1
```

## Vouchers

### Get All Vouchers
```bash
curl https://your-app.vercel.app/api/vouchers
```

### Claim Voucher
```bash
curl -X POST https://your-app.vercel.app/api/vouchers/claim \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "voucherId": 1
  }'
```

### Get User Vouchers
```bash
curl https://your-app.vercel.app/api/vouchers/user/1
```

### Validate Voucher
```bash
curl -X POST https://your-app.vercel.app/api/vouchers/validate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "code": "DISKON50"
  }'
```

### Create Voucher (Admin)
```bash
curl -X POST https://your-app.vercel.app/api/vouchers \
  -H "Content-Type: application/json" \
  -d '{
    "code": "DISKON50",
    "discountPercentage": 50,
    "startDate": "2025-01-01",
    "endDate": "2025-12-31"
  }'
```

## Response Examples

### Success Response
```json
{
  "id": 1,
  "name": "Product Name",
  "price": 100000
}
```

### Error Response
```json
{
  "error": "Failed to fetch products",
  "details": "Database connection error"
}
```
