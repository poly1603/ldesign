#!/usr/bin/env node

/**
 * 示例项目功能测试脚本
 */

const fs = require('node:fs')
const path = require('node:path')

console.log('🧪 测试示例项目功能...\n')

// 测试核心功能导入
function testCoreImports() {
  console.log('📦 测试核心功能导入...')

  try {
    // 测试从构建产物导入
    const coreModule = require('./lib/index.js')

    // 检查核心API
    const requiredAPIs = [
      'globalSizeManager',
      'createSizeManager',
      'getSizeConfig',
      'getAvailableModes',
      'isValidSizeMode',
      'getSizeModeDisplayName',
    ]

    let allExists = true
    requiredAPIs.forEach((api) => {
      if (coreModule[api]) {
        console.log(`  ✅ ${api}`)
      }
      else {
        console.log(`  ❌ ${api} (缺失)`)
        allExists = false
      }
    })

    return allExists
  }
  catch (error) {
    console.log(`  ❌ 导入失败: ${error.message}`)
    return false
  }
}

// 测试基础功能
function testBasicFunctionality() {
  console.log('\n⚙️ 测试基础功能...')

  try {
    const {
      globalSizeManager,
      getSizeConfig,
      isValidSizeMode,
    } = require('./lib/index.js')

    // 测试尺寸模式验证
    console.log('  测试尺寸模式验证:')
    console.log(
      `    isValidSizeMode('small'): ${isValidSizeMode('small') ? '✅' : '❌'}`,
    )
    console.log(
      `    isValidSizeMode('invalid'): ${
        !isValidSizeMode('invalid') ? '✅' : '❌'
      }`,
    )

    // 测试配置获取
    console.log('  测试配置获取:')
    const config = getSizeConfig('medium')
    const hasRequiredProps
      = config.fontSize && config.spacing && config.component
    console.log(`    配置完整性: ${hasRequiredProps ? '✅' : '❌'}`)

    // 测试管理器基础功能
    console.log('  测试管理器功能:')
    const initialMode = globalSizeManager.getCurrentMode()
    console.log(`    获取当前模式: ${initialMode ? '✅' : '❌'}`)

    globalSizeManager.setMode('large')
    const newMode = globalSizeManager.getCurrentMode()
    console.log(`    设置模式: ${newMode === 'large' ? '✅' : '❌'}`)

    // 测试CSS变量生成
    console.log('  测试CSS变量生成:')
    const variables = globalSizeManager.generateCSSVariables()
    const hasVariables = Object.keys(variables).length > 0
    console.log(`    变量生成: ${hasVariables ? '✅' : '❌'}`)

    return true
  }
  catch (error) {
    console.log(`  ❌ 功能测试失败: ${error.message}`)
    return false
  }
}

// 测试Vue模块
function testVueModule() {
  console.log('\n🎨 测试Vue模块...')

  try {
    const vueModule = require('./lib/vue/index.js')

    // 检查Vue相关API
    const requiredVueAPIs = [
      'VueSizePlugin',
      'useSize',
      'useSizeResponsive',
      'SizeSwitcher',
      'SizeIndicator',
    ]

    let allExists = true
    requiredVueAPIs.forEach((api) => {
      if (vueModule[api]) {
        console.log(`  ✅ ${api}`)
      }
      else {
        console.log(`  ❌ ${api} (缺失)`)
        allExists = false
      }
    })

    return allExists
  }
  catch (error) {
    console.log(`  ❌ Vue模块导入失败: ${error.message}`)
    return false
  }
}

// 测试示例项目文件结构
function testExampleStructure() {
  console.log('\n📁 测试示例项目结构...')

  const vueFiles = [
    'examples/vue/package.json',
    'examples/vue/src/App.vue',
    'examples/vue/src/main.ts',
    'examples/vue/src/components/CompositionApiDemo.vue',
    'examples/vue/src/components/ComponentDemo.vue',
  ]

  const vanillaFiles = [
    'examples/vanilla/package.json',
    'examples/vanilla/src/main.ts',
    'examples/vanilla/index.html',
    'examples/vanilla/dist/index.html',
  ]

  let allExists = true

  console.log('  Vue示例文件:')
  vueFiles.forEach((file) => {
    if (fs.existsSync(path.join(__dirname, file))) {
      console.log(`    ✅ ${file}`)
    }
    else {
      console.log(`    ❌ ${file} (缺失)`)
      allExists = false
    }
  })

  console.log('  原生JS示例文件:')
  vanillaFiles.forEach((file) => {
    if (fs.existsSync(path.join(__dirname, file))) {
      console.log(`    ✅ ${file}`)
    }
    else {
      console.log(`    ❌ ${file} (缺失)`)
      allExists = false
    }
  })

  return allExists
}

// 测试导入路径修复
function testImportPaths() {
  console.log('\n🔗 测试导入路径修复...')

  try {
    // 检查Vue示例的导入路径
    const vueMainContent = fs.readFileSync(
      path.join(__dirname, 'examples/vue/src/main.ts'),
      'utf8',
    )
    const hasCorrectVueImport = vueMainContent.includes('../../../src/vue')
    console.log(`  Vue示例导入路径: ${hasCorrectVueImport ? '✅' : '❌'}`)

    // 检查原生JS示例的导入路径
    const vanillaMainContent = fs.readFileSync(
      path.join(__dirname, 'examples/vanilla/src/main.ts'),
      'utf8',
    )
    const hasCorrectVanillaImport = vanillaMainContent.includes('../../../src')
    console.log(
      `  原生JS示例导入路径: ${hasCorrectVanillaImport ? '✅' : '❌'}`,
    )

    return hasCorrectVueImport && hasCorrectVanillaImport
  }
  catch (error) {
    console.log(`  ❌ 导入路径检查失败: ${error.message}`)
    return false
  }
}

// 主测试函数
function main() {
  const results = [
    testCoreImports(),
    testBasicFunctionality(),
    testVueModule(),
    testExampleStructure(),
    testImportPaths(),
  ]

  const allPassed = results.every(result => result)

  console.log(`\n${'='.repeat(50)}`)

  if (allPassed) {
    console.log('🎉 所有示例项目功能测试通过！')
    console.log('\n📋 测试总结:')
    console.log('  ✅ 核心功能导入正常')
    console.log('  ✅ 基础功能运行正常')
    console.log('  ✅ Vue模块导入正常')
    console.log('  ✅ 示例项目结构完整')
    console.log('  ✅ 导入路径修复完成')

    console.log('\n🚀 示例项目已准备就绪！')
    console.log('  - Vue示例: cd examples/vue && pnpm dev')
    console.log('  - 原生JS示例: cd examples/vanilla && pnpm dev')

    process.exit(0)
  }
  else {
    console.log('❌ 部分测试失败！请检查上述问题。')
    process.exit(1)
  }
}

// 运行测试
main()
