# 使用指南

## 🚀 快速开始

### 环境准备

在开始使用 LDesign Engine 演示应用之前，请确保您的开发环境满足以下要求：

```bash
# 检查 Node.js 版本 (需要 >= 18.0.0)
node --version

# 检查 pnpm 版本 (需要 >= 8.0.0)
pnpm --version

# 如果没有安装 pnpm，可以通过以下命令安装
npm install -g pnpm
```

### 安装和启动

1. **克隆项目**

```bash
git clone https://github.com/ldesign/ldesign.git
cd ldesign/packages/app
```

2. **安装依赖**

```bash
pnpm install
```

3. **启动开发服务器**

```bash
pnpm dev
```

4. **打开浏览器** 访问 `http://localhost:3000` 即可看到演示应用

## 🎯 功能导航

### 主界面布局

演示应用采用经典的三栏布局：

```
┌─────────────────────────────────────────────────────────┐
│                      Header                             │
├─────────────┬───────────────────────────────────────────┤
│             │                                           │
│   Sidebar   │            Main Content                   │
│             │                                           │
│  - 概览     │  ┌─────────────────────────────────────┐  │
│  - 插件系统 │  │                                     │  │
│  - 中间件   │  │         演示内容区域                │  │
│  - 状态管理 │  │                                     │  │
│  - 事件系统 │  │                                     │  │
│  - 日志系统 │  └─────────────────────────────────────┘  │
│  - 通知系统 │                                           │
│  - 指令管理 │                                           │
│  - 缓存管理 │                                           │
│  - 性能监控 │                                           │
│  - 安全管理 │                                           │
└─────────────┴───────────────────────────────────────────┘
```

### 核心功能模块

#### 1. 🏠 功能概览

- **位置**: 默认首页
- **功能**: 展示 LDesign Engine 的整体功能和状态
- **特色**:
  - 引擎状态实时监控
  - 功能模块快速导航
  - 系统信息展示

#### 2. 🔌 插件系统

- **位置**: 侧边栏 → 插件系统
- **功能**: 演示插件的注册、卸载、管理
- **操作指南**:
  ```typescript
  // 1. 查看已注册插件列表
  // 2. 编辑插件代码
  // 3. 点击"运行"按钮执行代码
  // 4. 查看执行结果
  // 5. 测试插件功能
  ```

#### 3. ⚡ 中间件系统

- **位置**: 侧边栏 → 中间件
- **功能**: 展示中间件的执行流程和管理
- **特色**:
  - 中间件列表展示
  - 执行顺序可视化
  - 优先级管理

#### 4. 📦 状态管理

- **位置**: 侧边栏 → 状态管理
- **功能**: 演示状态的创建、更新、删除
- **操作步骤**:
  1. 查看当前状态列表
  2. 添加新的状态项
  3. 修改现有状态
  4. 删除不需要的状态

#### 5. 📡 事件系统

- **位置**: 侧边栏 → 事件系统
- **功能**: 展示事件的发布、订阅、管理
- **使用方法**:
  ```javascript
  // 发送自定义事件
  {
    "eventName": "custom:event",
    "data": {"message": "Hello World"}
  }
  ```

#### 6. 📝 日志系统

- **位置**: 侧边栏 → 日志系统
- **功能**: 演示多级别日志记录
- **日志级别**:
  - `DEBUG`: 调试信息
  - `INFO`: 一般信息
  - `WARN`: 警告信息
  - `ERROR`: 错误信息

#### 7. 🔔 通知系统

- **位置**: 侧边栏 → 通知系统
- **功能**: 展示各种类型的通知
- **通知类型**:
  - 成功通知 (绿色)
  - 错误通知 (红色)
  - 警告通知 (橙色)
  - 信息通知 (蓝色)

#### 8. 🎯 指令管理

- **位置**: 侧边栏 → 指令管理
- **功能**: 演示自定义指令的使用
- **示例指令**:
  - 点击统计指令
  - 悬停监听指令
  - 自定义交互指令

#### 9. 💾 缓存管理

- **位置**: 侧边栏 → 缓存管理
- **功能**: 展示缓存的设置、获取、清除
- **操作流程**:
  1. 设置缓存键值对
  2. 查看缓存统计信息
  3. 获取指定缓存
  4. 删除单个缓存
  5. 清空所有缓存

#### 10. 📊 性能监控

- **位置**: 侧边栏 → 性能监控
- **功能**: 实时性能指标监控
- **监控指标**:
  - 内存使用量
  - 加载时间
  - 渲染时间
  - API 调用次数

#### 11. 🔒 安全管理

- **位置**: 侧边栏 → 安全管理
- **功能**: 演示安全防护功能
- **安全特性**:
  - XSS 攻击防护
  - 输入内容清理
  - 安全验证机制

## 🎮 交互操作

### 基本操作

1. **侧边栏导航**

   - 点击侧边栏中的功能模块切换演示内容
   - 支持键盘导航 (Tab 键)
   - 响应式设计，移动端自动折叠

2. **代码编辑器**

   - 实时代码编辑
   - 语法高亮显示
   - 错误提示
   - 一键执行

3. **结果展示**
   - 实时结果输出
   - 错误信息显示
   - 执行状态反馈
   - 历史记录查看

### 高级操作

1. **主题切换**

   ```javascript
   // 点击头部的主题切换按钮
   // 支持明暗主题切换
   ```

2. **响应式测试**

   ```javascript
   // 调整浏览器窗口大小
   // 观察布局的响应式变化
   ```

3. **性能测试**
   ```javascript
   // 在性能监控页面
   // 点击"运行性能测试"按钮
   // 观察性能指标变化
   ```

## 🛠️ 开发指南

### 添加新的演示模块

1. **创建组件文件**

```typescript
// src/components/demos/NewDemo.tsx
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'NewDemo',
  setup() {
    return () => (
      <div class='demo-page'>
        <div class='demo-header'>
          <h1 class='demo-title'>新功能演示</h1>
        </div>
        {/* 演示内容 */}
      </div>
    )
  },
})
```

2. **注册到主内容组件**

```typescript
// src/components/MainContent.tsx
import NewDemo from './demos/NewDemo'

const demoComponents = {
  // ... 其他组件
  newDemo: NewDemo,
}
```

3. **添加到侧边栏导航**

```typescript
// src/components/Sidebar.tsx
const demoGroups = [
  {
    title: '新功能',
    items: [
      {
        key: 'newDemo',
        title: '新功能演示',
        icon: '🆕',
        description: '演示新功能的使用',
      },
    ],
  },
]
```

### 自定义样式

1. **组件样式**

```less
// src/styles/components/new-demo.less
.new-demo {
  .demo-content {
    padding: @spacing-lg;
    background-color: @background-color;
    border-radius: @border-radius-base;
  }
}
```

2. **全局样式**

```less
// src/styles/index.less
@import './components/new-demo.less';
```

### 添加测试

1. **单元测试**

```typescript
// tests/unit/components/NewDemo.test.tsx
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NewDemo from '../../../src/components/demos/NewDemo'

describe('NewDemo', () => {
  it('should render correctly', () => {
    const wrapper = mount(NewDemo)
    expect(wrapper.exists()).toBe(true)
  })
})
```

2. **E2E 测试**

```typescript
// tests/e2e/new-demo.spec.ts
import { test, expect } from '@playwright/test'

test('should navigate to new demo', async ({ page }) => {
  await page.goto('/')
  await page.click('text=新功能演示')
  await expect(page.locator('h1')).toContainText('新功能演示')
})
```

## 🔧 配置选项

### 开发配置

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    port: 3000, // 开发服务器端口
    open: true, // 自动打开浏览器
    cors: true, // 启用 CORS
  },
  build: {
    target: 'es2020', // 构建目标
    sourcemap: true, // 生成 source map
  },
})
```

### 测试配置

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'happy-dom', // 测试环境
    coverage: {
      reporter: ['text', 'html'], // 覆盖率报告格式
      threshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
})
```

## 📚 常见问题

### Q: 如何修改默认端口？

A: 在 `vite.config.ts` 中修改 `server.port` 配置。

### Q: 如何添加新的演示功能？

A: 参考"添加新的演示模块"部分的步骤。

### Q: 如何自定义主题？

A: 修改 `src/styles/variables.less` 中的颜色变量。

### Q: 如何部署到生产环境？

A: 运行 `pnpm build` 构建，然后将 `dist` 目录部署到静态服务器。

### Q: 如何贡献代码？

A: 请参考项目的贡献指南，提交 Pull Request。

## 🎯 最佳实践

1. **代码规范**

   - 使用 TypeScript 进行类型检查
   - 遵循 ESLint 配置规则
   - 编写清晰的注释

2. **组件设计**

   - 保持组件的单一职责
   - 使用 Composition API
   - 合理使用 Props 和 Emits

3. **性能优化**

   - 避免不必要的重渲染
   - 使用懒加载优化首屏
   - 合理使用缓存策略

4. **测试覆盖**
   - 编写单元测试覆盖核心逻辑
   - 添加 E2E 测试验证用户流程
   - 保持测试覆盖率在 80% 以上

---

希望这份使用指南能帮助您快速上手 LDesign Engine 演示应用！如有任何问题，请查看文档或提交 Issue。
