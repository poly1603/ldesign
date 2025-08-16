# @ldesign/store 高级示例

这个示例项目展示了 `@ldesign/store` 的高级功能和最佳实践。

## 功能展示

### 1. 性能优化示例

- **Store 池管理**: 使用 `@PooledStore` 装饰器优化内存使用
- **性能监控**: 使用 `@MonitorAction` 和 `@MonitorGetter` 监控性能
- **缓存策略**: 展示不同的缓存策略和优化技巧
- **内存管理**: 演示正确的资源清理和内存管理

### 2. 复杂状态管理

- **嵌套状态**: 管理复杂的嵌套数据结构
- **状态组合**: 多个 Store 之间的协作和通信
- **事务处理**: 批量状态更新和回滚机制
- **状态快照**: 状态的保存和恢复功能

### 3. 高级装饰器使用

- **自定义装饰器**: 创建业务特定的装饰器
- **装饰器组合**: 多个装饰器的组合使用
- **条件装饰器**: 根据条件应用不同的装饰器
- **装饰器继承**: 装饰器在继承中的行为

### 4. 企业级功能

- **权限管理**: 基于角色的访问控制
- **审计日志**: 状态变更的审计和追踪
- **数据验证**: 状态更新的验证机制
- **错误边界**: 错误处理和恢复策略

## 运行示例

### 安装依赖

```bash
cd packages/store/examples/advanced
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

### 构建生产版本

```bash
pnpm build
```

## 代码结构

```
src/
├── components/           # Vue 组件
│   ├── performance/         # 性能优化示例
│   ├── complex-state/       # 复杂状态管理
│   ├── decorators/          # 高级装饰器使用
│   └── enterprise/          # 企业级功能
├── stores/              # Store 定义
│   ├── performance/         # 性能优化相关 Store
│   ├── complex/             # 复杂状态 Store
│   ├── decorators/          # 自定义装饰器
│   └── enterprise/          # 企业级 Store
├── utils/               # 工具函数
├── types/               # 类型定义
├── router/              # 路由配置
├── App.vue              # 主应用组件
└── main.ts              # 应用入口
```

## 核心概念演示

### 1. Store 池管理

```typescript
@PooledStore({ maxSize: 10, maxIdleTime: 300000 })
export class OptimizedStore extends BaseStore {
  // Store 实例会被自动池化管理
  // 减少内存分配和垃圾回收压力
}
```

### 2. 性能监控

```typescript
export class MonitoredStore extends BaseStore {
  @MonitorAction
  @Action()
  async heavyOperation(): Promise<void> {
    // 这个方法的执行时间会被自动监控
    // 可以通过 usePerformanceMonitor() 获取性能报告
  }

  @MonitorGetter
  @Getter({ deps: ['data'] })
  get expensiveComputation(): any {
    // 这个计算属性的执行时间会被监控
    return this.data.map(/* 复杂计算 */)
  }
}
```

### 3. 复杂状态管理

```typescript
export class ComplexStore extends BaseStore {
  @State({ default: {} })
  nestedData: NestedDataStructure = {}

  @Action()
  updateNestedValue(path: string[], value: any): void {
    // 使用 Immer 或类似库进行不可变更新
    this.nestedData = produce(this.nestedData, draft => {
      setNestedValue(draft, path, value)
    })
  }

  @Action({ batch: true })
  batchUpdate(updates: Update[]): void {
    // 批量更新，减少重新渲染次数
    updates.forEach(update => {
      this.applyUpdate(update)
    })
  }
}
```

### 4. 自定义装饰器

```typescript
// 创建业务特定的装饰器
export function ValidatedAction(validator: (args: any[]) => boolean) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = function (...args: any[]) {
      if (!validator(args)) {
        throw new Error(`Invalid arguments for ${propertyKey}`)
      }
      return originalMethod.apply(this, args)
    }

    return descriptor
  }
}

// 使用自定义装饰器
export class ValidatedStore extends BaseStore {
  @ValidatedAction(args => args[0] > 0)
  @Action()
  setPositiveValue(value: number): void {
    this.value = value
  }
}
```

### 5. 权限管理

```typescript
export class SecureStore extends BaseStore {
  @RequirePermission('admin')
  @Action()
  adminOnlyAction(): void {
    // 只有管理员权限才能执行
  }

  @AuditLog('user_update')
  @Action()
  updateUser(user: User): void {
    // 用户更新操作会被记录到审计日志
    this.user = user
  }
}
```

## 最佳实践

### 1. 性能优化

- 使用 Store 池减少内存分配
- 监控关键操作的性能
- 合理使用缓存策略
- 避免不必要的重新计算

### 2. 状态设计

- 保持状态结构扁平化
- 使用不可变更新模式
- 合理划分 Store 边界
- 避免循环依赖

### 3. 错误处理

- 实现全局错误边界
- 提供状态恢复机制
- 记录详细的错误信息
- 优雅降级处理

### 4. 测试策略

- 单元测试 Store 逻辑
- 集成测试 Store 协作
- 性能测试关键路径
- 端到端测试用户场景

## 技术栈

- **Vue 3**: 前端框架
- **Vue Router**: 路由管理
- **TypeScript**: 类型安全
- **Vite**: 构建工具
- **@ldesign/store**: 状态管理
- **Pinia**: 底层状态管理引擎

## 学习路径

1. 先了解基础示例的概念
2. 学习性能优化技巧
3. 掌握复杂状态管理模式
4. 探索高级装饰器用法
5. 实践企业级功能

## 相关链接

- [基础示例](../basic/)
- [完整文档](../../docs/)
- [API 参考](../../docs/api/)
- [GitHub 仓库](https://github.com/ldesign/store)
