<template>
  <div class="composition-example">
    <div class="container">
      <h1 class="page-title">⚡ Composition API</h1>
      <p class="page-description">
        使用 useTemplate 等 Composition API
      </p>
      
      <div class="example-section">
        <h2>Composition API 示例</h2>
        <p>展示如何使用 useTemplate hook。</p>
        
        <div class="demo-container">
          <div class="demo-preview">
            <div class="placeholder">
              <p>Composition API 演示区域</p>
              <p>使用 useTemplate hook</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Composition API 示例逻辑
</script>

<style scoped>
.composition-example {
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 1rem;
  color: white;
}

.page-description {
  font-size: 1.25rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 3rem;
}

.example-section {
  background: rgba(255, 255, 255, 0.95);
  padding: 2rem;
  border-radius: 16px;
  margin-bottom: 2rem;
}

.example-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
}

.demo-container {
  margin-top: 1rem;
}

.demo-preview {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 2rem;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder {
  text-align: center;
  color: #666;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
}
</style>
