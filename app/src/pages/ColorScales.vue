<template>
  <div class="color-scales-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-badge">
          <span class="badge-icon">🌈</span>
          <span class="badge-text">Color System</span>
        </div>
        <h1 class="header-title">色彩系统展示</h1>
        <p class="header-subtitle">探索 LDESIGN 设计系统的完整色彩体系</p>
      </div>
    </div>

    <div class="page-content">
      <!-- 主题色彩 -->
      <section class="color-section">
        <div class="section-header">
          <div class="section-icon">🎨</div>
          <div class="section-info">
            <h2 class="section-title">主题色彩</h2>
            <p class="section-description">品牌主色调的完整色阶，从浅到深的渐变系列</p>
          </div>
        </div>

        <div class="color-palette">
          <div
            v-for="(color, index) in brandColors"
            :key="index"
            class="color-card"
            :style="{ backgroundColor: color.value }"
            @click="copyColor(color.value)"
          >
            <div class="color-info">
              <div class="color-name">{{ color.name }}</div>
              <div class="color-value">{{ color.value }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 功能色彩 -->
      <section class="color-section">
        <div class="section-header">
          <div class="section-icon">⚡</div>
          <div class="section-info">
            <h2 class="section-title">功能色彩</h2>
            <p class="section-description">用于表示不同状态和功能的语义化色彩</p>
          </div>
        </div>

        <div class="functional-colors">
          <div class="color-group">
            <h3 class="group-title">成功色</h3>
            <div class="color-palette">
              <div
                v-for="(color, index) in successColors"
                :key="index"
                class="color-card"
                :style="{ backgroundColor: color.value }"
                @click="copyColor(color.value)"
              >
                <div class="color-info">
                  <div class="color-name">{{ color.name }}</div>
                  <div class="color-value">{{ color.value }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="color-group">
            <h3 class="group-title">警告色</h3>
            <div class="color-palette">
              <div
                v-for="(color, index) in warningColors"
                :key="index"
                class="color-card"
                :style="{ backgroundColor: color.value }"
                @click="copyColor(color.value)"
              >
                <div class="color-info">
                  <div class="color-name">{{ color.name }}</div>
                  <div class="color-value">{{ color.value }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="color-group">
            <h3 class="group-title">错误色</h3>
            <div class="color-palette">
              <div
                v-for="(color, index) in errorColors"
                :key="index"
                class="color-card"
                :style="{ backgroundColor: color.value }"
                @click="copyColor(color.value)"
              >
                <div class="color-info">
                  <div class="color-name">{{ color.name }}</div>
                  <div class="color-value">{{ color.value }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 中性色彩 -->
      <section class="color-section">
        <div class="section-header">
          <div class="section-icon">⚪</div>
          <div class="section-info">
            <h2 class="section-title">中性色彩</h2>
            <p class="section-description">用于文本、背景和边框的中性色彩系统</p>
          </div>
        </div>

        <div class="color-palette">
          <div
            v-for="(color, index) in grayColors"
            :key="index"
            class="color-card"
            :style="{ backgroundColor: color.value }"
            @click="copyColor(color.value)"
          >
            <div class="color-info">
              <div class="color-name">{{ color.name }}</div>
              <div class="color-value">{{ color.value }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 使用指南 -->
      <section class="color-section">
        <div class="section-header">
          <div class="section-icon">📖</div>
          <div class="section-info">
            <h2 class="section-title">使用指南</h2>
            <p class="section-description">如何在项目中正确使用这些色彩变量</p>
          </div>
        </div>

        <div class="usage-guide">
          <div class="guide-card">
            <h3 class="guide-title">CSS 变量使用</h3>
            <div class="code-example">
              <pre><code>/* 主题色 */
color: var(--ldesign-brand-color);
background: var(--ldesign-brand-color-1);

/* 功能色 */
color: var(--ldesign-success-color);
border: 1px solid var(--ldesign-error-color);

/* 中性色 */
color: var(--ldesign-text-color-primary);
background: var(--ldesign-bg-color-container);</code></pre>
            </div>
          </div>

          <div class="guide-card">
            <h3 class="guide-title">色彩层级</h3>
            <div class="level-guide">
              <div class="level-item">
                <span class="level-number">1-3</span>
                <span class="level-desc">浅色调，用于背景和容器</span>
              </div>
              <div class="level-item">
                <span class="level-number">4-6</span>
                <span class="level-desc">中色调，用于边框和辅助元素</span>
              </div>
              <div class="level-item">
                <span class="level-number">7-10</span>
                <span class="level-desc">深色调，用于文本和主要元素</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- 复制提示 -->
    <div v-if="showCopyTip" class="copy-tip">
      <span class="tip-icon">✅</span>
      <span class="tip-text">颜色值已复制到剪贴板</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

// 复制提示状态
const showCopyTip = ref(false)

// 主题色彩数据
const brandColors = computed(() => [
  { name: 'Brand 1', value: 'var(--ldesign-brand-color-1)' },
  { name: 'Brand 2', value: 'var(--ldesign-brand-color-2)' },
  { name: 'Brand 3', value: 'var(--ldesign-brand-color-3)' },
  { name: 'Brand 4', value: 'var(--ldesign-brand-color-4)' },
  { name: 'Brand 5', value: 'var(--ldesign-brand-color-5)' },
  { name: 'Brand 6', value: 'var(--ldesign-brand-color-6)' },
  { name: 'Brand 7', value: 'var(--ldesign-brand-color-7)' },
  { name: 'Brand 8', value: 'var(--ldesign-brand-color-8)' },
  { name: 'Brand 9', value: 'var(--ldesign-brand-color-9)' },
  { name: 'Brand 10', value: 'var(--ldesign-brand-color-10)' }
])

// 成功色彩数据
const successColors = computed(() => [
  { name: 'Success 1', value: 'var(--ldesign-success-color-1)' },
  { name: 'Success 3', value: 'var(--ldesign-success-color-3)' },
  { name: 'Success 5', value: 'var(--ldesign-success-color-5)' },
  { name: 'Success 7', value: 'var(--ldesign-success-color-7)' },
  { name: 'Success 9', value: 'var(--ldesign-success-color-9)' }
])

// 警告色彩数据
const warningColors = computed(() => [
  { name: 'Warning 1', value: 'var(--ldesign-warning-color-1)' },
  { name: 'Warning 3', value: 'var(--ldesign-warning-color-3)' },
  { name: 'Warning 5', value: 'var(--ldesign-warning-color-5)' },
  { name: 'Warning 7', value: 'var(--ldesign-warning-color-7)' },
  { name: 'Warning 9', value: 'var(--ldesign-warning-color-9)' }
])

// 错误色彩数据
const errorColors = computed(() => [
  { name: 'Error 1', value: 'var(--ldesign-error-color-1)' },
  { name: 'Error 3', value: 'var(--ldesign-error-color-3)' },
  { name: 'Error 5', value: 'var(--ldesign-error-color-5)' },
  { name: 'Error 7', value: 'var(--ldesign-error-color-7)' },
  { name: 'Error 9', value: 'var(--ldesign-error-color-9)' }
])

// 中性色彩数据
const grayColors = computed(() => [
  { name: 'Gray 1', value: 'var(--ldesign-gray-color-1)' },
  { name: 'Gray 2', value: 'var(--ldesign-gray-color-2)' },
  { name: 'Gray 3', value: 'var(--ldesign-gray-color-3)' },
  { name: 'Gray 4', value: 'var(--ldesign-gray-color-4)' },
  { name: 'Gray 5', value: 'var(--ldesign-gray-color-5)' },
  { name: 'Gray 6', value: 'var(--ldesign-gray-color-6)' },
  { name: 'Gray 7', value: 'var(--ldesign-gray-color-7)' },
  { name: 'Gray 8', value: 'var(--ldesign-gray-color-8)' },
  { name: 'Gray 9', value: 'var(--ldesign-gray-color-9)' },
  { name: 'Gray 10', value: 'var(--ldesign-gray-color-10)' }
])

// 复制颜色值到剪贴板
const copyColor = async (colorValue: string) => {
  try {
    // 获取计算后的颜色值
    const element = document.createElement('div')
    element.style.color = colorValue
    document.body.appendChild(element)
    const computedColor = window.getComputedStyle(element).color
    document.body.removeChild(element)

    await navigator.clipboard.writeText(computedColor)

    // 显示复制提示
    showCopyTip.value = true
    setTimeout(() => {
      showCopyTip.value = false
    }, 2000)
  } catch (error) {
    console.error('复制失败:', error)
  }
}
</script>

<style scoped lang="less">
.color-scales-page {
  min-height: 100vh;
  background: var(--ldesign-bg-color-page);
  color: var(--ldesign-text-color-primary);
}

/* 页面头部样式 */
.page-header {
  background: linear-gradient(135deg,
    var(--ldesign-brand-color-1) 0%,
    var(--ldesign-brand-color-2) 50%,
    var(--ldesign-brand-color-3) 100%);
  padding: var(--ls-spacing-xxl) var(--ls-spacing-xl);
  margin-bottom: var(--ls-spacing-xxl);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--ls-spacing-sm);
  padding: var(--ls-spacing-sm) var(--ls-spacing-lg);
  background: var(--ldesign-brand-color);
  color: white;
  border-radius: var(--ls-border-radius-full);
  font-size: var(--ls-font-size-sm);
  font-weight: 600;
  margin-bottom: var(--ls-spacing-lg);
  box-shadow: var(--ldesign-shadow-2);
}

.badge-icon {
  font-size: 1.2em;
}

.header-title {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  margin-bottom: var(--ls-spacing-lg);
  background: linear-gradient(135deg,
    var(--ldesign-brand-color-8) 0%,
    var(--ldesign-brand-color-6) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-subtitle {
  font-size: var(--ls-font-size-lg);
  color: var(--ldesign-text-color-secondary);
  max-width: 600px;
  margin: 0 auto;
}

/* 主要内容区域 */
.page-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--ls-spacing-xl) var(--ls-spacing-xxl);
}

/* 色彩区域样式 */
.color-section {
  margin-bottom: var(--ls-spacing-xxl);
}

.section-header {
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-lg);
  margin-bottom: var(--ls-spacing-xl);
}

.section-icon {
  font-size: 2.5rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ldesign-brand-color-1);
  border-radius: var(--ls-border-radius-lg);
  flex-shrink: 0;
}

.section-info {
  flex: 1;
}

.section-title {
  font-size: var(--ls-font-size-h3);
  font-weight: 600;
  color: var(--ldesign-text-color-primary);
  margin-bottom: var(--ls-spacing-xs);
}

.section-description {
  color: var(--ldesign-text-color-secondary);
  line-height: 1.6;
}

/* 色彩调色板样式 */
.color-palette {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--ls-spacing-lg);
  margin-bottom: var(--ls-spacing-xl);
}

.color-card {
  aspect-ratio: 1;
  border-radius: var(--ls-border-radius-lg);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: var(--ldesign-shadow-1);
  border: 1px solid var(--ldesign-border-color);
}

.color-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: var(--ldesign-shadow-3);
}

.color-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: var(--ls-spacing-sm);
  text-align: center;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.color-card:hover .color-info {
  transform: translateY(0);
}

.color-name {
  font-size: var(--ls-font-size-xs);
  font-weight: 600;
  margin-bottom: var(--ls-spacing-xs);
}

.color-value {
  font-size: var(--ls-font-size-xs);
  font-family: 'Courier New', monospace;
  opacity: 0.9;
}

/* 功能色彩组样式 */
.functional-colors {
  display: grid;
  gap: var(--ls-spacing-xxl);
}

.color-group {
  background: var(--ldesign-bg-color-container);
  border-radius: var(--ls-border-radius-lg);
  padding: var(--ls-spacing-xl);
  border: 1px solid var(--ldesign-border-color);
}

.group-title {
  font-size: var(--ls-font-size-xl);
  font-weight: 600;
  color: var(--ldesign-text-color-primary);
  margin-bottom: var(--ls-spacing-lg);
  text-align: center;
}

/* 使用指南样式 */
.usage-guide {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--ls-spacing-xl);
}

.guide-card {
  background: var(--ldesign-bg-color-container);
  border-radius: var(--ls-border-radius-lg);
  padding: var(--ls-spacing-xl);
  border: 1px solid var(--ldesign-border-color);
  box-shadow: var(--ldesign-shadow-1);
}

.guide-title {
  font-size: var(--ls-font-size-xl);
  font-weight: 600;
  color: var(--ldesign-text-color-primary);
  margin-bottom: var(--ls-spacing-lg);
}

.code-example {
  background: var(--ldesign-gray-color-1);
  border-radius: var(--ls-border-radius-base);
  padding: var(--ls-spacing-lg);
  overflow-x: auto;
}

.code-example pre {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: var(--ls-font-size-sm);
  line-height: 1.6;
  color: var(--ldesign-text-color-primary);
}

.level-guide {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-lg);
}

.level-item {
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-lg);
  padding: var(--ls-spacing-lg);
  background: var(--ldesign-bg-color-component);
  border-radius: var(--ls-border-radius-base);
  border-left: 4px solid var(--ldesign-brand-color);
}

.level-number {
  font-weight: 700;
  color: var(--ldesign-brand-color);
  font-size: var(--ls-font-size-lg);
  min-width: 40px;
}

.level-desc {
  color: var(--ldesign-text-color-secondary);
  line-height: 1.5;
}

/* 复制提示样式 */
.copy-tip {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--ldesign-success-color);
  color: white;
  padding: var(--ls-spacing-lg) var(--ls-spacing-xl);
  border-radius: var(--ls-border-radius-lg);
  box-shadow: var(--ldesign-shadow-3);
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-sm);
  z-index: 1000;
  animation: fadeInOut 2s ease-in-out;
}

.tip-icon {
  font-size: 1.2em;
}

.tip-text {
  font-weight: 600;
}

@keyframes fadeInOut {
  0%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
  20%, 80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .color-palette {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  }

  .usage-guide {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: var(--ls-spacing-xl) var(--ls-spacing-lg);
  }

  .page-content {
    padding: 0 var(--ls-spacing-lg) var(--ls-spacing-xl);
  }

  .section-header {
    flex-direction: column;
    text-align: center;
  }

  .section-icon {
    margin: 0 auto;
  }

  .color-palette {
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    gap: var(--ls-spacing-sm);
  }

  .functional-colors {
    gap: var(--ls-spacing-xl);
  }

  .color-group {
    padding: var(--ls-spacing-lg);
  }

  .guide-card {
    padding: var(--ls-spacing-lg);
  }
}

@media (max-width: 480px) {
  .header-title {
    font-size: 2rem;
  }

  .header-subtitle {
    font-size: var(--ls-font-size-base);
  }

  .color-palette {
    grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  }

  .level-item {
    flex-direction: column;
    text-align: center;
    gap: var(--ls-spacing-sm);
  }

  .level-number {
    min-width: auto;
  }
}
</style>