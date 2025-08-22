<template>
  <div class="app" :data-theme="currentTheme">
    <!-- 顶部主题控制栏 -->
    <div class="top-theme-bar">
      <div class="theme-bar-container">
        <div class="theme-info-section">
          <h3>🎨 节日主题演示</h3>
          <span class="current-theme">
            当前: {{ festivalThemes[currentTheme]?.displayName || '未知' }}
            <span v-if="isLoading" class="loading-text">切换中...</span>
          </span>
        </div>

        <div class="theme-controls">
          <div class="theme-buttons">
            <select
              v-model="currentTheme"
              @change="handleThemeSelect"
              class="theme-selector"
              :disabled="isLoading"
            >
              <option value="default">⚪ 默认主题</option>
              <option value="spring-festival">🧧 春节主题</option>
              <option value="christmas">🎄 圣诞节</option>
            </select>

            <button
              @click="useRecommendedTheme"
              class="recommend-btn"
              :disabled="isLoading"
              title="使用智能推荐主题"
            >
              💡 智能推荐
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 主题状态显示 -->
    <div class="status-section">
      <ThemeStatusDisplay
        :current-theme="currentTheme"
        :theme-metadata="festivalThemes[currentTheme]"
      />
    </div>

    <!-- 系统首页 -->
    <SystemHomepage />

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>正在切换主题...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

// 导入组件
import ThemeStatusDisplay from './components/ThemeStatusDisplay.vue'
import SystemHomepage from './components/SystemHomepage.vue'

// 导入主题系统
import { type ThemeManagerInstance } from '@ldesign/color'

// 导入节日主题配置
import {
  festivalThemeMap,
  festivalThemeMetadata,
  applyThemeCSSVariables,
  getThemeRecommendation,
  getFestivalThemeManager,
} from './lib/festival-themes'

// 导入UI装饰系统 - 演示版本
import { uiDecorationManager } from './lib/ui-decoration-demo'

// 响应式状态
const currentTheme = ref('default')
const themeManager = ref<ThemeManagerInstance | null>(null)
const isLoading = ref(false)

// 使用节日主题元数据
const festivalThemes = festivalThemeMetadata

// 主题切换函数
const switchToTheme = async (themeId: string) => {
  if (!themeManager.value) return

  const previousTheme = currentTheme.value
  isLoading.value = true

  try {
    const festivalTheme = festivalThemes[themeId as keyof typeof festivalThemes]
    if (!festivalTheme) {
      console.warn(`主题 "${themeId}" 不存在`)
      return
    }

    // 应用UI装饰
    uiDecorationManager.applyThemeDecorations(themeId)

    // 应用节日特定的CSS变量（包含 @ldesign/color 集成）
    await applyThemeCSSVariables(themeId)

    // 更新当前主题
    currentTheme.value = themeId

    console.log(`🎨 主题已切换到: ${festivalTheme.displayName}`)
  } catch (error) {
    console.error('主题切换失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 处理主题按钮点击
const handleThemeClick = async (themeId: string) => {
  // 切换主题
  await switchToTheme(themeId)
}

// 处理主题选择器变化
const handleThemeSelect = async (event: Event) => {
  const target = event.target as HTMLSelectElement
  const themeId = target.value
  await switchToTheme(themeId)
}

// 使用推荐主题
const useRecommendedTheme = async () => {
  const recommendedTheme = getThemeRecommendation()
  await switchToTheme(recommendedTheme)
}

// 清理函数
const cleanup = () => {
  uiDecorationManager.clearAllDecorations()
}

// 组件挂载
onMounted(async () => {
  console.log('🎨 初始化 Festival Demo...')

  try {
    // 获取节日主题管理器
    themeManager.value = await getFestivalThemeManager()

    // 获取推荐主题
    const recommendedTheme = getThemeRecommendation()
    console.log(`💡 推荐主题: ${recommendedTheme}`)

    // 设置初始主题
    await switchToTheme(recommendedTheme)

    // 应用主题装饰
    uiDecorationManager.applyThemeDecorations(recommendedTheme)

    console.log('✅ Festival Demo 初始化完成')
    console.log(`🎯 当前主题: ${festivalThemes[recommendedTheme]?.displayName}`)
  } catch (error) {
    console.error('❌ 初始化失败:', error)

    // 降级处理：使用默认主题
    try {
      await switchToTheme('default')
      console.log('🔄 已降级到默认主题')
    } catch (fallbackError) {
      console.error('❌ 降级失败:', fallbackError)
    }
  }
})

// 组件卸载时清理
onUnmounted(() => {
  cleanup()
  console.log('🧹 Festival Demo 已清理')
})
</script>

<style scoped>
/* 应用主容器 */
.app {
  min-height: 100vh;
  background: var(
    --festival-background,
    linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)
  );
  color: var(--festival-text, #1a202c);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow-x: hidden;
}

/* 顶部主题控制栏 */
.top-theme-bar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--festival-primary, #e2e8f0);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.theme-bar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.theme-info-section h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--festival-primary, #1a202c);
}

.current-theme {
  font-size: 14px;
  color: var(--festival-text, #4a5568);
  font-weight: 500;
}

.loading-text {
  color: var(--festival-primary, #3182ce);
  font-weight: 600;
  margin-left: 8px;
}

.theme-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 主题演示区域 */
.quick-theme-demo {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.quick-theme-demo h2 {
  margin: 0 0 12px 0;
  font-size: 24px;
  font-weight: 700;
  color: #1a202c;
  text-align: center;
}

.demo-description {
  text-align: center;
  color: #718096;
  margin-bottom: 24px;
  font-size: 16px;
  line-height: 1.5;
}

/* 主题按钮 */
.theme-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.theme-btn {
  padding: 16px 24px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #1a202c;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.theme-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.theme-btn.active {
  border-color: #3182ce;
  background: #3182ce;
  color: white;
}

.theme-btn.spring-festival:hover {
  border-color: #dc2626;
  background: linear-gradient(135deg, #dc2626, #f59e0b);
  color: white;
}

.theme-btn.christmas:hover {
  border-color: #16a34a;
  background: linear-gradient(135deg, #16a34a, #dc2626);
  color: white;
}

.theme-btn.default:hover {
  border-color: #1890ff;
  background: linear-gradient(135deg, #1890ff, #722ed1);
  color: white;
}

/* 状态显示 */
.status-display {
  background: #f7fafc;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}

.status-display p {
  margin: 8px 0;
  color: #4a5568;
}

.status-ok {
  color: #38a169;
  font-weight: 600;
}

/* 主内容区域 */
.main-content {
  margin: 32px 0;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* 挂件展示区域 */
.widget-showcase {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid var(--festival-primary, #e2e8f0);
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  animation: slideInUp 0.6s ease-out;
}

.widget-showcase h3 {
  margin: 0 0 16px 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--festival-primary, #1a202c);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.widget-showcase p {
  margin: 0 0 24px 0;
  color: var(--festival-text, #718096);
  line-height: 1.6;
  font-size: 16px;
}

.widget-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin-top: 24px;
}

.widget-item {
  background: linear-gradient(
    135deg,
    var(--festival-primary, #3182ce),
    var(--festival-secondary, #722ed1)
  );
  border-radius: 12px;
  padding: 20px;
  color: white;
  text-align: center;
  transform: translateY(20px);
  opacity: 0;
  animation: fadeInUp 0.6s ease-out forwards;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.widget-item:hover {
  transform: translateY(-8px) scale(1.05);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
}

.widget-icon {
  font-size: 32px;
  margin-bottom: 8px;
  animation: bounce 2s infinite;
}

.widget-name {
  font-size: 12px;
  font-weight: 600;
  opacity: 0.9;
}

/* 主题效果演示 */
.theme-effects {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 32px;
  animation: slideInUp 0.8s ease-out;
}

.theme-effects h3 {
  margin: 0 0 24px 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--festival-primary, #1a202c);
  text-align: center;
}

.effect-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.effect-card {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid var(--festival-primary, #e2e8f0);
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s ease;
}

.effect-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.effect-card h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--festival-primary, #1a202c);
}

.demo-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.demo-btn {
  padding: 12px 24px;
  border: 2px solid transparent;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.demo-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.5s ease;
}

.demo-btn:hover::before {
  left: 100%;
}

.demo-btn.primary {
  background: var(--festival-primary, #3182ce);
  color: white;
  border-color: var(--festival-primary, #3182ce);
}

.demo-btn.secondary {
  background: var(--festival-secondary, #718096);
  color: white;
  border-color: var(--festival-secondary, #718096);
}

.demo-btn.accent {
  background: var(--festival-accent, #f59e0b);
  color: white;
  border-color: var(--festival-accent, #f59e0b);
}

.demo-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.demo-cards {
  display: flex;
  justify-content: center;
}

.demo-card-item {
  background: linear-gradient(
    135deg,
    var(--festival-primary, #3182ce),
    var(--festival-secondary, #722ed1)
  );
  color: white;
  border-radius: 12px;
  padding: 20px;
  min-width: 200px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.card-header {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}

.card-content {
  font-size: 14px;
  opacity: 0.9;
  line-height: 1.4;
}

.animation-demo {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.floating-element,
.pulsing-element,
.rotating-element {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: white;
  text-align: center;
  line-height: 1.2;
}

.floating-element {
  background: var(--festival-primary, #3182ce);
  animation: float 3s ease-in-out infinite;
}

.pulsing-element {
  background: var(--festival-secondary, #722ed1);
  animation: pulse 2s ease-in-out infinite;
}

.rotating-element {
  background: var(--festival-accent, #f59e0b);
  animation: rotate 4s linear infinite;
}

/* 主题特定样式 */
.app[data-theme='spring-festival'] {
  --app-background: linear-gradient(135deg, #fef2f2 0%, #fff7ed 100%);
}

.app[data-theme='christmas'] {
  --app-background: linear-gradient(135deg, #f0fdf4 0%, #fef2f2 100%);
}

.app[data-theme='default'] {
  --app-background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

/* 加载状态 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  color: white;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

/* 节日挂件动画 */
.festival-widget {
  user-select: none;
  will-change: transform;
}

/* 动画关键帧 */
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

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-container {
    padding: 16px;
  }

  .quick-theme-demo {
    padding: 24px;
  }

  .theme-buttons {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .widget-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 12px;
  }

  .effect-cards {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .demo-buttons {
    flex-direction: column;
    align-items: center;
  }

  .animation-demo {
    gap: 12px;
  }

  .floating-element,
  .pulsing-element,
  .rotating-element {
    width: 50px;
    height: 50px;
    font-size: 10px;
  }
}

/* 主题控制 */
.theme-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
}

.theme-selector {
  padding: 8px 16px;
  border: 2px solid var(--festival-primary, #e2e8f0);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.95);
  color: var(--festival-text, #1a202c);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 160px;
}

.theme-selector:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.theme-selector:hover:not(:disabled) {
  border-color: var(--festival-primary, #3182ce);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.theme-selector:focus {
  outline: none;
  border-color: var(--festival-primary, #3182ce);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.recommend-btn {
  padding: 8px 16px;
  border: 2px solid var(--festival-accent, #52c41a);
  border-radius: 8px;
  background: linear-gradient(
    135deg,
    var(--festival-accent, #52c41a),
    var(--festival-secondary, #722ed1)
  );
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
}

.recommend-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.recommend-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  filter: brightness(1.1);
}

/* 设置按钮 */
.settings-toggle {
  width: 40px;
  height: 40px;
  border: 2px solid var(--festival-primary, #e2e8f0);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: var(--festival-text, #1a202c);
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.settings-toggle:hover {
  background: var(--festival-primary, #3182ce);
  color: white;
  transform: rotate(90deg);
}

.settings-toggle.active {
  background: var(--festival-primary, #3182ce);
  color: white;
  transform: rotate(180deg);
}

/* 设置区域 */
.settings-section {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--festival-primary, #e2e8f0);
  animation: slideDown 0.3s ease-out;
}

.settings-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: start;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .theme-bar-container {
    flex-direction: column;
    gap: 16px;
    padding: 16px;
  }

  .theme-info-section {
    text-align: center;
  }

  .theme-info-section h3 {
    font-size: 16px;
  }

  .theme-controls {
    width: 100%;
    justify-content: center;
  }

  .theme-buttons {
    flex: 1;
    justify-content: center;
    flex-direction: column;
    gap: 8px;
  }

  .theme-selector {
    font-size: 12px;
    padding: 6px 12px;
    min-width: 140px;
  }

  .recommend-btn {
    font-size: 12px;
    padding: 6px 12px;
  }

  .settings-container {
    padding: 16px;
  }

  .settings-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .theme-bar-container {
    padding: 12px;
  }

  .theme-selector {
    font-size: 11px;
    padding: 5px 10px;
    min-width: 120px;
  }

  .recommend-btn {
    font-size: 11px;
    padding: 5px 10px;
  }

  .settings-toggle {
    width: 36px;
    height: 36px;
    font-size: 14px;
  }
}
</style>
