# Install dependencies for all example projects

Write-Host "Installing dependencies for all example projects..." -ForegroundColor Green

# React TypeScript
Write-Host "`nInstalling React TypeScript dependencies..." -ForegroundColor Yellow
Set-Location "react-typescript"
pnpm add vite @vitejs/plugin-react
Set-Location ..

# Vue3 TypeScript
Write-Host "`nInstalling Vue3 TypeScript dependencies..." -ForegroundColor Yellow
Set-Location "vue3-typescript"
pnpm add vite @vitejs/plugin-vue
Set-Location ..

# Vue2
Write-Host "`nInstalling Vue2 dependencies..." -ForegroundColor Yellow
Set-Location "vue2"
pnpm add vite @vitejs/plugin-vue2
Set-Location ..

# Vanilla
Write-Host "`nInstalling Vanilla dependencies..." -ForegroundColor Yellow
Set-Location "vanilla"
pnpm add vite
Set-Location ..

# Lit
Write-Host "`nInstalling Lit dependencies..." -ForegroundColor Yellow
Set-Location "lit"
pnpm add vite lit
Set-Location ..

# Angular
Write-Host "`nInstalling Angular dependencies..." -ForegroundColor Yellow
Set-Location "angular"
pnpm add vite @angular/core @angular/common @angular/platform-browser @angular/platform-browser-dynamic
Set-Location ..

# TypeScript Library
Write-Host "`nInstalling TypeScript Library dependencies..." -ForegroundColor Yellow
Set-Location "typescript-library"
pnpm add vite
Set-Location ..

Write-Host "`nAll dependencies installed successfully!" -ForegroundColor Green
