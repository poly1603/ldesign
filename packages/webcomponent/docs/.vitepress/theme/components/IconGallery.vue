<template>
  <div class="icon-gallery">
    <div class="toolbar">
      <input v-model="query" class="search" placeholder="搜索图标名称 (Lucide)" />
      <span class="count">共 {{ names.length }} 个，已显示 {{ filtered.length }} 个</span>
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
import { ref, computed } from 'vue'
import * as lucide from 'lucide'

const names = Object.keys((lucide as any).icons || {}).sort()
const query = ref('')
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return q ? names.filter(n => n.includes(q)) : names
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
