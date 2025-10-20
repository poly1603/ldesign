<template>
  <div class="app">
    <header class="header">
      <h1>🎬 Lottie Vue 3 完整示例</h1>
      <p class="subtitle">展示所有用法：Composable、组件、指令</p>
    </header>

    <div class="container">
      <!-- 方式 1: Composable 用法 -->
      <section class="section">
        <h2>1️⃣ Composable 用法 (useLottie)</h2>
        <div class="demo-box">
          <div ref="composableContainer" class="lottie-box" />
          <div class="controls">
            <button @click="composableLottie.play" class="btn btn-primary">播放</button>
            <button @click="composableLottie.pause" class="btn btn-secondary">暂停</button>
            <button @click="composableLottie.stop" class="btn btn-secondary">停止</button>
            <button @click="composableLottie.reset" class="btn btn-secondary">重置</button>
            <label class="speed-control">
              速度: <input type="range" min="0.1" max="3" step="0.1" :value="speed1" @input="handleSpeed1" />
              <span>{{ speed1.toFixed(1) }}x</span>
            </label>
          </div>
          <div class="info">
            状态: <span class="badge" :class="composableLottie.state.value">{{ composableLottie.state.value }}</span>
            &nbsp; 播放中: {{ composableLottie.isPlaying.value ? '是' : '否' }}
          </div>
        </div>
      </section>

      <!-- 方式 2: 组件用法 - LottieAnimation -->
      <section class="section">
        <h2>2️⃣ 基础组件 (LottieAnimation)</h2>
        <div class="demo-box">
          <LottieAnimation
            :path="animationPath"
            :loop="true"
            :autoplay="true"
            :speed="speed2"
            width="300px"
            height="300px"
            @ready="() => log('组件动画加载完成')"
            @complete="() => log('组件动画播放完成')"
            ref="animationRef"
          />
          <div class="controls">
            <button @click="() => animationRef?.play()" class="btn btn-primary">播放</button>
            <button @click="() => animationRef?.pause()" class="btn btn-secondary">暂停</button>
            <label class="speed-control">
              速度: <input type="range" min="0.1" max="3" step="0.1" v-model.number="speed2" />
              <span>{{ speed2.toFixed(1) }}x</span>
            </label>
          </div>
        </div>
      </section>

      <!-- 方式 3: 播放器组件 - LottiePlayer -->
      <section class="section">
        <h2>3️⃣ 播放器组件 (LottiePlayer)</h2>
        <div class="demo-box">
          <LottiePlayer
            :path="animationPath2"
            :loop="true"
            :autoplay="false"
            :showControls="true"
            height="350px"
            @ready="() => log('播放器加载完成')"
          />
        </div>
      </section>

      <!-- 方式 4: 指令用法 - v-lottie -->
      <section class="section">
        <h2>4️⃣ 基础指令 (v-lottie)</h2>
        <div class="demo-box">
          <div 
            v-lottie="animationPath"
            class="lottie-box"
            style="width: 300px; height: 300px;"
          />
          <div class="info">使用 v-lottie 指令，自动播放和循环</div>
        </div>
      </section>

      <!-- 方式 5: 悬停指令 - v-lottie-hover -->
      <section class="section">
        <h2>5️⃣ 悬停指令 (v-lottie-hover)</h2>
        <div class="demo-box">
          <div 
            v-lottie-hover="animationPath3"
            class="lottie-box hover-box"
            style="width: 200px; height: 200px;"
          />
          <div class="info">鼠标悬停时播放动画 ✨</div>
        </div>
      </section>

      <!-- 方式 6: 滚动指令 - v-lottie-scroll -->
      <section class="section">
        <h2>6️⃣ 滚动指令 (v-lottie-scroll)</h2>
        <div class="demo-box">
          <div 
            v-lottie-scroll="animationPath"
            class="lottie-box"
            style="width: 300px; height: 300px; margin: 200px 0;"
          />
          <div class="info">向下滚动查看动画随滚动进度变化 📜</div>
        </div>
      </section>

      <!-- 方式 7: 交互式 Composable -->
      <section class="section">
        <h2>7️⃣ 交互式 Composable (useLottieInteractive)</h2>
        <div class="demo-box">
          <div ref="interactiveContainer" class="lottie-box interactive-box" />
          <div class="info">点击切换播放/暂停，鼠标悬停播放 🎮</div>
        </div>
      </section>

      <!-- 方式 8: 序列 Composable -->
      <section class="section">
        <h2>8️⃣ 序列 Composable (useLottieSequence)</h2>
        <div class="demo-box">
          <div class="sequence-info">
            当前: {{ sequence.currentIndex.value + 1 }} / {{ sequence.totalCount.value }}
            &nbsp; 进度: {{ Math.round(sequence.progress.value) }}%
          </div>
          <div class="controls">
            <button @click="sequence.play" class="btn btn-primary">播放序列</button>
            <button @click="sequence.pause" class="btn btn-secondary">暂停</button>
            <button @click="sequence.resume" class="btn btn-secondary">继续</button>
            <button @click="sequence.stop" class="btn btn-danger">停止</button>
          </div>
        </div>
      </section>

      <!-- 方式 9: 序列组件 -->
      <section class="section">
        <h2>9️⃣ 序列组件 (LottieSequence)</h2>
        <div class="demo-box">
          <LottieSequence
            :items="sequenceItems"
            :loop="false"
            :autoplay="false"
            :showControls="true"
          />
        </div>
      </section>

      <!-- 日志 -->
      <section class="section">
        <h2>📝 事件日志</h2>
        <div class="log">
          <div v-for="(entry, index) in logs" :key="index" class="log-entry">
            {{ entry }}
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  useLottie, 
  useLottieInteractive,
  useLottieSequence,
  LottieAnimation,
  LottiePlayer,
  LottieSequence
} from '@ldesign/lottie/vue'

// 动画路径
const animationPath = '../assets/loading.json'
const animationPath2 = '../assets/heart.json'
const animationPath3 = '../assets/success.json'

// 1. Composable 用法
const composableContainer = ref<HTMLElement | null>(null)
const speed1 = ref(1)

const composableLottie = useLottie({
  container: composableContainer,
  path: animationPath,
  loop: true,
  autoplay: true
})

const handleSpeed1 = (e: Event) => {
  const value = parseFloat((e.target as HTMLInputElement).value)
  speed1.value = value
  composableLottie.setSpeed(value)
}

// 2. 组件 ref
const animationRef = ref<any>(null)
const speed2 = ref(1)

// 3. 交互式 Composable
const interactiveContainer = ref<HTMLElement | null>(null)
const interactiveLottie = useLottieInteractive({
  container: interactiveContainer,
  path: animationPath2,
  loop: false,
  autoplay: false,
  enableClick: true,
  enableHover: true
})

// 4. 序列 Composable
const sequence = useLottieSequence({
  items: [
    {
      config: { path: '../assets/loading.json' },
      delay: 0
    },
    {
      config: { path: '../assets/success.json' },
      delay: 500
    },
    {
      config: { path: '../assets/heart.json' },
      delay: 500
    }
  ],
  loop: false,
  autoplay: false
})

// 5. 序列组件数据
const sequenceItems = ref([
  {
    config: { path: '../assets/loading.json' },
    delay: 0
  },
  {
    config: { path: '../assets/success.json' },
    delay: 300
  },
  {
    config: { path: '../assets/heart.json' },
    delay: 300
  }
])

// 日志
const logs = ref<string[]>([])

const log = (message: string) => {
  const timestamp = new Date().toLocaleTimeString()
  logs.value.unshift(`[${timestamp}] ${message}`)
  if (logs.value.length > 20) {
    logs.value.pop()
  }
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.header {
  text-align: center;
  color: white;
  margin-bottom: 30px;
}

.header h1 {
  font-size: 36px;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 16px;
  opacity: 0.9;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.section h2 {
  color: #333;
  margin-bottom: 16px;
  font-size: 20px;
}

.demo-box {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.lottie-box {
  width: 300px;
  height: 300px;
  background: #f9f9f9;
  border-radius: 8px;
  margin: 0 auto;
}

.hover-box {
  border: 2px dashed #667eea;
  cursor: pointer;
  transition: all 0.3s;
}

.hover-box:hover {
  border-color: #764ba2;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.interactive-box {
  cursor: pointer;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background: #c0392b;
}

.speed-control {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.speed-control input {
  width: 120px;
}

.info {
  text-align: center;
  color: #666;
  font-size: 14px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 6px;
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.badge.playing {
  background: #d4edda;
  color: #155724;
}

.badge.paused {
  background: #fff3cd;
  color: #856404;
}

.badge.stopped, .badge.idle {
  background: #f8d7da;
  color: #721c24;
}

.badge.loaded {
  background: #d1ecf1;
  color: #0c5460;
}

.sequence-info {
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: #667eea;
  padding: 12px;
  background: #f0f4ff;
  border-radius: 6px;
}

.log {
  background: #2d3748;
  color: #a0aec0;
  padding: 16px;
  border-radius: 8px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
  max-height: 300px;
  overflow-y: auto;
}

.log-entry {
  margin-bottom: 4px;
  padding: 4px 0;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
</style>
