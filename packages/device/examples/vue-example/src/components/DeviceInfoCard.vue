<script setup>
import { useDevice } from '@ldesign/device/vue'

const {
  deviceType,
  orientation,
  deviceInfo,
  isMobile,
  isTablet,
  isDesktop,
  isTouchDevice,
  refresh,
} = useDevice()
</script>

<template>
  <div class="card">
    <h3>📱 设备信息</h3>

    <div class="info-grid">
      <div class="info-item">
        <span class="label">设备类型:</span>
        <span class="value">{{ deviceType }}</span>
      </div>

      <div class="info-item">
        <span class="label">屏幕方向:</span>
        <span class="value">{{ orientation }}</span>
      </div>

      <div class="info-item">
        <span class="label">屏幕尺寸:</span>
        <span class="value">{{ deviceInfo?.width || '-' }} ×
          {{ deviceInfo?.height || '-' }}</span>
      </div>

      <div class="info-item">
        <span class="label">像素比:</span>
        <span class="value">{{ deviceInfo?.pixelRatio || '-' }}</span>
      </div>

      <div class="info-item">
        <span class="label">触摸设备:</span>
        <span class="value">{{ isTouchDevice ? '是' : '否' }}</span>
      </div>

      <div class="info-item">
        <span class="label">移动设备:</span>
        <span class="value" :class="{ highlight: isMobile }">{{
          isMobile ? '是' : '否'
        }}</span>
      </div>

      <div class="info-item">
        <span class="label">平板设备:</span>
        <span class="value" :class="{ highlight: isTablet }">{{
          isTablet ? '是' : '否'
        }}</span>
      </div>

      <div class="info-item">
        <span class="label">桌面设备:</span>
        <span class="value" :class="{ highlight: isDesktop }">{{
          isDesktop ? '是' : '否'
        }}</span>
      </div>
    </div>

    <div class="system-info">
      <div class="info-item">
        <span class="label">操作系统:</span>
        <span class="value">{{ deviceInfo?.os?.name || '-' }}
          {{ deviceInfo?.os?.version || '' }}</span>
      </div>

      <div class="info-item">
        <span class="label">浏览器:</span>
        <span class="value">{{ deviceInfo?.browser?.name || '-' }}
          {{ deviceInfo?.browser?.version || '' }}</span>
      </div>
    </div>

    <button class="refresh-btn" @click="refresh">
      🔄 刷新信息
    </button>
  </div>
</template>

<style scoped>
.card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #4facfe;
}

.card h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-grid {
  display: grid;
  gap: 12px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: #495057;
}

.value {
  color: #6c757d;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
}

.value.highlight {
  color: #28a745;
  font-weight: 600;
}

.system-info {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #f8f9fa;
}

.refresh-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 16px;
}

.refresh-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
}

.refresh-btn:active {
  transform: translateY(0);
}
</style>
