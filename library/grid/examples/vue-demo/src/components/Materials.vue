<template>
  <div class="materials-panel">
    <h3>📦 物料组件库 - 拖动 Vue 组件到网格</h3>
    <div class="materials-list">
      <div
        v-for="material in materials"
        :key="material.type"
        class="material-item"
        :data-type="material.type"
        :gs-w="material.width"
        :gs-h="material.height"
        draggable="true"
      >
        <span class="material-icon">{{ material.icon }}</span>
        <span class="material-name">{{ material.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Material {
  type: string
  name: string
  icon: string
  width: number
  height: number
  component: string
}

const materials = ref<Material[]>([
  { type: 'chart', name: '图表组件', icon: '📊', width: 6, height: 4, component: 'ChartWidget' },
  { type: 'table', name: '表格组件', icon: '📋', width: 8, height: 4, component: 'TableWidget' },
  { type: 'form', name: '表单组件', icon: '📝', width: 6, height: 5, component: 'FormWidget' },
  { type: 'card', name: '卡片组件', icon: '🎴', width: 4, height: 3, component: 'CardWidget' },
  { type: 'stats', name: '统计组件', icon: '📈', width: 3, height: 2, component: 'StatsWidget' },
  { type: 'calendar', name: '日历组件', icon: '📅', width: 6, height: 5, component: 'CalendarWidget' }
])
</script>

<style scoped>
.materials-panel {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.materials-panel h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.materials-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.material-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  cursor: move;
  user-select: none;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.material-item:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.material-item:active {
  transform: scale(0.98);
}

.material-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.material-name {
  font-size: 14px;
  font-weight: 500;
  text-align: center;
}

/* 响应式 */
@media (max-width: 768px) {
  .materials-list {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 10px;
  }
  
  .material-item {
    padding: 16px;
  }
  
  .material-icon {
    font-size: 24px;
  }
  
  .material-name {
    font-size: 12px;
  }
}
</style>
