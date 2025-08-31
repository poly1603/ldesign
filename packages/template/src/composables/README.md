# 组合式函数模块 (Composables)

## 📋 概述

组合式函数模块提供了一系列Vue 3 Composition API风格的可复用逻辑函数，用于在Vue组件中轻松集成模板管理系统的各种功能。

## ✨ 主要特性

- **🎯 Vue 3 优化**：专为Vue 3 Composition API设计
- **🔄 响应式数据**：所有状态都是响应式的
- **🧩 可复用逻辑**：高度模块化的业务逻辑封装
- **📱 设备感知**：自动检测和响应设备类型变化
- **⚡ 性能优化**：内置缓存和防抖机制
- **🛠️ TypeScript支持**：完整的类型定义和推导

## 🚀 快速开始

### 基础使用

```vue
<template>
  <div>
    <div v-if="isLoading">加载中...</div>
    <div v-else>
      <div v-for="template in templates" :key="template.name">
        {{ template.displayName }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTemplateScanner } from '@ldesign/template/composables'

const {
  templates,
  isLoading,
  scan,
  getTemplatesByCategory
} = useTemplateScanner({
  templatesDir: 'src/templates',
  autoScan: true
})

// 获取登录模板
const loginTemplates = getTemplatesByCategory('login')
</script>
```

## 📚 可用的组合式函数

### 1. useTemplateScanner

模板扫描功能的组合式函数

```typescript
import { useTemplateScanner } from '@ldesign/template/composables'

const {
  // 响应式状态
  templates,           // 所有模板的响应式Map
  isScanning,         // 是否正在扫描
  scanError,          // 扫描错误信息
  
  // 方法
  scan,               // 执行扫描
  getTemplatesByCategory,  // 按分类获取模板
  getTemplatesByDevice,    // 按设备获取模板
  searchTemplates,         // 搜索模板
  
  // 扫描器实例
  scanner             // 底层扫描器实例
} = useTemplateScanner(options)
```

**参数选项：**
```typescript
interface UseScannerOptions {
  templatesDir: string
  autoScan?: boolean
  enableCache?: boolean
  watchMode?: boolean
  onScanComplete?: (result: ScanResult) => void
  onScanError?: (error: Error) => void
}
```

### 2. useTemplateSelector

模板选择和过滤功能

```typescript
import { useTemplateSelector } from '@ldesign/template/composables'

const {
  // 响应式状态
  availableTemplates,  // 可用模板列表
  filteredTemplates,   // 过滤后的模板列表
  selectedTemplate,    // 当前选中的模板
  searchQuery,         // 搜索关键词
  loading,            // 加载状态
  error,              // 错误信息
  
  // 方法
  selectTemplate,      // 选择模板
  previewTemplate,     // 预览模板
  searchTemplates,     // 搜索模板
  filterByCategory,    // 按分类过滤
  filterByDevice,      // 按设备过滤
  reset               // 重置状态
} = useTemplateSelector(options)
```

**参数选项：**
```typescript
interface UseSelectorOptions {
  templates: TemplateMetadata[]
  device?: DeviceType
  onSelect?: (template: TemplateMetadata) => void
  onPreview?: (template: TemplateMetadata) => void
}
```

### 3. useTemplateRenderer

模板渲染功能

```typescript
import { useTemplateRenderer } from '@ldesign/template/composables'

const {
  // 响应式状态
  currentTemplate,     // 当前模板
  renderedComponent,   // 渲染的组件
  isLoading,          // 是否正在加载
  loadError,          // 加载错误
  
  // 方法
  renderTemplate,      // 渲染模板
  clearTemplate       // 清除模板
} = useTemplateRenderer(options)
```

**参数选项：**
```typescript
interface UseRendererOptions {
  enableCache?: boolean
  onRenderComplete?: (component: Component) => void
  onRenderError?: (error: Error) => void
}
```

### 4. useTemplateConfig

配置管理功能

```typescript
import { useTemplateConfig } from '@ldesign/template/composables'

const {
  // 响应式状态
  config,             // 当前配置
  
  // 方法
  updateConfig,       // 更新配置
  resetConfig,        // 重置配置
  validateConfig,     // 验证配置
  exportConfig,       // 导出配置
  importConfig        // 导入配置
} = useTemplateConfig(initialConfig)
```

### 5. useDeviceDetection

设备检测功能

```typescript
import { useDeviceDetection } from '@ldesign/template/composables'

const {
  // 响应式状态
  currentDevice,      // 当前设备类型
  isMobile,          // 是否移动设备
  isTablet,          // 是否平板设备
  isDesktop,         // 是否桌面设备
  
  // 方法
  detectDevice,       // 手动检测设备
  onDeviceChange     // 监听设备变化
} = useDeviceDetection()
```

## 🎯 使用示例

### 完整的模板选择器组件

```vue
<template>
  <div class="template-selector">
    <!-- 搜索框 -->
    <input 
      v-model="searchQuery" 
      placeholder="搜索模板..."
      class="search-input"
    />
    
    <!-- 设备类型选择 -->
    <div class="device-selector">
      <button 
        v-for="device in devices" 
        :key="device"
        :class="{ active: currentDevice === device }"
        @click="filterByDevice(device)"
      >
        {{ device }}
      </button>
    </div>
    
    <!-- 分类过滤 -->
    <div class="category-filter">
      <button 
        v-for="category in categories" 
        :key="category"
        @click="filterByCategory(category)"
      >
        {{ category }}
      </button>
    </div>
    
    <!-- 模板列表 -->
    <div class="template-list">
      <div 
        v-for="template in filteredTemplates" 
        :key="template.name"
        class="template-item"
        :class="{ selected: selectedTemplate?.name === template.name }"
        @click="selectTemplate(template)"
      >
        <img :src="template.preview" :alt="template.displayName" />
        <h3>{{ template.displayName }}</h3>
        <p>{{ template.description }}</p>
      </div>
    </div>
    
    <!-- 预览区域 -->
    <div v-if="selectedTemplate" class="template-preview">
      <h3>{{ selectedTemplate.displayName }}</h3>
      <button @click="previewTemplate(selectedTemplate)">
        预览模板
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  useTemplateScanner, 
  useTemplateSelector, 
  useDeviceDetection 
} from '@ldesign/template/composables'

// 扫描模板
const { templates } = useTemplateScanner({
  templatesDir: 'src/templates',
  autoScan: true
})

// 设备检测
const { currentDevice } = useDeviceDetection()

// 模板选择
const {
  filteredTemplates,
  selectedTemplate,
  searchQuery,
  selectTemplate,
  previewTemplate,
  filterByCategory,
  filterByDevice
} = useTemplateSelector({
  templates: templates.value,
  device: currentDevice.value
})

// 可用设备和分类
const devices = ['desktop', 'tablet', 'mobile']
const categories = ['login', 'dashboard', 'user', 'form']
</script>
```

### 模板渲染器组件

```vue
<template>
  <div class="template-renderer">
    <div v-if="isLoading" class="loading">
      加载模板中...
    </div>
    
    <div v-else-if="loadError" class="error">
      加载失败: {{ loadError.message }}
    </div>
    
    <component 
      v-else-if="renderedComponent" 
      :is="renderedComponent"
      v-bind="templateProps"
    />
    
    <div v-else class="empty">
      请选择一个模板
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useTemplateRenderer } from '@ldesign/template/composables'

interface Props {
  template?: TemplateMetadata
  templateProps?: Record<string, any>
}

const props = defineProps<Props>()

const {
  renderedComponent,
  isLoading,
  loadError,
  renderTemplate,
  clearTemplate
} = useTemplateRenderer({
  enableCache: true,
  onRenderComplete: (component) => {
    console.log('模板渲染完成:', component)
  },
  onRenderError: (error) => {
    console.error('模板渲染失败:', error)
  }
})

// 监听模板变化
watch(() => props.template, (newTemplate) => {
  if (newTemplate) {
    renderTemplate(newTemplate)
  } else {
    clearTemplate()
  }
}, { immediate: true })
</script>
```

### 配置管理组件

```vue
<template>
  <div class="config-manager">
    <h3>系统配置</h3>
    
    <form @submit.prevent="saveConfig">
      <div class="form-group">
        <label>模板目录:</label>
        <input v-model="config.templatesDir" />
      </div>
      
      <div class="form-group">
        <label>
          <input 
            v-model="config.autoScan" 
            type="checkbox"
          />
          自动扫描
        </label>
      </div>
      
      <div class="form-group">
        <label>
          <input 
            v-model="config.debug" 
            type="checkbox"
          />
          调试模式
        </label>
      </div>
      
      <div class="form-actions">
        <button type="submit">保存配置</button>
        <button type="button" @click="resetConfig">重置</button>
        <button type="button" @click="exportConfigFile">导出</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useTemplateConfig } from '@ldesign/template/composables'

const {
  config,
  updateConfig,
  resetConfig,
  validateConfig,
  exportConfig
} = useTemplateConfig({
  templatesDir: 'src/templates',
  autoScan: true,
  debug: false
})

const saveConfig = () => {
  const validation = validateConfig(config.value)
  
  if (validation.valid) {
    updateConfig(config.value)
    console.log('配置已保存')
  } else {
    console.error('配置验证失败:', validation.errors)
  }
}

const exportConfigFile = () => {
  const configJson = exportConfig()
  const blob = new Blob([configJson], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = 'template-config.json'
  a.click()
  
  URL.revokeObjectURL(url)
}
</script>
```

## 🔧 高级用法

### 自定义组合式函数

```typescript
import { ref, computed } from 'vue'
import { useTemplateScanner } from '@ldesign/template/composables'

// 创建自定义组合式函数
export function useTemplateLibrary(category: string) {
  const { templates, scan } = useTemplateScanner({
    templatesDir: 'src/templates',
    autoScan: true
  })
  
  const categoryTemplates = computed(() => {
    return Array.from(templates.value.values())
      .filter(template => template.category === category)
  })
  
  const favoriteTemplates = ref<string[]>([])
  
  const addToFavorites = (templateName: string) => {
    if (!favoriteTemplates.value.includes(templateName)) {
      favoriteTemplates.value.push(templateName)
    }
  }
  
  const removeFromFavorites = (templateName: string) => {
    const index = favoriteTemplates.value.indexOf(templateName)
    if (index > -1) {
      favoriteTemplates.value.splice(index, 1)
    }
  }
  
  return {
    templates: categoryTemplates,
    favoriteTemplates,
    addToFavorites,
    removeFromFavorites,
    refresh: scan
  }
}
```

### 组合多个功能

```typescript
import { 
  useTemplateScanner, 
  useTemplateSelector, 
  useDeviceDetection 
} from '@ldesign/template/composables'

export function useTemplateWorkspace() {
  // 设备检测
  const { currentDevice, onDeviceChange } = useDeviceDetection()
  
  // 模板扫描
  const { templates, scan } = useTemplateScanner({
    templatesDir: 'src/templates',
    autoScan: true
  })
  
  // 模板选择
  const {
    filteredTemplates,
    selectedTemplate,
    selectTemplate,
    searchTemplates
  } = useTemplateSelector({
    templates: templates.value,
    device: currentDevice.value
  })
  
  // 监听设备变化，自动重新过滤
  onDeviceChange((newDevice) => {
    // 重新过滤适合新设备的模板
    searchTemplates({ device: newDevice })
  })
  
  return {
    currentDevice,
    templates: filteredTemplates,
    selectedTemplate,
    selectTemplate,
    searchTemplates,
    refresh: scan
  }
}
```

## 🛠️ 故障排除

### 常见问题

**Q: 组合式函数返回的数据不是响应式的？**
A: 确保使用 `ref()` 或 `reactive()` 包装数据，并正确返回响应式引用。

**Q: 模板扫描不自动执行？**
A: 检查 `autoScan` 选项是否设置为 `true`。

**Q: 设备检测不准确？**
A: 确保在浏览器环境中使用，服务端渲染时需要特殊处理。

### 调试技巧

```typescript
// 启用调试模式
const { templates, scan } = useTemplateScanner({
  templatesDir: 'src/templates',
  debug: true  // 启用调试输出
})

// 监听状态变化
watch(templates, (newTemplates) => {
  console.log('模板更新:', newTemplates.size)
}, { deep: true })
```

## 📝 最佳实践

1. **合理使用缓存**：在频繁渲染的组件中启用缓存
2. **错误边界**：为模板渲染添加错误处理
3. **性能优化**：使用 `shallowRef` 处理大量数据
4. **类型安全**：充分利用TypeScript类型推导
5. **组合使用**：将多个组合式函数组合使用以实现复杂功能

## 🔗 相关模块

- [模板扫描器](../scanner/README.md)
- [配置管理器](../config/README.md)
- [工具函数](../utils/README.md)
- [Vue组件](../components/README.md)

## 📄 许可证

MIT License - 详见 [LICENSE](../../../LICENSE) 文件
