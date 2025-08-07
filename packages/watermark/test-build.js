// 简单测试构建产物
import * as watermark from './es/index.js'

console.log('🎉 水印库构建测试')
console.log('================')

// 检查主要导出
console.log('✅ 可用的导出:', Object.keys(watermark))

// 检查核心类
if (watermark.WatermarkCore) {
  console.log('✅ WatermarkCore 类可用')
} else {
  console.log('❌ WatermarkCore 类不可用')
}

// 检查工厂函数
if (watermark.createWatermark) {
  console.log('✅ createWatermark 函数可用')
} else {
  console.log('❌ createWatermark 函数不可用')
}

// 检查版本
if (watermark.VERSION) {
  console.log('✅ 版本号:', watermark.VERSION)
} else {
  console.log('❌ 版本号不可用')
}

console.log('================')
console.log('🎉 构建测试完成！')
