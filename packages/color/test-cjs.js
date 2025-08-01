/**
 * CommonJS 测试
 */

const { generateColorScales, generateColorConfig } = require('./lib/index.js')

console.log('🎨 测试色阶生成 (CommonJS)')

try {
  // 测试红色
  console.log('测试红色 #ff4d4f...')
  const redConfig = generateColorConfig('#ff4d4f')
  console.log('红色配置:', JSON.stringify(redConfig, null, 2))

  const redScales = generateColorScales(redConfig, 'light')
  console.log('红色主色调色阶:')
  redScales.primary.colors.forEach((color, index) => {
    console.log(`  ${index + 1}: ${color}`)
  })

  console.log('\n测试蓝色 #1677ff...')
  const blueConfig = generateColorConfig('#1677ff')
  console.log('蓝色配置:', JSON.stringify(blueConfig, null, 2))

  const blueScales = generateColorScales(blueConfig, 'light')
  console.log('蓝色主色调色阶:')
  blueScales.primary.colors.forEach((color, index) => {
    console.log(`  ${index + 1}: ${color}`)
  })

  console.log('\n测试紫色 #722ed1...')
  const purpleConfig = generateColorConfig('#722ed1')
  console.log('紫色配置:', JSON.stringify(purpleConfig, null, 2))

  const purpleScales = generateColorScales(purpleConfig, 'light')
  console.log('紫色主色调色阶:')
  purpleScales.primary.colors.forEach((color, index) => {
    console.log(`  ${index + 1}: ${color}`)
  })

  console.log('\n✅ 测试完成')
}
catch (error) {
  console.error('❌ 测试失败:', error)
  console.error(error.stack)
}
