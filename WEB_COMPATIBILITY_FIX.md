# Web环境兼容性修复

## 🔍 问题描述

在浏览器环境中使用@ldesign包时，出现了Node.js模块外部化错误，主要原因是：

1. **@ldesign/template包**包含了文件监听功能，使用了`chokidar`和Node.js的`fs`模块
2. **构建配置**没有正确外部化Node.js特定的模块
3. **环境检测**不够完善，导致在Web环境中尝试加载Node.js模块

## 🛠️ 修复方案

### 1. 环境检测和适配

**文件**: `packages/template/src/utils/file-watcher.ts`
- 添加了浏览器环境检测
- 在Web环境中跳过文件监听功能
- 提供友好的警告信息

**文件**: `packages/template/src/scanner/index.ts`
- 添加了环境检测函数
- 根据环境选择合适的扫描器实现
- Web环境使用简化的扫描器

### 2. Web专用扫描器

**文件**: `packages/template/src/utils/template-scanner-web.ts`
- 创建了专门为Web环境设计的模板扫描器
- 使用预定义的模板列表，不依赖文件系统
- 提供完整的模板管理功能

**文件**: `packages/template/src/utils/template-scanner-simple.ts`
- 更新了现有的简化扫描器
- 添加了环境检测
- 确保在Web环境中正常工作

### 3. 构建配置优化

**文件**: `packages/template/.ldesign/builder.config.ts`
- 添加了完整的外部化配置
- 包含所有Node.js内置模块
- 包含第三方Node.js特定模块（如chokidar）
- 确保这些模块不会被打包到最终的bundle中

## 📋 修复的模块列表

### Node.js内置模块
```javascript
'fs', 'path', 'os', 'util', 'events', 'stream', 'crypto', 'http', 'https', 'url', 'buffer',
'child_process', 'worker_threads', 'cluster', 'net', 'tls', 'dns', 'dgram', 'readline',
'perf_hooks', 'timers', 'assert', 'zlib'
```

### Node.js现代导入方式
```javascript
'node:fs', 'node:path', 'node:os', 'node:util', 'node:events', 'node:stream', 'node:crypto',
'node:http', 'node:https', 'node:url', 'node:buffer', 'node:child_process', 'node:worker_threads',
'node:cluster', 'node:net', 'node:tls', 'node:dns', 'node:dgram', 'node:readline',
'node:perf_hooks', 'node:timers', 'node:assert', 'node:zlib', 'node:fs/promises'
```

### 第三方Node.js特定模块
```javascript
'chokidar', 'glob', 'fast-glob', 'fs-extra', 'rimraf', 'chalk', 'ora', 'commander',
'inquirer', 'prompts', 'is-glob', 'readdirp', 'normalize-path', 'braces', 'glob-parent',
'anymatch', 'is-binary-path', 'picomatch', 'is-extglob', 'fill-range', 'binary-extensions',
'to-regex-range', 'is-number'
```

## 🧪 测试验证

创建了`test-web-compatibility.html`文件用于测试Web环境兼容性：

```bash
# 构建包
cd packages/template && pnpm build
cd packages/http && pnpm build  
cd packages/i18n && pnpm build

# 在浏览器中打开测试文件
open test-web-compatibility.html
```

## 🎯 使用方式

### 在Web环境中使用@ldesign/template

```javascript
import { createScanner } from '@ldesign/template'

// 扫描器会自动检测环境并选择合适的实现
const scanner = createScanner({
  templatesDir: 'src/templates',
  enableCache: true,
  watchMode: false // Web环境中文件监听会被自动禁用
})

const result = await scanner.scan()
console.log('扫描结果:', result)
```

### 使用简化扫描器

```javascript
import { simpleTemplateScanner } from '@ldesign/template/utils'

// 直接使用简化扫描器
const result = simpleTemplateScanner.scan()
console.log('模板列表:', result.templates)
```

## ✅ 验证清单

- [x] 文件监听功能在Web环境中被正确禁用
- [x] 模板扫描器在Web环境中使用预定义列表
- [x] 所有Node.js特定模块被正确外部化
- [x] 构建后的包可以在浏览器中正常导入
- [x] 提供了Web环境的测试文件
- [x] 保持了API的向后兼容性

## 🔄 后续优化

1. **动态模板注册**: 在Web环境中提供API让用户动态注册自定义模板
2. **Service Worker支持**: 考虑使用Service Worker实现文件监听的替代方案
3. **更好的错误处理**: 提供更详细的环境兼容性错误信息
4. **性能优化**: 针对Web环境优化模板加载和缓存策略

## 📝 注意事项

1. **文件监听功能**在Web环境中不可用，这是浏览器安全限制
2. **模板扫描**在Web环境中使用预定义列表，需要手动注册自定义模板
3. **构建配置**确保了Node.js模块不会被意外打包，减少了bundle大小
4. **向后兼容**现有的API调用方式保持不变，环境适配是透明的
