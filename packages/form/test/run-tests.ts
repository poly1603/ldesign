#!/usr/bin/env ts-node

/**
 * 测试运行脚本
 * 
 * 提供不同测试场景的快速运行入口
 */

import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { join } from 'path'

// 获取命令行参数
const args = process.argv.slice(2)
const command = args[0] || 'all'

// 基础配置
const packageRoot = join(__dirname, '..')
const testDir = join(packageRoot, 'test')

// 检查必要文件是否存在
function checkFiles() {
  const requiredFiles = [
    'vitest.config.ts',
    'test/setup.ts'
  ]

  for (const file of requiredFiles) {
    const filePath = join(packageRoot, file)
    if (!existsSync(filePath)) {
      console.error(`❌ 必需文件不存在: ${file}`)
      process.exit(1)
    }
  }

  console.log('✅ 所有必需文件检查通过')
}

// 运行测试的基础命令
function runVitest(options: string[] = []) {
  const cmd = ['npx', 'vitest', ...options].join(' ')
  console.log(`🚀 执行命令: ${cmd}`)
  
  try {
    execSync(cmd, { 
      cwd: packageRoot,
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'test' }
    })
  } catch (error) {
    console.error('❌ 测试执行失败')
    process.exit(1)
  }
}

// 不同的测试模式
const testModes = {
  // 运行所有测试
  all: () => {
    console.log('🧪 运行所有测试...')
    runVitest(['run'])
  },

  // 监听模式
  watch: () => {
    console.log('👀 启动测试监听模式...')
    runVitest(['watch'])
  },

  // 生成覆盖率报告
  coverage: () => {
    console.log('📊 生成测试覆盖率报告...')
    runVitest(['run', '--coverage'])
  },

  // 只运行基础功能测试
  basic: () => {
    console.log('🔧 运行基础功能测试...')
    runVitest(['run', 'test/basic.test.ts'])
  },

  // 只运行集成测试
  integration: () => {
    console.log('🔗 运行集成测试...')
    runVitest(['run', 'test/integration.test.ts'])
  },

  // 只运行边界情况测试
  edge: () => {
    console.log('⚠️ 运行边界情况测试...')
    runVitest(['run', 'test/edge-cases.test.ts'])
  },

  // UI模式
  ui: () => {
    console.log('🎨 启动测试UI界面...')
    runVitest(['--ui'])
  },

  // 静默模式
  silent: () => {
    console.log('🤫 静默运行测试...')
    runVitest(['run', '--silent'])
  },

  // 详细模式
  verbose: () => {
    console.log('📝 详细模式运行测试...')
    runVitest(['run', '--verbose'])
  },

  // 并发测试
  parallel: () => {
    console.log('⚡ 并发运行测试...')
    runVitest(['run', '--threads'])
  },

  // 单次运行（不缓存）
  no_cache: () => {
    console.log('🔄 无缓存运行测试...')
    runVitest(['run', '--no-cache'])
  },

  // 性能测试
  benchmark: () => {
    console.log('🏃‍♂️ 运行性能基准测试...')
    runVitest(['bench'])
  },

  // 帮助信息
  help: () => {
    console.log(`
📋 可用的测试命令:

  all         - 运行所有测试 (默认)
  watch       - 监听模式运行测试
  coverage    - 生成测试覆盖率报告
  basic       - 只运行基础功能测试
  integration - 只运行集成测试
  edge        - 只运行边界情况测试
  ui          - 启动测试UI界面
  silent      - 静默运行测试
  verbose     - 详细模式运行测试
  parallel    - 并发运行测试
  no_cache    - 无缓存运行测试
  benchmark   - 运行性能基准测试
  help        - 显示此帮助信息

📖 使用示例:
  npm run test              # 运行所有测试
  npm run test:watch        # 监听模式
  npm run test:coverage     # 生成覆盖率报告
  ts-node test/run-tests.ts basic     # 只运行基础测试
  ts-node test/run-tests.ts ui        # 启动UI界面
`)
  }
}

// 主执行函数
function main() {
  console.log('🔍 检查测试环境...')
  checkFiles()

  const mode = testModes[command as keyof typeof testModes]
  
  if (!mode) {
    console.error(`❌ 未知命令: ${command}`)
    console.log('💡 使用 "help" 查看可用命令')
    process.exit(1)
  }

  mode()
  console.log('✅ 测试完成!')
}

// 错误处理
process.on('uncaughtException', (error) => {
  console.error('💥 未捕获的异常:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  console.error('💥 未处理的 Promise 拒绝:', reason)
  process.exit(1)
})

// 执行主函数
main()
