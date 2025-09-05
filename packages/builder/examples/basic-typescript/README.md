# 基础 TypeScript 库示例

这是一个最简单的 TypeScript 库示例，用于验证 @ldesign/builder 的基本功能。

## 📁 项目结构

```
basic-typescript/
├── src/
│   └── index.ts          # 单一入口文件
├── package.json          # 项目配置
├── ldesign.config.ts     # 构建配置
└── README.md            # 说明文档
```

## 🎯 测试目标

### 1. 多格式输出验证
- **ESM 格式** → `es/index.js` + `es/index.d.ts`
- **CJS 格式** → `lib/index.cjs` + `lib/index.d.ts`
- **UMD 格式** → `dist/index.umd.js`

### 2. TypeScript 声明文件分发
- 构建时生成声明文件到 `types/` 目录
- 自动复制到 `es/` 和 `lib/` 目录

### 3. 基本功能验证
- 接口导出
- 函数导出
- 常量导出
- TypeScript 类型检查

## 🚀 构建命令

```bash
# 构建项目
pnpm run build

# 清理输出
pnpm run clean
```

## 📦 预期输出结构

```
basic-typescript/
├── es/                   # ESM 格式
│   ├── index.js
│   └── index.d.ts
├── lib/                  # CJS 格式
│   ├── index.cjs
│   └── index.d.ts
├── dist/                 # UMD 格式
│   └── index.umd.js
└── types/                # 原始声明文件
    └── index.d.ts
```

## 🔍 验证要点

1. **文件存在性**：检查所有预期的输出文件是否存在
2. **格式正确性**：验证 ESM/CJS/UMD 格式是否正确
3. **声明文件**：确认 .d.ts 文件正确分发到 es/ 和 lib/
4. **内容完整性**：验证导出的接口、函数、常量是否完整

## 📋 API 说明

### 接口

- `User` - 用户信息接口
- `Options` - 配置选项接口

### 函数

- `createUser(name, email, age?)` - 创建用户
- `validateEmail(email)` - 验证邮箱格式
- `formatUser(user)` - 格式化用户信息

### 常量

- `DEFAULT_OPTIONS` - 默认配置
- `VERSION` - 版本信息
- `LIBRARY_NAME` - 库名称
