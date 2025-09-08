/**
 * Complex Library 构建产物验证脚本
 * 验证构建后的产物是否能正常工作
 */

const fs = require('fs')
const path = require('path')

console.log('🧪 开始验证 Complex Library 构建产物...\n')

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
    const exports = ['add', 'multiply', 'Calculator', 'SimpleContainer', 'VERSION', 'LIBRARY_NAME']
    
    let allExportsExist = true
    exports.forEach(exportName => {
      const exists = typeof lib[exportName] !== 'undefined'
      console.log(`${exists ? '✅' : '❌'} 导出 ${exportName}`)
      if (!exists) allExportsExist = false
    })
    
    if (allExportsExist) {
      console.log('\n🔧 测试功能...')
      
      try {
        // 测试基础函数
        const sum = lib.add(2, 3)
        console.log(`✅ add(2, 3) = ${sum}`)
        
        const product = lib.multiply(4, 5)
        console.log(`✅ multiply(4, 5) = ${product}`)
        
        // 测试 Calculator 类
        const calc = new lib.Calculator()
        const calcSum = calc.add(10, 20)
        console.log(`✅ Calculator.add(10, 20) = ${calcSum}`)
        
        const calcProduct = calc.multiply(3, 7)
        console.log(`✅ Calculator.multiply(3, 7) = ${calcProduct}`)
        
        const history = calc.getHistory()
        console.log(`✅ Calculator.getHistory() 长度: ${history.length}`)
        
        // 测试 SimpleContainer 泛型类
        const container = new lib.SimpleContainer('Hello World')
        const value = container.getValue()
        console.log(`✅ SimpleContainer.getValue(): ${value}`)

        container.setValue('Updated Value')
        const newValue = container.getValue()
        console.log(`✅ SimpleContainer.setValue() 后的值: ${newValue}`)

        // 测试版本信息
        console.log(`✅ VERSION: ${lib.VERSION}`)
        console.log(`✅ LIBRARY_NAME: ${lib.LIBRARY_NAME}`)
        
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

  // 允许 d.ts 位于保留模块根 src 下
  const esDts = fs.existsSync('es/index.d.ts') ? 'es/index.d.ts' : (fs.existsSync('es/src/index.d.ts') ? 'es/src/index.d.ts' : null)
  const cjsDts = fs.existsSync('cjs/index.d.ts') ? 'cjs/index.d.ts' : (fs.existsSync('cjs/src/index.d.ts') ? 'cjs/src/index.d.ts' : null)
  if (!esDts) {
    console.log('❌ ESM 类型定义不存在: es/index.d.ts 或 es/src/index.d.ts')
    allPassed = false
  } else {
    console.log(`✅ ESM 类型定义: ${esDts}`)
  }
  if (!cjsDts) {
    console.log('❌ CJS 类型定义不存在: cjs/index.d.ts 或 cjs/src/index.d.ts')
    allPassed = false
  } else {
    console.log(`✅ CJS 类型定义: ${cjsDts}`)
  }
  
  console.log('\n📝 检查文件内容...')
  
  // 检查 ESM 文件
  if (fs.existsSync('es/index.js')) {
    if (!checkFileContent('es/index.js', [
      'export',
      'add',
      'multiply',
      'Calculator',
      'SimpleContainer',
      'VERSION'
    ], 'ESM 导出内容')) {
      allPassed = false
    }
  }
  
  // 检查 CommonJS 文件
  if (fs.existsSync('cjs/index.cjs')) {
    if (!checkFileContent('cjs/index.cjs', [
      'exports.',
      'add',
      'multiply',
      'Calculator'
    ], 'CommonJS 导出内容')) {
      allPassed = false
    }
  }
  
  // 检查类型定义文件
  if (esDts) {
    if (!checkFileContent(esDts, [
      'export',
      'declare function add',
      'declare function multiply',
      'declare class Calculator',
      'declare class SimpleContainer',
      'VERSION'
    ], 'TypeScript 类型定义')) {
      allPassed = false
    }
  }
  
  // 检查 UMD 文件
  if (fs.existsSync('dist/index.umd.js')) {
    if (!checkFileContent('dist/index.umd.js', [
      'ComplexLibrary',
      '"object"==typeof exports'
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
    console.log('🎉 Complex Library 构建产物验证通过！')
    console.log('✅ 文件完整性检查通过')
    console.log('✅ 内容格式检查通过')
    console.log('✅ 功能测试通过')
    console.log('✅ 复杂类和泛型测试通过')
  } else {
    console.log('❌ Complex Library 构建产物验证失败！')
    process.exit(1)
  }
}

main().catch(error => {
  console.error('❌ 验证过程出错:', error)
  process.exit(1)
})
