# @ldesign/router 基础示例

这是一个展示 @ldesign/router 基础功能的简单示例应用。

## 功能特性

- ✅ 基础路由导航
- ✅ 动态路由参数
- ✅ 查询参数支持
- ✅ 404错误处理
- ✅ 编程式导航
- ✅ 路由状态显示

## 项目结构

```
basic/
├── src/
│   ├── views/          # 页面组件
│   │   ├── Home.vue    # 首页
│   │   ├── About.vue   # 关于页面
│   │   ├── User.vue    # 用户详情页
│   │   └── NotFound.vue # 404页面
│   ├── App.vue         # 根组件
│   └── main.ts         # 应用入口
├── index.html          # HTML模板
├── vite.config.ts      # Vite配置
└── package.json        # 项目配置
```

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm run dev
```

应用将在 http://localhost:3001 启动。

### 构建生产版本

```bash
pnpm run build
```

### 预览生产版本

```bash
pnpm run preview
```

## 路由配置

```typescript
const _routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/about',
    name: 'about',
    component: About,
  },
  {
    path: '/user/:id',
    name: 'user',
    component: User,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFound,
  },
]
```

## 核心概念演示

### 1. 基础导航

使用 `RouterLink` 组件进行声明式导航：

```vue
<RouterLink to="/">
首页
</RouterLink>

<RouterLink to="/about">
关于
</RouterLink>
```

### 2. 动态路由

访问带参数的路由：

```vue
<RouterLink to="/user/123">
用户详情
</RouterLink>
```

在组件中获取参数：

```vue
<script setup>
import { useRoute } from '@ldesign/router'

const route = useRoute()
const _userId = route.params.id
</script>
```

### 3. 编程式导航

使用 `useRouter` 进行编程式导航：

```vue
<script setup>
import { useRouter } from '@ldesign/router'

const router = useRouter()

function _goToAbout() {
  router.push('/about')
}

function _goBack() {
  router.back()
}
</script>
```

## 学习资源

- [官方文档](../../docs)
- [API参考](../../docs/api)
- [更多示例](../)

## 技术栈

- Vue 3
- TypeScript
- Vite
- @ldesign/router
