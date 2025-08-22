<script setup lang="ts">
import {
  useSize,
  useSizeResponsive,
  useSizeSwitcher,
} from '../../../../src/vue'

// 基础 useSize Hook
const {
  currentMode,
  currentConfig,
  currentModeDisplayName,
  setMode,
  nextMode,
  previousMode,
} = useSize({ global: true })

// useSizeSwitcher Hook
const {
  currentMode: switcherCurrentMode,
  currentConfig: switcherCurrentConfig,
  currentModeDisplayName: switcherCurrentModeDisplayName,
  availableModes,
  switchToMode,
  getModeDisplayName,
} = useSizeSwitcher({ global: true })

// useSizeResponsive Hook
const { isSmall, isMedium, isLarge, isExtraLarge, isAtLeast, isAtMost }
  = useSizeResponsive()

// 自定义管理器
const {
  currentMode: customCurrentMode,
  currentModeDisplayName: customCurrentModeDisplayName,
  setMode: customSetMode,
} = useSize({
  global: false,
  initialMode: 'large',
  autoInject: false, // 不注入CSS，避免冲突
})
</script>

<template>
  <div class="composition-demo">
    <div class="demo-grid">
      <!-- useSize Hook -->
      <div class="demo-card">
        <h3>useSize Hook</h3>
        <p>基础的尺寸管理Hook</p>

        <div class="info-list">
          <div class="info-item">
            <span class="label">当前模式:</span>
            <span class="value">{{ currentMode }} ({{ currentModeDisplayName }})</span>
          </div>
          <div class="info-item">
            <span class="label">基础字体:</span>
            <span class="value">{{ currentConfig.fontSize.base }}</span>
          </div>
          <div class="info-item">
            <span class="label">基础间距:</span>
            <span class="value">{{ currentConfig.spacing.base }}</span>
          </div>
        </div>

        <div class="demo-actions">
          <button class="btn btn-secondary" @click="previousMode">
            上一个
          </button>
          <button class="btn btn-secondary" @click="nextMode">
            下一个
          </button>
        </div>
      </div>

      <!-- useSizeSwitcher Hook -->
      <div class="demo-card">
        <h3>useSizeSwitcher Hook</h3>
        <p>带切换功能的尺寸管理Hook</p>

        <div class="switcher-demo">
          <div class="mode-buttons">
            <button
              v-for="mode in availableModes"
              :key="mode"
              class="mode-btn"
              :class="[{ active: switcherCurrentMode === mode }]"
              @click="switchToMode(mode)"
            >
              {{ getModeDisplayName(mode) }}
            </button>
          </div>

          <div class="current-info">
            <p>当前: {{ switcherCurrentModeDisplayName }}</p>
            <p>
              按钮高度:
              {{ switcherCurrentConfig.component.buttonHeight.medium }}
            </p>
          </div>
        </div>
      </div>

      <!-- useSizeResponsive Hook -->
      <div class="demo-card">
        <h3>useSizeResponsive Hook</h3>
        <p>响应式尺寸检测Hook</p>

        <div class="responsive-info">
          <div class="responsive-item" :class="{ active: isSmall }">
            <span class="dot" />
            小尺寸 (Small)
          </div>
          <div class="responsive-item" :class="{ active: isMedium }">
            <span class="dot" />
            中尺寸 (Medium)
          </div>
          <div class="responsive-item" :class="{ active: isLarge }">
            <span class="dot" />
            大尺寸 (Large)
          </div>
          <div class="responsive-item" :class="{ active: isExtraLarge }">
            <span class="dot" />
            超大尺寸 (Extra Large)
          </div>
        </div>

        <div class="responsive-checks">
          <p>至少中等尺寸: {{ isAtLeast('medium') ? '是' : '否' }}</p>
          <p>最多大尺寸: {{ isAtMost('large') ? '是' : '否' }}</p>
        </div>
      </div>

      <!-- 自定义管理器 -->
      <div class="demo-card">
        <h3>自定义管理器</h3>
        <p>创建独立的尺寸管理器实例</p>

        <div class="custom-manager">
          <div class="info-item">
            <span class="label">独立模式:</span>
            <span class="value">{{ customCurrentMode }} ({{
              customCurrentModeDisplayName
            }})</span>
          </div>

          <div class="demo-actions">
            <button class="btn btn-primary" @click="customSetMode('small')">
              小
            </button>
            <button class="btn btn-primary" @click="customSetMode('medium')">
              中
            </button>
            <button class="btn btn-primary" @click="customSetMode('large')">
              大
            </button>
          </div>

          <p class="note">
            注意：这个管理器独立于全局管理器
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.composition-demo {
  /* 样式继承自全局 */
}

.info-list {
  margin: var(--ls-spacing-base, 16px) 0;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--ls-spacing-xs, 4px) 0;
  border-bottom: 1px solid var(--ls-border-light, #f0f0f0);
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: 500;
  color: var(--ls-text-secondary, #666);
}

.value {
  font-family: monospace;
  background: var(--ls-bg-secondary, #f5f5f5);
  padding: 2px 6px;
  border-radius: var(--ls-border-radius-sm, 2px);
  font-size: var(--ls-font-size-xs, 12px);
}

.mode-buttons {
  display: flex;
  gap: var(--ls-spacing-xs, 4px);
  margin-bottom: var(--ls-spacing-base, 16px);
}

.mode-btn {
  flex: 1;
  padding: var(--ls-spacing-xs, 4px) var(--ls-spacing-sm, 8px);
  border: 1px solid var(--ls-border-default, #d9d9d9);
  background: var(--ls-bg-primary, #fff);
  border-radius: var(--ls-border-radius-sm, 2px);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: var(--ls-font-size-xs, 12px);
}

.mode-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.mode-btn.active {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
}

.current-info p {
  margin: var(--ls-spacing-xs, 4px) 0;
  font-size: var(--ls-font-size-sm, 14px);
}

.responsive-info {
  margin: var(--ls-spacing-base, 16px) 0;
}

.responsive-item {
  display: flex;
  align-items: center;
  padding: var(--ls-spacing-xs, 4px) 0;
  opacity: 0.5;
  transition: opacity 0.2s ease;
}

.responsive-item.active {
  opacity: 1;
  font-weight: 500;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--ls-border-default, #d9d9d9);
  margin-right: var(--ls-spacing-sm, 8px);
  transition: background 0.2s ease;
}

.responsive-item.active .dot {
  background: #52c41a;
}

.responsive-checks {
  margin-top: var(--ls-spacing-base, 16px);
  padding-top: var(--ls-spacing-base, 16px);
  border-top: 1px solid var(--ls-border-light, #f0f0f0);
}

.responsive-checks p {
  margin: var(--ls-spacing-xs, 4px) 0;
  font-size: var(--ls-font-size-sm, 14px);
}

.custom-manager {
  /* 样式继承 */
}

.note {
  margin-top: var(--ls-spacing-base, 16px);
  padding: var(--ls-spacing-sm, 8px);
  background: #fff7e6;
  border: 1px solid #ffd591;
  border-radius: var(--ls-border-radius-sm, 2px);
  font-size: var(--ls-font-size-xs, 12px);
  color: #d46b08;
}
</style>
