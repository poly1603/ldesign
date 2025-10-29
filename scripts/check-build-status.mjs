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

console.log('🔍 检查所有包的构建状态...\n')

const packages = readdirSync(packagesDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name)

const results = {
  success: [],
  failed: [],
  skipped: []
}

for (const pkgName of packages) {
  const configPath = join(packagesDir, pkgName, 'ldesign.config.ts')
  const packageJsonPath = join(packagesDir, pkgName, 'package.json')
  
  if (!existsSync(configPath) && !existsSync(packageJsonPath)) {
    results.skipped.push({ name: pkgName, reason: '没有构建配置' })
    continue
  }
  
  process.stdout.write(`测试 ${pkgName}... `)
  
  try {
    const { stdout, stderr } = await execAsync(
      'pnpm build',
      {
        cwd: join(packagesDir, pkgName),
        timeout: 120000 // 2分钟超时
      }
    )
    
    // 检查是否真的成功（不只是退出码为0）
    if (stderr.includes('构建失败') || stderr.includes('BUILD FAILED') || 
        stdout.includes('构建失败') || stdout.includes('BUILD FAILED')) {
      const errorMatch = (stderr + stdout).match(/error.*?(?=\\n|$)/i)
      results.failed.push({
        name: pkgName,
        error: errorMatch ? errorMatch[0] : '构建失败'
      })
      console.log('❌')
    } else {
      results.success.push(pkgName)
      console.log('✅')
    }
  } catch (error) {
    const errorMsg = error.stderr || error.message
    const shortError = errorMsg.split('\\n').find(line => 
      line.includes('error') || line.includes('Error') || line.includes('失败')
    ) || 'Unknown error'
    
    results.failed.push({
      name: pkgName,
      error: shortError.substring(0, 100)
    })
    console.log('❌')
  }
}

// 输出报告
console.log('\\n' + '='.repeat(60))
console.log('📊 构建状态报告')
console.log('='.repeat(60))

console.log(`\\n✅ 构建成功 (${results.success.length}):`)
results.success.forEach(name => console.log(`   - ${name}`))

if (results.failed.length > 0) {
  console.log(`\\n❌ 构建失败 (${results.failed.length}):`)
  results.failed.forEach(({ name, error }) => {
    console.log(`   - ${name}`)
    console.log(`     原因: ${error}`)
  })
}

if (results.skipped.length > 0) {
  console.log(`\\n⊘ 跳过 (${results.skipped.length}):`)
  results.skipped.forEach(({ name, reason }) => {
    console.log(`   - ${name}: ${reason}`)
  })
}

console.log(`\\n总计: ${packages.length} 个包`)
console.log(`成功率: ${((results.success.length / packages.length) * 100).toFixed(1)}%`)
