/**
 * qrcode 构建脚本
 * 使用 TypeScript 编译器直接构建
 */

import { execSync } from 'child_process'
import { existsSync, rmSync, mkdirSync, writeFileSync, copyFileSync } from 'fs'

async function buildQRCode() {
  console.log(`🚀 构建 qrcode 包...`)

  try {
    // 清理 dist 目录
    if (existsSync('dist')) {
      rmSync('dist', { recursive: true, force: true })
      console.log('🗑️  清理 dist 目录')
    }

    // 创建 dist 目录
    mkdirSync('dist', { recursive: true })

    // 编译 TypeScript 到 ESM
    console.log('📦 编译 TypeScript (ESM)...')
    execSync('npx tsc src/simple-index.ts --target ES2020 --module ESNext --moduleResolution node --declaration --outDir dist/esm --skipLibCheck', { stdio: 'inherit' })

    // 编译 TypeScript 到 CJS
    console.log('📦 编译 TypeScript (CJS)...')
    execSync('npx tsc src/simple-index.ts --target ES2020 --module CommonJS --moduleResolution node --declaration --outDir dist/cjs --skipLibCheck', { stdio: 'inherit' })

    // 创建主入口文件
    console.log('📦 创建入口文件...')

    // 复制 ESM 版本到根目录
    if (existsSync('dist/esm/simple-index.js')) {
      copyFileSync('dist/esm/simple-index.js', 'dist/index.js')
    }
    if (existsSync('dist/esm/simple-index.d.ts')) {
      copyFileSync('dist/esm/simple-index.d.ts', 'dist/index.d.ts')
    }

    // 复制 CJS 版本
    if (existsSync('dist/cjs/simple-index.js')) {
      copyFileSync('dist/cjs/simple-index.js', 'dist/index.cjs')
    }

    // 复制README
    if (existsSync('README.md')) {
      copyFileSync('README.md', 'dist/README.md')
    }

    console.log('✅ qrcode 构建成功！')
    console.log('📁 输出目录: dist/')
    console.log('📄 构建文件:')
    console.log('  - index.js (ESM)')
    console.log('  - index.cjs (CommonJS)')
    console.log('  - index.d.ts (TypeScript)')
    console.log('  - esm/ (ESM 目录)')
    console.log('  - cjs/ (CJS 目录)')
    console.log('  - README.md')

  } catch (error) {
    console.error('❌ 构建过程中发生错误:', error.message)
    process.exit(1)
  }
}

buildQRCode().catch(console.error)
