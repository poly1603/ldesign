#!/usr/bin/env node
import { readdirSync, existsSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const packagesDir = join(__dirname, '..', 'packages')

console.log('🚀 快速构建测试...\n')

const testPackages = [
  'auth', 'cache', 'color', 'crypto', 'device', 'file', 
  'http', 'icons', 'logger', 'menu', 'notification',
  'permission', 'router', 'shared', 'size', 'storage',
  'store', 'tabs', 'validator', 'websocket'
]

const results = { success: [], failed: [] }

for (const pkgName of testPackages) {
  const packagePath = join(packagesDir, pkgName)
  const esPath = join(packagePath, 'es')
  
  if (!existsSync(packagePath)) {
    continue
  }
  
  process.stdout.write(`${pkgName}... `)
  
  try {
    await execAsync('pnpm build', {
      cwd: packagePath,
      timeout: 60000
    })
    
    // 检查输出目录
    if (existsSync(esPath)) {
      results.success.push(pkgName)
      console.log('✅')
    } else {
      results.failed.push({ name: pkgName, reason: '输出目录不存在' })
      console.log('❌')
    }
  } catch (error) {
    results.failed.push({ name: pkgName, reason: '构建失败' })
    console.log('❌')
  }
}

console.log(`\n✅ 成功: ${results.success.length}/${testPackages.length}`)
console.log(`❌ 失败: ${results.failed.length}/${testPackages.length}`)

if (results.success.length > 0) {
  console.log('\n成功的包:')
  results.success.forEach(name => console.log(`  - ${name}`))
}

if (results.failed.length > 0) {
  console.log('\n失败的包:')
  results.failed.forEach(({ name, reason }) => console.log(`  - ${name}: ${reason}`))
}

console.log(`\n成功率: ${((results.success.length / testPackages.length) * 100).toFixed(1)}%`)
