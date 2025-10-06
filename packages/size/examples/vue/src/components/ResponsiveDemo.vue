<script setup lang="ts">
import { useSizeResponsive } from '../../../../src/vue'
import CustomButton from './CustomButton.vue'

const {
  currentMode,
  isSmall,
  isMedium,
  isLarge,
  isExtraLarge,
} = useSizeResponsive()

function getLayoutDescription() {
  switch (currentMode.value) {
    case 'small':
      return '单列布局'
    case 'medium':
      return '双列布局'
    case 'large':
      return '三列布局'
    case 'extra-large':
      return '四列布局'
    default:
      return '未知布局'
  }
}
</script>

<template>
  <div class="responsive-demo">
    <div class="demo-grid">
      <!-- 响应式布局 -->
      <div class="demo-card">
        <h3>响应式布局</h3>
        <p>根据尺寸模式调整布局</p>

        <div class="responsive-layout" :class="[`layout-${currentMode}`]">
          <div class="layout-item">
            项目 1
          </div>
          <div class="layout-item">
            项目 2
          </div>
          <div class="layout-item">
            项目 3
          </div>
          <div class="layout-item">
            项目 4
          </div>
        </div>

        <div class="layout-info">
          <p>当前布局: {{ getLayoutDescription() }}</p>
        </div>
      </div>

      <!-- 响应式字体 -->
      <div class="demo-card">
        <h3>响应式字体</h3>
        <p>字体大小随尺寸模式变化</p>

        <div class="font-examples">
          <h1 class="responsive-h1">
            标题 1 (H1)
          </h1>
          <h2 class="responsive-h2">
            标题 2 (H2)
          </h2>
          <h3 class="responsive-h3">
            标题 3 (H3)
          </h3>
          <p class="responsive-text">
            正文文本 (Base)
          </p>
          <small class="responsive-small">小号文本 (Small)</small>
        </div>
      </div>

      <!-- 响应式间距 -->
      <div class="demo-card">
        <h3>响应式间距</h3>
        <p>间距随尺寸模式调整</p>

        <div class="spacing-examples">
          <div class="spacing-item spacing-xs">
            XS 间距
          </div>
          <div class="spacing-item spacing-sm">
            SM 间距
          </div>
          <div class="spacing-item spacing-base">
            Base 间距
          </div>
          <div class="spacing-item spacing-lg">
            LG 间距
          </div>
          <div class="spacing-item spacing-xl">
            XL 间距
          </div>
        </div>
      </div>

      <!-- 条件渲染 -->
      <div class="demo-card">
        <h3>条件渲染</h3>
        <p>根据尺寸模式显示不同内容</p>

        <div class="conditional-content">
          <div v-if="isSmall" class="size-content small-content">
            <h4>小尺寸模式</h4>
            <p>显示简化的内容和布局</p>
            <CustomButton size="small">
              小按钮
            </CustomButton>
          </div>

          <div v-else-if="isMedium" class="size-content medium-content">
            <h4>中等尺寸模式</h4>
            <p>显示标准的内容和布局</p>
            <CustomButton size="medium">
              中等按钮
            </CustomButton>
          </div>

          <div v-else-if="isLarge" class="size-content large-content">
            <h4>大尺寸模式</h4>
            <p>显示丰富的内容和布局，包含更多细节</p>
            <CustomButton size="large">
              大按钮
            </CustomButton>
          </div>

          <div v-else class="size-content xl-content">
            <h4>超大尺寸模式</h4>
            <p>显示最丰富的内容和布局，包含所有功能和细节信息</p>
            <div class="button-group">
              <CustomButton size="large" variant="primary">
                主要操作
              </CustomButton>
              <CustomButton size="large" variant="secondary">
                次要操作
              </CustomButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.responsive-demo {
  /* 样式继承自全局 */
}

/* 响应式布局 */
.responsive-layout {
  display: grid;
  gap: var(--ls-spacing-base, 16px);
  margin: var(--ls-spacing-base, 16px) 0;
}

.layout-small {
  grid-template-columns: 1fr;
}

.layout-medium {
  grid-template-columns: repeat(2, 1fr);
}

.layout-large {
  grid-template-columns: repeat(3, 1fr);
}

.layout-extra-large {
  grid-template-columns: repeat(4, 1fr);
}

.layout-item {
  padding: var(--ls-spacing-base, 16px);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: var(--ls-border-radius-base, 4px);
  text-align: center;
  font-weight: 500;
}

.layout-info {
  margin-top: var(--ls-spacing-base, 16px);
  padding: var(--ls-spacing-sm, 8px);
  background: var(--ls-bg-secondary, #f5f5f5);
  border-radius: var(--ls-border-radius-sm, 2px);
  font-size: var(--ls-font-size-sm, 14px);
}

/* 响应式字体 */
.font-examples {
  margin: var(--ls-spacing-base, 16px) 0;
}

.responsive-h1 {
  font-size: var(--ls-font-size-h1, 32px);
  margin: var(--ls-spacing-sm, 8px) 0;
  color: var(--ls-text-primary, #333);
}

.responsive-h2 {
  font-size: var(--ls-font-size-h2, 28px);
  margin: var(--ls-spacing-sm, 8px) 0;
  color: var(--ls-text-primary, #333);
}

.responsive-h3 {
  font-size: var(--ls-font-size-h3, 24px);
  margin: var(--ls-spacing-sm, 8px) 0;
  color: var(--ls-text-primary, #333);
}

.responsive-text {
  font-size: var(--ls-font-size-base, 16px);
  margin: var(--ls-spacing-sm, 8px) 0;
  color: var(--ls-text-primary, #333);
}

.responsive-small {
  font-size: var(--ls-font-size-sm, 14px);
  color: var(--ls-text-secondary, #666);
}

/* 响应式间距 */
.spacing-examples {
  margin: var(--ls-spacing-base, 16px) 0;
}

.spacing-item {
  background: var(--ls-bg-secondary, #f5f5f5);
  border-radius: var(--ls-border-radius-sm, 2px);
  font-size: var(--ls-font-size-sm, 14px);
  color: var(--ls-text-secondary, #666);
  margin-bottom: var(--ls-spacing-xs, 4px);
}

.spacing-xs {
  padding: var(--ls-spacing-xs, 4px);
}

.spacing-sm {
  padding: var(--ls-spacing-sm, 8px);
}

.spacing-base {
  padding: var(--ls-spacing-base, 16px);
}

.spacing-lg {
  padding: var(--ls-spacing-lg, 24px);
}

.spacing-xl {
  padding: var(--ls-spacing-xl, 32px);
}

/* 条件渲染 */
.conditional-content {
  margin: var(--ls-spacing-base, 16px) 0;
}

.size-content {
  padding: var(--ls-spacing-lg, 24px);
  border-radius: var(--ls-border-radius-lg, 8px);
  text-align: center;
}

.small-content {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
}

.medium-content {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.large-content {
  background: linear-gradient(135deg, #d299c2 0%, #fef9d7 100%);
}

.xl-content {
  background: linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%);
}

.size-content h4 {
  margin: 0 0 var(--ls-spacing-sm, 8px);
  font-size: var(--ls-font-size-lg, 18px);
}

.size-content p {
  margin: 0 0 var(--ls-spacing-base, 16px);
  font-size: var(--ls-font-size-sm, 14px);
}

.button-group {
  display: flex;
  gap: var(--ls-spacing-sm, 8px);
  justify-content: center;
}

@media (max-width: 768px) {
  .layout-large,
  .layout-extra-large {
    grid-template-columns: repeat(2, 1fr);
  }

  .button-group {
    flex-direction: column;
  }
}
</style>
