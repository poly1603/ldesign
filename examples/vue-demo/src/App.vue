<script>
export default {
  name: 'App',
  data() {
    return {
      currentTheme: '',
      lastAction: '',
      features: [
        {
          icon: '🎨',
          title: '主题系统',
          description: '强大的主题管理功能，支持动态切换',
        },
        {
          icon: '🎭',
          title: '装饰元素',
          description: '丰富的装饰效果，营造节日氛围',
        },
        {
          icon: '🎬',
          title: '动画效果',
          description: '流畅的动画体验，提升用户感受',
        },
        {
          icon: '📱',
          title: '响应式设计',
          description: '完美适配各种设备和屏幕尺寸',
        },
        {
          icon: '⚡',
          title: '高性能',
          description: 'GPU 加速动画，智能资源管理',
        },
        {
          icon: '🔧',
          title: '易于集成',
          description: '简单的 API，快速集成到现有项目',
        },
      ],
    }
  },
  computed: {
    themeClass() {
      return this.currentTheme ? `theme-${this.currentTheme}` : ''
    },
    currentThemeInfo() {
      const themeMap = {
        'christmas': {
          displayName: '圣诞节主题',
          description:
            '温馨的红绿配色，营造浓厚的圣诞节日氛围。包含雪花飘落、圣诞树闪烁等动态装饰效果',
          colors: {
            primary: '#dc2626', // 圣诞红
            secondary: '#16a34a', // 圣诞绿
            accent: '#fbbf24', // 金色装饰
            background: '#fef7f0', // 暖白色背景
            surface: '#ffffff', // 纯白表面
            text: '#1f2937', // 深灰色文字
            border: '#fbbf24', // 金色边框
            success: '#16a34a', // 圣诞绿成功色
            warning: '#fbbf24', // 金色警告
            error: '#dc2626', // 圣诞红错误
          },
          decorations: ['🎄', '🎅', '❄️', '⭐', '🎁', '🔔'],
          atmosphere: '温馨节日',
          season: '冬季',
          timeRange: '12月-1月',
        },
        'spring-festival': {
          displayName: '春节主题',
          description:
            '喜庆的红金配色，展现中国传统节日的热闹氛围。包含灯笼摆动、烟花绽放、金币飘落等传统装饰',
          colors: {
            primary: '#dc2626', // 中国红
            secondary: '#fbbf24', // 金色
            accent: '#f59e0b', // 深金色
            background: '#fef3c7', // 淡金色背景
            surface: '#ffffff', // 纯白表面
            text: '#1f2937', // 深灰色文字
            border: '#fde68a', // 浅金色边框
            success: '#16a34a', // 绿色成功
            warning: '#fbbf24', // 金色警告
            error: '#dc2626', // 红色错误
          },
          decorations: ['🧧', '🐉', '🏮', '💰', '🎆', '🎊'],
          atmosphere: '喜庆热闹',
          season: '春季',
          timeRange: '1月-2月',
        },
        'halloween': {
          displayName: '万圣节主题',
          description:
            '神秘的橙黑配色，营造恐怖而有趣的万圣节氛围。包含南瓜灯闪烁、幽灵飘浮、蝙蝠飞行等诡异装饰',
          colors: {
            primary: '#ea580c', // 南瓜橙
            secondary: '#1f2937', // 深黑色
            accent: '#fbbf24', // 金色点缀
            background: '#1f2937', // 深黑色背景
            surface: '#374151', // 深灰色表面
            text: '#f9fafb', // 浅灰色文字
            border: '#4b5563', // 中灰色边框
            success: '#10b981', // 绿色成功
            warning: '#f59e0b', // 橙色警告
            error: '#ef4444', // 红色错误
          },
          decorations: ['🎃', '👻', '🦇', '🕷️', '🕸️', '💀'],
          atmosphere: '神秘恐怖',
          season: '秋季',
          timeRange: '10月-11月',
        },
      }
      return themeMap[this.currentTheme]
    },
  },
  mounted() {
    console.log('🎨 LDesign Theme Demo 已加载')
    this.lastAction = '页面加载完成'
  },
  methods: {
    onThemeChange() {
      this.lastAction = `切换到${
        this.currentThemeInfo?.displayName || '默认主题'
      }`
      console.log('主题切换到:', this.currentTheme || '默认主题')
    },
    handleAction(action) {
      const actionMap = {
        decoration: '添加装饰',
        animation: '开始动画',
        clear: '清空效果',
      }
      this.lastAction = `${actionMap[action]}功能演示`
      console.log(`${actionMap[action]}功能被触发`)

      // 这里可以集成实际的功能
      alert(`${actionMap[action]}功能演示 - 实际项目中这里会执行相应的功能`)
    },
    getThemeIcon(theme) {
      const iconMap = {
        'christmas': '🎄',
        'spring-festival': '🧧',
        'halloween': '🎃',
      }
      return iconMap[theme] || '🎨'
    },
  },
}
</script>

<template>
  <div id="app" :class="themeClass">
    <!-- 头部导航 -->
    <header class="app-header">
      <div class="container">
        <div class="header-content">
          <h1 class="logo">
            🎨 LDesign Theme Demo
          </h1>
          <div class="theme-selector">
            <select v-model="currentTheme" @change="onThemeChange">
              <option value="">
                默认主题
              </option>
              <option value="christmas">
                🎄 圣诞节
              </option>
              <option value="spring-festival">
                🧧 春节
              </option>
              <option value="halloween">
                🎃 万圣节
              </option>
            </select>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容 -->
    <main class="main-content">
      <div class="container">
        <!-- 英雄区域 -->
        <section class="hero-section">
          <h2 class="hero-title">
            欢迎使用 LDesign Theme
          </h2>
          <p class="hero-description">
            功能强大的主题系统，为你的 Vue 应用带来节日的魅力
          </p>

          <!-- 功能按钮 -->
          <div class="action-buttons">
            <button class="btn btn-primary" @click="handleAction('decoration')">
              ✨ 添加装饰
            </button>
            <button
              class="btn btn-secondary"
              @click="handleAction('animation')"
            >
              🎬 开始动画
            </button>
            <button class="btn btn-outline" @click="handleAction('clear')">
              🗑️ 清空效果
            </button>
          </div>

          <!-- 状态信息 -->
          <div class="status-panel">
            <div class="status-item">
              <span class="status-label">当前主题:</span>
              <span class="status-value">{{
                currentThemeInfo?.displayName || '默认主题'
              }}</span>
            </div>
            <div class="status-item">
              <span class="status-label">项目状态:</span>
              <span class="status-value success">✅ 运行正常</span>
            </div>
            <div v-if="lastAction" class="status-item">
              <span class="status-label">最后操作:</span>
              <span class="status-value">{{ lastAction }}</span>
            </div>
          </div>
        </section>

        <!-- 功能展示 -->
        <section class="features-section">
          <h3 class="section-title">
            核心功能
          </h3>
          <div class="features-grid">
            <div
              v-for="(feature, index) in features"
              :key="index"
              class="feature-card"
              :style="{ animationDelay: `${index * 0.1}s` }"
            >
              <div class="feature-icon">
                {{ feature.icon }}
              </div>
              <h4 class="feature-title">
                {{ feature.title }}
              </h4>
              <p class="feature-description">
                {{ feature.description }}
              </p>
            </div>
          </div>
        </section>

        <!-- 主题信息 -->
        <section v-if="currentThemeInfo" class="theme-info-section">
          <h3 class="section-title">
            主题详情
          </h3>
          <div class="theme-info-card">
            <div class="theme-header">
              <span class="theme-icon">{{ getThemeIcon(currentTheme) }}</span>
              <div class="theme-details">
                <h4>{{ currentThemeInfo.displayName }}</h4>
                <p>{{ currentThemeInfo.description }}</p>
                <div class="theme-meta">
                  <span class="meta-item">
                    <strong>氛围:</strong> {{ currentThemeInfo.atmosphere }}
                  </span>
                  <span class="meta-item">
                    <strong>季节:</strong> {{ currentThemeInfo.season }}
                  </span>
                  <span class="meta-item">
                    <strong>时间:</strong> {{ currentThemeInfo.timeRange }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 装饰元素展示 -->
            <div v-if="currentThemeInfo.decorations" class="theme-decorations">
              <h5>装饰元素</h5>
              <div class="decoration-list">
                <span
                  v-for="decoration in currentThemeInfo.decorations"
                  :key="decoration"
                  class="decoration-item"
                >
                  {{ decoration }}
                </span>
              </div>
            </div>

            <div class="theme-colors">
              <h5>配色方案</h5>
              <div class="color-palette">
                <div
                  v-for="(color, name) in currentThemeInfo.colors"
                  :key="name"
                  class="color-item"
                >
                  <div
                    class="color-swatch"
                    :style="{ backgroundColor: color }"
                  />
                  <span class="color-name">{{ name }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- 页脚 -->
    <footer class="app-footer">
      <div class="container">
        <p>&copy; 2024 LDesign Team. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* 组件样式在 style.css 中定义 */
</style>
