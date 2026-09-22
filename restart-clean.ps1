# Clean restart script for Foster Kids Frontend
# This script removes the build folder and restarts the dev server

Write-Host "🧹 Cleaning build folder..." -ForegroundColor Cyan

# Remove .next folder if it exists
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "✅ Deleted .next build folder" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Starting development server..." -ForegroundColor Cyan
Write-Host ""

# Start the dev server
npm run dev
