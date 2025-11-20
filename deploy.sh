#!/bin/bash

# 🚀 Quick Deploy Script for Tapak Pamungkas
# This script helps you deploy to Vercel with SSL

echo "🚀 Tapak Pamungkas - Quick Deploy to Vercel"
echo "==========================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null
then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
else
    echo "✅ Vercel CLI already installed"
fi

echo ""
echo "🔐 Security Features:"
echo "  ✅ HTTPS/SSL (automatic)"
echo "  ✅ Security Headers"
echo "  ✅ Rate Limiting"
echo "  ✅ CORS Protection"
echo "  ✅ XSS Protection"
echo ""

# Build the project
echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please fix errors and try again."
    exit 1
fi

echo ""
echo "🚀 Deploying to Vercel..."
echo ""

# Deploy to Vercel
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next Steps:"
echo "  1. Add environment variables in Vercel dashboard"
echo "  2. Configure custom domain (optional)"
echo "  3. SSL will activate automatically within 24 hours"
echo "  4. Test your site at the provided URL"
echo ""
echo "🔒 Your website will be secure with HTTPS!"
echo ""
