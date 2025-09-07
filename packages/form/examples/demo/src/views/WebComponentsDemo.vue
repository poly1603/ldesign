<template>
  <div class="webcomponents-demo">
    <div class="demo-container">
      <div class="demo-header">
        <h1>Web Components演示</h1>
        <p>使用Lit框架创建的Web Components查询表单，展示现代组件化开发</p>
      </div>
      
      <div class="demo-content">
        <div class="demo-layout">
          <!-- 配置面板 -->
          <div class="config-panel">
            <h3>配置面板</h3>
            <div class="config-options">
              <div class="config-item">
                <label>默认行数：</label>
                <select v-model="config.defaultRowCount" @change="updateWebComponents">
                  <option value="1">1 行</option>
                  <option value="2">2 行</option>
                  <option value="3">3 行</option>
                </select>
              </div>
              
              <div class="config-item">
                <label>
                  <input 
                    type="checkbox" 
                    v-model="config.collapsible" 
                    @change="updateWebComponents"
                  />
                  支持展开收起
                </label>
              </div>
              
              <div class="config-item">
                <label>按钮位置：</label>
                <select v-model="config.actionPosition" @change="updateWebComponents">
                  <option value="inline">行内</option>
                  <option value="newline">新行</option>
                </select>
              </div>
              
              <div class="config-item">
                <label>按钮对齐：</label>
                <select v-model="config.actionAlign" @change="updateWebComponents">
                  <option value="left">左对齐</option>
                  <option value="center">居中</option>
                  <option value="right">右对齐</option>
                </select>
              </div>

              <div class="config-item">
                <label>布局模式：</label>
                <select v-model="config.layoutMode" @change="updateWebComponents">
                  <option value="adaptive">自适应</option>
                  <option value="fixed-2">固定2列</option>
                  <option value="fixed-3">固定3列</option>
                  <option value="fixed-4">固定4列</option>
                </select>
              </div>

              <div class="config-item">
                <label>字段最小宽度：</label>
                <select v-model="config.minFieldWidth" @change="updateWebComponents">
                  <option :value="150">150px</option>
                  <option :value="180">180px</option>
                  <option :value="200">200px</option>
                  <option :value="220">220px</option>
                </select>
              </div>
            </div>
            
            <div class="status-info">
              <h4>表单状态</h4>
              <div><strong>展开状态：</strong>{{ formStatus.isExpanded ? '已展开' : '已收起' }}</div>
              <div><strong>可见行数：</strong>{{ formStatus.visibleRows }} / {{ formStatus.maxRows }}</div>
              <div><strong>字段总数：</strong>{{ formStatus.fieldCount }}</div>
              <div><strong>动态列数：</strong>{{ formStatus.dynamicColumns || 4 }}</div>
              <div><strong>容器宽度：</strong>{{ formStatus.containerWidth || 800 }}px</div>
            </div>
          </div>
          
          <!-- 表单演示区域 -->
          <div class="form-section">
            <h3>查询表单 (Web Components)</h3>
            <div class="form-container">
              <query-form-component
                ref="queryFormRef"
                :config="config"
                @toggle="handleToggle"
                @query="handleQuery"
                @reset="handleReset"
                @layout-update="handleLayoutUpdate"
              ></query-form-component>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { DEFAULT_FIELDS, type FormConfig } from '../utils/formLayoutUtils'

// 配置数据
const config = reactive<FormConfig>({
  defaultRowCount: 1,
  collapsible: true,
  actionPosition: 'inline',
  actionAlign: 'left',
  layoutMode: 'adaptive',
  minFieldWidth: 200,
  buttonColumns: 1
})

// 表单状态 - 从DEFAULT_FIELDS动态计算
const formStatus = reactive({
  isExpanded: false,
  visibleRows: 1,
  maxRows: Math.max(...DEFAULT_FIELDS.map(field => field.row)),
  fieldCount: DEFAULT_FIELDS.length,
  dynamicColumns: 4,
  containerWidth: 800
})

const queryFormRef = ref<any>(null)

// 更新Web Components
const updateWebComponents = () => {
  nextTick(() => {
    if (queryFormRef.value) {
      queryFormRef.value.updateConfig(config)
    }
  })
}

// 处理展开收起
const handleToggle = (event: CustomEvent) => {
  formStatus.isExpanded = event.detail.expanded
  console.log('Web Components 表单展开状态:', formStatus.isExpanded ? '展开' : '收起')
}

// 处理布局更新
const handleLayoutUpdate = (event: CustomEvent) => {
  formStatus.visibleRows = event.detail.visibleRows
  formStatus.dynamicColumns = event.detail.dynamicColumns
  formStatus.containerWidth = event.detail.containerWidth
}

// 处理查询
const handleQuery = (event: CustomEvent) => {
  console.log('Web Components 查询表单提交:', event.detail.formData)
  alert('查询表单提交成功！\n这是Web Components版本的演示。')
}

// 处理重置
const handleReset = () => {
  console.log('Web Components 查询表单重置')
}

// 组件挂载后初始化Web Components
onMounted(async () => {
  // 动态导入并注册Web Components
  await import('../components/QueryFormComponent')
  
  // 等待组件注册完成
  nextTick(() => {
    updateWebComponents()
  })
})
</script>

<style scoped>
.webcomponents-demo {
  min-height: calc(100vh - 64px);
  background: var(--ldesign-bg-color-page);
}

.demo-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--ls-padding-base);
}

.demo-header {
  text-align: center;
  margin-bottom: var(--ls-margin-xl);
}

.demo-header h1 {
  font-size: var(--ls-font-size-h2);
  font-weight: 600;
  color: var(--ldesign-text-color-primary);
  margin: 0 0 var(--ls-margin-sm) 0;
}

.demo-header p {
  font-size: var(--ls-font-size-base);
  color: var(--ldesign-text-color-secondary);
  margin: 0;
}

.demo-layout {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: var(--ls-spacing-xl);
}

/* 配置面板样式 */
.config-panel {
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-lg);
  padding: var(--ls-padding-base);
  height: fit-content;
}

.config-panel h3 {
  margin: 0 0 var(--ls-margin-base) 0;
  font-size: var(--ls-font-size-lg);
  color: var(--ldesign-text-color-primary);
}

.config-options {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-sm);
  margin-bottom: var(--ls-margin-base);
}

.config-item {
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-xs);
}

.config-item label {
  font-size: var(--ls-font-size-sm);
  color: var(--ldesign-text-color-primary);
  white-space: nowrap;
}

.config-item select {
  height: var(--ls-input-height-small);
  padding: 0 var(--ls-padding-xs);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  font-size: var(--ls-font-size-xs);
}

.config-item input[type="checkbox"] {
  margin-right: var(--ls-spacing-xs);
}

.status-info {
  border-top: 1px solid var(--ldesign-border-color);
  padding-top: var(--ls-padding-base);
}

.status-info h4 {
  margin: 0 0 var(--ls-margin-sm) 0;
  font-size: var(--ls-font-size-base);
  color: var(--ldesign-text-color-primary);
}

.status-info div {
  font-size: var(--ls-font-size-xs);
  color: var(--ldesign-text-color-secondary);
  margin-bottom: var(--ls-margin-xs);
}

/* 表单区域样式 */
.form-section {
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-lg);
  padding: var(--ls-padding-base);
}

.form-section h3 {
  margin: 0 0 var(--ls-margin-base) 0;
  font-size: var(--ls-font-size-lg);
  color: var(--ldesign-text-color-primary);
}

.form-container {
  min-height: 200px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .demo-layout {
    grid-template-columns: 350px 1fr;
    gap: var(--ls-spacing-base);
  }
}

@media (max-width: 768px) {
  .demo-layout {
    grid-template-columns: 1fr;
    gap: var(--ls-spacing-sm);
  }
}
</style>
