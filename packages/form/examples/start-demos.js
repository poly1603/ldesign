#!/usr/bin/env node

const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')

console.log('🚀 启动 @ldesign/form 演示项目...\n')

// 检查项目目录
const vanillaDir = path.join(__dirname, 'vanilla-js-demo')
const vueDir = path.join(__dirname, 'vue-demo')

if (!fs.existsSync(vanillaDir)) {
  console.error('❌ 原生 JavaScript 演示项目目录不存在')
  process.exit(1)
}

if (!fs.existsSync(vueDir)) {
  console.error('❌ Vue 3 演示项目目录不存在')
  process.exit(1)
}

// 检查依赖是否已安装
const checkDependencies = (dir, name) => {
  const nodeModulesPath = path.join(dir, 'node_modules')
  if (!fs.existsSync(nodeModulesPath)) {
    console.log(`📦 ${name} 项目依赖未安装，正在安装...`)
    return false
  }
  return true
}

const vanillaDepsInstalled = checkDependencies(vanillaDir, '原生 JavaScript')
const vueDepsInstalled = checkDependencies(vueDir, 'Vue 3')

// 安装依赖的函数
const installDependencies = (dir, name) => {
  return new Promise((resolve, reject) => {
    console.log(`📦 正在安装 ${name} 项目依赖...`)

    const npm = spawn('npm', ['install'], {
      cwd: dir,
      stdio: 'pipe',
      shell: true,
    })

    npm.stdout.on('data', data => {
      process.stdout.write(`[${name}] ${data}`)
    })

    npm.stderr.on('data', data => {
      process.stderr.write(`[${name}] ${data}`)
    })

    npm.on('close', code => {
      if (code === 0) {
        console.log(`✅ ${name} 项目依赖安装完成`)
        resolve()
      } else {
        console.error(`❌ ${name} 项目依赖安装失败`)
        reject(new Error(`依赖安装失败，退出码: ${code}`))
      }
    })
  })
}

// 启动开发服务器的函数
const startDevServer = (dir, name, port) => {
  console.log(`🚀 启动 ${name} 开发服务器 (端口: ${port})...`)

  const npm = spawn('npm', ['run', 'dev'], {
    cwd: dir,
    stdio: 'pipe',
    shell: true,
  })

  npm.stdout.on('data', data => {
    const output = data.toString()
    if (output.includes('Local:') || output.includes('localhost')) {
      console.log(`✅ ${name} 服务器已启动: http://localhost:${port}`)
    }
    process.stdout.write(`[${name}] ${data}`)
  })

  npm.stderr.on('data', data => {
    process.stderr.write(`[${name}] ${data}`)
  })

  npm.on('close', code => {
    console.log(`${name} 服务器已停止 (退出码: ${code})`)
  })

  return npm
}

// 主函数
async function main() {
  try {
    // 安装缺失的依赖
    if (!vanillaDepsInstalled) {
      await installDependencies(vanillaDir, '原生 JavaScript')
    }

    if (!vueDepsInstalled) {
      await installDependencies(vueDir, 'Vue 3')
    }

    console.log('\n🎉 所有依赖已安装完成，正在启动开发服务器...\n')

    // 启动开发服务器
    const vanillaServer = startDevServer(vanillaDir, '原生 JavaScript', 3001)
    const vueServer = startDevServer(vueDir, 'Vue 3', 3002)

    // 显示启动信息
    setTimeout(() => {
      console.log('\n' + '='.repeat(60))
      console.log('🎉 @ldesign/form 演示项目已启动！')
      console.log('='.repeat(60))
      console.log('📱 原生 JavaScript 演示: http://localhost:3001')
      console.log('🖥️  Vue 3 演示:           http://localhost:3002')
      console.log('='.repeat(60))
      console.log('💡 提示:')
      console.log('   - 按 Ctrl+C 停止所有服务器')
      console.log('   - 修改代码后会自动热重载')
      console.log('   - 查看控制台输出了解更多信息')
      console.log('='.repeat(60) + '\n')
    }, 3000)

    // 处理退出信号
    process.on('SIGINT', () => {
      console.log('\n🛑 正在停止所有服务器...')
      vanillaServer.kill('SIGINT')
      vueServer.kill('SIGINT')
      setTimeout(() => {
        console.log('👋 所有服务器已停止，再见！')
        process.exit(0)
      }, 1000)
    })

    process.on('SIGTERM', () => {
      vanillaServer.kill('SIGTERM')
      vueServer.kill('SIGTERM')
      process.exit(0)
    })
  } catch (error) {
    console.error('❌ 启动失败:', error.message)
    process.exit(1)
  }
}

// 显示帮助信息
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
@ldesign/form 演示项目启动器

用法:
  node start-demos.js          启动所有演示项目
  node start-demos.js --help   显示帮助信息

项目说明:
  - 原生 JavaScript 演示: 展示在纯 JS 环境中的使用方法
  - Vue 3 演示: 展示在 Vue 3 + TypeScript 环境中的使用方法

端口分配:
  - 原生 JavaScript: http://localhost:3001
  - Vue 3: http://localhost:3002

注意事项:
  - 确保端口 3001 和 3002 未被占用
  - 首次运行会自动安装依赖
  - 使用 Ctrl+C 停止所有服务器
`)
  process.exit(0)
}

// 运行主函数
main().catch(error => {
  console.error('❌ 未处理的错误:', error)
  process.exit(1)
})
