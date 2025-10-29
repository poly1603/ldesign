<template>
  <n-layout style="height: 100vh" has-sider>
    <!-- 侧边栏 -->
    <n-layout-sider
      bordered
      :collapsed="collapsed"
      :collapsed-width="64"
      :width="240"
      show-trigger
      collapse-mode="width"
      :native-scrollbar="false"
    >
      <div class="logo">
        <span v-if="!collapsed" class="logo-text">LDesign</span>
        <Palette v-else :size="24" />
      </div>
      <n-menu
        :value="currentRoute"
        :collapsed="collapsed"
        :collapsed-width="64"
        :collapsed-icon-size="22"
        :options="menuOptions"
        @update:value="handleMenuSelect"
      />
    </n-layout-sider>

    <!-- 主内容区 -->
    <n-layout>
      <!-- 顶部栏 -->
      <n-layout-header bordered class="header">
        <div class="header-left">
          <h2 class="page-title">{{ currentPageTitle }}</h2>
        </div>
        <div class="header-right">
          <n-space>
            <n-button text @click="themeStore.toggle" class="theme-button">
              <Sun v-if="themeStore.isDark" :size="20" />
              <Moon v-else :size="20" />
            </n-button>
            <n-badge :value="notifications" :max="99">
              <n-button text>
                <Bell :size="20" />
              </n-button>
            </n-badge>
          </n-space>
        </div>
      </n-layout-header>

      <!-- 页面内容 -->
      <n-layout-content class="content">
        <slot />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script setup lang="ts">
import { computed, h, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { MenuOption } from 'naive-ui'
import { NLayout, NLayoutSider, NLayoutHeader, NLayoutContent, NMenu, NButton, NSpace, NBadge } from 'naive-ui'
import { Home, FolderOpen, Settings, Palette, Sun, Moon, Bell, ListTodo, Activity, PackageSearch } from 'lucide-vue-next'
import { useThemeStore } from '../store/theme'

const router = useRouter()
const route = useRoute()
const themeStore = useThemeStore()

const collapsed = ref(false)
const notifications = ref(0)

const currentRoute = computed(() => route.path)

const menuOptions: MenuOption[] = [
  { label: '仪表板', key: '/', icon: renderIcon(Home) },
  { label: '项目管理', key: '/projects', icon: renderIcon(FolderOpen) },
  { label: '任务中心', key: '/tasks', icon: renderIcon(ListTodo) },
  { label: '性能监控', key: '/performance', icon: renderIcon(Activity) },
  { label: '依赖管理', key: '/dependencies', icon: renderIcon(PackageSearch) },
  { label: '设置', key: '/settings', icon: renderIcon(Settings) },
]

const pageTitles: Record<string, string> = {
  '/': '仪表板',
  '/projects': '项目管理',
  '/tasks': '任务中心',
  '/performance': '性能监控',
  '/dependencies': '依赖管理',
  '/settings': '设置',
}

const currentPageTitle = computed(() => {
  // 如果是项目详情页，显示项目名称
  if (route.path.startsWith('/projects/')) {
    return '项目详情'
  }
  return pageTitles[currentRoute.value] || '页面'
})

function renderIcon(icon: any) {
  return () => h(icon, { size: 18 })
}

function handleMenuSelect(key: string) {
  router.push(key)
}
</script>

<style scoped>
.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--n-border-color);
  transition: all 0.3s;
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-icon {
  font-size: 24px;
}

.header {
  height: 64px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--n-color);
}

.header-left {
  display: flex;
  align-items: center;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--n-text-color);
}

.header-right {
  display: flex;
  align-items: center;
}

.theme-button {
  font-size: 20px;
  cursor: pointer;
  transition: transform 0.3s;
}

.theme-button:hover {
  transform: scale(1.1);
}

.content {
  padding: 24px;
  overflow-y: auto;
  background: var(--n-color);
}

:deep(.n-menu .n-menu-item-content) {
  transition: all 0.3s;
}

:deep(.n-menu .n-menu-item-content:hover) {
  background: rgba(100, 126, 234, 0.1);
}

:deep(.n-menu .n-menu-item-content.n-menu-item-content--selected) {
  background: linear-gradient(90deg, rgba(100, 126, 234, 0.2), transparent);
  border-right: 3px solid #667eea;
}
</style>
