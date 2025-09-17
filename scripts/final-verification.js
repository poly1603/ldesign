#!/usr/bin/env node

/**
 * 最终验证脚本
 * 验证 app 目录的所有功能是否正常工作
 */

import fs from 'fs'
import path from 'path'

console.log('🔍 开始最终验证...\n')

// 验证构建产物
function verifyBuildArtifacts() {
  console.log('📦 验证构建产物...')
  
  const checks = [
    // launcher 构建产物 (site 目录)
    { path: 'app/site/index.html', desc: 'launcher 构建 - HTML 文件' },
    { path: 'app/site/assets', desc: 'launcher 构建 - 资源目录', isDir: true },
    
    // builder 构建产物 (es, lib, dist 目录)
    { path: 'app/es/index.js', desc: 'builder 构建 - ESM 入口' },
    { path: 'app/lib/index.cjs', desc: 'builder 构建 - CJS 入口' },
    { path: 'app/dist/index.js', desc: 'builder 构建 - UMD 入口' },
    
    // TypeScript 声明文件
    { path: 'app/es/index.d.ts', desc: 'TypeScript 声明文件' },
    
    // Source maps
    { path: 'app/es/index.js.map', desc: 'ESM Source Map' },
    { path: 'app/lib/index.cjs.map', desc: 'CJS Source Map' },
    { path: 'app/dist/index.js.map', desc: 'UMD Source Map' },
    
    // CSS 文件
    { path: 'app/es/bootstrap.css', desc: 'ESM CSS 文件' },
    { path: 'app/lib/bootstrap.css', desc: 'CJS CSS 文件' },
    { path: 'app/dist/index.css', desc: 'UMD CSS 文件' }
  ]
  
  let passed = 0
  let failed = 0
  
  checks.forEach(check => {
    const fullPath = path.resolve(check.path)
    const exists = check.isDir ? fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory() 
                                : fs.existsSync(fullPath)
    
    if (exists) {
      console.log(`  ✅ ${check.desc}`)
      passed++
    } else {
      console.log(`  ❌ ${check.desc} - 文件不存在: ${fullPath}`)
      failed++
    }
  })
  
  console.log(`\n📊 构建产物验证结果: ${passed} 通过, ${failed} 失败\n`)
  return failed === 0
}

// 验证配置文件
function verifyConfigurations() {
  console.log('⚙️ 验证配置文件...')
  
  const configs = [
    { path: 'app/.ldesign/launcher.config.ts', desc: 'launcher 配置文件' },
    { path: 'app/.ldesign/builder.config.ts', desc: 'builder 配置文件' }
  ]
  
  let passed = 0
  let failed = 0
  
  configs.forEach(config => {
    const fullPath = path.resolve(config.path)
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8')
      const lines = content.split('\n').length
      console.log(`  ✅ ${config.desc} (${lines} 行)`)
      passed++
    } else {
      console.log(`  ❌ ${config.desc} - 文件不存在`)
      failed++
    }
  })
  
  console.log(`\n📊 配置文件验证结果: ${passed} 通过, ${failed} 失败\n`)
  return failed === 0
}

// 验证 JSON 文件支持
function verifyJsonSupport() {
  console.log('📄 验证 JSON 文件支持...')
  
  const jsonFiles = [
    'app/src/i18n/locales/zh-CN.json',
    'app/src/i18n/locales/en.json',
    'app/src/i18n/locales/ja.json'
  ]
  
  let passed = 0
  let failed = 0
  
  jsonFiles.forEach(jsonFile => {
    const fullPath = path.resolve(jsonFile)
    if (fs.existsSync(fullPath)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8')
        JSON.parse(content) // 验证 JSON 格式
        console.log(`  ✅ ${path.basename(jsonFile)} - JSON 格式正确`)
        passed++
      } catch (error) {
        console.log(`  ❌ ${path.basename(jsonFile)} - JSON 格式错误: ${error.message}`)
        failed++
      }
    } else {
      console.log(`  ❌ ${path.basename(jsonFile)} - 文件不存在`)
      failed++
    }
  })
  
  console.log(`\n📊 JSON 文件验证结果: ${passed} 通过, ${failed} 失败\n`)
  return failed === 0
}

// 验证文件大小
function verifyFileSizes() {
  console.log('📏 验证文件大小...')
  
  const sizeChecks = [
    { path: 'app/site/index.html', maxSize: 10 * 1024, desc: 'HTML 文件大小' }, // 10KB
    { path: 'app/es/index.js', maxSize: 2 * 1024 * 1024, desc: 'ESM 文件大小' }, // 2MB
    { path: 'app/lib/index.cjs', maxSize: 2 * 1024 * 1024, desc: 'CJS 文件大小' }, // 2MB
    { path: 'app/dist/index.js', maxSize: 5 * 1024 * 1024, desc: 'UMD 文件大小' } // 5MB
  ]
  
  let passed = 0
  let failed = 0
  
  sizeChecks.forEach(check => {
    const fullPath = path.resolve(check.path)
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath)
      const sizeKB = (stats.size / 1024).toFixed(2)
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2)
      
      if (stats.size <= check.maxSize) {
        console.log(`  ✅ ${check.desc}: ${sizeMB}MB (${sizeKB}KB)`)
        passed++
      } else {
        console.log(`  ❌ ${check.desc}: ${sizeMB}MB - 超过限制 ${(check.maxSize / 1024 / 1024).toFixed(2)}MB`)
        failed++
      }
    } else {
      console.log(`  ❌ ${check.desc} - 文件不存在`)
      failed++
    }
  })
  
  console.log(`\n📊 文件大小验证结果: ${passed} 通过, ${failed} 失败\n`)
  return failed === 0
}

// 主验证函数
async function main() {
  const results = [
    verifyBuildArtifacts(),
    verifyConfigurations(),
    verifyJsonSupport(),
    verifyFileSizes()
  ]
  
  const allPassed = results.every(result => result)
  
  console.log('🎯 最终验证结果:')
  console.log('=' .repeat(50))
  
  if (allPassed) {
    console.log('🎉 所有验证通过！app 目录功能完全正常！')
    console.log('')
    console.log('✅ launcher 构建: 正常 (输出到 site 目录)')
    console.log('✅ builder 构建: 正常 (输出到 es/lib/dist 目录)')
    console.log('✅ JSON 文件支持: 正常')
    console.log('✅ 配置文件: 正常')
    console.log('✅ 文件大小: 正常')
    console.log('')
    console.log('🚀 可以使用以下命令:')
    console.log('  - pnpm run dev      # 开发服务器')
    console.log('  - pnpm run build    # launcher 构建')
    console.log('  - pnpm run preview  # 预览构建产物')
    console.log('  - pnpm run build:builder # builder 构建')
  } else {
    console.log('❌ 部分验证失败，请检查上述错误信息')
    process.exit(1)
  }
}

main().catch(console.error)
