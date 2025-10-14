<template>
  <div class="app">
    <header class="header">
      <h1>🎯 QRCode Library Vue Demo</h1>
      <p>Explore various QR code styles and features</p>
    </header>
    
    <div class="demos-container">
      <BasicDemo />
      <StyledDemo />
      <GradientDemo />
      <LogoDemo />
      <ErrorCorrectionDemo />
      <SizeDemo />
      <DotsDemo />
      <DiamondDemo />
      <StarDemo />
      <ClassyDemo />
      <CustomEyesDemo />
      <ShadowDemo />
      <MaskDemo />
      <AdvancedTransformDemo />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BasicDemo from './components/BasicDemo.vue'
import StyledDemo from './components/StyledDemo.vue'
import GradientDemo from './components/GradientDemo.vue'
import LogoDemo from './components/LogoDemo.vue'
import ErrorCorrectionDemo from './components/ErrorCorrectionDemo.vue'
import SizeDemo from './components/SizeDemo.vue'
import DotsDemo from './components/DotsDemo.vue'
import DiamondDemo from './components/DiamondDemo.vue'
import StarDemo from './components/StarDemo.vue'
import ClassyDemo from './components/ClassyDemo.vue'
import CustomEyesDemo from './components/CustomEyesDemo.vue'
import ShadowDemo from './components/ShadowDemo.vue'
import MaskDemo from './components/MaskDemo.vue'
import AdvancedTransformDemo from './components/AdvancedTransformDemo.vue'
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 40px;
  color: white;
}

.header h1 {
  font-size: 2.5em;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.header p {
  font-size: 1.2em;
  opacity: 0.9;
}

.demos-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .demos-container {
    grid-template-columns: 1fr;
  }
  
  .header h1 {
    font-size: 2em;
  }
}
</style>
