<template>
  <div class="app">
    <header>
      <h1>🎨 Lottie Vue Example</h1>
      <p>Powerful Lottie animations in Vue 3</p>
    </header>

    <div class="grid">
      <!-- Example 1: Using Composable -->
      <div class="card">
        <h2>useLottie Composable</h2>
        <div ref="container1" class="lottie-container"></div>
        <div class="controls">
          <button @click="play">Play</button>
          <button @click="pause">Pause</button>
          <button @click="stop">Stop</button>
          <button @click="reset">Reset</button>
        </div>
        <div class="info">
          <p><strong>State:</strong> {{ state }}</p>
          <p><strong>Loaded:</strong> {{ isLoaded }}</p>
          <p><strong>Playing:</strong> {{ isPlaying }}</p>
        </div>
      </div>

      <!-- Example 2: Using Directive -->
      <div class="card">
        <h2>v-lottie Directive</h2>
        <div
          v-lottie="lottieConfig"
          class="lottie-container"
        ></div>
        <div class="info">
          <p>This animation uses the v-lottie directive</p>
          <p>Auto-plays and loops continuously</p>
        </div>
      </div>

      <!-- Example 3: Speed Control -->
      <div class="card">
        <h2>Speed Control</h2>
        <div ref="container3" class="lottie-container"></div>
        <div class="speed-control">
          <label>Speed: {{ speed }}x</label>
          <input
            v-model.number="speed"
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            @input="updateSpeed"
          >
        </div>
        <div class="controls">
          <button @click="speedExample.play()">Play</button>
          <button @click="speedExample.pause()">Pause</button>
        </div>
      </div>

      <!-- Example 4: Rocket Animation -->
      <div class="card">
        <h2>🚀 Rocket Launch</h2>
        <div ref="container4" class="lottie-container"></div>
        <div class="controls">
          <button @click="rocketExample.play()">Launch</button>
          <button @click="rocketExample.stop()">Reset</button>
        </div>
        <div class="info">
          <p>Rocket animation</p>
          <p>Perfect for startup actions</p>
        </div>
      </div>

      <!-- Example 5: Confetti Animation -->
      <div class="card">
        <h2>🎉 Celebration</h2>
        <div ref="container5" class="lottie-container"></div>
        <div class="controls">
          <button @click="confettiExample.play()">Celebrate</button>
          <button @click="confettiExample.stop()">Reset</button>
        </div>
        <div class="info">
          <p>Confetti animation</p>
          <p>Great for achievements!</p>
        </div>
      </div>
    </div>

    <!-- Global Stats -->
    <div class="stats">
      <h2>📊 Global Statistics</h2>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">{{ globalStats.totalInstances }}</div>
          <div class="stat-label">Total Instances</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ globalStats.activeInstances }}</div>
          <div class="stat-label">Active Instances</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ globalStats.averageFps }}</div>
          <div class="stat-label">Average FPS</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ Math.round(globalStats.cacheHitRate * 100) }}%</div>
          <div class="stat-label">Cache Hit Rate</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useLottie } from '../../../src/adapters/vue'
import { lottieManager } from '../../../src'

// Example 1: Loading Animation
const container1 = ref<HTMLElement>()
const {
  state,
  isLoaded,
  isPlaying,
  play,
  pause,
  stop,
  reset,
} = useLottie({
  container: container1,
  path: '/loading-spinner.json',
  loop: true,
  autoplay: false,
})

// Example 2: Success Animation with directive
const lottieConfig = {
  path: '/success-checkmark.json',
  loop: false,
  autoplay: true,
}

// Example 3: Heart Animation with speed control
const container3 = ref<HTMLElement>()
const speed = ref(1)
const speedExample = useLottie({
  container: container3,
  path: '/heart-beat.json',
  loop: true,
  autoplay: false,
  speed: speed.value,
})

const updateSpeed = () => {
  speedExample.setSpeed(speed.value)
}

// Example 4: Rocket Animation
const container4 = ref<HTMLElement>()
const rocketExample = useLottie({
  container: container4,
  path: '/rocket.json',
  loop: false,
  autoplay: false,
})

// Example 5: Confetti Animation
const container5 = ref<HTMLElement>()
const confettiExample = useLottie({
  container: container5,
  path: '/confetti.json',
  loop: false,
  autoplay: false,
})

// Global stats
const globalStats = reactive({
  totalInstances: 0,
  activeInstances: 0,
  averageFps: 0,
  cacheHitRate: 0,
})

let statsInterval: number | undefined

onMounted(() => {
  // Update stats periodically
  statsInterval = window.setInterval(() => {
    const stats = lottieManager.getGlobalStats()
    Object.assign(globalStats, stats)
  }, 1000)
})

onUnmounted(() => {
  if (statsInterval) {
    clearInterval(statsInterval)
  }
})
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

header {
  text-align: center;
  color: white;
  margin-bottom: 40px;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 8px;
}

header p {
  font-size: 1.2rem;
  opacity: 0.9;
}

.grid {
  max-width: 1200px;
  margin: 0 auto 40px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
}

h2 {
  margin-bottom: 16px;
  color: #333;
  font-size: 1.5rem;
}

.lottie-container {
  width: 100%;
  height: 300px;
  background: #f5f5f5;
  border-radius: 12px;
  margin-bottom: 16px;
}

.controls {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

button {
  padding: 8px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

button:hover {
  background: #764ba2;
  transform: scale(1.05);
}

button:active {
  transform: scale(0.95);
}

.info {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  color: #666;
}

.info p {
  margin: 4px 0;
}

.speed-control {
  margin-bottom: 12px;
}

.speed-control label {
  display: block;
  margin-bottom: 8px;
  color: #666;
  font-weight: 500;
}

.speed-control input {
  width: 100%;
}

.stats {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.stats h2 {
  color: #333;
  margin-bottom: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-item {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 12px;
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 8px;
}

.stat-label {
  color: #666;
  font-size: 14px;
}
</style>
