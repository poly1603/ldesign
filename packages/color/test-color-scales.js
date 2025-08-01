/**
 * 测试改进后的色阶生成效果
 */

import { generateColorConfig, generateColorScales } from './es/index.js'

async function testColorScales() {
  console.log('🎨 测试改进后的色阶生成效果\n')

  // 测试预设主题的主色调
  const testColors = {
    海洋蓝: '#1677ff',
    翡翠绿: '#00b96b',
    珊瑚红: '#ff4d4f',
    紫罗兰: '#722ed1',
    日落橙: '#fa8c16',
    天空青: '#13c2c2',
    樱花粉: '#eb2f96',
    金盏花: '#faad14',
    石墨灰: '#595959',
  }

  for (const [themeName, primaryColor] of Object.entries(testColors)) {
    console.log(`\n=== ${themeName} (${primaryColor}) ===`)

    try {
      // 生成颜色配置
      const colorConfig = generateColorConfig(primaryColor)
      console.log('生成的颜色配置:', colorConfig)

      // 生成亮色模式色阶
      const lightScales = generateColorScales(colorConfig, 'light')
      console.log('亮色模式主色调色阶:')
      lightScales.primary.colors.forEach((color, index) => {
        console.log(`  ${index + 1}: ${color}`)
      })

      // 生成暗色模式色阶
      const darkScales = generateColorScales(colorConfig, 'dark')
      console.log('暗色模式主色调色阶:')
      darkScales.primary.colors.forEach((color, index) => {
        console.log(`  ${index + 1}: ${color}`)
      })

      // 测试灰色色阶
      console.log('灰色色阶 (亮色模式):')
      lightScales.gray.colors.slice(0, 10).forEach((color, index) => {
        console.log(`  ${index + 1}: ${color}`)
      })
    }
    catch (error) {
      console.error(`❌ ${themeName} 色阶生成失败:`, error.message)
    }
  }

  console.log('\n✅ 色阶生成测试完成')
}

// 运行测试
testColorScales().catch(console.error)
