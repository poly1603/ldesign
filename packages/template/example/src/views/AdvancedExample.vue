<template>
  <div class="advanced-example">
    <div class="container">
      <h1 class="page-title">🔥 高级示例</h1>
      <p class="page-description">
        探索模板选择器、设备切换等高级功能
      </p>
      
      <div class="example-section">
        <h2>高级功能演示</h2>
        <p>这里将展示更复杂的模板管理功能。</p>
        
        <div class="demo-container">
          <div class="demo-preview">
            <div class="placeholder">
              <p>高级模板功能演示区域</p>
              <p>包括模板选择器、设备切换等</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 高级示例逻辑
</script>

<style scoped>
.advanced-example {
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
