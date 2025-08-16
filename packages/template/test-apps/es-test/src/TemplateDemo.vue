<script setup lang="ts">
import { TemplateRenderer } from '@ldesign/template/vue'
import { ref } from 'vue'

// 事件日志
const eventLog = ref<Array<{ time: string; type: string; data: string }>>([])

function addEvent(type: string, data: any) {
  eventLog.value.unshift({
    time: new Date().toLocaleTimeString(),
    type,
    data: JSON.stringify(data),
  })

  // 限制日志数量
  if (eventLog.value.length > 10) {
    eventLog.value = eventLog.value.slice(0, 10)
  }
}

function onTemplateChange(templateId: string) {
  addEvent('template-change', { templateId })
}

function onDeviceChange(deviceType: string) {
  addEvent('device-change', { deviceType })
}
</script>

<template>
  <div id="app">
    <header class="demo-header">
      <h1>🎨 Template Renderer 演示</h1>
      <p>展示模板渲染组件的样式和功能</p>
    </header>

    <main class="demo-main">
      <!-- 基础 TemplateRenderer 演示 -->
      <section class="demo-section">
        <h2>基础模板渲染器</h2>
        <div class="demo-container">
          <TemplateRenderer
            category="login"
            template="default"
            :show-selector="true"
            selector-mode="modal"
            :show-device-info="true"
            @template-change="onTemplateChange"
            @device-change="onDeviceChange"
          />
        </div>
      </section>

      <!-- 不同模式的选择器演示 -->
      <section class="demo-section">
        <h2>不同选择器模式</h2>
        <div class="demo-grid">
          <div class="demo-item">
            <h3>下拉模式</h3>
            <TemplateRenderer
              category="login"
              template="default"
              :show-selector="true"
              selector-mode="dropdown"
              selector-size="small"
            />
          </div>

          <div class="demo-item">
            <h3>按钮模式</h3>
            <TemplateRenderer
              category="login"
              template="classic"
              :show-selector="true"
              selector-mode="buttons"
              selector-size="medium"
            />
          </div>

          <div class="demo-item">
            <h3>网格模式</h3>
            <TemplateRenderer
              category="login"
              template="modern"
              :show-selector="true"
              selector-mode="grid"
              selector-size="large"
            />
          </div>
        </div>
      </section>

      <!-- 事件日志 -->
      <section class="demo-section">
        <h2>事件日志</h2>
        <div class="event-log">
          <div v-for="(event, index) in eventLog" :key="index" class="event-item">
            <span class="event-time">{{ event.time }}</span>
            <span class="event-type">{{ event.type }}</span>
            <span class="event-data">{{ event.data }}</span>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.demo-header {
  text-align: center;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin-bottom: 2rem;
}

.demo-header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
  font-weight: 700;
}

.demo-header p {
  margin: 0;
  font-size: 1.2rem;
  opacity: 0.9;
}

.demo-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.demo-section {
  margin-bottom: 3rem;
}

.demo-section h2 {
  font-size: 1.8rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

.demo-container {
  background: #f8fafc;
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid #e5e7eb;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.demo-item {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.demo-item h3 {
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #374151;
}

.event-log {
  background: #1f2937;
  border-radius: 12px;
  padding: 1.5rem;
  max-height: 300px;
  overflow-y: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.event-item {
  display: flex;
  gap: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #374151;
  font-size: 0.9rem;
}

.event-item:last-child {
  border-bottom: none;
}

.event-time {
  color: #9ca3af;
  min-width: 80px;
}

.event-type {
  color: #60a5fa;
  min-width: 120px;
  font-weight: 500;
}

.event-data {
  color: #34d399;
  flex: 1;
  word-break: break-all;
}

@media (max-width: 768px) {
  .demo-header {
    padding: 1.5rem;
  }

  .demo-header h1 {
    font-size: 2rem;
  }

  .demo-main {
    padding: 0 1rem;
  }

  .demo-grid {
    grid-template-columns: 1fr;
  }

  .demo-container {
    padding: 1.5rem;
  }
}
</style>
