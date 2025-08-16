#!/usr/bin/env tsx

/**
 * 测试脚本：验证 built 和 source 两种模式都能正常启动
 */

import { spawn } from 'child_process'
import { setTimeout } from 'timers/promises'

interface TestResult {
  mode: string
  success: boolean
  port?: number
  error?: string
  startTime: number
  endTime?: number
}

async function testMode(mode: 'built' | 'source-simple', expectedPort: number): Promise<TestResult> {
  const result: TestResult = {
    mode,
    success: false,
    startTime: Date.now(),
  }

  return new Promise((resolve) => {
    console.log(`🧪 测试 ${mode} 模式...`)
    
    const command = mode === 'built' ? 'pnpm' : 'pnpm'
    const args = mode === 'built' ? ['dev:built'] : ['dev:source-simple']
    
    const child = spawn(command, args, {
      cwd: process.cwd(),
      stdio: 'pipe',
    })

    let output = ''
    let hasStarted = false

    // 设置超时
    const timeout = setTimeout(() => {
      if (!hasStarted) {
        child.kill()
        result.error = '启动超时'
        result.endTime = Date.now()
        resolve(result)
      }
    }, 30000) // 30秒超时

    child.stdout?.on('data', (data) => {
      output += data.toString()
      console.log(`[${mode}] ${data.toString().trim()}`)
      
      // 检查是否启动成功
      if (output.includes('ready in') && output.includes(`localhost:${expectedPort}`)) {
        hasStarted = true
        result.success = true
        result.port = expectedPort
        result.endTime = Date.now()
        
        clearTimeout(timeout)
        child.kill()
        
        console.log(`✅ ${mode} 模式启动成功！端口: ${expectedPort}`)
        resolve(result)
      }
    })

    child.stderr?.on('data', (data) => {
      const errorMsg = data.toString()
      console.error(`[${mode} ERROR] ${errorMsg.trim()}`)
      
      if (errorMsg.includes('Error') || errorMsg.includes('Failed')) {
        result.error = errorMsg.trim()
        result.endTime = Date.now()
        clearTimeout(timeout)
        child.kill()
        resolve(result)
      }
    })

    child.on('close', (code) => {
      if (!hasStarted && !result.error) {
        result.error = `进程退出，代码: ${code}`
        result.endTime = Date.now()
        resolve(result)
      }
    })
  })
}

async function main() {
  console.log('🚀 开始测试 LDesign 双模式启动...\n')

  const results: TestResult[] = []

  // 测试 source-simple 模式
  console.log('=' .repeat(50))
  const sourceResult = await testMode('source-simple', 3003)
  results.push(sourceResult)
  
  // 等待一下再测试下一个模式
  await setTimeout(2000)
  
  // 测试 built 模式
  console.log('=' .repeat(50))
  const builtResult = await testMode('built', 3001)
  results.push(builtResult)

  // 输出测试报告
  console.log('\n' + '=' .repeat(50))
  console.log('📊 测试报告')
  console.log('=' .repeat(50))

  results.forEach((result) => {
    const duration = result.endTime ? result.endTime - result.startTime : 0
    const status = result.success ? '✅ 成功' : '❌ 失败'
    
    console.log(`\n🔧 ${result.mode.toUpperCase()} 模式:`)
    console.log(`   状态: ${status}`)
    console.log(`   端口: ${result.port || '未知'}`)
    console.log(`   耗时: ${duration}ms`)
    
    if (result.error) {
      console.log(`   错误: ${result.error}`)
    }
  })

  const successCount = results.filter(r => r.success).length
  const totalCount = results.length

  console.log(`\n🎯 总结: ${successCount}/${totalCount} 个模式启动成功`)
  
  if (successCount === totalCount) {
    console.log('🎉 所有模式都启动成功！LDesign 双环境开发配置正常。')
    process.exit(0)
  } else {
    console.log('⚠️  部分模式启动失败，需要进一步调试。')
    process.exit(1)
  }
}

// 运行测试
main().catch((error) => {
  console.error('❌ 测试脚本执行失败:', error)
  process.exit(1)
})
