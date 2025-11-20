# 🚀 Quick Vercel Deployment Script
# Run this after setting up DATABASE_URL in Vercel

Write-Host "🚀 Starting Versel Deployment Fix..." -ForegroundColor Green
Write-Host ""

# Step 1: Check environment
Write-Host "📋 Step 1: Checking environment..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found. Creating from example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
}

# Step 2: Generate Prisma Client
Write-Host ""
Write-Host "📋 Step 2: Generating Prisma Client..." -ForegroundColor Yellow
npm run postinstall
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Prisma generate failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Prisma Client generated" -ForegroundColor Green

# Step 3: Build locally to test
Write-Host ""
Write-Host "📋 Step 3: Testing build locally..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build successful" -ForegroundColor Green

# Step 4: Commit changes
Write-Host ""
Write-Host "📋 Step 4: Committing changes..." -ForegroundColor Yellow
git add -A
git commit -m "Fix Vercel deployment with improved error handling and health check"
Write-Host "✅ Changes committed" -ForegroundColor Green

# Step 5: Push to GitHub
Write-Host ""
Write-Host "📋 Step 5: Pushing to GitHub..." -ForegroundColor Yellow
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Push failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Pushed to GitHub" -ForegroundColor Green

# Final Instructions
Write-Host ""
Write-Host "🎉 Deployment initiated!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 IMPORTANT NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Go to Vercel Dashboard: https://vercel.com/dashboard" -ForegroundColor White
Write-Host "2. Wait for deployment to complete (2-5 minutes)" -ForegroundColor White
Write-Host "3. Check deployment logs for errors" -ForegroundColor White
Write-Host "4. Test health endpoint: https://your-app.vercel.app/api/health" -ForegroundColor White
Write-Host ""
Write-Host "🔐 CRITICAL: Ensure DATABASE_URL is set in Vercel!" -ForegroundColor Yellow
Write-Host "   Settings → Environment Variables → DATABASE_URL" -ForegroundColor Yellow
Write-Host ""
Write-Host "📖 For detailed troubleshooting, read: VERCEL-FIX-GUIDE.md" -ForegroundColor Cyan
Write-Host ""
