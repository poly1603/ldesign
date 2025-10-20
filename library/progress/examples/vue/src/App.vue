<template>
  <div class="app">
    <h1>🎨 Progress Vue 示例</h1>

    <section class="demo-section">
      <h2>线性进度条</h2>
      
      <div class="demo-item">
        <div class="demo-label">基础线性进度条</div>
        <ld-linear-progress
          :value="value"
          theme="primary"
          @change="handleChange"
        />
      </div>

      <div class="demo-item">
        <div class="demo-label">渐变色进度条</div>
        <ld-linear-progress
          :value="value"
          :color="['#409eff', '#67c23a']"
        />
      </div>

      <div class="demo-item">
        <div class="demo-label">条纹进度条</div>
        <ld-linear-progress
          :value="value"
          :striped="true"
          :active="true"
          theme="warning"
        />
      </div>
    </section>

    <section class="demo-section">
      <h2>圆形进度条</h2>
      <div class="circle-container">
        <ld-circle-progress
          :value="value"
          :radius="60"
          theme="primary"
        />
        
        <ld-circle-progress
          :value="value"
          :radius="60"
          :color="['#ff6b6b', '#feca57', '#48dbfb']"
        />
        
        <ld-circle-progress
          :value="value"
          :radius="60"
          :stroke-width="8"
          theme="success"
        />
      </div>
    </section>

    <section class="demo-section">
      <h2>🆕 多边形进度条</h2>
      <div class="circle-container">
        <ld-polygon-progress
          :value="value"
          :sides="6"
          :radius="50"
          theme="primary"
        />
        
        <ld-polygon-progress
          :value="value"
          :sides="3"
          :radius="50"
          :color="'#f56c6c'"
        />
        
        <ld-polygon-progress
          :value="value"
          :sides="8"
          :radius="50"
          :rotation="22.5"
          theme="warning"
        />
      </div>
    </section>

    <section class="demo-section">
      <h2>🆕 心形进度条</h2>
      <div class="circle-container">
        <ld-heart-progress
          :value="value"
          :heart-size="100"
          fill-mode="bottom-up"
          :color="['#ff6b6b', '#ee5a6f']"
        />
        
        <ld-heart-progress
          :value="value"
          :heart-size="100"
          fill-mode="center-out"
          color="#ff4757"
        />
        
        <ld-heart-progress
          :value="value"
          :heart-size="100"
          fill-mode="bottom-up"
          :beat-animation="true"
          :beat-speed="800"
          :color="['#ff6b6b', '#ee5a6f']"
        />
      </div>
    </section>

    <div class="controls">
      <button @click="value = 25">25%</button>
      <button @click="value = 50">50%</button>
      <button @click="value = 75">75%</button>
      <button @click="value = 100">100%</button>
      <button @click="value = 0">重置</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { 
  LinearProgress as LdLinearProgress, 
  CircleProgress as LdCircleProgress,
  PolygonProgress as LdPolygonProgress,
  HeartProgress as LdHeartProgress,
} from '@ldesign/progress-vue';

const value = ref(50);

const handleChange = (newValue) => {
  console.log('Progress changed:', newValue);
};
</script>

<style scoped>
.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px;
}

h1 {
  margin-bottom: 30px;
  color: #303133;
}

h2 {
  margin: 30px 0 20px;
  color: #606266;
  font-size: 20px;
}

.demo-section {
  margin-bottom: 40px;
}

.demo-item {
  margin-bottom: 30px;
}

.demo-label {
  margin-bottom: 10px;
  color: #606266;
  font-size: 14px;
}

.circle-container {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
}

.controls {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: #409eff;
  color: white;
  cursor: pointer;
  font-size: 14px;
}

button:hover {
  background: #66b1ff;
}
</style>


