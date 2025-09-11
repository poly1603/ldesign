/**
 * BuildCleaner 使用示例
 * 
 * 展示如何使用构建前清理功能的各种配置和用法
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import { BuildCleaner, type CleanerConfig } from '../src/utils/build-cleaner'
import { Logger } from '../src/utils/logger'
import type { BuilderConfig } from '../src/types/config'

// 创建日志记录器
const logger = new Logger()

/**
 * 示例1：基本使用
 */
async function basicUsage() {
  console.log('=== 基本使用示例 ===')
  
  // 使用默认配置创建清理器
  const cleaner = new BuildCleaner()
  
  // 执行清理
  const result = await cleaner.clean(process.cwd())
  
  if (result.success) {
    console.log(`✅ 清理成功！`)
    console.log(`📁 删除目录: ${result.dirsRemoved} 个`)
    console.log(`📄 删除文件: ${result.filesRemoved} 个`)
    console.log(`💾 释放空间: ${formatBytes(result.spaceFreed)}`)
    console.log(`⏱️  耗时: ${result.duration}ms`)
  } else {
    console.log(`❌ 清理失败:`, result.errors)
  }
}

/**
 * 示例2：自定义配置
 */
async function customConfigUsage() {
  console.log('\n=== 自定义配置示例 ===')
  
  const customConfig: Partial<CleanerConfig> = {
    enabled: true,
    verbose: true,
    safeMode: true,
    outputDirs: ['dist', 'build', 'lib', 'es', 'cjs'],
    tempFilePatterns: [
      '**/.DS_Store',
      '**/Thumbs.db',
      '**/*.log',
      '**/*.tmp',
      '**/coverage/**',
      '**/.nyc_output/**'
    ],
    protectedPaths: [
      'node_modules',
      '.git',
      'src',
      'docs',
      'examples'
    ],
    customRules: [
      {
        name: '清理旧的备份文件',
        pattern: '**/*.backup',
        recursive: true
      },
      {
        name: '清理测试产物',
        pattern: '**/*.test.js.map',
        condition: (filePath: string) => {
          // 只清理超过7天的测试产物
          const stats = require('fs').statSync(filePath)
          const daysDiff = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24)
          return daysDiff > 7
        }
      }
    ]
  }
  
  const cleaner = new BuildCleaner(customConfig, logger)
  const result = await cleaner.clean(process.cwd())
  
  console.log('清理结果:', {
    success: result.success,
    filesRemoved: result.filesRemoved,
    dirsRemoved: result.dirsRemoved,
    spaceFreed: formatBytes(result.spaceFreed),
    duration: `${result.duration}ms`,
    errors: result.errors,
    warnings: result.warnings
  })
}

/**
 * 示例3：从构建器配置创建
 */
async function fromBuilderConfigUsage() {
  console.log('\n=== 从构建器配置创建示例 ===')
  
  const builderConfig: BuilderConfig = {
    input: 'src/index.ts',
    output: {
      dir: 'dist',
      format: ['esm', 'cjs']
    },
    clean: true,
    mode: 'production'
  }
  
  // 从构建器配置创建清理器
  const cleaner = BuildCleaner.fromBuilderConfig(builderConfig, logger)
  
  // 查看推断的配置
  const config = cleaner.getConfig()
  console.log('推断的清理配置:', {
    enabled: config.enabled,
    verbose: config.verbose,
    outputDirs: config.outputDirs,
    safeMode: config.safeMode
  })
  
  const result = await cleaner.clean(process.cwd())
  console.log('清理结果:', result.success ? '成功' : '失败')
}

/**
 * 示例4：动态配置更新
 */
async function dynamicConfigUsage() {
  console.log('\n=== 动态配置更新示例 ===')
  
  const cleaner = new BuildCleaner()
  
  // 查看初始配置
  console.log('初始配置:', cleaner.getConfig().enabled)
  
  // 更新配置
  cleaner.updateConfig({
    enabled: false,
    verbose: true
  })
  
  console.log('更新后配置:', {
    enabled: cleaner.getConfig().enabled,
    verbose: cleaner.getConfig().verbose
  })
  
  // 再次更新
  cleaner.updateConfig({
    enabled: true,
    outputDirs: ['custom-dist']
  })
  
  console.log('最终配置:', {
    enabled: cleaner.getConfig().enabled,
    outputDirs: cleaner.getConfig().outputDirs
  })
}

/**
 * 示例5：错误处理
 */
async function errorHandlingUsage() {
  console.log('\n=== 错误处理示例 ===')
  
  const cleaner = new BuildCleaner({
    safeMode: true,
    verbose: true
  }, logger)
  
  // 尝试在不安全的目录执行清理
  try {
    const result = await cleaner.clean('/')
    
    if (!result.success) {
      console.log('❌ 清理失败（预期行为）:')
      result.errors.forEach(error => console.log(`  - ${error}`))
    }
  } catch (error) {
    console.log('捕获到异常:', error)
  }
  
  // 尝试在不存在的目录执行清理
  try {
    const result = await cleaner.clean('/nonexistent/directory')
    
    if (!result.success) {
      console.log('❌ 清理失败（预期行为）:')
      result.errors.forEach(error => console.log(`  - ${error}`))
    }
  } catch (error) {
    console.log('捕获到异常:', error)
  }
}

/**
 * 格式化字节数
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 运行所有示例
 */
async function runAllExamples() {
  try {
    await basicUsage()
    await customConfigUsage()
    await fromBuilderConfigUsage()
    await dynamicConfigUsage()
    await errorHandlingUsage()
    
    console.log('\n🎉 所有示例运行完成！')
  } catch (error) {
    console.error('❌ 示例运行失败:', error)
  }
}

// 如果直接运行此文件，则执行所有示例
if (require.main === module) {
  runAllExamples()
}

export {
  basicUsage,
  customConfigUsage,
  fromBuilderConfigUsage,
  dynamicConfigUsage,
  errorHandlingUsage,
  runAllExamples
}
