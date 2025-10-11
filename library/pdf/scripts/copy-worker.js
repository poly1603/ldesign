import { copyFileSync, existsSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const rootDir = resolve(__dirname, '..')
const examplesDir = resolve(rootDir, 'examples')

// PDF.js worker文件源路径
const workerSrc = resolve(rootDir, 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs')

// 目标路径
const targets = [
  resolve(examplesDir, 'vanilla-demo/public/pdf.worker.min.mjs'),
  resolve(examplesDir, 'vue3-demo/public/pdf.worker.min.mjs')
]

function copyWorker() {
  if (!existsSync(workerSrc)) {
    console.error('Worker file not found. Please run: pnpm install')
    process.exit(1)
  }

  targets.forEach(target => {
    const targetDir = dirname(target)

    // 确保目录存在
    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true })
    }

    // 复制文件
    copyFileSync(workerSrc, target)
    console.log(`✓ Copied worker to ${target}`)
  })

  console.log('\n✓ Worker files copied successfully')
}

copyWorker()
