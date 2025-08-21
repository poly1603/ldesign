import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs/promises'
import { createProject, buildProject } from '../../dist/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectDir = path.resolve(__dirname, 'app-react')

async function main() {
  console.log('[react] 准备项目:', projectDir)
  await fs.mkdir(projectDir, { recursive: true })
  await createProject(projectDir, 'react', { force: true })

  console.log('[react] 开始构建...')
  const result = await buildProject(projectDir, { outDir: 'dist', minify: true })

  if (result.success) {
    console.log('[react] 构建成功!')
    console.log(' - 输出文件数:', result.outputFiles.length)
    console.log(' - 耗时(ms):', result.duration)
    console.log(' - 体积(bytes):', result.size)
  } else {
    console.error('[react] 构建失败:')
    for (const e of result.errors || []) console.error(' -', e)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('[react] 构建出错:', err)
  process.exit(1)
})
