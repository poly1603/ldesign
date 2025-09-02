<!--
  主题演示页面
  展示主题选择和切换功能
-->

<template>
  <div class="theme-demo-page">
    <!-- 页面头部 -->
    <header class="theme-demo-header">
      <h1 class="theme-demo-title">🎨 主题管理演示</h1>
      <p class="theme-demo-subtitle">
        体验强大的主题选择和切换功能，支持多种预设主题和亮色/暗色模式
      </p>
    </header>

    <!-- 主题控制区域 -->
    <section class="theme-controls">
      <div class="control-group">
        <h2 class="control-title">主题选择器 (Select 形式)</h2>
        <p class="control-description">
          下拉选择形式的主题切换，适合集成到导航栏或设置面板中
        </p>
        <div class="control-demo">
          <LColorThemeSelector size="medium" :show-mode-toggle="true" :show-preview="true" placeholder="选择主题"
            @theme-change="onThemeChange" @mode-change="onModeChange" />
        </div>
      </div>

      <div class="control-group">
        <h2 class="control-title">主题对话框 (弹窗形式)</h2>
        <p class="control-description">
          弹窗形式的主题选择，提供更丰富的主题预览和选择体验
        </p>
        <div class="control-demo">
          <LColorThemeDialog title="选择您喜欢的主题" button-text="主题设置" :columns-per-row="3" theme-item-size="medium"
            :show-mode-toggle="true" :show-preview="true" @theme-change="onThemeChange" @mode-change="onModeChange"
            @open="onDialogOpen" @close="onDialogClose" />
        </div>
      </div>
    </section>

    <!-- 主题效果展示区域 -->
    <section class="theme-showcase">
      <h2 class="showcase-title">主题效果展示</h2>

      <!-- 当前主题信息 -->
      <div class="current-theme-info">
        <div class="theme-info-card">
          <h3>当前主题</h3>
          <div class="theme-details">
            <span class="theme-name">{{ currentTheme }}</span>
            <span class="theme-mode">{{ currentMode === 'light' ? '亮色模式' : '暗色模式' }}</span>
          </div>
        </div>
      </div>

      <!-- 颜色展示 -->
      <div class="color-showcase">
        <h3>主题颜色</h3>
        <div class="color-grid">
          <div class="color-item" v-for="(color, name) in currentColors" :key="name">
            <div class="color-swatch" :style="{ backgroundColor: color }" :title="`${name}: ${color}`"></div>
            <div class="color-info">
              <span class="color-name">{{ getColorDisplayName(name) }}</span>
              <span class="color-value">{{ color }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 组件效果展示 */
      <div class="component-showcase">
        <h3>组件效果展示</h3>
        <div class="component-grid">
          <!-- 按钮组 -->
      <div class="component-group">
        <h4>按钮</h4>
        <div class="button-group">
          <button class="btn btn-primary">主要按钮</button>
          <button class="btn btn-secondary">次要按钮</button>
          <button class="btn btn-success">成功按钮</button>
          <button class="btn btn-warning">警告按钮</button>
          <button class="btn btn-danger">危险按钮</button>
        </div>
      </div>

      <!-- 卡片组 -->
      <div class="component-group">
        <h4>卡片</h4>
        <div class="card-group">
          <div class="card">
            <div class="card-header">卡片标题</div>
            <div class="card-body">
              这是一个示例卡片，展示当前主题的背景色、文本色和边框色效果。
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-sm">操作</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 表单组 -->
      <div class="component-group">
        <h4>表单</h4>
        <div class="form-group">
          <label class="form-label">输入框</label>
          <input type="text" class="form-input" placeholder="请输入内容" />

          <label class="form-label">选择框</label>
          <select class="form-select">
            <option>选项 1</option>
            <option>选项 2</option>
            <option>选项 3</option>
          </select>

          <label class="form-label">文本域</label>
          <textarea class="form-textarea" placeholder="请输入多行文本"></textarea>
        </div>
      </div>
    </section>

    <!-- 事件日志 -->
    <section class="event-log" v-if="eventLogs.length > 0">
      <h3>事件日志</h3>
      <div class="log-container">
        <div v-for="(log, index) in eventLogs" :key="index" class="log-item">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue'
// import type { ThemeManagerInstance } from '@ldesign/color'

// 获取主题管理器
const themeManager = inject<any>('themeManager')

// 响应式数据
const currentTheme = ref('blue')
const currentMode = ref<'light' | 'dark'>('light')
const eventLogs = ref<Array<{ time: string, message: string }>>([])

// 计算属性
const currentColors = computed(() => {
  if (!themeManager) return {}

  const theme = themeManager.getThemeNames().find(name => name === currentTheme.value)
  if (!theme) return {}

  // 这里应该从主题管理器获取当前主题的颜色
  // 暂时返回示例颜色
  return {
    primary: 'var(--color-primary)',
    secondary: 'var(--color-secondary)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    danger: 'var(--color-danger)',
    background: 'var(--color-background)',
    surface: 'var(--color-surface)',
    text: 'var(--color-text)',
    border: 'var(--color-border)'
  }
})

// 方法
const getColorDisplayName = (name: string): string => {
  const nameMap: Record<string, string> = {
    primary: '主色',
    secondary: '辅助色',
    success: '成功色',
    warning: '警告色',
    danger: '危险色',
    background: '背景色',
    surface: '表面色',
    text: '文本色',
    border: '边框色'
  }
  return nameMap[name] || name
}

const addEventLog = (message: string) => {
  const now = new Date()
  const time = now.toLocaleTimeString()
  eventLogs.value.unshift({ time, message })

  // 限制日志数量
  if (eventLogs.value.length > 10) {
    eventLogs.value = eventLogs.value.slice(0, 10)
  }
}

const onThemeChange = (theme: string, mode: 'light' | 'dark') => {
  currentTheme.value = theme
  currentMode.value = mode
  addEventLog(`主题已切换到: ${theme} (${mode === 'light' ? '亮色' : '暗色'}模式)`)
}

const onModeChange = (mode: 'light' | 'dark') => {
  currentMode.value = mode
  addEventLog(`模式已切换到: ${mode === 'light' ? '亮色' : '暗色'}模式`)
}

const onDialogOpen = () => {
  addEventLog('主题选择对话框已打开')
}

const onDialogClose = () => {
  addEventLog('主题选择对话框已关闭')
}

// 生命周期
onMounted(() => {
  if (themeManager) {
    currentTheme.value = themeManager.getCurrentTheme()
    currentMode.value = themeManager.getCurrentMode()
    addEventLog('主题演示页面已加载')
  }
})
</script>

<style scoped lang="less">
.theme-demo-page {
  min-height: 100vh;
  background: var(--color-background);
  color: var(--color-text);
  transition: all 0.3s ease;
}

.theme-demo-header {
  text-align: center;
  padding: 40px 20px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.theme-demo-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: var(--color-primary);
}

.theme-demo-subtitle {
  font-size: 1.1rem;
  color: var(--color-text);
  opacity: 0.8;
  margin: 0;
  max-width: 600px;
  margin: 0 auto;
}

.theme-controls {
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.control-group {
  margin-bottom: 40px;
  padding: 24px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
}

.control-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: var(--color-text);
}

.control-description {
  color: var(--color-text);
  opacity: 0.7;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.control-demo {
  display: flex;
  align-items: center;
  gap: 16px;
}

.theme-showcase {
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.showcase-title {
  font-size: 2rem;
  font-weight: 600;
  margin: 0 0 32px 0;
  text-align: center;
  color: var(--color-text);
}

.current-theme-info {
  margin-bottom: 40px;
}

.theme-info-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 24px;
  text-align: center;

  h3 {
    margin: 0 0 16px 0;
    color: var(--color-text);
  }
}

.theme-details {
  display: flex;
  justify-content: center;
  gap: 24px;
  align-items: center;
}

.theme-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-primary);
}

.theme-mode {
  font-size: 1rem;
  color: var(--color-text);
  opacity: 0.7;
}

.color-showcase {
  margin-bottom: 40px;

  h3 {
    margin: 0 0 20px 0;
    color: var(--color-text);
  }
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.color-item {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
}

.color-swatch {
  height: 80px;
  width: 100%;
}

.color-info {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.color-name {
  font-weight: 500;
  color: var(--color-text);
}

.color-value {
  font-family: monospace;
  font-size: 0.9rem;
  color: var(--color-text);
  opacity: 0.7;
}

.component-showcase {
  margin-bottom: 40px;

  h3 {
    margin: 0 0 20px 0;
    color: var(--color-text);
  }
}

.component-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.component-group {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 20px;

  h4 {
    margin: 0 0 16px 0;
    color: var(--color-text);
  }
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &.btn-primary {
    background: var(--color-primary);
    color: white;
  }

  &.btn-secondary {
    background: var(--color-text);
    color: var(--color-background);
  }

  &.btn-success {
    background: #52c41a;
    color: white;
  }

  &.btn-warning {
    background: var(--color-warning);
    color: var(--color-background);
  }

  &.btn-danger {
    background: #ff4d4f;
    color: white;
  }

  &.btn-sm {
    padding: 6px 12px;
    font-size: 12px;
  }

  &:hover {
    opacity: 0.8;
    transform: translateY(-1px);
  }
}

.card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
}

.card-header {
  padding: 16px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  font-weight: 600;
}

.card-body {
  padding: 16px;
  line-height: 1.5;
}

.card-footer {
  padding: 16px;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-label {
  font-weight: 500;
  color: var(--color-text);
}

.form-input,
.form-select,
.form-textarea {
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-background);
  color: var(--color-text);
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }
}

.form-textarea {
  min-height: 80px;
  resize: vertical;
}

.event-log {
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;

  h3 {
    margin: 0 0 20px 0;
    color: var(--color-text);
  }
}

.log-container {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.log-item {
  display: flex;
  gap: 12px;
  padding: 8px 16px;
  border-bottom: 1px solid var(--color-border);

  &:last-child {
    border-bottom: none;
  }
}

.log-time {
  color: var(--color-text);
  opacity: 0.6;
  font-size: 0.9rem;
  white-space: nowrap;
}

.log-message {
  color: var(--color-text);
  font-size: 0.9rem;
}

// 响应式设计
@media (max-width: 768px) {
  .theme-demo-title {
    font-size: 2rem;
  }

  .theme-controls,
  .theme-showcase,
  .event-log {
    padding: 20px 16px;
  }

  .control-group {
    padding: 16px;
  }

  .component-grid {
    grid-template-columns: 1fr;
  }

  .color-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }

  .theme-details {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
