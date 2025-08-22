#!/usr/bin/env node

/**
 * 最终检查脚本 - 确保项目完全没有错误
 */

const { execSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

console.log('🎯 最终检查 - 确保项目完全没有错误\n')

let totalErrors = 0
const totalWarnings = 0

// 运行命令并捕获输出
function runCommand(command, description, options = {}) {
  console.log(`🔍 ${description}...`)

  try {
    const output = execSync(command, {
      encoding: 'utf8',
      stdio: 'pipe',
      ...options,
    })

    console.log(`  ✅ ${description} 成功`)
    if (output.trim()) {
      console.log(`  📝 输出: ${output.trim().slice(0, 100)}...`)
    }
    return { success: true, output }
  }
  catch (error) {
    console.log(`  ❌ ${description} 失败`)
    console.log(`  📝 错误: ${error.message.slice(0, 200)}...`)

    if (error.stdout) {
      console.log(`  📤 标准输出: ${error.stdout.slice(0, 200)}...`)
    }
    if (error.stderr) {
      console.log(`  📤 错误输出: ${error.stderr.slice(0, 200)}...`)
    }

    totalErrors++
    return { success: false, error: error.message }
  }
}

// 检查文件结构
function checkFileStructure() {
  console.log('📁 检查文件结构...')

  const criticalFiles = [
    'package.json',
    'tsconfig.json',
    'vite.config.ts',
    'src/index.ts',
    'src/types/index.ts',
    'src/components/DynamicForm.vue',
    'src/components/FormInput.vue',
    'src/vanilla-pure.ts',
  ]

  let missingFiles = 0
  criticalFiles.forEach((file) => {
    if (fs.existsSync(file)) {
      console.log(`  ✅ ${file}`)
    }
    else {
      console.log(`  ❌ ${file} 缺失`)
      missingFiles++
    }
  })

  if (missingFiles > 0) {
    totalErrors += missingFiles
    return false
  }

  console.log('  ✅ 所有关键文件都存在')
  return true
}

// 检查 package.json 配置
function checkPackageJson() {
  console.log('\n📦 检查 package.json 配置...')

  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))

    // 检查必要字段
    const requiredFields = ['name', 'version', 'main', 'module', 'types']
    let missingFields = 0

    requiredFields.forEach((field) => {
      if (pkg[field]) {
        console.log(`  ✅ ${field}: ${pkg[field]}`)
      }
      else {
        console.log(`  ❌ ${field} 缺失`)
        missingFields++
      }
    })

    // 检查脚本
    const requiredScripts = ['build', 'type-check', 'lint']
    requiredScripts.forEach((script) => {
      if (pkg.scripts && pkg.scripts[script]) {
        console.log(`  ✅ 脚本 ${script}: ${pkg.scripts[script]}`)
      }
      else {
        console.log(`  ❌ 脚本 ${script} 缺失`)
        missingFields++
      }
    })

    if (missingFields > 0) {
      totalErrors += missingFields
      return false
    }

    return true
  }
  catch (error) {
    console.log(`  ❌ 无法解析 package.json: ${error.message}`)
    totalErrors++
    return false
  }
}

// 主检查流程
async function main() {
  console.log('开始最终检查...\n')

  // 1. 检查文件结构
  const fileStructureOk = checkFileStructure()

  // 2. 检查 package.json
  const packageJsonOk = checkPackageJson()

  if (!fileStructureOk || !packageJsonOk) {
    console.log('\n❌ 基础配置有问题，无法继续检查')
    process.exit(1)
  }

  console.log(`\n${'='.repeat(60)}`)
  console.log('🔧 运行各项检查...')
  console.log('='.repeat(60))

  // 3. TypeScript 类型检查
  const typeCheck = runCommand(
    'npx vue-tsc --noEmit',
    'Vue TypeScript 类型检查',
  )

  if (!typeCheck.success) {
    // 尝试普通 TypeScript 检查
    runCommand('npx tsc --noEmit', 'TypeScript 类型检查 (备用)')
  }

  // 4. ESLint 检查
  const lintCheck = runCommand(
    'npx eslint src --ext .ts,.vue',
    'ESLint 代码检查',
  )

  if (!lintCheck.success) {
    // 尝试自动修复
    runCommand('npx eslint src --ext .ts,.vue --fix', 'ESLint 自动修复')
  }

  // 5. 构建检查
  console.log('\n🏗️  构建检查...')

  // 清理之前的构建
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true })
    console.log('  🧹 清理了之前的构建产物')
  }

  const buildCheck = runCommand('npx vite build', 'Vite 构建')

  // 检查构建产物
  if (buildCheck.success) {
    console.log('\n📦 检查构建产物...')

    const expectedFiles = [
      'dist/index.mjs',
      'dist/index.cjs',
      'dist/index.d.ts',
      'dist/vanilla.mjs',
      'dist/vanilla.cjs',
      'dist/vanilla.d.ts',
    ]

    let missingBuildFiles = 0
    expectedFiles.forEach((file) => {
      if (fs.existsSync(file)) {
        const stats = fs.statSync(file)
        console.log(`  ✅ ${file} (${Math.round(stats.size / 1024)}KB)`)
      }
      else {
        console.log(`  ❌ ${file} 缺失`)
        missingBuildFiles++
      }
    })

    if (missingBuildFiles > 0) {
      totalErrors += missingBuildFiles
    }
  }

  // 6. 示例项目检查
  console.log('\n📋 检查示例项目...')

  const exampleDirs = [
    { path: 'examples/vue', name: 'Vue 示例' },
    { path: 'examples/vanilla', name: '原生 JavaScript 示例' },
  ]

  exampleDirs.forEach(({ path: examplePath, name }) => {
    if (fs.existsSync(examplePath)) {
      const packagePath = path.join(examplePath, 'package.json')
      if (fs.existsSync(packagePath)) {
        console.log(`  ✅ ${name} 配置正常`)
      }
      else {
        console.log(`  ❌ ${name} 缺少 package.json`)
        totalErrors++
      }
    }
    else {
      console.log(`  ❌ ${name} 目录不存在`)
      totalErrors++
    }
  })

  // 最终报告
  console.log(`\n${'='.repeat(60)}`)
  console.log('📊 最终检查报告')
  console.log('='.repeat(60))

  console.log(`总错误数: ${totalErrors}`)
  console.log(`总警告数: ${totalWarnings}`)

  if (totalErrors === 0) {
    console.log('\n🎉 恭喜！项目完全没有错误！')
    console.log('\n✅ 所有检查项目:')
    console.log('  ✅ 文件结构完整')
    console.log('  ✅ TypeScript 类型检查通过')
    console.log('  ✅ ESLint 检查通过')
    console.log('  ✅ 构建成功')
    console.log('  ✅ 示例项目配置正确')

    console.log('\n🚀 项目已准备就绪！可以执行:')
    console.log('  pnpm dev        - 启动开发服务器')
    console.log('  pnpm build      - 构建项目')
    console.log('  pnpm test       - 运行测试')
    console.log('  pnpm publish    - 发布包')
  }
  else if (totalErrors <= 3) {
    console.log('\n⚠️  项目基本可用，但有少量问题需要修复')
    console.log('\n🔧 建议执行:')
    console.log('  pnpm fix-types  - 自动修复类型问题')
    console.log('  pnpm lint:fix   - 自动修复代码风格问题')
  }
  else {
    console.log('\n❌ 项目有较多问题需要修复')
    console.log('\n🔧 建议步骤:')
    console.log('  1. 查看上述错误信息')
    console.log('  2. 参考 TROUBLESHOOTING.md')
    console.log('  3. 逐个修复问题')
    console.log('  4. 重新运行此检查')
  }

  // 退出码
  process.exit(totalErrors > 0 ? 1 : 0)
}

// 运行主函数
main().catch((error) => {
  console.error('\n💥 检查过程中发生意外错误:', error.message)
  process.exit(1)
})
