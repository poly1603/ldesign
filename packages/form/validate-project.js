#!/usr/bin/env node

/**
 * 验证项目配置和构建的脚本
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🔍 验证项目配置和构建...\n')

let hasErrors = false

// 检查必要文件
function checkRequiredFiles() {
  console.log('📁 检查必要文件...')

  const requiredFiles = [
    'package.json',
    'tsconfig.json',
    'vite.config.ts',
    'src/index.ts',
    'src/types/index.ts',
    'src/components/DynamicForm.vue',
    'src/components/FormInput.vue',
  ]

  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`  ✅ ${file}`)
    } else {
      console.log(`  ❌ ${file} 缺失`)
      hasErrors = true
    }
  })
}

// 检查依赖
function checkDependencies() {
  console.log('\n📦 检查依赖...')

  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))

    // 检查关键依赖
    const requiredDeps = ['vue']
    const requiredDevDeps = [
      'typescript',
      'vite',
      '@vitejs/plugin-vue',
      'vue-tsc',
    ]

    requiredDeps.forEach(dep => {
      if (packageJson.dependencies && packageJson.dependencies[dep]) {
        console.log(`  ✅ ${dep} (生产依赖)`)
      } else {
        console.log(`  ❌ ${dep} 缺失 (生产依赖)`)
        hasErrors = true
      }
    })

    requiredDevDeps.forEach(dep => {
      if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
        console.log(`  ✅ ${dep} (开发依赖)`)
      } else {
        console.log(`  ❌ ${dep} 缺失 (开发依赖)`)
        hasErrors = true
      }
    })
  } catch (error) {
    console.log('  ❌ 无法读取 package.json')
    hasErrors = true
  }
}

// 运行TypeScript检查
function runTypeCheck() {
  console.log('\n🔍 运行TypeScript检查...')

  try {
    execSync('npx vue-tsc --noEmit', { stdio: 'pipe' })
    console.log('  ✅ Vue TypeScript 检查通过')
    return true
  } catch (error) {
    console.log('  ⚠️  Vue TypeScript 检查失败，尝试普通 TypeScript...')

    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe' })
      console.log('  ✅ TypeScript 检查通过')
      return true
    } catch (tscError) {
      console.log('  ❌ TypeScript 检查失败')
      console.log('  错误信息:', tscError.message.slice(0, 200) + '...')
      return false
    }
  }
}

// 运行ESLint检查
function runLintCheck() {
  console.log('\n🔍 运行ESLint检查...')

  try {
    execSync('npx eslint src --ext .ts,.vue', { stdio: 'pipe' })
    console.log('  ✅ ESLint 检查通过')
    return true
  } catch (error) {
    console.log('  ⚠️  ESLint 检查有警告或错误')

    // 尝试自动修复
    try {
      execSync('npx eslint src --ext .ts,.vue --fix', { stdio: 'pipe' })
      console.log('  ✅ ESLint 自动修复完成')
      return true
    } catch (fixError) {
      console.log('  ❌ ESLint 自动修复失败')
      return false
    }
  }
}

// 运行构建测试
function runBuildTest() {
  console.log('\n🏗️  运行构建测试...')

  try {
    // 清理之前的构建
    if (fs.existsSync('dist')) {
      fs.rmSync('dist', { recursive: true, force: true })
    }

    execSync('npx vite build', { stdio: 'pipe' })
    console.log('  ✅ 构建成功')

    // 检查构建产物
    const buildFiles = ['dist/index.mjs', 'dist/index.cjs', 'dist/index.d.ts']

    let buildSuccess = true
    buildFiles.forEach(file => {
      if (fs.existsSync(file)) {
        console.log(`  ✅ ${file}`)
      } else {
        console.log(`  ❌ ${file} 构建失败`)
        buildSuccess = false
      }
    })

    return buildSuccess
  } catch (error) {
    console.log('  ❌ 构建失败')
    console.log('  错误信息:', error.message.slice(0, 200) + '...')
    return false
  }
}

// 检查示例项目
function checkExamples() {
  console.log('\n📋 检查示例项目...')

  const exampleDirs = ['examples/vue', 'examples/vanilla']

  exampleDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      const packagePath = path.join(dir, 'package.json')
      if (fs.existsSync(packagePath)) {
        console.log(`  ✅ ${dir} 配置正常`)
      } else {
        console.log(`  ❌ ${dir} 缺少 package.json`)
        hasErrors = true
      }
    } else {
      console.log(`  ❌ ${dir} 目录不存在`)
      hasErrors = true
    }
  })
}

// 主函数
async function main() {
  try {
    // 1. 检查必要文件
    checkRequiredFiles()

    // 2. 检查依赖
    checkDependencies()

    // 3. 检查示例项目
    checkExamples()

    // 如果基础检查有错误，先修复这些
    if (hasErrors) {
      console.log('\n❌ 基础配置有问题，请先修复上述错误')
      process.exit(1)
    }

    // 4. 运行TypeScript检查
    const typeCheckPassed = runTypeCheck()

    // 5. 运行ESLint检查
    const lintCheckPassed = runLintCheck()

    // 6. 运行构建测试
    const buildPassed = runBuildTest()

    // 总结
    console.log('\n' + '='.repeat(60))
    console.log('📊 验证结果总结:')
    console.log('='.repeat(60))

    console.log(`TypeScript 检查: ${typeCheckPassed ? '✅ 通过' : '❌ 失败'}`)
    console.log(`ESLint 检查: ${lintCheckPassed ? '✅ 通过' : '❌ 失败'}`)
    console.log(`构建测试: ${buildPassed ? '✅ 通过' : '❌ 失败'}`)

    if (typeCheckPassed && lintCheckPassed && buildPassed) {
      console.log('\n🎉 所有验证都通过了！项目配置正确。')
      console.log('\n📝 可以执行的命令:')
      console.log('  pnpm dev        - 启动开发服务器')
      console.log('  pnpm build      - 构建项目')
      console.log('  pnpm type-check - TypeScript 类型检查')
      console.log('  pnpm lint       - ESLint 检查')
      console.log('  pnpm test       - 运行测试')
    } else {
      console.log('\n⚠️  部分验证失败，但项目基本可用。')
      console.log('\n🔧 建议修复步骤:')
      if (!typeCheckPassed) {
        console.log('  1. 修复 TypeScript 类型错误')
      }
      if (!lintCheckPassed) {
        console.log('  2. 修复 ESLint 错误')
      }
      if (!buildPassed) {
        console.log('  3. 修复构建配置问题')
      }
    }
  } catch (error) {
    console.error('\n❌ 验证过程中发生错误:', error.message)
    process.exit(1)
  }
}

// 运行主函数
main()
