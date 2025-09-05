# 复杂库项目示例

这是一个包含高级 TypeScript 特性的复杂库示例，用于全面验证 @ldesign/builder 的构建能力。

## 📁 项目结构

```
complex-library/
├── src/
│   ├── index.ts              # 主入口文件
│   ├── types/
│   │   └── index.ts          # 高级类型定义
│   ├── core/
│   │   ├── index.ts          # 核心模块入口
│   │   ├── Logger.ts         # 日志记录器
│   │   ├── EventEmitter.ts   # 事件发射器
│   │   ├── Container.ts      # 依赖注入容器
│   │   ├── StateManager.ts   # 状态管理器
│   │   └── BaseClass.ts      # 基础抽象类
│   ├── decorators/
│   │   ├── index.ts          # 装饰器入口
│   │   ├── class-decorators.ts    # 类装饰器
│   │   ├── method-decorators.ts   # 方法装饰器
│   │   └── property-decorators.ts # 属性装饰器
│   ├── services/
│   │   ├── index.ts          # 服务入口
│   │   ├── HttpService.ts    # HTTP 服务
│   │   ├── CacheService.ts   # 缓存服务
│   │   └── ValidationService.ts # 验证服务
│   └── utils/
│       ├── index.ts          # 工具入口
│       ├── async-utils.ts    # 异步工具
│       └── type-utils.ts     # 类型工具
├── package.json              # 项目配置
├── ldesign.config.ts         # 构建配置
└── README.md                # 说明文档
```

## 🎯 测试目标

### 1. 高级 TypeScript 特性
- 泛型和高级类型
- 装饰器（类、方法、属性）
- 抽象类和接口
- 命名空间
- 模块声明合并

### 2. 复杂模块结构
- 深层嵌套目录
- 模块间复杂依赖关系
- 循环依赖处理
- 条件类型和映射类型

### 3. 构建配置验证
- experimentalDecorators 支持
- emitDecoratorMetadata 支持
- 外部依赖处理
- 复杂的导出结构

## 🚀 构建命令

```bash
# 构建项目
pnpm run build

# 清理输出
pnpm run clean
```

## 📦 预期输出结构

```
complex-library/
├── es/                       # ESM 格式 + .d.ts
├── lib/                      # CJS 格式 + .d.ts
├── dist/                     # UMD 格式
└── types/                    # 原始声明文件
```

## 🔍 验证要点

1. **装饰器支持**：确认装饰器语法正确编译
2. **泛型保留**：验证复杂泛型在声明文件中正确保留
3. **模块解析**：确认深层嵌套模块正确解析
4. **类型推导**：验证高级类型推导功能
5. **外部依赖**：确认外部依赖正确排除
6. **元数据保留**：验证装饰器元数据正确处理

## 📋 功能模块说明

### 核心模块 (core/)
- Logger - 日志记录器
- EventEmitter - 事件发射器  
- Container - 依赖注入容器
- StateManager - 状态管理器

### 装饰器 (decorators/)
- 类装饰器：@Singleton, @Injectable, @Component
- 方法装饰器：@Cache, @Retry, @Throttle
- 属性装饰器：@Inject, @Validate

### 服务 (services/)
- HttpService - HTTP 请求服务
- CacheService - 缓存服务
- ValidationService - 数据验证服务
