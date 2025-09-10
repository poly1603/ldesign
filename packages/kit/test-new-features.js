/**
 * 测试新功能的简单脚本
 */

import { ColorUtils, TreeUtils, UrlUtils } from './dist/utils/index.js'

console.log('🧪 测试新功能...\n')

// 测试 ColorUtils
console.log('🎨 测试 ColorUtils:')
try {
  const color = ColorUtils.hexToRgb('#ff0000')
  console.log('✅ hexToRgb:', color)
  
  const hsl = ColorUtils.rgbToHsl(color)
  console.log('✅ rgbToHsl:', hsl)
  
  const lighter = ColorUtils.lighten('#ff0000', 0.2)
  console.log('✅ lighten:', lighter)
  
  const contrast = ColorUtils.getContrast('#000000', '#ffffff')
  console.log('✅ getContrast:', contrast)
} catch (error) {
  console.error('❌ ColorUtils 错误:', error.message)
}

// 测试 TreeUtils
console.log('\n🌳 测试 TreeUtils:')
try {
  const flatData = [
    { id: '1', name: 'Root', parentId: null },
    { id: '2', name: 'Child 1', parentId: '1' },
    { id: '3', name: 'Child 2', parentId: '1' },
    { id: '4', name: 'Grandchild', parentId: '2' }
  ]
  
  const tree = TreeUtils.arrayToTree(flatData)
  console.log('✅ arrayToTree:', JSON.stringify(tree, null, 2))
  
  const foundNode = TreeUtils.findNode(tree, node => node.id === '4')
  console.log('✅ findNode:', foundNode?.name)
  
  const depth = TreeUtils.getDepth(tree)
  console.log('✅ getDepth:', depth)
} catch (error) {
  console.error('❌ TreeUtils 错误:', error.message)
}

// 测试 UrlUtils
console.log('\n🔗 测试 UrlUtils:')
try {
  const url = UrlUtils.buildUrl('https://example.com/api', { page: 1, limit: 10 })
  console.log('✅ buildUrl:', url)
  
  const query = UrlUtils.parseQuery('?name=test&age=25&tags=a&tags=b')
  console.log('✅ parseQuery:', query)
  
  const normalized = UrlUtils.normalize('https://example.com//path/../api/')
  console.log('✅ normalize:', normalized)
  
  const domain = UrlUtils.getDomain('https://sub.example.com/path')
  console.log('✅ getDomain:', domain)
} catch (error) {
  console.error('❌ UrlUtils 错误:', error.message)
}

console.log('\n🎉 新功能测试完成！')
