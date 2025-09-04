<template>
  <div class="api-demo">
    <div class="demo-header">
      <h1>API 接口管理演示</h1>
      <p>基于 @ldesign/api 包实现的 API 接口管理系统演示</p>
    </div>

    <div class="demo-content">
      <!-- 基础 API 调用演示 -->
      <section class="demo-section">
        <h2>基础 API 调用</h2>
        <div class="demo-controls">
          <button @click="fetchPosts" :disabled="postsLoading" class="demo-button">
            {{ postsLoading ? '加载中...' : '获取文章列表' }}
          </button>
          <button @click="clearPostsCache" class="demo-button secondary">
            清除缓存
          </button>
        </div>
        
        <div v-if="postsError" class="demo-error">
          错误: {{ postsError.message }}
        </div>
        
        <div v-if="posts" class="demo-result">
          <h3>文章列表 ({{ posts.length }} 条)</h3>
          <div class="posts-grid">
            <div 
              v-for="post in posts.slice(0, 6)" 
              :key="post.id" 
              class="post-card"
              @click="fetchPost(post.id)"
            >
              <h4>{{ post.title }}</h4>
              <p>{{ post.body.substring(0, 100) }}...</p>
              <small>用户 ID: {{ post.userId }}</small>
            </div>
          </div>
        </div>
      </section>

      <!-- 单个文章详情 -->
      <section class="demo-section" v-if="selectedPost">
        <h2>文章详情</h2>
        <div class="post-detail">
          <h3>{{ selectedPost.title }}</h3>
          <p>{{ selectedPost.body }}</p>
          <small>文章 ID: {{ selectedPost.id }} | 用户 ID: {{ selectedPost.userId }}</small>
        </div>
      </section>

      <!-- Vue 组合式 API 演示 -->
      <section class="demo-section">
        <h2>Vue 组合式 API 演示</h2>
        <div class="demo-controls">
          <button @click="executeUsersCall" :disabled="usersLoading" class="demo-button">
            {{ usersLoading ? '加载中...' : '获取用户列表' }}
          </button>
        </div>
        
        <div v-if="usersError" class="demo-error">
          错误: {{ usersError.message }}
        </div>
        
        <div v-if="users" class="demo-result">
          <h3>用户列表 ({{ users.length }} 个用户)</h3>
          <div class="users-grid">
            <div v-for="user in users.slice(0, 4)" :key="user.id" class="user-card">
              <h4>{{ user.name }}</h4>
              <p>{{ user.email }}</p>
              <p>{{ user.company?.name }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 批量调用演示 -->
      <section class="demo-section">
        <h2>批量 API 调用演示</h2>
        <div class="demo-controls">
          <button @click="executeBatchCall" :disabled="batchLoading" class="demo-button">
            {{ batchLoading ? '加载中...' : '批量获取数据' }}
          </button>
        </div>
        
        <div v-if="batchError" class="demo-error">
          错误: {{ batchError }}
        </div>
        
        <div v-if="batchResults" class="demo-result">
          <h3>批量调用结果</h3>
          <div class="batch-results">
            <div class="batch-item">
              <h4>文章数量</h4>
              <p>{{ batchResults.posts?.length || 0 }}</p>
            </div>
            <div class="batch-item">
              <h4>用户数量</h4>
              <p>{{ batchResults.users?.length || 0 }}</p>
            </div>
            <div class="batch-item">
              <h4>评论数量</h4>
              <p>{{ batchResults.comments?.length || 0 }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 缓存统计 -->
      <section class="demo-section">
        <h2>缓存统计</h2>
        <div class="demo-controls">
          <button @click="refreshCacheStats" class="demo-button">
            刷新统计
          </button>
          <button @click="clearAllCache" class="demo-button secondary">
            清除所有缓存
          </button>
        </div>
        
        <div v-if="cacheStats" class="demo-result">
          <div class="cache-stats">
            <div class="stat-item">
              <h4>缓存项数量</h4>
              <p>{{ cacheStats.totalItems }}</p>
            </div>
            <div class="stat-item">
              <h4>命中次数</h4>
              <p>{{ cacheStats.hits }}</p>
            </div>
            <div class="stat-item">
              <h4>未命中次数</h4>
              <p>{{ cacheStats.misses }}</p>
            </div>
            <div class="stat-item">
              <h4>命中率</h4>
              <p>{{ (cacheStats.hitRate * 100).toFixed(1) }}%</p>
            </div>
          </div>
        </div>
      </section>

      <!-- API 方法列表 -->
      <section class="demo-section">
        <h2>已注册的 API 方法</h2>
        <div class="demo-controls">
          <button @click="refreshApiMethods" class="demo-button">
            刷新方法列表
          </button>
        </div>
        
        <div v-if="apiMethods" class="demo-result">
          <div class="api-methods">
            <div v-for="method in apiMethods" :key="method" class="method-item">
              {{ method }}
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useApi, useApiCall } from '@ldesign/api/vue'

// 获取 API 引擎实例
const api = useApi()

// 基础 API 调用状态
const posts = ref<any[]>()
const postsLoading = ref(false)
const postsError = ref<Error | null>(null)

const selectedPost = ref<any>()

// Vue 组合式 API 演示
const { data: users, loading: usersLoading, error: usersError, execute: executeUsersCall } = useApiCall('getUsers')

// 批量调用状态
const batchResults = ref<any>()
const batchLoading = ref(false)
const batchError = ref<string>()

// 缓存统计
const cacheStats = ref<any>()

// API 方法列表
const apiMethods = ref<string[]>()

/**
 * 获取文章列表
 */
async function fetchPosts() {
  postsLoading.value = true
  postsError.value = null
  
  try {
    posts.value = await api.call('getPosts')
  } catch (error) {
    postsError.value = error as Error
  } finally {
    postsLoading.value = false
  }
}

/**
 * 获取单个文章
 */
async function fetchPost(id: number) {
  try {
    selectedPost.value = await api.call('getPost', { id })
  } catch (error) {
    console.error('获取文章详情失败:', error)
  }
}

/**
 * 批量调用 API
 */
async function executeBatchCall() {
  batchLoading.value = true
  batchError.value = undefined
  
  try {
    const results = await api.callBatch([
      { methodName: 'getPosts' },
      { methodName: 'getUsers' },
      { methodName: 'getComments' },
    ])
    
    batchResults.value = {
      posts: results[0],
      users: results[1],
      comments: results[2],
    }
  } catch (error) {
    batchError.value = (error as Error).message
  } finally {
    batchLoading.value = false
  }
}

/**
 * 清除文章缓存
 */
function clearPostsCache() {
  api.clearCache('getPosts')
  console.log('文章缓存已清除')
}

/**
 * 清除所有缓存
 */
function clearAllCache() {
  api.clearCache()
  refreshCacheStats()
  console.log('所有缓存已清除')
}

/**
 * 刷新缓存统计
 */
function refreshCacheStats() {
  cacheStats.value = api.getCacheStats()
}

/**
 * 刷新 API 方法列表
 */
function refreshApiMethods() {
  apiMethods.value = api.getMethodNames()
}

// 组件挂载时初始化
onMounted(async () => {
  // 手动注册API方法，确保演示功能正常工作
  try {
    console.log('[API Demo] 开始注册API方法...')

    // 注册自定义API方法
    await api.registerBatch({
      // 获取文章列表
      getPosts: {
        name: 'getPosts',
        config: {
          method: 'GET',
          url: '/posts',
        },
        transform: (response: any) => response.data,
        cache: {
          enabled: true,
          ttl: 600000, // 10分钟缓存
        },
      },

      // 获取单个文章
      getPost: {
        name: 'getPost',
        config: (params: { id: number }) => ({
          method: 'GET',
          url: `/posts/${params.id}`,
        }),
        transform: (response: any) => response.data,
        cache: {
          enabled: true,
          ttl: 300000, // 5分钟缓存
        },
      },

      // 获取用户列表
      getUsers: {
        name: 'getUsers',
        config: {
          method: 'GET',
          url: '/users',
        },
        transform: (response: any) => response.data,
        cache: {
          enabled: true,
          ttl: 1800000, // 30分钟缓存
        },
      },

      // 获取评论列表
      getComments: {
        name: 'getComments',
        config: (params?: { postId?: number }) => ({
          method: 'GET',
          url: '/comments',
          params,
        }),
        transform: (response: any) => response.data,
        cache: {
          enabled: true,
          ttl: 300000, // 5分钟缓存
        },
      },
    })

    console.log('[API Demo] API方法注册成功')
  } catch (error) {
    console.error('[API Demo] API方法注册失败:', error)
  }

  refreshCacheStats()
  refreshApiMethods()
})
</script>

<style scoped lang="less">
.api-demo {
  padding: var(--ls-padding-lg);
  max-width: 1200px;
  margin: 0 auto;
}

.demo-header {
  text-align: center;
  margin-bottom: var(--ls-margin-xl);
  
  h1 {
    color: var(--ldesign-text-color-primary);
    margin-bottom: var(--ls-margin-sm);
  }
  
  p {
    color: var(--ldesign-text-color-secondary);
    font-size: var(--ls-font-size-lg);
  }
}

.demo-section {
  margin-bottom: var(--ls-margin-xl);
  padding: var(--ls-padding-lg);
  background: var(--ldesign-bg-color-container);
  border-radius: var(--ls-border-radius-lg);
  border: 1px solid var(--ldesign-border-color);
  
  h2 {
    color: var(--ldesign-text-color-primary);
    margin-bottom: var(--ls-margin-base);
    border-bottom: 2px solid var(--ldesign-brand-color);
    padding-bottom: var(--ls-padding-sm);
  }
}

.demo-controls {
  display: flex;
  gap: var(--ls-spacing-sm);
  margin-bottom: var(--ls-margin-base);
  flex-wrap: wrap;
}

.demo-button {
  padding: var(--ls-padding-sm) var(--ls-padding-base);
  background: var(--ldesign-brand-color);
  color: white;
  border: none;
  border-radius: var(--ls-border-radius-base);
  cursor: pointer;
  font-size: var(--ls-font-size-sm);
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background: var(--ldesign-brand-color-hover);
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: var(--ldesign-brand-color-disabled);
    cursor: not-allowed;
  }
  
  &.secondary {
    background: var(--ldesign-gray-color-6);
    
    &:hover:not(:disabled) {
      background: var(--ldesign-gray-color-7);
    }
  }
}

.demo-error {
  padding: var(--ls-padding-base);
  background: var(--ldesign-error-color-1);
  color: var(--ldesign-error-color);
  border-radius: var(--ls-border-radius-base);
  border: 1px solid var(--ldesign-error-color-3);
  margin-bottom: var(--ls-margin-base);
}

.demo-result {
  h3 {
    color: var(--ldesign-text-color-primary);
    margin-bottom: var(--ls-margin-base);
  }
}

.posts-grid, .users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--ls-spacing-base);
}

.post-card, .user-card {
  padding: var(--ls-padding-base);
  background: var(--ldesign-bg-color-component);
  border-radius: var(--ls-border-radius-base);
  border: 1px solid var(--ldesign-border-color);
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--ldesign-shadow-2);
    border-color: var(--ldesign-brand-color);
  }
  
  h4 {
    color: var(--ldesign-text-color-primary);
    margin-bottom: var(--ls-margin-xs);
    font-size: var(--ls-font-size-base);
  }
  
  p {
    color: var(--ldesign-text-color-secondary);
    margin-bottom: var(--ls-margin-xs);
    line-height: 1.5;
  }
  
  small {
    color: var(--ldesign-text-color-placeholder);
    font-size: var(--ls-font-size-xs);
  }
}

.post-detail {
  padding: var(--ls-padding-lg);
  background: var(--ldesign-bg-color-component);
  border-radius: var(--ls-border-radius-base);
  border: 1px solid var(--ldesign-border-color);
  
  h3 {
    color: var(--ldesign-text-color-primary);
    margin-bottom: var(--ls-margin-base);
  }
  
  p {
    color: var(--ldesign-text-color-secondary);
    line-height: 1.6;
    margin-bottom: var(--ls-margin-base);
  }
}

.batch-results, .cache-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--ls-spacing-base);
}

.batch-item, .stat-item {
  padding: var(--ls-padding-base);
  background: var(--ldesign-bg-color-component);
  border-radius: var(--ls-border-radius-base);
  border: 1px solid var(--ldesign-border-color);
  text-align: center;
  
  h4 {
    color: var(--ldesign-text-color-primary);
    margin-bottom: var(--ls-margin-xs);
    font-size: var(--ls-font-size-sm);
  }
  
  p {
    color: var(--ldesign-brand-color);
    font-size: var(--ls-font-size-xl);
    font-weight: bold;
  }
}

.api-methods {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--ls-spacing-sm);
}

.method-item {
  padding: var(--ls-padding-sm);
  background: var(--ldesign-bg-color-component);
  border-radius: var(--ls-border-radius-base);
  border: 1px solid var(--ldesign-border-color);
  font-family: 'Courier New', monospace;
  font-size: var(--ls-font-size-xs);
  color: var(--ldesign-text-color-primary);
  text-align: center;
}
</style>
