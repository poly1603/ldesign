<template>
  <aside class="app-sidebar" :class="{ collapsed: isCollapsed }">
    <!-- 侧边栏头部 -->
    <div class="sidebar-header">
      <h3 class="sidebar-title">功能导航</h3>
      <button 
        class="collapse-btn"
        @click="toggleCollapse"
        :title="isCollapsed ? '展开侧边栏' : '收起侧边栏'"
      >
        <span class="collapse-icon">{{ isCollapsed ? '→' : '←' }}</span>
      </button>
    </div>

    <!-- 导航菜单 -->
    <nav class="sidebar-nav">
      <div class="nav-section" v-for="section in navSections" :key="section.title">
        <h4 class="section-title">{{ section.title }}</h4>
        <ul class="section-list">
          <li 
            v-for="item in section.items" 
            :key="item.path"
            class="nav-item"
          >
            <RouterLink 
              :to="item.path" 
              class="nav-link"
              :class="{ 
                active: isActiveRoute(item.path),
                disabled: item.disabled 
              }"
            >
              <span class="nav-icon">{{ item.icon }}</span>
              <span class="nav-text" v-show="!isCollapsed">{{ item.title }}</span>
              <span 
                v-if="item.badge && !isCollapsed" 
                class="nav-badge"
                :class="item.badge.type"
              >
                {{ item.badge.text }}
              </span>
            </RouterLink>

            <!-- 子菜单 -->
            <Transition name="submenu">
              <ul 
                v-if="item.children && isActiveParent(item.path) && !isCollapsed"
                class="submenu"
              >
                <li 
                  v-for="child in item.children" 
                  :key="child.path"
                  class="submenu-item"
                >
                  <RouterLink 
                    :to="child.path" 
                    class="submenu-link"
                  >
                    <span class="submenu-icon">{{ child.icon }}</span>
                    <span class="submenu-text">{{ child.title }}</span>
                  </RouterLink>
                </li>
              </ul>
            </Transition>
          </li>
        </ul>
      </div>
    </nav>

    <!-- 侧边栏底部 -->
    <div class="sidebar-footer" v-show="!isCollapsed">
      <div class="footer-info">
        <p class="version-info">
          <span class="version-label">版本:</span>
          <span class="version-number">v1.0.0</span>
        </p>
        <p class="build-info">
          <span class="build-label">构建:</span>
          <span class="build-time">{{ buildTime }}</span>
        </p>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from '@ldesign/router'

/**
 * 应用侧边栏组件
 * 
 * 功能特性：
 * 1. 可折叠的侧边栏
 * 2. 多级导航菜单
 * 3. 活跃状态指示
 * 4. 徽章和状态显示
 */

// 响应式状态
const isCollapsed = ref(false)
const route = useRoute()

// 导航菜单配置
const navSections = ref([
  {
    title: '基础功能',
    items: [
      {
        path: '/basic',
        title: '功能概览',
        icon: '📋',
        children: [
          { path: '/basic/navigation', title: '导航功能', icon: '🧭' },
          { path: '/basic/params/123', title: '路由参数', icon: '🔗' },
          { path: '/basic/query', title: '查询参数', icon: '❓' }
        ]
      }
    ]
  }
])

// 构建时间
const buildTime = computed(() => {
  return new Date().toLocaleDateString('zh-CN')
})

// 方法
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
  localStorage.setItem('sidebar-collapsed', String(isCollapsed.value))
}

const isActiveRoute = (path: string) => {
  if (!route?.path) return false
  return route.path === path || route.path.startsWith(path + '/')
}

const isActiveParent = (path: string) => {
  if (!route?.path) return false
  return route.path.startsWith(path)
}

// 生命周期
onMounted(() => {
  // 恢复侧边栏状态
  const savedState = localStorage.getItem('sidebar-collapsed')
  if (savedState === 'true') {
    isCollapsed.value = true
  }
})
</script>

<style lang="less" scoped>
.app-sidebar {
  width: 280px;
  background-color: #fff;
  border-right: 1px solid var(--ldesign-border-color);
  .flex-column();
  .transition(width);
  overflow: hidden;
  
  &.collapsed {
    width: 64px;
  }
}

// 侧边栏头部
.sidebar-header {
  .flex-between();
  padding: var(--ls-padding-base);
  border-bottom: 1px solid var(--ldesign-border-color);
  
  .sidebar-title {
    font-size: var(--ls-font-size-base);
    font-weight: 600;
    margin: 0;
    color: var(--ldesign-text-color-primary);
  }
  
  .collapse-btn {
    .flex-center();
    width: 32px;
    height: 32px;
    background: none;
    border: none;
    cursor: pointer;
    .border-radius();
    .transition();
    color: var(--ldesign-text-color-secondary);
    
    &:hover {
      background-color: var(--ldesign-bg-color-container-hover);
      color: var(--ldesign-brand-color);
    }
    
    .collapse-icon {
      font-size: var(--ls-font-size-sm);
      font-weight: bold;
    }
  }
}

// 导航菜单
.sidebar-nav {
  flex: 1;
  padding: var(--ls-padding-base);
  overflow-y: auto;
  
  .nav-section {
    margin-bottom: var(--ls-margin-lg);
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .section-title {
    font-size: var(--ls-font-size-xs);
    font-weight: 600;
    color: var(--ldesign-text-color-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0 0 var(--ls-margin-sm) 0;
    padding: 0 var(--ls-padding-xs);
  }
  
  .section-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  
  .nav-item {
    margin-bottom: var(--ls-margin-xs);
    
    .nav-link {
      .flex-between();
      padding: var(--ls-padding-sm) var(--ls-padding-base);
      .border-radius();
      .transition();
      color: var(--ldesign-text-color-primary);
      position: relative;
      
      &:hover {
        background-color: var(--ldesign-bg-color-container-hover);
        color: var(--ldesign-brand-color);
      }
      
      &.active,
      &.router-link-active {
        background-color: var(--ldesign-brand-color-focus);
        color: var(--ldesign-brand-color);
        
        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 20px;
          background-color: var(--ldesign-brand-color);
          border-radius: 0 2px 2px 0;
        }
      }
      
      &.disabled {
        opacity: 0.5;
        cursor: not-allowed;
        
        &:hover {
          background-color: transparent;
          color: var(--ldesign-text-color-primary);
        }
      }
      
      .nav-icon {
        font-size: var(--ls-font-size-base);
        margin-right: var(--ls-margin-sm);
      }
      
      .nav-text {
        flex: 1;
        font-size: var(--ls-font-size-sm);
        font-weight: 500;
      }
      
      .nav-badge {
        font-size: var(--ls-font-size-xs);
        padding: 2px 6px;
        .border-radius(12px);
        font-weight: 600;
        
        &.success {
          background-color: var(--ldesign-success-color);
          color: white;
        }
        
        &.warning {
          background-color: var(--ldesign-warning-color);
          color: white;
        }
        
        &.error {
          background-color: var(--ldesign-error-color);
          color: white;
        }
      }
    }
  }
  
  // 子菜单
  .submenu {
    list-style: none;
    margin: var(--ls-margin-xs) 0 0 0;
    padding: 0;
    
    .submenu-item {
      .submenu-link {
        .flex-center();
        padding: var(--ls-padding-xs) var(--ls-padding-base);
        margin-left: var(--ls-margin-lg);
        .border-radius();
        .transition();
        color: var(--ldesign-text-color-secondary);
        font-size: var(--ls-font-size-xs);
        
        &:hover {
          background-color: var(--ldesign-bg-color-container-hover);
          color: var(--ldesign-brand-color);
        }
        
        &.router-link-active {
          background-color: var(--ldesign-brand-color-focus);
          color: var(--ldesign-brand-color);
        }
        
        .submenu-icon {
          margin-right: var(--ls-margin-xs);
        }
        
        .submenu-text {
          font-weight: 500;
        }
      }
    }
  }
}

// 子菜单动画
.submenu-enter-active,
.submenu-leave-active {
  transition: all 0.3s ease;
}

.submenu-enter-from,
.submenu-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

// 侧边栏底部
.sidebar-footer {
  padding: var(--ls-padding-base);
  border-top: 1px solid var(--ldesign-border-color);
  
  .footer-info {
    font-size: var(--ls-font-size-xs);
    color: var(--ldesign-text-color-secondary);
    
    p {
      margin: 0 0 var(--ls-margin-xs) 0;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
    
    .version-label,
    .build-label {
      font-weight: 600;
    }
    
    .version-number,
    .build-time {
      color: var(--ldesign-brand-color);
    }
  }
}

// 响应式设计
.mobile({
  .app-sidebar {
    position: fixed;
    top: 64px;
    left: 0;
    bottom: 0;
    z-index: 90;
    transform: translateX(-100%);
    .transition(transform);
    
    &.open {
      transform: translateX(0);
    }
  }
});
</style>
