<template>
  <div class="datatype-example">
    <h2 class="section-title">数据类型示例</h2>
    <p class="section-description">
      展示 @ldesign/qrcode 支持的各种数据类型，包括URL、WiFi、联系人、地理位置、邮件等。
    </p>

    <div class="grid grid-2">
      <!-- 数据类型选择 -->
      <div class="card">
        <h3 class="card-title">数据类型</h3>
        
        <div class="type-selector">
          <button
            v-for="type in dataTypes"
            :key="type.id"
            :class="['type-btn', { active: activeType === type.id }]"
            @click="selectType(type)"
          >
            <span class="type-icon">{{ type.icon }}</span>
            <span class="type-label">{{ type.label }}</span>
          </button>
        </div>

        <!-- 动态表单 -->
        <div class="data-form">
          <!-- URL表单 -->
          <div v-if="activeType === 'url'">
            <div class="form-group">
              <label class="form-label">网站URL</label>
              <input
                v-model="formData.url"
                type="url"
                class="form-input"
                placeholder="https://example.com"
                @input="generateQRCodeHandler"
              />
            </div>
          </div>

          <!-- WiFi表单 -->
          <div v-else-if="activeType === 'wifi'">
            <div class="form-group">
              <label class="form-label">网络名称 (SSID)</label>
              <input
                v-model="formData.ssid"
                type="text"
                class="form-input"
                placeholder="WiFi网络名称"
                @input="generateQRCodeHandler"
              />
            </div>
            <div class="form-group">
              <label class="form-label">密码</label>
              <input
                v-model="formData.password"
                type="password"
                class="form-input"
                placeholder="WiFi密码"
                @input="generateQRCodeHandler"
              />
            </div>
            <div class="form-group">
              <label class="form-label">加密类型</label>
            <select v-model="formData.security" class="form-select" @change="generateQRCodeHandler">
              <option value="WPA">WPA/WPA2</option>
              <option value="WEP">WEP</option>
              <option value="nopass">无密码</option>
            </select>
            </div>
          </div>

          <!-- 联系人表单 -->
          <div v-else-if="activeType === 'contact'">
            <div class="form-group">
              <label class="form-label">姓名</label>
              <input
                v-model="formData.name"
                type="text"
                class="form-input"
                placeholder="联系人姓名"
                @input="generateQRCodeHandler"
              />
            </div>
            <div class="form-group">
              <label class="form-label">电话</label>
              <input
                v-model="formData.phone"
                type="tel"
                class="form-input"
                placeholder="联系人电话"
                @input="generateQRCodeHandler"
              />
            </div>
            <div class="form-group">
              <label class="form-label">邮箱</label>
              <input
                v-model="formData.email"
                type="email"
                class="form-input"
                placeholder="联系人邮箱"
                @input="generateQRCodeHandler"
              />
            </div>
          </div>

          <!-- 邮件表单 -->
          <div v-else-if="activeType === 'email'">
            <div class="form-group">
              <label class="form-label">收件人</label>
              <input
                v-model="formData.email"
                type="email"
                class="form-input"
                placeholder="收件人邮箱"
                @input="generateQRCodeHandler"
              />
            </div>
            <div class="form-group">
              <label class="form-label">主题</label>
              <input
                v-model="formData.subject"
                type="text"
                class="form-input"
                placeholder="邮件主题"
                @input="generateQRCodeHandler"
              />
            </div>
          </div>

          <!-- 短信表单 -->
          <div v-else-if="activeType === 'sms'">
            <div class="form-group">
              <label class="form-label">手机号码</label>
              <input
                v-model="formData.phone"
                type="tel"
                class="form-input"
                placeholder="手机号码"
                @input="generateQRCodeHandler"
              />
            </div>
            <div class="form-group">
              <label class="form-label">短信内容</label>
              <textarea
                v-model="formData.message"
                class="form-textarea"
                placeholder="短信内容"
                @input="generateQRCodeHandler"
              ></textarea>
            </div>
          </div>

          <!-- 电话表单 -->
          <div v-else-if="activeType === 'phone'">
            <div class="form-group">
              <label class="form-label">电话号码</label>
              <input
                v-model="formData.phone"
                type="tel"
                class="form-input"
                placeholder="电话号码"
                @input="generateQRCodeHandler"
              />
            </div>
          </div>

          <!-- 地理位置表单 -->
          <div v-else-if="activeType === 'location'">
            <div class="form-group">
              <label class="form-label">纬度</label>
              <input
                v-model.number="formData.latitude"
                type="number"
                step="any"
                class="form-input"
                placeholder="纬度"
                @input="generateQRCodeHandler"
              />
            </div>
            <div class="form-group">
              <label class="form-label">经度</label>
              <input
                v-model.number="formData.longitude"
                type="number"
                step="any"
                class="form-input"
                placeholder="经度"
                @input="generateQRCodeHandler"
              />
            </div>
          </div>

          <!-- 纯文本表单 -->
          <div v-else-if="activeType === 'text'">
            <div class="form-group">
              <label class="form-label">文本内容</label>
              <textarea
                v-model="formData.text"
                class="form-textarea"
                placeholder="输入文本内容"
                @input="generateQRCodeHandler"
              ></textarea>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button @click="generateQRCodeHandler" class="btn btn-primary" :disabled="!isFormValid">
            生成二维码
          </button>
          <button @click="copyToClipboard" class="btn" :disabled="!currentData">
            复制数据
          </button>
        </div>
      </div>

      <!-- 预览面板 -->
      <div class="card">
        <h3 class="card-title">二维码预览</h3>
        
        <div class="preview-area">
          <div v-if="isLoading" class="loading">
            <div class="loading-spinner"></div>
            <p>正在生成二维码...</p>
          </div>
          
          <div v-else-if="result" class="qr-result">
            <div class="qr-container" ref="qrContainer" v-html="displayHtml"></div>
            <div class="qr-info">
              <h4>数据信息</h4>
              <p><strong>类型:</strong> {{ activeTypeInfo?.label }}</p>
              <p><strong>格式:</strong> {{ result.format }}</p>
              <p><strong>大小:</strong> {{ result.size }}px</p>
              <div class="data-preview">
                <h5>编码数据:</h5>
                <pre>{{ currentData }}</pre>
              </div>
            </div>
          </div>
          
          <div v-else class="placeholder">
            <div class="placeholder-icon">📱</div>
            <p>选择数据类型并填写信息</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 快速示例 -->
    <div class="card">
      <h3 class="card-title">快速示例</h3>
      <div class="quick-examples">
        <div
          v-for="example in quickExamples"
          :key="example.label"
          class="example-card"
          @click="loadExample(example)"
        >
          <div class="example-icon">{{ example.icon }}</div>
          <h4>{{ example.label }}</h4>
          <p>{{ example.description }}</p>
          <div class="example-preview">{{ example.preview }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import {
  generateQRCode,
  type QRCodeResult,
  type SimpleQRCodeOptions
} from '@ldesign/qrcode'

// 数据类型定义
const dataTypes = [
  { id: 'url', label: 'URL链接', icon: '🌐' },
  { id: 'wifi', label: 'WiFi网络', icon: '📶' },
  { id: 'contact', label: '联系人', icon: '👤' },
  { id: 'email', label: '邮件', icon: '📧' },
  { id: 'sms', label: '短信', icon: '💬' },
  { id: 'phone', label: '电话', icon: '📞' },
  { id: 'location', label: '地理位置', icon: '📍' },
  { id: 'text', label: '纯文本', icon: '📝' }
]

// 响应式数据
const activeType = ref('url')
const formData = ref<any>({})
const isLoading = ref(false)
const result = ref<QRCodeResult | null>(null)
const qrContainer = ref<HTMLDivElement>()

// 渲染HTML（优先 SVG，其次 dataURL）
const displayHtml = computed(() => {
  const r: any = result.value as any
  if (!r) return ''
  if (r.svg) return r.svg as string
  const dataURL = r.dataURL || (typeof r.data === 'string' ? r.data : '')
  if (dataURL) {
    return `<img src="${dataURL}" width="250" height="250" />`
  }
  return ''
})

// 计算属性
const activeTypeInfo = computed(() => 
  dataTypes.find(type => type.id === activeType.value)
)

// 移除了 currentFormComponent 计算属性，直接在模板中使用 v-if 条件渲染

const isFormValid = computed(() => {
  switch (activeType.value) {
    case 'url':
      return formData.value.url?.trim()
    case 'wifi':
      return formData.value.ssid?.trim()
    case 'contact':
      return formData.value.name?.trim()
    case 'email':
      return formData.value.email?.trim()
    case 'sms':
      return formData.value.phone?.trim()
    case 'phone':
      return formData.value.phone?.trim()
    case 'location':
      return formData.value.latitude && formData.value.longitude
    case 'text':
      return formData.value.text?.trim()
    default:
      return false
  }
})

const currentData = computed(() => {
  switch (activeType.value) {
    case 'url':
      return formData.value.url || ''
    case 'wifi':
      return `WIFI:T:${formData.value.security || 'WPA'};S:${formData.value.ssid || ''};P:${formData.value.password || ''};H:${formData.value.hidden ? 'true' : 'false'};;`
    case 'contact':
      return `BEGIN:VCARD\nVERSION:3.0\nFN:${formData.value.name || ''}\nORG:${formData.value.organization || ''}\nTEL:${formData.value.phone || ''}\nEMAIL:${formData.value.email || ''}\nURL:${formData.value.website || ''}\nEND:VCARD`
    case 'email':
      return `mailto:${formData.value.email || ''}?subject=${encodeURIComponent(formData.value.subject || '')}&body=${encodeURIComponent(formData.value.body || '')}`
    case 'sms':
      return `sms:${formData.value.phone || ''}?body=${encodeURIComponent(formData.value.message || '')}`
    case 'phone':
      return `tel:${formData.value.phone || ''}`
    case 'location':
      return `geo:${formData.value.latitude || 0},${formData.value.longitude || 0}`
    case 'text':
      return formData.value.text || ''
    default:
      return ''
  }
})

// 快速示例
const quickExamples = [
  {
    label: '官网链接',
    icon: '🌐',
    description: 'LDesign官方网站',
    preview: 'https://www.ldesign.com',
    type: 'url',
    data: { url: 'https://www.ldesign.com' }
  },
  {
    label: 'WiFi连接',
    icon: '📶',
    description: '办公室WiFi信息',
    preview: 'WIFI:T:WPA;S:LDesign-Office;P:***',
    type: 'wifi',
    data: { ssid: 'LDesign-Office', password: 'ldesign2025', security: 'WPA' }
  },
  {
    label: '联系名片',
    icon: '👤',
    description: 'LDesign团队联系方式',
    preview: 'BEGIN:VCARD...',
    type: 'contact',
    data: {
      name: 'LDesign Team',
      organization: 'LDesign',
      phone: '+86-138-0013-8000',
      email: 'contact@ldesign.com',
      website: 'https://www.ldesign.com'
    }
  },
  {
    label: '发送邮件',
    icon: '📧',
    description: '预填写邮件内容',
    preview: 'mailto:contact@ldesign.com',
    type: 'email',
    data: {
      email: 'contact@ldesign.com',
      subject: '关于LDesign的咨询',
      body: '您好，我想了解更多关于LDesign的信息。'
    }
  },
  {
    label: '地理位置',
    icon: '📍',
    description: 'LDesign总部位置',
    preview: 'geo:39.9042,116.4074',
    type: 'location',
    data: { latitude: 39.9042, longitude: 116.4074 }
  }
]

/**
 * 选择数据类型
 */
const selectType = (type: typeof dataTypes[0]): void => {
  activeType.value = type.id
  formData.value = getDefaultFormData(type.id)
  result.value = null
  // 自动生成默认示例，避免用户空表单时不知所措
  generateQRCodeHandler()
}

/**
 * 不同数据类型的默认表单值，用于快速预览
 */
const getDefaultFormData = (typeId: string): any => {
  switch (typeId) {
    case 'url':
      return { url: 'https://example.com' }
    case 'wifi':
      return { ssid: 'MyWiFi', password: '12345678', security: 'WPA' }
    case 'contact':
      return { name: 'LDesign', phone: '+86-13800138000', email: 'contact@ldesign.com', organization: 'LDesign', website: 'https://www.ldesign.com' }
    case 'email':
      return { email: 'contact@ldesign.com', subject: 'Hello', body: '您好！' }
    case 'sms':
      return { phone: '13800138000', message: '您好！' }
    case 'phone':
      return { phone: '10086' }
    case 'location':
      return { latitude: 39.9042, longitude: 116.4074 }
    case 'text':
      return { text: 'Hello LDesign' }
    default:
      return {}
  }
}

/**
 * 生成二维码
 */
const generateQRCodeHandler = async (): Promise<void> => {
  // 允许在表单数据不完整的情况下也生成一个示例，避免用户误以为无响应
  if (!isFormValid.value && !currentData.value) {
    return
  }

  isLoading.value = true

  try {
    const options: SimpleQRCodeOptions = {
      size: 250,
      format: 'canvas',
      errorCorrectionLevel: 'M'
    }

    const data = currentData.value || 'Hello LDesign'
    const qrResult = await generateQRCode(data, options)
    result.value = qrResult

    await nextTick()
    if (qrContainer.value) {
      const host = qrContainer.value
      host.innerHTML = ''
      const svg = (qrResult as any)?.svg
      const dataURL = (qrResult as any)?.dataURL || (typeof (qrResult as any)?.data === 'string' ? (qrResult as any).data : '')
      if (svg) {
        host.innerHTML = svg
      } else if (dataURL) {
        const img = new Image()
        img.src = dataURL
        img.width = 250
        img.height = 250
        host.appendChild(img)
      } else if (qrResult.element) {
        host.appendChild(qrResult.element as any)
      } else {
        console.warn('二维码结果不包含 svg/dataURL/element')
      }
    } else {
      console.warn('qrContainer 未找到')
    }
  } catch (error) {
    console.error('生成二维码失败:', error)
  } finally {
    isLoading.value = false
  }
}

/**
 * 复制到剪贴板
 */
const copyToClipboard = async (): Promise<void> => {
  if (!currentData.value) return

  try {
    await navigator.clipboard.writeText(currentData.value)
    console.log('数据已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
  }
}

/**
 * 加载快速示例
 */
const loadExample = (example: typeof quickExamples[0]): void => {
  activeType.value = example.type
  formData.value = { ...example.data }
  generateQRCodeHandler()
}

// 监听表单数据变化，自动重新生成二维码
watch(
  [activeType, formData],
  () => {
    if (isFormValid.value) {
      generateQRCodeHandler()
    }
  },
  { deep: true }
)
</script>


<style scoped>
.datatype-example {
  max-width: 100%;
}

.section-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--ldesign-text-color-primary);
  margin-bottom: var(--ls-spacing-sm);
}

.section-description {
  color: var(--ldesign-text-color-secondary);
  margin-bottom: var(--ls-spacing-lg);
  line-height: 1.6;
}

.card-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--ldesign-text-color-primary);
  margin-bottom: var(--ls-spacing-base);
  padding-bottom: var(--ls-spacing-xs);
  border-bottom: 2px solid var(--ldesign-brand-color-2);
}

.type-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--ls-spacing-xs);
  margin-bottom: var(--ls-spacing-base);
}

.type-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--ls-spacing-sm);
  border: 1px solid var(--ldesign-border-level-2-color);
  border-radius: var(--ls-border-radius-base);
  background: var(--ldesign-bg-color-container);
  cursor: pointer;
  transition: all 0.2s ease;
}

.type-btn:hover {
  background: var(--ldesign-bg-color-container-hover);
  border-color: var(--ldesign-brand-color-6);
}

.type-btn.active {
  background: var(--ldesign-brand-color-1);
  border-color: var(--ldesign-brand-color-6);
  color: var(--ldesign-brand-color-7);
}

.type-icon {
  font-size: 1.5rem;
  margin-bottom: var(--ls-spacing-xs);
}

.type-label {
  font-size: 12px;
  font-weight: 500;
  text-align: center;
}

.data-form {
  background: var(--ldesign-gray-color-1);
  padding: var(--ls-spacing-base);
  border-radius: var(--ls-border-radius-base);
  margin-bottom: var(--ls-spacing-base);
}

.form-actions {
  display: flex;
  gap: var(--ls-spacing-sm);
}

.preview-area {
  min-height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.loading {
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--ldesign-border-level-1-color);
  border-top: 3px solid var(--ldesign-brand-color-6);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--ls-spacing-sm);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.qr-result {
  text-align: center;
  width: 100%;
}

.qr-container {
  margin-bottom: var(--ls-spacing-base);
  display: flex;
  justify-content: center;
}

.qr-info {
  background: var(--ldesign-gray-color-1);
  padding: var(--ls-spacing-sm);
  border-radius: var(--ls-border-radius-base);
  text-align: left;
}

.qr-info h4 {
  margin-bottom: var(--ls-spacing-sm);
  color: var(--ldesign-text-color-primary);
}

.qr-info p {
  margin-bottom: var(--ls-spacing-xs);
  font-size: 14px;
}

.data-preview {
  margin-top: var(--ls-spacing-sm);
}

.data-preview h5 {
  margin-bottom: var(--ls-spacing-xs);
  color: var(--ldesign-text-color-primary);
}

.data-preview pre {
  background: white;
  padding: var(--ls-spacing-xs);
  border-radius: var(--ls-border-radius-sm);
  font-size: 12px;
  overflow-x: auto;
  border: 1px solid var(--ldesign-border-level-1-color);
}

.placeholder {
  text-align: center;
  color: var(--ldesign-text-color-placeholder);
}

.placeholder-icon {
  font-size: 3rem;
  margin-bottom: var(--ls-spacing-sm);
}

.quick-examples {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--ls-spacing-base);
}

.example-card {
  padding: var(--ls-spacing-base);
  border: 1px solid var(--ldesign-border-level-1-color);
  border-radius: var(--ls-border-radius-base);
  background: var(--ldesign-bg-color-container);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.example-card:hover {
  background: var(--ldesign-bg-color-container-hover);
  box-shadow: var(--ldesign-shadow-2);
  transform: translateY(-2px);
}

.example-icon {
  font-size: 2rem;
  margin-bottom: var(--ls-spacing-sm);
}

.example-card h4 {
  margin-bottom: var(--ls-spacing-xs);
  color: var(--ldesign-text-color-primary);
}

.example-card p {
  margin-bottom: var(--ls-spacing-sm);
  color: var(--ldesign-text-color-secondary);
  font-size: 14px;
}

.example-preview {
  background: var(--ldesign-gray-color-1);
  padding: var(--ls-spacing-xs);
  border-radius: var(--ls-border-radius-sm);
  font-size: 12px;
  font-family: monospace;
  color: var(--ldesign-text-color-secondary);
  word-break: break-all;
}

.form-checkbox {
  width: 16px;
  height: 16px;
  margin-right: var(--ls-spacing-xs);
  cursor: pointer;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .type-selector {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .quick-examples {
    grid-template-columns: 1fr;
  }
}
</style>
