<script setup>
import { AdaptiveForm } from '@ldesign/form/vue'
import { computed, reactive, ref, watch } from 'vue'

// 展开收起表单
const expandFormRef = ref()
const expandFormData = ref({})
const expandFormExpanded = ref(false)

const expandFormConfig = reactive({
  items: [
    { key: 'name', label: '姓名', type: 'input', required: true },
    { key: 'email', label: '邮箱', type: 'email', required: true },
    { key: 'phone', label: '电话', type: 'tel' },
    { key: 'company', label: '公司', type: 'input' },
    { key: 'position', label: '职位', type: 'input' },
    { key: 'department', label: '部门', type: 'input' },
    { key: 'address', label: '地址', type: 'input' },
    { key: 'website', label: '网站', type: 'url' },
    { key: 'notes', label: '备注', type: 'textarea' },
  ],
  layout: { maxColumns: 2 },
  display: { expandMode: 'inline', showExpandButton: true },
  behavior: { expandThreshold: 4 },
})

const visibleItemCount = computed(() => {
  const threshold = expandFormConfig.behavior.expandThreshold
  return expandFormExpanded.value ? expandFormConfig.items.length : Math.min(threshold, expandFormConfig.items.length)
})

// 弹窗模式表单
const modalFormRef = ref()
const modalFormData = ref({})
const modalOpen = ref(false)

const modalFormConfig = reactive({
  items: [
    { key: 'title', label: '标题', type: 'input', required: true },
    { key: 'description', label: '描述', type: 'textarea' },
    { key: 'category', label: '分类', type: 'select', options: [
      { value: 'tech', label: '技术' },
      { value: 'business', label: '商务' },
      { value: 'design', label: '设计' },
    ] },
    { key: 'priority', label: '优先级', type: 'select', options: [
      { value: 'low', label: '低' },
      { value: 'medium', label: '中' },
      { value: 'high', label: '高' },
    ] },
    { key: 'assignee', label: '负责人', type: 'input' },
    { key: 'deadline', label: '截止日期', type: 'date' },
    { key: 'tags', label: '标签', type: 'input' },
    { key: 'budget', label: '预算', type: 'number' },
  ],
  layout: { maxColumns: 2 },
  display: {
    expandMode: 'modal',
    showExpandButton: true,
    modalConfig: {
      title: '更多字段',
      width: 600,
      closable: true,
      maskClosable: true,
    },
  },
  behavior: { expandThreshold: 3 },
})

// 动态表单
const dynamicFormData = ref({})
const selectedFormType = ref('user')
const fieldCount = ref(6)

const formTemplates = {
  user: [
    { key: 'username', label: '用户名', type: 'input', required: true },
    { key: 'email', label: '邮箱', type: 'email', required: true },
    { key: 'phone', label: '电话', type: 'tel' },
    { key: 'age', label: '年龄', type: 'number' },
    { key: 'gender', label: '性别', type: 'select', options: [
      { value: 'male', label: '男' },
      { value: 'female', label: '女' },
    ] },
    { key: 'address', label: '地址', type: 'input' },
    { key: 'bio', label: '个人简介', type: 'textarea' },
    { key: 'website', label: '个人网站', type: 'url' },
    { key: 'skills', label: '技能', type: 'input' },
    { key: 'experience', label: '工作经验', type: 'textarea' },
  ],
  company: [
    { key: 'name', label: '公司名称', type: 'input', required: true },
    { key: 'industry', label: '行业', type: 'input' },
    { key: 'size', label: '公司规模', type: 'select', options: [
      { value: 'small', label: '小型(1-50人)' },
      { value: 'medium', label: '中型(51-200人)' },
      { value: 'large', label: '大型(200+人)' },
    ] },
    { key: 'founded', label: '成立时间', type: 'date' },
    { key: 'location', label: '公司地址', type: 'input' },
    { key: 'website', label: '公司网站', type: 'url' },
    { key: 'description', label: '公司描述', type: 'textarea' },
    { key: 'revenue', label: '年收入', type: 'number' },
    { key: 'employees', label: '员工数量', type: 'number' },
    { key: 'contact', label: '联系方式', type: 'input' },
  ],
  product: [
    { key: 'name', label: '产品名称', type: 'input', required: true },
    { key: 'category', label: '产品分类', type: 'input' },
    { key: 'price', label: '价格', type: 'number', required: true },
    { key: 'description', label: '产品描述', type: 'textarea' },
    { key: 'brand', label: '品牌', type: 'input' },
    { key: 'model', label: '型号', type: 'input' },
    { key: 'color', label: '颜色', type: 'input' },
    { key: 'weight', label: '重量', type: 'number' },
    { key: 'dimensions', label: '尺寸', type: 'input' },
    { key: 'warranty', label: '保修期', type: 'input' },
  ],
  order: [
    { key: 'orderNumber', label: '订单号', type: 'input', required: true },
    { key: 'customerName', label: '客户姓名', type: 'input', required: true },
    { key: 'customerEmail', label: '客户邮箱', type: 'email' },
    { key: 'orderDate', label: '订单日期', type: 'date' },
    { key: 'deliveryDate', label: '交付日期', type: 'date' },
    { key: 'amount', label: '订单金额', type: 'number', required: true },
    { key: 'status', label: '订单状态', type: 'select', options: [
      { value: 'pending', label: '待处理' },
      { value: 'processing', label: '处理中' },
      { value: 'shipped', label: '已发货' },
      { value: 'delivered', label: '已交付' },
    ] },
    { key: 'shippingAddress', label: '收货地址', type: 'textarea' },
    { key: 'notes', label: '备注', type: 'textarea' },
    { key: 'paymentMethod', label: '支付方式', type: 'input' },
  ],
}

const dynamicFormConfig = reactive({
  items: [],
  layout: { maxColumns: 2 },
  display: { expandMode: 'inline', showExpandButton: true },
  behavior: { expandThreshold: 4 },
})

// 事件处理
function handleExpandChange(data) {
  expandFormExpanded.value = data.expanded
  console.log('展开状态变化:', data)
}

function handleModalChange(data) {
  modalOpen.value = data.open
  console.log('弹窗状态变化:', data)
}

function handleDynamicChange(data) {
  console.log('动态表单变化:', data)
}

// 操作方法
function toggleExpand() {
  if (expandFormRef.value) {
    expandFormExpanded.value ? expandFormRef.value.collapse() : expandFormRef.value.expand()
  }
}

function addField() {
  const newField = {
    key: `field_${Date.now()}`,
    label: `新字段${expandFormConfig.items.length + 1}`,
    type: 'input',
    placeholder: '动态添加的字段',
  }
  expandFormConfig.items.push(newField)
}

function openModal() {
  if (modalFormRef.value) {
    modalFormRef.value.openModal()
  }
}

function switchMode() {
  modalFormConfig.display.expandMode
    = modalFormConfig.display.expandMode === 'modal' ? 'inline' : 'modal'
}

function switchFormType() {
  const template = formTemplates[selectedFormType.value]
  dynamicFormConfig.items = template.slice(0, fieldCount.value)
  dynamicFormData.value = {}
}

function updateFieldCount() {
  const template = formTemplates[selectedFormType.value]
  dynamicFormConfig.items = template.slice(0, fieldCount.value)
}

// 初始化动态表单
switchFormType()

// 监听字段数量变化
watch(fieldCount, updateFieldCount)
</script>

<template>
  <div class="example">
    <div class="example-header">
      <h2>🚀 高级功能示例</h2>
      <p>演示展开收起、弹窗模式等高级功能</p>
    </div>

    <div class="example-content">
      <div class="demo-grid">
        <!-- 展开收起演示 -->
        <div class="demo-card">
          <div class="demo-header">
            <h3>📂 展开收起功能</h3>
            <p>智能隐藏多余字段，支持展开查看</p>
          </div>
          <div class="demo-content">
            <div class="controls">
              <button class="btn btn-primary" @click="toggleExpand">
                {{ expandFormExpanded ? '收起' : '展开' }}
              </button>
              <button class="btn btn-success" @click="addField">
                ➕ 添加字段
              </button>
            </div>

            <AdaptiveForm
              ref="expandFormRef"
              v-model="expandFormData"
              :config="expandFormConfig"
              @expand-change="handleExpandChange"
            />

            <div class="status">
              状态: {{ expandFormExpanded ? '已展开' : '已收起' }}
              ({{ visibleItemCount }}/{{ expandFormConfig.items.length }} 个字段可见)
            </div>
          </div>
        </div>

        <!-- 弹窗模式演示 -->
        <div class="demo-card">
          <div class="demo-header">
            <h3>🔲 弹窗模式</h3>
            <p>在弹窗中显示隐藏的表单项</p>
          </div>
          <div class="demo-content">
            <div class="controls">
              <button class="btn btn-primary" @click="openModal">
                🚀 打开弹窗
              </button>
              <button class="btn btn-secondary" @click="switchMode">
                🔄 切换模式
              </button>
            </div>

            <AdaptiveForm
              ref="modalFormRef"
              v-model="modalFormData"
              :config="modalFormConfig"
              @modal-change="handleModalChange"
            />

            <div class="status">
              模式: {{ modalFormConfig.display.expandMode === 'modal' ? '弹窗模式' : '内联模式' }}
              {{ modalOpen ? '(弹窗已打开)' : '' }}
            </div>
          </div>
        </div>
      </div>

      <!-- 动态表单演示 -->
      <div class="demo-section">
        <h3>🔧 动态表单配置</h3>
        <div class="dynamic-controls">
          <div class="control-group">
            <label>表单类型</label>
            <select v-model="selectedFormType" @change="switchFormType">
              <option value="user">
                用户信息
              </option>
              <option value="company">
                公司信息
              </option>
              <option value="product">
                产品信息
              </option>
              <option value="order">
                订单信息
              </option>
            </select>
          </div>

          <div class="control-group">
            <label>字段数量</label>
            <input
              v-model.number="fieldCount"
              type="range"
              min="3"
              max="15"
              @input="updateFieldCount"
            >
            <span>{{ fieldCount }}</span>
          </div>

          <div class="control-group">
            <label>布局列数</label>
            <input
              v-model.number="dynamicFormConfig.layout.maxColumns"
              type="range"
              min="1"
              max="4"
            >
            <span>{{ dynamicFormConfig.layout.maxColumns }}</span>
          </div>
        </div>

        <AdaptiveForm
          v-model="dynamicFormData"
          :config="dynamicFormConfig"
          @change="handleDynamicChange"
        />

        <div class="form-preview">
          <h4>当前表单数据</h4>
          <pre>{{ JSON.stringify(dynamicFormData, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.example {
  padding: 2rem;
}

.example-header {
  text-align: center;
  margin-bottom: 2rem;
}

.example-header h2 {
  color: #333;
  margin-bottom: 0.5rem;
}

.example-header p {
  color: #666;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.demo-card {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
}

.demo-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  text-align: center;
}

.demo-header h3 {
  margin-bottom: 0.5rem;
}

.demo-header p {
  opacity: 0.9;
  font-size: 0.9rem;
}

.demo-content {
  padding: 1.5rem;
}

.demo-section {
  margin-bottom: 3rem;
}

.demo-section h3 {
  color: #333;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #667eea;
}

.controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a6fd8;
}

.btn-secondary {
  background: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
}

.btn-secondary:hover {
  background: #e9ecef;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover {
  background: #218838;
}

.status {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #495057;
}

.dynamic-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.control-group label {
  font-weight: 500;
  color: #333;
}

.control-group select,
.control-group input {
  padding: 0.5rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 0.875rem;
}

.control-group input[type='range'] {
  padding: 0;
}

.control-group span {
  font-weight: 500;
  color: #667eea;
}

.form-preview {
  margin-top: 2rem;
}

.form-preview h4 {
  color: #333;
  margin-bottom: 0.5rem;
}

.form-preview pre {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  overflow-x: auto;
  max-height: 300px;
}

@media (max-width: 768px) {
  .demo-grid {
    grid-template-columns: 1fr;
  }

  .dynamic-controls {
    grid-template-columns: 1fr;
  }
}
</style>
