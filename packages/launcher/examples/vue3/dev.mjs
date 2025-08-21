import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs/promises'
import { createProject, startDev, stopDev } from '../../dist/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectDir = path.resolve(__dirname, 'app-vue3')

async function main() {
  console.log('[vue3] 准备项目:', projectDir)
  await fs.mkdir(projectDir, { recursive: true })
  await createProject(projectDir, 'vue3', { force: true })

  console.log('[vue3] 启动开发服务器...')
  const server = await startDev(projectDir, { port: 5173, open: false })
  const port = server?.config?.server?.port
  console.log(`[vue3] 开发服务器已启动: http://localhost:${port}`)

  // 按 Ctrl+C 退出时优雅关闭
  process.on('SIGINT', async () => {
    console.log('\n[vue3] 捕获 SIGINT，正在关闭服务器...')
    try {
      await stopDev()
    } finally {
      process.exit(0)
    }
  })
}

main().catch((err) => {
  console.error('[vue3] 启动失败:', err)
  process.exit(1)
})
