# 博客系统实战项目

本示例展示如何使用 LDesign Engine 构建一个功能完整的博客系统，包括文章管理、用户认证、评论系统等功能
。

## 项目概览

### 功能特性

- 📝 **文章管理** - 创建、编辑、删除、发布文章
- 👤 **用户系统** - 注册、登录、个人资料管理
- 💬 **评论系统** - 文章评论、回复、点赞
- 🏷️ **标签分类** - 文章标签、分类管理
- 🔍 **搜索功能** - 全文搜索、标签搜索
- 📊 **数据统计** - 访问统计、热门文章
- 🎨 **主题切换** - 明暗主题、自定义主题
- 📱 **响应式设计** - 移动端适配

### 技术栈

- **前端框架**: Vue 3 + TypeScript
- **引擎**: LDesign Engine
- **UI 组件**: Element Plus
- **路由**: Vue Router 4
- **构建工具**: Vite
- **样式**: Less + CSS Variables
- **图标**: Element Plus Icons

## 项目结构

```
blog-system/
├── src/
│   ├── components/          # 通用组件
│   │   ├── BlogHeader.tsx
│   │   ├── BlogFooter.tsx
│   │   ├── ArticleCard.tsx
│   │   └── CommentList.tsx
│   ├── views/              # 页面组件
│   │   ├── Home.tsx
│   │   ├── Article.tsx
│   │   ├── Profile.tsx
│   │   └── Admin.tsx
│   ├── plugins/            # 自定义插件
│   │   ├── auth-plugin.ts
│   │   ├── blog-plugin.ts
│   │   └── theme-plugin.ts
│   ├── middleware/         # 中间件
│   │   ├── auth.ts
│   │   └── analytics.ts
│   ├── services/           # 服务层
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── blog.ts
│   ├── types/              # 类型定义
│   │   ├── blog.ts
│   │   └── user.ts
│   ├── styles/             # 样式文件
│   │   ├── variables.less
│   │   └── themes.less
│   ├── main.ts             # 入口文件
│   └── engine.ts           # 引擎配置
├── public/
├── package.json
└── vite.config.ts
```

## 引擎配置

### 基础配置

```typescript
// src/engine.ts
import { createEngine } from '@ldesign/engine'
import { analyticsMiddleware } from './middleware/analytics'
import { authMiddleware } from './middleware/auth'
import { authPlugin } from './plugins/auth-plugin'
import { blogPlugin } from './plugins/blog-plugin'
import { themePlugin } from './plugins/theme-plugin'

export const engine = createEngine({
  config: {
    appName: 'Blog System',
    version: '1.0.0',
    debug: import.meta.env.DEV,
    logLevel: import.meta.env.DEV ? 'debug' : 'warn',
  },

  // 插件配置
  plugins: [authPlugin, blogPlugin, themePlugin],

  // 中间件配置
  middleware: [authMiddleware, analyticsMiddleware],

  // 状态管理配置
  state: {
    initialState: {
      user: {
        profile: null,
        isAuthenticated: false,
        preferences: {
          theme: 'light',
          language: 'zh-CN',
        },
      },
      blog: {
        articles: [],
        categories: [],
        tags: [],
        currentArticle: null,
      },
      ui: {
        loading: false,
        sidebarCollapsed: false,
        theme: 'light',
      },
    },

    persistence: {
      enabled: true,
      storage: 'localStorage',
      keys: ['user.preferences', 'ui.theme'],
      prefix: 'blog:',
    },
  },

  // 缓存配置
  cache: {
    maxSize: 1000,
    defaultTTL: 300000, // 5分钟
    evictionPolicy: 'lru',
  },

  // 安全配置
  security: {
    xss: { enabled: true },
    csrf: { enabled: true },
  },

  // 性能监控
  performance: {
    enabled: true,
    reporting: {
      enabled: import.meta.env.PROD,
      endpoint: '/api/performance',
    },
  },
})
```

## 核心插件实现

### 认证插件

```typescript
import type { User } from '../types/user'
// src/plugins/auth-plugin.ts
import { createPlugin } from '@ldesign/engine'
import { authService } from '../services/auth'

export const authPlugin = createPlugin({
  name: 'auth',
  version: '1.0.0',

  install: (engine) => {
    // 注册认证相关状态
    engine.state.set('auth.initialized', false)

    // 认证方法
    const auth = {
      async login(credentials: LoginCredentials) {
        try {
          engine.state.set('ui.loading', true)

          const response = await authService.login(credentials)
          const { user, token } = response.data

          // 保存用户信息
          engine.state.set('user.profile', user)
          engine.state.set('user.isAuthenticated', true)
          engine.state.set('auth.token', token)

          // 发送登录事件
          engine.events.emit('auth:login', user)

          // 显示成功通知
          engine.notifications.success('登录成功')

          return user
        }
        catch (error) {
          engine.notifications.error(`登录失败: ${error.message}`)
          throw error
        }
        finally {
          engine.state.set('ui.loading', false)
        }
      },

      async logout() {
        try {
          await authService.logout()

          // 清除用户信息
          engine.state.set('user.profile', null)
          engine.state.set('user.isAuthenticated', false)
          engine.state.remove('auth.token')

          // 清除缓存
          engine.cache.clear()

          // 发送登出事件
          engine.events.emit('auth:logout')

          engine.notifications.success('已退出登录')
        }
        catch (error) {
          engine.notifications.error('退出登录失败')
        }
      },

      async register(userData: RegisterData) {
        try {
          engine.state.set('ui.loading', true)

          const response = await authService.register(userData)
          const { user } = response.data

          engine.events.emit('auth:register', user)
          engine.notifications.success('注册成功，请登录')

          return user
        }
        catch (error) {
          engine.notifications.error(`注册失败: ${error.message}`)
          throw error
        }
        finally {
          engine.state.set('ui.loading', false)
        }
      },

      async checkAuth() {
        const token = engine.state.get('auth.token')
        if (!token)
          return false

        try {
          const response = await authService.verify(token)
          const { user } = response.data

          engine.state.set('user.profile', user)
          engine.state.set('user.isAuthenticated', true)

          return true
        }
        catch (error) {
          // Token 无效，清除认证信息
          await this.logout()
          return false
        }
      },
    }

    // 将认证方法挂载到引擎
    engine.auth = auth

    // 初始化认证状态
    auth.checkAuth().finally(() => {
      engine.state.set('auth.initialized', true)
    })

    // 监听路由变化，检查权限
    engine.events.on('router:beforeEach', (to, from) => {
      const requiresAuth = to.meta?.requiresAuth
      const isAuthenticated = engine.state.get('user.isAuthenticated')

      if (requiresAuth && !isAuthenticated) {
        engine.events.emit('router:redirect', '/login')
      }
    })
  },
})
```

### 博客插件

```typescript
import type { Article, Category, Tag } from '../types/blog'
// src/plugins/blog-plugin.ts
import { createPlugin } from '@ldesign/engine'
import { blogService } from '../services/blog'

export const blogPlugin = createPlugin({
  name: 'blog',
  version: '1.0.0',
  dependencies: ['auth'],

  install: (engine) => {
    const blog = {
      // 文章管理
      async getArticles(params?: ArticleQuery) {
        try {
          const cacheKey = `articles:${JSON.stringify(params)}`
          const cached = engine.cache.get(cacheKey)

          if (cached) {
            engine.state.set('blog.articles', cached)
            return cached
          }

          engine.state.set('ui.loading', true)

          const response = await blogService.getArticles(params)
          const articles = response.data

          // 缓存结果
          engine.cache.set(cacheKey, articles, 300000) // 5分钟

          // 更新状态
          engine.state.set('blog.articles', articles)

          return articles
        }
        catch (error) {
          engine.notifications.error('获取文章失败')
          throw error
        }
        finally {
          engine.state.set('ui.loading', false)
        }
      },

      async getArticle(id: string) {
        try {
          const cacheKey = `article:${id}`
          const cached = engine.cache.get(cacheKey)

          if (cached) {
            engine.state.set('blog.currentArticle', cached)
            return cached
          }

          const response = await blogService.getArticle(id)
          const article = response.data

          // 缓存文章
          engine.cache.set(cacheKey, article, 600000) // 10分钟

          // 更新状态
          engine.state.set('blog.currentArticle', article)

          // 记录访问
          engine.events.emit('blog:article:view', { id, title: article.title })

          return article
        }
        catch (error) {
          engine.notifications.error('获取文章失败')
          throw error
        }
      },

      async createArticle(articleData: CreateArticleData) {
        try {
          engine.state.set('ui.loading', true)

          const response = await blogService.createArticle(articleData)
          const article = response.data

          // 清除相关缓存
          engine.cache.deletePattern('articles:*')

          // 更新文章列表
          const articles = engine.state.get('blog.articles') || []
          engine.state.set('blog.articles', [article, ...articles])

          engine.events.emit('blog:article:created', article)
          engine.notifications.success('文章创建成功')

          return article
        }
        catch (error) {
          engine.notifications.error('创建文章失败')
          throw error
        }
        finally {
          engine.state.set('ui.loading', false)
        }
      },

      async updateArticle(id: string, updates: UpdateArticleData) {
        try {
          engine.state.set('ui.loading', true)

          const response = await blogService.updateArticle(id, updates)
          const article = response.data

          // 更新缓存
          engine.cache.set(`article:${id}`, article)
          engine.cache.deletePattern('articles:*')

          // 更新状态
          engine.state.set('blog.currentArticle', article)

          const articles = engine.state.get('blog.articles') || []
          const index = articles.findIndex(a => a.id === id)
          if (index !== -1) {
            articles[index] = article
            engine.state.set('blog.articles', [...articles])
          }

          engine.events.emit('blog:article:updated', article)
          engine.notifications.success('文章更新成功')

          return article
        }
        catch (error) {
          engine.notifications.error('更新文章失败')
          throw error
        }
        finally {
          engine.state.set('ui.loading', false)
        }
      },

      async deleteArticle(id: string) {
        try {
          await blogService.deleteArticle(id)

          // 清除缓存
          engine.cache.delete(`article:${id}`)
          engine.cache.deletePattern('articles:*')

          // 更新状态
          const articles = engine.state.get('blog.articles') || []
          const filtered = articles.filter(a => a.id !== id)
          engine.state.set('blog.articles', filtered)

          if (engine.state.get('blog.currentArticle')?.id === id) {
            engine.state.set('blog.currentArticle', null)
          }

          engine.events.emit('blog:article:deleted', { id })
          engine.notifications.success('文章删除成功')
        }
        catch (error) {
          engine.notifications.error('删除文章失败')
          throw error
        }
      },

      // 评论管理
      async getComments(articleId: string) {
        try {
          const cacheKey = `comments:${articleId}`
          const cached = engine.cache.get(cacheKey)

          if (cached)
            return cached

          const response = await blogService.getComments(articleId)
          const comments = response.data

          engine.cache.set(cacheKey, comments, 180000) // 3分钟

          return comments
        }
        catch (error) {
          engine.notifications.error('获取评论失败')
          throw error
        }
      },

      async addComment(articleId: string, content: string, parentId?: string) {
        try {
          const response = await blogService.addComment({
            articleId,
            content,
            parentId,
          })

          const comment = response.data

          // 清除评论缓存
          engine.cache.delete(`comments:${articleId}`)

          engine.events.emit('blog:comment:added', comment)
          engine.notifications.success('评论发表成功')

          return comment
        }
        catch (error) {
          engine.notifications.error('发表评论失败')
          throw error
        }
      },
    }

    // 挂载博客方法
    engine.blog = blog

    // 初始化数据
    blog.getArticles({ page: 1, limit: 10 })
  },
})
```

### 主题插件

```typescript
// src/plugins/theme-plugin.ts
import { createPlugin } from '@ldesign/engine'

export const themePlugin = createPlugin({
  name: 'theme',
  version: '1.0.0',

  install: (engine) => {
    const theme = {
      setTheme(themeName: string) {
        // 更新状态
        engine.state.set('ui.theme', themeName)
        engine.state.set('user.preferences.theme', themeName)

        // 应用主题
        document.documentElement.setAttribute('data-theme', themeName)

        // 发送主题变更事件
        engine.events.emit('theme:changed', themeName)

        engine.logger.info(`主题已切换为: ${themeName}`)
      },

      getTheme() {
        return engine.state.get('ui.theme') || 'light'
      },

      toggleTheme() {
        const current = this.getTheme()
        const next = current === 'light' ? 'dark' : 'light'
        this.setTheme(next)
      },
    }

    // 挂载主题方法
    engine.theme = theme

    // 初始化主题
    const savedTheme = engine.state.get('user.preferences.theme') || 'light'
    theme.setTheme(savedTheme)

    // 监听系统主题变化
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', (e) => {
        if (!engine.state.get('user.preferences.theme')) {
          theme.setTheme(e.matches ? 'dark' : 'light')
        }
      })
    }
  },
})
```

## 中间件实现

### 认证中间件

```typescript
// src/middleware/auth.ts
import { createMiddleware } from '@ldesign/engine'

export const authMiddleware = createMiddleware({
  name: 'auth',
  priority: 100, // 高优先级

  handler: async (context, next) => {
    const { engine, phase } = context

    if (phase === 'beforeMount') {
      // 应用启动时检查认证状态
      const token = localStorage.getItem('blog:auth.token')
      if (token) {
        engine.state.set('auth.token', token)
      }
    }

    if (phase === 'beforeRoute') {
      // 路由守卫
      const to = context.data?.to
      const requiresAuth = to?.meta?.requiresAuth
      const isAuthenticated = engine.state.get('user.isAuthenticated')

      if (requiresAuth && !isAuthenticated) {
        engine.notifications.warning('请先登录')
        context.data.redirect = '/login'
        return // 不调用 next()，阻止路由
      }
    }

    await next()
  },
})
```

### 分析中间件

```typescript
// src/middleware/analytics.ts
import { createMiddleware } from '@ldesign/engine'

export const analyticsMiddleware = createMiddleware({
  name: 'analytics',
  priority: 50,

  handler: async (context, next) => {
    const { engine, phase } = context

    // 记录页面访问
    if (phase === 'afterRoute') {
      const route = context.data?.route
      if (route) {
        engine.events.emit('analytics:page-view', {
          path: route.path,
          title: route.meta?.title,
          timestamp: Date.now(),
        })
      }
    }

    // 性能监控
    if (phase === 'beforeMount') {
      engine.performance.mark('app-start')
    }

    if (phase === 'afterMount') {
      engine.performance.mark('app-ready')
      engine.performance.measure('app-startup', 'app-start', 'app-ready')

      const measure = engine.performance.getEntriesByName('app-startup')[0]
      engine.events.emit('analytics:performance', {
        metric: 'startup-time',
        value: measure.duration,
        timestamp: Date.now(),
      })
    }

    await next()
  },
})
```

## 组件实现

### 文章卡片组件

```tsx
import type { Article } from '../types/blog'
import { useEngine } from '@ldesign/engine/vue'
import { ElButton, ElCard, ElTag } from 'element-plus'
// src/components/ArticleCard.tsx
import { computed, defineComponent } from 'vue'

export default defineComponent({
  name: 'ArticleCard',
  props: {
    article: {
      type: Object as PropType<Article>,
      required: true,
    },
  },

  setup(props) {
    const engine = useEngine()

    const formattedDate = computed(() => {
      return new Date(props.article.createdAt).toLocaleDateString('zh-CN')
    })

    const handleView = () => {
      engine.events.emit('router:push', `/article/${props.article.id}`)
    }

    const handleLike = async () => {
      try {
        await engine.blog.likeArticle(props.article.id)
        engine.notifications.success('点赞成功')
      }
      catch (error) {
        engine.notifications.error('点赞失败')
      }
    }

    return () => (
      <ElCard class="article-card" shadow="hover">
        <div class="article-header">
          <h3 class="article-title" onClick={handleView}>
            {props.article.title}
          </h3>
          <span class="article-date">{formattedDate.value}</span>
        </div>

        <div class="article-content">
          <p class="article-summary">{props.article.summary}</p>
        </div>

        <div class="article-tags">
          {props.article.tags?.map(tag => (
            <ElTag key={tag.id} size="small">
              {tag.name}
            </ElTag>
          ))}
        </div>

        <div class="article-actions">
          <ElButton type="primary" size="small" onClick={handleView}>
            阅读全文
          </ElButton>
          <ElButton size="small" onClick={handleLike}>
            👍
            {' '}
            {props.article.likes || 0}
          </ElButton>
        </div>
      </ElCard>
    )
  },
})
```

## 总结

这个博客系统示例展示了如何使用 LDesign Engine 构建一个功能完整的应用：

### 核心特性

- **插件化架构** - 功能模块化，易于扩展
- **状态管理** - 统一的状态管理和持久化
- **中间件系统** - 横切关注点的统一处理
- **事件驱动** - 松耦合的组件通信
- **缓存优化** - 提升应用性能
- **安全防护** - 内置安全机制

### 开发体验

- **TypeScript 支持** - 完整的类型安全
- **热重载** - 快速开发迭代
- **调试工具** - 丰富的调试信息
- **性能监控** - 实时性能分析

### 扩展性

- **插件系统** - 易于添加新功能
- **主题系统** - 支持多主题切换
- **国际化** - 多语言支持
- **移动端** - 响应式设计

通过这个示例，你可以学习到如何使用 LDesign Engine 构建复杂的实际应用，并掌握最佳实践。
