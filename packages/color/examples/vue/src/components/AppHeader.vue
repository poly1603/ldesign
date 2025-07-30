<script setup lang="ts">
import { useTheme } from '@ldesign/color/vue'

const {
  currentTheme,
  currentMode,
  isDark,
  availableThemes,
  toggleMode,
} = useTheme()
</script>

<template>
  <header class="header">
    <div class="container">
      <div class="header-content">
        <div class="logo-section">
          <h1 class="title">
            @ldesign/color
          </h1>
          <p class="subtitle">
            Vue 3 集成示例
          </p>
        </div>

        <div class="header-actions">
          <button
            class="btn btn-secondary btn-sm"
            :title="`切换到${isDark ? '亮色' : '暗色'}模式`"
            @click="toggleMode"
          >
            <span class="icon">{{ isDark ? '☀️' : '🌙' }}</span>
            {{ isDark ? '亮色' : '暗色' }}
          </button>

          <a
            href="https://github.com/ldesign/color"
            target="_blank"
            class="btn btn-secondary btn-sm"
            title="查看 GitHub 仓库"
          >
            <span class="icon">📚</span>
            GitHub
          </a>
        </div>
      </div>

      <!-- 状态栏 -->
      <div class="status-bar">
        <div class="status-item">
          <span class="label">当前主题:</span>
          <span class="value">{{ currentTheme }}</span>
        </div>
        <div class="status-item">
          <span class="label">当前模式:</span>
          <span class="value">{{ currentMode }}</span>
        </div>
        <div class="status-item">
          <span class="label">可用主题:</span>
          <span class="value">{{ availableThemes.length }} 个</span>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  background: var(--color-primary, #1890ff);
  color: white;
  padding: 1.5rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.logo-section {
  flex: 1;
}

.title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  background: linear-gradient(45deg, #ffffff, #e6f7ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 1rem;
  opacity: 0.9;
  font-weight: 400;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.header-actions .btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.header-actions .btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.icon {
  font-size: 1rem;
}

.status-bar {
  display: flex;
  gap: 2rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.label {
  opacity: 0.8;
  font-weight: 500;
}

.value {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  background: rgba(255, 255, 255, 0.15);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
}

@media (max-width: 768px) {
  .header {
    padding: 1rem 0;
  }

  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .title {
    font-size: 1.5rem;
  }

  .status-bar {
    flex-direction: column;
    gap: 0.5rem;
  }

  .status-item {
    justify-content: space-between;
  }
}
</style>
