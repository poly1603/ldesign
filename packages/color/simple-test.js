/**
 * 简单测试色阶生成
 */

import { generateColorScales, generateColorConfig } from './es/index.js'

console.log('🎨 测试色阶生成')

try {
  // 测试红色
  const redConfig = generateColorConfig('#ff4d4f')
  console.log('红色配置:', redConfig)
  
  const redScales = generateColorScales(redConfig, 'light')
  console.log('红色主色调色阶:', redScales.primary.colors)
  
  // 测试蓝色
  const blueConfig = generateColorConfig('#1677ff')
  console.log('蓝色配置:', blueConfig)
  
  const blueScales = generateColorScales(blueConfig, 'light')
  console.log('蓝色主色调色阶:', blueScales.primary.colors)
  
  console.log('✅ 测试完成')
} catch (error) {
  console.error('❌ 测试失败:', error)
}
