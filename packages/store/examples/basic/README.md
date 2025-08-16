# @ldesign/store 基础示例

这个示例项目展示了 `@ldesign/store` 的核心功能和使用方法。

## 功能展示

### 1. 计数器示例 (CounterExample)

展示基本的状态管理和装饰器使用：

- **@State 装饰器**: 定义响应式状态
- **@Getter 装饰器**: 定义计算属性
- **@Action 装饰器**: 定义状态修改方法
- **响应式更新**: 状态变化自动更新 UI

**核心特性**:

- 基本的增减操作
- 可配置的步长
- 计算属性（绝对值、正负状态）
- 状态重置功能

### 2. 待办事项示例 (TodoExample)

展示列表管理和过滤功能：

- **复杂状态管理**: 管理待办事项列表
- **过滤功能**: 按状态过滤待办事项
- **计算属性**: 统计不同状态的数量
- **列表操作**: 添加、删除、切换状态

**核心特性**:

- 添加新的待办事项
- 标记完成/未完成
- 按状态过滤（全部/活跃/已完成）
- 清除已完成的事项
- 实时统计

### 3. 用户管理示例 (UserExample)

展示异步操作和持久化存储：

- **@AsyncAction 装饰器**: 处理异步操作
- **@PersistentState 装饰器**: 持久化存储
- **错误处理**: 异步操作的错误处理
- **加载状态**: 异步操作的加载状态

**核心特性**:

- 用户登录/登出
- 用户信息持久化
- 异步操作状态管理
- 错误信息显示
- 角色权限管理

## 运行示例

### 安装依赖

```bash
cd packages/store/examples/basic
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
│   ├── CounterExample.vue   # 计数器示例
│   ├── TodoExample.vue      # 待办事项示例
│   └── UserExample.vue      # 用户管理示例
├── stores/              # Store 定义
│   ├── counter.ts          # 计数器 Store
│   ├── todo.ts             # 待办事项 Store
│   └── user.ts             # 用户 Store
├── App.vue              # 主应用组件
├── main.ts              # 应用入口
└── style.css            # 全局样式
```

## 核心概念演示

### 1. 装饰器使用

```typescript
export class CounterStore extends BaseStore {
  @State({ default: 0 })
  count: number = 0

  @Getter({ deps: ['count'] })
  get isPositive(): boolean {
    return this.count > 0
  }

  @Action()
  increment(): void {
    this.count += this.step
  }
}
```

### 2. 异步操作

```typescript
export class UserStore extends BaseStore {
  @AsyncAction()
  async login(email: string, password: string): Promise<void> {
    this.loading = true
    this.error = null

    try {
      // 模拟 API 调用
      const user = await mockLoginAPI(email, password)
      this.user = user
    } catch (error) {
      this.error = error.message
    } finally {
      this.loading = false
    }
  }
}
```

### 3. 持久化存储

```typescript
export class UserStore extends BaseStore {
  @PersistentState({ default: null })
  user: User | null = null

  // 用户信息会自动保存到 localStorage
  // 页面刷新后会自动恢复
}
```

### 4. 计算属性依赖

```typescript
export class TodoStore extends BaseStore {
  @State({ default: [] })
  todos: Todo[] = []

  @State({ default: 'all' })
  filter: 'all' | 'active' | 'completed' = 'all'

  @Getter({ deps: ['todos', 'filter'] })
  get filteredTodos(): Todo[] {
    switch (this.filter) {
      case 'active':
        return this.todos.filter(todo => !todo.completed)
      case 'completed':
        return this.todos.filter(todo => todo.completed)
      default:
        return this.todos
    }
  }
}
```

## 最佳实践

1. **Store 设计**: 每个 Store 负责一个特定的业务领域
2. **状态最小化**: 只存储必要的状态，其他通过计算属性派生
3. **异步处理**: 使用 @AsyncAction 处理异步操作，包含加载和错误状态
4. **持久化**: 对需要跨会话保持的状态使用 @PersistentState
5. **依赖声明**: 为计算属性正确声明依赖，确保缓存有效性

## 技术栈

- **Vue 3**: 前端框架
- **TypeScript**: 类型安全
- **Vite**: 构建工具
- **@ldesign/store**: 状态管理
- **Pinia**: 底层状态管理引擎

## 学习路径

1. 先查看 `CounterExample` 了解基本概念
2. 然后查看 `TodoExample` 学习复杂状态管理
3. 最后查看 `UserExample` 学习异步操作和持久化
4. 阅读各个 Store 的源码理解装饰器使用
5. 尝试修改和扩展功能

## 相关链接

- [完整文档](../../docs/)
- [API 参考](../../docs/api/)
- [更多示例](../)
- [GitHub 仓库](https://github.com/ldesign/store)
