<template>
  <div class="icon-gallery">
    <div class="toolbar">
      <input v-model="query" class="search" placeholder="搜索图标名称 (Lucide)" />
      <span class="count">共 {{ names.value.length }} 个，已显示 {{ filtered.length }} 个</span>
    </div>
    <div class="grid">
      <div v-for="n in filtered" :key="n" class="item" @click="copy(n)" :title="n + '（点击复制名称）'">
        <ldesign-icon :name="n" size="large" />
        <code>{{ n }}</code>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// Lucide 常用图标列表（你可以根据需要添加更多）
const names = ref<string[]>([
  // 常用操作
  'search', 'plus', 'minus', 'x', 'check', 'trash', 'trash-2', 'edit', 'edit-2', 'edit-3',
  'copy', 'clipboard', 'download', 'upload', 'save', 'folder', 'file', 'file-text',
  'filter', 'sort-asc', 'sort-desc', 'refresh-cw', 'refresh-ccw', 'undo', 'redo',
  
  // 导航
  'home', 'menu', 'more-horizontal', 'more-vertical', 'chevron-left', 'chevron-right',
  'chevron-up', 'chevron-down', 'arrow-left', 'arrow-right', 'arrow-up', 'arrow-down',
  'corner-up-left', 'corner-up-right', 'corner-down-left', 'corner-down-right',
  
  // 用户界面
  'user', 'users', 'user-plus', 'user-minus', 'user-check', 'user-x',
  'bell', 'bell-off', 'message-circle', 'message-square', 'mail', 'send',
  'eye', 'eye-off', 'lock', 'unlock', 'key', 'shield', 'shield-check',
  
  // 媒体
  'play', 'pause', 'stop', 'skip-forward', 'skip-back', 'fast-forward', 'rewind',
  'volume', 'volume-1', 'volume-2', 'volume-x', 'mic', 'mic-off',
  'camera', 'camera-off', 'image', 'film', 'video', 'video-off',
  
  // 状态
  'loader', 'loader-2', 'alert-circle', 'alert-triangle', 'alert-octagon',
  'info', 'help-circle', 'check-circle', 'x-circle', 'check-square', 'x-square',
  
  // 其他常用
  'heart', 'star', 'bookmark', 'flag', 'tag', 'tags', 'hash',
  'link', 'link-2', 'external-link', 'share', 'share-2',
  'calendar', 'clock', 'alarm-clock', 'timer', 'stopwatch',
  'settings', 'sliders', 'tool', 'wrench', 'cog',
  'sun', 'moon', 'cloud', 'cloud-rain', 'cloud-snow', 'zap',
  'map', 'map-pin', 'navigation', 'compass', 'globe',
  'phone', 'phone-call', 'phone-incoming', 'phone-outgoing', 'phone-off',
  'wifi', 'wifi-off', 'bluetooth', 'cast', 'airplay',
  'battery', 'battery-charging', 'battery-low', 'plug',
  'credit-card', 'dollar-sign', 'percent', 'calculator',
  'bar-chart', 'bar-chart-2', 'line-chart', 'pie-chart', 'activity',
  'trending-up', 'trending-down', 'database', 'server', 'cpu',
  'terminal', 'code', 'code-2', 'git-branch', 'git-commit', 'git-merge', 'git-pull-request',
  'package', 'layers', 'layout', 'sidebar', 'grid', 'columns', 'rows'
])

// 尝试动态获取所有图标
onMounted(async () => {
  try {
    const lucide = await import('lucide')
    const excludedExports = ['createElement', 'icons', 'default']
    const iconExports = Object.keys(lucide).filter(key => !excludedExports.includes(key))
    if (iconExports.length > 0) {
      // 将PascalCase转换为kebab-case
      const allNames = iconExports.map(name => 
        name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
      ).sort()
      names.value = allNames
    }
  } catch (e) {
    console.warn('Failed to load all lucide icons, using preset list')
  }
})

const query = ref('')
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return q ? names.value.filter(n => n.includes(q)) : names.value
})

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    // ignore
  }
}
</script>

<style scoped>
.icon-gallery { display: block; }
.toolbar { display:flex; align-items:center; gap:12px; margin: 8px 0 16px; }
.search { padding: 8px 10px; border:1px solid var(--vp-c-border); border-radius:8px; width: 280px; }
.count { color: var(--vp-c-text-2); font-size: 12px; }
.grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 16px; }
.item { display:flex; flex-direction:column; align-items:center; gap:8px; padding:10px; border:1px solid var(--vp-c-border); border-radius:8px; cursor: pointer; }
.item:hover { background: var(--vp-c-bg-soft); }
.item code { font-size: 12px; }
</style>
