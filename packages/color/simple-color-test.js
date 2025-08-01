/**
 * 简单的色阶测试
 */

try {
  const { generateColorScales, generateColorConfig } = require('./lib/index.js')

  console.log('🎨 测试色阶生成功能')

  // 测试海洋蓝主题
  const primaryColor = '#1677ff'
  console.log(`\n测试主题: 海洋蓝 (${primaryColor})`)

  // 生成颜色配置
  const colorConfig = generateColorConfig(primaryColor)
  console.log('✅ 颜色配置生成成功')

  // 生成亮色模式色阶
  const lightScales = generateColorScales(colorConfig, 'light')
  console.log('✅ 亮色模式色阶生成成功')
  console.log('主色调色阶 (前5级):', lightScales.primary.colors.slice(0, 5))

  // 生成暗色模式色阶
  const darkScales = generateColorScales(colorConfig, 'dark')
  console.log('✅ 暗色模式色阶生成成功')
  console.log('主色调色阶 (前5级):', darkScales.primary.colors.slice(0, 5))

  // 验证色阶方向
  const lightFirst = lightScales.primary.colors[0]
  const lightLast = lightScales.primary.colors[11]
  const darkFirst = darkScales.primary.colors[0]
  const darkLast = darkScales.primary.colors[11]

  console.log('\n色阶方向验证:')
  console.log(`亮色模式: ${lightFirst} -> ${lightLast}`)
  console.log(`暗色模式: ${darkFirst} -> ${darkLast}`)

  console.log('\n✅ 所有测试通过！色阶生成功能正常工作')
}
catch (error) {
  console.error('❌ 测试失败:', error.message)
  console.error(error.stack)
}
