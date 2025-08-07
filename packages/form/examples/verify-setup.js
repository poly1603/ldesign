#!/usr/bin/env node

/**
 * 演示项目设置验证脚本
 * 检查项目配置和依赖是否正确
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 验证演示项目设置...\n')

// 检查项目结构
function checkProjectStructure() {
  console.log('📁 检查项目结构...')

  const requiredFiles = [
    'vanilla-js-demo/package.json',
    'vanilla-js-demo/index.html',
    'vanilla-js-demo/src/main.js',
    'vanilla-js-demo/vite.config.js',
    'vue-demo/package.json',
    'vue-demo/index.html',
    'vue-demo/src/main.ts',
    'vue-demo/src/App.vue',
    'vue-demo/vite.config.ts',
    'vue-demo/tsconfig.json',
  ]

  const missingFiles = []

  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`)
    } else {
      console.log(`❌ ${file}`)
      missingFiles.push(file)
    }
  })

  return missingFiles.length === 0
}

// 检查 package.json 配置
function checkPackageJson(projectPath, projectName) {
  console.log(`\n📦 检查 ${projectName} package.json...`)

  try {
    const packageJsonPath = path.join(projectPath, 'package.json')
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

    // 检查必要的脚本
    const requiredScripts = ['dev', 'build', 'preview']
    const missingScripts = requiredScripts.filter(
      script => !packageJson.scripts[script]
    )

    if (missingScripts.length === 0) {
      console.log('✅ 所有必要的脚本都存在')
    } else {
      console.log(`❌ 缺少脚本: ${missingScripts.join(', ')}`)
      return false
    }

    // 检查依赖
    const hasDependencies =
      packageJson.dependencies &&
      Object.keys(packageJson.dependencies).length > 0
    const hasDevDependencies =
      packageJson.devDependencies &&
      Object.keys(packageJson.devDependencies).length > 0

    if (hasDependencies || hasDevDependencies) {
      console.log('✅ 依赖配置存在')
    } else {
      console.log('❌ 没有配置依赖')
      return false
    }

    return true
  } catch (error) {
    console.log(`❌ package.json 解析失败: ${error.message}`)
    return false
  }
}

// 检查源文件导入
function checkSourceFiles() {
  console.log('\n📄 检查源文件导入...')

  try {
    // 检查原生 JS 项目的 main.js
    const vanillaMainPath = 'vanilla-js-demo/src/main.js'
    if (fs.existsSync(vanillaMainPath)) {
      const content = fs.readFileSync(vanillaMainPath, 'utf8')
      if (content.includes('createFormInstance')) {
        console.log('✅ 原生 JS 项目导入正确')
      } else {
        console.log('❌ 原生 JS 项目缺少必要的导入')
        return false
      }
    }

    // 检查 Vue 项目的 main.ts
    const vueMainPath = 'vue-demo/src/main.ts'
    if (fs.existsSync(vueMainPath)) {
      const content = fs.readFileSync(vueMainPath, 'utf8')
      if (content.includes('createApp')) {
        console.log('✅ Vue 项目导入正确')
      } else {
        console.log('❌ Vue 项目缺少必要的导入')
        return false
      }
    }

    return true
  } catch (error) {
    console.log(`❌ 源文件检查失败: ${error.message}`)
    return false
  }
}

// 检查配置文件
function checkConfigFiles() {
  console.log('\n⚙️  检查配置文件...')

  try {
    // 检查 Vite 配置
    const configs = [
      'vanilla-js-demo/vite.config.js',
      'vue-demo/vite.config.ts',
    ]

    let allValid = true

    configs.forEach(configPath => {
      if (fs.existsSync(configPath)) {
        const content = fs.readFileSync(configPath, 'utf8')
        if (content.includes('vite') || content.includes('defineConfig')) {
          console.log(`✅ ${configPath}`)
        } else {
          console.log(`❌ ${configPath} 配置可能有问题`)
          allValid = false
        }
      } else {
        console.log(`❌ ${configPath} 不存在`)
        allValid = false
      }
    })

    return allValid
  } catch (error) {
    console.log(`❌ 配置文件检查失败: ${error.message}`)
    return false
  }
}

// 检查启动脚本
function checkStartupScripts() {
  console.log('\n🚀 检查启动脚本...')

  const scripts = ['start-demos.js', 'start-demos.bat']

  let hasScript = false

  scripts.forEach(script => {
    if (fs.existsSync(script)) {
      console.log(`✅ ${script}`)
      hasScript = true
    } else {
      console.log(`❌ ${script} 不存在`)
    }
  })

  return hasScript
}

// 生成修复建议
function generateFixSuggestions(issues) {
  if (issues.length === 0) return

  console.log('\n🔧 修复建议:')
  console.log('='.repeat(50))

  issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue}`)
  })

  console.log('\n💡 常见解决方案:')
  console.log('- 确保在正确的目录中运行脚本')
  console.log('- 检查文件路径和文件名是否正确')
  console.log('- 确保所有必要的文件都已创建')
  console.log('- 检查 package.json 中的脚本配置')
}

// 主函数
function main() {
  const issues = []

  // 执行各项检查
  if (!checkProjectStructure()) {
    issues.push('项目结构不完整，缺少必要的文件')
  }

  if (!checkPackageJson('vanilla-js-demo', '原生 JavaScript 项目')) {
    issues.push('原生 JavaScript 项目的 package.json 配置有问题')
  }

  if (!checkPackageJson('vue-demo', 'Vue 3 项目')) {
    issues.push('Vue 3 项目的 package.json 配置有问题')
  }

  if (!checkSourceFiles()) {
    issues.push('源文件导入配置有问题')
  }

  if (!checkConfigFiles()) {
    issues.push('配置文件有问题')
  }

  if (!checkStartupScripts()) {
    issues.push('启动脚本缺失')
  }

  // 生成报告
  console.log('\n' + '='.repeat(60))
  console.log('📊 验证报告')
  console.log('='.repeat(60))

  if (issues.length === 0) {
    console.log('🎉 所有检查都通过！演示项目设置正确。')
    console.log('\n📝 下一步:')
    console.log('1. 安装依赖: cd vanilla-js-demo && npm install')
    console.log('2. 安装依赖: cd vue-demo && npm install')
    console.log('3. 启动项目: node start-demos.js 或 start-demos.bat')
    return true
  } else {
    console.log(`❌ 发现 ${issues.length} 个问题:`)
    generateFixSuggestions(issues)
    return false
  }
}

// 运行验证
const success = main()
process.exit(success ? 0 : 1)
