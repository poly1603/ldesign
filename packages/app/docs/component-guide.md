# 🧩 组件使用指南

## 📖 概述

本指南详细介绍了 LDesign App 中各个组件的使用方法、配置选项和最佳实践。

## 🏠 首页组件

### Home 主组件

首页是一个复杂的页面组件，展示了 LDesign Engine 的各种功能。

```typescript
import Home from '@/views/Home/Home'

// 在路由中使用
{
  path: '/',
  name: 'Home',
  component: Home
}
```

## 👤 UserCard 组件

用户信息卡片组件，用于展示用户的基本信息。

### 基本用法

```typescript
import UserCard from '@/views/Home/components/UserCard'

// 组件使用
;<UserCard user={user} onViewDetails={handleViewDetails} />
```

### Props 接口

```typescript
interface UserCardProps {
  user: User // 用户信息对象
  onViewDetails?: (user: User) => void // 查看详情回调
}

interface User {
  id: number
  name: string
  username: string
  email: string
  phone: string
  website: string
  company: {
    name: string
  }
  address: {
    city: string
    street: string
  }
}
```

### 样式定制

```less
// 自定义用户卡片样式
.user-card {
  --user-card-bg: #ffffff;
  --user-card-border: #e1e5e9;
  --user-card-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

## 📝 PostCard 组件

文章卡片组件，用于展示文章信息。

### 基本用法

```typescript
import PostCard from '@/views/Home/components/PostCard'

// 组件使用
;<PostCard post={post} onView={handleViewPost} onDelete={handleDeletePost} />
```

### Props 接口

```typescript
interface PostCardProps {
  post: Post // 文章信息对象
  onView?: (post: Post) => void // 查看文章回调
  onDelete?: (postId: number) => void // 删除文章回调
}

interface Post {
  id: number
  title: string
  body: string
  userId: number
}
```

### 功能特性

- **内容截断**: 自动截断长标题和内容
- **字符统计**: 显示文章字符数
- **操作按钮**: 查看和删除功能
- **悬停效果**: 流畅的交互动画

## 🌐 HttpPanel 组件

HTTP 操作面板组件，提供各种 HTTP 请求功能。

### 基本用法

```typescript
import HttpPanel from '@/views/Home/components/HttpPanel'

// 组件使用
;<HttpPanel
  loading={loading}
  onFetchUsers={handleFetchUsers}
  onFetchPosts={handleFetchPosts}
  onBatchFetch={handleBatchFetch}
  onClearCache={handleClearCache}
/>
```

### Props 接口

```typescript
interface HttpPanelProps {
  loading: LoadingState // 加载状态
  onFetchUsers?: () => void // 获取用户列表
  onFetchPosts?: () => void // 获取文章列表
  onFetchMorePosts?: () => void // 获取更多文章
  onBatchFetch?: () => void // 批量获取数据
  onCancelRequests?: () => void // 取消所有请求
  onClearCache?: () => void // 清除缓存
}

interface LoadingState {
  users: boolean
  posts: boolean
  morePosts: boolean
  batchFetch: boolean
}
```

## ✍️ CreatePost 组件

创建文章表单组件，提供文章创建功能。

### 基本用法

```typescript
import CreatePost from '@/views/Home/components/CreatePost'

// 组件使用
;<CreatePost loading={loading.createPost} onCreate={handleCreatePost} />
```

### Props 接口

```typescript
interface CreatePostProps {
  loading?: boolean // 创建中状态
  onCreate?: (data: CreatePostData) => void // 创建文章回调
}

interface CreatePostData {
  title: string
  body: string
}
```

### 功能特性

- **表单验证**: 标题和内容必填验证
- **字符计数**: 实时显示字符数和限制
- **快捷键**: 支持 Ctrl/Cmd + Enter 快速提交
- **自动清空**: 创建成功后自动清空表单

## 📊 StatusPanel 组件

状态统计面板组件，显示 HTTP 请求统计信息。

### 基本用法

```typescript
import StatusPanel from '@/views/Home/components/StatusPanel'

// 组件使用
;<StatusPanel httpStats={httpStats} />
```

### Props 接口

```typescript
interface StatusPanelProps {
  httpStats: HttpStats // HTTP 统计信息
}

interface HttpStats {
  activeRequests: number // 活跃请求数
  totalRequests: number // 总请求数
  successRequests: number // 成功请求数
  failedRequests: number // 失败请求数
}
```

### 计算属性

- **成功率**: 自动计算请求成功率百分比
- **状态文本**: 根据活跃请求数显示状态
- **实时更新**: 响应式更新统计数据

## 🎨 样式系统

### 主题变量

```less
// 颜色变量
@primary-color: #646cff;
@secondary-color: #42b883;
@success-color: #52c41a;
@warning-color: #faad14;
@error-color: #ff4d4f;

// 间距变量
@spacing-xs: 4px;
@spacing-sm: 8px;
@spacing-md: 16px;
@spacing-lg: 24px;
@spacing-xl: 32px;

// 边框和阴影
@border-radius: 8px;
@border-radius-lg: 12px;
@shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
@shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.15);
```

### 响应式断点

```less
// 断点定义
@mobile-breakpoint: 768px;
@tablet-breakpoint: 1024px;
@desktop-breakpoint: 1200px;

// 使用示例
@media (max-width: @mobile-breakpoint) {
  .component {
    // 移动端样式
  }
}
```

## ✨ 动画系统

### 动画类名

```less
// 入场动画
.fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}

.slide-in-left {
  animation: slideInLeft 0.6s ease-out;
}

// 交互动画
.hover-lift {
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-4px);
  }
}
```

### 错开动画

```typescript
// 为列表项添加错开动画
const items = ref([])

onMounted(() => {
  items.value.forEach((item, index) => {
    item.style.animationDelay = `${index * 100}ms`
  })
})
```

## 🔧 开发工具

### 组件调试

```typescript
// 开发模式下的调试信息
if (process.env.NODE_ENV === 'development') {
  console.log('UserCard rendered:', props.user)
}
```

### 性能监控

```typescript
// 组件性能监控
const startTime = performance.now()

onMounted(() => {
  const endTime = performance.now()
  console.log(`Component mounted in ${endTime - startTime}ms`)
})
```

## 🧪 测试示例

### 组件测试

```typescript
// UserCard.test.tsx
import { mount } from '@vue/test-utils'
import UserCard from './UserCard'

describe('UserCard', () => {
  const mockUser = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    // ... 其他属性
  }

  it('renders user information correctly', () => {
    const wrapper = mount(UserCard, {
      props: { user: mockUser },
    })

    expect(wrapper.text()).toContain('John Doe')
    expect(wrapper.text()).toContain('john@example.com')
  })

  it('emits viewDetails event when button clicked', async () => {
    const wrapper = mount(UserCard, {
      props: { user: mockUser },
    })

    await wrapper.find('.view-details-btn').trigger('click')

    expect(wrapper.emitted('viewDetails')).toBeTruthy()
    expect(wrapper.emitted('viewDetails')[0]).toEqual([mockUser])
  })
})
```

### E2E 测试

```typescript
// home.spec.ts
import { test, expect } from '@playwright/test'

test('should display user cards', async ({ page }) => {
  await page.goto('/')

  // 点击获取用户列表
  await page.click('text=获取用户列表')

  // 验证用户卡片显示
  await expect(page.locator('.user-card')).toHaveCount(10)

  // 验证用户信息显示
  await expect(page.locator('.user-name').first()).toBeVisible()
})
```

## 🚀 最佳实践

### 1. 组件设计

- 保持组件职责单一
- 使用 TypeScript 接口定义 Props
- 提供合理的默认值
- 支持插槽扩展

### 2. 性能优化

- 使用 `computed` 缓存计算结果
- 合理使用 `v-memo` 优化渲染
- 避免在模板中使用复杂表达式
- 使用 `shallowRef` 优化大对象

### 3. 可访问性

- 提供合适的 ARIA 标签
- 支持键盘导航
- 确保颜色对比度
- 提供屏幕阅读器支持

### 4. 测试覆盖

- 为每个组件编写单元测试
- 测试组件的各种状态
- 测试用户交互行为
- 包含边界情况测试

---

通过遵循这些指南，您可以有效地使用和扩展 LDesign App 的组件系统。
