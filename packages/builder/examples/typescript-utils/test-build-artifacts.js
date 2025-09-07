/**
 * TypeScript Utils 构建产物验证脚本
 * 验证构建后的产物是否能正常工作
 */

const fs = require('fs')
const path = require('path')

console.log('🧪 开始验证 TypeScript Utils 构建产物...\n')

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
    const exports = [
      'generateId', 'validateEmail', 'formatUserName', 'createUser',
      'deepClone', 'debounce', 'throttle', 'UserManager', 'EventEmitter',
      'defaultUserManager', 'DEFAULT_AVATAR', 'USER_ROLES', 'HTTP_STATUS'
    ]
    
    let allExportsExist = true
    exports.forEach(exportName => {
      const exists = typeof lib[exportName] !== 'undefined'
      console.log(`${exists ? '✅' : '❌'} 导出 ${exportName}`)
      if (!exists) allExportsExist = false
    })
    
    if (allExportsExist) {
      console.log('\n🔧 测试功能...')
      
      try {
        // 测试工具函数
        const id = lib.generateId()
        console.log(`✅ generateId: ${id}`)
        
        const isValid = lib.validateEmail('test@example.com')
        console.log(`✅ validateEmail: ${isValid}`)
        
        const user = lib.createUser({ name: '测试用户', email: 'test@example.com' })
        console.log(`✅ createUser: ${user.name}`)
        
        const formatted = lib.formatUserName(user)
        console.log(`✅ formatUserName: ${formatted}`)
        
        // 测试深拷贝
        const obj = { a: 1, b: { c: 2 } }
        const cloned = lib.deepClone(obj)
        console.log(`✅ deepClone: ${JSON.stringify(cloned)}`)
        
        // 测试防抖函数
        let counter = 0
        const debouncedFn = lib.debounce(() => counter++, 100)
        debouncedFn()
        console.log(`✅ debounce 函数创建成功`)
        
        // 测试节流函数
        const throttledFn = lib.throttle(() => console.log('throttled'), 100)
        console.log(`✅ throttle 函数创建成功`)
        
        // 测试 UserManager
        const manager = new lib.UserManager()
        const newUser = manager.addUser({ name: '管理器用户', email: 'manager@test.com' })
        console.log(`✅ UserManager: 添加用户 ${newUser.name}`)
        
        // 测试 EventEmitter
        const emitter = new lib.EventEmitter()
        emitter.on('test', (msg) => console.log(`✅ EventEmitter: ${msg}`))
        emitter.emit('test', '事件触发成功')
        
        // 测试常量
        console.log(`✅ DEFAULT_AVATAR: ${lib.DEFAULT_AVATAR}`)
        console.log(`✅ USER_ROLES: ${JSON.stringify(lib.USER_ROLES)}`)
        console.log(`✅ HTTP_STATUS.OK: ${lib.HTTP_STATUS.OK}`)
        
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
  
  console.log('\n📝 检查文件内容...')
  
  // 检查 ESM 文件
  if (fs.existsSync('es/index.js')) {
    if (!checkFileContent('es/index.js', [
      'export',
      'generateId',
      'validateEmail',
      'createUser',
      'UserManager',
      'EventEmitter'
    ], 'ESM 导出内容')) {
      allPassed = false
    }
  }
  
  // 检查 CommonJS 文件
  if (fs.existsSync('lib/index.cjs')) {
    if (!checkFileContent('lib/index.cjs', [
      'exports.',
      'generateId',
      'validateEmail',
      'createUser',
      'UserManager'
    ], 'CommonJS 导出内容')) {
      allPassed = false
    }
  }
  
  // 检查类型定义文件
  if (fs.existsSync('es/index.d.ts')) {
    if (!checkFileContent('es/index.d.ts', [
      'export interface User',
      'export interface CreateUserOptions',
      'export declare function generateId',
      'export declare function validateEmail',
      'export declare class UserManager',
      'export declare class EventEmitter'
    ], 'TypeScript 类型定义')) {
      allPassed = false
    }
  }
  
  // 检查 UMD 文件
  if (fs.existsSync('dist/index.umd.js')) {
    if (!checkFileContent('dist/index.umd.js', [
      'TypescriptUtils',
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
    console.log('🎉 TypeScript Utils 构建产物验证通过！')
    console.log('✅ 文件完整性检查通过')
    console.log('✅ 内容格式检查通过')
    console.log('✅ 功能测试通过')
    console.log('✅ 类和工具函数测试通过')
  } else {
    console.log('❌ TypeScript Utils 构建产物验证失败！')
    process.exit(1)
  }
}

main().catch(error => {
  console.error('❌ 验证过程出错:', error)
  process.exit(1)
})
