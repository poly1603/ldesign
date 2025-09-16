# TypeScript 工具库示例

这是一个使用 @ldesign/builder 构建的 TypeScript 工具库示例，展示了如何构建纯 TypeScript 函数库。

## 📁 项目结构

```
typescript-utils/
├── src/
│   └── index.ts          # 主入口文件
├── ldesign.config.ts     # 构建配置
├── package.json          # 项目配置
├── tsconfig.json         # TypeScript 配置
└── README.md            # 项目说明
```

## 🚀 特性展示

### 1. 类型定义
- 接口定义 (`User`, `CreateUserOptions`, `ApiResponse`)
- 类型联合 (`UserRole`)
- 泛型支持 (`ApiResponse<T>`)

### 2. 工具函数
- 数据验证 (`validateEmail`)
- 数据处理 (`deepClone`, `formatUserName`)
- 性能优化 (`debounce`, `throttle`)
- ID 生成 (`generateId`)

### 3. 类导出
- 用户管理器 (`UserManager`)
- 事件发射器 (`EventEmitter`)

### 4. 常量导出
- 默认值 (`DEFAULT_AVATAR`)
- 枚举对象 (`USER_ROLES`, `HTTP_STATUS`)

### 5. 默认导出
- 预配置的用户管理器实例

## 🛠️ 构建命令

```bash
# 安装依赖
pnpm install

# 构建项目
pnpm build

# 开发模式（监听文件变化）
pnpm dev

# 清理输出目录
pnpm clean

# 分析构建结果
pnpm analyze
```

## 📦 构建输出

构建完成后，将在 `dist` 目录生成以下文件：

```
dist/
├── index.js          # ESM 格式
├── index.cjs         # CJS 格式
├── index.d.ts        # TypeScript 声明文件
├── index.js.map      # ESM Source Map
└── index.cjs.map     # CJS Source Map
```

## 📖 使用示例

### ESM 导入

```typescript
import userManager, { 
  createUser, 
  UserManager, 
  EventEmitter,
  validateEmail,
  debounce,
  type User,
  type CreateUserOptions 
} from '@example/typescript-utils'

// 使用默认导出的用户管理器
const user = userManager.addUser({
  name: 'John Doe',
  email: 'john@example.com'
})

// 使用工具函数
const isValid = validateEmail('test@example.com')

// 使用防抖函数
const debouncedFn = debounce(() => {
  console.log('Debounced!')
}, 300)

// 使用类
const manager = new UserManager()
const emitter = new EventEmitter<{
  userAdded: [User]
  userRemoved: [number]
}>()

emitter.on('userAdded', (user) => {
  console.log('User added:', user.name)
})
```

### CJS 导入

```javascript
const userManager = require('@example/typescript-utils')
const { createUser, UserManager, validateEmail } = userManager

// 使用默认导出
const user = userManager.default.addUser({
  name: 'Jane Doe',
  email: 'jane@example.com'
})

// 使用命名导出
const isValid = validateEmail('test@example.com')
```

## ⚙️ 配置说明

### .ldesign/builder.config.ts

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 入口文件
  input: 'src/index.ts',
  
  // 输出配置
  output: {
    dir: 'dist',
    format: ['esm', 'cjs'],  // 生成 ESM 和 CJS 两种格式
    sourcemap: true          // 生成 Source Map
  },
  
  // 库类型（自动应用 TypeScript 策略）
  libraryType: 'typescript',
  
  // TypeScript 配置
  typescript: {
    declaration: true,       // 生成声明文件
    declarationDir: 'dist',  // 声明文件输出目录
    target: 'ES2020',       // 编译目标
    module: 'ESNext',       // 模块格式
    strict: true            // 严格模式
  },
  
  // 性能配置
  performance: {
    treeshaking: true,      // Tree Shaking
    minify: true,          // 代码压缩
    bundleAnalyzer: false  // 构建分析
  }
})
```

## 🎯 最佳实践

### 1. 类型安全
- 为所有公共 API 提供完整的类型定义
- 使用 `interface` 定义对象结构
- 使用 `type` 定义联合类型和别名
- 启用 TypeScript 严格模式

### 2. 导出策略
- 使用命名导出提供具体功能
- 使用默认导出提供主要实例
- 导出类型定义供用户使用
- 保持导出的一致性

### 3. 文档注释
- 为所有公共 API 添加 JSDoc 注释
- 提供使用示例和参数说明
- 说明返回值和可能的异常

### 4. 错误处理
- 对输入参数进行验证
- 提供有意义的错误信息
- 使用 TypeScript 类型系统减少运行时错误

### 5. 性能考虑
- 提供防抖和节流等性能优化工具
- 避免不必要的对象创建
- 合理使用 Tree Shaking

## 🔧 开发技巧

### 1. 调试
- 使用 Source Map 进行调试
- 在开发模式下使用 `pnpm dev` 监听文件变化

### 2. 测试
- 可以集成 Vitest 或 Jest 进行单元测试
- 测试所有公共 API 的功能

### 3. 发布
- 确保 `package.json` 中的 `exports` 字段正确
- 检查生成的声明文件是否完整
- 验证在不同环境下的兼容性

## 📚 扩展功能

基于这个示例，你可以：

1. **添加更多工具函数**：日期处理、字符串操作、数组操作等
2. **集成测试框架**：添加 Vitest 或 Jest 测试
3. **添加 Lint 工具**：ESLint + Prettier 代码规范
4. **生成 API 文档**：使用 TypeDoc 自动生成文档
5. **添加 CI/CD**：自动化构建、测试和发布流程

这个示例展示了使用 @ldesign/builder 构建 TypeScript 工具库的完整流程和最佳实践。
