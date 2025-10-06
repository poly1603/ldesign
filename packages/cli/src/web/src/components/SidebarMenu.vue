<template>
  <div class="sidebar-menu">
    <div class="menu-group">
      <div
        v-for="item in menuItems"
        :key="item.id"
        class="menu-item"
        :class="{ active: isActive(item.path) }"
        @click="navigateTo(item.path)"
      >
        <div class="menu-item-content">
          <component :is="item.icon" :size="20" class="menu-icon" />
          <span v-show="!collapsed" class="menu-title">{{ item.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { LayoutDashboard, FolderKanban, Circle, Package, Settings, Bot } from 'lucide-vue-next'
import { useApi } from '../composables/useApi'

// Props
interface Props {
  collapsed: boolean
}

const props = defineProps<Props>()

// 路由
const router = useRouter()
const route = useRoute()

// API
const api = useApi()

// 菜单数据
const menuItems = ref<any[]>([])

// 检查是否为当前路由
const isActive = (path: string) => {
  return route.path === path
}

// 导航到指定路径
const navigateTo = (path: string) => {
  router.push(path)
}

// 加载菜单数据
const loadMenuData = async () => {
  // 直接使用默认菜单，不从 API 加载
  menuItems.value = [
    { id: 'dashboard', name: '仪表盘', icon: LayoutDashboard, path: '/' },
    { id: 'projects', name: '项目管理', icon: FolderKanban, path: '/projects' },
    { id: 'node', name: 'Node 管理', icon: Circle, path: '/node' },
    { id: 'npm-sources', name: 'NPM 源管理', icon: Package, path: '/npm-sources' },
    { id: 'packages', name: '私有包管理', icon: Package, path: '/packages' },
    { id: 'ai', name: 'AI 助手', icon: Bot, path: '/ai' },
    { id: 'settings', name: '设置', icon: Settings, path: '/settings' }
  ]
}

// 组件挂载时加载菜单
onMounted(() => {
  loadMenuData()
})
</script>

<style lang="less" scoped>
.sidebar-menu {
  padding: 0;
}

.menu-group {
  margin-bottom: 4px;
}

.menu-item {
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: var(--ls-border-radius-base);
  margin: 0 12px;

  &:hover {
    background-color: var(--ldesign-bg-color-component-hover);
  }

  &.active {
    background-color: var(--ldesign-brand-color-1);
    color: var(--ldesign-brand-color);
  }
}

.menu-item-content {
  display: flex;
  align-items: center;
  padding: 12px;
  gap: 12px;
}

.menu-icon {
  flex-shrink: 0;
  color: currentColor;
}

.menu-title {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
}

.expand-icon {
  font-size: 10px;
  transition: transform 0.2s ease;
  
  &.rotated {
    transform: rotate(180deg);
  }
}

.submenu {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
  margin-left: 12px;
  margin-right: 12px;
  border-left: 2px solid var(--ldesign-border-color);

  &.expanded {
    max-height: 200px;
  }
}

.submenu-item {
  padding: 8px 12px 8px 32px;
  cursor: pointer;
  font-size: 13px;
  color: var(--ldesign-text-color-secondary);
  border-radius: var(--ls-border-radius-base);
  margin: 2px 0;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--ldesign-bg-color-component-hover);
    color: var(--ldesign-text-color-primary);
  }

  &.active {
    background-color: var(--ldesign-brand-color-1);
    color: var(--ldesign-brand-color);
    font-weight: 500;
  }
}

.submenu-title {
  display: block;
}
</style>
