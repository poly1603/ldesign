<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTheme, useThemeSelector } from '@ldesign/color/vue'
import { generateColorScales, generateColorConfig } from '@ldesign/color'
import ColorPaletteCard from './components/ColorPaletteCard.vue'

const { currentTheme, currentMode, availableThemes, setTheme, setMode, toggleMode } = useTheme()
const { themeConfigs } = useThemeSelector()

// 获取当前主题配置
const currentThemeConfig = computed(() => {
  return themeConfigs.value.find(t => t.name === currentTheme.value)
})

// 获取当前主题的颜色配置
const currentColors = computed(() => {
  const config = currentThemeConfig.value
  if (!config) return null

  const modeColors = currentMode.value === 'light' ? config.light : config.dark
  if (!modeColors) return null

  // 如果主题配置中没有定义完整的颜色，使用生成的颜色配置
  let generatedColors = null
  try {
    generatedColors = generateColorConfig(modeColors.primary)
  } catch (error) {
    console.warn('生成颜色配置失败:', error)
  }

  return {
    primary: modeColors.primary,
    success: modeColors.success || generatedColors?.success || '#52c41a',
    warning: modeColors.warning || generatedColors?.warning || '#faad14',
    danger: modeColors.danger || generatedColors?.danger || '#f5222d',
    gray: modeColors.gray || generatedColors?.gray || '#8c8c8c',
  }
})

// 获取主题的预览颜色（使用生成的完整颜色配置）
const getThemePreviewColors = (themeName: string) => {
  const themeConfig = themeConfigs.value.find(t => t.name === themeName)
  if (!themeConfig) return null

  // 使用主题管理器生成完整的颜色配置
  try {
    const colors = generateColorConfig(themeConfig.light.primary)
    return {
      primary: themeConfig.light.primary,
      success: colors.success || '#52c41a',
      warning: colors.warning || '#faad14',
      danger: colors.danger || '#f5222d',
    }
  } catch (error) {
    // 降级到默认颜色
    return {
      primary: themeConfig.light.primary,
      success: '#52c41a',
      warning: '#faad14',
      danger: '#f5222d',
    }
  }
}

// 生成当前主题的色阶
const currentScales = computed(() => {
  if (!currentColors.value) return null

  try {
    return generateColorScales(currentColors.value, currentMode.value)
  } catch (error) {
    console.warn('生成色阶失败:', error)
    return null
  }
})

// 通知系统
const notifications = ref<Array<{id: number, message: string, type: string}>>([])
let notificationId = 0

const showNotification = (message: string, type: string = 'info') => {
  const id = ++notificationId
  notifications.value.push({ id, message, type })
  setTimeout(() => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }, 3000)
}

// 复制颜色值
const copyColor = async (color: string) => {
  try {
    await navigator.clipboard.writeText(color)
    showNotification(`已复制颜色值: ${color}`, 'success')
  } catch (error) {
    showNotification('复制失败', 'error')
  }
}

// 获取颜色类型名称
const getColorTypeName = (colorType: string) => {
  const nameMap: Record<string, string> = {
    primary: '主色调',
    success: '成功色',
    warning: '警告色',
    danger: '危险色',
    gray: '灰色',
  }
  return nameMap[colorType] || colorType
}

onMounted(() => {
  showNotification('Vue 示例已加载完成！', 'success')
})
</script>

<template>
  <div class="app">
    <!-- 头部 -->
    <header class="header">
      <h1>@ldesign/color</h1>
      <p>Vue 3 示例演示</p>
    </header>

    <!-- 主要内容 -->
    <main class="main">
      <div class="container">
        <!-- 主题控制面板 -->
        <section class="card">
          <h2 class="card-title">🎛️ 主题控制</h2>

          <div class="control-group">
            <label>选择主题:</label>
            <select
              :value="currentTheme"
              @change="setTheme(($event.target as HTMLSelectElement).value)"
              class="form-control"
            >
              <option
                v-for="themeName in availableThemes"
                :key="themeName"
                :value="themeName"
              >
                {{ themeConfigs.find(t => t.name === themeName)?.displayName || themeName }}
              </option>
            </select>
          </div>

          <div class="control-group">
            <label>颜色模式:</label>
            <select
              :value="currentMode"
              @change="setMode(($event.target as HTMLSelectElement).value as any)"
              class="form-control"
            >
              <option value="light">亮色模式</option>
              <option value="dark">暗色模式</option>
            </select>
          </div>

          <div class="control-group">
            <button @click="toggleMode" class="btn btn-primary">切换模式</button>
          </div>

          <div class="status-info">
            <div class="status-item">
              <span class="label">当前主题:</span>
              <span class="value">{{ currentTheme }}</span>
            </div>
            <div class="status-item">
              <span class="label">当前模式:</span>
              <span class="value">{{ currentMode }}</span>
            </div>
          </div>
        </section>

        <!-- 主题预览 -->
        <section class="card">
          <h2 class="card-title">🎨 主题预览</h2>
          <p class="card-description">选择一个预设主题来快速应用，这些主题都是精心设计的美观配色方案</p>

          <div class="theme-grid">
            <div
              v-for="themeName in availableThemes"
              :key="themeName"
              :class="['theme-item', { active: currentTheme === themeName }]"
              @click="setTheme(themeName)"
            >
              <div class="theme-preview">
                <div class="theme-color" :style="{ backgroundColor: getThemePreviewColors(themeName)?.primary || '#1890ff' }"></div>
                <div class="theme-color" :style="{ backgroundColor: getThemePreviewColors(themeName)?.success || '#52c41a' }"></div>
                <div class="theme-color" :style="{ backgroundColor: getThemePreviewColors(themeName)?.warning || '#faad14' }"></div>
                <div class="theme-color" :style="{ backgroundColor: getThemePreviewColors(themeName)?.danger || '#f5222d' }"></div>
              </div>
              <div class="theme-name">{{ themeConfigs.find(t => t.name === themeName)?.displayName || themeName }}</div>
              <div class="theme-description">{{ themeConfigs.find(t => t.name === themeName)?.description || '精美的主题配色方案' }}</div>
            </div>
          </div>
        </section>

        <!-- 当前主题色阶展示 -->
        <section class="card">
          <h2 class="card-title">� 当前主题色阶</h2>
          <p class="card-description">当前主题 "{{ currentThemeConfig?.displayName || currentTheme }}" 在 {{ currentMode === 'light' ? '亮色' : '暗色' }} 模式下的完整色阶体系</p>

          <div v-if="currentScales" class="palette-showcase">
            <ColorPaletteCard
              v-for="(scale, colorType) in currentScales"
              :key="colorType"
              :title="getColorTypeName(colorType)"
              :subtitle="colorType"
              :base-name="`${colorType}-6`"
              :color-name="colorType"
              :base-color="scale.colors?.[5] || '#000000'"
              :colors="scale.colors || []"
            />
          </div>

          <div v-else class="no-scales">
            <p>无法生成当前主题的色阶，请检查主题配置</p>
          </div>
        </section>
      </div>
    </main>

    <!-- 底部 -->
    <footer class="footer">
      <p>&copy; 2024 ldesign. 基于 MIT 许可证开源。</p>
    </footer>

    <!-- 通知 -->
    <div
      v-for="notification in notifications"
      :key="notification.id"
      :class="['notification', notification.type]"
    >
      {{ notification.message }}
    </div>
  </div>
</template>

<style>
@import './styles/shared-styles.css';

.palette-showcase {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 20px;
}

.no-scales {
  text-align: center;
  padding: 40px;
  color: #666;
  background: #f5f5f5;
  border-radius: 8px;
  margin-top: 20px;
}

@media (prefers-color-scheme: dark) {
  .no-scales {
    background: #2a2a2a;
    color: #ccc;
  }
}
</style>
