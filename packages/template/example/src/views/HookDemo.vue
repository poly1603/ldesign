<script setup lang="ts">
import { useTemplate, TemplateSelector } from '@ldesign/template'
import { computed, onMounted } from 'vue'

// 使用 useTemplate hook - 启用内置选择器
const {
  currentTemplate,
  currentComponent,
  loading: isLoading,
  error,
  switchTemplate,
  refreshTemplates,
  TemplateTransition,
  showSelector,
  selectorConfig,
  openSelector,
  closeSelector,
  availableTemplates,
} = useTemplate({
  category: 'login',
  enableCache: true,
  showSelector: false,  // 禁用自动弹出，改为手动触发
  selectorConfig: {
    theme: 'default',
    position: 'center',
    triggerStyle: 'dropdown',
    modalStyle: 'modal',
    animation: 'slide',
    showSearch: true,
    showTags: true,
    showSort: true,
  },
})

// 模板属性
const templateProps = computed(() => ({
  title: '用户登录',
  subtitle: '欢迎回来，请登录您的账户',
}))

// 初始化模板
onMounted(async () => {
  try {
    // 等待模板扫描完成
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 刷新模板列表
    await refreshTemplates()

    // 等待一下确保模板列表已更新
    await new Promise(resolve => setTimeout(resolve, 500))

    // 如果没有当前模板，尝试加载默认模板
    if (!currentTemplate.value) {
      await switchTemplate('default')
    }
  } catch (error) {
    console.error('初始化模板失败:', error)
  }
})
</script>

<template>
  <div class="demo-page">
    <div class="demo-header">
      <h1>Hook 方式演示</h1>
      <p>使用 useTemplate Composition API 管理和渲染模板</p>
    </div>

    <div class="demo-content">
      <!-- 控制面板 -->
      <div class="card">
        <div class="card__header">
          <h3>控制面板</h3>
        </div>
        <div class="card__body">
          <div class="control-panel">
            <div class="control-group">
              <div class="control-item">
                <label>Hook 方式演示</label>
                <p>使用 useTemplate hook 和内置模板选择器</p>
              </div>

              <!-- 模板选择器触发按钮 -->
              <div class="control-item">
                <button
                  class="template-selector-trigger"
                  @click="openSelector"
                  :class="{ 'template-selector-trigger--active': showSelector }"
                >
                  <span class="template-selector-trigger__icon">🎨</span>
                  <span class="template-selector-trigger__text">
                    {{ currentTemplate?.displayName || currentTemplate?.name || '选择模板' }}
                  </span>
                  <span class="template-selector-trigger__arrow">▼</span>
                </button>
              </div>
            </div>

            <div class="control-actions">
              <button class="btn btn-secondary" @click="refreshTemplates">
                刷新模板
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Hook 渲染区域 -->
      <div class="card">
        <div class="card__body">
          <!-- Hook 组件渲染区域 - 纯Hook方式 -->
          <div class="template-render-area">
            <TemplateTransition
              :current-component="currentComponent"
              :loading="isLoading"
              :error="error"
              :template-props="templateProps"
              :animation-config="{
                name: 'template-content',
                mode: 'out-in',
                appear: true
              }"
              @retry="refreshTemplates"
            >
              <template #loading>
                <div class="template-loading">
                  <div class="template-loading__spinner"></div>
                  <div class="template-loading__text">正在加载模板...</div>
                </div>
              </template>

              <template #error="{ error, retry }">
                <div class="template-error">
                  <div class="template-error__icon">⚠️</div>
                  <div class="template-error__title">加载失败</div>
                  <div class="template-error__message">{{ error || '未知错误' }}</div>
                  <div class="template-error__actions">
                    <button class="template-error__retry-btn" @click="retry">
                      <span class="retry-icon">🔄</span>
                      <span class="retry-text">重试</span>
                    </button>
                  </div>
                </div>
              </template>

              <template #empty>
                <div class="template-empty">
                  <div class="template-empty__icon">📄</div>
                  <div class="template-empty__title">没有找到模板</div>
                  <div class="template-empty__message">请检查模板配置或重新加载</div>
                  <button class="template-empty__action" @click="refreshTemplates">
                    重新加载
                  </button>
                </div>
              </template>
            </TemplateTransition>
          </div>
        </div>
      </div>
    </div>

    <!-- 模板选择器组件 -->
    <TemplateSelector
      :visible="showSelector"
      :templates="availableTemplates"
      :current-template="currentTemplate"
      :config="selectorConfig"
      category="login"
      device="desktop"
      @close="closeSelector"
      @select="switchTemplate"
    />
  </div>
</template>

<style scoped>
.demo-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.demo-header {
  text-align: center;
  margin-bottom: 2rem;
}

.demo-header h1 {
  color: #495057;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.demo-header p {
  color: #6c757d;
  font-size: 1rem;
}

/* 控制面板 */
.control-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.control-group label {
  color: #495057;
  font-weight: 500;
  font-size: 0.9rem;
}

.control-actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background: white;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.btn:hover {
  background: #f8f9fa;
  border-color: #adb5bd;
}

.btn-active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

/* 卡片样式 */
.card {
  background: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 2rem;
  overflow: hidden;
  transition: box-shadow 0.2s ease;
}

.card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.card__header {
  padding: 1.5rem 2rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.card__header h3 {
  margin: 0 0 1rem 0;
  color: #495057;
  font-weight: 600;
  font-size: 1.1rem;
}

.card__body {
  padding: 2rem;
}

.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
}

.template-render-area {
  width: 100%;
  min-height: 300px;
  position: relative;
  z-index: 1; /* 确保模板内容在选择器下方 */
}

/* Hook 模板选择器样式 */
.hook-template-selector {
  position: relative;
  margin-bottom: 1rem;
  z-index: 100; /* 确保选择器在模板内容之上 */
}

.template-selector-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #ffffff;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  color: #495057;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.template-selector-trigger:hover {
  border-color: #007bff;
  box-shadow: 0 2px 6px rgba(0, 123, 255, 0.15);
}

.selector-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 200; /* 确保下拉菜单在最上层 */
  margin-top: 4px;
}

.selector-option {
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f1f3f4;
}

.selector-option:last-child {
  border-bottom: none;
}

.selector-option:hover {
  background-color: #f8f9fa;
}

/* 下拉选择器动画 */
.selector-dropdown-enter-active {
  transition: all 250ms cubic-bezier(0.25, 0.8, 0.25, 1);
}

.selector-dropdown-leave-active {
  transition: all 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.selector-dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.selector-dropdown-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.selector-dropdown-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.selector-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

/* 模板内容动画 - 与组件方式保持一致 */
.template-content-enter-active {
  transition: all 400ms cubic-bezier(0.25, 0.8, 0.25, 1);
}

.template-content-leave-active {
  transition: all 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.template-content-enter-from {
  opacity: 0;
  transform: translateX(30px) scale(0.98);
}

.template-content-enter-to {
  opacity: 1;
  transform: translateX(0) scale(1);
}

.template-content-leave-from {
  opacity: 1;
  transform: translateX(0) scale(1);
}

.template-content-leave-to {
  opacity: 0;
  transform: translateX(-30px) scale(0.98);
}

/* 模板选择器触发按钮样式 */
.template-selector-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #ffffff;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  color: #495057;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-width: 200px;

  &:hover {
    border-color: #007bff;
    box-shadow: 0 2px 6px rgba(0, 123, 255, 0.15);
  }

  &--active {
    border-color: #007bff;
    background: #f8f9fa;
  }

  &__icon {
    font-size: 16px;
  }

  &__text {
    flex: 1;
    text-align: left;
    font-weight: 500;
  }

  &__arrow {
    font-size: 12px;
    transition: transform 0.2s ease;
  }

  &--active &__arrow {
    transform: rotate(180deg);
  }
}

/* 统一状态容器样式 */
.template-content-wrapper,
.template-content-loading,
.template-content-error,
.template-content-empty {
  width: 100%;
  min-height: 300px;
}

.template-content-loading,
.template-content-error,
.template-content-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  padding: 2rem;
  color: #6c757d;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .demo-page {
    padding: 1rem;
  }

  .control-panel {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .control-group {
    justify-content: center;
  }

  .control-actions {
    justify-content: center;
  }

  .template-container {
    padding: 1rem;
  }
}
</style>
