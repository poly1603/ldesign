<template>
  <header class="app-header">
    <div class="header-container">
      <!-- Logo 和标题 -->
      <div class="header-brand">
        <RouterLink to="/" class="brand-link">
          <div class="brand-logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="var(--ldesign-brand-color)"/>
              <path d="M8 12L16 8L24 12V20L16 24L8 20V12Z" stroke="white" stroke-width="2" fill="none"/>
              <circle cx="16" cy="16" r="3" fill="white"/>
            </svg>
          </div>
          <div class="brand-text">
            <h1 class="brand-title">@ldesign/router</h1>
            <p class="brand-subtitle">Examples</p>
          </div>
        </RouterLink>
      </div>

      <!-- 主导航菜单 -->
      <nav class="header-nav">
        <ul class="nav-list">
          <li class="nav-item">
            <RouterLink to="/" class="nav-link">
              <span class="nav-icon">🏠</span>
              <span class="nav-text">首页</span>
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink to="/basic" class="nav-link">
              <span class="nav-icon">📚</span>
              <span class="nav-text">基础功能</span>
            </RouterLink>
          </li>

        </ul>
      </nav>

      <!-- 右侧工具栏 -->
      <div class="header-tools">
        <!-- 设备信息显示 -->
        <div class="device-info">
          <span class="device-icon">{{ deviceIcon }}</span>
          <span class="device-text">{{ deviceName }}</span>
        </div>

        <!-- 主题切换 -->
        <button 
          class="theme-toggle"
          @click="toggleTheme"
          :title="isDark ? '切换到亮色主题' : '切换到暗色主题'"
        >
          <span class="theme-icon">{{ isDark ? '☀️' : '🌙' }}</span>
        </button>

        <!-- GitHub 链接 -->
        <a 
          href="https://github.com/ldesign/ldesign" 
          target="_blank"
          class="github-link"
          title="查看源码"
        >
          <span class="github-icon">📦</span>
        </a>
      </div>

      <!-- 移动端菜单按钮 -->
      <button 
        class="mobile-menu-toggle"
        @click="toggleMobileMenu"
        :class="{ active: isMobileMenuOpen }"
      >
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>
    </div>

    <!-- 移动端导航菜单 -->
    <Transition name="mobile-menu">
      <div v-if="isMobileMenuOpen" class="mobile-nav">
        <nav class="mobile-nav-content">
          <RouterLink 
            v-for="item in mobileNavItems" 
            :key="item.path"
            :to="item.path" 
            class="mobile-nav-link"
            @click="closeMobileMenu"
          >
            <span class="mobile-nav-icon">{{ item.icon }}</span>
            <span class="mobile-nav-text">{{ item.text }}</span>
          </RouterLink>
        </nav>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from '@ldesign/router'

/**
 * 应用头部组件
 * 
 * 功能特性：
 * 1. 响应式导航菜单
 * 2. 设备信息显示
 * 3. 主题切换
 * 4. 移动端适配
 */

// 响应式状态
const isDark = ref(false)
const isMobileMenuOpen = ref(false)
const currentDevice = ref('desktop')

// 获取当前路由
const route = useRoute()

// 移动端导航项目
const mobileNavItems = [
  { path: '/', icon: '🏠', text: '首页' },
  { path: '/basic', icon: '📚', text: '基础功能' }
]

// 计算属性
const deviceIcon = computed(() => {
  switch (currentDevice.value) {
    case 'mobile': return '📱'
    case 'tablet': return '📟'
    case 'desktop': return '💻'
    default: return '🖥️'
  }
})

const deviceName = computed(() => {
  switch (currentDevice.value) {
    case 'mobile': return '移动端'
    case 'tablet': return '平板'
    case 'desktop': return '桌面端'
    default: return '未知设备'
  }
})

// 方法
const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const detectDevice = () => {
  const width = window.innerWidth
  if (width < 768) {
    currentDevice.value = 'mobile'
  } else if (width < 1024) {
    currentDevice.value = 'tablet'
  } else {
    currentDevice.value = 'desktop'
  }
}

const handleResize = () => {
  detectDevice()
  if (window.innerWidth >= 768) {
    isMobileMenuOpen.value = false
  }
}

// 生命周期
onMounted(() => {
  // 检测设备类型
  detectDevice()
  
  // 恢复主题设置
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDark.value = true
    document.documentElement.setAttribute('data-theme', 'dark')
  }
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="less" scoped>
.app-header {
  background-color: #fff;
  border-bottom: 1px solid var(--ldesign-border-color);
  .box-shadow(var(--ls-shadow-sm));
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--ls-padding-base);
  height: 64px;
  .flex-between();
}

// 品牌区域
.header-brand {
  .brand-link {
    .flex-center();
    gap: var(--ls-spacing-sm);
    color: inherit;
    
    &:hover {
      color: inherit;
    }
  }
  
  .brand-logo {
    .flex-center();
  }
  
  .brand-text {
    .brand-title {
      font-size: var(--ls-font-size-lg);
      font-weight: 600;
      margin: 0;
      color: var(--ldesign-brand-color);
    }
    
    .brand-subtitle {
      font-size: var(--ls-font-size-xs);
      margin: 0;
      color: var(--ldesign-text-color-secondary);
    }
  }
}

// 导航菜单
.header-nav {
  .nav-list {
    .flex-center();
    gap: var(--ls-spacing-base);
    list-style: none;
    margin: 0;
    padding: 0;
  }
  
  .nav-item {
    .nav-link {
      .flex-center();
      gap: var(--ls-spacing-xs);
      padding: var(--ls-padding-sm) var(--ls-padding-base);
      .border-radius();
      .transition();
      color: var(--ldesign-text-color-primary);
      
      &:hover {
        background-color: var(--ldesign-bg-color-container-hover);
        color: var(--ldesign-brand-color);
      }
      
      &.router-link-active {
        background-color: var(--ldesign-brand-color-focus);
        color: var(--ldesign-brand-color);
      }
    }
    
    .nav-icon {
      font-size: var(--ls-font-size-base);
    }
    
    .nav-text {
      font-size: var(--ls-font-size-sm);
      font-weight: 500;
    }
  }
}

// 工具栏
.header-tools {
  .flex-center();
  gap: var(--ls-spacing-base);
  
  .device-info {
    .flex-center();
    gap: var(--ls-spacing-xs);
    padding: var(--ls-padding-xs) var(--ls-padding-sm);
    background-color: var(--ldesign-gray-color-1);
    .border-radius();
    font-size: var(--ls-font-size-xs);
    color: var(--ldesign-text-color-secondary);
  // 工具栏按钮样式优化
  .theme-toggle,
  .github-link {
    .flex-center();
    width: 40px;
    height: 40px;
    .border-radius();
    background-color: transparent;
    border: 1px solid transparent;
    cursor: pointer;
    color: var(--ldesign-text-color-secondary);
    position: relative;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    // 添加焦点样式
    &:focus-visible {
      outline: 2px solid var(--ldesign-brand-color);
      outline-offset: 2px;
    }
    
    // 优化悬停效果
    &:hover {
      background-color: var(--ldesign-gray-color-1);
      color: var(--ldesign-brand-color);
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      
      .theme-icon,
      .github-icon {
        transform: scale(1.1);
      }
    }
    
    // 激活状态
    &:active {
      transform: translateY(0);
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
    }
    
    // 图标过渡动画
    .theme-icon,
    .github-icon {
      transition: transform 0.3s ease;
      font-size: 18px;
    }
  }
  }
}

// 移动端菜单按钮
.mobile-menu-toggle {
  display: none;
  .flex-column();
  justify-content: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  cursor: pointer;
  gap: 4px;
  
  .hamburger-line {
    width: 20px;
    height: 2px;
    background-color: var(--ldesign-text-color-primary);
    .transition();
  }
  
  &.active {
    .hamburger-line {
      &:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
      }
      
      &:nth-child(2) {
        opacity: 0;
      }
      
      &:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
      }
    }
  }
}

// 移动端导航
.mobile-nav {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: #fff;
  border-bottom: 1px solid var(--ldesign-border-color);
  .box-shadow(var(--ls-shadow-base));
  
  .mobile-nav-content {
    padding: var(--ls-padding-base);
    
    .mobile-nav-link {
      .flex-center();
      gap: var(--ls-spacing-sm);
      padding: var(--ls-padding-base);
      .border-radius();
      .transition();
      color: var(--ldesign-text-color-primary);
      margin-bottom: var(--ls-margin-xs);
      
      &:hover,
      &.router-link-active {
        background-color: var(--ldesign-brand-color-focus);
        color: var(--ldesign-brand-color);
      }
      
      .mobile-nav-icon {
        font-size: var(--ls-font-size-lg);
      }
      
      .mobile-nav-text {
        font-size: var(--ls-font-size-base);
        font-weight: 500;
      }
    }
  }
}

// 移动端动画
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: all 0.3s ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

// 响应式设计
.mobile({
  .header-nav {
    display: none;
  }
  
  .header-tools {
    .device-info {
      display: none;
    }
  }
  
  .mobile-menu-toggle {
    display: flex;
  }
});

.tablet({
  .header-nav {
    .nav-text {
      display: none;
    }
  }
});
</style>
