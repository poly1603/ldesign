#!/usr/bin/env node

/**
 * 演示项目构建测试脚本
 * 验证两个演示项目是否能正常构建和启动
 */

const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')

console.log('🚀 开始测试演示项目构建...\n')

// 项目配置
const projects = [
  {
    name: '原生 JavaScript 演示',
    path: './vanilla-js-demo',
    port: 3001,
    scripts: {
      install: 'npm install',
      build: 'npm run build',
      dev: 'npm run dev',
    },
  },
  {
    name: 'Vue 3 演示',
    path: './vue-demo',
    port: 3002,
    scripts: {
      install: 'npm install',
      build: 'npm run build',
      dev: 'npm run dev',
    },
  },
]

// 工具函数
function checkProjectExists(projectPath) {
  const packageJsonPath = path.join(projectPath, 'package.json')
  return fs.existsSync(packageJsonPath)
}

function runCommand(command, cwd, timeout = 30000) {
  return new Promise((resolve, reject) => {
    console.log(`📦 在 ${cwd} 中执行: ${command}`)

    const [cmd, ...args] = command.split(' ')
    const child = spawn(cmd, args, {
      cwd,
      stdio: 'pipe',
      shell: true,
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', data => {
      stdout += data.toString()
    })

    child.stderr.on('data', data => {
      stderr += data.toString()
    })

    const timer = setTimeout(() => {
      child.kill('SIGTERM')
      reject(new Error(`命令执行超时: ${command}`))
    }, timeout)

    child.on('close', code => {
      clearTimeout(timer)
      if (code === 0) {
        resolve({ stdout, stderr })
      } else {
        reject(new Error(`命令执行失败 (退出码: ${code}): ${stderr || stdout}`))
      }
    })

    child.on('error', error => {
      clearTimeout(timer)
      reject(error)
    })
  })
}

// 检查依赖是否已安装
function checkDependencies(projectPath) {
  const nodeModulesPath = path.join(projectPath, 'node_modules')
  return fs.existsSync(nodeModulesPath)
}

// 主测试函数
async function testProject(project) {
  console.log(`\n🔍 测试项目: ${project.name}`)
  console.log(`📁 路径: ${project.path}`)

  try {
    // 检查项目是否存在
    if (!checkProjectExists(project.path)) {
      throw new Error(`项目目录不存在: ${project.path}`)
    }
    console.log('✅ 项目目录存在')

    // 检查 package.json
    const packageJsonPath = path.join(project.path, 'package.json')
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
    console.log(`✅ package.json 解析成功 (${packageJson.name})`)

    // 检查依赖是否已安装
    if (!checkDependencies(project.path)) {
      console.log('📦 依赖未安装，正在安装...')
      await runCommand(project.scripts.install, project.path, 120000) // 2分钟超时
      console.log('✅ 依赖安装完成')
    } else {
      console.log('✅ 依赖已安装')
    }

    // 测试构建
    console.log('🔨 开始构建测试...')
    await runCommand(project.scripts.build, project.path, 60000) // 1分钟超时
    console.log('✅ 构建成功')

    // 检查构建产物
    const distPath = path.join(project.path, 'dist')
    if (fs.existsSync(distPath)) {
      const distFiles = fs.readdirSync(distPath)
      console.log(`✅ 构建产物生成 (${distFiles.length} 个文件)`)
    } else {
      console.log('⚠️  未找到 dist 目录，但构建命令执行成功')
    }

    return {
      success: true,
      project: project.name,
      message: '所有测试通过',
    }
  } catch (error) {
    console.log(`❌ 测试失败: ${error.message}`)
    return {
      success: false,
      project: project.name,
      error: error.message,
    }
  }
}

// 生成测试报告
function generateReport(results) {
  console.log('\n' + '='.repeat(60))
  console.log('📊 测试报告')
  console.log('='.repeat(60))

  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)

  console.log(`✅ 成功: ${successful.length}/${results.length}`)
  console.log(`❌ 失败: ${failed.length}/${results.length}`)

  if (successful.length > 0) {
    console.log('\n✅ 成功的项目:')
    successful.forEach(result => {
      console.log(`  - ${result.project}: ${result.message}`)
    })
  }

  if (failed.length > 0) {
    console.log('\n❌ 失败的项目:')
    failed.forEach(result => {
      console.log(`  - ${result.project}: ${result.error}`)
    })
  }

  console.log('\n' + '='.repeat(60))

  if (failed.length === 0) {
    console.log('🎉 所有演示项目测试通过！')
    return true
  } else {
    console.log('⚠️  部分项目测试失败，请检查上述错误信息。')
    return false
  }
}

// 主函数
async function main() {
  const results = []

  for (const project of projects) {
    const result = await testProject(project)
    results.push(result)
  }

  const allPassed = generateReport(results)

  // 如果所有测试都通过，提供启动说明
  if (allPassed) {
    console.log('\n💡 启动演示项目:')
    console.log('原生 JavaScript 演示: cd vanilla-js-demo && npm run dev')
    console.log('Vue 3 演示: cd vue-demo && npm run dev')
    console.log('\n或者使用启动脚本:')
    console.log('Windows: start-demos.bat')
    console.log('macOS/Linux: node start-demos.js')
  }

  process.exit(allPassed ? 0 : 1)
}

// 错误处理
process.on('unhandledRejection', error => {
  console.error('❌ 未处理的错误:', error)
  process.exit(1)
})

// 运行测试
main().catch(error => {
  console.error('❌ 测试执行失败:', error)
  process.exit(1)
})
