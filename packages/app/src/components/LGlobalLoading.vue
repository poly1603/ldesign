<template>
  <teleport to="body">
    <div class="l-global-loading">
      <div class="loading-backdrop" />
      <div class="loading-content">
        <div class="loading-spinner">
          <div class="spinner-ring">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
        <div v-if="text" class="loading-text">
          {{ text }}
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
interface Props {
  text?: string
}

withDefaults(defineProps<Props>(), {
  text: '加载中...'
})
</script>

<style lang="less" scoped>
.l-global-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: @z-index-modal;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .loading-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(2px);
  }
  
  .loading-content {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 32px;
    background: white;
    border-radius: @border-radius-lg;
    box-shadow: @shadow-lg;
  }
  
  .loading-spinner {
    .spinner-ring {
      display: inline-block;
      position: relative;
      width: 40px;
      height: 40px;
      
      div {
        box-sizing: border-box;
        display: block;
        position: absolute;
        width: 32px;
        height: 32px;
        margin: 4px;
        border: 3px solid @primary-color;
        border-radius: 50%;
        animation: spinner-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
        border-color: @primary-color transparent transparent transparent;
        
        &:nth-child(1) {
          animation-delay: -0.45s;
        }
        
        &:nth-child(2) {
          animation-delay: -0.3s;
        }
        
        &:nth-child(3) {
          animation-delay: -0.15s;
        }
      }
    }
  }
  
  .loading-text {
    font-size: @font-size-sm;
    color: @text-secondary;
    text-align: center;
  }
}

@keyframes spinner-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
