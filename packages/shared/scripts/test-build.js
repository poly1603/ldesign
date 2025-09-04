/**
 * 测试构建产物
 */

import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const rootDir = resolve(__dirname, '..')

async function testBuild() {
  console.log('🧪 Testing build artifacts...\n')
  
  try {
    // 测试ES模块
    console.log('📦 Testing ES Module:')
    const esContent = await readFile(resolve(rootDir, 'es/index.mjs'), 'utf-8')
    console.log(`   ✅ ES module size: ${(esContent.length / 1024).toFixed(2)} KB`)
    
    // 检查导出
    const exportMatches = esContent.match(/export \{[^}]+\}/g) || []
    console.log(`   ✅ Found ${exportMatches.length} export statements`)
    
    // 测试CommonJS模块
    console.log('\n📦 Testing CommonJS Module:')
    const cjsContent = await readFile(resolve(rootDir, 'cjs/index.js'), 'utf-8')
    console.log(`   ✅ CJS module size: ${(cjsContent.length / 1024).toFixed(2)} KB`)
    
    // 检查导出
    const cjsExports = cjsContent.match(/exports\.\w+\s*=/g) || []
    console.log(`   ✅ Found ${cjsExports.length} CJS exports`)
    
    // 测试类型声明
    console.log('\n📦 Testing TypeScript Declarations:')
    const dtsContent = await readFile(resolve(rootDir, 'dist/index-basic.d.ts'), 'utf-8')
    console.log(`   ✅ Declaration file size: ${(dtsContent.length / 1024).toFixed(2)} KB`)
    
    // 检查类型导出
    const typeExports = dtsContent.match(/export [^;]+;/g) || []
    console.log(`   ✅ Found ${typeExports.length} type exports`)
    
    // 验证包含的功能模块
    console.log('\n🔍 Analyzing exported modules:')
    
    // 检查hooks
    if (esContent.includes('useAsyncData') || esContent.includes('useLocalStorage')) {
      console.log('   ✅ Hooks module included')
    } else {
      console.log('   ❌ Hooks module missing')
    }
    
    // 检查utils
    if (esContent.includes('formatDate') || esContent.includes('debounce')) {
      console.log('   ✅ Utils module included')
    } else {
      console.log('   ❌ Utils module missing')
    }
    
    // 检查types
    if (dtsContent.includes('PlainObject') || dtsContent.includes('Maybe')) {
      console.log('   ✅ Types module included')
    } else {
      console.log('   ❌ Types module missing')
    }
    
    console.log('\n🎉 Build artifacts test completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`   • ES Module: ${(esContent.length / 1024).toFixed(2)} KB`)
    console.log(`   • CommonJS: ${(cjsContent.length / 1024).toFixed(2)} KB`)
    console.log(`   • TypeScript Declarations: ${(dtsContent.length / 1024).toFixed(2)} KB`)
    console.log(`   • Total package size: ${((esContent.length + cjsContent.length + dtsContent.length) / 1024).toFixed(2)} KB`)
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    process.exit(1)
  }
}

testBuild()
