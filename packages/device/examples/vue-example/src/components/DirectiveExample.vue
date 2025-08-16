<script setup>
import { useDevice } from '@ldesign/device/vue'

const { deviceType, deviceInfo, orientation } = useDevice()
</script>

<template>
  <div class="card">
    <h3>🎯 指令示例</h3>
    <p class="description">
      以下元素会根据当前设备类型自动显示或隐藏，请尝试调整浏览器窗口大小来测试效果。
    </p>

    <div class="directive-examples">
      <!-- 基础指令示例 -->
      <div class="example-section">
        <h4>基础指令</h4>

        <div v-device="'mobile'" class="device-box mobile">
          <span class="icon">📱</span>
          <span>仅在移动设备显示</span>
        </div>

        <div v-device="'tablet'" class="device-box tablet">
          <span class="icon">📟</span>
          <span>仅在平板设备显示</span>
        </div>

        <div v-device="'desktop'" class="device-box desktop">
          <span class="icon">🖥️</span>
          <span>仅在桌面设备显示</span>
        </div>
      </div>

      <!-- 多设备类型指令 -->
      <div class="example-section">
        <h4>多设备类型</h4>

        <div v-device="['mobile', 'tablet']" class="device-box mobile-tablet">
          <span class="icon">📱📟</span>
          <span>在移动设备和平板显示</span>
        </div>

        <div v-device="['tablet', 'desktop']" class="device-box tablet-desktop">
          <span class="icon">📟🖥️</span>
          <span>在平板和桌面设备显示</span>
        </div>
      </div>

      <!-- 反向指令示例 -->
      <div class="example-section">
        <h4>反向指令</h4>

        <div
          v-device="{ type: 'mobile', inverse: true }"
          class="device-box inverse"
        >
          <span class="icon">🚫📱</span>
          <span>在非移动设备显示</span>
        </div>

        <div
          v-device="{ type: ['mobile', 'tablet'], inverse: true }"
          class="device-box inverse"
        >
          <span class="icon">🚫📱📟</span>
          <span>在非移动和非平板设备显示</span>
        </div>
      </div>

      <!-- 专用指令示例 -->
      <div class="example-section">
        <h4>专用指令</h4>

        <div v-device-mobile class="device-box mobile">
          <span class="icon">📱</span>
          <span>v-device-mobile 指令</span>
        </div>

        <div v-device-tablet class="device-box tablet">
          <span class="icon">📟</span>
          <span>v-device-tablet 指令</span>
        </div>

        <div v-device-desktop class="device-box desktop">
          <span class="icon">🖥️</span>
          <span>v-device-desktop 指令</span>
        </div>
      </div>
    </div>

    <!-- 当前设备信息 -->
    <div class="current-device">
      <h4>当前设备信息</h4>
      <div class="device-info">
        <span class="info-item"> <strong>类型:</strong> {{ deviceType }} </span>
        <span class="info-item">
          <strong>尺寸:</strong> {{ deviceInfo.width }} ×
          {{ deviceInfo.height }}
        </span>
        <span class="info-item">
          <strong>方向:</strong> {{ orientation }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #6f42c1;
  margin-bottom: 20px;
}

.card h3 {
  color: #2c3e50;
  margin-bottom: 16px;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.description {
  color: #6c757d;
  margin-bottom: 24px;
  line-height: 1.6;
  background: #f8f9fa;
  padding: 12px 16px;
  border-radius: 8px;
  border-left: 3px solid #6f42c1;
}

.directive-examples {
  display: grid;
  gap: 24px;
}

.example-section h4 {
  color: #495057;
  margin-bottom: 12px;
  font-size: 1.1rem;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 8px;
}

.device-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.device-box:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.device-box .icon {
  font-size: 1.5rem;
}

.device-box.mobile {
  background: linear-gradient(135deg, #ff6b6b, #ffa8a8);
  color: white;
}

.device-box.tablet {
  background: linear-gradient(135deg, #4ecdc4, #7fdbda);
  color: white;
}

.device-box.desktop {
  background: linear-gradient(135deg, #45b7d1, #7cc7d8);
  color: white;
}

.device-box.mobile-tablet {
  background: linear-gradient(135deg, #ff9ff3, #f368e0);
  color: white;
}

.device-box.tablet-desktop {
  background: linear-gradient(135deg, #54a0ff, #2e86de);
  color: white;
}

.device-box.inverse {
  background: linear-gradient(135deg, #a55eea, #8b5cf6);
  color: white;
}

.current-device {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 2px solid #e9ecef;
}

.current-device h4 {
  color: #495057;
  margin-bottom: 12px;
  font-size: 1.1rem;
}

.device-info {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  background: #f8f9fa;
  padding: 12px 16px;
  border-radius: 8px;
}

.info-item {
  color: #495057;
  font-size: 0.9rem;
}

.info-item strong {
  color: #2c3e50;
}

@media (max-width: 768px) {
  .device-info {
    flex-direction: column;
    gap: 8px;
  }

  .device-box {
    padding: 12px;
  }

  .device-box .icon {
    font-size: 1.3rem;
  }
}
</style>
