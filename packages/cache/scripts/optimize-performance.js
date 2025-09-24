#!/usr/bin/env node

/**
 * 性能优化脚本
 * 实施各种性能优化措施
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`
}

function log(message, color = 'reset') {
  console.log(colorize(message, color))
}

// 优化 package.json 的 sideEffects 配置
function optimizeSideEffects() {
  log('\n🔧 优化 sideEffects 配置...', 'cyan')
  
  const packagePath = path.join(process.cwd(), 'package.json')
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
  
  // 设置更精确的 sideEffects 配置
  const sideEffects = [
    // 保留可能有副作用的文件
    './src/test-setup.ts',
    './src/vue/cache-provider.ts',
    '**/*.css',
    '**/*.scss',
    '**/*.less'
  ]
  
  pkg.sideEffects = sideEffects
  
  fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n')
  log('✅ sideEffects 配置已优化', 'green')
}

// 创建 .size-limit.json 配置
function createSizeLimitConfig() {
  log('\n📏 创建 size-limit 配置...', 'cyan')
  
  const config = [
    {
      "name": "Main Entry (ESM)",
      "path": "es/index.js",
      "limit": "30 KB",
      "gzip": true
    },
    {
      "name": "Main Entry (CJS)",
      "path": "lib/index.cjs",
      "limit": "30 KB",
      "gzip": true
    },
    {
      "name": "UMD Bundle",
      "path": "dist/index.min.js",
      "limit": "100 KB",
      "gzip": true
    },
    {
      "name": "Core Module",
      "path": "es/core/cache-manager.js",
      "limit": "15 KB",
      "gzip": true
    },
    {
      "name": "Vue Integration",
      "path": "es/vue/index.js",
      "limit": "5 KB",
      "gzip": true
    }
  ]
  
  const configPath = path.join(process.cwd(), '.size-limit.json')
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n')
  log('✅ size-limit 配置已创建', 'green')
}

// 优化 TypeScript 配置以减小输出体积
function optimizeTypeScriptConfig() {
  log('\n⚙️ 优化 TypeScript 配置...', 'cyan')

  const tsconfigPath = path.join(process.cwd(), 'tsconfig.json')

  // 读取并移除注释
  let content = fs.readFileSync(tsconfigPath, 'utf8')
  // 移除单行注释
  content = content.replace(/\/\/.*$/gm, '')
  // 移除多行注释
  content = content.replace(/\/\*[\s\S]*?\*\//g, '')

  const tsconfig = JSON.parse(content)

  // 优化编译选项以减小输出体积
  tsconfig.compilerOptions = {
    ...tsconfig.compilerOptions,
    // 移除注释以减小体积
    removeComments: true,
    // 启用导入助手以减少重复代码
    importHelpers: true,
    // 优化模块解析
    moduleResolution: "bundler",
    // 启用增量编译
    incremental: true,
    // 优化输出
    declaration: true,
    declarationMap: true,
    sourceMap: true
  }

  fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2) + '\n')
  log('✅ TypeScript 配置已优化', 'green')
}

// 创建性能监控配置
function createPerformanceMonitoring() {
  log('\n📊 创建性能监控配置...', 'cyan')
  
  const monitoringScript = `#!/usr/bin/env node

/**
 * 性能监控脚本
 * 监控构建性能和运行时性能
 */

import { performance } from 'perf_hooks'
import fs from 'fs'

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map()
    this.startTime = performance.now()
  }

  mark(name) {
    this.metrics.set(name, performance.now())
  }

  measure(name, startMark) {
    const start = this.metrics.get(startMark) || this.startTime
    const duration = performance.now() - start
    console.log(\`⏱️  \${name}: \${duration.toFixed(2)}ms\`)
    return duration
  }

  report() {
    const totalTime = performance.now() - this.startTime
    console.log(\`\\n📈 总执行时间: \${totalTime.toFixed(2)}ms\`)
    
    // 生成性能报告
    const report = {
      timestamp: new Date().toISOString(),
      totalTime: totalTime,
      metrics: Object.fromEntries(this.metrics)
    }
    
    fs.writeFileSync('performance-report.json', JSON.stringify(report, null, 2))
    console.log('📄 性能报告已保存到 performance-report.json')
  }
}

export default PerformanceMonitor
`
  
  const scriptPath = path.join(process.cwd(), 'scripts', 'performance-monitor.js')
  fs.writeFileSync(scriptPath, monitoringScript)
  log('✅ 性能监控脚本已创建', 'green')
}

// 创建代码分割建议
function createCodeSplittingRecommendations() {
  log('\n🔀 生成代码分割建议...', 'cyan')
  
  const recommendations = `# 代码分割建议

## 当前状况
- 主入口文件: 4.8 KB (gzip: 1.7 KB)
- 最大模块: cache-manager.js (29.8 KB)
- UMD 包: 101.2 KB (gzip: 24.9 KB)

## 建议的分割策略

### 1. 按功能分割
\`\`\`javascript
// 核心功能
import { CacheManager } from '@ldesign/cache/core'

// Vue 集成
import { useCache } from '@ldesign/cache/vue'

// 安全功能
import { SecurityManager } from '@ldesign/cache/security'

// 工具函数
import { compress, validate } from '@ldesign/cache/utils'
\`\`\`

### 2. 按存储引擎分割
\`\`\`javascript
// 基础引擎
import { MemoryEngine } from '@ldesign/cache/engines/memory'

// 浏览器存储
import { LocalStorageEngine } from '@ldesign/cache/engines/local-storage'

// 高级存储
import { IndexedDBEngine } from '@ldesign/cache/engines/indexeddb'
\`\`\`

### 3. 按需加载示例
\`\`\`javascript
// 动态导入大型模块
const { CacheAnalyzer } = await import('@ldesign/cache/core/cache-analyzer')
const { PerformanceMonitor } = await import('@ldesign/cache/core/performance-monitor')
\`\`\`

## 实施步骤
1. 更新 package.json 的 exports 配置
2. 创建独立的入口文件
3. 优化内部依赖关系
4. 测试按需加载功能
`
  
  const docPath = path.join(process.cwd(), 'docs', 'code-splitting.md')
  fs.mkdirSync(path.dirname(docPath), { recursive: true })
  fs.writeFileSync(docPath, recommendations)
  log('✅ 代码分割建议已生成', 'green')
}

// 主函数
function main() {
  log('🚀 开始性能优化...', 'bright')
  
  try {
    optimizeSideEffects()
    createSizeLimitConfig()
    // optimizeTypeScriptConfig() // 跳过自动优化，手动处理
    createPerformanceMonitoring()
    createCodeSplittingRecommendations()
    
    log('\n✨ 性能优化完成!', 'bright')
    log('\n📋 后续步骤:', 'yellow')
    log('1. 运行 pnpm build 重新构建', 'yellow')
    log('2. 运行 pnpm size-check 检查体积', 'yellow')
    log('3. 考虑实施代码分割策略', 'yellow')
    log('4. 监控运行时性能', 'yellow')
    
  } catch (error) {
    log(`❌ 优化过程中出现错误: ${error.message}`, 'red')
    process.exit(1)
  }
}

// 直接运行主函数
main()

export { optimizeSideEffects, createSizeLimitConfig, optimizeTypeScriptConfig }
