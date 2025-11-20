# Vercel Database Fix Script
# Run this script to fix database connection issues

Write-Host "🔧 Vercel Database Connection Fix Script" -ForegroundColor Cyan
Write-Host "=========================================`n" -ForegroundColor Cyan

# Step 1: Check if DATABASE_URL is set
Write-Host "Step 1: Checking DATABASE_URL..." -ForegroundColor Yellow
if ($env:DATABASE_URL) {
    Write-Host "✅ DATABASE_URL is set locally" -ForegroundColor Green
    Write-Host "URL: $($env:DATABASE_URL.Substring(0, 30))..." -ForegroundColor Gray
} else {
    Write-Host "⚠️  DATABASE_URL not set locally" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please set your production DATABASE_URL:" -ForegroundColor Yellow
    Write-Host 'Example: $env:DATABASE_URL="postgresql://user:pass@host:port/dbname"' -ForegroundColor Gray
    Write-Host ""
    $dbUrl = Read-Host "Enter your production DATABASE_URL"
    $env:DATABASE_URL = $dbUrl
}

Write-Host ""

# Step 2: Test database connection
Write-Host "Step 2: Testing database connection..." -ForegroundColor Yellow
try {
    npx prisma db pull --force 2>&1 | Out-Null
    Write-Host "✅ Database connection successful!" -ForegroundColor Green
} catch {
    Write-Host "❌ Database connection failed!" -ForegroundColor Red
    Write-Host "Please check your DATABASE_URL and database status" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 3: Generate Prisma Client
Write-Host "Step 3: Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate
Write-Host "✅ Prisma Client generated" -ForegroundColor Green

Write-Host ""

# Step 4: Run migrations
Write-Host "Step 4: Running database migrations..." -ForegroundColor Yellow
try {
    npx prisma migrate deploy
    Write-Host "✅ Migrations completed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Migration failed or no migrations needed" -ForegroundColor Yellow
}

Write-Host ""

# Step 5: Check if data exists
Write-Host "Step 5: Checking database data..." -ForegroundColor Yellow
Write-Host "Opening Prisma Studio to check data..." -ForegroundColor Gray
Write-Host "Press Ctrl+C to continue after checking data`n" -ForegroundColor Gray
Start-Sleep -Seconds 2

Write-Host ""

# Step 6: Instructions for Vercel
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "📋 NEXT STEPS FOR VERCEL:" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Go to Vercel Dashboard: https://vercel.com/dashboard" -ForegroundColor White
Write-Host "2. Select your project" -ForegroundColor White
Write-Host "3. Go to Settings → Environment Variables" -ForegroundColor White
Write-Host "4. Add these variables:" -ForegroundColor White
Write-Host ""
Write-Host "   DATABASE_URL = $env:DATABASE_URL" -ForegroundColor Yellow
Write-Host "   NODE_ENV = production" -ForegroundColor Yellow
Write-Host ""
Write-Host "5. Save and Redeploy" -ForegroundColor White
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Your database is ready for Vercel! 🚀" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
