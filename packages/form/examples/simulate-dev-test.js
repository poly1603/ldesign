#!/usr/bin/env node

/**
 * 模拟开发服务器测试
 * 验证项目配置是否正确，模拟 npm run dev 的执行过程
 */

const fs = require('fs')
const path = require('path')

console.log('🧪 模拟开发服务器测试...\n')

// 项目配置
const projects = [
  {
    name: '原生 JavaScript 演示',
    path: './vanilla-js-demo',
    port: 3001,
    entryFile: 'src/main.js',
    configFile: 'vite.config.js',
    expectedFiles: ['index.html', 'src/main.js', 'package.json'],
  },
  {
    name: 'Vue 3 演示',
    path: './vue-demo',
    port: 3002,
    entryFile: 'src/main.ts',
    configFile: 'vite.config.ts',
    expectedFiles: ['index.html', 'src/main.ts', 'src/App.vue', 'package.json'],
  },
]

// 检查文件是否存在
function checkFileExists(filePath) {
  return fs.existsSync(filePath)
}

// 读取并验证 package.json
function validatePackageJson(projectPath) {
  const packageJsonPath = path.join(projectPath, 'package.json')

  try {
    const content = fs.readFileSync(packageJsonPath, 'utf8')
    const packageJson = JSON.parse(content)

    const issues = []

    // 检查必要的脚本
    if (!packageJson.scripts?.dev) {
      issues.push('缺少 dev 脚本')
    }

    if (!packageJson.scripts?.build) {
      issues.push('缺少 build 脚本')
    }

    // 检查依赖
    const hasDeps = packageJson.dependencies || packageJson.devDependencies
    if (!hasDeps) {
      issues.push('没有配置依赖')
    }

    return {
      valid: issues.length === 0,
      issues,
      packageJson,
    }
  } catch (error) {
    return {
      valid: false,
      issues: [`package.json 解析失败: ${error.message}`],
      packageJson: null,
    }
  }
}

// 验证 Vite 配置
function validateViteConfig(projectPath, configFile) {
  const configPath = path.join(projectPath, configFile)

  try {
    const content = fs.readFileSync(configPath, 'utf8')
    const issues = []

    // 检查基本配置
    if (!content.includes('defineConfig')) {
      issues.push('缺少 defineConfig')
    }

    if (!content.includes('server')) {
      issues.push('缺少 server 配置')
    }

    if (!content.includes('port')) {
      issues.push('缺少端口配置')
    }

    return {
      valid: issues.length === 0,
      issues,
      content,
    }
  } catch (error) {
    return {
      valid: false,
      issues: [`配置文件读取失败: ${error.message}`],
      content: null,
    }
  }
}

// 验证入口文件
function validateEntryFile(projectPath, entryFile) {
  const entryPath = path.join(projectPath, entryFile)

  try {
    const content = fs.readFileSync(entryPath, 'utf8')
    const issues = []

    // 检查导入语句
    if (!content.includes('import')) {
      issues.push('缺少 import 语句')
    }

    // 根据文件类型检查特定内容
    if (entryFile.endsWith('.js')) {
      if (!content.includes('createFormInstance')) {
        issues.push('缺少 createFormInstance 导入')
      }
    } else if (entryFile.endsWith('.ts')) {
      if (!content.includes('createApp')) {
        issues.push('缺少 createApp 导入')
      }
    }

    return {
      valid: issues.length === 0,
      issues,
      content,
    }
  } catch (error) {
    return {
      valid: false,
      issues: [`入口文件读取失败: ${error.message}`],
      content: null,
    }
  }
}

// 模拟依赖检查
function simulateDependencyCheck(projectPath, packageJson) {
  const nodeModulesPath = path.join(projectPath, 'node_modules')
  const hasNodeModules = fs.existsSync(nodeModulesPath)

  const issues = []

  if (!hasNodeModules) {
    issues.push('node_modules 目录不存在，需要运行 npm install')
  }

  // 检查关键依赖
  if (packageJson) {
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    }

    if (!allDeps.vite) {
      issues.push('缺少 vite 依赖')
    }

    if (projectPath.includes('vue-demo') && !allDeps.vue) {
      issues.push('Vue 项目缺少 vue 依赖')
    }
  }

  return {
    valid: issues.length === 0,
    issues,
    hasNodeModules,
  }
}

// 测试单个项目
function testProject(project) {
  console.log(`\n🔍 测试项目: ${project.name}`)
  console.log(`📁 路径: ${project.path}`)
  console.log(`🌐 预期端口: ${project.port}`)

  const results = {
    filesExist: true,
    packageJson: null,
    viteConfig: null,
    entryFile: null,
    dependencies: null,
    issues: [],
  }

  // 检查文件是否存在
  console.log('\n📁 检查文件结构...')
  project.expectedFiles.forEach(file => {
    const filePath = path.join(project.path, file)
    if (checkFileExists(filePath)) {
      console.log(`✅ ${file}`)
    } else {
      console.log(`❌ ${file}`)
      results.filesExist = false
      results.issues.push(`缺少文件: ${file}`)
    }
  })

  // 验证 package.json
  console.log('\n📦 验证 package.json...')
  results.packageJson = validatePackageJson(project.path)
  if (results.packageJson.valid) {
    console.log('✅ package.json 配置正确')
  } else {
    console.log('❌ package.json 配置有问题:')
    results.packageJson.issues.forEach(issue => {
      console.log(`   - ${issue}`)
    })
    results.issues.push(...results.packageJson.issues)
  }

  // 验证 Vite 配置
  console.log('\n⚙️  验证 Vite 配置...')
  results.viteConfig = validateViteConfig(project.path, project.configFile)
  if (results.viteConfig.valid) {
    console.log('✅ Vite 配置正确')
  } else {
    console.log('❌ Vite 配置有问题:')
    results.viteConfig.issues.forEach(issue => {
      console.log(`   - ${issue}`)
    })
    results.issues.push(...results.viteConfig.issues)
  }

  // 验证入口文件
  console.log('\n📄 验证入口文件...')
  results.entryFile = validateEntryFile(project.path, project.entryFile)
  if (results.entryFile.valid) {
    console.log('✅ 入口文件正确')
  } else {
    console.log('❌ 入口文件有问题:')
    results.entryFile.issues.forEach(issue => {
      console.log(`   - ${issue}`)
    })
    results.issues.push(...results.entryFile.issues)
  }

  // 模拟依赖检查
  console.log('\n📦 检查依赖状态...')
  results.dependencies = simulateDependencyCheck(
    project.path,
    results.packageJson.packageJson
  )
  if (results.dependencies.valid) {
    console.log('✅ 依赖状态正常')
  } else {
    console.log('⚠️  依赖状态:')
    results.dependencies.issues.forEach(issue => {
      console.log(`   - ${issue}`)
    })
    // 依赖问题不算致命错误，只是警告
  }

  // 模拟启动检查
  console.log('\n🚀 模拟启动检查...')
  const canStart =
    results.filesExist &&
    results.packageJson.valid &&
    results.viteConfig.valid &&
    results.entryFile.valid

  if (canStart) {
    console.log('✅ 项目可以启动')
    console.log(`💡 启动命令: cd ${project.path} && npm run dev`)
    console.log(`🌐 访问地址: http://localhost:${project.port}`)
  } else {
    console.log('❌ 项目无法启动，需要修复上述问题')
  }

  return {
    project: project.name,
    canStart,
    issues: results.issues,
    hasNodeModules: results.dependencies?.hasNodeModules || false,
  }
}

// 生成测试报告
function generateReport(results) {
  console.log('\n' + '='.repeat(60))
  console.log('📊 模拟开发服务器测试报告')
  console.log('='.repeat(60))

  const canStartProjects = results.filter(r => r.canStart)
  const hasIssuesProjects = results.filter(r => r.issues.length > 0)

  console.log(`✅ 可以启动的项目: ${canStartProjects.length}/${results.length}`)
  console.log(`⚠️  有问题的项目: ${hasIssuesProjects.length}/${results.length}`)

  if (canStartProjects.length > 0) {
    console.log('\n✅ 可以启动的项目:')
    canStartProjects.forEach(result => {
      console.log(`  - ${result.project}`)
    })
  }

  if (hasIssuesProjects.length > 0) {
    console.log('\n⚠️  需要注意的问题:')
    hasIssuesProjects.forEach(result => {
      if (result.issues.length > 0) {
        console.log(`\n${result.project}:`)
        result.issues.forEach(issue => {
          console.log(`  - ${issue}`)
        })
      }
    })
  }

  console.log('\n💡 启动建议:')
  results.forEach(result => {
    if (result.canStart) {
      if (!result.hasNodeModules) {
        console.log(`📦 ${result.project}: 先运行 npm install 安装依赖`)
      }
      console.log(`🚀 ${result.project}: npm run dev`)
    } else {
      console.log(`🔧 ${result.project}: 需要修复配置问题`)
    }
  })

  console.log('\n' + '='.repeat(60))

  return canStartProjects.length === results.length
}

// 主函数
function main() {
  const results = []

  for (const project of projects) {
    const result = testProject(project)
    results.push(result)
  }

  const allCanStart = generateReport(results)

  if (allCanStart) {
    console.log('🎉 所有项目配置正确，可以启动开发服务器！')
  } else {
    console.log('⚠️  部分项目需要修复配置问题。')
  }

  return allCanStart
}

// 运行测试
const success = main()
process.exit(success ? 0 : 1)
