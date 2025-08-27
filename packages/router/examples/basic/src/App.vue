<script setup lang="ts">
import { RouterLink, RouterView, useRoute, useRouter } from '@ldesign/router'
import { useUserStore } from './stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

function logout() {
  userStore.logout()
  router.push('/')
}
</script>

<template>
  <div class="container">
    <header class="header">
      <h1>@ldesign/router 基础示例</h1>
      <p>这是一个展示 @ldesign/router 基础功能的简单示例</p>
    </header>

    <nav class="nav">
      <RouterLink to="/">
        首页
      </RouterLink>
      <RouterLink to="/about">
        关于
      </RouterLink>
      <RouterLink to="/user/123">
        用户详情
      </RouterLink>
      <RouterLink to="/protected">
        受保护页面
      </RouterLink>
      <RouterLink to="/error-demo">
        错误演示
      </RouterLink>
      <RouterLink to="/device-demo">
        设备适配
      </RouterLink>
      <RouterLink to="/plugin-demo">
        插件功能
      </RouterLink>
      <RouterLink to="/history-demo">
        历史模式
      </RouterLink>
      <RouterLink to="/nested-demo">
        嵌套路由
      </RouterLink>
      <RouterLink v-if="!userStore.isLoggedIn" to="/login">
        登录
      </RouterLink>
      <button v-else style="padding: 10px 20px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;" @click="logout">
        退出 ({{ userStore.username }})
      </button>
      <RouterLink to="/nonexistent">
        404页面
      </RouterLink>
    </nav>

    <main class="content">
      <RouterView />
    </main>

    <footer style="margin-top: 20px; text-align: center; color: #666;">
      <p>当前路由: {{ route?.path || '/' }}</p>
      <p>路由参数: {{ JSON.stringify(route?.params || {}) }}</p>
      <p>查询参数: {{ JSON.stringify(route?.query || {}) }}</p>
    </footer>
  </div>
</template>
