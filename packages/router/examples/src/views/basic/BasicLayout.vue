<template>
  <div class="basic-layout">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <span class="title-icon">📚</span>
          <span class="title-text">基础功能演示</span>
        </h1>
        <p class="page-description">
          探索 @ldesign/router 的基础路由功能，包括导航、参数传递、查询参数等核心特性
        </p>
      </div>
    </div>

    <!-- 功能导航 -->
    <nav class="feature-nav">
      <div class="nav-container">
        <RouterLink 
          v-for="item in navItems" 
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: isActiveNav(item.path) }"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-text">{{ item.title }}</span>
          <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
        </RouterLink>
      </div>
    </nav>

    <!-- 内容区域 -->
    <div class="content-area">
      <RouterView v-slot="{ Component, route }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="route.fullPath" />
        </Transition>
      </RouterView>
    </div>

    <!-- 相关链接 -->
    <aside class="related-links">
      <h3 class="links-title">相关功能</h3>
      <ul class="links-list">
        <li>
          <RouterLink to="/" class="related-link">
            <span class="link-icon">🏠</span>
            <span class="link-text">返回首页</span>
          </RouterLink>
        </li>
      </ul>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from '@ldesign/router'

/**
 * 基础功能布局组件
 * 
 * 功能特性：
 * 1. 统一的页面布局
 * 2. 功能导航菜单
 * 3. 页面过渡动画
 * 4. 相关链接推荐
 */

const route = useRoute()

// 导航项目配置
const navItems = [
  {
    path: '/basic',
    title: '功能概览',
    icon: '📋',
    exact: true
  },
  {
    path: '/basic/navigation',
    title: '导航功能',
    icon: '🧭'
  },
  {
    path: '/basic/params/demo',
    title: '路由参数',
    icon: '🔗',
    badge: 'NEW'
  },
  {
    path: '/basic/query',
    title: '查询参数',
    icon: '❓'
  }
]

// 计算当前激活的导航项
const isActiveNav = (path: string) => {
  if (path === '/basic') {
    return route.path === '/basic'
  }
  return route.path.startsWith(path)
}
</script>

<style lang="less" scoped>
.basic-layout {
  min-height: 100vh;
  display: grid;
  grid-template-areas: 
    "header header"
    "nav nav"
    "content sidebar"
    "content sidebar";
  grid-template-columns: 1fr 300px;
  grid-template-rows: auto auto 1fr auto;
  gap: var(--ls-spacing-base);
}

// 页面头部
.page-header {
  grid-area: header;
  background: linear-gradient(135deg, var(--ldesign-brand-color-1) 0%, var(--ldesign-brand-color-2) 100%);
  padding: var(--ls-padding-xl) 0;
  
  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--ls-padding-base);
    text-align: center;
    
    .page-title {
      .flex-center();
      justify-content: center;
      gap: var(--ls-spacing-base);
      font-size: var(--ls-font-size-h2);
      font-weight: 600;
      margin-bottom: var(--ls-margin-base);
      color: var(--ldesign-text-color-primary);
      
      .title-icon {
        font-size: var(--ls-font-size-h1);
      }
    }
    
    .page-description {
      font-size: var(--ls-font-size-lg);
      color: var(--ldesign-text-color-secondary);
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.6;
    }
  }
}

// 功能导航
.feature-nav {
  grid-area: nav;
  background-color: #fff;
  border-bottom: 1px solid var(--ldesign-border-color);
  .box-shadow(var(--ls-shadow-sm));
  
  .nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--ls-padding-base);
    .flex-center();
    gap: var(--ls-spacing-base);
    overflow-x: auto;
    
    &::-webkit-scrollbar {
      display: none;
    }
  }
  
  .nav-item {
    .flex-center();
    gap: var(--ls-spacing-sm);
    padding: var(--ls-padding-base) var(--ls-padding-lg);
    .border-radius();
    .transition();
    color: var(--ldesign-text-color-secondary);
    white-space: nowrap;
    position: relative;
    
    &:hover {
      background-color: var(--ldesign-bg-color-container-hover);
      color: var(--ldesign-brand-color);
    }
    
    &.active,
    &.router-link-active {
      background-color: var(--ldesign-brand-color-focus);
      color: var(--ldesign-brand-color);
      
      &::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 50%;
        transform: translateX(-50%);
        width: 80%;
        height: 2px;
        background-color: var(--ldesign-brand-color);
      }
    }
    
    .nav-icon {
      font-size: var(--ls-font-size-base);
    }
    
    .nav-text {
      font-size: var(--ls-font-size-sm);
      font-weight: 500;
    }
    
    .nav-badge {
      font-size: var(--ls-font-size-xs);
      padding: 2px 6px;
      background-color: var(--ldesign-success-color);
      color: white;
      .border-radius(10px);
      font-weight: 600;
    }
  }
}

// 内容区域
.content-area {
  grid-area: content;
  padding: var(--ls-padding-base);
  min-height: 500px;
}

// 相关链接
.related-links {
  grid-area: sidebar;
  padding: var(--ls-padding-base);
  
  .links-title {
    font-size: var(--ls-font-size-base);
    font-weight: 600;
    margin-bottom: var(--ls-margin-base);
    color: var(--ldesign-text-color-primary);
  }
  
  .links-list {
    list-style: none;
    margin: 0;
    padding: 0;
    
    li {
      margin-bottom: var(--ls-margin-sm);
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
  
  .related-link {
    .flex-center();
    gap: var(--ls-spacing-sm);
    padding: var(--ls-padding-sm) var(--ls-padding-base);
    .border-radius();
    .transition();
    color: var(--ldesign-text-color-secondary);
    border: 1px solid var(--ldesign-border-color);
    
    &:hover {
      background-color: var(--ldesign-bg-color-container-hover);
      border-color: var(--ldesign-brand-color);
      color: var(--ldesign-brand-color);
    }
    
    .link-icon {
      font-size: var(--ls-font-size-base);
    }
    
    .link-text {
      font-size: var(--ls-font-size-sm);
      font-weight: 500;
    }
  }
}

// 页面过渡动画
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

// 响应式设计
.mobile({
  .basic-layout {
    grid-template-areas: 
      "header"
      "nav"
      "content"
      "sidebar";
    grid-template-columns: 1fr;
    grid-template-rows: auto auto 1fr auto;
  }
  
  .feature-nav {
    .nav-container {
      justify-content: flex-start;
      padding: var(--ls-padding-sm) var(--ls-padding-base);
    }
    
    .nav-item {
      padding: var(--ls-padding-sm) var(--ls-padding-base);
      
      .nav-text {
        display: none;
      }
    }
  }
  
  .content-area {
    padding: var(--ls-padding-sm);
  }
  
  .related-links {
    padding: var(--ls-padding-sm);
    
    .links-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: var(--ls-spacing-sm);
    }
  }
});

.tablet({
  .basic-layout {
    grid-template-columns: 1fr 250px;
  }
});
</style>
