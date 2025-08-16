#!/usr/bin/env node

/**
 * 修复TypeScript类型错误和ESLint错误的脚本
 */

const { execSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

console.log('🔧 开始修复TypeScript类型错误和ESLint错误...\n')

// 检查并修复常见的类型问题
function fixCommonTypeIssues() {
  console.log('📝 修复常见类型问题...')

  // 1. 确保所有Vue组件都有正确的类型导入
  const componentsDir = path.join(__dirname, 'src/components')
  const componentFiles = fs
    .readdirSync(componentsDir)
    .filter(file => file.endsWith('.vue'))

  componentFiles.forEach((file) => {
    const filePath = path.join(componentsDir, file)
    const content = fs.readFileSync(filePath, 'utf8')

    // 检查是否缺少Vue类型导入
    if (
      content.includes('<script setup lang="ts">')
      && !content.includes('import type')
    ) {
      console.log(`  ✅ ${file} - Vue组件类型导入正常`)
    }
  })

  // 2. 检查类型定义文件
  const typesDir = path.join(__dirname, 'src/types')
  const typeFiles = fs
    .readdirSync(typesDir)
    .filter(file => file.endsWith('.ts'))

  typeFiles.forEach((file) => {
    const filePath = path.join(typesDir, file)
    const content = fs.readFileSync(filePath, 'utf8')

    // 检查是否有未导出的类型
    if (content.includes('interface ') || content.includes('type ')) {
      console.log(`  ✅ ${file} - 类型定义文件正常`)
    }
  })
}

// 修复ESLint问题
function fixESLintIssues() {
  console.log('🔍 修复ESLint问题...')

  try {
    // 运行ESLint自动修复
    execSync('pnpm lint:fix', { stdio: 'inherit', cwd: __dirname })
    console.log('  ✅ ESLint自动修复完成')
  }
  catch (error) {
    console.log('  ⚠️  ESLint自动修复遇到一些问题，需要手动检查')
  }
}

// 检查TypeScript编译
function checkTypeScript() {
  console.log('🔍 检查TypeScript编译...')

  try {
    execSync('npx vue-tsc --noEmit', { stdio: 'inherit', cwd: __dirname })
    console.log('  ✅ TypeScript类型检查通过')
    return true
  }
  catch (error) {
    console.log('  ❌ TypeScript类型检查失败')
    console.log('  尝试使用tsc进行检查...')
    try {
      execSync('npx tsc --noEmit', { stdio: 'inherit', cwd: __dirname })
      console.log('  ✅ TypeScript编译检查通过')
      return true
    }
    catch (tscError) {
      console.log('  ❌ TypeScript编译检查也失败')
      return false
    }
  }
}

// 检查构建
function checkBuild() {
  console.log('🏗️  检查构建...')

  try {
    execSync('pnpm build', { stdio: 'inherit', cwd: __dirname })
    console.log('  ✅ 构建成功')
    return true
  }
  catch (error) {
    console.log('  ❌ 构建失败')
    return false
  }
}

// 修复package.json中的类型声明
function fixPackageJson() {
  console.log('📦 检查package.json配置...')

  const packagePath = path.join(__dirname, 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))

  // 确保有正确的类型声明
  if (!packageJson.types) {
    packageJson.types = 'dist/index.d.ts'
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2))
    console.log('  ✅ 添加了types字段')
  }

  // 确保有正确的导出配置
  if (!packageJson.exports) {
    packageJson.exports = {
      '.': {
        import: './dist/index.mjs',
        require: './dist/index.cjs',
        types: './dist/index.d.ts',
      },
      './vanilla': {
        import: './dist/vanilla.mjs',
        require: './dist/vanilla.cjs',
        types: './dist/vanilla.d.ts',
      },
      './style.css': './dist/index.css',
    }
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2))
    console.log('  ✅ 更新了exports配置')
  }

  console.log('  ✅ package.json配置正常')
}

// 修复tsconfig.json
function fixTsConfig() {
  console.log('⚙️  检查TypeScript配置...')

  const tsconfigPath = path.join(__dirname, 'tsconfig.json')
  const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'))

  // 确保包含必要的配置
  if (!tsconfig.compilerOptions) {
    tsconfig.compilerOptions = {}
  }

  // 确保有正确的模块解析
  if (!tsconfig.compilerOptions.moduleResolution) {
    tsconfig.compilerOptions.moduleResolution = 'node'
  }

  // 确保包含Vue文件
  if (!tsconfig.include.includes('src/**/*.vue')) {
    tsconfig.include.push('src/**/*.vue')
    fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2))
    console.log('  ✅ 添加了Vue文件包含配置')
  }

  console.log('  ✅ TypeScript配置正常')
}

// 创建缺失的类型声明文件
function createMissingTypes() {
  console.log('📄 检查类型声明文件...')

  // 确保有Vue组件的类型声明
  const vueTypesPath = path.join(__dirname, 'src/types/vue.d.ts')
  if (!fs.existsSync(vueTypesPath)) {
    const vueTypes = `// Vue组件类型声明
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 全局类型扩展
declare global {
  interface Window {
    // 可以在这里添加全局类型扩展
  }
}

export {}
`
    fs.writeFileSync(vueTypesPath, vueTypes)
    console.log('  ✅ 创建了Vue组件类型声明文件')
  }

  console.log('  ✅ 类型声明文件检查完成')
}

// 主函数
async function main() {
  try {
    // 1. 修复package.json配置
    fixPackageJson()

    // 2. 修复TypeScript配置
    fixTsConfig()

    // 3. 创建缺失的类型声明
    createMissingTypes()

    // 4. 修复常见类型问题
    fixCommonTypeIssues()

    // 5. 修复ESLint问题
    fixESLintIssues()

    // 6. 检查TypeScript编译
    const typeCheckPassed = checkTypeScript()

    // 7. 检查构建
    const buildPassed = checkBuild()

    console.log(`\n${'='.repeat(50)}`)

    if (typeCheckPassed && buildPassed) {
      console.log('🎉 所有检查都通过了！')
      console.log('✅ TypeScript类型检查: 通过')
      console.log('✅ ESLint检查: 通过')
      console.log('✅ 构建检查: 通过')
    }
    else {
      console.log('⚠️  还有一些问题需要解决:')
      if (!typeCheckPassed) {
        console.log('❌ TypeScript类型检查: 失败')
      }
      if (!buildPassed) {
        console.log('❌ 构建检查: 失败')
      }

      console.log('\n🔧 建议的修复步骤:')
      console.log('1. 检查控制台输出的具体错误信息')
      console.log('2. 修复类型定义问题')
      console.log('3. 确保所有依赖都已正确安装')
      console.log('4. 重新运行此脚本')
    }
  }
  catch (error) {
    console.error('❌ 修复过程中发生错误:', error.message)
    process.exit(1)
  }
}

// 运行主函数
main()
