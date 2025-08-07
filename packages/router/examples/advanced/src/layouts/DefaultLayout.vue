<template>
  <div class="default-layout">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="header__container">
        <!-- Logo -->
        <div class="header__logo">
          <router-link to="/" class="logo">
            <span class="logo__icon">🚀</span>
            <span class="logo__text">LDesign Router</span>
          </router-link>
        </div>

        <!-- 主导航 -->
        <nav class="header__nav">
          <router-link
            v-for="item in mainNavItems"
            :key="item.name"
            :to="item.path"
            class="nav-item"
            :class="{ 'nav-item--active': isActiveRoute(item.path) }"
          >
            <span class="nav-item__icon">{{ item.icon }}</span>
            <span class="nav-item__text">{{ item.title }}</span>
          </router-link>
        </nav>

        <!-- 用户菜单 -->
        <div class="header__user">
          <div v-if="userStore.isAuthenticated" class="user-menu">
            <button class="user-menu__trigger" @click="toggleUserMenu">
              <img
                :src="userStore.user?.avatar"
                :alt="userStore.fullName"
                class="user-menu__avatar"
              />
              <span class="user-menu__name">{{ userStore.fullName }}</span>
              <span class="user-menu__arrow">▼</span>
            </button>

            <div v-if="showUserMenu" class="user-menu__dropdown">
              <router-link to="/settings/profile" class="dropdown-item">
                <span class="dropdown-item__icon">👤</span>
                <span class="dropdown-item__text">个人资料</span>
              </router-link>
              <router-link to="/settings" class="dropdown-item">
                <span class="dropdown-item__icon">⚙️</span>
                <span class="dropdown-item__text">设置</span>
              </router-link>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item" @click="handleLogout">
                <span class="dropdown-item__icon">🚪</span>
                <span class="dropdown-item__text">退出登录</span>
              </button>
            </div>
          </div>

          <router-link v-else to="/login" class="btn btn--primary">
            登录
          </router-link>
        </div>
      </div>
    </header>

    <!-- 面包屑导航 -->
    <div v-if="showBreadcrumb" class="breadcrumb">
      <div class="breadcrumb__container">
        <router-link to="/" class="breadcrumb__item">
          <span class="breadcrumb__icon">🏠</span>
          <span class="breadcrumb__text">首页</span>
        </router-link>
        <span
          v-for="(item, index) in breadcrumbItems"
          :key="index"
          class="breadcrumb__separator"
        >
          /
        </span>
        <span
          v-for="(item, index) in breadcrumbItems"
          :key="index"
          class="breadcrumb__item"
          :class="{
            'breadcrumb__item--current': index === breadcrumbItems.length - 1,
          }"
        >
          <span v-if="item.icon" class="breadcrumb__icon">{{ item.icon }}</span>
          <span class="breadcrumb__text">{{ item.title }}</span>
        </span>
      </div>
    </div>

    <!-- 主内容区域 -->
    <main class="main">
      <div class="main__container">
        <router-view v-slot="{ Component, route }">
          <transition
            :name="route.meta.transition?.name || 'route'"
            :mode="route.meta.transition?.mode || 'out-in'"
            appear
          >
            <component :is="Component" :key="route.path" />
          </transition>
        </router-view>
      </div>
    </main>

    <!-- 底部 -->
    <footer class="footer">
      <div class="footer__container">
        <div class="footer__content">
          <div class="footer__section">
            <h3 class="footer__title">LDesign Router</h3>
            <p class="footer__description">
              一个功能强大、易于使用的 Vue 路由器库
            </p>
          </div>

          <div class="footer__section">
            <h4 class="footer__subtitle">快速链接</h4>
            <ul class="footer__links">
              <li><router-link to="/about">关于我们</router-link></li>
              <li><router-link to="/docs">文档</router-link></li>
              <li><a href="https://github.com" target="_blank">GitHub</a></li>
            </ul>
          </div>

          <div class="footer__section">
            <h4 class="footer__subtitle">联系我们</h4>
            <ul class="footer__links">
              <li><a href="mailto:contact@ldesign.com">邮箱</a></li>
              <li><a href="tel:+86-400-123-4567">电话</a></li>
            </ul>
          </div>
        </div>

        <div class="footer__bottom">
          <p class="footer__copyright">© 2024 LDesign. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from '@ldesign/router'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 响应式状态
const showUserMenu = ref(false)

// 主导航项
const mainNavItems = [
  { name: 'Home', path: '/', title: '首页', icon: '🏠' },
  { name: 'Dashboard', path: '/dashboard', title: '仪表盘', icon: '📊' },
  { name: 'Products', path: '/products', title: '产品', icon: '📦' },
  { name: 'Users', path: '/users', title: '用户', icon: '👥' },
  { name: 'About', path: '/about', title: '关于', icon: 'ℹ️' },
]

// 计算属性
const showBreadcrumb = computed(() => {
  return route.meta.breadcrumb !== false && route.path !== '/'
})

const breadcrumbItems = computed(() => {
  const items = []
  const matched = route.matched.filter(record => record.meta?.title)

  for (const record of matched) {
    items.push({
      title: record.meta.title,
      icon: record.meta.icon,
      path: record.path,
    })
  }

  return items
})

// 方法
const isActiveRoute = (path: string) => {
  return route.path.startsWith(path) && path !== '/'
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const handleLogout = async () => {
  userStore.logout()
  showUserMenu.value = false
  await router.push('/login')
}

// 点击外部关闭用户菜单
const handleClickOutside = (event: Event) => {
  const target = event.target as Element
  if (!target.closest('.user-menu')) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.default-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

// 头部样式
.header {
  background: white;
  box-shadow: @box-shadow-base;
  position: sticky;
  top: 0;
  z-index: 100;

  &__container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    align-items: center;
    height: 64px;
  }

  &__logo {
    margin-right: 40px;
  }

  &__nav {
    flex: 1;
    display: flex;
    gap: 8px;
  }

  &__user {
    position: relative;
  }
}

// Logo 样式
.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 600;
  color: @primary-color;
  text-decoration: none;

  &__icon {
    font-size: 24px;
  }

  &:hover {
    color: @primary-color-hover;
  }
}

// 导航项样式
.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: @border-radius;
  color: @text-color;
  text-decoration: none;
  transition: all 0.3s ease;

  &:hover {
    background-color: @bg-color-light;
    color: @primary-color;
  }

  &--active {
    background-color: @primary-color;
    color: white;

    &:hover {
      background-color: @primary-color-hover;
      color: white;
    }
  }

  &__icon {
    font-size: 16px;
  }

  &__text {
    font-weight: 500;
  }
}

// 用户菜单样式
.user-menu {
  position: relative;

  &__trigger {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    border: none;
    border-radius: @border-radius;
    background: transparent;
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: @bg-color-light;
    }
  }

  &__avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
  }

  &__name {
    font-weight: 500;
    color: @text-color;
  }

  &__arrow {
    font-size: 12px;
    color: @text-color-secondary;
    transition: transform 0.3s ease;
  }

  &__dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 8px;
    min-width: 200px;
    background: white;
    border-radius: @border-radius;
    box-shadow: @box-shadow-hover;
    overflow: hidden;
    z-index: 1000;
  }
}

// 下拉菜单项样式
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: @text-color;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: @bg-color-light;
  }

  &__icon {
    font-size: 16px;
  }

  &__text {
    font-weight: 500;
  }
}

.dropdown-divider {
  height: 1px;
  background-color: @border-color-light;
  margin: 4px 0;
}

// 面包屑样式
.breadcrumb {
  background-color: @bg-color-light;
  border-bottom: 1px solid @border-color-light;

  &__container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 12px 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 4px;
    color: @text-color-secondary;
    text-decoration: none;

    &:hover:not(&--current) {
      color: @primary-color;
    }

    &--current {
      color: @text-color;
      font-weight: 500;
    }
  }

  &__separator {
    color: @text-color-tertiary;
  }

  &__icon {
    font-size: 14px;
  }

  &__text {
    font-size: 14px;
  }
}

// 主内容样式
.main {
  flex: 1;

  &__container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px 20px;
  }
}

// 底部样式
.footer {
  background-color: @text-color;
  color: white;
  margin-top: auto;

  &__container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px 20px;
  }

  &__content {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: 40px;
    margin-bottom: 30px;
  }

  &__section {
    h3,
    h4 {
      margin-bottom: 16px;
    }
  }

  &__title {
    font-size: 24px;
    font-weight: 600;
    color: @primary-color;
  }

  &__subtitle {
    font-size: 16px;
    font-weight: 600;
  }

  &__description {
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.6;
  }

  &__links {
    list-style: none;

    li {
      margin-bottom: 8px;
    }

    a {
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      transition: color 0.3s ease;

      &:hover {
        color: @primary-color;
      }
    }
  }

  &__bottom {
    padding-top: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    text-align: center;
  }

  &__copyright {
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .header {
    &__container {
      padding: 0 16px;
      height: 56px;
    }

    &__nav {
      display: none;
    }
  }

  .main {
    &__container {
      padding: 16px;
    }
  }

  .footer {
    &__content {
      grid-template-columns: 1fr;
      gap: 24px;
    }
  }
}
</style>
