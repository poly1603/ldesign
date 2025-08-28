<template>
  <div id="app">
    <header class="app-header">
      <div class="header-top">
        <div class="header-content">
          <h1>🚀 Engine Router Demo</h1>
          <p>演示Engine与Router + I18n + Color + Size + Template的集成使用</p>
        </div>
        <div class="header-controls">
          <div class="language-switcher">
            <LanguageSwitcher />
          </div>
          <div class="size-switcher">
            <SizeSwitcher
              :style="'select'"
              :show-labels="true"
            />
          </div>
          <div class="theme-switcher">
            <ThemeColorPicker />
          </div>
        </div>
      </div>
    </header>

    <nav class="app-nav">
      <RouterLink
        to="/"
        class="nav-link"
      >
        {{ ($t as any)('nav.home') }}
      </RouterLink>
      <RouterLink
        to="/about"
        class="nav-link"
      >
        {{ ($t as any)('nav.about') }}
      </RouterLink>
      <RouterLink
        to="/features"
        class="nav-link"
      >
        {{ ($t as any)('nav.features') }}
      </RouterLink>
      <RouterLink
        to="/config"
        class="nav-link"
      >
        {{ ($t as any)('nav.config') }}
      </RouterLink>
      <RouterLink
        to="/login"
        class="nav-link"
      >
        {{ ($t as any)('nav.login') }}
      </RouterLink>
      <RouterLink
        to="/decrypt"
        class="nav-link"
      >
        {{ ($t as any)('nav.decrypt') }}
      </RouterLink>
    </nav>

    <main class="app-main">
      <RouterView transition="fade" />
    </main>

    <footer class="app-footer">
      <p>Powered by @ldesign/engine + @ldesign/router + @ldesign/i18n + @ldesign/color + @ldesign/size + @ldesign/template</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { LanguageSwitcher } from '@ldesign/i18n'
import { ThemeColorPicker } from '@ldesign/color'
import { SizeSwitcher } from '@ldesign/size'

// RouterLink和RouterView组件由Engine Router插件自动注册，无需手动导入
// LanguageSwitcher组件从@ldesign/i18n导入
// ThemeColorPicker组件从@ldesign/color导入
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  background: var(--color-background, #ffffff);
  color: var(--color-text, #1a202c);
  transition: all 0.3s ease;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: var(--size-base, 1rem);
  line-height: 1.6;
}

.app-header {
  background: linear-gradient(135deg, var(--color-primary, #3b82f6) 0%, var(--color-secondary, #8b5cf6) 100%);
  color: white;
  padding: var(--size-4xl, 2rem);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  gap: var(--size-lg, 1rem);
}

.header-content {
  text-align: left;
  flex: 1;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: var(--size-lg, 1rem);
  flex-wrap: wrap;
}

.language-switcher,
.size-switcher,
.theme-switcher {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  padding: var(--size-sm, 0.5rem);
  border-radius: var(--size-md, 8px);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.app-header h1 {
  margin: 0 0 var(--size-sm, 0.5rem) 0;
  font-size: var(--size-4xl, 2.5rem);
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.app-header p {
  margin: 0;
  opacity: 0.9;
  font-size: var(--size-lg, 1.1rem);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.app-nav {
  background: var(--color-surface, white);
  padding: var(--size-lg, 1rem);
  display: flex;
  gap: var(--size-lg, 1rem);
  justify-content: center;
  border-bottom: 1px solid var(--color-border, #e2e8f0);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
}

.nav-link {
  padding: var(--size-sm, 0.5rem) var(--size-lg, 1rem);
  text-decoration: none;
  color: var(--color-text-secondary, #4a5568);
  border-radius: var(--size-sm, 4px);
  transition: all 0.2s ease;
  font-size: var(--size-base, 1rem);
  font-weight: 500;
  white-space: nowrap;
}

.nav-link:hover {
  background: var(--color-muted, #f7fafc);
  color: var(--color-text, #1a202c);
  transform: translateY(-1px);
}

.nav-link.router-link-exact-active {
  background: var(--color-primary, #3b82f6);
  color: white;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.app-main {
  flex: 1;
  padding: var(--size-4xl, 2rem);
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  background: var(--color-background, #ffffff);
  min-height: 400px;
}

.app-footer {
  background: var(--color-surface, white);
  padding: var(--size-lg, 1rem);
  text-align: center;
  color: var(--color-text-secondary, #4a5568);
  border-top: 1px solid var(--color-border, #e2e8f0);
  font-size: var(--size-sm, 0.9rem);
}

.app-footer p {
  margin: 0;
}

/* RouterView内置动画的CSS样式 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(var(--size-lg, 20px));
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(calc(-1 * var(--size-lg, 20px)));
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-header {
    padding: var(--size-lg, 1rem);
  }

  .header-top {
    flex-direction: column;
    gap: var(--size-lg, 1rem);
    align-items: stretch;
  }

  .header-content {
    text-align: center;
  }

  .app-header h1 {
    font-size: var(--size-2xl, 1.5rem);
  }

  .app-header p {
    font-size: var(--size-base, 1rem);
  }

  .header-controls {
    justify-content: center;
    gap: var(--size-sm, 0.5rem);
  }

  .language-switcher,
  .size-switcher,
  .theme-switcher {
    padding: var(--size-xs, 0.25rem);
    font-size: var(--size-sm, 0.9rem);
  }

  .app-nav {
    padding: var(--size-sm, 0.5rem);
    gap: var(--size-sm, 0.5rem);
  }

  .nav-link {
    padding: var(--size-xs, 0.25rem) var(--size-sm, 0.5rem);
    font-size: var(--size-sm, 0.9rem);
  }

  .app-main {
    padding: var(--size-lg, 1rem);
  }

  .app-footer {
    padding: var(--size-sm, 0.5rem);
    font-size: var(--size-xs, 0.8rem);
  }
}

@media (max-width: 480px) {
  .header-controls {
    flex-direction: column;
    gap: var(--size-xs, 0.25rem);
  }

  .app-nav {
    flex-direction: column;
    align-items: center;
  }

  .nav-link {
    width: 100%;
    text-align: center;
    max-width: 200px;
  }
}
</style>
