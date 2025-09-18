<template>
  <div class="template-demo">
    <h1>模板系统演示</h1>
    
    <!-- 示例1: 使用 TemplateRenderer 组件 -->
    <section class="demo-section">
      <h2>1. 使用 TemplateRenderer 组件</h2>
      <div class="demo-content">
        <TemplateRenderer
          category="login"
          :device="selectedDevice"
          :template-name="selectedTemplate"
          :show-selector="showSelector"
          :responsive="responsive"
          :props="templateProps"
          @template-change="handleTemplateChange"
          @load-error="handleLoadError"
        />
      </div>
      <div class="demo-controls">
        <label>
          <input type="checkbox" v-model="showSelector">
          显示模板选择器
        </label>
        <label>
          <input type="checkbox" v-model="responsive">
          响应式设备检测
        </label>
        <select v-model="selectedDevice">
          <option value="desktop">桌面</option>
          <option value="tablet">平板</option>
          <option value="mobile">手机</option>
        </select>
        <select v-model="selectedTemplate">
          <option value="default">默认</option>
          <option value="modern">现代</option>
          <option value="creative">创意</option>
        </select>
      </div>
    </section>

    <!-- 示例2: 使用 useTemplate Hook -->
    <section class="demo-section">
      <h2>2. 使用 useTemplate Hook</h2>
      <div class="demo-content">
        <div v-if="loading" class="loading">加载中...</div>
        <div v-else-if="error" class="error">错误: {{ error }}</div>
        <component 
          v-else-if="currentComponent"
          :is="currentComponent" 
          v-bind="templateProps"
        />
      </div>
      <div class="demo-controls">
        <button @click="switchToTemplate('default')">切换到默认</button>
        <button @click="switchToTemplate('modern')">切换到现代</button>
        <button @click="switchToTemplate('creative')">切换到创意</button>
        <button @click="refreshTemplates">刷新模板</button>
      </div>
      <div class="template-info" v-if="currentTemplate">
        <h3>当前模板信息</h3>
        <ul>
          <li>名称: {{ currentTemplate.name }}</li>
          <li>显示名: {{ currentTemplate.displayName }}</li>
          <li>描述: {{ currentTemplate.description }}</li>
          <li>版本: {{ currentTemplate.version }}</li>
          <li>作者: {{ currentTemplate.author }}</li>
          <li>设备: {{ currentTemplate.device }}</li>
        </ul>
      </div>
    </section>

    <!-- 示例3: 使用 useTemplateList Hook -->
    <section class="demo-section">
      <h2>3. 使用 useTemplateList Hook</h2>
      <div class="template-list">
        <div v-if="listLoading" class="loading">加载模板列表...</div>
        <div v-else-if="listError" class="error">错误: {{ listError }}</div>
        <div v-else class="template-grid">
          <div 
            v-for="template in availableTemplates" 
            :key="template.name"
            class="template-card"
            :class="{ active: template.name === selectedListTemplate }"
            @click="selectListTemplate(template.name)"
          >
            <h4>{{ template.displayName }}</h4>
            <p>{{ template.description }}</p>
            <div class="template-meta">
              <span>{{ template.device }}</span>
              <span>v{{ template.version }}</span>
            </div>
            <div class="template-tags" v-if="template.tags">
              <span v-for="tag in template.tags" :key="tag" class="tag">
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 示例4: 使用 simpleTemplateScanner 直接获取组件 -->
    <section class="demo-section">
      <h2>4. 使用 simpleTemplateScanner 直接获取组件</h2>
      <div class="demo-content">
        <component 
          v-if="asyncComponent"
          :is="asyncComponent" 
          v-bind="templateProps"
        />
      </div>
      <div class="demo-controls">
        <button @click="loadAsyncComponent('default')">加载默认模板</button>
        <button @click="loadAsyncComponent('modern')">加载现代模板</button>
        <button @click="loadAsyncComponent('creative')">加载创意模板</button>
      </div>
    </section>

    <!-- 示例5: 使用 TemplateSelector 组件 -->
    <section class="demo-section">
      <h2>5. 使用 TemplateSelector 组件</h2>
      <button @click="showSelectorModal = true">打开模板选择器</button>
      <TemplateSelector
        v-if="showSelectorModal"
        category="login"
        device="desktop"
        :current-template="selectedTemplate"
        :visible="showSelectorModal"
        :show-preview="true"
        :searchable="true"
        @select="handleSelectorSelect"
        @close="showSelectorModal = false"
      />
    </section>

    <!-- 示例6: 使用 useTemplateScanner Hook -->
    <section class="demo-section">
      <h2>6. 使用 useTemplateScanner Hook</h2>
      <div class="scanner-controls">
        <button @click="scan">重新扫描</button>
        <input 
          v-model="searchQuery" 
          placeholder="搜索模板..."
          @input="handleSearch"
        >
      </div>
      <div class="scanner-results">
        <div v-if="scannerLoading" class="loading">扫描中...</div>
        <div v-else-if="scannerError" class="error">{{ scannerError }}</div>
        <div v-else>
          <p>找到 {{ searchResults.length }} 个模板</p>
          <ul>
            <li v-for="t in searchResults" :key="`${t.category}-${t.device}-${t.name}`">
              {{ t.category }}/{{ t.device }}/{{ t.name }} - {{ t.displayName }}
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  TemplateRenderer,
  TemplateSelector,
  useTemplate,
  useTemplateList,
  useTemplateScanner,
  simpleTemplateScanner,
  type DeviceType
} from '@ldesign/template'

// === 示例1: TemplateRenderer 组件 ===
const selectedDevice = ref<DeviceType>('desktop')
const selectedTemplate = ref('default')
const showSelector = ref(false)
const responsive = ref(true)
const templateProps = ref({
  title: '欢迎登录',
  subtitle: '请输入您的账号信息'
})

const handleTemplateChange = (templateName: string) => {
  console.log('模板已切换:', templateName)
  selectedTemplate.value = templateName
}

const handleLoadError = (error: Error) => {
  console.error('模板加载失败:', error)
}

// === 示例2: useTemplate Hook ===
const {
  currentTemplate,
  currentComponent,
  loading,
  error,
  switchTemplate,
  refreshTemplates
} = useTemplate({
  category: 'login',
  device: 'desktop',
  enableCache: true
})

const switchToTemplate = async (name: string) => {
  await switchTemplate(name)
}

// === 示例3: useTemplateList Hook ===
const {
  availableTemplates,
  loading: listLoading,
  error: listError
} = useTemplateList('login', 'desktop')

const selectedListTemplate = ref('')

const selectListTemplate = (name: string) => {
  selectedListTemplate.value = name
  console.log('选择模板:', name)
}

// === 示例4: simpleTemplateScanner ===
const asyncComponent = ref<any>(null)

const loadAsyncComponent = (name: string) => {
  const component = simpleTemplateScanner.getAsyncComponent('login', 'desktop', name)
  if (component) {
    asyncComponent.value = component
    console.log('异步组件已加载:', name)
  } else {
    console.error('找不到模板:', name)
  }
}

// === 示例5: TemplateSelector 组件 ===
const showSelectorModal = ref(false)

const handleSelectorSelect = (templateName: string) => {
  selectedTemplate.value = templateName
  showSelectorModal.value = false
  console.log('从选择器选择:', templateName)
}

// === 示例6: useTemplateScanner Hook ===
const {
  templates,
  loading: scannerLoading,
  error: scannerError,
  scan,
  searchTemplates
} = useTemplateScanner()

const searchQuery = ref('')
const searchResults = computed(() => {
  if (!searchQuery.value) return templates.value
  return searchTemplates(searchQuery.value)
})

const handleSearch = () => {
  console.log('搜索:', searchQuery.value, '结果数:', searchResults.value.length)
}
</script>

<style scoped>
.template-demo {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  color: #333;
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
  margin-bottom: 30px;
}

.demo-section {
  margin-bottom: 50px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #f9f9f9;
}

.demo-section h2 {
  color: #007bff;
  margin-bottom: 20px;
}

.demo-content {
  min-height: 200px;
  padding: 20px;
  background: white;
  border-radius: 4px;
  margin-bottom: 20px;
}

.demo-controls {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.demo-controls label {
  display: flex;
  align-items: center;
  gap: 5px;
}

.demo-controls button {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.demo-controls button:hover {
  background: #0056b3;
}

.demo-controls select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.loading {
  text-align: center;
  color: #666;
  padding: 40px;
}

.error {
  color: #dc3545;
  padding: 20px;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
}

.template-info {
  margin-top: 20px;
  padding: 15px;
  background: #e9ecef;
  border-radius: 4px;
}

.template-info h3 {
  margin-top: 0;
  color: #495057;
}

.template-info ul {
  list-style: none;
  padding: 0;
}

.template-info li {
  padding: 5px 0;
  border-bottom: 1px solid #dee2e6;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.template-card {
  padding: 15px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.template-card:hover {
  border-color: #007bff;
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.1);
}

.template-card.active {
  border-color: #28a745;
  background: #f0f8f0;
}

.template-card h4 {
  margin-top: 0;
  color: #333;
}

.template-card p {
  color: #666;
  font-size: 14px;
}

.template-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  font-size: 12px;
  color: #999;
}

.template-tags {
  margin-top: 10px;
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.tag {
  padding: 2px 8px;
  background: #007bff;
  color: white;
  border-radius: 12px;
  font-size: 11px;
}

.scanner-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.scanner-controls input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.scanner-results {
  padding: 15px;
  background: white;
  border-radius: 4px;
}

.scanner-results ul {
  list-style: none;
  padding: 0;
}

.scanner-results li {
  padding: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.scanner-results li:last-child {
  border-bottom: none;
}
</style>