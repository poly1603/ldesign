/**
 * 直接测试色阶生成器
 */

const { ColorScaleGenerator, generateColorScales } = require('./lib/utils/color-scale.js')
const { ColorGeneratorImpl, generateColorConfig } = require('./lib/utils/color-generator.js')

console.log('🎨 直接测试色阶生成器')

try {
  const scaleGenerator = new ColorScaleGenerator()
  const colorGenerator = new ColorGeneratorImpl()
  
  // 测试红色
  console.log('\n=== 测试红色 #ff4d4f ===')
  const redScale = scaleGenerator.generateScale('#ff4d4f', 'light', 'primary')
  console.log('红色主色调色阶:')
  redScale.colors.forEach((color, index) => {
    console.log(`  ${index + 1}: ${color}`)
  })
  
  // 测试蓝色
  console.log('\n=== 测试蓝色 #1677ff ===')
  const blueScale = scaleGenerator.generateScale('#1677ff', 'light', 'primary')
  console.log('蓝色主色调色阶:')
  blueScale.colors.forEach((color, index) => {
    console.log(`  ${index + 1}: ${color}`)
  })
  
  // 测试紫色
  console.log('\n=== 测试紫色 #722ed1 ===')
  const purpleScale = scaleGenerator.generateScale('#722ed1', 'light', 'primary')
  console.log('紫色主色调色阶:')
  purpleScale.colors.forEach((color, index) => {
    console.log(`  ${index + 1}: ${color}`)
  })
  
  // 测试绿色
  console.log('\n=== 测试绿色 #00b96b ===')
  const greenScale = scaleGenerator.generateScale('#00b96b', 'light', 'primary')
  console.log('绿色主色调色阶:')
  greenScale.colors.forEach((color, index) => {
    console.log(`  ${index + 1}: ${color}`)
  })
  
  // 测试灰色
  console.log('\n=== 测试灰色 #595959 ===')
  const grayScale = scaleGenerator.generateGrayScale('#595959', 'light')
  console.log('灰色色阶:')
  grayScale.colors.forEach((color, index) => {
    console.log(`  ${index + 1}: ${color}`)
  })
  
  console.log('\n✅ 测试完成')
} catch (error) {
  console.error('❌ 测试失败:', error)
  console.error(error.stack)
}
