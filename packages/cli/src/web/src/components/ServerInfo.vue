<template>
  <div class="server-info-card">
    <div class="server-header">
      <Globe :size="20" />
      <h3>服务地址</h3>
    </div>
    
    <div class="server-content">
      <!-- 本地地址 -->
      <div v-if="localUrl" class="url-section">
        <div class="url-label">
          <Monitor :size="16" />
          <span>本地访问</span>
        </div>
        <div class="url-value">
          <a :href="localUrl" target="_blank" class="url-link">
            {{ localUrl }}
          </a>
          <button @click="copyUrl(localUrl)" class="btn-copy" title="复制地址">
            <Copy :size="14" />
          </button>
        </div>
      </div>

      <!-- 网络地址 -->
      <div v-if="networkUrl" class="url-section">
        <div class="url-label">
          <Wifi :size="16" />
          <span>网络访问</span>
        </div>
        <div class="url-value">
          <a :href="networkUrl" target="_blank" class="url-link">
            {{ networkUrl }}
          </a>
          <button @click="copyUrl(networkUrl)" class="btn-copy" title="复制地址">
            <Copy :size="14" />
          </button>
        </div>
      </div>

      <!-- 二维码 -->
      <div v-if="networkUrl" class="qrcode-section">
        <div class="qrcode-label">
          <Smartphone :size="16" />
          <span>扫码访问</span>
        </div>
        <div class="qrcode-container">
          <canvas ref="qrcodeCanvas" class="qrcode-canvas"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { Globe, Monitor, Wifi, Smartphone, Copy } from 'lucide-vue-next'
import QRCode from 'qrcode'

// Props
const props = defineProps<{
  localUrl?: string
  networkUrl?: string
}>()

// Refs
const qrcodeCanvas = ref<HTMLCanvasElement | null>(null)

// 生成二维码
const generateQRCode = async () => {
  if (!props.networkUrl || !qrcodeCanvas.value) return

  try {
    await QRCode.toCanvas(qrcodeCanvas.value, props.networkUrl, {
      width: 160,
      margin: 1,
      color: {
        dark: '#1a1a1a',
        light: '#ffffff'
      }
    })
  } catch (error) {
    console.error('生成二维码失败:', error)
  }
}

// 复制 URL
const copyUrl = async (url: string) => {
  try {
    await navigator.clipboard.writeText(url)
    // TODO: 显示复制成功提示
    console.log('已复制:', url)
  } catch (error) {
    console.error('复制失败:', error)
  }
}

// 监听 URL 变化，重新生成二维码
watch(() => props.networkUrl, () => {
  nextTick(() => {
    generateQRCode()
  })
}, { immediate: true })
</script>

<style lang="less" scoped>
.server-info-card {
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-level-1-color);
  border-radius: var(--ls-border-radius-base);
  overflow: hidden;
}

.server-header {
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-sm);
  padding: var(--ls-padding-base);
  border-bottom: 1px solid var(--ldesign-border-level-1-color);
  background: var(--ldesign-bg-color-component);

  svg {
    color: var(--ldesign-brand-color);
  }

  h3 {
    margin: 0;
    font-size: var(--ls-font-size-base);
    font-weight: 600;
    color: var(--ldesign-text-color-primary);
  }
}

.server-content {
  padding: var(--ls-padding-base);
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-base);
}

.url-section {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-xs);
}

.url-label {
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-xs);
  font-size: var(--ls-font-size-sm);
  color: var(--ldesign-text-color-secondary);

  svg {
    color: var(--ldesign-text-color-placeholder);
  }
}

.url-value {
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-xs);
  padding: var(--ls-padding-sm);
  background: var(--ldesign-bg-color-component);
  border: 1px solid var(--ldesign-border-level-1-color);
  border-radius: var(--ls-border-radius-sm);
}

.url-link {
  flex: 1;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: var(--ls-font-size-sm);
  color: var(--ldesign-brand-color);
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    color: var(--ldesign-brand-color-hover);
    text-decoration: underline;
  }
}

.btn-copy {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  background: transparent;
  border: none;
  border-radius: var(--ls-border-radius-sm);
  cursor: pointer;
  color: var(--ldesign-text-color-secondary);
  transition: all 0.2s;

  &:hover {
    background: var(--ldesign-bg-color-container-hover);
    color: var(--ldesign-brand-color);
  }

  &:active {
    transform: scale(0.95);
  }
}

.qrcode-section {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-xs);
  padding-top: var(--ls-padding-sm);
  border-top: 1px solid var(--ldesign-border-level-1-color);
}

.qrcode-label {
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-xs);
  font-size: var(--ls-font-size-sm);
  color: var(--ldesign-text-color-secondary);

  svg {
    color: var(--ldesign-text-color-placeholder);
  }
}

.qrcode-container {
  display: flex;
  justify-content: center;
  padding: var(--ls-padding-sm);
  background: #ffffff;
  border-radius: var(--ls-border-radius-sm);
}

.qrcode-canvas {
  display: block;
  border-radius: var(--ls-border-radius-sm);
}
</style>

