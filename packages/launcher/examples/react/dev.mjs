import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs/promises'
import { createProject, startDev, stopDev } from '../../dist/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectDir = path.resolve(__dirname, 'app-react')

async function main() {
  console.log('[react] 准备项目:', projectDir)
  await fs.mkdir(projectDir, { recursive: true })
  await createProject(projectDir, 'react', { force: true })

  console.log('[react] 启动开发服务器...')
  const server = await startDev(projectDir, { port: 5174, open: false })
  const port = server?.config?.server?.port
  console.log(`[react] 开发服务器已启动: http://localhost:${port}`)

  process.on('SIGINT', async () => {
    console.log('\n[react] 捕获 SIGINT，正在关闭服务器...')
    try {
      await stopDev()
    } finally {
      process.exit(0)
    }
  })
}

main().catch((err) => {
  console.error('[react] 启动失败:', err)
  process.exit(1)
})
