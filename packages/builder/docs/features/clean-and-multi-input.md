# 清理功能和多入口配置

## 新增功能

### 1. 构建前清理功能

在构建前自动清理输出目录，避免旧文件残留。

**配置示例：**
```typescript
export default defineConfig({
  // 启用清理功能
  clean: true,
  // ...
})
```

**实现细节：**
- 在 `LibraryBuilder.build()` 方法开始时检查 `clean` 配置
- 自动识别所有输出目录（`output.dir`、`output.esm.dir`、`output.cjs.dir`、`output.umd.dir`）
- 使用 `fs.rm()` 递归删除目录内容

### 2. 格式特定的输入配置

每种输出格式可以指定独立的入口文件，支持多入口和通配符。

**类型定义：**
```typescript
interface FormatOutputConfig {
  dir?: string
  input?: string | string[] | Record<string, string>
  format?: OutputFormat
  preserveStructure?: boolean
  dts?: boolean
  sourcemap?: SourcemapType
  // ...
}

interface OutputConfig {
  // 格式特定配置
  esm?: FormatOutputConfig
  cjs?: FormatOutputConfig
  umd?: FormatOutputConfig & {
    name?: string
    globals?: Record<string, string>
  }
  // ...
}
```

**配置示例：**
```typescript
export default defineConfig({
  // 不再需要顶层 input
  // input: 'src/index.ts',
  
  output: {
    esm: {
      dir: 'es',
      format: 'esm',
      preserveStructure: true,
      dts: true,
      // ESM 多入口：所有源文件，排除 index-lib.ts
      input: ['src/**/*.ts', '!src/index-lib.ts'],
    },
    cjs: {
      dir: 'lib',
      format: 'cjs',
      preserveStructure: true,
      dts: true,
      // CommonJS 多入口：所有源文件，排除 index-lib.ts
      input: ['src/**/*.ts', '!src/index-lib.ts'],
    },
    umd: {
      dir: 'dist',
      format: 'umd',
      name: 'MyLibrary',
      minify: true,
      // UMD 单入口
      input: 'src/index-lib.ts',
    },
  },
})
```

### 3. 通配符解析

新增 `glob.ts` 工具文件，提供通配符模式解析功能。

**支持的模式：**
- `src/**/*.ts` - 匹配所有 TypeScript 文件
- `['src/**/*.ts', '!src/index-lib.ts']` - 匹配所有文件但排除特定文件
- `{ main: 'src/index.ts', utils: 'src/utils/index.ts' }` - 多入口配置

**工具函数：**
```typescript
// 解析输入模式
async function resolveInputPatterns(
  input: string | string[] | Record<string, string>,
  rootDir: string = process.cwd()
): Promise<string | string[] | Record<string, string>>

// 规范化入口配置
async function normalizeInput(
  input: string | string[] | Record<string, string> | undefined,
  rootDir: string = process.cwd()
): Promise<string | string[] | Record<string, string>>

// 获取输出目录列表
function getOutputDirs(config: any): string[]
```

## 默认配置

更新了 `DEFAULT_BUILDER_CONFIG`，为每种格式设置了合理的默认值：

```typescript
{
  output: {
    esm: {
      dir: 'es',
      format: 'esm',
      preserveStructure: true,
      dts: true,
      input: ['src/**/*.ts', 'src/**/*.js', 'src/**/*.vue', 'src/**/*.tsx', 'src/**/*.jsx', '!src/index-lib.ts']
    },
    cjs: {
      dir: 'lib',
      format: 'cjs',
      preserveStructure: true,
      dts: true,
      input: ['src/**/*.ts', 'src/**/*.js', 'src/**/*.vue', 'src/**/*.tsx', 'src/**/*.jsx', '!src/index-lib.ts']
    },
    umd: {
      dir: 'dist',
      format: 'umd',
      minify: true,
      sourcemap: true,
      input: 'src/index-lib.ts'
    }
  }
}
```

## 使用指南

### 1. 迁移旧配置

从旧配置迁移到新配置：

**旧配置：**
```typescript
export default defineConfig({
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: ['esm', 'cjs', 'umd']
  }
})
```

**新配置：**
```typescript
export default defineConfig({
  // 移除顶层 input
  output: {
    esm: {
      dir: 'es',
      input: ['src/**/*.ts', '!src/index-lib.ts']
    },
    cjs: {
      dir: 'lib',
      input: ['src/**/*.ts', '!src/index-lib.ts']
    },
    umd: {
      dir: 'dist',
      input: 'src/index-lib.ts'
    }
  }
})
```

### 2. 启用清理功能

```typescript
export default defineConfig({
  clean: true, // 构建前清理输出目录
  // ...
})
```

### 3. 使用通配符

```typescript
export default defineConfig({
  output: {
    esm: {
      // 包含所有 TS 和 Vue 文件
      input: ['src/**/*.ts', 'src/**/*.vue'],
      
      // 或排除特定文件
      input: ['src/**/*.ts', '!src/**/*.test.ts', '!src/**/*.spec.ts'],
      
      // 或使用多入口
      input: {
        main: 'src/index.ts',
        utils: 'src/utils/index.ts',
        components: 'src/components/index.ts'
      }
    }
  }
})
```

## 注意事项

1. **UMD 格式限制**：UMD 格式只支持单入口，不支持数组或对象形式的多入口配置
2. **通配符性能**：使用通配符时会扫描文件系统，大型项目可能会影响构建启动速度
3. **清理安全性**：`clean` 选项只会清理配置的输出目录，不会影响其他目录
4. **向后兼容**：仍然支持顶层 `input` 配置，但推荐使用新的格式特定配置
