<script setup lang="ts">
import type { DeviceType } from '@ldesign/template'
import { TemplateRenderer, TemplateSelector, useTemplate } from '@ldesign/template/vue'
import { ref, computed } from 'vue'

// 使用 useTemplate Hook
const {
  currentDevice,
  currentTemplate,
  availableTemplates,
  availableCategories,
  availableDevices,
  switchTemplate,
  loading,
  error,
  scanTemplates,
} = useTemplate({
  autoScan: true,
})

// 当前选择的分类和设备
const selectedCategory = ref('login')
const selectedDevice = ref<DeviceType>('desktop')

// 使用 currentTemplate 作为选中状态，确保与实际状态同步
const selectedTemplate = computed(() => currentTemplate.value?.template || '')

// 模板选择器事件处理
function handleTemplateChange(template: string) {
  console.log('选择了模板:', template)
  switchTemplate(selectedCategory.value, selectedDevice.value, template)
}

function handleTemplatePreview(template: string) {
  console.log('预览模板:', template)
}

// 设备切换
function handleDeviceChange() {
  // 重新扫描当前设备的模板
  scanTemplates()
}

// 分类切换
function handleCategoryChange() {
  // 重新扫描当前分类的模板
  scanTemplates()
}
</script>

<template>
  <div class="selector-demo">
    <div class="selector-demo__header">
      <div class="selector-demo__container">
        <router-link to="/" class="selector-demo__back"> ← 返回首页 </router-link>
        <h1 class="selector-demo__title">🎨 模板选择器演示</h1>
        <p class="selector-demo__subtitle">体验智能模板选择和实时预览功能</p>
      </div>
    </div>

    <div class="selector-demo__content">
      <div class="selector-demo__container">
        <!-- 控制面板 -->
        <div class="selector-demo__controls">
          <div class="selector-demo__control-group">
            <label class="selector-demo__label">分类:</label>
            <select v-model="selectedCategory" class="selector-demo__select" @change="handleCategoryChange">
              <option v-for="category in availableCategories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>

          <div class="selector-demo__control-group">
            <label class="selector-demo__label">设备:</label>
            <select v-model="selectedDevice" class="selector-demo__select" @change="handleDeviceChange">
              <option v-for="device in availableDevices" :key="device" :value="device">
                {{ device === 'desktop' ? '🖥️ 桌面' : device === 'tablet' ? '📱 平板' : '📱 手机' }}
              </option>
            </select>
          </div>

          <div class="selector-demo__info">
            <div class="selector-demo__info-item">
              <span class="selector-demo__info-label">当前模板:</span>
              <span class="selector-demo__info-value">{{ selectedTemplate || '未选择' }}</span>
            </div>
            <div class="selector-demo__info-item">
              <span class="selector-demo__info-label">可用模板数:</span>
              <span class="selector-demo__info-value">{{ availableTemplates.length }}</span>
            </div>
          </div>
        </div>

        <!-- 模板选择器 -->
        <div class="selector-demo__selector">
          <TemplateSelector
            :category="selectedCategory"
            :device="selectedDevice"
            :current-template="selectedTemplate"
            :templates="availableTemplates"
            :show-preview="true"
            :show-search="true"
            layout="grid"
            :columns="3"
            :show-info="true"
            @template-change="handleTemplateChange"
            @template-preview="handleTemplatePreview"
          />
        </div>

        <!-- 模板预览 -->
        <div v-if="selectedTemplate" class="selector-demo__preview">
          <h3>模板预览</h3>
          <div class="selector-demo__preview-container">
            <TemplateRenderer
              :category="selectedCategory"
              :device="selectedDevice"
              :template="selectedTemplate"
              @login="data => alert(`登录: ${data.username}`)"
              @register="() => alert('注册')"
              @forgot-password="data => alert(`重置密码: ${data.username}`)"
              @third-party-login="data => alert(`第三方登录: ${data.provider}`)"
            />
          </div>
        </div>

        <!-- 使用说明 -->
        <div class="selector-demo__usage">
          <h3>使用说明</h3>
          <div class="selector-demo__usage-content">
            <h4>功能特性</h4>
            <ul>
              <li>🎯 <strong>智能分类</strong>：根据模板分类自动分组显示</li>
              <li>📱 <strong>设备适配</strong>：根据设备类型动态筛选模板</li>
              <li>🔍 <strong>实时搜索</strong>：支持模板名称、描述、标签搜索</li>
              <li>👀 <strong>预览功能</strong>：鼠标悬停即可预览模板</li>
              <li>🎨 <strong>多种布局</strong>：支持网格和列表两种布局模式</li>
              <li>⚡ <strong>实时响应</strong>：设备类型变化时自动更新模板列表</li>
            </ul>

            <h4>使用方式</h4>
            <ol>
              <li>选择模板分类（如 login、dashboard 等）</li>
              <li>选择目标设备类型（desktop、tablet、mobile）</li>
              <li>在模板选择器中浏览可用模板</li>
              <li>点击模板卡片进行选择</li>
              <li>在下方预览区域查看模板效果</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.selector-demo {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  &__header {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    padding: 40px 0;
    text-align: center;
    color: white;
  }

  &__container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  &__back {
    display: inline-block;
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    margin-bottom: 20px;
    transition: color 0.2s;

    &:hover {
      color: white;
    }
  }

  &__title {
    font-size: 48px;
    font-weight: 700;
    margin: 0 0 16px 0;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  &__subtitle {
    font-size: 20px;
    margin: 0;
    opacity: 0.9;
  }

  &__content {
    padding: 40px 0;
  }

  &__controls {
    background: white;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    align-items: center;
  }

  &__control-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__label {
    font-weight: 600;
    color: #333;
    min-width: 60px;
  }

  &__select {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    min-width: 120px;
    outline: none;
    transition: border-color 0.2s;

    &:focus {
      border-color: #667eea;
    }
  }

  &__info {
    display: flex;
    gap: 20px;
    margin-left: auto;

    &-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    &-label {
      font-size: 14px;
      color: #666;
    }

    &-value {
      font-weight: 600;
      color: #333;
    }
  }

  &__selector {
    margin-bottom: 24px;
  }

  &__preview {
    background: white;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

    h3 {
      margin: 0 0 20px 0;
      color: #333;
      font-size: 18px;
      font-weight: 600;
    }

    &-container {
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 20px;
      background: #f8f9fa;
    }
  }

  &__usage {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

    h3 {
      margin: 0 0 20px 0;
      color: #333;
      font-size: 18px;
      font-weight: 600;
    }

    h4 {
      margin: 20px 0 12px 0;
      color: #333;
      font-size: 16px;
      font-weight: 600;
    }

    &-content {
      color: #666;
      line-height: 1.6;

      ul,
      ol {
        padding-left: 20px;
      }

      li {
        margin-bottom: 8px;
      }

      strong {
        color: #333;
      }
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    &__title {
      font-size: 32px;
    }

    &__subtitle {
      font-size: 16px;
    }

    &__controls {
      flex-direction: column;
      align-items: stretch;
    }

    &__info {
      margin-left: 0;
      flex-direction: column;
      gap: 12px;
    }

    &__control-group {
      justify-content: space-between;
    }

    &__select {
      min-width: 150px;
    }
  }
}
</style>
