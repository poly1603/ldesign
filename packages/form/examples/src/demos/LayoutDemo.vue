<!--
布局系统演示 - 展示各种布局方式
-->

<template>
  <div class="layout-demo">
    <div class="demo-header">
      <h2>📱 布局系统演示</h2>
      <p>LemonForm 提供灵活的布局系统，支持栅格布局、响应式设计、自定义间距等。</p>
    </div>

    <div class="demo-controls">
      <div class="control-group">
        <label>
          布局类型:
          <select v-model="layoutType" class="control-select">
            <option value="grid">栅格布局</option>
            <option value="flex">弹性布局</option>
            <option value="inline">内联布局</option>
            <option value="vertical">垂直布局</option>
          </select>
        </label>
        
        <label v-if="layoutType === 'grid'">
          列数:
          <select v-model="columns" class="control-select">
            <option :value="1">1列</option>
            <option :value="2">2列</option>
            <option :value="3">3列</option>
            <option :value="4">4列</option>
          </select>
        </label>
        
        <label>
          间距:
          <select v-model="gap" class="control-select">
            <option :value="10">小 (10px)</option>
            <option :value="20">中 (20px)</option>
            <option :value="30">大 (30px)</option>
          </select>
        </label>
        
        <label>
          <input v-model="responsive" type="checkbox" />
          响应式布局
        </label>
      </div>
    </div>

    <div class="layout-examples">
      <!-- 当前布局演示 -->
      <div class="layout-section">
        <h3>🎯 当前布局: {{ layoutTypeNames[layoutType] }}</h3>
        <div 
          :class="['form-layout', `layout-${layoutType}`]"
          :style="layoutStyles"
        >
          <div
            v-for="field in demoFields"
            :key="field.name"
            :class="['form-field-container', field.span ? `span-${field.span}` : '']"
          >
            <FormField
              :field="field"
              :value="formData[field.name]"
              @update:value="formData[field.name] = $event"
            />
          </div>
        </div>
      </div>

      <!-- 响应式演示 -->
      <div v-if="responsive" class="layout-section">
        <h3>📱 响应式布局演示</h3>
        <div class="responsive-info">
          <p>当前屏幕尺寸: <strong>{{ currentBreakpoint }}</strong></p>
          <p>自动调整列数: <strong>{{ responsiveColumns }}</strong></p>
        </div>
        <div class="responsive-layout" :style="responsiveStyles">
          <div
            v-for="field in responsiveFields"
            :key="field.name"
            class="form-field-container"
          >
            <FormField
              :field="field"
              :value="responsiveData[field.name]"
              @update:value="responsiveData[field.name] = $event"
            />
          </div>
        </div>
      </div>

      <!-- 复杂布局演示 -->
      <div class="layout-section">
        <h3>🏗️ 复杂布局演示</h3>
        <div class="complex-layout">
          <!-- 标题行 -->
          <div class="layout-row full-width">
            <h4>个人信息表单</h4>
          </div>
          
          <!-- 基本信息行 -->
          <div class="layout-row">
            <div class="layout-col col-2">
              <FormField
                :field="{
                  type: 'input',
                  name: 'firstName',
                  label: '姓',
                  placeholder: '请输入姓'
                }"
                :value="complexData.firstName"
                @update:value="complexData.firstName = $event"
              />
            </div>
            <div class="layout-col col-2">
              <FormField
                :field="{
                  type: 'input',
                  name: 'lastName',
                  label: '名',
                  placeholder: '请输入名'
                }"
                :value="complexData.lastName"
                @update:value="complexData.lastName = $event"
              />
            </div>
          </div>
          
          <!-- 联系信息行 -->
          <div class="layout-row">
            <div class="layout-col col-3">
              <FormField
                :field="{
                  type: 'input',
                  name: 'email',
                  label: '邮箱',
                  placeholder: '请输入邮箱',
                  props: { type: 'email' }
                }"
                :value="complexData.email"
                @update:value="complexData.email = $event"
              />
            </div>
            <div class="layout-col col-3">
              <FormField
                :field="{
                  type: 'input',
                  name: 'phone',
                  label: '电话',
                  placeholder: '请输入电话'
                }"
                :value="complexData.phone"
                @update:value="complexData.phone = $event"
              />
            </div>
            <div class="layout-col col-3">
              <FormField
                :field="{
                  type: 'select',
                  name: 'country',
                  label: '国家',
                  placeholder: '请选择国家',
                  props: {
                    options: [
                      { label: '中国', value: 'china' },
                      { label: '美国', value: 'usa' },
                      { label: '日本', value: 'japan' }
                    ]
                  }
                }"
                :value="complexData.country"
                @update:value="complexData.country = $event"
              />
            </div>
          </div>
          
          <!-- 地址信息行 -->
          <div class="layout-row">
            <div class="layout-col col-1">
              <FormField
                :field="{
                  type: 'textarea',
                  name: 'address',
                  label: '详细地址',
                  placeholder: '请输入详细地址',
                  props: { rows: 3 }
                }"
                :value="complexData.address"
                @update:value="complexData.address = $event"
              />
            </div>
          </div>
          
          <!-- 操作按钮行 -->
          <div class="layout-row">
            <div class="layout-col col-1">
              <div class="form-actions">
                <button class="btn btn-primary">保存</button>
                <button class="btn btn-secondary">重置</button>
                <button class="btn btn-outline">预览</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 布局代码示例 -->
    <div class="code-example">
      <h3>💻 布局配置代码</h3>
      <pre><code>{{ layoutCode }}</code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import FormField from '../components/FormField.vue'

// 布局控制
const layoutType = ref('grid')
const columns = ref(2)
const gap = ref(20)
const responsive = ref(true)

// 布局类型名称
const layoutTypeNames = {
  grid: '栅格布局',
  flex: '弹性布局',
  inline: '内联布局',
  vertical: '垂直布局'
}

// 表单数据
const formData = reactive({
  name: '',
  email: '',
  phone: '',
  age: null,
  gender: '',
  city: '',
  interests: [],
  description: ''
})

const responsiveData = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  phone: '',
  address: ''
})

const complexData = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  country: '',
  address: ''
})

// 演示字段
const demoFields = [
  {
    type: 'input',
    name: 'name',
    label: '姓名',
    placeholder: '请输入姓名'
  },
  {
    type: 'input',
    name: 'email',
    label: '邮箱',
    placeholder: '请输入邮箱',
    props: { type: 'email' }
  },
  {
    type: 'input',
    name: 'phone',
    label: '电话',
    placeholder: '请输入电话'
  },
  {
    type: 'number',
    name: 'age',
    label: '年龄',
    placeholder: '请输入年龄'
  },
  {
    type: 'select',
    name: 'gender',
    label: '性别',
    placeholder: '请选择性别',
    props: {
      options: [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' }
      ]
    }
  },
  {
    type: 'select',
    name: 'city',
    label: '城市',
    placeholder: '请选择城市',
    props: {
      options: [
        { label: '北京', value: 'beijing' },
        { label: '上海', value: 'shanghai' },
        { label: '广州', value: 'guangzhou' },
        { label: '深圳', value: 'shenzhen' }
      ]
    }
  },
  {
    type: 'checkbox',
    name: 'interests',
    label: '兴趣爱好',
    span: layoutType.value === 'grid' && columns.value > 2 ? 2 : 1,
    props: {
      options: [
        { label: '阅读', value: 'reading' },
        { label: '音乐', value: 'music' },
        { label: '运动', value: 'sports' },
        { label: '旅行', value: 'travel' }
      ]
    }
  },
  {
    type: 'textarea',
    name: 'description',
    label: '个人描述',
    placeholder: '请简单介绍一下自己...',
    span: layoutType.value === 'grid' ? columns.value : 1,
    props: { rows: 3 }
  }
]

// 响应式字段
const responsiveFields = [
  {
    type: 'input',
    name: 'username',
    label: '用户名',
    placeholder: '请输入用户名'
  },
  {
    type: 'input',
    name: 'password',
    label: '密码',
    placeholder: '请输入密码',
    props: { type: 'password' }
  },
  {
    type: 'input',
    name: 'confirmPassword',
    label: '确认密码',
    placeholder: '请再次输入密码',
    props: { type: 'password' }
  },
  {
    type: 'input',
    name: 'email',
    label: '邮箱',
    placeholder: '请输入邮箱',
    props: { type: 'email' }
  },
  {
    type: 'input',
    name: 'phone',
    label: '电话',
    placeholder: '请输入电话'
  },
  {
    type: 'textarea',
    name: 'address',
    label: '地址',
    placeholder: '请输入地址',
    props: { rows: 2 }
  }
]

// 当前断点
const currentBreakpoint = ref('lg')
const screenWidth = ref(window.innerWidth)

// 响应式列数
const responsiveColumns = computed(() => {
  if (screenWidth.value < 576) return 1  // xs
  if (screenWidth.value < 768) return 1  // sm
  if (screenWidth.value < 992) return 2  // md
  return 3  // lg
})

// 布局样式
const layoutStyles = computed(() => {
  const styles: any = {
    gap: `${gap.value}px`
  }
  
  if (layoutType.value === 'grid') {
    styles.display = 'grid'
    styles.gridTemplateColumns = `repeat(${columns.value}, 1fr)`
  } else if (layoutType.value === 'flex') {
    styles.display = 'flex'
    styles.flexWrap = 'wrap'
  } else if (layoutType.value === 'inline') {
    styles.display = 'flex'
    styles.flexWrap = 'wrap'
    styles.alignItems = 'flex-end'
  } else {
    styles.display = 'flex'
    styles.flexDirection = 'column'
  }
  
  return styles
})

// 响应式样式
const responsiveStyles = computed(() => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${responsiveColumns.value}, 1fr)`,
  gap: `${gap.value}px`
}))

// 布局代码
const layoutCode = computed(() => {
  return `{
  layout: {
    type: '${layoutType.value}',
    ${layoutType.value === 'grid' ? `columns: ${columns.value},` : ''}
    gap: ${gap.value},
    ${responsive.value ? `responsive: {
      enabled: true,
      breakpoints: {
        xs: { value: 0, columns: 1 },
        sm: { value: 576, columns: 1 },
        md: { value: 768, columns: 2 },
        lg: { value: 992, columns: 3 }
      }
    }` : ''}
  }
}`
})

// 更新断点
const updateBreakpoint = () => {
  screenWidth.value = window.innerWidth
  if (screenWidth.value < 576) {
    currentBreakpoint.value = 'xs (< 576px)'
  } else if (screenWidth.value < 768) {
    currentBreakpoint.value = 'sm (576px - 768px)'
  } else if (screenWidth.value < 992) {
    currentBreakpoint.value = 'md (768px - 992px)'
  } else {
    currentBreakpoint.value = 'lg (≥ 992px)'
  }
}

// 监听窗口大小变化
onMounted(() => {
  updateBreakpoint()
  window.addEventListener('resize', updateBreakpoint)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateBreakpoint)
})
</script>

<style scoped>
.layout-demo {
  max-width: 1400px;
  margin: 0 auto;
}

.demo-header {
  text-align: center;
  margin-bottom: 30px;
}

.demo-header h2 {
  color: #333;
  margin-bottom: 10px;
  font-size: 2rem;
}

.demo-header p {
  color: #666;
  font-size: 1.1rem;
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto;
}

.demo-controls {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.control-group {
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.control-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
}

.control-select {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.control-group input[type="checkbox"] {
  width: 16px;
  height: 16px;
}

.layout-examples {
  display: flex;
  flex-direction: column;
  gap: 30px;
  margin-bottom: 30px;
}

.layout-section {
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.layout-section h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.3rem;
  border-bottom: 2px solid #f39c12;
  padding-bottom: 10px;
}

.form-layout {
  border: 2px dashed #e9ecef;
  padding: 20px;
  border-radius: 6px;
  background: #fafafa;
}

.layout-grid {
  display: grid;
}

.layout-flex {
  display: flex;
  flex-wrap: wrap;
}

.layout-inline {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
}

.layout-vertical {
  display: flex;
  flex-direction: column;
}

.form-field-container {
  background: white;
  padding: 15px;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.form-field-container.span-2 {
  grid-column: span 2;
}

.form-field-container.span-3 {
  grid-column: span 3;
}

.form-field-container.span-4 {
  grid-column: span 4;
}

.responsive-info {
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 20px;
}

.responsive-info p {
  margin: 5px 0;
  color: #1890ff;
}

.responsive-layout {
  border: 2px dashed #91d5ff;
  padding: 20px;
  border-radius: 6px;
  background: #f6ffed;
}

.complex-layout {
  border: 2px dashed #52c41a;
  padding: 20px;
  border-radius: 6px;
  background: #f6ffed;
}

.layout-row {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  align-items: flex-start;
}

.layout-row.full-width {
  justify-content: center;
}

.layout-row h4 {
  margin: 0;
  color: #333;
  font-size: 1.2rem;
  text-align: center;
  width: 100%;
  padding: 10px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.layout-col {
  flex: 1;
  background: white;
  padding: 15px;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.layout-col.col-1 {
  flex: 1;
}

.layout-col.col-2 {
  flex: 1;
}

.layout-col.col-3 {
  flex: 1;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-start;
}

.btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  background: white;
  color: #333;
}

.btn-primary {
  background: #f39c12;
  color: white;
  border-color: #f39c12;
}

.btn-primary:hover {
  background: #e67e22;
  border-color: #e67e22;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border-color: #6c757d;
}

.btn-secondary:hover {
  background: #5a6268;
  border-color: #545b62;
}

.btn-outline {
  background: transparent;
  color: #f39c12;
  border-color: #f39c12;
}

.btn-outline:hover {
  background: #f39c12;
  color: white;
}

.code-example {
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.code-example h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 1.3rem;
}

.code-example pre {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 15px;
  font-size: 12px;
  overflow: auto;
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

@media (max-width: 768px) {
  .control-group {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

  .control-group label {
    justify-content: space-between;
  }

  .layout-row {
    flex-direction: column;
    gap: 10px;
  }

  .demo-header h2 {
    font-size: 1.5rem;
  }

  .demo-header p {
    font-size: 1rem;
  }

  .layout-section {
    padding: 20px;
  }

  .form-layout,
  .responsive-layout,
  .complex-layout {
    padding: 15px;
  }
}
</style>
