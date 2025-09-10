<template>
  <div class="home-page">
    <div class="hero-section">
      <h1>🚀 LDesign Editor</h1>
      <p>功能完整的企业级富文本编辑器</p>
      <div class="hero-stats">
        <div class="stat-item">
          <div class="stat-value">✨</div>
          <div class="stat-label">统一编辑器</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">🎯</div>
          <div class="stat-label">所有功能集成</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">🎨</div>
          <div class="stat-label">多主题支持</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">📱</div>
          <div class="stat-label">响应式设计</div>
        </div>
      </div>
    </div>

    <!-- 统一编辑器 -->
    <div class="editor-section">
      <UnifiedEditor />
    </div>
  </div>
</template>

<script setup lang="ts">
import UnifiedEditor from '../components/UnifiedEditor.vue'

console.log('🏠 统一编辑器主页已加载')
</script>

<style lang="less" scoped>
.home-page {
  padding: var(--ls-padding-base);
  max-width: 1400px;
  margin: 0 auto;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

.hero-section {
  text-align: center;
  margin-bottom: var(--ls-margin-lg);

  h1 {
    color: var(--ldesign-text-color-primary);
    margin-bottom: var(--ls-margin-sm);
    font-size: var(--ls-font-size-h1);
  }

  p {
    color: var(--ldesign-text-color-secondary);
    font-size: var(--ls-font-size-lg);
    margin-bottom: var(--ls-margin-base);
  }

  .hero-stats {
    display: flex;
    justify-content: center;
    gap: var(--ls-spacing-lg);
    flex-wrap: wrap;

    .stat-item {
      text-align: center;
      padding: var(--ls-padding-base);
      background: var(--ldesign-bg-color-component);
      border: 1px solid var(--ldesign-border-color);
      border-radius: var(--ls-border-radius-base);
      min-width: 120px;

      .stat-value {
        font-size: var(--ls-font-size-xl);
        font-weight: 600;
        color: var(--ldesign-brand-color);
        margin-bottom: var(--ls-margin-xs);
      }

      .stat-label {
        font-size: var(--ls-font-size-sm);
        color: var(--ldesign-text-color-secondary);
      }
    }
  }
}

.editor-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;

  :deep(.unified-editor) {
    height: 100%;
  }
}

@media (max-width: 768px) {
  .home-page {
    padding: var(--ls-padding-sm);
    height: calc(100vh - 80px);
  }

  .hero-section {
    margin-bottom: var(--ls-margin-base);

    h1 {
      font-size: var(--ls-font-size-h2);
    }

    p {
      font-size: var(--ls-font-size-base);
    }

    .hero-stats {
      gap: var(--ls-spacing-base);

      .stat-item {
        min-width: 100px;
        padding: var(--ls-padding-sm);
      }
    }
  }
}
</style>