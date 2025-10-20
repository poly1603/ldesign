# 开发指南

## 快速开始

### 1. 克隆仓库

```bash
git clone <repository-url>
cd progress
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 启动开发

```bash
# 启动 Vue 示例
pnpm dev:vue

# 启动 React 示例
pnpm dev:react

# 启动原生 JavaScript 示例
pnpm dev:vanilla
```

## 项目结构

```
progress/
├── packages/
│   ├── core/              # 核心库
│   │   ├── src/
│   │   │   ├── base/      # 基类
│   │   │   ├── components/# 组件
│   │   │   ├── types/     # 类型定义
│   │   │   ├── utils/     # 工具函数
│   │   │   └── styles/    # 样式
│   │   └── package.json
│   ├── vue/               # Vue 封装
│   ├── react/             # React 封装
│   └── lit/               # Lit 封装
├── examples/              # 示例项目
│   ├── vanilla/           # 原生 JS 示例
│   ├── vue/               # Vue 示例
│   └── react/             # React 示例
├── docs/                  # 文档
└── scripts/               # 构建脚本
```

## 开发流程

### 开发核心功能

1. 在 `packages/core/src` 中修改代码
2. 示例项目会自动热更新（通过 Vite alias）

```typescript
// packages/core/src/components/LinearProgress.ts
export class LinearProgress extends ProgressBase {
  // 添加新功能...
}
```

### 开发框架封装

#### Vue

```typescript
// packages/vue/src/LinearProgress.ts
import { defineComponent } from 'vue';
import { LinearProgress as CoreLinearProgress } from '@ldesign/progress-core';

export default defineComponent({
  // 组件实现...
});
```

#### React

```tsx
// packages/react/src/LinearProgress.tsx
import React from 'react';
import { LinearProgress as CoreLinearProgress } from '@ldesign/progress-core';

export const LinearProgress = forwardRef((props, ref) => {
  // 组件实现...
});
```

#### Lit

```typescript
// packages/lit/src/LinearProgress.ts
import { LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('ld-linear-progress')
export class LinearProgress extends LitElement {
  // 组件实现...
}
```

### 添加新的进度条类型

1. 在 `packages/core/src/components/` 创建新组件
2. 继承 `ProgressBase` 基类
3. 实现抽象方法
4. 添加类型定义
5. 导出组件

```typescript
// packages/core/src/components/NewProgress.ts
import { ProgressBase } from '../base';
import { NewProgressOptions } from '../types';

export class NewProgress extends ProgressBase<NewProgressOptions> {
  protected render(): void {
    // 实现渲染逻辑
  }

  protected updateProgress(value: number): void {
    // 实现进度更新逻辑
  }
}
```

## 调试

### 使用浏览器开发工具

所有示例项目都支持 Source Map，可以直接在浏览器中调试源码。

### VS Code 调试

创建 `.vscode/launch.json`：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "调试 Vue 示例",
      "url": "http://localhost:3001",
      "webRoot": "${workspaceFolder}/examples/vue"
    }
  ]
}
```

## 测试

### 手动测试

启动示例项目进行手动测试：

```bash
pnpm dev:vue
pnpm dev:react
pnpm dev:vanilla
```

### 构建测试

测试所有包是否能正确构建：

```bash
pnpm build:all
```

## 样式开发

### CSS 变量

在 `packages/core/src/styles/index.css` 中定义 CSS 变量：

```css
:root {
  --progress-color-primary: #409eff;
  --progress-color-success: #67c23a;
  /* ... */
}
```

### 组件样式

每个组件都有对应的样式类：

```css
.ld-progress-linear {
  /* 线性进度条样式 */
}

.ld-progress-circle {
  /* 圆形进度条样式 */
}
```

## 主题开发

### 添加新主题

在 `packages/core/src/utils/ThemeManager.ts` 中添加：

```typescript
const defaultThemes: Record<string, ThemeConfig> = {
  // 现有主题...
  newTheme: {
    name: 'newTheme',
    colors: {
      primary: '#xxx',
      // ...
    },
    sizes: {
      small: 4,
      medium: 6,
      large: 8,
    },
  },
};
```

## 性能优化

### 避免不必要的重渲染

```typescript
// 使用配置检查避免无谓更新
if (this.config.get('value') === newValue) return;
```

### 使用 requestAnimationFrame

```typescript
requestAnimationFrame(() => {
  // 动画更新
});
```

### 批量 DOM 操作

```typescript
const fragment = document.createDocumentFragment();
// 添加元素到 fragment
container.appendChild(fragment);
```

## 代码规范

### TypeScript

- 使用严格模式
- 所有公共 API 必须有类型定义
- 使用接口定义配置对象
- 避免使用 `any`

### 命名规范

- 类名：PascalCase
- 方法名：camelCase
- 私有属性：前缀 `_` 或 `private`
- 常量：UPPER_CASE

### 注释

```typescript
/**
 * 设置进度值
 * @param value - 新的进度值
 * @param animated - 是否使用动画
 */
setValue(value: number, animated?: boolean): void {
  // 实现...
}
```

## Git 工作流

### 分支命名

- `feature/xxx` - 新功能
- `fix/xxx` - Bug 修复
- `docs/xxx` - 文档更新
- `refactor/xxx` - 重构

### 提交信息

```
feat: 添加新的进度条类型
fix: 修复圆形进度条渐变问题
docs: 更新 API 文档
style: 代码格式化
refactor: 重构动画系统
perf: 优化渲染性能
test: 添加单元测试
chore: 更新构建配置
```

## 发布流程

1. 更新 CHANGELOG.md
2. 更新版本号
3. 构建所有包
4. 测试构建产物
5. 发布到 NPM

## 常用命令

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev:vue
pnpm dev:react
pnpm dev:vanilla

# 构建
pnpm build
pnpm build:core
pnpm build:vue
pnpm build:react
pnpm build:lit

# 测试构建
pnpm test:build

# 清理
pnpm clean
```

## 获取帮助

- 查看文档：`docs/` 目录
- 查看示例：`examples/` 目录
- 提交 Issue
- 参与讨论


