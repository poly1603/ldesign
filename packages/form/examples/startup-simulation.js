#!/usr/bin/env node

/**
 * 启动模拟脚本
 * 模拟 npm run dev 的执行过程，验证项目是否能正常启动
 */

const fs = require('fs')
const path = require('path')

console.log('🚀 模拟演示项目启动过程...\n')

// 模拟启动步骤
const startupSteps = [
  '检查项目配置',
  '验证依赖关系',
  '解析入口文件',
  '编译 TypeScript',
  '处理 Vue 组件',
  '加载样式文件',
  '启动开发服务器',
  '打开浏览器',
]

// 项目配置
const projects = [
  {
    name: '原生 JavaScript 演示',
    path: './vanilla-js-demo',
    port: 3001,
    type: 'vanilla',
    entryFile: 'src/main.js',
    configFile: 'vite.config.js',
  },
  {
    name: 'Vue 3 演示',
    path: './vue-demo',
    port: 3002,
    type: 'vue',
    entryFile: 'src/main.ts',
    configFile: 'vite.config.ts',
  },
]

// 模拟延迟
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 模拟进度条
function showProgress(step, total) {
  const percentage = Math.round((step / total) * 100)
  const filled = Math.round(percentage / 5)
  const empty = 20 - filled
  const bar = '█'.repeat(filled) + '░'.repeat(empty)
  return `[${bar}] ${percentage}%`
}

// 检查文件是否存在
function checkFile(filePath) {
  return fs.existsSync(filePath)
}

// 模拟文件解析
function simulateFileParsing(filePath, fileType) {
  const issues = []

  try {
    const content = fs.readFileSync(filePath, 'utf8')

    switch (fileType) {
      case 'package.json':
        const pkg = JSON.parse(content)
        if (!pkg.scripts?.dev) issues.push('缺少 dev 脚本')
        if (!pkg.name) issues.push('缺少项目名称')
        break

      case 'vite.config':
        if (!content.includes('defineConfig')) issues.push('缺少 defineConfig')
        if (!content.includes('server')) issues.push('缺少服务器配置')
        break

      case 'entry':
        if (!content.includes('import')) issues.push('缺少导入语句')
        break

      case 'vue':
        if (!content.includes('<template>')) issues.push('缺少模板')
        if (!content.includes('<script')) issues.push('缺少脚本')
        break
    }

    return { success: issues.length === 0, issues }
  } catch (error) {
    return { success: false, issues: [`文件解析失败: ${error.message}`] }
  }
}

// 模拟依赖检查
function simulateDependencyCheck(projectPath, projectType) {
  const packageJsonPath = path.join(projectPath, 'package.json')
  const nodeModulesPath = path.join(projectPath, 'node_modules')

  const issues = []

  // 检查 package.json
  if (!checkFile(packageJsonPath)) {
    issues.push('package.json 不存在')
    return { success: false, issues }
  }

  // 检查 node_modules
  if (!checkFile(nodeModulesPath)) {
    issues.push('依赖未安装，需要运行 npm install')
  }

  // 检查关键依赖
  try {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies }

    if (!allDeps.vite) issues.push('缺少 vite 依赖')

    if (projectType === 'vue') {
      if (!allDeps.vue) issues.push('缺少 vue 依赖')
      if (!allDeps['@vitejs/plugin-vue']) issues.push('缺少 Vue 插件')
      if (!allDeps.typescript) issues.push('缺少 TypeScript')
    }
  } catch (error) {
    issues.push(`依赖检查失败: ${error.message}`)
  }

  return { success: issues.length === 0, issues }
}

// 模拟启动单个项目
async function simulateProjectStartup(project) {
  console.log(`\n🔍 模拟启动: ${project.name}`)
  console.log(`📁 路径: ${project.path}`)
  console.log(`🌐 端口: ${project.port}`)
  console.log(`📄 类型: ${project.type}`)

  const results = []

  for (let i = 0; i < startupSteps.length; i++) {
    const step = startupSteps[i]
    const progress = showProgress(i + 1, startupSteps.length)

    process.stdout.write(`\r${progress} ${step}...`)
    await delay(300) // 模拟处理时间

    let stepResult = { success: true, issues: [] }

    // 根据步骤执行不同的检查
    switch (step) {
      case '检查项目配置':
        const configPath = path.join(project.path, project.configFile)
        if (checkFile(configPath)) {
          stepResult = simulateFileParsing(configPath, 'vite.config')
        } else {
          stepResult = { success: false, issues: ['配置文件不存在'] }
        }
        break

      case '验证依赖关系':
        stepResult = simulateDependencyCheck(project.path, project.type)
        break

      case '解析入口文件':
        const entryPath = path.join(project.path, project.entryFile)
        if (checkFile(entryPath)) {
          stepResult = simulateFileParsing(entryPath, 'entry')
        } else {
          stepResult = { success: false, issues: ['入口文件不存在'] }
        }
        break

      case '编译 TypeScript':
        if (project.type === 'vue') {
          const tsconfigPath = path.join(project.path, 'tsconfig.json')
          if (!checkFile(tsconfigPath)) {
            stepResult = { success: false, issues: ['tsconfig.json 不存在'] }
          }
        }
        break

      case '处理 Vue 组件':
        if (project.type === 'vue') {
          const appPath = path.join(project.path, 'src/App.vue')
          if (checkFile(appPath)) {
            stepResult = simulateFileParsing(appPath, 'vue')
          } else {
            stepResult = { success: false, issues: ['App.vue 不存在'] }
          }
        }
        break

      case '加载样式文件':
        // 检查样式文件导入
        const entryContent = fs.readFileSync(
          path.join(project.path, project.entryFile),
          'utf8'
        )
        if (!entryContent.includes('.css')) {
          stepResult = { success: false, issues: ['缺少样式文件导入'] }
        }
        break

      case '启动开发服务器':
        // 检查端口配置
        const configContent = fs.readFileSync(
          path.join(project.path, project.configFile),
          'utf8'
        )
        if (!configContent.includes(`port: ${project.port}`)) {
          stepResult = { success: false, issues: ['端口配置不正确'] }
        }
        break

      case '打开浏览器':
        // 检查自动打开配置
        const configContent2 = fs.readFileSync(
          path.join(project.path, project.configFile),
          'utf8'
        )
        if (!configContent2.includes('open: true')) {
          stepResult = { success: false, issues: ['未配置自动打开浏览器'] }
        }
        break
    }

    results.push({ step, ...stepResult })

    if (!stepResult.success) {
      console.log(` ❌`)
      break
    } else {
      console.log(` ✅`)
    }
  }

  return {
    project: project.name,
    port: project.port,
    success: results.every(r => r.success),
    results,
  }
}

// 生成启动报告
function generateStartupReport(results) {
  console.log('\n' + '='.repeat(60))
  console.log('📊 启动模拟报告')
  console.log('='.repeat(60))

  const successfulProjects = results.filter(r => r.success)
  const failedProjects = results.filter(r => !r.success)

  console.log(`✅ 可以启动: ${successfulProjects.length}/${results.length}`)
  console.log(`❌ 启动失败: ${failedProjects.length}/${results.length}`)

  if (successfulProjects.length > 0) {
    console.log('\n🎉 可以启动的项目:')
    successfulProjects.forEach(result => {
      console.log(`  ✅ ${result.project} - http://localhost:${result.port}`)
    })
  }

  if (failedProjects.length > 0) {
    console.log('\n❌ 启动失败的项目:')
    failedProjects.forEach(result => {
      console.log(`\n${result.project}:`)
      const failedSteps = result.results.filter(r => !r.success)
      failedSteps.forEach(step => {
        console.log(`  ❌ ${step.step}:`)
        step.issues.forEach(issue => {
          console.log(`     - ${issue}`)
        })
      })
    })
  }

  console.log('\n💡 启动建议:')
  results.forEach(result => {
    if (result.success) {
      console.log(`🚀 ${result.project}:`)
      console.log(
        `   cd ${
          result.project.includes('JavaScript') ? 'vanilla-js-demo' : 'vue-demo'
        }`
      )
      console.log(`   npm install  # 如果依赖未安装`)
      console.log(`   npm run dev`)
      console.log(`   # 访问: http://localhost:${result.port}`)
    } else {
      console.log(`🔧 ${result.project}: 需要修复配置问题`)
    }
  })

  console.log('\n' + '='.repeat(60))

  return successfulProjects.length === results.length
}

// 主函数
async function main() {
  console.log('开始模拟启动过程...\n')

  const results = []

  for (const project of projects) {
    const result = await simulateProjectStartup(project)
    results.push(result)
  }

  const allSuccess = generateStartupReport(results)

  if (allSuccess) {
    console.log('🎉 所有项目都可以正常启动！')
    console.log('\n📝 实际启动命令:')
    console.log('Windows: start-demos.bat')
    console.log('macOS/Linux: node start-demos.js')
  } else {
    console.log('⚠️  部分项目需要修复问题才能启动。')
  }

  return allSuccess
}

// 运行模拟
main()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('❌ 模拟启动失败:', error)
    process.exit(1)
  })
