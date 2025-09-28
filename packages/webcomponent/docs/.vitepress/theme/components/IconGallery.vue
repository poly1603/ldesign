<template>
  <div class="icon-gallery">
    <div class="gallery-header">
      <input 
        v-model="searchQuery"
        class="search-input"
        type="text"
        placeholder="搜索图标名称..."
      />
      <div class="gallery-info">
        共 {{ allLucideIcons.length }} 个图标，当前显示 {{ filteredIcons.length }} 个
      </div>
    </div>
    
    <div class="icons-grid">
      <div 
        v-for="icon in filteredIcons" 
        :key="icon"
        class="icon-item"
        @click="copyIconName(icon)"
        :title="`点击复制: ${icon}`"
      >
        <div class="icon-wrapper">
          <ldesign-icon :name="icon" size="24"></ldesign-icon>
        </div>
        <div class="icon-name">{{ icon }}</div>
      </div>
    </div>
    
    <div v-if="copiedIcon" class="copy-toast">
      已复制: {{ copiedIcon }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { allLucideIcons } from '../../../../src/components/icon/all-lucide-icons.ts'

const searchQuery = ref('')
const copiedIcon = ref('')

const filteredIcons = computed(() => {
  if (!searchQuery.value) {
    return allLucideIcons
  }
  const query = searchQuery.value.toLowerCase()
  return allLucideIcons.filter(icon => 
    icon.toLowerCase().includes(query)
  )
})

const copyIconName = (iconName) => {
  navigator.clipboard.writeText(iconName).then(() => {
    copiedIcon.value = iconName
    setTimeout(() => {
      copiedIcon.value = ''
    }, 2000)
  }).catch(() => {
    // 如果剪贴板API不可用，使用备用方法
    const textarea = document.createElement('textarea')
    textarea.value = iconName
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    
    copiedIcon.value = iconName
    setTimeout(() => {
      copiedIcon.value = ''
    }, 2000)
  })
}

</script>

<style scoped>
.icon-gallery {
  margin: 2rem 0;
}

.gallery-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.search-input {
  flex: 1;
  max-width: 400px;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--vp-c-brand);
  background: var(--vp-c-bg);
}

.gallery-info {
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.icons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  padding: 1rem;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  max-height: 600px;
  overflow-y: auto;
}

.icons-grid::-webkit-scrollbar {
  width: 8px;
}

.icons-grid::-webkit-scrollbar-track {
  background: var(--vp-c-bg-soft);
  border-radius: 4px;
}

.icons-grid::-webkit-scrollbar-thumb {
  background: var(--vp-c-divider);
  border-radius: 4px;
}

.icons-grid::-webkit-scrollbar-thumb:hover {
  background: var(--vp-c-text-3);
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: var(--vp-c-bg);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  position: relative;
}

.icon-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: var(--vp-c-brand);
}

.icon-item:active {
  transform: scale(0.98);
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin-bottom: 0.5rem;
  color: var(--vp-c-text-1);
}

.icon-item:hover .icon-wrapper {
  color: var(--vp-c-brand);
}

.icon-name {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  text-align: center;
  word-break: break-all;
  line-height: 1.2;
  max-width: 100%;
  user-select: none;
}

.copy-toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 0.75rem 1.5rem;
  background: var(--vp-c-brand);
  color: white;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease;
  z-index: 100;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 响应式布局 */
@media (max-width: 768px) {
  .icons-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 0.5rem;
    padding: 0.5rem;
  }
  
  .icon-item {
    padding: 0.5rem;
  }
  
  .icon-wrapper {
    width: 36px;
    height: 36px;
  }
  
  .icon-name {
    font-size: 0.65rem;
  }
  
  .copy-toast {
    bottom: 1rem;
    right: 1rem;
    left: 1rem;
    text-align: center;
  }
}
</style>
