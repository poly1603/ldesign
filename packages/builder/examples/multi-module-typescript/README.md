# 多模块 TypeScript 库示例

这是一个复杂的多模块 TypeScript 库示例，用于验证 @ldesign/builder 的多入口构建功能。

## 📁 项目结构

```
multi-module-typescript/
├── src/
│   ├── index.ts              # 主入口文件
│   ├── config.ts             # 配置文件
│   ├── types/
│   │   └── index.ts          # 类型定义
│   ├── utils/
│   │   ├── index.ts          # 工具函数入口
│   │   ├── string-utils.ts   # 字符串工具
│   │   ├── date-utils.ts     # 日期工具
│   │   ├── validation-utils.ts # 验证工具
│   │   └── format-utils.ts   # 格式化工具
│   └── components/
│       ├── index.ts          # 组件入口
│       ├── Button.ts         # 按钮组件
│       ├── Modal.ts          # 模态框组件
│       └── Form.ts           # 表单组件
├── package.json              # 项目配置
├── ldesign.config.ts         # 构建配置
└── README.md                # 说明文档
```

## 🎯 测试目标

### 1. 多入口构建验证
验证 src/ 目录下的所有 .ts 文件都被作为独立入口进行构建：
- `src/index.ts` → `es/index.js` + `lib/index.cjs`
- `src/config.ts` → `es/config.js` + `lib/config.cjs`
- `src/types/index.ts` → `es/types/index.js` + `lib/types/index.cjs`
- `src/utils/index.ts` → `es/utils/index.js` + `lib/utils/index.cjs`
- `src/utils/string-utils.ts` → `es/utils/string-utils.js` + `lib/utils/string-utils.cjs`
- 等等...

### 2. 模块结构保留
验证嵌套目录结构在输出中得到保留。

### 3. TypeScript 声明文件分发
验证每个模块的 .d.ts 文件都正确分发到 es/ 和 lib/ 目录。

### 4. 模块间依赖处理
验证模块间的相互引用在构建后仍然正确工作。

## 🚀 构建命令

```bash
# 构建项目
pnpm run build

# 清理输出
pnpm run clean
```

## 📦 预期输出结构

```
multi-module-typescript/
├── es/                       # ESM 格式 + .d.ts
├── lib/                      # CJS 格式 + .d.ts
├── dist/                     # UMD 格式
└── types/                    # 原始声明文件
```

## 🔍 验证要点

1. **多入口识别**：确认所有 src/ 下的 .ts 文件都被识别为入口
2. **目录结构**：验证嵌套目录结构在输出中保持一致
3. **文件命名**：确认 ESM 使用 .js，CJS 使用 .cjs 扩展名
4. **声明分发**：验证 .d.ts 文件正确复制到各格式目录
5. **模块引用**：确认相对路径引用在构建后仍然有效
6. **UMD 输出**：验证 UMD 格式正确打包所有模块到单文件

## 📋 功能模块说明

### 类型定义 (types/)
- 基础实体接口、API 响应接口、配置选项类型、枚举定义

### 工具函数 (utils/)
- 字符串处理工具、日期格式化工具、数据验证工具、格式化工具

### 组件模块 (components/)
- Button 按钮组件、Modal 模态框组件、Form 表单组件
