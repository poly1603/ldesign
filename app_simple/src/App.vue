<template>
  <div class="app-container">
    <!-- 导航栏 -->
    <nav class="navbar">
      <div class="nav-brand">
        <span class="logo">🚀</span>
        <span class="brand-text">{{ t('app.name') }}</span>
      </div>
      
      <div class="nav-links">
        <router-link to="/" class="nav-link" :class="{ active: $route.path === '/' }">
          {{ t('nav.home') }}
        </router-link>
        <router-link to="/about" class="nav-link" :class="{ active: $route.path === '/about' }">
          {{ t('nav.about') }}
        </router-link>
        <router-link
          v-if="isLoggedIn" 
          to="/dashboard" 
          class="nav-link" 
          :class="{ active: $route.path === '/dashboard' }"
        >
          {{ t('nav.dashboard') }}
        </router-link>
        
        <div class="nav-spacer"></div>
        
        <!-- 语言切换器 -->
        <LanguageSwitcher class="nav-locale" />
        
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
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    
    <!-- 页脚 -->
    <footer class="footer">
      <p>{{ t('app.copyright') }}</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from '@ldesign/router'
import { useI18n } from '@/i18n'
import { auth } from '@/composables/useAuth'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 导航栏样式 */
.navbar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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
  color: #2c3e50;
  margin-right: 40px;
}

.logo {
  font-size: 28px;
  margin-right: 10px;
}

.brand-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-links {
  display: flex;
  align-items: center;
  flex: 1;
}

.nav-link {
  color: #2c3e50;
  text-decoration: none;
  padding: 8px 16px;
  margin: 0 5px;
  border-radius: 6px;
  transition: all 0.3s;
  font-weight: 500;
}

.nav-link:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.nav-link.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.nav-button.login:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.nav-button.logout {
  background: #e74c3c;
  color: white;
  margin-left: 10px;
}

.nav-button.logout:hover {
  background: #c0392b;
}

.user-menu {
  display: flex;
  align-items: center;
}

.username {
  color: #2c3e50;
  font-weight: 600;
  margin-right: 10px;
  padding: 8px 12px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 6px;
}

.nav-locale {
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
  background: rgba(0, 0, 0, 0.1);
  color: white;
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