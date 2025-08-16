<script setup lang="ts">
import { useNavigation, useRoute, useRouter } from '@ldesign/router'
import { computed, onMounted, ref, watch } from 'vue'

const route = useRoute()
const router = useRouter()
const navigation = useNavigation()

// 响应式数据
const queryParam = ref('')
const navigationHistory = ref<
  Array<{
    time: string
    from: string
    to: string
  }>
>([])

// 导航状态
const navigationState = computed(() => ({
  isNavigating: navigation.isNavigating.value,
  direction: navigation.direction.value,
  lastNavigationTime: navigation.lastNavigationTime.value,
}))

// 路由组合式 API 信息
const routeComposableInfo = computed(() => ({
  'route.path': route.path,
  'route.name': route.name,
  'route.params': route.params,
  'route.query': route.query,
  'route.meta': route.meta,
  'router.currentRoute': router.currentRoute.value.path,
}))

// 导航方法
function goHome() {
  router.push('/')
}

function goToNested() {
  router.push('/nested')
}

function goToDynamic() {
  const id = Math.floor(Math.random() * 1000)
  router.push(`/dynamic/${id}`)
}

function navigateWithQuery() {
  router.push({
    path: '/basic',
    query: { param: queryParam.value, timestamp: Date.now() },
  })
}

function goBack() {
  router.back()
}

function goForward() {
  router.forward()
}

function replace() {
  router.replace({
    path: '/basic',
    query: { replaced: 'true', timestamp: Date.now() },
  })
}

// 监听路由变化
watch(
  () => route.path,
  (to, from) => {
    if (from) {
      navigationHistory.value.unshift({
        time: new Date().toLocaleTimeString(),
        from,
        to,
      })

      // 只保留最近 5 条记录
      if (navigationHistory.value.length > 5) {
        navigationHistory.value = navigationHistory.value.slice(0, 5)
      }
    }
  },
)

onMounted(() => {
  console.log('BasicRouting 组件已挂载')
  console.log('当前路由:', route)
  console.log('路由器实例:', router)
})
</script>

<template>
  <div class="basic-routing">
    <div class="card">
      <h1>基础路由演示</h1>
      <p>
        这里演示了 @ldesign/router
        的基础路由功能，包括路由导航、参数传递和状态管理。
      </p>
    </div>

    <div class="card">
      <h2>路由信息</h2>
      <div class="route-info">
        <div class="info-item">
          <strong>当前路径:</strong> {{ route.path }}
        </div>
        <div class="info-item">
          <strong>路由名称:</strong> {{ route.name }}
        </div>
        <div class="info-item">
          <strong>查询参数:</strong> {{ JSON.stringify(route.query) }}
        </div>
        <div class="info-item">
          <strong>路由元信息:</strong> {{ JSON.stringify(route.meta) }}
        </div>
      </div>
    </div>

    <div class="card">
      <h2>编程式导航</h2>
      <div class="navigation-demo">
        <div class="nav-group">
          <h3>基础导航</h3>
          <button class="btn btn-primary" @click="goHome">
            返回首页
          </button>
          <button class="btn btn-secondary" @click="goToNested">
            前往嵌套路由
          </button>
          <button class="btn btn-success" @click="goToDynamic">
            前往动态路由
          </button>
        </div>

        <div class="nav-group">
          <h3>带参数导航</h3>
          <div class="form-group">
            <label>查询参数:</label>
            <input
              v-model="queryParam"
              class="input"
              placeholder="输入查询参数"
            >
          </div>
          <button class="btn btn-info" @click="navigateWithQuery">
            带查询参数导航
          </button>
        </div>

        <div class="nav-group">
          <h3>历史操作</h3>
          <button class="btn btn-warning" @click="goBack">
            后退
          </button>
          <button class="btn btn-warning" @click="goForward">
            前进
          </button>
          <button class="btn btn-error" @click="replace">
            替换当前路由
          </button>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>路由监听</h2>
      <div class="route-watcher">
        <h3>导航历史 (最近 5 条)</h3>
        <ul class="history-list">
          <li
            v-for="(item, index) in navigationHistory"
            :key="index"
            class="history-item"
          >
            <span class="history-time">{{ item.time }}</span>
            <span class="history-from">{{ item.from }}</span>
            <span class="history-arrow">→</span>
            <span class="history-to">{{ item.to }}</span>
          </li>
        </ul>
      </div>
    </div>

    <div class="card">
      <h2>路由组合式 API 演示</h2>
      <div class="composables-demo">
        <div class="demo-section">
          <h3>useRoute 和 useRouter</h3>
          <pre class="code-block">{{ routeComposableInfo }}</pre>
        </div>

        <div class="demo-section">
          <h3>useNavigation</h3>
          <div class="navigation-info">
            <div class="info-item">
              <strong>是否正在导航:</strong> {{ navigationState.isNavigating }}
            </div>
            <div class="info-item">
              <strong>导航方向:</strong> {{ navigationState.direction }}
            </div>
            <div class="info-item">
              <strong>上次导航时间:</strong>
              {{ navigationState.lastNavigationTime }}ms
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.basic-routing {
  max-width: 1000px;
  margin: 0 auto;
}

.route-info {
  background: @gray-50;
  padding: @spacing-md;
  border-radius: @border-radius-md;
  border-left: 4px solid @primary-color;
}

.info-item {
  margin-bottom: @spacing-sm;

  &:last-child {
    margin-bottom: 0;
  }

  strong {
    color: @gray-700;
    margin-right: @spacing-sm;
  }
}

.navigation-demo {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: @spacing-lg;
}

.nav-group {
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

.history-list {
  list-style: none;
  padding: 0;
}

.history-item {
  display: flex;
  align-items: center;
  padding: @spacing-sm;
  margin-bottom: @spacing-xs;
  background: @gray-50;
  border-radius: @border-radius-sm;
  font-family: monospace;
  font-size: @font-size-sm;

  .history-time {
    color: @gray-500;
    margin-right: @spacing-sm;
    min-width: 80px;
  }

  .history-from {
    color: @error-color;
    margin-right: @spacing-sm;
  }

  .history-arrow {
    color: @gray-400;
    margin-right: @spacing-sm;
  }

  .history-to {
    color: @success-color;
  }
}

.composables-demo {
  display: grid;
  gap: @spacing-lg;
}

.demo-section {
  h3 {
    margin-bottom: @spacing-md;
    color: @gray-700;
  }
}

.code-block {
  background: @gray-900;
  color: @gray-100;
  padding: @spacing-md;
  border-radius: @border-radius-md;
  overflow-x: auto;
  font-size: @font-size-sm;
  line-height: 1.5;
}

.navigation-info {
  background: @gray-50;
  padding: @spacing-md;
  border-radius: @border-radius-md;
}

@media (max-width: 768px) {
  .navigation-demo {
    grid-template-columns: 1fr;
  }

  .nav-group .btn {
    display: block;
    width: 100%;
    margin-right: 0;
  }
}
</style>
