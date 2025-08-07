# 🔍 构建产物校验工具

这个目录包含了用于校验和分析构建产物的完整工具集，确保所有包的构建质量和浏览器兼容性。

## 📋 工具概览

| 工具                  | 功能         | 用途                                 |
| --------------------- | ------------ | ------------------------------------ |
| `validate-build.js`   | 统一校验入口 | 运行完整的构建产物校验流程           |
| `bundle-validator.js` | 基础校验器   | 检查测试文件、导入、包大小等基础问题 |
| `bundle-analyzer.js`  | 包分析器     | 详细分析包大小、依赖关系、代码质量   |
| `browser-tester.js`   | 浏览器测试器 | 在真实浏览器环境中测试兼容性         |

## 🚀 快速开始

### 1. 完整校验（推荐）

```bash
# 在包根目录运行
node ../../tools/scripts/build/validate-build.js

# 或在项目根目录运行
node tools/scripts/build/validate-build.js --package-root ./packages/engine
```

### 2. 单独运行各个工具

```bash
# 基础校验
node tools/scripts/build/bundle-validator.js

# 包分析
node tools/scripts/build/bundle-analyzer.js

# 浏览器测试（需要安装playwright）
node tools/scripts/build/browser-tester.js
```

## 🔧 配置文件

### 创建配置文件

```bash
# 创建默认配置文件
node tools/scripts/build/validate-build.js --create-config ./build-validator.config.json
```

### 配置文件示例

```json
{
  "steps": {
    "validate": true,
    "analyze": true,
    "browserTest": false
  },
  "validator": {
    "formats": ["umd", "es", "cjs", "types"],
    "checks": {
      "testFiles": true,
      "imports": true,
      "bundleSize": true,
      "sourceMaps": true,
      "moduleFormats": true,
      "dependencies": true
    },
    "thresholds": {
      "maxBundleSize": 2097152,
      "maxWarningSize": 512000
    }
  },
  "analyzer": {
    "analysis": {
      "bundleSize": true,
      "directoryStructure": true,
      "dependencies": true,
      "codeQuality": true,
      "performance": true,
      "duplicates": true
    }
  },
  "browserTester": {
    "formats": ["umd", "es"],
    "browsers": ["chromium"],
    "headless": true,
    "tests": {
      "moduleLoading": true,
      "basicFunctionality": true,
      "errorHandling": true
    }
  }
}
```

### 在 package.json 中配置

```json
{
  "buildValidator": {
    "steps": {
      "validate": true,
      "analyze": true,
      "browserTest": false
    },
    "validator": {
      "thresholds": {
        "maxBundleSize": 1048576,
        "maxWarningSize": 256000
      }
    }
  }
}
```

## 📊 校验内容

### 基础校验 (bundle-validator.js)

- ✅ **测试文件检查**: 确保构建产物中不包含测试文件
- ✅ **模块导入验证**: 验证 ES 模块和类型定义的导入是否正常
- ✅ **包大小检查**: 检查各种格式的包大小是否在合理范围内
- ✅ **源码映射验证**: 检查源码映射文件的完整性

### 包分析 (bundle-analyzer.js)

- 📦 **包大小分析**: 详细分析各种格式的包大小和压缩比
- 📁 **目录结构分析**: 分析构建产物的目录结构和文件分布
- 🔗 **依赖关系分析**: 分析模块导入和依赖关系
- ✨ **代码质量检查**: 检查源码映射、类型定义、模块格式等
- 🔍 **重复代码检测**: 检测不同格式间的重复代码
- 💡 **性能建议**: 提供包大小和性能优化建议

### 浏览器测试 (browser-tester.js)

- 🧪 **UMD 格式测试**: 在浏览器中测试 UMD 格式的加载和执行
- 📦 **ES 模块测试**: 测试 ES 模块在浏览器中的兼容性
- 🔗 **外部依赖测试**: 验证外部依赖（如 Vue）的正确引用
- ❌ **错误处理测试**: 检测运行时错误和警告
- 🎯 **功能验证**: 验证主要导出函数的正常工作

## 🎯 使用场景

### 开发阶段

```bash
# 在package.json中添加脚本
{
  "scripts": {
    "build:check": "pnpm run build && node ../../tools/scripts/build/bundle-validator.js",
    "build:analyze": "pnpm run build && node ../../tools/scripts/build/bundle-analyzer.js",
    "build:validate": "pnpm run build && node ../../tools/scripts/build/validate-build.js"
  }
}
```

### CI/CD 集成

```yaml
# GitHub Actions 示例
- name: Build and Validate
  run: |
    pnpm build
    node tools/scripts/build/validate-build.js --package-root ./packages/engine

- name: Browser Testing
  run: |
    npx playwright install chromium
    node tools/scripts/build/browser-tester.js --package-root ./packages/engine
```

### 发布前检查

```bash
# 完整校验流程
pnpm build
node tools/scripts/build/validate-build.js

# 如果需要浏览器测试
npm install -D playwright
npx playwright install chromium
node tools/scripts/build/validate-build.js --config ./config-with-browser-test.json
```

## 🛠️ 高级用法

### 自定义校验规则

```javascript
// 在配置文件中自定义阈值
{
  "validator": {
    "thresholds": {
      "maxBundleSize": 1048576,  // 1MB
      "maxWarningSize": 256000   // 250KB
    },
    "testPatterns": [
      "\\.test\\.",
      "\\.spec\\.",
      "__tests__",
      "__mocks__",
      "test-utils"  // 自定义测试文件模式
    ]
  }
}
```

### 多包批量校验

```bash
# 为所有包运行校验
for package in packages/*; do
  if [ -d "$package" ]; then
    echo "Validating $package..."
    node tools/scripts/build/validate-build.js --package-root "$package"
  fi
done
```

### 集成到构建流程

```javascript
// rollup.config.js 中的插件示例
import { BundleValidator } from '../../tools/scripts/build/bundle-validator.js'

export default {
  // ... 其他配置
  plugins: [
    // ... 其他插件
    {
      name: 'validate-bundle',
      writeBundle: async () => {
        const validator = new BundleValidator()
        const success = await validator.validate()
        if (!success) {
          throw new Error('Bundle validation failed')
        }
      },
    },
  ],
}
```

## 🔧 故障排除

### 常见问题

#### 1. TypeScript 类型错误

```bash
# 问题：找不到Vue的类型定义
# 解决：确保从'vue'导入，而不是'@vue/runtime-core'
import { createApp } from 'vue'  // ✅ 正确
import { createApp } from '@vue/runtime-core'  // ❌ 错误
```

#### 2. 浏览器测试失败

```bash
# 问题：playwright未安装
# 解决：安装playwright
npm install -D playwright
npx playwright install chromium

# 问题：测试超时
# 解决：增加超时时间
{
  "browserTester": {
    "timeout": 60000  // 60秒
  }
}
```

#### 3. 包大小超限

```bash
# 问题：包大小超过阈值
# 解决：分析包内容并优化
node tools/scripts/build/bundle-analyzer.js

# 查看详细的包分析报告
# 根据建议进行优化
```

### 调试模式

```bash
# 启用详细日志
node tools/scripts/build/validate-build.js --verbose

# 浏览器测试显示窗口（调试用）
node tools/scripts/build/browser-tester.js --no-headless
```

## 📈 最佳实践

1. **定期运行校验**: 在每次构建后运行基础校验
2. **发布前完整校验**: 发布前运行包括浏览器测试的完整校验
3. **自定义阈值**: 根据项目需求调整包大小阈值
4. **CI/CD 集成**: 将校验集成到持续集成流程中
5. **监控趋势**: 定期分析包大小和性能趋势

## 🤝 扩展开发

这些工具都是模块化设计，可以轻松扩展：

```javascript
// 扩展校验器
import { BundleValidator } from './bundle-validator.js'

class CustomValidator extends BundleValidator {
  // 添加自定义校验逻辑
  checkCustomRules() {
    // 自定义校验实现
  }
}
```

## 📞 获取帮助

```bash
# 查看帮助信息
node tools/scripts/build/validate-build.js --help
node tools/scripts/build/bundle-validator.js --help
node tools/scripts/build/bundle-analyzer.js --help
node tools/scripts/build/browser-tester.js --help
```

---

🎯 **提示**: 建议在开发过程中经常运行这些校验工具，以确保构建产物的质量和兼容性！
