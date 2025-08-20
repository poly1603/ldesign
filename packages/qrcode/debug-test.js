// 简单的调试测试
import { useQRCode } from './src/vue/useQRCode.js'

async function debugTest() {
  try {
    console.log('开始测试...')
    
    const { generate, result, error } = useQRCode({
      data: 'test data',
      size: 200
    })
    
    console.log('调用generate...')
    await generate()
    
    console.log('结果:', result.value)
    console.log('错误:', error.value)
    
  } catch (err) {
    console.error('测试失败:', err)
  }
}

debugTest()