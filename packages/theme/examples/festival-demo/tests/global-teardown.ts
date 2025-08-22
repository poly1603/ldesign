/**
 * @ldesign/theme - Playwright 全局测试清理
 */

import { FullConfig } from '@playwright/test'
import { promises as fs } from 'fs'
import path from 'path'

async function globalTeardown(config: FullConfig) {
  console.log('🧹 开始全局测试清理...')

  try {
    // 清理测试结果目录中的临时文件
    const testResultsDir = path.resolve(process.cwd(), 'test-results')

    try {
      const files = await fs.readdir(testResultsDir)
      const tempFiles = files.filter(
        file =>
          file.startsWith('temp-') ||
          file.endsWith('.tmp') ||
          file.includes('screenshot-') ||
          file.includes('video-')
      )

      if (tempFiles.length > 0) {
        console.log(`🗑️  清理 ${tempFiles.length} 个临时文件...`)

        for (const file of tempFiles) {
          try {
            await fs.unlink(path.join(testResultsDir, file))
          } catch (error) {
            console.warn(`⚠️  无法删除文件 ${file}:`, error)
          }
        }
      }
    } catch (error) {
      // 测试结果目录可能不存在，这是正常的
      console.log('📁 测试结果目录不存在或为空')
    }

    // 生成测试报告摘要
    console.log('📊 生成测试报告摘要...')

    const summaryPath = path.join(testResultsDir, 'summary.json')
    const summary = {
      timestamp: new Date().toISOString(),
      testRun: {
        completed: true,
        duration: process.uptime(),
        environment: {
          node: process.version,
          platform: process.platform,
          arch: process.arch,
          ci: !!process.env.CI,
        },
      },
      cleanup: {
        tempFilesRemoved: true,
        timestamp: new Date().toISOString(),
      },
    }

    try {
      await fs.mkdir(testResultsDir, { recursive: true })
      await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2))
      console.log('✅ 测试报告摘要已生成')
    } catch (error) {
      console.warn('⚠️  无法生成测试报告摘要:', error)
    }

    // 输出测试统计信息
    console.log('📈 测试统计信息:')
    console.log(`   - 运行时间: ${Math.round(process.uptime())} 秒`)
    console.log(
      `   - 内存使用: ${Math.round(
        process.memoryUsage().heapUsed / 1024 / 1024
      )} MB`
    )
    console.log(`   - 平台: ${process.platform} ${process.arch}`)
    console.log(`   - Node.js: ${process.version}`)

    if (process.env.CI) {
      console.log('   - 环境: CI/CD')
    } else {
      console.log('   - 环境: 本地开发')
    }

    console.log('✅ 全局测试清理完成')
  } catch (error) {
    console.error('❌ 全局测试清理失败:', error)
    // 不抛出错误，避免影响测试结果
  }
}

export default globalTeardown
