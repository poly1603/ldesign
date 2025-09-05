# Rollup 动态配置系统

这个项目使用了一个高级的 Rollup 配置系统，支持多入口和通配符模式，能够自动发现和配置项目中的所有模块。

## 功能特性

### 🎯 自动入口发现

- **标准模块**: `src/*/index.ts` - 自动发现所有一级子目录中的 index.ts 文件
- **嵌套模块**: `src/*/*/index.ts` - 支持二级嵌套的子模块
- **自定义入口**: `src/**/*.entry.ts` - 支持自定义入口文件（使用 `.entry.ts` 后缀）

### 🔧 灵活配置

- 支持排除特定模块
- 支持排除特定文件模式
- 动态生成构建配置和类型声明文件
- Windows/Unix 路径兼容性

### 📦 输出格式

- CommonJS (`*.cjs`)
- ES Modules (`*.js`)
- TypeScript 声明文件 (`*.d.ts`)
- Source maps 支持

## 配置选项

### 环境变量

| 变量名           | 默认值  | 描述                 |
| ---------------- | ------- | -------------------- |
| `ROLLUP_DYNAMIC` | `true`  | 是否使用动态配置模式 |
| `ROLLUP_VERBOSE` | `false` | 是否显示详细构建信息 |

### 构建配置

```javascript
const BUILD_CONFIG = {
  // 支持的入口模式
  entryPatterns: [
    'src/*/index.ts', // 标准子模块入口
    'src/*/*/index.ts', // 嵌套子模块入口
    'src/**/*.entry.ts', // 自定义入口文件
  ],

  // 排除的模块和文件
  excludes: {
    modules: [
      'archive', // 特定模块
      'test', // 测试目录
      'types', // 仅类型定义目录
    ],
    patterns: ['**/test/**', '**/*.test.ts', '**/*.spec.ts', '**/*.d.ts'],
  },

  // 输出配置
  output: {
    sourcemap: true,
    minify: false,
  },
}
```

## 使用方法

### 1. 标准模块

创建标准的子模块结构：

```
src/
  your-module/
    index.ts        # 主入口文件
    types.ts        # 类型定义
    utils.ts        # 工具函数
```

构建输出：

- `dist/your-module/index.cjs`
- `dist/your-module/index.js`
- `dist/your-module/index.d.ts`

### 2. 嵌套模块

创建嵌套的子模块结构：

```
src/
  builder/
    vite/
      index.ts      # Vite 构建器入口
    rollup/
      index.ts      # Rollup 构建器入口
```

构建输出：

- `dist/builder/vite/index.cjs`
- `dist/builder/vite/index.js`
- `dist/builder/vite/index.d.ts`

### 3. 自定义入口

创建自定义入口文件：

```
src/
  utils/
    http.entry.ts   # HTTP 工具入口
    file.entry.ts   # 文件工具入口
```

构建输出：

- `dist/utils/http/index.cjs`
- `dist/utils/http/index.js`
- `dist/utils/http/index.d.ts`

## 命令行使用

### 开发模式（详细日志）

```bash
# Windows PowerShell
$env:ROLLUP_VERBOSE="true"; rollup -c

# Unix/Linux/macOS
ROLLUP_VERBOSE=true rollup -c
```

### 传统配置模式

```bash
# Windows PowerShell
$env:ROLLUP_DYNAMIC="false"; rollup -c

# Unix/Linux/macOS
ROLLUP_DYNAMIC=false rollup -c
```

### 测试配置

```bash
node test-rollup-config.js
```

## Package.json 配置建议

```json
{
  "scripts": {
    "build": "rollup -c",
    "build:verbose": "cross-env ROLLUP_VERBOSE=true rollup -c",
    "build:legacy": "cross-env ROLLUP_DYNAMIC=false rollup -c",
    "test:config": "node test-rollup-config.js"
  }
}
```

## 优势

### 相比传统配置

1. **自动化**: 无需手动维护模块列表
2. **扩展性**: 新增模块自动被发现和构建
3. **一致性**: 确保所有模块使用相同的构建配置
4. **维护性**: 减少配置文件的复杂度

### 相比 Vite

1. **专为库设计**: Rollup 更适合库的打包需求
2. **多格式输出**: 原生支持 CommonJS + ES Modules
3. **Tree-shaking**: 更好的摇树优化
4. **体积控制**: 生成的包更小

## 故障排除

### 模块未被发现

1. 确认文件路径符合支持的模式
2. 检查是否在排除列表中
3. 验证 index.ts 文件是否存在
4. 使用 `ROLLUP_VERBOSE=true` 查看详细信息

### Windows 路径问题

配置已包含 Windows 路径兼容性处理，自动将反斜杠转换为正斜杠。

### 性能优化

- 使用更具体的入口模式减少文件扫描
- 合理设置排除模式避免不必要的处理
- 考虑使用 `preserveModules` 选项（在配置中可调整）

## 示例项目结构

```
packages/kit/
├── src/
│   ├── index.ts              # 主入口
│   ├── filesystem/
│   │   ├── index.ts          # 标准模块
│   │   └── utils.ts
│   ├── builder/
│   │   ├── index.ts          # 标准模块
│   │   ├── base/
│   │   │   └── index.ts      # 嵌套模块
│   │   ├── vite/
│   │   │   └── index.ts      # 嵌套模块
│   │   └── rollup/
│   │       └── index.ts      # 嵌套模块
│   └── utils/
│       ├── index.ts          # 标准模块
│       ├── http.entry.ts     # 自定义入口
│       └── crypto.entry.ts   # 自定义入口
├── rollup.config.js          # 动态配置文件
├── test-rollup-config.js     # 配置测试脚本
└── dist/                     # 构建输出
    ├── index.cjs
    ├── index.js
    ├── index.d.ts
    ├── filesystem/
    ├── builder/
    │   ├── index.cjs
    │   ├── base/
    │   ├── vite/
    │   └── rollup/
    └── utils/
        ├── index.cjs
        ├── http/
        └── crypto/
```

这个配置系统让您能够专注于开发功能，而无需担心构建配置的维护。
