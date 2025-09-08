/**
 * 测试构建的包是否正常工作
 */

import { QRCodeGenerator, generateQRCode } from './dist/index.js'

async function testBuild() {
  console.log('🧪 测试构建的 QR Code 包...')
  
  try {
    // 测试 QRCodeGenerator 类
    console.log('\n📦 测试 QRCodeGenerator 类...')
    const generator = new QRCodeGenerator({
      size: 300,
      foregroundColor: '#000000',
      backgroundColor: '#FFFFFF'
    })
    
    const result1 = await generator.generate('Hello LDesign QRCode!')
    console.log('✅ QRCodeGenerator 测试成功')
    console.log(`   - 格式: ${result1.format}`)
    console.log(`   - 大小: ${result1.size}px`)
    console.log(`   - 数据长度: ${result1.data.length} 字符`)
    console.log(`   - 时间戳: ${new Date(result1.timestamp).toLocaleString()}`)
    
    // 测试 generateQRCode 函数
    console.log('\n🔧 测试 generateQRCode 函数...')
    const result2 = await generateQRCode('https://github.com/ldesign/qrcode', {
      size: 250,
      format: 'svg',
      errorCorrectionLevel: 'H'
    })
    console.log('✅ generateQRCode 测试成功')
    console.log(`   - 格式: ${result2.format}`)
    console.log(`   - 大小: ${result2.size}px`)
    console.log(`   - 数据类型: ${result2.data.startsWith('<svg') ? 'SVG' : 'Data URL'}`)
    
    // 测试选项更新
    console.log('\n⚙️  测试选项更新...')
    generator.updateOptions({ size: 400, format: 'svg' })
    const options = generator.getOptions()
    console.log('✅ 选项更新测试成功')
    console.log(`   - 新大小: ${options.size}px`)
    console.log(`   - 新格式: ${options.format}`)
    
    console.log('\n🎉 所有测试通过！构建的包工作正常。')
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message)
    process.exit(1)
  }
}

testBuild()
