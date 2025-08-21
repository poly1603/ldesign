#!/usr/bin/env node

/**
 * 浏览器环境测试工具
 * 在真实浏览器环境中测试构建产物的兼容性和功能
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// 动态导入playwright，如果不存在则跳过
let chromium = null
try {
  const playwright = await import('playwright')
  chromium = playwright.chromium
}
catch (err) {
  // playwright未安装，将在运行时检查
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 颜色输出
const colors = {
  red: '\x1B[31m',
  green: '\x1B[32m',
  yellow: '\x1B[33m',
  blue: '\x1B[34m',
  magenta: '\x1B[35m',
  cyan: '\x1B[36m',
  white: '\x1B[37m',
  gray: '\x1B[90m',
  reset: '\x1B[0m',
}

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

class BrowserTester {
  constructor(options = {}) {
    this.packageRoot = options.packageRoot || process.cwd()
    this.config = this.loadConfig(options.config)
    this.packageJson = this.loadPackageJson()
    this.browser = null
    this.page = null
  }

  // 加载配置文件
  loadConfig(configPath) {
    const defaultConfig = {
      formats: ['umd', 'es'],
      browsers: ['chromium'], // 可扩展为 ['chromium', 'firefox', 'webkit']
      tests: {
        moduleLoading: true,
        basicFunctionality: true,
        errorHandling: true,
        memoryLeaks: false,
      },
      timeout: 30000,
      headless: true,
      viewport: { width: 1280, height: 720 },
    }

    if (configPath && fs.existsSync(configPath)) {
      try {
        const userConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'))
        return { ...defaultConfig, ...userConfig }
      }
      catch (err) {
        log(`⚠️  配置文件加载失败，使用默认配置: ${err.message}`, 'yellow')
      }
    }

    return defaultConfig
  }

  // 加载package.json
  loadPackageJson() {
    const packageJsonPath = path.join(this.packageRoot, 'package.json')
    if (fs.existsSync(packageJsonPath)) {
      try {
        return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
      }
      catch (err) {
        log(`⚠️  package.json加载失败: ${err.message}`, 'yellow')
      }
    }
    return {}
  }

  // 启动浏览器
  async startBrowser() {
    if (!chromium) {
      log(`❌ Playwright未安装，无法启动浏览器`, 'red')
      log(`   安装命令: npm install -D playwright`, 'gray')
      return false
    }

    try {
      this.browser = await chromium.launch({
        headless: this.config.headless,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      })

      this.page = await this.browser.newPage({
        viewport: this.config.viewport,
      })

      // 监听控制台消息
      this.page.on('console', (msg) => {
        const type = msg.type()
        const text = msg.text()

        if (type === 'error') {
          log(`❌ 浏览器错误: ${text}`, 'red')
        }
        else if (type === 'warning') {
          log(`⚠️  浏览器警告: ${text}`, 'yellow')
        }
        else if (this.config.verbose) {
          log(`📝 浏览器日志: ${text}`, 'gray')
        }
      })

      // 监听页面错误
      this.page.on('pageerror', (error) => {
        log(`❌ 页面错误: ${error.message}`, 'red')
      })

      return true
    }
    catch (err) {
      log(`❌ 启动浏览器失败: ${err.message}`, 'red')
      return false
    }
  }

  // 关闭浏览器
  async closeBrowser() {
    if (this.browser) {
      await this.browser.close()
    }
  }

  // 创建测试HTML页面
  createTestHTML(format, bundlePath) {
    const packageName = this.packageJson.name || 'TestPackage'
    const globalName = this.packageJson.globalName || 'TestPackage'

    let scriptTag = ''
    let testScript = ''

    if (format === 'umd') {
      scriptTag = `<script src="${bundlePath}"></script>`
      testScript = `
        // 测试UMD格式
        if (typeof window.${globalName} === 'undefined') {
          throw new Error('UMD全局变量未定义: ${globalName}');
        }
        
        const lib = window.${globalName};
        console.log('UMD模块加载成功:', lib);
        
        // 测试主要导出
        if (typeof lib.createEngine === 'function') {
          console.log('找到createEngine函数');
          const engine = lib.createEngine();
          console.log('createEngine执行成功:', engine);
        } else if (lib.default && typeof lib.default.createEngine === 'function') {
          console.log('找到default.createEngine函数');
          const engine = lib.default.createEngine();
          console.log('default.createEngine执行成功:', engine);
        } else {
          console.warn('未找到预期的导出函数');
        }
      `
    }
    else if (format === 'es') {
      scriptTag = `<script type="module" src="${bundlePath}"></script>`
      testScript = `
        // 测试ES模块格式
        import * as lib from '${bundlePath}';
        console.log('ES模块加载成功:', lib);
        
        // 测试主要导出
        if (typeof lib.createEngine === 'function') {
          console.log('找到createEngine函数');
          const engine = lib.createEngine();
          console.log('createEngine执行成功:', engine);
        } else if (lib.default && typeof lib.default.createEngine === 'function') {
          console.log('找到default.createEngine函数');
          const engine = lib.default.createEngine();
          console.log('default.createEngine执行成功:', engine);
        } else {
          console.warn('未找到预期的导出函数');
        }
      `
    }

    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bundle Test - ${format.toUpperCase()}</title>
</head>
<body>
    <h1>Bundle Test - ${format.toUpperCase()}</h1>
    <div id="test-result">测试中...</div>
    
    ${scriptTag}
    
    <script ${format === 'es' ? 'type="module"' : ''}>
        let testPassed = false;
        let errorCount = 0;
        
        // 错误处理
        window.addEventListener('error', (event) => {
          console.error('全局错误:', event.error);
          errorCount++;
          document.getElementById('test-result').innerHTML = 
            '<span style="color: red;">测试失败: ' + event.error.message + '</span>';
        });
        
        // 未处理的Promise拒绝
        window.addEventListener('unhandledrejection', (event) => {
          console.error('未处理的Promise拒绝:', event.reason);
          errorCount++;
          document.getElementById('test-result').innerHTML = 
            '<span style="color: red;">测试失败: ' + event.reason + '</span>';
        });
        
        try {
          ${testScript}
          
          // 如果没有错误，标记测试通过
          setTimeout(() => {
            if (errorCount === 0) {
              testPassed = true;
              document.getElementById('test-result').innerHTML = 
                '<span style="color: green;">测试通过</span>';
              console.log('所有测试通过');
            }
          }, 1000);
          
        } catch (error) {
          console.error('测试执行错误:', error);
          errorCount++;
          document.getElementById('test-result').innerHTML = 
            '<span style="color: red;">测试失败: ' + error.message + '</span>';
        }
        
        // 暴露测试结果给外部
        window.testResult = {
          get passed() { return testPassed && errorCount === 0; },
          get errorCount() { return errorCount; }
        };
    </script>
</body>
</html>
    `
  }

  // 测试特定格式的包
  async testFormat(format) {
    log(`🧪 测试 ${format.toUpperCase()} 格式...`, 'cyan')

    const formatPaths = {
      'umd': 'dist/index.js',
      'umd-min': 'dist/index.min.js',
      'es': 'es/index.js',
      'cjs': 'lib/index.js',
    }

    const bundlePath = path.join(this.packageRoot, formatPaths[format])

    if (!fs.existsSync(bundlePath)) {
      log(`⚠️  ${format.toUpperCase()} 格式文件不存在: ${bundlePath}`, 'yellow')
      return { passed: false, reason: '文件不存在' }
    }

    try {
      // 创建测试HTML
      const html = this.createTestHTML(format, bundlePath)
      const tempHtmlPath = path.join(this.packageRoot, `test-${format}.html`)
      fs.writeFileSync(tempHtmlPath, html)

      // 在浏览器中加载测试页面
      const fileUrl = `file://${tempHtmlPath.replace(/\\/g, '/')}`
      await this.page.goto(fileUrl, {
        waitUntil: 'networkidle',
        timeout: this.config.timeout,
      })

      // 等待测试完成
      await this.page.waitForTimeout(2000)

      // 获取测试结果
      const result = await this.page.evaluate(() => {
        return window.testResult || { passed: false, errorCount: 1 }
      })

      // 清理临时文件
      fs.unlinkSync(tempHtmlPath)

      if (result.passed) {
        log(`✅ ${format.toUpperCase()} 格式测试通过`, 'green')
        return { passed: true }
      }
      else {
        log(
          `❌ ${format.toUpperCase()} 格式测试失败 (错误数: ${
            result.errorCount
          })`,
          'red',
        )
        return { passed: false, reason: `${result.errorCount} 个错误` }
      }
    }
    catch (err) {
      log(`❌ ${format.toUpperCase()} 格式测试异常: ${err.message}`, 'red')
      return { passed: false, reason: err.message }
    }
  }

  // 测试外部依赖兼容性
  async testExternalDependencies() {
    if (!this.config.tests.externalDependencies)
      return true

    log('🔗 测试外部依赖兼容性...', 'cyan')

    // 这里可以测试Vue等外部依赖的兼容性
    const dependencies = Object.keys(this.packageJson.peerDependencies || {})

    if (dependencies.length === 0) {
      log('  ℹ️  无外部依赖需要测试', 'blue')
      return true
    }

    for (const dep of dependencies) {
      log(`  测试依赖: ${dep}`, 'gray')
      // 这里可以添加具体的依赖测试逻辑
    }

    return true
  }

  // 运行所有测试
  async runTests() {
    log('🚀 开始浏览器环境测试...', 'cyan')
    log(`📦 包名: ${this.packageJson.name || '未知'}`, 'blue')
    log(`📍 路径: ${this.packageRoot}`, 'gray')
    log('')

    // 启动浏览器
    const browserStarted = await this.startBrowser()
    if (!browserStarted) {
      return false
    }

    try {
      const results = []

      // 测试各种格式
      for (const format of this.config.formats) {
        const result = await this.testFormat(format)
        results.push({ format, ...result })
      }

      // 测试外部依赖
      if (this.config.tests.externalDependencies) {
        await this.testExternalDependencies()
      }

      log('')

      // 汇总结果
      const passedTests = results.filter(r => r.passed)
      const failedTests = results.filter(r => !r.passed)

      log(`📊 测试结果汇总:`, 'cyan')
      log(`  ✅ 通过: ${passedTests.length}`, 'green')
      log(`  ❌ 失败: ${failedTests.length}`, 'red')

      if (failedTests.length > 0) {
        log('\n失败详情:', 'red')
        failedTests.forEach((test) => {
          log(`  - ${test.format}: ${test.reason}`, 'red')
        })
      }

      const allPassed = failedTests.length === 0

      if (allPassed) {
        log('\n🎉 所有浏览器测试通过！', 'green')
      }
      else {
        log('\n❌ 部分浏览器测试失败', 'red')
      }

      return allPassed
    }
    finally {
      await this.closeBrowser()
    }
  }
}

// 命令行接口
async function main() {
  const args = process.argv.slice(2)
  const options = {}

  // 解析命令行参数
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    if (arg === '--config' && args[i + 1]) {
      options.config = args[i + 1]
      i++
    }
    else if (arg === '--package-root' && args[i + 1]) {
      options.packageRoot = args[i + 1]
      i++
    }
    else if (arg === '--headless') {
      options.headless = true
    }
    else if (arg === '--no-headless') {
      options.headless = false
    }
    else if (arg === '--help') {
      console.log(`
使用方法: node browser-tester.js [选项]

选项:
  --config <path>        指定配置文件路径
  --package-root <path>  指定包根目录路径
  --headless             无头模式运行浏览器
  --no-headless          显示浏览器窗口
  --help                 显示帮助信息

示例:
  node browser-tester.js
  node browser-tester.js --config ./browser-test.config.json
  node browser-tester.js --package-root ./packages/my-package --no-headless
      `)
      process.exit(0)
    }
  }

  try {
    const tester = new BrowserTester(options)
    const success = await tester.runTests()
    process.exit(success ? 0 : 1)
  }
  catch (err) {
    log(`❌ 测试过程出错: ${err.message}`, 'red')
    console.error(err.stack)
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (import.meta.url.endsWith('browser-tester.js')) {
  main()
}

export { BrowserTester }
