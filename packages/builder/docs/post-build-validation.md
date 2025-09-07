# 打包后验证功能

## 📋 概述

打包后验证功能是 `@ldesign/builder` 的一个重要特性，它能够在构建完成后自动验证打包产物的正确性。通过运行测试用例来确保打包前后的功能一致性，帮助开发者及早发现打包过程中可能引入的问题。

## ✨ 主要特性

- **🔍 自动验证**：构建完成后自动运行测试用例
- **🧪 多框架支持**：支持 Vitest、Jest、Mocha 等测试框架
- **🏗️ 临时环境**：创建隔离的验证环境，不影响原项目
- **📊 详细报告**：提供多种格式的验证报告
- **🎯 灵活配置**：支持自定义验证范围和选项
- **🔗 钩子支持**：提供完整的生命周期钩子
- **⚡ 性能监控**：监控验证过程的性能指标

## 🚀 快速开始

### 基础配置

在你的构建配置中启用打包后验证：

```typescript
import { LibraryBuilder } from '@ldesign/builder'

const builder = new LibraryBuilder({
  config: {
    input: 'src/index.ts',
    output: {
      dir: 'dist',
      format: ['esm', 'cjs']
    },
    // 启用打包后验证
    postBuildValidation: {
      enabled: true,
      testFramework: 'vitest', // 或 'jest', 'mocha', 'auto'
      testPattern: ['**/*.test.{js,ts}', '**/*.spec.{js,ts}'],
      timeout: 60000,
      failOnError: true
    }
  }
})

// 执行构建
const result = await builder.build()

// 检查验证结果
if (result.validation) {
  console.log(`验证状态: ${result.validation.success ? '通过' : '失败'}`)
  console.log(`测试结果: ${result.validation.testResult.passedTests}/${result.validation.testResult.totalTests} 通过`)
}
```

### 配置文件方式

你也可以在配置文件中设置：

```typescript
// builder.config.ts
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: ['esm', 'cjs', 'umd']
  },
  postBuildValidation: {
    enabled: true,
    testFramework: 'auto', // 自动检测
    testPattern: ['**/*.test.ts', '**/*.spec.ts'],
    timeout: 120000, // 2分钟超时
    failOnError: true,
    
    // 环境配置
    environment: {
      tempDir: '.validation-temp',
      keepTempFiles: false, // 验证完成后清理临时文件
      installDependencies: true,
      packageManager: 'pnpm'
    },
    
    // 报告配置
    reporting: {
      format: 'html', // 生成 HTML 报告
      outputPath: 'reports/validation-report.html',
      verbose: true,
      includePerformance: true,
      includeCoverage: true
    },
    
    // 验证范围
    scope: {
      formats: ['esm', 'cjs'], // 只验证这些格式
      validateTypes: true,
      validateStyles: true,
      validateSourceMaps: false
    }
  }
})
```

## 📖 配置选项

### 基础配置

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `enabled` | `boolean` | `false` | 是否启用验证 |
| `testFramework` | `'vitest' \| 'jest' \| 'mocha' \| 'auto'` | `'auto'` | 测试框架 |
| `testPattern` | `string \| string[]` | `['**/*.test.{js,ts}', '**/*.spec.{js,ts}']` | 测试文件匹配模式 |
| `timeout` | `number` | `60000` | 验证超时时间（毫秒） |
| `failOnError` | `boolean` | `true` | 验证失败时是否停止构建 |

### 环境配置

```typescript
interface ValidationEnvironmentConfig {
  /** 临时目录路径 */
  tempDir?: string
  /** 是否保留临时文件（用于调试） */
  keepTempFiles?: boolean
  /** 环境变量 */
  env?: Record<string, string>
  /** 包管理器类型 */
  packageManager?: 'npm' | 'yarn' | 'pnpm' | 'auto'
  /** 是否安装依赖 */
  installDependencies?: boolean
  /** 依赖安装超时时间 */
  installTimeout?: number
}
```

### 报告配置

```typescript
interface ValidationReportingConfig {
  /** 报告格式 */
  format?: 'json' | 'html' | 'markdown' | 'console'
  /** 报告输出路径 */
  outputPath?: string
  /** 是否显示详细信息 */
  verbose?: boolean
  /** 日志级别 */
  logLevel?: 'debug' | 'info' | 'warn' | 'error'
  /** 是否包含性能指标 */
  includePerformance?: boolean
  /** 是否包含覆盖率信息 */
  includeCoverage?: boolean
}
```

### 验证范围配置

```typescript
interface ValidationScopeConfig {
  /** 要验证的输出格式 */
  formats?: ('esm' | 'cjs' | 'umd' | 'iife')[]
  /** 要验证的文件类型 */
  fileTypes?: ('js' | 'ts' | 'dts' | 'css' | 'less' | 'scss')[]
  /** 排除的文件模式 */
  exclude?: string[]
  /** 包含的文件模式 */
  include?: string[]
  /** 是否验证类型定义 */
  validateTypes?: boolean
  /** 是否验证样式文件 */
  validateStyles?: boolean
  /** 是否验证源码映射 */
  validateSourceMaps?: boolean
}
```

## 🎣 生命周期钩子

验证功能提供了完整的生命周期钩子，让你可以在验证过程的各个阶段执行自定义逻辑：

```typescript
export default defineConfig({
  // ... 其他配置
  postBuildValidation: {
    enabled: true,
    hooks: {
      // 验证开始前
      beforeValidation: async (context) => {
        console.log('开始验证...')
        // 可以在这里做一些准备工作
      },
      
      // 环境准备后
      afterEnvironmentSetup: async (context) => {
        console.log('验证环境已准备完成')
        // 可以在这里修改临时环境
      },
      
      // 测试运行前
      beforeTestRun: async (context) => {
        console.log('即将运行测试...')
        // 可以在这里设置测试环境变量
      },
      
      // 测试运行后
      afterTestRun: async (context, result) => {
        console.log(`测试完成: ${result.passedTests}/${result.totalTests} 通过`)
        // 可以在这里处理测试结果
      },
      
      // 验证完成后
      afterValidation: async (context, result) => {
        console.log(`验证${result.success ? '成功' : '失败'}`)
        // 可以在这里发送通知或上传报告
      },
      
      // 验证失败时
      onValidationError: async (context, error) => {
        console.error('验证过程出错:', error.message)
        // 可以在这里处理错误，如发送告警
      }
    }
  }
})
```

## 📊 验证报告

验证功能支持多种格式的报告输出：

### 控制台报告

```typescript
postBuildValidation: {
  reporting: {
    format: 'console',
    verbose: true
  }
}
```

输出示例：
```
============================================================
📋 构建验证报告 - build-1234567890
============================================================

✅ 验证状态: 通过

📊 统计信息:
   总测试数: 25
   通过测试: 25
   失败测试: 0
   验证耗时: 15s

💡 建议:
   1. ⚡ 验证耗时较长，建议优化测试性能
============================================================
```

### HTML 报告

```typescript
postBuildValidation: {
  reporting: {
    format: 'html',
    outputPath: 'reports/validation-report.html',
    verbose: true,
    includePerformance: true
  }
}
```

生成美观的 HTML 报告，包含详细的测试结果、性能指标和建议。

### JSON 报告

```typescript
postBuildValidation: {
  reporting: {
    format: 'json',
    outputPath: 'reports/validation-report.json'
  }
}
```

生成结构化的 JSON 报告，便于程序化处理。

### Markdown 报告

```typescript
postBuildValidation: {
  reporting: {
    format: 'markdown',
    outputPath: 'reports/validation-report.md'
  }
}
```

生成 Markdown 格式的报告，便于在文档中展示。

## 🔧 高级用法

### 自定义测试环境

```typescript
postBuildValidation: {
  enabled: true,
  environment: {
    tempDir: '.custom-validation',
    keepTempFiles: true, // 保留临时文件用于调试
    env: {
      NODE_ENV: 'test',
      DEBUG: 'true'
    },
    installDependencies: true,
    installTimeout: 300000 // 5分钟
  }
}
```

### 条件验证

```typescript
postBuildValidation: {
  enabled: process.env.NODE_ENV === 'production', // 只在生产环境验证
  failOnError: process.env.CI === 'true', // 只在 CI 环境中失败时停止构建
}
```

### 多格式验证

```typescript
postBuildValidation: {
  enabled: true,
  scope: {
    formats: ['esm', 'cjs', 'umd'], // 验证所有格式
    validateTypes: true,
    validateStyles: true,
    exclude: ['**/*.d.ts', '**/node_modules/**']
  }
}
```

## 🐛 故障排除

### 常见问题

1. **验证超时**
   ```typescript
   postBuildValidation: {
     timeout: 120000, // 增加超时时间到2分钟
   }
   ```

2. **依赖安装失败**
   ```typescript
   postBuildValidation: {
     environment: {
       packageManager: 'npm', // 指定包管理器
       installTimeout: 600000, // 增加安装超时时间
     }
   }
   ```

3. **测试框架检测失败**
   ```typescript
   postBuildValidation: {
     testFramework: 'vitest', // 明确指定测试框架
   }
   ```

4. **临时文件清理问题**
   ```typescript
   postBuildValidation: {
     environment: {
       keepTempFiles: true, // 保留临时文件用于调试
     }
   }
   ```

### 调试模式

启用详细日志来调试验证过程：

```typescript
postBuildValidation: {
  enabled: true,
  reporting: {
    logLevel: 'debug',
    verbose: true
  },
  environment: {
    keepTempFiles: true // 保留临时文件
  }
}
```

## 🔗 API 参考

### PostBuildValidator

主要的验证器类：

```typescript
class PostBuildValidator {
  constructor(config?: PostBuildValidationConfig, options?: ValidatorOptions)
  
  async validate(context: ValidationContext): Promise<ValidationResult>
  setConfig(config: PostBuildValidationConfig): void
  getConfig(): PostBuildValidationConfig
  async dispose(): Promise<void>
}
```

### ValidationResult

验证结果接口：

```typescript
interface ValidationResult {
  success: boolean
  duration: number
  testResult: TestRunResult
  report: ValidationReport
  errors: ValidationError[]
  warnings: ValidationWarning[]
  stats: ValidationStats
  timestamp: number
  validationId: string
}
```

## 📝 最佳实践

1. **合理设置超时时间**：根据项目大小和测试复杂度设置合适的超时时间
2. **使用钩子进行自定义**：利用生命周期钩子实现自定义逻辑
3. **选择合适的报告格式**：根据使用场景选择合适的报告格式
4. **在 CI/CD 中启用**：在持续集成环境中启用验证以确保代码质量
5. **定期清理临时文件**：避免临时文件占用过多磁盘空间
6. **监控验证性能**：关注验证耗时，必要时进行优化

## 🤝 贡献

如果你发现问题或有改进建议，欢迎提交 Issue 或 Pull Request。

## 📄 许可证

MIT License
