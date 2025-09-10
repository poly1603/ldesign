<template>
  <nav class="app-breadcrumb" v-if="breadcrumbItems.length > 0">
    <ol class="breadcrumb-list">
      <li 
        v-for="(item, index) in breadcrumbItems" 
        :key="item.path"
        class="breadcrumb-item"
        :class="{ active: index === breadcrumbItems.length - 1 }"
      >
        <!-- 面包屑链接 -->
        <RouterLink 
          v-if="index < breadcrumbItems.length - 1"
          :to="item.path"
          class="breadcrumb-link"
        >
          <span v-if="item.icon" class="breadcrumb-icon">{{ item.icon }}</span>
          <span class="breadcrumb-text">{{ item.title }}</span>
        </RouterLink>
        
        <!-- 当前页面（不可点击） -->
        <span v-else class="breadcrumb-current">
          <span v-if="item.icon" class="breadcrumb-icon">{{ item.icon }}</span>
          <span class="breadcrumb-text">{{ item.title }}</span>
        </span>
        
        <!-- 分隔符 -->
        <span 
          v-if="index < breadcrumbItems.length - 1" 
          class="breadcrumb-separator"
        >
          /
        </span>
      </li>
    </ol>
    
    <!-- 页面操作按钮 -->
    <div class="breadcrumb-actions" v-if="showActions">
      <button 
        class="action-btn"
        @click="goBack"
        :disabled="!canGoBack"
        title="返回上一页"
      >
        <span class="action-icon">←</span>
        <span class="action-text">返回</span>
      </button>
      
      <button 
        class="action-btn"
        @click="refresh"
        title="刷新当前页面"
      >
        <span class="action-icon">🔄</span>
        <span class="action-text">刷新</span>
      </button>
      
      <button 
        class="action-btn"
        @click="copyUrl"
        title="复制当前页面链接"
      >
        <span class="action-icon">📋</span>
        <span class="action-text">复制链接</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from '@ldesign/router'

/**
 * 面包屑导航组件
 * 
 * 功能特性：
 * 1. 自动生成面包屑路径
 * 2. 支持图标显示
 * 3. 页面操作按钮
 * 4. 响应式设计
 */

// 路由相关
const route = useRoute()
const router = useRouter()

// 响应式状态
const showActions = ref(true)

// 路由标题映射
const routeTitleMap: Record<string, { title: string; icon?: string }> = {
  '/': { title: '首页', icon: '🏠' },
  '/basic': { title: '基础功能', icon: '📚' },
  '/basic/navigation': { title: '导航功能', icon: '🧭' },
  '/basic/params': { title: '路由参数', icon: '🔗' },
  '/basic/query': { title: '查询参数', icon: '❓' },
  '/advanced': { title: '高级功能', icon: '🚀' },
  '/advanced/guards': { title: '路由守卫', icon: '🛡️' },
  '/advanced/lazy-loading': { title: '懒加载', icon: '⏳' },
  '/advanced/nested': { title: '嵌套路由', icon: '🏗️' },
  '/plugins': { title: '插件功能', icon: '🔌' },
  '/plugins/animation': { title: '动画插件', icon: '🎬' },
  '/plugins/cache': { title: '缓存插件', icon: '💾' },
  '/plugins/performance': { title: '性能监控', icon: '📊' },
  '/plugins/preload': { title: '预加载', icon: '🚀' },
  '/device': { title: '设备适配', icon: '📱' },
  '/device/detection': { title: '设备检测', icon: '🔍' },
  '/device/components': { title: '设备组件', icon: '🧩' },
  '/device/restricted': { title: '访问限制', icon: '🚫' },
  '/engine': { title: 'Engine 集成', icon: '⚙️' },
  '/engine/state': { title: '状态管理', icon: '🗃️' },
  '/engine/events': { title: '事件系统', icon: '📡' },
  '/error': { title: '错误处理', icon: '⚠️' },
  '/error/404': { title: '404 错误', icon: '❌' },
  '/error/500': { title: '500 错误', icon: '💥' },
  '/error/boundary': { title: '错误边界', icon: '🛡️' }
}

// 计算面包屑项目
const breadcrumbItems = computed(() => {
  const matched = route?.matched || []
  const items = []

  for (const record of matched) {
    // 跳过没有名称的路由
    if (!record.name) continue
    
    // 获取路由路径
    let path = record.path
    
    // 处理动态路由参数
    if (record.path.includes(':')) {
      // 替换动态参数
      path = record.path
      for (const [key, value] of Object.entries(route.params)) {
        path = path.replace(`:${key}`, String(value))
      }
    }
    
    // 获取标题和图标
    const routeInfo = routeTitleMap[record.path] || routeTitleMap[path]
    const title = route.meta?.title || routeInfo?.title || record.name as string
    const icon = routeInfo?.icon
    
    items.push({
      name: record.name,
      path,
      title,
      icon
    })
  }
  
  return items
})

// 计算是否可以返回
const canGoBack = computed(() => {
  return window.history.length > 1
})

// 方法
const goBack = () => {
  if (canGoBack.value) {
    router.go(-1)
  }
}

const refresh = () => {
  window.location.reload()
}

const copyUrl = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href)
    // 这里可以显示成功提示
    console.log('链接已复制到剪贴板')
  } catch (error) {
    console.error('复制链接失败:', error)
    // 降级方案
    const textArea = document.createElement('textarea')
    textArea.value = window.location.href
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  }
}
</script>

<style lang="less" scoped>
.app-breadcrumb {
  .flex-between();
  padding: var(--ls-padding-base);
  background-color: var(--ldesign-bg-color-container);
  border-bottom: 1px solid var(--ldesign-border-color);
  min-height: 56px;
}

// 面包屑列表
.breadcrumb-list {
  .flex-center();
  list-style: none;
  margin: 0;
  padding: 0;
  gap: var(--ls-spacing-xs);
}

.breadcrumb-item {
  .flex-center();
  gap: var(--ls-spacing-xs);
  
  &.active {
    .breadcrumb-current {
      color: var(--ldesign-brand-color);
      font-weight: 600;
    }
  }
}

.breadcrumb-link {
  .flex-center();
  gap: var(--ls-spacing-xs);
  padding: var(--ls-padding-xs) var(--ls-padding-sm);
  .border-radius();
  .transition();
  color: var(--ldesign-text-color-secondary);
  font-size: var(--ls-font-size-sm);
  
  &:hover {
    background-color: var(--ldesign-bg-color-container-hover);
    color: var(--ldesign-brand-color);
  }
}

.breadcrumb-current {
  .flex-center();
  gap: var(--ls-spacing-xs);
  padding: var(--ls-padding-xs) var(--ls-padding-sm);
  color: var(--ldesign-text-color-primary);
  font-size: var(--ls-font-size-sm);
}

.breadcrumb-icon {
  font-size: var(--ls-font-size-sm);
}

.breadcrumb-text {
  font-weight: 500;
}

.breadcrumb-separator {
  color: var(--ldesign-text-color-placeholder);
  font-size: var(--ls-font-size-sm);
  margin: 0 var(--ls-margin-xs);
}

// 操作按钮
.breadcrumb-actions {
  .flex-center();
  gap: var(--ls-spacing-sm);
}

.action-btn {
  .flex-center();
  gap: var(--ls-spacing-xs);
  padding: var(--ls-padding-xs) var(--ls-padding-sm);
  background: none;
  border: 1px solid var(--ldesign-border-color);
  .border-radius();
  .transition();
  color: var(--ldesign-text-color-secondary);
  font-size: var(--ls-font-size-xs);
  cursor: pointer;
  
  &:hover:not(:disabled) {
    background-color: var(--ldesign-bg-color-container-hover);
    border-color: var(--ldesign-brand-color);
    color: var(--ldesign-brand-color);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .action-icon {
    font-size: var(--ls-font-size-sm);
  }
  
  .action-text {
    font-weight: 500;
  }
}

// 响应式设计
.mobile({
  .app-breadcrumb {
    padding: var(--ls-padding-sm);
    min-height: 48px;
  }
  
  .breadcrumb-actions {
    .action-text {
      display: none;
    }
    
    .action-btn {
      padding: var(--ls-padding-xs);
      min-width: 32px;
    }
  }
  
  .breadcrumb-list {
    flex: 1;
    overflow-x: auto;
    
    &::-webkit-scrollbar {
      display: none;
    }
  }
});

.tablet({
  .breadcrumb-actions {
    gap: var(--ls-spacing-xs);
    
    .action-btn {
      padding: var(--ls-padding-xs);
    }
  }
});
</style>
