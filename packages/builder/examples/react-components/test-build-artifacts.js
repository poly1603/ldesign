/**
 * React Components 构建产物验证脚本
 * 验证构建后的产物是否能正常工作
 */

const fs = require('fs')
const path = require('path')

console.log('🧪 开始验证 React Components 构建产物...\n')

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
    const modulePath = path.resolve('./lib/index.cjs')
    delete require.cache[modulePath]
    
    const lib = require('./lib/index.cjs')
    
    // 测试导出
    const exports = ['Button', 'Input', 'version', 'utils']
    
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
        
        // 测试工具函数
        const utilsVersion = lib.utils.getVersion()
        console.log(`✅ utils.getVersion(): ${utilsVersion}`)
        
        // 测试 isReactComponent
        const isComponent1 = lib.utils.isReactComponent(() => {})
        const isComponent2 = lib.utils.isReactComponent('not a component')
        console.log(`✅ utils.isReactComponent(function): ${isComponent1}`)
        console.log(`✅ utils.isReactComponent(string): ${isComponent2}`)
        
        // 测试 classNames
        const className = lib.utils.classNames('btn', 'btn-primary', null, false, 'active')
        console.log(`✅ utils.classNames: "${className}"`)
        
        // 测试组件存在性（React 组件可能是对象或函数）
        const hasButton = lib.Button !== undefined
        const hasInput = lib.Input !== undefined
        console.log(`✅ Button 组件存在: ${hasButton}`)
        console.log(`✅ Input 组件存在: ${hasInput}`)
        
        // 检查组件的 displayName
        if (lib.Button && lib.Button.displayName) {
          console.log(`✅ Button.displayName: ${lib.Button.displayName}`)
        }
        if (lib.Input && lib.Input.displayName) {
          console.log(`✅ Input.displayName: ${lib.Input.displayName}`)
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
    ['es/index.d.ts', 'ESM 类型定义'],
    ['lib/index.cjs', 'CommonJS 主文件'],
    ['lib/index.d.ts', 'CommonJS 类型定义'],
    ['dist/index.umd.js', 'UMD 主文件'],
    ['dist/index.d.ts', 'UMD 类型定义']
  ]
  
  files.forEach(([file, desc]) => {
    if (!checkFileExists(file, desc)) {
      allPassed = false
    }
  })
  
  // 检查 CSS 文件是否被包含
  const cssFiles = [
    ['es/components/Button.css', 'ESM Button CSS'],
    ['es/components/Input.css', 'ESM Input CSS'],
    ['lib/components/Button.css', 'CJS Button CSS'],
    ['lib/components/Input.css', 'CJS Input CSS']
  ]
  
  console.log('\n📄 检查 CSS 文件...')
  cssFiles.forEach(([file, desc]) => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${desc}: ${file}`)
    } else {
      console.log(`⚠️  ${desc}: ${file} (可能被内联或合并)`)
    }
  })
  
  console.log('\n📝 检查文件内容...')
  
  // 检查 ESM 文件
  if (fs.existsSync('es/index.js')) {
    if (!checkFileContent('es/index.js', [
      'export',
      'Button',
      'Input',
      'version',
      'utils'
    ], 'ESM 导出内容')) {
      allPassed = false
    }
  }
  
  // 检查 CommonJS 文件
  if (fs.existsSync('lib/index.cjs')) {
    if (!checkFileContent('lib/index.cjs', [
      'exports.',
      'Button',
      'Input',
      'version'
    ], 'CommonJS 导出内容')) {
      allPassed = false
    }
  }
  
  // 检查类型定义文件
  if (fs.existsSync('es/index.d.ts')) {
    if (!checkFileContent('es/index.d.ts', [
      'export',
      'Button',
      'Input',
      'ButtonProps',
      'InputProps',
      'version',
      'utils'
    ], 'TypeScript 类型定义')) {
      allPassed = false
    }
  }
  
  // 检查 UMD 文件
  if (fs.existsSync('dist/index.umd.js')) {
    if (!checkFileContent('dist/index.umd.js', [
      'ReactComponents',
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
    console.log('🎉 React Components 构建产物验证通过！')
    console.log('✅ 文件完整性检查通过')
    console.log('✅ 内容格式检查通过')
    console.log('✅ 功能测试通过')
    console.log('✅ React 组件导出验证通过')
  } else {
    console.log('❌ React Components 构建产物验证失败！')
    process.exit(1)
  }
}

main().catch(error => {
  console.error('❌ 验证过程出错:', error)
  process.exit(1)
})
