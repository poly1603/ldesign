<script setup lang="ts">
import {
  RouterLink,
  RouterView,
  useMatched,
  useRoute,
  useRouter,
} from '@ldesign/router'
import { computed, ref } from 'vue'

const route = useRoute()
const router = useRouter()
const matched = useMatched()

const paramValue = ref('')

// 匹配的路由
const matchedRoutes = computed(() => matched.value)

// 路由深度 - 添加安全检查
const routeDepth = computed(() => {
  if (!route.value?.path)
    return 0
  return route.value.path.split('/').filter(Boolean).length
})

// 面包屑导航 - 添加安全检查
const breadcrumbs = computed(() => {
  const crumbs = []

  // 安全检查：确保路由对象和路径存在
  if (!route.value?.path) {
    return [{ name: '首页', path: '/' }]
  }

  const pathSegments = route.value.path.split('/').filter(Boolean)

  crumbs.push({ name: '首页', path: '/' })

  let currentPath = ''
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`

    if (index === 0) {
      crumbs.push({ name: '嵌套路由', path: currentPath })
    }
    else {
      crumbs.push({
        name: `子路由 ${index}`,
        path: currentPath,
      })
    }
  })

  return crumbs
})

// 导航方法
function navigateToChild1() {
  router.push('/nested/child1')
}

function navigateToChild2() {
  router.push('/nested/child2')
}

function navigateToDefault() {
  router.push('/nested')
}

function navigateWithParams() {
  router.push({
    path: '/nested/child1',
    query: { param: paramValue.value, timestamp: Date.now().toString() },
  })
}
</script>

<template>
  <div class="nested-routing">
    <div class="card">
      <h1>嵌套路由演示</h1>
      <p>
        这里演示了 @ldesign/router
        的嵌套路由功能，包括子路由导航和多层级路由结构。
      </p>
    </div>

    <div class="nested-layout">
      <!-- 侧边导航 -->
      <aside class="sidebar">
        <h3>子路由导航</h3>
        <nav class="nested-nav">
          <RouterLink to="/nested" class="nav-item" exact-active-class="active">
            默认页面
          </RouterLink>
          <RouterLink
            to="/nested/child1"
            class="nav-item"
            active-class="active"
          >
            子路由 1
          </RouterLink>
          <RouterLink
            to="/nested/child2"
            class="nav-item"
            active-class="active"
          >
            子路由 2
          </RouterLink>
        </nav>

        <div class="route-depth">
          <h4>路由层级信息</h4>
          <div class="depth-info">
            <div class="info-item">
              <strong>当前路径:</strong> {{ route?.path || '/' }}
            </div>
            <div class="info-item">
              <strong>匹配的路由:</strong> {{ matchedRoutes.length }} 层
            </div>
            <div class="info-item">
              <strong>路由深度:</strong> {{ routeDepth }}
            </div>
          </div>

          <div class="matched-routes">
            <h5>匹配的路由组件:</h5>
            <ul>
              <li
                v-for="(matchedRoute, index) in matchedRoutes"
                :key="index"
                class="matched-item"
              >
                <span class="route-name">{{
                  matchedRoute.name || '匿名路由'
                }}</span>
                <span class="route-path">{{ matchedRoute.path }}</span>
              </li>
            </ul>
          </div>
        </div>
      </aside>

      <!-- 主内容区域 -->
      <main class="content">
        <div class="content-header">
          <h2>子路由内容区域</h2>
          <div class="breadcrumb">
            <span
              v-for="(crumb, index) in breadcrumbs"
              :key="index"
              class="breadcrumb-item"
            >
              <RouterLink :to="crumb.path" class="breadcrumb-link">
                {{ crumb.name }}
              </RouterLink>
              <span
                v-if="index < breadcrumbs.length - 1"
                class="breadcrumb-separator"
              >/</span>
            </span>
          </div>
        </div>

        <!-- 子路由视图 -->
        <div class="nested-view">
          <RouterView
            v-slot="{ Component, route: childRoute, isLoading, error }"
          >
            <transition name="nested-fade" mode="out-in">
              <component
                :is="Component"
                v-if="Component"
                :key="childRoute?.path || 'default'"
                :route-info="childRoute"
              />
              <div v-else-if="isLoading" class="loading-component">
                <div class="spinner" />
                <p>正在加载子路由组件...</p>
              </div>
              <div v-else-if="error" class="error-component">
                <p>加载组件时出错：{{ error.message }}</p>
                <button @click="router.go(0)">
                  重新加载
                </button>
              </div>
              <div v-else class="empty-component">
                <p>没有找到匹配的子路由组件</p>
              </div>
            </transition>
          </RouterView>
        </div>
      </main>
    </div>

    <div class="card">
      <h2>嵌套路由操作</h2>
      <div class="nested-actions">
        <div class="action-group">
          <h3>编程式导航</h3>
          <button class="btn btn-primary" @click="navigateToChild1">
            导航到子路由 1
          </button>
          <button class="btn btn-secondary" @click="navigateToChild2">
            导航到子路由 2
          </button>
          <button class="btn btn-success" @click="navigateToDefault">
            返回默认页面
          </button>
        </div>

        <div class="action-group">
          <h3>带参数导航</h3>
          <div class="form-group">
            <label>参数值:</label>
            <input
              v-model="paramValue"
              class="input"
              placeholder="输入参数值"
            >
          </div>
          <button class="btn btn-info" @click="navigateWithParams">
            带参数导航
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.nested-routing {
  max-width: 1200px;
  margin: 0 auto;
}

.nested-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: @spacing-lg;
  margin-bottom: @spacing-lg;
}

.sidebar {
  background: white;
  border-radius: @border-radius-lg;
  padding: @spacing-lg;
  box-shadow: @shadow-md;
  height: fit-content;

  h3 {
    margin-bottom: @spacing-md;
    color: @gray-800;
    font-size: @font-size-lg;
  }
}

.nested-nav {
  margin-bottom: @spacing-xl;

  .nav-item {
    display: block;
    padding: @spacing-sm @spacing-md;
    margin-bottom: @spacing-xs;
    color: @gray-600;
    text-decoration: none;
    border-radius: @border-radius-md;
    transition: all @transition-base;

    &:hover {
      background: @gray-100;
      color: @gray-800;
    }

    &.active {
      background: @primary-color;
      color: white;
      font-weight: 500;
    }
  }
}

.route-depth {
  h4 {
    margin-bottom: @spacing-sm;
    color: @gray-700;
    font-size: @font-size-base;
  }

  h5 {
    margin: @spacing-md 0 @spacing-sm 0;
    color: @gray-700;
    font-size: @font-size-sm;
  }
}

.depth-info {
  background: @gray-50;
  padding: @spacing-sm;
  border-radius: @border-radius-sm;
  margin-bottom: @spacing-md;
  font-size: @font-size-sm;
}

.matched-routes {
  ul {
    list-style: none;
    padding: 0;
  }
}

.matched-item {
  display: flex;
  justify-content: space-between;
  padding: @spacing-xs;
  margin-bottom: @spacing-xs;
  background: @gray-50;
  border-radius: @border-radius-sm;
  font-size: @font-size-sm;

  .route-name {
    font-weight: 500;
    color: @gray-800;
  }

  .route-path {
    color: @gray-500;
    font-family: monospace;
  }
}

.content {
  background: white;
  border-radius: @border-radius-lg;
  box-shadow: @shadow-md;
  overflow: hidden;
}

.content-header {
  padding: @spacing-lg;
  border-bottom: 1px solid @gray-200;
  background: @gray-50;

  h2 {
    margin-bottom: @spacing-sm;
    color: @gray-800;
  }
}

.breadcrumb {
  display: flex;
  align-items: center;
  font-size: @font-size-sm;

  &-item {
    display: flex;
    align-items: center;
  }

  &-link {
    color: @primary-color;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  &-separator {
    margin: 0 @spacing-xs;
    color: @gray-400;
  }
}

.nested-view {
  padding: @spacing-lg;
  min-height: 300px;
}

.loading-component {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: @spacing-xl;
  color: @gray-600;

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid @gray-200;
    border-top: 3px solid @primary-color;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: @spacing-md;
  }
}

.error-component {
  padding: @spacing-lg;
  text-align: center;
  color: #dc3545;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: @border-radius-md;

  button {
    margin-top: @spacing-md;
    padding: @spacing-sm @spacing-md;
    background: #dc3545;
    color: white;
    border: none;
    border-radius: @border-radius-sm;
    cursor: pointer;

    &:hover {
      background: #c82333;
    }
  }
}

.empty-component {
  padding: @spacing-lg;
  text-align: center;
  color: @gray-500;
  background: @gray-50;
  border: 1px solid @gray-200;
  border-radius: @border-radius-md;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.nested-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: @spacing-lg;
}

.action-group {
  padding: @spacing-md;
  border: 1px solid @gray-200;
  border-radius: @border-radius-md;

  h3 {
    margin-bottom: @spacing-md;
    color: @gray-700;
    font-size: @font-size-lg;
  }

  .btn {
    margin-right: @spacing-sm;
    margin-bottom: @spacing-sm;
  }
}

// 嵌套路由过渡动画
.nested-fade-enter-active,
.nested-fade-leave-active {
  transition: all 0.3s ease;
}

.nested-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.nested-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

@media (max-width: 768px) {
  .nested-layout {
    grid-template-columns: 1fr;
  }

  .sidebar {
    order: 2;
  }

  .content {
    order: 1;
  }

  .nested-actions {
    grid-template-columns: 1fr;
  }

  .action-group .btn {
    display: block;
    width: 100%;
    margin-right: 0;
  }
}
</style>
