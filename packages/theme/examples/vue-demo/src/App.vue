<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

// 当前主题
const currentTheme = ref('christmas')

// 主题类名
const themeClass = computed(() => {
  return currentTheme.value ? `theme-${currentTheme.value}` : ''
})

// 演示卡片
const demoCards = [
  { icon: '🎨', title: '主题系统', description: '强大的主题管理功能' },
  { icon: '🎭', title: '装饰元素', description: '丰富的装饰效果' },
  { icon: '🎬', title: '动画效果', description: '流畅的动画体验' },
]

// 当前主题信息
const currentThemeInfo = computed(() => {
  const themeMap = {
    'christmas': {
      displayName: '圣诞节主题',
      description: '温馨的红绿配色，营造浓厚的圣诞节日氛围',
      colors: {
        primary: '#dc2626',
        secondary: '#16a34a',
        accent: '#fbbf24',
        background: '#fef7f0',
      },
    },
    'spring-festival': {
      displayName: '春节主题',
      description: '喜庆的红金配色，展现中国传统节日的热闹氛围',
      colors: {
        primary: '#dc2626',
        secondary: '#fbbf24',
        accent: '#f59e0b',
        background: '#fef3c7',
      },
    },
    'halloween': {
      displayName: '万圣节主题',
      description: '神秘的橙黑配色，营造恐怖而有趣的万圣节氛围',
      colors: {
        primary: '#ea580c',
        secondary: '#1f2937',
        accent: '#fbbf24',
        background: '#1f2937',
      },
    },
  }
  return themeMap[currentTheme.value as keyof typeof themeMap]
})

// 主题切换
function onThemeChange() {
  console.log('主题切换到:', currentTheme.value)
  // 这里应该调用实际的主题切换逻辑
  // await setTheme(currentTheme.value)
}

// 添加装饰
function addDecoration() {
  console.log('添加装饰效果')
  // 这里应该调用实际的装饰添加逻辑
}

// 开始动画
function startAnimation() {
  console.log('开始动画效果')
  // 这里应该调用实际的动画开始逻辑
}

// 清空所有效果
function clearAll() {
  console.log('清空所有效果')
  // 这里应该调用实际的清空逻辑
}

onMounted(() => {
  console.log('LDesign Theme Demo 已加载')
})
</script>

<template>
  <div id="app" :class="themeClass">
    <!-- 简单的头部 -->
    <header class="app-header">
      <div class="container">
        <h1>🎨 LDesign Theme Demo</h1>
        <div class="theme-controls">
          <select v-model="currentTheme" @change="onThemeChange">
            <option value="christmas">
              🎄 圣诞节
            </option>
            <option value="spring-festival">
              🧧 春节
            </option>
            <option value="halloween">
              🎃 万圣节
            </option>
          </select>
        </div>
      </div>
    </header>

    <!-- 主要内容 -->
    <main class="main-content">
      <div class="container">
        <section class="hero">
          <h2>欢迎使用 LDesign Theme</h2>
          <p>这是一个功能强大的主题系统演示项目</p>

          <!-- 主题按钮演示 -->
          <div class="button-demo">
            <button class="btn btn-primary" @click="addDecoration">
              ✨ 添加装饰
            </button>
            <button class="btn btn-secondary" @click="startAnimation">
              🎬 开始动画
            </button>
            <button class="btn btn-outline" @click="clearAll">
              🗑️ 清空效果
            </button>
          </div>

          <!-- 状态显示 -->
          <div class="status-info">
            <p>
              当前主题:
              <strong>{{ currentThemeInfo?.displayName || '默认主题' }}</strong>
            </p>
            <p>项目状态: <span style="color: #16a34a">✅ 运行正常</span></p>
          </div>
        </section>

        <!-- 演示区域 -->
        <section class="demo-area">
          <div class="demo-cards">
            <div
              v-for="(card, index) in demoCards"
              :key="index"
              class="demo-card"
              :style="{ animationDelay: `${index * 0.1}s` }"
            >
              <div class="card-icon">
                {{ card.icon }}
              </div>
              <h3>{{ card.title }}</h3>
              <p>{{ card.description }}</p>
            </div>
          </div>
        </section>

        <!-- 当前主题信息 -->
        <section class="theme-info">
          <h3>当前主题: {{ currentThemeInfo?.displayName }}</h3>
          <p>{{ currentThemeInfo?.description }}</p>
          <div class="theme-colors">
            <div
              v-for="(color, name) in currentThemeInfo?.colors"
              :key="name"
              class="color-item"
            >
              <div class="color-swatch" :style="{ backgroundColor: color }" />
              <span>{{ name }}</span>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- 简单的页脚 -->
    <footer class="app-footer">
      <div class="container">
        <p>&copy; 2024 LDesign Team. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* 头部样式 */
.app-header {
  background-color: var(--theme-surface, #f8f9fa);
  border-bottom: 1px solid var(--theme-border, #dee2e6);
  padding: 1rem 0;
}

.app-header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.app-header h1 {
  margin: 0;
  color: var(--theme-primary, #007bff);
  font-size: 1.5rem;
}

.theme-controls select {
  padding: 0.5rem;
  border: 1px solid var(--theme-border, #dee2e6);
  border-radius: 0.25rem;
  background-color: var(--theme-background, #fff);
  color: var(--theme-text, #212529);
}

/* 主要内容 */
.main-content {
  flex: 1;
  padding: 2rem 0;
}

.hero {
  text-align: center;
  margin-bottom: 3rem;
}

.hero h2 {
  font-size: 2.5rem;
  color: var(--theme-primary, #007bff);
  margin: 0 0 1rem 0;
}

.hero p {
  font-size: 1.125rem;
  color: var(--theme-text-secondary, #6c757d);
  margin: 0 0 2rem 0;
}

.button-demo {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.status-info {
  background-color: var(--theme-surface);
  border: 1px solid var(--theme-border);
  border-radius: 0.5rem;
  padding: 1rem;
  text-align: center;
  margin-top: 2rem;
}

.status-info p {
  margin: 0.5rem 0;
  color: var(--theme-text-secondary);
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: var(--theme-primary, #007bff);
  color: white;
}

.btn-secondary {
  background-color: var(--theme-secondary, #6c757d);
  color: white;
}

.btn-outline {
  background-color: transparent;
  color: var(--theme-primary, #007bff);
  border: 2px solid var(--theme-primary, #007bff);
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 演示区域 */
.demo-area {
  margin-bottom: 3rem;
}

.demo-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.demo-card {
  background-color: var(--theme-surface, #f8f9fa);
  border: 1px solid var(--theme-border, #dee2e6);
  border-radius: 0.75rem;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  animation: fadeInUp 0.6s ease forwards;
}

.demo-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.demo-card h3 {
  margin: 0 0 1rem 0;
  color: var(--theme-text, #212529);
}

.demo-card p {
  margin: 0;
  color: var(--theme-text-secondary, #6c757d);
}

/* 主题信息 */
.theme-info {
  background-color: var(--theme-surface, #f8f9fa);
  border: 1px solid var(--theme-border, #dee2e6);
  border-radius: 0.75rem;
  padding: 2rem;
  text-align: center;
}

.theme-info h3 {
  margin: 0 0 1rem 0;
  color: var(--theme-primary, #007bff);
}

.theme-info p {
  margin: 0 0 2rem 0;
  color: var(--theme-text-secondary, #6c757d);
}

.theme-colors {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.color-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.color-swatch {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.color-item span {
  font-size: 0.75rem;
  color: var(--theme-text-secondary, #6c757d);
  text-transform: capitalize;
}

/* 页脚 */
.app-footer {
  background-color: var(--theme-surface, #f8f9fa);
  border-top: 1px solid var(--theme-border, #dee2e6);
  padding: 1rem 0;
  text-align: center;
}

.app-footer p {
  margin: 0;
  color: var(--theme-text-secondary, #6c757d);
  font-size: 0.875rem;
}

/* 动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 主题变量 */
:root {
  --theme-primary: #007bff;
  --theme-secondary: #6c757d;
  --theme-accent: #28a745;
  --theme-background: #ffffff;
  --theme-surface: #f8f9fa;
  --theme-text: #212529;
  --theme-text-secondary: #6c757d;
  --theme-border: #dee2e6;
}

/* 圣诞节主题 */
.theme-christmas {
  --theme-primary: #dc2626;
  --theme-secondary: #16a34a;
  --theme-accent: #fbbf24;
  --theme-background: #fef7f0;
  --theme-surface: #ffffff;
  --theme-text: #1f2937;
  --theme-text-secondary: #6b7280;
  --theme-border: #e5e7eb;
}

/* 春节主题 */
.theme-spring-festival {
  --theme-primary: #dc2626;
  --theme-secondary: #fbbf24;
  --theme-accent: #f59e0b;
  --theme-background: #fef3c7;
  --theme-surface: #ffffff;
  --theme-text: #1f2937;
  --theme-text-secondary: #6b7280;
  --theme-border: #fde68a;
}

/* 万圣节主题 */
.theme-halloween {
  --theme-primary: #ea580c;
  --theme-secondary: #1f2937;
  --theme-accent: #fbbf24;
  --theme-background: #1f2937;
  --theme-surface: #374151;
  --theme-text: #f9fafb;
  --theme-text-secondary: #d1d5db;
  --theme-border: #4b5563;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-header .container {
    flex-direction: column;
    gap: 1rem;
  }

  .hero h2 {
    font-size: 2rem;
  }

  .button-demo {
    flex-direction: column;
    align-items: center;
  }

  .demo-cards {
    grid-template-columns: 1fr;
  }

  .theme-colors {
    justify-content: center;
  }
}
</style>
