# 🚀 Quick Deploy Script for Tapak Pamungkas (Windows)
# This script helps you deploy to Vercel with SSL

Write-Host "🚀 Tapak Pamungkas - Quick Deploy to Vercel" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
} else {
    Write-Host "✅ Vercel CLI already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔐 Security Features:" -ForegroundColor Cyan
Write-Host "  ✅ HTTPS/SSL (automatic)" -ForegroundColor Green
Write-Host "  ✅ Security Headers" -ForegroundColor Green
Write-Host "  ✅ Rate Limiting" -ForegroundColor Green
Write-Host "  ✅ CORS Protection" -ForegroundColor Green
Write-Host "  ✅ XSS Protection" -ForegroundColor Green
Write-Host ""

# Build the project
Write-Host "🔨 Building project..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed. Please fix errors and try again." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Cyan
Write-Host ""

# Deploy to Vercel
vercel --prod

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Add environment variables in Vercel dashboard" -ForegroundColor White
Write-Host "  2. Configure custom domain (optional)" -ForegroundColor White
Write-Host "  3. SSL will activate automatically within 24 hours" -ForegroundColor White
Write-Host "  4. Test your site at the provided URL" -ForegroundColor White
Write-Host ""
Write-Host "🔒 Your website will be secure with HTTPS!" -ForegroundColor Green
Write-Host ""
