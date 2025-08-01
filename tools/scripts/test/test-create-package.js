#!/usr/bin/env node

import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

console.log('🧪 测试包创建工具...\n')

// 测试包名
const testPackageName = 'test-package'
const testPackageDir = path.resolve(__dirname, '../packages', testPackageName)

// 清理之前的测试包
if (fs.existsSync(testPackageDir)) {
  console.log('🧹 清理之前的测试包...')
  fs.rmSync(testPackageDir, { recursive: true, force: true })
}

try {
  // 测试创建包
  console.log('📦 创建测试包...')
  execSync(`npx tsx tools/package/create-package.ts ${testPackageName} --vue --description "测试包"`, {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit',
  })

  // 验证包是否创建成功
  if (fs.existsSync(testPackageDir)) {
    console.log('✅ 测试包创建成功')

    // 验证目录结构
    const requiredDirs = [
      'src',
      'src/types',
      'src/utils',
      'src/vue',
      '__tests__',
      'e2e',
      'docs',
      'examples',
    ]

    const requiredFiles = [
      'package.json',
      'tsconfig.json',
      'rollup.config.js',
      'vitest.config.ts',
      'playwright.config.ts',
      'eslint.config.js',
      'README.md',
      'src/index.ts',
      'src/vue/index.ts',
    ]

    console.log('\n📁 验证目录结构:')
    for (const dir of requiredDirs) {
      const dirPath = path.join(testPackageDir, dir)
      if (fs.existsSync(dirPath)) {
        console.log(`  ✅ ${dir}/`)
      }
      else {
        console.log(`  ❌ ${dir}/ - 缺失`)
      }
    }

    console.log('\n📄 验证配置文件:')
    for (const file of requiredFiles) {
      const filePath = path.join(testPackageDir, file)
      if (fs.existsSync(filePath)) {
        console.log(`  ✅ ${file}`)
      }
      else {
        console.log(`  ❌ ${file} - 缺失`)
      }
    }

    // 验证 package.json 内容
    console.log('\n📋 验证 package.json:')
    const packageJsonPath = path.join(testPackageDir, 'package.json')
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))

      const checks = [
        { key: 'name', expected: '@ldesign/test-package', actual: packageJson.name },
        { key: 'description', expected: '测试包', actual: packageJson.description },
        { key: 'type', expected: 'module', actual: packageJson.type },
        { key: 'scripts.build', expected: 'rollup -c', actual: packageJson.scripts?.build },
        { key: 'scripts.test', expected: 'vitest', actual: packageJson.scripts?.test },
      ]

      for (const check of checks) {
        if (check.actual === check.expected) {
          console.log(`  ✅ ${check.key}: ${check.actual}`)
        }
        else {
          console.log(`  ❌ ${check.key}: 期望 "${check.expected}", 实际 "${check.actual}"`)
        }
      }
    }

    // 测试构建
    console.log('\n🏗️  测试构建:')
    try {
      execSync('pnpm build', {
        cwd: testPackageDir,
        stdio: 'pipe',
      })

      // 检查构建产物
      const buildDirs = ['dist', 'es', 'lib', 'types']
      let buildSuccess = true

      for (const dir of buildDirs) {
        const dirPath = path.join(testPackageDir, dir)
        if (fs.existsSync(dirPath)) {
          console.log(`  ✅ ${dir}/ 生成成功`)
        }
        else {
          console.log(`  ❌ ${dir}/ 生成失败`)
          buildSuccess = false
        }
      }

      if (buildSuccess) {
        console.log('  ✅ 构建测试通过')
      }
      else {
        console.log('  ❌ 构建测试失败')
      }
    }
    catch (error) {
      console.log('  ❌ 构建失败:', error.message.split('\n')[0])
    }
  }
  else {
    console.log('❌ 测试包创建失败')
  }
}
catch (error) {
  console.error('❌ 测试失败:', error.message)
}
finally {
  // 清理测试包
  if (fs.existsSync(testPackageDir)) {
    console.log('\n🧹 清理测试包...')
    fs.rmSync(testPackageDir, { recursive: true, force: true })
    console.log('✅ 清理完成')
  }
}

console.log('\n🎉 包创建工具测试完成!')
