#!/usr/bin/env node

/**
 * 最终检查脚本
 * 验证所有演示项目文件是否正确创建和配置
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 执行最终检查...\n')

// 所有应该存在的文件
const requiredFiles = [
  // 原生 JavaScript 项目
  'vanilla-js-demo/package.json',
  'vanilla-js-demo/index.html',
  'vanilla-js-demo/src/main.js',
  'vanilla-js-demo/vite.config.js',
  'vanilla-js-demo/README.md',

  // Vue 3 项目
  'vue-demo/package.json',
  'vue-demo/index.html',
  'vue-demo/src/main.ts',
  'vue-demo/src/App.vue',
  'vue-demo/src/style.css',
  'vue-demo/src/components/BasicFormDemo.vue',
  'vue-demo/src/components/ComposableDemo.vue',
  'vue-demo/src/components/AdvancedFormDemo.vue',
  'vue-demo/src/components/GroupedFormDemo.vue',
  'vue-demo/src/components/ThemeDemo.vue',
  'vue-demo/vite.config.ts',
  'vue-demo/tsconfig.json',
  'vue-demo/tsconfig.node.json',
  'vue-demo/README.md',

  // 启动脚本和工具
  'package.json',
  'start-demos.js',
  'start-demos.bat',
  'test-build.js',
  'verify-setup.js',
  'test-basic.html',
  'README.md',
]

// 检查文件是否存在
function checkFiles() {
  console.log('📁 检查文件结构...')

  let allExists = true
  const missingFiles = []

  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`)
    } else {
      console.log(`❌ ${file}`)
      allExists = false
      missingFiles.push(file)
    }
  })

  return { allExists, missingFiles }
}

// 检查 package.json 内容
function checkPackageJsonContent() {
  console.log('\n📦 检查 package.json 内容...')

  const packages = [
    { path: 'vanilla-js-demo/package.json', name: '原生 JS 项目' },
    { path: 'vue-demo/package.json', name: 'Vue 3 项目' },
    { path: 'package.json', name: '演示项目集合' },
  ]

  let allValid = true

  packages.forEach(pkg => {
    try {
      if (fs.existsSync(pkg.path)) {
        const content = JSON.parse(fs.readFileSync(pkg.path, 'utf8'))

        // 检查必要字段
        const requiredFields = ['name', 'version', 'scripts']
        const missingFields = requiredFields.filter(field => !content[field])

        if (missingFields.length === 0) {
          console.log(`✅ ${pkg.name}: 配置完整`)
        } else {
          console.log(`❌ ${pkg.name}: 缺少字段 ${missingFields.join(', ')}`)
          allValid = false
        }

        // 检查脚本
        if (content.scripts) {
          const hasDevScript = content.scripts.dev || content.scripts['dev:all']
          const hasBuildScript =
            content.scripts.build || content.scripts['build:all']

          if (hasDevScript && hasBuildScript) {
            console.log(`✅ ${pkg.name}: 脚本配置正确`)
          } else {
            console.log(`❌ ${pkg.name}: 缺少必要的脚本`)
            allValid = false
          }
        }
      }
    } catch (error) {
      console.log(`❌ ${pkg.name}: JSON 解析失败 - ${error.message}`)
      allValid = false
    }
  })

  return allValid
}

// 检查源文件内容
function checkSourceContent() {
  console.log('\n📄 检查源文件内容...')

  const sourceFiles = [
    {
      path: 'vanilla-js-demo/src/main.js',
      name: '原生 JS 主文件',
      requiredContent: ['createFormInstance', 'DynamicForm'],
    },
    {
      path: 'vue-demo/src/main.ts',
      name: 'Vue 主文件',
      requiredContent: ['createApp', 'App'],
    },
    {
      path: 'vue-demo/src/App.vue',
      name: 'Vue App 组件',
      requiredContent: ['<template>', '<script setup', 'BasicFormDemo'],
    },
  ]

  let allValid = true

  sourceFiles.forEach(file => {
    try {
      if (fs.existsSync(file.path)) {
        const content = fs.readFileSync(file.path, 'utf8')

        const missingContent = file.requiredContent.filter(
          required => !content.includes(required)
        )

        if (missingContent.length === 0) {
          console.log(`✅ ${file.name}: 内容正确`)
        } else {
          console.log(`❌ ${file.name}: 缺少内容 ${missingContent.join(', ')}`)
          allValid = false
        }
      } else {
        console.log(`❌ ${file.name}: 文件不存在`)
        allValid = false
      }
    } catch (error) {
      console.log(`❌ ${file.name}: 读取失败 - ${error.message}`)
      allValid = false
    }
  })

  return allValid
}

// 检查配置文件
function checkConfigFiles() {
  console.log('\n⚙️  检查配置文件...')

  const configFiles = [
    {
      path: 'vanilla-js-demo/vite.config.js',
      name: '原生 JS Vite 配置',
      requiredContent: ['defineConfig', 'port: 3001'],
    },
    {
      path: 'vue-demo/vite.config.ts',
      name: 'Vue Vite 配置',
      requiredContent: ['defineConfig', 'vue()', 'port: 3002'],
    },
    {
      path: 'vue-demo/tsconfig.json',
      name: 'Vue TypeScript 配置',
      requiredContent: ['compilerOptions', 'include'],
    },
  ]

  let allValid = true

  configFiles.forEach(file => {
    try {
      if (fs.existsSync(file.path)) {
        const content = fs.readFileSync(file.path, 'utf8')

        const missingContent = file.requiredContent.filter(
          required => !content.includes(required)
        )

        if (missingContent.length === 0) {
          console.log(`✅ ${file.name}: 配置正确`)
        } else {
          console.log(`❌ ${file.name}: 配置可能有问题`)
          allValid = false
        }
      } else {
        console.log(`❌ ${file.name}: 文件不存在`)
        allValid = false
      }
    } catch (error) {
      console.log(`❌ ${file.name}: 读取失败 - ${error.message}`)
      allValid = false
    }
  })

  return allValid
}

// 生成最终报告
function generateFinalReport(results) {
  console.log('\n' + '='.repeat(60))
  console.log('📊 最终检查报告')
  console.log('='.repeat(60))

  const { filesCheck, packageCheck, sourceCheck, configCheck } = results

  console.log(`📁 文件结构: ${filesCheck.allExists ? '✅ 通过' : '❌ 失败'}`)
  console.log(`📦 Package 配置: ${packageCheck ? '✅ 通过' : '❌ 失败'}`)
  console.log(`📄 源文件内容: ${sourceCheck ? '✅ 通过' : '❌ 失败'}`)
  console.log(`⚙️  配置文件: ${configCheck ? '✅ 通过' : '❌ 失败'}`)

  const allPassed =
    filesCheck.allExists && packageCheck && sourceCheck && configCheck

  console.log('\n' + '='.repeat(60))

  if (allPassed) {
    console.log('🎉 所有检查都通过！演示项目已正确设置。')
    console.log('\n📝 下一步操作:')
    console.log('1. 验证设置: node verify-setup.js')
    console.log('2. 测试构建: node test-build.js')
    console.log('3. 启动项目: node start-demos.js 或 start-demos.bat')
    console.log('4. 访问演示:')
    console.log('   - 原生 JS: http://localhost:3001')
    console.log('   - Vue 3: http://localhost:3002')
  } else {
    console.log('⚠️  部分检查失败，请修复以下问题:')

    if (!filesCheck.allExists) {
      console.log('\n📁 缺少的文件:')
      filesCheck.missingFiles.forEach(file => {
        console.log(`  - ${file}`)
      })
    }

    if (!packageCheck) {
      console.log('\n📦 Package.json 配置问题')
    }

    if (!sourceCheck) {
      console.log('\n📄 源文件内容问题')
    }

    if (!configCheck) {
      console.log('\n⚙️  配置文件问题')
    }
  }

  return allPassed
}

// 主函数
function main() {
  const results = {
    filesCheck: checkFiles(),
    packageCheck: checkPackageJsonContent(),
    sourceCheck: checkSourceContent(),
    configCheck: checkConfigFiles(),
  }

  const success = generateFinalReport(results)
  process.exit(success ? 0 : 1)
}

// 运行检查
main()
