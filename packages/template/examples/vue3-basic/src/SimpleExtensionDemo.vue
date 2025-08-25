<template>
  <div class="simple-extension-demo">
    <div class="demo-header">
      <h1>模板扩展机制演示</h1>
      <p>演示外部模板的注册和使用</p>
    </div>

    <div class="demo-content">
      <div class="section">
        <h3>1. 模板注册表状态</h3>
        <div class="info-grid">
          <div class="info-item">
            <strong>默认模板数量:</strong>
            <span>{{ defaultTemplatesCount }}</span>
          </div>
          <div class="info-item">
            <strong>外部模板数量:</strong>
            <span>{{ externalTemplatesCount }}</span>
          </div>
          <div class="info-item">
            <strong>总模板数量:</strong>
            <span>{{ totalTemplatesCount }}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <h3>2. 注册外部模板</h3>
        <button @click="registerCustomTemplate" class="btn">
          注册自定义登录模板
        </button>
        <p v-if="registrationMessage" class="message">{{ registrationMessage }}</p>
      </div>

      <div class="section">
        <h3>3. 模板列表</h3>
        <div class="template-list">
          <div 
            v-for="template in allTemplates" 
            :key="template.name + template.deviceType"
            class="template-item"
            :class="{ external: template.isExternal }"
          >
            <div class="template-info">
              <strong>{{ template.displayName || template.name }}</strong>
              <span class="template-meta">
                {{ template.category }} / {{ template.deviceType }}
                <span v-if="template.isExternal" class="external-badge">外部</span>
              </span>
            </div>
            <div class="template-description">
              {{ template.description }}
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <h3>4. 扩展统计</h3>
        <div class="stats">
          <div class="stat-item">
            <strong>按分类统计:</strong>
            <div v-for="(count, category) in extensionStats.byCategory" :key="category">
              {{ category }}: {{ count }}
            </div>
          </div>
          <div class="stat-item">
            <strong>按设备统计:</strong>
            <div v-for="(count, device) in extensionStats.byDevice" :key="device">
              {{ device }}: {{ count }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTemplateRegistry, useTemplateExtension, createExternalTemplate } from '@ldesign/template'
import type { TemplateConfig } from '@ldesign/template'

// 状态
const registrationMessage = ref('')

// 使用模板注册表和扩展
const { getAllTemplates } = useTemplateRegistry()
const { 
  externalTemplates, 
  getExtensionStats, 
  registerExternalTemplate,
  validateTemplateConfig 
} = useTemplateExtension()

// 计算属性
const allTemplates = getAllTemplates()
const extensionStats = getExtensionStats

const defaultTemplatesCount = computed(() => {
  return allTemplates.value.filter(t => !t.isExternal).length
})

const externalTemplatesCount = computed(() => {
  return externalTemplates.value.length
})

const totalTemplatesCount = computed(() => {
  return allTemplates.value.length
})

// 创建自定义模板配置
const createCustomTemplateConfig = (): TemplateConfig => ({
  id: 'login-desktop-custom',
  name: '自定义登录模板',
  description: '一个演示外部模板扩展功能的自定义登录模板',
  version: '1.0.0',
  author: 'External Developer',
  category: 'login',
  device: 'desktop',
  variant: 'custom',
  isDefault: false,
  features: [
    '渐变背景设计',
    '现代化UI风格', 
    '响应式布局',
    '表单验证',
    '自定义样式'
  ],
  preview: '/previews/custom-login.png',
  tags: ['自定义', '外部', '现代', '渐变', '演示'],
  props: {
    title: {
      type: 'string',
      default: '自定义登录',
      description: '登录页面标题',
      required: false
    },
    subtitle: {
      type: 'string', 
      default: '外部模板示例',
      description: '登录页面副标题',
      required: false
    }
  },
  dependencies: ['vue'],
  compatibility: {
    vue: '^3.0.0',
    node: '>=16.0.0',
    browsers: ['Chrome >= 88', 'Firefox >= 85', 'Safari >= 14']
  },
  config: {
    theme: 'gradient',
    animation: true,
    responsive: true
  },
  priority: 10,
  enabled: true,
  createdAt: '2024-01-20',
  updatedAt: '2024-01-20'
})

// 创建模拟组件
const createMockComponent = () => ({
  name: 'CustomLoginTemplate',
  render() {
    return {
      type: 'div',
      props: {
        style: {
          padding: '2rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '8px',
          textAlign: 'center'
        }
      },
      children: [
        {
          type: 'h2',
          children: '🎨 自定义登录模板'
        },
        {
          type: 'p',
          children: '这是一个外部注册的模板，演示模板扩展功能'
        },
        {
          type: 'div',
          props: {
            style: {
              marginTop: '1rem',
              padding: '1rem',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '4px'
            }
          },
          children: '✨ 支持完整的模板目录结构和配置文件'
        }
      ]
    }
  }
})

// 注册自定义模板
const registerCustomTemplate = () => {
  try {
    const config = createCustomTemplateConfig()
    const component = createMockComponent()
    
    // 验证配置
    if (!validateTemplateConfig(config)) {
      registrationMessage.value = '❌ 模板配置验证失败'
      return
    }
    
    // 创建外部模板
    const externalTemplate = createExternalTemplate(config, component)
    
    // 注册模板
    registerExternalTemplate(externalTemplate)
    
    registrationMessage.value = '✅ 自定义模板注册成功！'
    
    // 3秒后清除消息
    setTimeout(() => {
      registrationMessage.value = ''
    }, 3000)
    
  } catch (error) {
    registrationMessage.value = `❌ 注册失败: ${error}`
  }
}

// 初始化
onMounted(() => {
  console.log('模板扩展演示初始化完成')
  console.log('默认模板数量:', defaultTemplatesCount.value)
  console.log('外部模板数量:', externalTemplatesCount.value)
})
</script>

<style scoped>
.simple-extension-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.demo-header {
  text-align: center;
  margin-bottom: 3rem;
}

.demo-header h1 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.demo-header p {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section h3 {
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 1rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s;
}

.btn:hover {
  background: #2980b9;
}

.message {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 4px;
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.template-list {
  display: grid;
  gap: 1rem;
}

.template-item {
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  transition: border-color 0.3s;
}

.template-item:hover {
  border-color: #3498db;
}

.template-item.external {
  border-left: 4px solid #e74c3c;
  background: #fdf2f2;
}

.template-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.template-meta {
  font-size: 0.875rem;
  color: #6c757d;
}

.external-badge {
  background: #e74c3c;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
  font-size: 0.75rem;
  margin-left: 0.5rem;
}

.template-description {
  color: #6c757d;
  font-size: 0.875rem;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.stat-item {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.stat-item strong {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.stat-item div {
  margin: 0.25rem 0;
  color: #6c757d;
}
</style>
