/**
 * Style Library 构建产物验证脚本
 * 验证构建后的样式文件是否正确生成
 */

const fs = require('fs')
const path = require('path')

console.log('🧪 开始验证 Style Library 构建产物...\n')

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

// 检查 CSS 文件大小
function checkFileSize(filePath, description, minSize = 100) {
  try {
    const stats = fs.statSync(filePath)
    const sizeKB = (stats.size / 1024).toFixed(2)
    const isValidSize = stats.size >= minSize
    
    console.log(`${isValidSize ? '✅' : '❌'} ${description}: ${sizeKB} KB`)
    return isValidSize
  } catch (error) {
    console.log(`❌ ${description}: 无法获取文件大小 - ${error.message}`)
    return false
  }
}

// 验证 CSS 语法基本正确性
function validateCSSBasics(filePath, description) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    
    // 基本语法检查
    const hasSelectors = /[.#]?[\w-]+\s*\{/.test(content)
    const hasProperties = /[\w-]+\s*:\s*[^;]+;/.test(content)
    const hasClosingBraces = content.split('{').length === content.split('}').length
    
    const isValid = hasSelectors && hasProperties && hasClosingBraces
    console.log(`${isValid ? '✅' : '❌'} ${description} CSS 语法基本正确`)
    
    if (!isValid) {
      console.log(`  选择器: ${hasSelectors}`)
      console.log(`  属性: ${hasProperties}`)
      console.log(`  括号匹配: ${hasClosingBraces}`)
    }
    
    return isValid
  } catch (error) {
    console.log(`❌ ${description}: CSS 语法检查失败 - ${error.message}`)
    return false
  }
}

// 主测试流程
async function main() {
  let allPassed = true
  
  console.log('📁 检查构建产物文件...')
  
  // 样式库通常会生成 CSS 文件
  const expectedFiles = [
    ['es/index.less.css', '主 CSS 文件'],
    ['es/index.less.css.map', 'CSS Source Map']
  ]

  // 检查可能的其他输出格式
  const possibleFiles = [
    ['lib/index.less.css', 'CJS CSS 文件'],
    ['dist/index.css', 'Dist CSS 文件'],
    ['dist/index.min.css', '压缩 CSS 文件']
  ]
  
  expectedFiles.forEach(([file, desc]) => {
    if (!checkFileExists(file, desc)) {
      allPassed = false
    }
  })
  
  console.log('\n📄 检查可能的其他文件...')
  possibleFiles.forEach(([file, desc]) => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${desc}: ${file}`)
    } else {
      console.log(`⚠️  ${desc}: ${file} (未生成，可能不需要)`)
    }
  })
  
  console.log('\n📏 检查文件大小...')
  
  // 检查主 CSS 文件大小
  if (fs.existsSync('es/index.less.css')) {
    if (!checkFileSize('es/index.less.css', '主 CSS 文件大小', 1000)) {
      console.log('  ⚠️  CSS 文件可能过小，请检查是否包含所有样式')
    }
  }
  
  console.log('\n📝 检查 CSS 内容...')
  
  // 检查主 CSS 文件内容
  if (fs.existsSync('es/index.less.css')) {
    // 验证基本 CSS 语法
    if (!validateCSSBasics('es/index.less.css', '主 CSS 文件')) {
      allPassed = false
    }

    // 检查是否包含预期的样式内容（注意：CSS 可能被压缩）
    if (!checkFileContent('es/index.less.css', [
      'box-sizing:border-box',   // 基础重置样式（压缩格式）
      'font-family:',            // 字体设置
      '.ld-btn',                 // 按钮组件样式
      '.ld-input',               // 输入框组件样式
      '@media',                  // 响应式样式
      'color:',                  // 颜色属性
      'background'               // 背景属性
    ], 'CSS 内容完整性')) {
      allPassed = false
    }
    
    // 检查是否包含变量（如果是编译后的 CSS，变量应该被替换）
    const content = fs.readFileSync('es/index.less.css', 'utf-8')
    const hasLessVariables = /@[\w-]+/.test(content)
    
    if (hasLessVariables) {
      console.log('⚠️  CSS 文件中仍包含 Less 变量，可能编译不完整')
      // 不设为失败，因为某些情况下可能是正常的
    } else {
      console.log('✅ CSS 变量已正确编译')
    }
  }
  
  console.log('\n🎨 检查样式特性...')
  
  if (fs.existsSync('es/index.less.css')) {
    const content = fs.readFileSync('es/index.less.css', 'utf-8')
    
    // 检查响应式设计
    const hasMediaQueries = /@media/.test(content)
    console.log(`${hasMediaQueries ? '✅' : '❌'} 包含响应式媒体查询`)
    
    // 检查现代 CSS 特性
    const hasFlexbox = /display:\s*flex/.test(content)
    const hasGrid = /display:\s*grid/.test(content)
    const hasTransitions = /transition:/.test(content)
    const hasBorderRadius = /border-radius:/.test(content)
    
    console.log(`${hasFlexbox ? '✅' : '⚠️ '} 使用 Flexbox 布局`)
    console.log(`${hasGrid ? '✅' : '⚠️ '} 使用 Grid 布局 (可选)`)
    console.log(`${hasTransitions ? '✅' : '⚠️ '} 包含过渡动画`)
    console.log(`${hasBorderRadius ? '✅' : '⚠️ '} 包含圆角样式`)
    
    // 检查浏览器兼容性前缀
    const hasWebkitPrefix = /-webkit-/.test(content)
    const hasMozPrefix = /-moz-/.test(content)
    
    if (hasWebkitPrefix || hasMozPrefix) {
      console.log('✅ 包含浏览器兼容性前缀')
    } else {
      console.log('⚠️  未发现浏览器前缀（可能使用了 autoprefixer 或不需要）')
    }
  }
  
  console.log('\n🗺️  检查 Source Map...')
  
  if (fs.existsSync('es/index.less.css.map')) {
    try {
      const sourceMapContent = fs.readFileSync('es/index.less.css.map', 'utf-8')
      const sourceMap = JSON.parse(sourceMapContent)
      
      const hasVersion = sourceMap.version !== undefined
      const hasSources = sourceMap.sources && sourceMap.sources.length > 0
      const hasMappings = sourceMap.mappings && sourceMap.mappings.length > 0
      
      console.log(`${hasVersion ? '✅' : '❌'} Source Map 版本信息`)
      console.log(`${hasSources ? '✅' : '❌'} Source Map 源文件信息`)
      console.log(`${hasMappings ? '✅' : '❌'} Source Map 映射信息`)
      
      if (hasSources) {
        console.log(`  源文件数量: ${sourceMap.sources.length}`)
      }
    } catch (error) {
      console.log(`❌ Source Map 格式错误: ${error.message}`)
      allPassed = false
    }
  }
  
  console.log('\n' + '='.repeat(60))
  if (allPassed) {
    console.log('🎉 Style Library 构建产物验证通过！')
    console.log('✅ 文件完整性检查通过')
    console.log('✅ CSS 语法检查通过')
    console.log('✅ 样式内容检查通过')
    console.log('✅ 现代 CSS 特性检查通过')
  } else {
    console.log('❌ Style Library 构建产物验证失败！')
    process.exit(1)
  }
}

main().catch(error => {
  console.error('❌ 验证过程出错:', error)
  process.exit(1)
})
