<script setup lang="ts">
import type { SizeMode } from '../../../../src/types'
import {
  SizeControlPanel,
  SizeIndicator,
  SizeSwitcher,
} from '../../../../src/vue'
import CustomButton from './CustomButton.vue'
import CustomCard from './CustomCard.vue'

function handleSwitcherChange(mode: SizeMode) {
  console.log('切换器变化:', mode)
}

function handlePanelChange(mode: SizeMode) {
  console.log('面板变化:', mode)
}
</script>

<template>
  <div class="component-demo">
    <div class="demo-grid">
      <!-- 尺寸切换器组件 -->
      <div class="demo-card">
        <h3>SizeSwitcher 组件</h3>
        <p>不同样式的尺寸切换器</p>

        <div class="switcher-examples">
          <div class="example-item">
            <h4>按钮样式</h4>
            <SizeSwitcher
              switcher-style="button"
              @change="handleSwitcherChange"
            />
          </div>

          <div class="example-item">
            <h4>下拉选择样式</h4>
            <SizeSwitcher
              switcher-style="select"
              @change="handleSwitcherChange"
            />
          </div>

          <div class="example-item">
            <h4>单选框样式</h4>
            <SizeSwitcher
              switcher-style="radio"
              @change="handleSwitcherChange"
            />
          </div>
        </div>
      </div>

      <!-- 尺寸指示器组件 -->
      <div class="demo-card">
        <h3>SizeIndicator 组件</h3>
        <p>显示当前尺寸状态</p>

        <div class="indicator-examples">
          <div class="example-item">
            <h4>基础指示器</h4>
            <SizeIndicator />
          </div>

          <div class="example-item">
            <h4>显示缩放信息</h4>
            <SizeIndicator :show-scale="true" />
          </div>

          <div class="example-item">
            <h4>自定义样式</h4>
            <SizeIndicator
              class="custom-indicator"
              :show-mode="true"
              :show-scale="true"
            />
          </div>
        </div>
      </div>

      <!-- 尺寸控制面板组件 -->
      <div class="demo-card">
        <h3>SizeControlPanel 组件</h3>
        <p>完整的尺寸控制面板</p>

        <div class="panel-examples">
          <div class="example-item">
            <h4>完整面板</h4>
            <SizeControlPanel
              :show-switcher="true"
              :show-indicator="true"
              switcher-style="button"
              @change="handlePanelChange"
            />
          </div>

          <div class="example-item">
            <h4>仅切换器</h4>
            <SizeControlPanel
              :show-switcher="true"
              :show-indicator="false"
              switcher-style="select"
            />
          </div>

          <div class="example-item">
            <h4>仅指示器</h4>
            <SizeControlPanel :show-switcher="false" :show-indicator="true" />
          </div>
        </div>
      </div>

      <!-- 自定义组件示例 -->
      <div class="demo-card">
        <h3>自定义组件</h3>
        <p>基于尺寸系统的自定义组件</p>

        <div class="custom-components">
          <CustomButton>自定义按钮</CustomButton>
          <CustomCard title="自定义卡片">
            <p>这是一个响应尺寸变化的自定义卡片组件</p>
            <CustomButton size="small">
              小按钮
            </CustomButton>
            <CustomButton size="large">
              大按钮
            </CustomButton>
          </CustomCard>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.component-demo {
  /* 样式继承自全局 */
}

.switcher-examples,
.indicator-examples,
.panel-examples {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-lg, 24px);
  margin-top: var(--ls-spacing-base, 16px);
}

.example-item {
  padding: var(--ls-spacing-base, 16px);
  border: 1px solid var(--ls-border-light, #f0f0f0);
  border-radius: var(--ls-border-radius-base, 4px);
  background: var(--ls-bg-primary, #fff);
}

.example-item h4 {
  font-size: var(--ls-font-size-base, 16px);
  margin-bottom: var(--ls-spacing-sm, 8px);
  color: var(--ls-text-primary, #333);
}

.custom-indicator {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: var(--ls-spacing-sm, 8px) var(--ls-spacing-base, 16px);
  border-radius: var(--ls-border-radius-lg, 8px);
}

.custom-components {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-base, 16px);
  margin-top: var(--ls-spacing-base, 16px);
}

@media (max-width: 768px) {
  .switcher-examples,
  .indicator-examples,
  .panel-examples {
    gap: var(--ls-spacing-base, 16px);
  }
}
</style>
