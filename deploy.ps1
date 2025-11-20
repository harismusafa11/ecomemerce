# 🚀 Deployment Script for Tapak Pamungkas
# This script handles GitHub push and Vercel deployment

Write-Host "🚀 Starting Deployment Process..." -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# 1. GitHub Deployment
Write-Host "📦 Step 1: Syncing with GitHub..." -ForegroundColor Yellow
git push origin main
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ GitHub sync successful!" -ForegroundColor Green
} else {
    Write-Host "⚠️ GitHub sync failed or up to date. Continuing..." -ForegroundColor Yellow
}

Write-Host ""

# 2. Vercel Deployment
Write-Host "☁️ Step 2: Deploying to Vercel..." -ForegroundColor Yellow

# Check if Vercel is installed
if (-not (Get-Command "vercel" -ErrorAction SilentlyContinue)) {
    Write-Host "⬇️ Installing Vercel CLI..." -ForegroundColor Cyan
    npm install -g vercel
}

# Login if needed
Write-Host "🔑 Please login to Vercel if prompted..." -ForegroundColor Cyan
cmd /c "vercel login"

# Link project
Write-Host "🔗 Linking project..." -ForegroundColor Cyan
cmd /c "vercel link"

# Deploy
Write-Host "🚀 Deploying to Production..." -ForegroundColor Cyan
cmd /c "vercel deploy --prod"

Write-Host ""
Write-Host "✅ Deployment commands finished!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "⚠️ IMPORTANT: DATABASE CONNECTION" -ForegroundColor Red
Write-Host "To ensure your Prisma database works:" -ForegroundColor Yellow
Write-Host "1. Go to your Vercel Project Dashboard" -ForegroundColor White
Write-Host "2. Navigate to Settings > Environment Variables" -ForegroundColor White
Write-Host "3. Add the following variables from your .env file:" -ForegroundColor White
Write-Host "   - DATABASE_URL" -ForegroundColor Green
Write-Host "   - DIRECT_URL" -ForegroundColor Green
Write-Host "   - NODE_ENV = production" -ForegroundColor Green
Write-Host ""
Write-Host "If you have not set these, the app will NOT connect to the database!" -ForegroundColor Red
Write-Host "=================================" -ForegroundColor Cyan
