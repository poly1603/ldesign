<template>
  <div class="advanced-features">
    <header>
      <h1>🚀 Lottie 高级功能演示</h1>
      <p>Vue 3 版本</p>
    </header>

    <div class="grid">
      <!-- 1. 过渡效果示例 -->
      <div class="card">
        <h2>✨ 过渡效果</h2>
        <p class="description">为动画添加各种入场和出场过渡效果</p>
        <div ref="transitionContainer" class="lottie-container"></div>
        <div class="controls">
          <button @click="applyFadeIn">淡入</button>
          <button @click="applySlideIn">滑入</button>
          <button @click="applyScale">缩放</button>
          <button @click="applyRotate">旋转</button>
        </div>
        <div class="badge">12+ 内置缓动函数</div>
      </div>

      <!-- 2. 主题系统示例 -->
      <div class="card">
        <h2>🎨 主题系统</h2>
        <p class="description">动态切换颜色主题，调整亮度和饱和度</p>
        <div ref="themeContainer" class="lottie-container"></div>
        <div class="theme-selector">
          <button 
            :class="['theme-btn', 'theme-light', { active: currentTheme === 'light' }]"
            @click="switchTheme('light')"
          >
            浅色
          </button>
          <button 
            :class="['theme-btn', 'theme-dark', { active: currentTheme === 'dark' }]"
            @click="switchTheme('dark')"
          >
            深色
          </button>
          <button 
            :class="['theme-btn', 'theme-sunset', { active: currentTheme === 'sunset' }]"
            @click="switchTheme('sunset')"
          >
            夕阳
          </button>
        </div>
        <div class="controls">
          <button @click="adjustBrightness">增亮</button>
          <button @click="adjustSaturation">增饱和</button>
          <button @click="applyHueShift">色调偏移</button>
        </div>
      </div>

      <!-- 3. 数据绑定示例 -->
      <div class="card">
        <h2>📊 数据绑定</h2>
        <p class="description">实时数据驱动动画属性变化</p>
        <div ref="dataBindingContainer" class="lottie-container"></div>
        <div class="data-inputs">
          <div class="data-input">
            <label>透明度:</label>
            <input
              v-model.number="opacity"
              type="range"
              min="0"
              max="1"
              step="0.1"
              @input="updateOpacity"
            />
            <span>{{ opacity.toFixed(1) }}</span>
          </div>
          <div class="data-input">
            <label>缩放:</label>
            <input
              v-model.number="scale"
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              @input="updateScale"
            />
            <span>{{ scale.toFixed(1) }}</span>
          </div>
        </div>
        <div class="badge">响应式数据更新</div>
      </div>

      <!-- 4. 手势控制示例 -->
      <div class="card">
        <h2>👆 手势控制</h2>
        <p class="description">支持触摸、滑动、捏合、旋转手势</p>
        <div 
          ref="gestureContainer" 
          class="lottie-container" 
          style="border: 2px dashed #667eea; cursor: pointer;"
        >
          <div v-if="!gestureInstance" style="text-align: center; color: #999;">
            <p>👆 触摸此区域</p>
            <p style="font-size: 12px;">轻触播放/暂停，滑动跳转</p>
          </div>
        </div>
        <div class="info">
          <strong>可用手势:</strong><br />
          • 轻触: 播放/暂停<br />
          • 左右滑动: 跳转帧<br />
          • 双指捏合: 缩放（移动端）<br />
          • 双指旋转: 旋转（移动端）
        </div>
      </div>

      <!-- 5. 预加载队列示例 -->
      <div class="card">
        <h2>⚡ 预加载队列</h2>
        <p class="description">智能管理多个动画的批量加载</p>
        <div class="lottie-container">
          <div style="text-align: center;">
            <p style="font-size: 48px; margin-bottom: 10px;">🔄</p>
            <p style="color: #666;">{{ preloadStatus }}</p>
          </div>
        </div>
        <div class="controls">
          <button @click="startPreload">开始预加载</button>
          <button @click="pausePreload">暂停</button>
          <button @click="showProgress">查看进度</button>
        </div>
        <div class="info">
          <strong>进度:</strong> {{ preloadProgress }}%<br />
          <strong>状态:</strong> {{ preloadState }}
        </div>
      </div>

      <!-- 6. 无障碍支持示例 -->
      <div class="card">
        <h2>♿ 无障碍支持</h2>
        <p class="description">键盘导航和屏幕阅读器支持</p>
        <div ref="accessibilityContainer" class="lottie-container" tabindex="0"></div>
        <div class="info">
          <strong>键盘快捷键:</strong><br />
          • <kbd>空格</kbd>: 播放/暂停<br />
          • <kbd>←</kbd> / <kbd>→</kbd>: 快退/快进<br />
          • <kbd>Home</kbd> / <kbd>End</kbd>: 首/末帧<br />
          • <kbd>R</kbd>: 重新播放
        </div>
        <div class="badge">符合 WCAG 2.1 标准</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useLottie } from '../../../src/adapters/vue'
import {
  TransitionManager,
  ThemeManager,
  DataBinding,
  GestureController,
  PreloadQueue,
  AccessibilityManager
} from '../../../src'

// 1. 过渡效果
const transitionContainer = ref<HTMLElement>()
const transitionInstance = ref<any>(null)
const transitionManager = ref<TransitionManager | null>(null)

const transitionLottie = useLottie({
  container: transitionContainer,
  path: '/success-checkmark.json',
  autoplay: false,
  loop: false
})

onMounted(() => {
  if (transitionLottie.instance.value) {
    transitionInstance.value = transitionLottie.instance.value
    transitionManager.value = new TransitionManager(transitionInstance.value)
  }
})

const applyFadeIn = async () => {
  if (transitionManager.value) {
    await transitionManager.value.fadeIn(600, 'easeOut')
    transitionInstance.value?.play()
  }
}

const applySlideIn = async () => {
  if (transitionManager.value) {
    await transitionManager.value.slideIn('left', 500)
    transitionInstance.value?.play()
  }
}

const applyScale = async () => {
  if (transitionManager.value) {
    await transitionManager.value.scale(0, 1, 500, 'easeOutBack')
    transitionInstance.value?.play()
  }
}

const applyRotate = async () => {
  if (transitionManager.value) {
    await transitionManager.value.rotate(0, 360, 800, 'easeInOut')
    transitionInstance.value?.play()
  }
}

// 2. 主题系统
const themeContainer = ref<HTMLElement>()
const themeInstance = ref<any>(null)
const themeManagerInstance = ref<ThemeManager | null>(null)
const currentTheme = ref<string>('light')

const themeLottie = useLottie({
  container: themeContainer,
  path: '/heart-beat.json',
  autoplay: true,
  loop: true
})

onMounted(() => {
  if (themeLottie.instance.value) {
    themeInstance.value = themeLottie.instance.value
    const manager = new ThemeManager(themeInstance.value)
    
    // 注册主题
    manager.registerThemes([
      {
        name: 'light',
        colors: {
          '#ff0000': '#667eea',
          '#ff6b6b': '#764ba2'
        }
      },
      {
        name: 'dark',
        colors: {
          '#ff0000': '#4f46e5',
          '#ff6b6b': '#7c3aed'
        }
      },
      {
        name: 'sunset',
        colors: {
          '#ff0000': '#ff6b6b',
          '#ff6b6b': '#feca57'
        }
      }
    ])
    
    themeManagerInstance.value = manager
  }
})

const switchTheme = (themeName: string) => {
  if (themeManagerInstance.value) {
    themeManagerInstance.value.switchTheme(themeName)
    currentTheme.value = themeName
  }
}

const adjustBrightness = () => {
  themeManagerInstance.value?.adjustBrightness(1.3)
}

const adjustSaturation = () => {
  themeManagerInstance.value?.adjustSaturation(1.5)
}

const applyHueShift = () => {
  themeManagerInstance.value?.applyHueShift(30)
}

// 3. 数据绑定
const dataBindingContainer = ref<HTMLElement>()
const dataBindingInstance = ref<any>(null)
const dataBindingManager = ref<DataBinding | null>(null)
const opacity = ref(1)
const scale = ref(1)

const dataBindingLottie = useLottie({
  container: dataBindingContainer,
  path: '/loading-spinner.json',
  autoplay: true,
  loop: true
})

onMounted(() => {
  if (dataBindingLottie.instance.value) {
    dataBindingInstance.value = dataBindingLottie.instance.value
    const binding = new DataBinding(dataBindingInstance.value)
    
    // 绑定属性
    binding.bind({
      path: 'opacity',
      target: 'rootLayer',
      property: 'opacity'
    })
    
    binding.bind({
      path: 'scale',
      target: 'rootLayer',
      property: 'scale'
    })
    
    dataBindingManager.value = binding
  }
})

const updateOpacity = () => {
  if (dataBindingManager.value) {
    dataBindingManager.value.update('opacity', opacity.value)
  }
  // 视觉反馈
  if (dataBindingContainer.value) {
    dataBindingContainer.value.style.opacity = String(opacity.value)
  }
}

const updateScale = () => {
  if (dataBindingManager.value) {
    dataBindingManager.value.update('scale', scale.value)
  }
  // 视觉反馈
  if (dataBindingContainer.value) {
    dataBindingContainer.value.style.transform = `scale(${scale.value})`
  }
}

// 4. 手势控制
const gestureContainer = ref<HTMLElement>()
const gestureInstance = ref<any>(null)
const gestureController = ref<GestureController | null>(null)

const gestureLottie = useLottie({
  container: gestureContainer,
  path: '/rocket.json',
  autoplay: false,
  loop: false
})

onMounted(() => {
  if (gestureLottie.instance.value) {
    gestureInstance.value = gestureLottie.instance.value
    
    const controller = new GestureController(gestureInstance.value, {
      enableTouch: true,
      enableSwipe: true,
      enablePinch: true,
      enableRotate: true,
      
      onTap: () => {
        if (gestureInstance.value.isPaused()) {
          gestureInstance.value.play()
        } else {
          gestureInstance.value.pause()
        }
      },
      
      onSwipe: (event) => {
        const currentFrame = gestureInstance.value.getCurrentFrame()
        const totalFrames = gestureInstance.value.getTotalFrames()
        const offset = event.direction === 'left' ? -10 : 10
        const newFrame = Math.max(0, Math.min(totalFrames, currentFrame + offset))
        gestureInstance.value.goToAndStop(newFrame, true)
      }
    })
    
    gestureController.value = controller
  }
})

// 5. 预加载队列
const preloadProgress = ref(0)
const preloadState = ref('空闲')
const preloadStatus = ref('准备就绪')
const preloadQueueInstance = ref<PreloadQueue | null>(null)

onMounted(() => {
  preloadQueueInstance.value = new PreloadQueue({
    concurrency: 3,
    onProgress: (progress) => {
      preloadProgress.value = Math.round(progress.percentage)
      preloadStatus.value = `加载中... (${progress.loaded}/${progress.total})`
    },
    onComplete: (results) => {
      preloadState.value = '已完成'
      preloadStatus.value = `✅ 成功加载 ${results.length} 个动画`
    },
    onError: (error) => {
      preloadState.value = '错误'
      preloadStatus.value = `❌ 加载失败: ${error.message}`
    }
  })
})

const startPreload = async () => {
  if (!preloadQueueInstance.value) return
  
  preloadState.value = '加载中'
  
  const animations = [
    { url: '/loading-spinner.json', priority: 10 },
    { url: '/success-checkmark.json', priority: 8 },
    { url: '/heart-beat.json', priority: 6 },
    { url: '/rocket.json', priority: 4 },
    { url: '/confetti.json', priority: 2 }
  ]
  
  await preloadQueueInstance.value.addMany(animations)
  preloadQueueInstance.value.start()
}

const pausePreload = () => {
  preloadQueueInstance.value?.pause()
  preloadState.value = '已暂停'
}

const showProgress = () => {
  if (!preloadQueueInstance.value) return
  
  const progress = preloadQueueInstance.value.getProgress()
  const loaded = preloadQueueInstance.value.getLoadedAnimations()
  
  alert(
    `总进度: ${Math.round(progress.percentage)}%\n` +
    `已加载: ${progress.loaded}/${progress.total}\n` +
    `已缓存: ${loaded.length} 个动画`
  )
}

// 6. 无障碍支持
const accessibilityContainer = ref<HTMLElement>()
const accessibilityInstance = ref<any>(null)
const accessibilityManagerInstance = ref<AccessibilityManager | null>(null)

const accessibilityLottie = useLottie({
  container: accessibilityContainer,
  path: '/confetti.json',
  autoplay: false,
  loop: true
})

onMounted(() => {
  if (accessibilityLottie.instance.value) {
    accessibilityInstance.value = accessibilityLottie.instance.value
    
    const manager = new AccessibilityManager(accessibilityInstance.value, {
      keyboardNavigation: true,
      screenReader: true,
      description: '庆祝动画：彩色纸屑从天空飘落',
      title: '庆祝',
      skipOption: false,
      respectReducedMotion: true
    })
    
    accessibilityManagerInstance.value = manager
  }
})

// 清理
onUnmounted(() => {
  gestureController.value?.destroy()
  preloadQueueInstance.value?.destroy()
  accessibilityManagerInstance.value?.destroy()
})
</script>

<style scoped>
.advanced-features {
  padding: 20px;
}

header {
  text-align: center;
  margin-bottom: 40px;
}

header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

header p {
  color: #666;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.card h2 {
  margin-bottom: 8px;
  color: #333;
}

.card .description {
  color: #666;
  font-size: 14px;
  margin-bottom: 16px;
}

.lottie-container {
  width: 100%;
  height: 250px;
  background: #f5f5f5;
  border-radius: 12px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.controls {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

button {
  flex: 1;
  min-width: 90px;
  padding: 10px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.5);
}

.theme-selector {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.theme-btn {
  flex: 1;
  padding: 8px;
  border: 2px solid #e0e0e0;
  font-size: 13px;
}

.theme-btn.active {
  border-color: #667eea;
  box-shadow: 0 0 10px rgba(102, 126, 234, 0.4);
}

.theme-light { background: #ffffff; color: #333; }
.theme-dark { background: #1a1a1a; color: #fff; }
.theme-sunset { background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%); color: #fff; }

.data-inputs {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 12px;
}

.data-input {
  display: flex;
  align-items: center;
  gap: 10px;
}

.data-input label {
  min-width: 70px;
  font-weight: 600;
  color: #667eea;
  font-size: 13px;
}

.data-input input[type="range"] {
  flex: 1;
}

.info {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  font-size: 13px;
  color: #666;
  line-height: 1.6;
}

.badge {
  display: inline-block;
  padding: 4px 10px;
  background: #e7eaf6;
  color: #667eea;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  margin-top: 8px;
}

kbd {
  padding: 2px 6px;
  background: #e0e0e0;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
}
</style>
