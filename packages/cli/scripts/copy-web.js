/**
 * 复制 Web 构建产物到 dist 目录
 * 确保构建后的 CLI 包含完整的 Web 界面
 */

import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const sourceDir = join(__dirname, '../src/web/dist')
const targetDir = join(__dirname, '../dist/web')

/**
 * 递归复制目录
 */
function copyDirectory(src, dest) {
  // 确保目标目录存在
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true })
  }

  // 读取源目录内容
  const items = readdirSync(src)

  for (const item of items) {
    const srcPath = join(src, item)
    const destPath = join(dest, item)
    const stat = statSync(srcPath)

    if (stat.isDirectory()) {
      // 递归复制子目录
      copyDirectory(srcPath, destPath)
    } else {
      // 复制文件
      copyFileSync(srcPath, destPath)
      console.log(`📄 复制文件: ${item}`)
    }
  }
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 开始复制 Web 构建产物...')

  // 检查源目录是否存在
  if (!existsSync(sourceDir)) {
    console.error('❌ Web 构建产物不存在，请先运行 build:web')
    process.exit(1)
  }

  try {
    // 复制整个 dist 目录
    copyDirectory(sourceDir, targetDir)
    console.log('✅ Web 构建产物复制完成')
    console.log(`📁 目标目录: ${targetDir}`)
  } catch (error) {
    console.error('❌ 复制失败:', error.message)
    process.exit(1)
  }
}

// 执行主函数
main()
