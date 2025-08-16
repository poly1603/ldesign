const { createApp, ref, computed, onMounted } = Vue

console.log('🎨 LDesign Theme Vue Demo 启动中...')

// App 组件
const App = {
  setup() {
    // 当前主题
    const currentTheme = ref('christmas')

    // 主题类名
    const themeClass = computed(() => {
      return currentTheme.value ? `theme-${currentTheme.value}` : ''
    })

    // 演示卡片
    const demoCards = [
      { icon: '🎨', title: '主题系统', description: '强大的主题管理功能' },
      { icon: '🎭', title: '装饰元素', description: '丰富的装饰效果' },
      { icon: '🎬', title: '动画效果', description: '流畅的动画体验' },
    ]

    // 当前主题信息
    const currentThemeInfo = computed(() => {
      const themeMap = {
        'christmas': {
          displayName: '圣诞节主题',
          description: '温馨的红绿配色，营造浓厚的圣诞节日氛围',
          colors: {
            primary: '#dc2626',
            secondary: '#16a34a',
            accent: '#fbbf24',
            background: '#fef7f0',
          },
        },
        'spring-festival': {
          displayName: '春节主题',
          description: '喜庆的红金配色，展现中国传统节日的热闹氛围',
          colors: {
            primary: '#dc2626',
            secondary: '#fbbf24',
            accent: '#f59e0b',
            background: '#fef3c7',
          },
        },
        'halloween': {
          displayName: '万圣节主题',
          description: '神秘的橙黑配色，营造恐怖而有趣的万圣节氛围',
          colors: {
            primary: '#ea580c',
            secondary: '#1f2937',
            accent: '#fbbf24',
            background: '#1f2937',
          },
        },
      }
      return themeMap[currentTheme.value]
    })

    // 主题切换
    const onThemeChange = (event) => {
      currentTheme.value = event.target.value
      console.log('主题切换到:', currentTheme.value)
    }

    // 添加装饰
    const addDecoration = () => {
      console.log('添加装饰效果')
      alert('装饰功能演示 - 实际项目中这里会添加装饰元素')
    }

    // 开始动画
    const startAnimation = () => {
      console.log('开始动画效果')
      alert('动画功能演示 - 实际项目中这里会启动动画')
    }

    // 清空所有效果
    const clearAll = () => {
      console.log('清空所有效果')
      alert('清空功能演示 - 实际项目中这里会清空所有效果')
    }

    onMounted(() => {
      console.log('LDesign Theme Demo 已加载')
    })

    return {
      currentTheme,
      themeClass,
      demoCards,
      currentThemeInfo,
      onThemeChange,
      addDecoration,
      startAnimation,
      clearAll,
    }
  },
  template: `
    <div id="app" :class="themeClass">
      <!-- 简单的头部 -->
      <header class="app-header">
        <div class="container">
          <h1>🎨 LDesign Theme Demo</h1>
          <div class="theme-controls">
            <select :value="currentTheme" @change="onThemeChange">
              <option value="christmas">🎄 圣诞节</option>
              <option value="spring-festival">🧧 春节</option>
              <option value="halloween">🎃 万圣节</option>
            </select>
          </div>
        </div>
      </header>

      <!-- 主要内容 -->
      <main class="main-content">
        <div class="container">
          <section class="hero">
            <h2>欢迎使用 LDesign Theme</h2>
            <p>这是一个功能强大的主题系统演示项目</p>
            
            <!-- 主题按钮演示 -->
            <div class="button-demo">
              <button class="btn btn-primary" @click="addDecoration">
                ✨ 添加装饰
              </button>
              <button class="btn btn-secondary" @click="startAnimation">
                🎬 开始动画
              </button>
              <button class="btn btn-outline" @click="clearAll">
                🗑️ 清空效果
              </button>
            </div>
            
            <!-- 状态显示 -->
            <div class="status-info">
              <p>当前主题: <strong>{{ currentThemeInfo?.displayName || '默认主题' }}</strong></p>
              <p>项目状态: <span style="color: #16a34a;">✅ 运行正常</span></p>
            </div>
          </section>

          <!-- 演示区域 -->
          <section class="demo-area">
            <div class="demo-cards">
              <div 
                v-for="(card, index) in demoCards" 
                :key="index"
                class="demo-card"
                :style="{ animationDelay: index * 0.1 + 's' }"
              >
                <div class="card-icon">{{ card.icon }}</div>
                <h3>{{ card.title }}</h3>
                <p>{{ card.description }}</p>
              </div>
            </div>
          </section>

          <!-- 当前主题信息 -->
          <section class="theme-info">
            <h3>当前主题: {{ currentThemeInfo?.displayName }}</h3>
            <p>{{ currentThemeInfo?.description }}</p>
            <div class="theme-colors">
              <div 
                v-for="(color, name) in currentThemeInfo?.colors" 
                :key="name"
                class="color-item"
              >
                <div class="color-swatch" :style="{ backgroundColor: color }"></div>
                <span>{{ name }}</span>
              </div>
            </div>
          </section>
        </div>
      </main>

      <!-- 简单的页脚 -->
      <footer class="app-footer">
        <div class="container">
          <p>&copy; 2024 LDesign Team. All rights reserved.</p>
        </div>
      </footer>
    </div>
  `,
}

// 创建并挂载应用
createApp(App).mount('#app')
