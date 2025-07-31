/**
 * 简单测试chroma-js
 */

try {
  const chroma = require('chroma-js')
  
  console.log('🎨 测试chroma-js基本功能')
  
  // 测试基本颜色创建
  const red = chroma('#ff4d4f')
  console.log('红色:', red.hex())
  
  // 测试色阶生成
  const redScale = chroma.scale(['#ffebee', '#ff4d4f', '#b71c1c']).mode('lch').colors(12)
  console.log('红色色阶:')
  redScale.forEach((color, index) => {
    console.log(`  ${index + 1}: ${color}`)
  })
  
  // 测试蓝色
  const blueScale = chroma.scale(['#e3f2fd', '#1677ff', '#0d47a1']).mode('lch').colors(12)
  console.log('\n蓝色色阶:')
  blueScale.forEach((color, index) => {
    console.log(`  ${index + 1}: ${color}`)
  })
  
  console.log('\n✅ chroma-js测试成功！')
  
} catch (error) {
  console.error('❌ chroma-js测试失败:', error)
  console.error(error.stack)
}
