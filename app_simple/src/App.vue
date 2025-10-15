<template>
  <div class="app-container">
    <!-- 对于blank布局，只渲染路由内容 -->
    <template v-if="$route.meta?.layout === 'blank'">
      <RouterView transition="fade" />
    </template>
    
    <!-- 默认布局 -->
    <template v-else>
      <!-- 导航栏 -->
      <nav class="navbar">
      <div class="nav-brand">
        <Rocket class="logo" />
        <span class="brand-text">{{ t('app.name') }}</span>
      </div>

      <div class="nav-links">
        <RouterLink to="/" class="nav-link" :class="{ active: $route.path === '/' }">
          {{ t('nav.home') }}
        </RouterLink>
        <RouterLink to="/about" class="nav-link" :class="{ active: $route.path === '/about' }">
          {{ t('nav.about') }}
        </RouterLink>
        <RouterLink v-if="isLoggedIn" to="/dashboard" class="nav-link"
          :class="{ active: $route.path === '/dashboard' }">
          {{ t('nav.dashboard') }}
        </RouterLink>

        <div class="nav-spacer"></div>

        <!-- 语言切换器 -->
        <LanguageSwitcher class="nav-locale" />

        <!-- 主题模式切换器（亮/暗/跟随系统） -->
        <VueThemeModeSwitcher class="nav-theme-mode" />
        
        <!-- 主题颜色切换器 -->
        <VueThemePicker class="nav-theme" />

        <button v-if="!isLoggedIn" @click="goToLogin" class="nav-button login">
          {{ t('nav.login') }}
        </button>
        <div v-else class="user-menu">
          <span class="username">{{ username }}</span>
          <button @click="logout" class="nav-button logout">
            {{ t('nav.logout') }}
          </button>
        </div>
      </div>
    </nav>

    <!-- 路由视图 -->
    <main class="main-content">
      <RouterView transition="fade" />
    </main>

      <!-- 页脚 -->
      <footer class="footer">
        <p>{{ t('app.copyright') }}</p>
      </footer>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from '@ldesign/router'
import { useI18n } from '@/i18n'
import { auth } from '@/composables/useAuth'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import { VueThemePicker, VueThemeModeSwitcher } from '@ldesign/color/vue'
import { Rocket } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

// 使用认证模块的状态
const isLoggedIn = computed(() => auth.isLoggedIn.value)
const username = computed(() => auth.userInfo.value?.username || '')

// 跳转到登录页
const goToLogin = () => {
  router.push('/login')
}

// 退出登录
const logout = async () => {
  const result = await auth.logout()

  if (result.success) {
    // 如果在需要认证的页面，跳转到首页
    if (route.meta?.requiresAuth) {
      await router.push('/')
    }
  }
}

onMounted(() => {
  // 初始化认证状态
  auth.initAuth()
})
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: var(--color-background);
}

/* 导航栏样式 */
.navbar {
  background: var(--color-background-secondary);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px var(--color-border-light);
  padding: 0 20px;
  display: flex;
  align-items: center;
  height: 60px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-brand {
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  color: var(--color-text-primary);
  margin-right: 40px;
}

.logo {
  width: 28px;
  height: 28px;
  margin-right: 10px;
  color: var(--color-primary-default);
}

.brand-text {
  color: var(--color-text-primary);
}

.nav-links {
  display: flex;
  align-items: center;
  flex: 1;
}

.nav-link {
  color: var(--color-text-primary);
  text-decoration: none;
  padding: 8px 16px;
  margin: 0 5px;
  border-radius: 6px;
  transition: all 0.3s;
  font-weight: 500;
}

.nav-link:hover {
  background: var(--color-primary-100);
  color: var(--color-primary-default);
}

.nav-link.active {
  background: linear-gradient(135deg, var(--color-primary-default) 0%, var(--color-primary-active) 100%);
  color: var(--color-gray-50);
}

.nav-spacer {
  flex: 1;
}

.nav-button {
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.nav-button.login {
  background: linear-gradient(135deg, var(--color-primary-default) 0%, var(--color-primary-active) 100%);
  color: var(--color-gray-50);
}

.nav-button.login:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px var(--color-primary-300);
}

.nav-button.logout {
  background: var(--color-danger-default);
  color: white;
  margin-left: 10px;
}

.nav-button.logout:hover {
  background: var(--color-danger-hover);
}

.user-menu {
  display: flex;
  align-items: center;
}

.username {
  color: var(--color-text-primary);
  font-weight: 600;
  margin-right: 10px;
  padding: 8px 12px;
  background: var(--color-primary-100);
  border-radius: 6px;
}

.nav-locale,
.nav-theme-mode,
.nav-theme {
  margin: 0 10px;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  padding: 40px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

/* 页脚 */
.footer {
  background: var(--color-gray-800);
  color: var(--color-gray-50);
  text-align: center;
  padding: 20px;
  font-size: 14px;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>