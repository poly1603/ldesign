#!/usr/bin/env node

/**
 * 开发脚本
 * 用于启动开发环境
 */

import { spawn } from 'child_process'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const projectRoot = resolve(__dirname, '..')
const webDir = resolve(projectRoot, 'src/web')

console.log('🚀 启动 LDesign CLI 开发环境...')
console.log(`📁 项目根目录: ${projectRoot}`)
console.log(`🌐 Web 目录: ${webDir}`)

/**
 * 启动前端开发服务器
 */
function startWebDev() {
  return new Promise((resolve, reject) => {
    console.log('\n📦 启动前端开发服务器...')
    
    if (!existsSync(resolve(webDir, 'package.json'))) {
      console.log('⚠️  前端 package.json 不存在，跳过前端开发服务器')
      resolve(null)
      return
    }

    const webDev = spawn('pnpm', ['dev'], {
      cwd: webDir,
      stdio: 'inherit',
      shell: true
    })

    webDev.on('error', (error) => {
      console.error('❌ 前端开发服务器启动失败:', error)
      reject(error)
    })

    // 给前端服务器一些时间启动
    setTimeout(() => {
      console.log('✅ 前端开发服务器已启动')
      resolve(webDev)
    }, 3000)
  })
}

/**
 * 启动 CLI 开发服务器
 */
function startCliDev() {
  return new Promise((resolve, reject) => {
    console.log('\n🔧 启动 CLI 开发服务器...')
    
    const cliDev = spawn('tsx', ['src/index.ts', 'ui', '--debug'], {
      cwd: projectRoot,
      stdio: 'inherit',
      shell: true
    })

    cliDev.on('error', (error) => {
      console.error('❌ CLI 开发服务器启动失败:', error)
      reject(error)
    })

    cliDev.on('close', (code) => {
      console.log(`🔧 CLI 开发服务器已退出，退出码: ${code}`)
    })

    // 给 CLI 服务器一些时间启动
    setTimeout(() => {
      console.log('✅ CLI 开发服务器已启动')
      resolve(cliDev)
    }, 2000)
  })
}

/**
 * 主函数
 */
async function main() {
  try {
    // 检查依赖
    console.log('\n🔍 检查依赖...')
    
    const checkDeps = spawn('pnpm', ['install'], {
      cwd: projectRoot,
      stdio: 'inherit',
      shell: true
    })

    await new Promise((resolve, reject) => {
      checkDeps.on('close', (code) => {
        if (code === 0) {
          console.log('✅ 依赖检查完成')
          resolve(null)
        } else {
          reject(new Error(`依赖安装失败，退出码: ${code}`))
        }
      })
    })

    // 启动服务
    const processes = []

    // 启动前端开发服务器（如果存在）
    try {
      const webProcess = await startWebDev()
      if (webProcess) {
        processes.push(webProcess)
      }
    } catch (error) {
      console.warn('⚠️  前端开发服务器启动失败，继续启动 CLI 服务器')
    }

    // 启动 CLI 开发服务器
    const cliProcess = await startCliDev()
    processes.push(cliProcess)

    console.log('\n🎉 开发环境已启动！')
    console.log('📝 使用说明:')
    console.log('  - CLI 服务器: http://localhost:3000')
    console.log('  - 前端开发服务器: http://localhost:3001 (如果启动)')
    console.log('  - 按 Ctrl+C 停止所有服务')

    // 处理进程退出
    const cleanup = () => {
      console.log('\n🛑 正在停止所有服务...')
      processes.forEach(proc => {
        if (proc && !proc.killed) {
          try {
            if (process.platform === 'win32') {
              // Windows 下使用 taskkill 强制终止进程树
              spawn('taskkill', ['/pid', proc.pid.toString(), '/f', '/t'], { shell: true })
            } else {
              // Unix/Linux 下发送 SIGTERM
              proc.kill('SIGTERM')
            }
          } catch (error) {
            console.error(`停止进程失败 (PID: ${proc.pid}):`, error.message)
          }
        }
      })
      
      // 等待进程终止
      setTimeout(() => {
        console.log('✅ 所有服务已停止')
        process.exit(0)
      }, 1000)
    }

    // 处理各种终止信号
    process.on('SIGINT', cleanup)
    process.on('SIGTERM', cleanup)
    process.on('SIGQUIT', cleanup)
    
    // Windows 特殊处理
    if (process.platform === 'win32') {
      process.on('SIGBREAK', cleanup)
      
      // 启用原始模式以正确捕获 Ctrl+C
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(true)
        process.stdin.on('data', (data) => {
          // Ctrl+C 的字节码是 3
          if (data[0] === 3) {
            cleanup()
          }
        })
      }
    }

    // 等待所有进程结束
    await Promise.all(
      processes.map(proc => 
        new Promise(resolve => {
          if (proc) {
            proc.on('close', resolve)
          } else {
            resolve(null)
          }
        })
      )
    )

  } catch (error) {
    console.error('❌ 开发环境启动失败:', error)
    process.exit(1)
  }
}

// 运行主函数
main().catch(error => {
  console.error('❌ 未处理的错误:', error)
  process.exit(1)
})
