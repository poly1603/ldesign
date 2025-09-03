/**
 * 测试所有页面功能的脚本
 * 
 * 这个脚本会自动访问所有页面并检查是否有错误
 */

const pages = [
  '/',
  '/color',
  '/i18n', 
  '/size',
  '/http-demo',
  '/http-test',
  '/templates'
]

async function testPage(url) {
  console.log(`🧪 测试页面: ${url}`)
  
  try {
    // 在浏览器控制台中运行这个函数
    const response = await fetch(url)
    if (response.ok) {
      console.log(`✅ ${url} - 页面加载成功`)
      return true
    } else {
      console.log(`❌ ${url} - 页面加载失败: ${response.status}`)
      return false
    }
  } catch (error) {
    console.log(`❌ ${url} - 请求失败: ${error.message}`)
    return false
  }
}

async function testAllPages() {
  console.log('🚀 开始测试所有页面...')
  
  const results = []
  
  for (const page of pages) {
    const result = await testPage(page)
    results.push({ page, success: result })
    
    // 等待一下避免请求过快
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  console.log('\n📊 测试结果汇总:')
  results.forEach(({ page, success }) => {
    console.log(`${success ? '✅' : '❌'} ${page}`)
  })
  
  const successCount = results.filter(r => r.success).length
  const totalCount = results.length
  
  console.log(`\n🎯 总体结果: ${successCount}/${totalCount} 页面正常`)
  
  if (successCount === totalCount) {
    console.log('🎉 所有页面测试通过！')
  } else {
    console.log('⚠️ 部分页面存在问题，请检查')
  }
  
  return results
}

// 导出函数供浏览器控制台使用
if (typeof window !== 'undefined') {
  window.testAllPages = testAllPages
  window.testPage = testPage
  
  console.log('💡 在浏览器控制台中运行以下命令来测试:')
  console.log('testAllPages() - 测试所有页面')
  console.log('testPage("/color") - 测试单个页面')
}

// Node.js 环境下直接运行
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testAllPages, testPage }
}
