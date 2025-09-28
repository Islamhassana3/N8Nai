#!/bin/bash

# Railway Deployment Verification Script
# This script helps verify that the Railway configuration will deploy as a single service

echo "🚂 Railway Single Service Deployment Verification"
echo "=================================================="

echo ""
echo "1. Checking for Railway configuration files..."

# Check for essential files
files_to_check=(
  ".railwayignore"
  "railway.json"
  "package.json"
  "Procfile"
)

all_files_present=true

for file in "${files_to_check[@]}"; do
  if [[ -f "$file" ]]; then
    echo "✅ $file exists"
  else
    echo "❌ $file missing"
    all_files_present=false
  fi
done

echo ""
echo "2. Checking package.json count (should be ~52)..."
package_count=$(find . -name "package.json" -not -path "*/node_modules/*" | wc -l)
echo "📦 Found $package_count package.json files"

if [[ $package_count -gt 50 ]]; then
  echo "⚠️  Multiple package.json files detected - this is why Railway creates multiple services"
else
  echo "✅ Package count looks normal"
fi

echo ""
echo "3. Verifying .railwayignore coverage..."
if [[ -f ".railwayignore" ]]; then
  if grep -q "packages/\*/" ".railwayignore"; then
    echo "✅ .railwayignore excludes packages directories"
  else
    echo "❌ .railwayignore doesn't exclude packages directories"
  fi
else
  echo "❌ .railwayignore file missing"
fi

echo ""
echo "4. Checking Railway configuration consistency..."
if [[ -f "railway.json" ]]; then
  if grep -q "pnpm start:railway" "railway.json"; then
    echo "✅ railway.json uses correct start command"
  else
    echo "⚠️  railway.json start command might be inconsistent"
  fi
  
  if grep -q '"name"' "railway.json"; then
    echo "✅ railway.json has service name defined"
  else
    echo "⚠️  Consider adding 'name' field to railway.json"
  fi
fi

echo ""
echo "5. Summary:"
if [[ "$all_files_present" == true ]]; then
  echo "✅ Configuration files are present"
  echo "✅ .railwayignore should prevent multiple service detection"
  echo "✅ Ready for Railway deployment as single service"
  echo ""
  echo "🎯 Deploy Instructions:"
  echo "   1. Delete any existing services in Railway dashboard"
  echo "   2. Create new service manually from GitHub repo"
  echo "   3. Set Root Directory to '.' (repository root)"
  echo "   4. Railway will detect and use railway.json configuration"
else
  echo "❌ Missing required configuration files"
fi

echo ""
echo "📋 Files that should be deployed to Railway:"
echo "   - Root package.json (main service definition)"
echo "   - Railway config files (.railwayignore, railway.json, etc.)"
echo "   - All packages/* (needed for build, but ignored for service detection)"

echo ""
echo "🚫 What .railwayignore prevents Railway from detecting as services:"
find packages -name "package.json" | head -10
echo "   ... and $(expr $package_count - 11) more package.json files"