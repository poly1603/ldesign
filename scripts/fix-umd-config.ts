#!/usr/bin/env tsx

/**
 * 修复所有包的UMD配置，统一文件命名
 */

import { readdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'

const PACKAGES_TO_FIX = [
  'color', 'crypto', 'device', 'engine', 'http', 'i18n', 
  'router', 'shared', 'size', 'store', 'webcomponent'
]

async function fixUmdConfig() {
  console.log('🔧 开始修复UMD配置...')
  
  for (const pkg of PACKAGES_TO_FIX) {
    const configPath = join('packages', pkg, '.ldesign', 'builder.config.ts')
    
    try {
      const content = await readFile(configPath, 'utf-8')
      
      // 检查是否已经有UMD配置
      if (content.includes('umd:') || content.includes('fileName:')) {
        console.log(`✓ ${pkg} 已有UMD配置，跳过`)
        continue
      }
      
      // 在minify: false后添加UMD配置
      const newContent = content.replace(
        /(minify: false)([,\s]*)/,
        `$1,

  // UMD 构建配置
  umd: {
    enabled: true,
    minify: true, // UMD版本启用压缩
    fileName: 'index.js' // 去掉 .umd 后缀
  }$2`
      )
      
      if (newContent !== content) {
        await writeFile(configPath, newContent, 'utf-8')
        console.log(`✅ ${pkg} UMD配置已更新`)
      } else {
        console.log(`⚠️ ${pkg} 配置未能更新`)
      }
      
    } catch (error) {
      console.error(`❌ ${pkg} 配置更新失败:`, error)
    }
  }
  
  console.log('🎉 UMD配置修复完成！')
}

fixUmdConfig().catch(console.error)
