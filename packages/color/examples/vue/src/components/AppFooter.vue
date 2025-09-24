<script setup lang="ts">
import { useTheme } from '@ldesign/color/vue'
import { computed } from 'vue'

const { availableThemes } = useTheme()

const buildTime = computed(() => {
  return new Date().toLocaleDateString('zh-CN')
})
</script>

<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-info">
          <p>&copy; 2024 ldesign. 基于 MIT 许可证开源。</p>
          <p class="footer-description">这是一个 @ldesign/color 的 Vue 3 集成示例，展示了完整的主题管理功能。</p>
        </div>

        <div class="footer-links">
          <a href="https://github.com/ldesign/color" target="_blank" class="footer-link"> 📚 GitHub </a>
          <a href="https://www.npmjs.com/package/@ldesign/color" target="_blank" class="footer-link"> 📦 NPM </a>
          <a href="/color/docs/" target="_blank" class="footer-link"> 📖 文档 </a>
        </div>
      </div>

      <div class="footer-stats">
        <div class="stat">
          <span class="stat-label">当前版本</span>
          <span class="stat-value">v0.1.0</span>
        </div>
        <div class="stat">
          <span class="stat-label">构建时间</span>
          <span class="stat-value">{{ buildTime }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">主题数量</span>
          <span class="stat-value">{{ availableThemes.length }}</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--color-gray-1, #fafafa);
  border-top: 1px solid var(--color-border, #e8e8e8);
  padding: 2rem 0 1rem;
  margin-top: 3rem;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.footer-info {
  flex: 1;
}

.footer-info p {
  margin-bottom: 0.5rem;
  color: var(--color-text, #333);
}

.footer-description {
  font-size: 0.875rem;
  color: var(--color-text-secondary, #666);
  max-width: 500px;
  line-height: 1.5;
}

.footer-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.footer-link {
  color: var(--color-primary, #1890ff);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: var(--color-primary-hover, #40a9ff);
}

.footer-stats {
  display: flex;
  gap: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border, #e8e8e8);
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary, #666);
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text, #333);
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
}

@media (max-width: 768px) {
  .footer {
    padding: 1.5rem 0 1rem;
  }

  .footer-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .footer-links {
    justify-content: center;
  }

  .footer-stats {
    justify-content: center;
    gap: 1rem;
  }
}
</style>
