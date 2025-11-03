/**
 * 测试可编程 API
 * 
 * 使用方法:
 * pnpm tsx tools/test-programmatic-api.ts [dev|prod]
 */

import { startDevServer, startProdServer } from './server/src/programmatic'
import { startDevUI, startProdUI } from './web/src/programmatic'

const mode = process.argv[2] || 'dev'

async function test() {
  console.log(`\n🧪 测试 ${mode} 模式的可编程 API...\n`)

  let serverInstance: any = null
  let uiInstance: any = null

  const cleanup = async () => {
    console.log('\n🧹 清理资源...')
    if (uiInstance) {
      await uiInstance.stop()
    }
    if (serverInstance) {
      await serverInstance.stop()
    }
    console.log('✅ 清理完成')
    process.exit(0)
  }

  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)

  try {
    // 1. 启动服务器
    console.log(`📦 启动 ${mode} 模式服务器...`)
    if (mode === 'dev') {
      serverInstance = await startDevServer({
        port: 3000,
        host: '127.0.0.1',
        silent: false,
      })
    } else {
      serverInstance = await startProdServer({
        port: 3000,
        host: '127.0.0.1',
        silent: false,
      })
    }
    console.log(`✅ 服务器启动成功: http://${serverInstance.getHost()}:${serverInstance.getPort()}\n`)

    // 2. 启动前端
    console.log(`📦 启动 ${mode} 模式前端...`)
    if (mode === 'dev') {
      uiInstance = await startDevUI({
        port: 5173,
        host: '0.0.0.0',
        open: false,
        silent: false,
      })
    } else {
      uiInstance = await startProdUI({
        port: 5173,
        host: '0.0.0.0',
        open: false,
        silent: false,
      })
    }
    console.log(`✅ 前端启动成功: ${uiInstance.getUrl()}\n`)

    // 3. 显示信息
    console.log('🎉 所有服务已启动！')
    console.log('━'.repeat(50))
    console.log(`📍 前端地址: ${uiInstance.getUrl()}`)
    console.log(`📍 后端地址: http://${serverInstance.getHost()}:${serverInstance.getPort()}`)
    console.log(`📍 API 地址:  http://${serverInstance.getHost()}:${serverInstance.getPort()}/api`)
    console.log('━'.repeat(50))
    console.log('\n💡 按 Ctrl+C 停止所有服务\n')

    // 保持运行
    await new Promise(() => {})

  } catch (error) {
    console.error('❌ 测试失败:', error)
    await cleanup()
    process.exit(1)
  }
}

test()

