/**
 * 批量为所有 examples 项目创建测试脚本
 */

const fs = require('fs')
const path = require('path')

// 项目配置
const projects = [
  {
    name: 'complex-library',
    type: 'typescript',
    exports: ['ComplexClass', 'UtilityFunction', 'CONSTANTS', 'version'],
    umdName: 'ComplexLibrary'
  },
  {
    name: 'mixed-library', 
    type: 'mixed',
    exports: ['MixedComponent', 'utils', 'styles', 'version'],
    umdName: 'MixedLibrary'
  },
  {
    name: 'multi-module-typescript',
    type: 'multi-module',
    exports: ['ModuleA', 'ModuleB', 'SharedUtils', 'version'],
    umdName: 'MultiModuleTypescript'
  }
]

// 生成基础验证脚本模板
function generateTestScript(project) {
  return `/**
 * ${project.name} 构建产物验证脚本
 * 验证构建后的产物是否能正常工作
 */

const fs = require('fs')
const path = require('path')

console.log('🧪 开始验证 ${project.name} 构建产物...\\n')

// 检查文件是否存在
function checkFileExists(filePath, description) {
  const exists = fs.existsSync(filePath)
  console.log(\`\${exists ? '✅' : '❌'} \${description}: \${filePath}\`)
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
    console.log(\`\${allMatch ? '✅' : '❌'} \${description}\`)
    
    if (!allMatch) {
      results.forEach(r => {
        if (!r.match) {
          console.log(\`  ❌ 未找到: \${r.pattern}\`)
        }
      })
    }
    
    return allMatch
  } catch (error) {
    console.log(\`❌ \${description}: 读取文件失败 - \${error.message}\`)
    return false
  }
}

// 测试 CommonJS 导入和功能
function testCommonJSImport() {
  try {
    console.log('\\n📦 测试 CommonJS 导入...')
    
    // 清除缓存
    const modulePath = path.resolve('./lib/index.cjs')
    delete require.cache[modulePath]
    
    const lib = require('./lib/index.cjs')
    
    // 测试导出
    const exports = ${JSON.stringify(project.exports)}
    
    let allExportsExist = true
    exports.forEach(exportName => {
      const exists = typeof lib[exportName] !== 'undefined'
      console.log(\`\${exists ? '✅' : '❌'} 导出 \${exportName}\`)
      if (!exists) allExportsExist = false
    })
    
    if (allExportsExist) {
      console.log('\\n🔧 测试功能...')
      
      try {
        // 基础功能测试
        ${generateFunctionTests(project)}
        
        return true
      } catch (error) {
        console.log(\`❌ 功能测试失败: \${error.message}\`)
        return false
      }
    }
    
    return allExportsExist
  } catch (error) {
    console.log(\`❌ CommonJS 导入失败: \${error.message}\`)
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
  
  console.log('\\n📝 检查文件内容...')
  
  // 检查 ESM 文件
  if (fs.existsSync('es/index.js')) {
    if (!checkFileContent('es/index.js', [
      'export',
      ${project.exports.map(e => `'${e}'`).join(', ')}
    ], 'ESM 导出内容')) {
      allPassed = false
    }
  }
  
  // 检查 CommonJS 文件
  if (fs.existsSync('lib/index.cjs')) {
    if (!checkFileContent('lib/index.cjs', [
      'exports.',
      ${project.exports.slice(0, 3).map(e => `'${e}'`).join(', ')}
    ], 'CommonJS 导出内容')) {
      allPassed = false
    }
  }
  
  // 检查类型定义文件
  if (fs.existsSync('es/index.d.ts')) {
    if (!checkFileContent('es/index.d.ts', [
      'export',
      ${project.exports.slice(0, 2).map(e => `'${e}'`).join(', ')}
    ], 'TypeScript 类型定义')) {
      allPassed = false
    }
  }
  
  // 检查 UMD 文件
  if (fs.existsSync('dist/index.umd.js')) {
    if (!checkFileContent('dist/index.umd.js', [
      '${project.umdName}',
      'typeof exports=="object"'
    ], 'UMD 全局变量定义')) {
      allPassed = false
    }
  }
  
  // 测试 CommonJS 功能
  if (!testCommonJSImport()) {
    allPassed = false
  }
  
  console.log('\\n' + '='.repeat(60))
  if (allPassed) {
    console.log('🎉 ${project.name} 构建产物验证通过！')
    console.log('✅ 文件完整性检查通过')
    console.log('✅ 内容格式检查通过')
    console.log('✅ 功能测试通过')
  } else {
    console.log('❌ ${project.name} 构建产物验证失败！')
    process.exit(1)
  }
}

main().catch(error => {
  console.error('❌ 验证过程出错:', error)
  process.exit(1)
})`
}

// 生成功能测试代码
function generateFunctionTests(project) {
  const tests = []
  
  if (project.exports.includes('version')) {
    tests.push(`console.log(\`✅ version: \${lib.version}\`)`)
  }
  
  if (project.type === 'typescript') {
    tests.push(`
        // 测试类或函数的存在性
        const hasMainExport = lib.${project.exports[0]} !== undefined
        console.log(\`✅ ${project.exports[0]} 存在: \${hasMainExport}\`)`)
  }
  
  if (project.type === 'mixed') {
    tests.push(`
        // 测试混合库的组件和工具
        const hasComponent = lib.${project.exports[0]} !== undefined
        const hasUtils = lib.utils !== undefined
        console.log(\`✅ ${project.exports[0]} 存在: \${hasComponent}\`)
        console.log(\`✅ utils 存在: \${hasUtils}\`)`)
  }
  
  if (project.type === 'multi-module') {
    tests.push(`
        // 测试多模块的各个模块
        const hasModuleA = lib.ModuleA !== undefined
        const hasModuleB = lib.ModuleB !== undefined
        console.log(\`✅ ModuleA 存在: \${hasModuleA}\`)
        console.log(\`✅ ModuleB 存在: \${hasModuleB}\`)`)
  }
  
  return tests.join('\\n        ')
}

// 更新 package.json 脚本
function updatePackageJson(projectPath) {
  const packageJsonPath = path.join(projectPath, 'package.json')
  if (!fs.existsSync(packageJsonPath)) return
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
    
    // 更新脚本
    packageJson.scripts = packageJson.scripts || {}
    packageJson.scripts['test:build'] = 'npm run build && node test-build-artifacts.js'
    packageJson.scripts['test:artifacts'] = 'node test-build-artifacts.js'
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
    console.log(\`✅ 更新 \${projectPath}/package.json\`)
  } catch (error) {
    console.log(\`❌ 更新 \${projectPath}/package.json 失败: \${error.message}\`)
  }
}

// 主执行函数
function main() {
  const examplesDir = path.join(__dirname, 'examples')
  
  projects.forEach(project => {
    const projectPath = path.join(examplesDir, project.name)
    
    if (!fs.existsSync(projectPath)) {
      console.log(\`⚠️  项目目录不存在: \${project.name}\`)
      return
    }
    
    // 生成测试脚本
    const testScript = generateTestScript(project)
    const testScriptPath = path.join(projectPath, 'test-build-artifacts.js')
    
    fs.writeFileSync(testScriptPath, testScript)
    console.log(\`✅ 创建 \${project.name}/test-build-artifacts.js\`)
    
    // 更新 package.json
    updatePackageJson(projectPath)
  })
  
  console.log('\\n🎉 所有测试脚本创建完成！')
}

if (require.main === module) {
  main()
}

module.exports = { generateTestScript, projects }`
