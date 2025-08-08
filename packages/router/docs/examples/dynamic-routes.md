# 动态路由示例

展示如何使用 LDesign Router 处理动态路由参数、参数验证和数据加载。

## 🎯 示例概述

构建一个博客系统，包含：

- 文章详情页（动态 ID）
- 用户资料页（动态用户名）
- 分类页面（动态分类和分页）
- 搜索结果页（动态查询参数）

## 🔧 路由配置

```typescript
const routes = [
  {
    path: '/article/:id(\\d+)',
    name: 'ArticleDetail',
    component: () => import('../views/ArticleDetail.vue'),
    props: route => ({
      id: Number(route.params.id),
      tab: route.query.tab || 'content',
    }),
    meta: {
      title: '文章详情',
      cache: true,
      preload: 'hover',
    },
  },
  {
    path: '/user/:username([a-zA-Z0-9_]+)',
    name: 'UserProfile',
    component: () => import('../views/UserProfile.vue'),
    props: true,
    children: [
      {
        path: '',
        component: () => import('../views/user/UserPosts.vue'),
      },
      {
        path: 'followers',
        component: () => import('../views/user/UserFollowers.vue'),
      },
      {
        path: 'following',
        component: () => import('../views/user/UserFollowing.vue'),
      },
    ],
  },
  {
    path: '/category/:slug',
    name: 'CategoryPosts',
    component: () => import('../views/CategoryPosts.vue'),
    props: route => ({
      slug: route.params.slug,
      page: Number(route.query.page) || 1,
      sort: route.query.sort || 'latest',
    }),
  },
  {
    path: '/search',
    name: 'SearchResults',
    component: () => import('../views/SearchResults.vue'),
    props: route => ({
      query: route.query.q || '',
      type: route.query.type || 'all',
      page: Number(route.query.page) || 1,
    }),
  },
]
```

## 📄 组件实现

### 文章详情页

```vue
<!-- views/ArticleDetail.vue -->
<script setup>
import { useRoute, useRouter } from '@ldesign/router'
import { computed, onMounted, ref, watch } from 'vue'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  tab: {
    type: String,
    default: 'content',
  },
})

const route = useRoute()
const router = useRouter()

const article = ref(null)
const loading = ref(false)
const error = ref(null)

const currentTab = computed({
  get: () => props.tab,
  set: value => {
    router.push({
      name: 'ArticleDetail',
      params: { id: props.id },
      query: { ...route.query, tab: value },
    })
  },
})

const tabs = [
  { key: 'content', label: '文章内容' },
  { key: 'comments', label: '评论' },
  { key: 'related', label: '相关文章' },
]

// 加载文章数据
async function loadArticle() {
  loading.value = true
  error.value = null

  try {
    const response = await fetch(`/api/articles/${props.id}`)

    if (!response.ok) {
      throw new Error(response.status === 404 ? '文章不存在' : '加载失败')
    }

    article.value = await response.json()

    // 更新页面标题
    document.title = `${article.value.title} - 我的博客`
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// 切换标签页
function switchTab(tab) {
  currentTab.value = tab
}

// 格式化日期
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// 监听ID变化
watch(() => props.id, loadArticle, { immediate: true })

// 监听标签页变化
watch(
  () => props.tab,
  newTab => {
    // 发送页面浏览统计
    analytics.track('article_tab_view', {
      articleId: props.id,
      tab: newTab,
    })
  }
)

onMounted(() => {
  // 增加文章浏览量
  fetch(`/api/articles/${props.id}/view`, { method: 'POST' })
})
</script>

<template>
  <div class="article-detail">
    <div v-if="loading" class="loading">
      <div class="spinner" />
      <p>文章加载中...</p>
    </div>

    <div v-else-if="error" class="error">
      <h2>加载失败</h2>
      <p>{{ error }}</p>
      <button @click="loadArticle">重试</button>
    </div>

    <article v-else-if="article" class="article">
      <header class="article-header">
        <h1>{{ article.title }}</h1>
        <div class="article-meta">
          <RouterLink :to="`/user/${article.author.username}`" class="author-link" preload="hover">
            <img :src="article.author.avatar" :alt="article.author.name" />
            <span>{{ article.author.name }}</span>
          </RouterLink>
          <time :datetime="article.publishedAt">
            {{ formatDate(article.publishedAt) }}
          </time>
          <div class="article-stats">
            <span>{{ article.viewCount }} 阅读</span>
            <span>{{ article.likeCount }} 点赞</span>
          </div>
        </div>
      </header>

      <nav class="article-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="{ active: currentTab === tab.key }"
          class="tab-button"
          @click="switchTab(tab.key)"
        >
          {{ tab.label }}
        </button>
      </nav>

      <div class="article-content">
        <div v-if="currentTab === 'content'" class="content">
          <div v-html="article.content" />
        </div>

        <div v-else-if="currentTab === 'comments'" class="comments">
          <CommentsList :article-id="id" />
        </div>

        <div v-else-if="currentTab === 'related'" class="related">
          <RelatedArticles :article-id="id" :category-id="article.categoryId" />
        </div>
      </div>
    </article>
  </div>
</template>

<style scoped>
.article-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.loading {
  text-align: center;
  padding: 4rem 2rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error {
  text-align: center;
  padding: 4rem 2rem;
  color: #f5222d;
}

.article-header {
  margin-bottom: 2rem;
}

.article-header h1 {
  font-size: 2.5rem;
  margin: 0 0 1rem 0;
  line-height: 1.2;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #666;
  font-size: 0.9rem;
}

.author-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: inherit;
}

.author-link img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.article-stats {
  display: flex;
  gap: 1rem;
}

.article-tabs {
  display: flex;
  border-bottom: 1px solid #d9d9d9;
  margin-bottom: 2rem;
}

.tab-button {
  padding: 1rem 1.5rem;
  border: none;
  background: none;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}

.tab-button:hover {
  color: #1890ff;
}

.tab-button.active {
  color: #1890ff;
  border-bottom-color: #1890ff;
}

.content {
  line-height: 1.8;
  font-size: 1.1rem;
}

.content :deep(h2) {
  margin: 2rem 0 1rem 0;
  font-size: 1.5rem;
}

.content :deep(p) {
  margin: 1rem 0;
}

.content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1rem 0;
}
</style>
```

### 用户资料页

```vue
<!-- views/UserProfile.vue -->
<script setup>
import { useRoute } from '@ldesign/router'
import { computed, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  username: {
    type: String,
    required: true,
  },
})

const route = useRoute()
const authStore = useAuthStore()

const user = ref(null)
const loading = ref(false)
const error = ref(null)
const isFollowing = ref(false)

const isCurrentUser = computed(() => {
  return authStore.user?.username === props.username
})

// 加载用户数据
async function loadUser() {
  loading.value = true
  error.value = null

  try {
    const response = await fetch(`/api/users/${props.username}`)

    if (!response.ok) {
      throw new Error('用户不存在')
    }

    user.value = await response.json()

    // 检查关注状态
    if (authStore.isAuthenticated && !isCurrentUser.value) {
      const followResponse = await fetch(`/api/users/${props.username}/follow-status`)
      const followData = await followResponse.json()
      isFollowing.value = followData.isFollowing
    }

    // 更新页面标题
    document.title = `${user.value.name} (@${user.value.username}) - 我的博客`
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// 切换关注状态
async function toggleFollow() {
  try {
    const method = isFollowing.value ? 'DELETE' : 'POST'
    await fetch(`/api/users/${props.username}/follow`, { method })

    isFollowing.value = !isFollowing.value

    // 更新用户统计
    if (isFollowing.value) {
      user.value.followersCount++
    } else {
      user.value.followersCount--
    }
  } catch (error) {
    console.error('关注操作失败:', error)
  }
}

// 监听用户名变化
watch(() => props.username, loadUser, { immediate: true })
</script>

<template>
  <div class="user-profile">
    <div v-if="loading" class="loading">加载用户信息中...</div>

    <div v-else-if="error" class="error">
      <h2>用户不存在</h2>
      <p>{{ error }}</p>
      <RouterLink to="/" class="back-home"> 返回首页 </RouterLink>
    </div>

    <div v-else-if="user" class="profile">
      <header class="profile-header">
        <div class="user-avatar">
          <img :src="user.avatar" :alt="user.name" />
        </div>
        <div class="user-info">
          <h1>{{ user.name }}</h1>
          <p class="username">@{{ user.username }}</p>
          <p class="bio">
            {{ user.bio }}
          </p>
          <div class="user-stats">
            <span>{{ user.postsCount }} 文章</span>
            <span>{{ user.followersCount }} 粉丝</span>
            <span>{{ user.followingCount }} 关注</span>
          </div>
        </div>
        <div class="profile-actions">
          <button
            v-if="!isCurrentUser"
            :class="{ following: isFollowing }"
            class="follow-btn"
            @click="toggleFollow"
          >
            {{ isFollowing ? '已关注' : '关注' }}
          </button>
          <RouterLink v-else to="/settings/profile" class="edit-btn"> 编辑资料 </RouterLink>
        </div>
      </header>

      <nav class="profile-nav">
        <RouterLink
          :to="`/user/${username}`"
          exact
          class="nav-item"
          active-class="nav-item--active"
        >
          文章
        </RouterLink>
        <RouterLink
          :to="`/user/${username}/followers`"
          class="nav-item"
          active-class="nav-item--active"
        >
          粉丝
        </RouterLink>
        <RouterLink
          :to="`/user/${username}/following`"
          class="nav-item"
          active-class="nav-item--active"
        >
          关注
        </RouterLink>
      </nav>

      <div class="profile-content">
        <RouterView :user="user" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-profile {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.loading,
.error {
  text-align: center;
  padding: 4rem 2rem;
}

.profile-header {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-avatar img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info {
  flex: 1;
}

.user-info h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
}

.username {
  color: #666;
  margin: 0 0 1rem 0;
}

.bio {
  margin: 0 0 1rem 0;
  line-height: 1.6;
}

.user-stats {
  display: flex;
  gap: 2rem;
  color: #666;
}

.profile-actions {
  display: flex;
  align-items: flex-start;
}

.follow-btn,
.edit-btn {
  padding: 0.75rem 1.5rem;
  border: 1px solid #1890ff;
  border-radius: 6px;
  background: white;
  color: #1890ff;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.follow-btn:hover,
.edit-btn:hover {
  background: #1890ff;
  color: white;
}

.follow-btn.following {
  background: #1890ff;
  color: white;
}

.profile-nav {
  display: flex;
  border-bottom: 1px solid #d9d9d9;
  margin-bottom: 2rem;
}

.nav-item {
  padding: 1rem 1.5rem;
  text-decoration: none;
  color: #666;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}

.nav-item:hover {
  color: #1890ff;
}

.nav-item--active {
  color: #1890ff;
  border-bottom-color: #1890ff;
}

.profile-content {
  background: white;
  border-radius: 8px;
  padding: 2rem;
}
</style>
```

## 🎯 关键特性

### 1. 参数验证

- 使用正则表达式验证路由参数格式
- 数字 ID 只接受纯数字
- 用户名只接受字母、数字和下划线

### 2. Props 传递

- 自动将路由参数转换为组件 props
- 支持类型转换和默认值

### 3. 错误处理

- 404 错误处理
- 加载失败重试机制
- 用户友好的错误提示

### 4. 性能优化

- 智能预加载相关页面
- 缓存用户资料数据
- 懒加载子组件

这个示例展示了如何优雅地处理动态路由的各种场景，充分利用 LDesign Router 的高级功能。
