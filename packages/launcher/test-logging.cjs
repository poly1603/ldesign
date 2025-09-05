#!/usr/bin/env node

/**
 * 日志系统测试脚本
 * 
 * 用于验证日志输出优化和配置文件加载修复
 */

const { Logger } = require('./dist/index.cjs')

console.log('🧪 测试 @ldesign/launcher 日志系统优化\n')

// 测试 1: 简洁模式
console.log('📋 测试 1: 简洁模式日志输出')
console.log('=' .repeat(50))

const compactLogger = new Logger('TestCompact', { 
  compact: true,
  colors: true 
})

compactLogger.info('启动开发服务器', { 
  host: 'localhost', 
  port: 3000,
  url: 'http://localhost:3000/',
  someInternalData: { complex: 'object', should: 'be', filtered: 'out' }
})

compactLogger.success('服务器启动成功', { 
  url: 'http://localhost:3000/',
  duration: 1250,
  internalConfig: { verbose: true, debug: false }
})

compactLogger.warn('端口被占用，尝试其他端口', { 
  port: 3000,
  newPort: 3001 
})

compactLogger.error('配置文件加载失败', { 
  error: 'Cannot convert undefined or null to object',
  path: './launcher.config.ts',
  suggestion: '请检查配置文件语法'
})

console.log('\n📋 测试 2: 标准模式日志输出')
console.log('=' .repeat(50))

// 测试 2: 标准模式
const standardLogger = new Logger('TestStandard', { 
  compact: false,
  colors: true,
  timestamp: true 
})

standardLogger.info('启动开发服务器', { 
  host: 'localhost', 
  port: 3000,
  config: { 
    build: { outDir: 'dist' },
    server: { host: 'localhost' }
  }
})

standardLogger.debug('检测项目类型', {
  packageJson: { dependencies: { vue: '^3.0.0' } },
  detectedType: 'vue3',
  plugins: ['@vitejs/plugin-vue']
})

console.log('\n📋 测试 3: 数据过滤功能')
console.log('=' .repeat(50))

const filterLogger = new Logger('TestFilter', { compact: true })

// 应该显示的重要数据
filterLogger.info('重要信息', { 
  url: 'http://localhost:3000',
  port: 3000,
  duration: 1500,
  count: 5
})

// 应该被过滤的复杂数据
filterLogger.info('复杂数据', {
  complexObject: {
    nested: {
      deeply: {
        buried: 'data'
      }
    }
  },
  internalState: {
    cache: new Map(),
    watchers: [],
    plugins: []
  }
})

console.log('\n✅ 日志系统测试完成!')
console.log('\n📝 测试结果说明:')
console.log('- 简洁模式: 使用图标，只显示关键信息')
console.log('- 标准模式: 显示时间戳和完整信息')  
console.log('- 数据过滤: 自动过滤不重要的内部数据')
console.log('- 错误处理: 提供友好的错误信息和建议')
