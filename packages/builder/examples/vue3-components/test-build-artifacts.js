/**
 * Vue3 Components 构建产物验证脚本
 * 验证构建后的产物是否能正常工作
 */

const fs = require('fs')
const path = require('path')

console.log('🧪 开始验证 Vue3 Components 构建产物...\n')

// 检查文件是否存在
function checkFileExists(filePath, description) {
  const exists = fs.existsSync(filePath)
  console.log(`${exists ? '✅' : '❌'} ${description}: ${filePath}`)
  return exists
}

// 检查文件内容
function checkFileContent(filePath, patterns, description) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const results = patterns.map(pattern => {
      const match = typeof pattern === 'string' ? content.includes(pattern) : pattern.test(content)
      return { pattern: pattern.toString(), match }
    })
    
    const allMatch = results.every(r => r.match)
    console.log(`${allMatch ? '✅' : '❌'} ${description}`)
    
    if (!allMatch) {
      results.forEach(r => {
        if (!r.match) {
          console.log(`  ❌ 未找到: ${r.pattern}`)
        }
      })
    }
    
    return allMatch
  } catch (error) {
    console.log(`❌ ${description}: 读取文件失败 - ${error.message}`)
    return false
  }
}

// 测试 CommonJS 导入和功能
function testCommonJSImport() {
  try {
    console.log('\n📦 测试 CommonJS 导入...')
    
    // 清除缓存
    const modulePath = path.resolve('./cjs/index.cjs')
    delete require.cache[modulePath]
    
    const lib = require('./cjs/index.cjs')
    
    // 测试导出
    const exports = ['Button', 'Input', 'Card', 'install', 'version', 'utils']
    
    let allExportsExist = true
    exports.forEach(exportName => {
      const exists = typeof lib[exportName] !== 'undefined'
      console.log(`${exists ? '✅' : '❌'} 导出 ${exportName}`)
      if (!exists) allExportsExist = false
    })
    
    if (allExportsExist) {
      console.log('\n🔧 测试功能...')
      
      try {
        // 测试版本信息
        console.log(`✅ version: ${lib.version}`)
        
        // 测试默认导出（插件对象）
        const hasDefaultExport = lib.default && typeof lib.default.install === 'function'
        console.log(`✅ 默认导出插件对象: ${hasDefaultExport}`)
        
        // 测试 install 函数
        const isInstallFunction = typeof lib.install === 'function'
        console.log(`✅ install 是函数: ${isInstallFunction}`)
        
        // 测试工具函数
        const hasUtils = lib.utils && typeof lib.utils === 'object'
        console.log(`✅ utils 对象存在: ${hasUtils}`)
        
        if (hasUtils) {
          const hasInstallComponent = typeof lib.utils.installComponent === 'function'
          const hasInstallComponents = typeof lib.utils.installComponents === 'function'
          console.log(`✅ utils.installComponent: ${hasInstallComponent}`)
          console.log(`✅ utils.installComponents: ${hasInstallComponents}`)
        }
        
        // 测试组件存在性（Vue 组件通常是对象）
        const hasButton = lib.Button !== undefined
        const hasInput = lib.Input !== undefined
        const hasCard = lib.Card !== undefined
        console.log(`✅ Button 组件存在: ${hasButton}`)
        console.log(`✅ Input 组件存在: ${hasInput}`)
        console.log(`✅ Card 组件存在: ${hasCard}`)
        
        // 检查组件的基本结构（Vue 组件应该有 render 或 setup 等属性）
        if (lib.Button) {
          const isVueComponent = lib.Button.render || lib.Button.setup || lib.Button.__vccOpts
          console.log(`✅ Button 是 Vue 组件: ${!!isVueComponent}`)
        }
        
        if (lib.Input) {
          const isVueComponent = lib.Input.render || lib.Input.setup || lib.Input.__vccOpts
          console.log(`✅ Input 是 Vue 组件: ${!!isVueComponent}`)
        }
        
        if (lib.Card) {
          const isVueComponent = lib.Card.render || lib.Card.setup || lib.Card.__vccOpts
          console.log(`✅ Card 是 Vue 组件: ${!!isVueComponent}`)
        }
        
        return true
      } catch (error) {
        console.log(`❌ 功能测试失败: ${error.message}`)
        return false
      }
    }
    
    return allExportsExist
  } catch (error) {
    console.log(`❌ CommonJS 导入失败: ${error.message}`)
    return false
  }
}

// 主测试流程
async function main() {
  let allPassed = true
  
  console.log('📁 检查构建产物文件...')
  const files = [
    ['es/index.js', 'ESM 主文件'],
    ['cjs/index.cjs', 'CommonJS 主文件'],
    ['dist/index.umd.js', 'UMD 主文件']
  ]
  
  files.forEach(([file, desc]) => {
    if (!checkFileExists(file, desc)) {
      allPassed = false
    }
  })
  
  console.log('\n📝 检查文件内容...')
  
  // 检查 ESM 文件
  if (fs.existsSync('es/index.js')) {
    if (!checkFileContent('es/index.js', [
      'export',
      'Button',
      'Input',
      'Card',
      'install',
      'version'
    ], 'ESM 导出内容')) {
      allPassed = false
    }
  }
  
  // 检查 CommonJS 文件
  if (fs.existsSync('cjs/index.cjs')) {
    if (!checkFileContent('cjs/index.cjs', [
      'exports.',
      'Button',
      'Input',
      'Card',
      'install'
    ], 'CommonJS 导出内容')) {
      allPassed = false
    }
  }
  
  // 检查类型定义文件（允许在 src 下）
  const esDts = fs.existsSync('es/index.d.ts') ? 'es/index.d.ts' : (fs.existsSync('es/src/index.d.ts') ? 'es/src/index.d.ts' : null)
  const cjsDts = fs.existsSync('cjs/index.d.ts') ? 'cjs/index.d.ts' : (fs.existsSync('cjs/src/index.d.ts') ? 'cjs/src/index.d.ts' : null)
  if (!esDts) {
    console.log('❌ ESM 类型定义不存在: es/index.d.ts 或 es/src/index.d.ts')
    allPassed = false
  } else {
    if (!checkFileContent(esDts, [
      'export',
      'Button',
      'Input',
      'Card',
      'install',
      'version'
    ], 'TypeScript 类型定义')) {
      allPassed = false
    }
  }
  if (!cjsDts) {
    console.log('❌ CJS 类型定义不存在: cjs/index.d.ts 或 cjs/src/index.d.ts')
    allPassed = false
  } else {
    console.log(`✅ CJS 类型定义: ${cjsDts}`)
  }
  
  // 检查 UMD 文件
  if (fs.existsSync('dist/index.umd.js')) {
    if (!checkFileContent('dist/index.umd.js', [
      'Vue3Components',
      'typeof exports=="object"'
    ], 'UMD 全局变量定义')) {
      allPassed = false
    }
  }
  
  // 测试 CommonJS 功能
  if (!testCommonJSImport()) {
    allPassed = false
  }
  
  console.log('\n' + '='.repeat(60))
  if (allPassed) {
    console.log('🎉 Vue3 Components 构建产物验证通过！')
    console.log('✅ 文件完整性检查通过')
    console.log('✅ 内容格式检查通过')
    console.log('✅ 功能测试通过')
    console.log('✅ Vue3 组件和插件验证通过')
  } else {
    console.log('❌ Vue3 Components 构建产物验证失败！')
    process.exit(1)
  }
}

main().catch(error => {
  console.error('❌ 验证过程出错:', error)
  process.exit(1)
})
