<template>
  <div class="horizontal-layout-example">
    <h2>水平布局示例</h2>
    <p>演示 @ldesign/form 的水平布局功能，支持不同列数的Grid布局。</p>

    <!-- 单列布局 -->
    <div class="example-section">
      <div class="example-header">
        <h3>单列布局</h3>
        <p>默认的单列垂直布局</p>
      </div>
      <div class="example-content">
        <div class="form-container">
          <div ref="singleColumnForm" class="form-wrapper"></div>
        </div>
        <div class="form-info">
          <h4>表单数据</h4>
          <pre>{{ JSON.stringify(singleColumnData, null, 2) }}</pre>
          <h4>验证结果</h4>
          <pre>{{ singleColumnResult ? JSON.stringify(singleColumnResult, null, 2) : 'null' }}</pre>
        </div>
      </div>
    </div>

    <!-- 双列布局 -->
    <div class="example-section">
      <div class="example-header">
        <h3>双列布局</h3>
        <p>使用CSS Grid的双列水平布局</p>
      </div>
      <div class="example-content">
        <div class="form-container">
          <div ref="doubleColumnForm" class="form-wrapper"></div>
        </div>
        <div class="form-info">
          <h4>表单数据</h4>
          <pre>{{ JSON.stringify(doubleColumnData, null, 2) }}</pre>
          <h4>验证结果</h4>
          <pre>{{ doubleColumnResult ? JSON.stringify(doubleColumnResult, null, 2) : 'null' }}</pre>
        </div>
      </div>
    </div>

    <!-- 三列布局 -->
    <div class="example-section">
      <div class="example-header">
        <h3>三列布局</h3>
        <p>使用CSS Grid的三列水平布局，包含跨列字段</p>
      </div>
      <div class="example-content">
        <div class="form-container">
          <div ref="tripleColumnForm" class="form-wrapper"></div>
        </div>
        <div class="form-info">
          <h4>表单数据</h4>
          <pre>{{ JSON.stringify(tripleColumnData, null, 2) }}</pre>
          <h4>验证结果</h4>
          <pre>{{ tripleColumnResult ? JSON.stringify(tripleColumnResult, null, 2) : 'null' }}</pre>
        </div>
      </div>
    </div>

    <!-- 展开/收起布局 -->
    <div class="example-section">
      <div class="example-header">
        <h3>展开/收起布局</h3>
        <p>双列布局结合展开/收起功能，默认显示前4个字段，点击按钮展开显示全部字段</p>
      </div>
      <div class="example-content">
        <div class="form-container">
          <div ref="collapsibleForm" class="form-wrapper"></div>
        </div>
        <div class="form-info">
          <h4>表单数据</h4>
          <pre>{{ JSON.stringify(collapsibleData, null, 2) }}</pre>
          <h4>验证结果</h4>
          <pre>{{ collapsibleResult ? JSON.stringify(collapsibleResult, null, 2) : 'null' }}</pre>
        </div>
      </div>
    </div>

    <!-- 自适应布局 -->
    <div class="example-section">
      <div class="example-header">
        <h3>自适应布局</h3>
        <p>根据容器宽度自动调整列数的响应式布局</p>
      </div>
      <div class="example-content">
        <div class="form-container">
          <div ref="responsiveForm" class="form-wrapper"></div>
        </div>
        <div class="form-info">
          <h4>表单数据</h4>
          <pre>{{ JSON.stringify(responsiveData, null, 2) }}</pre>
          <h4>验证结果</h4>
          <pre>{{ responsiveResult ? JSON.stringify(responsiveResult, null, 2) : 'null' }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { createForm, VanillaAdapter } from '@ldesign/form'
import type { FormInstance } from '@ldesign/form'

// 表单引用
const singleColumnForm = ref<HTMLElement>()
const doubleColumnForm = ref<HTMLElement>()
const tripleColumnForm = ref<HTMLElement>()
const collapsibleForm = ref<HTMLElement>()
const responsiveForm = ref<HTMLElement>()

// 表单数据
const singleColumnData = ref({})
const doubleColumnData = ref({})
const tripleColumnData = ref({})
const collapsibleData = ref({})
const responsiveData = ref({})

// 验证结果
const singleColumnResult = ref(null)
const doubleColumnResult = ref(null)
const tripleColumnResult = ref(null)
const collapsibleResult = ref(null)
const responsiveResult = ref(null)

// 表单实例
let singleColumnFormInstance: FormInstance
let doubleColumnFormInstance: FormInstance
let tripleColumnFormInstance: FormInstance
let collapsibleFormInstance: FormInstance
let responsiveFormInstance: FormInstance

// 适配器实例
let singleColumnAdapter: VanillaAdapter
let doubleColumnAdapter: VanillaAdapter
let tripleColumnAdapter: VanillaAdapter
let collapsibleAdapter: VanillaAdapter
let responsiveAdapter: VanillaAdapter

onMounted(() => {
  // 创建单列布局表单
  createSingleColumnForm()
  
  // 创建双列布局表单
  createDoubleColumnForm()
  
  // 创建三列布局表单
  createTripleColumnForm()

  // 创建展开/收起布局表单
  createCollapsibleForm()

  // 创建自适应布局表单
  createResponsiveForm()
})

onUnmounted(() => {
  // 清理资源
  singleColumnAdapter?.unmount()
  doubleColumnAdapter?.unmount()
  tripleColumnAdapter?.unmount()
  collapsibleAdapter?.unmount()
  responsiveAdapter?.unmount()

  singleColumnFormInstance?.destroy()
  doubleColumnFormInstance?.destroy()
  tripleColumnFormInstance?.destroy()
  collapsibleFormInstance?.destroy()
  responsiveFormInstance?.destroy()
})

function createSingleColumnForm() {
  singleColumnFormInstance = createForm({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      address: ''
    },
    layout: {
      mode: 'vertical', // 垂直布局
      columns: 1,
      gutter: 16,
      labelAlign: 'left'
    },
    fields: [
      {
        name: 'name',
        label: '姓名',
        type: 'input',
        required: true,
        rules: [{ type: 'required', message: '请输入姓名' }]
      },
      {
        name: 'email',
        label: '邮箱',
        type: 'input',
        required: true,
        rules: [
          { type: 'required', message: '请输入邮箱' },
          { type: 'email', message: '请输入有效的邮箱地址' }
        ]
      },
      {
        name: 'phone',
        label: '手机号',
        type: 'input',
        required: true,
        rules: [{ type: 'required', message: '请输入手机号' }]
      },
      {
        name: 'address',
        label: '地址',
        type: 'textarea',
        rules: [{ type: 'required', message: '请输入地址' }]
      }
    ]
  }, {
    onChange: (values) => {
      singleColumnData.value = values
    },
    onSubmit: async (values) => {
      console.log('单列表单提交:', values)
    }
  })

  singleColumnAdapter = new VanillaAdapter()
  singleColumnAdapter.mount(singleColumnFormInstance, singleColumnForm.value!)
  
  // 添加操作按钮
  addActionButtons(singleColumnForm.value!, singleColumnFormInstance, singleColumnResult)
}

function createDoubleColumnForm() {
  doubleColumnFormInstance = createForm({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      city: '',
      country: ''
    },
    layout: {
      mode: 'horizontal', // 水平布局
      columns: 2,
      gutter: 16,
      labelAlign: 'top',
      horizontal: {
        columnsPerRow: 2,
        useGrid: true,
        rowGap: 16,
        columnGap: 16
      }
    },
    fields: [
      {
        name: 'firstName',
        label: '名',
        type: 'input',
        required: true,
        rules: [{ type: 'required', message: '请输入名' }]
      },
      {
        name: 'lastName',
        label: '姓',
        type: 'input',
        required: true,
        rules: [{ type: 'required', message: '请输入姓' }]
      },
      {
        name: 'email',
        label: '邮箱地址',
        type: 'input',
        required: true,
        layout: { span: 2 }, // 跨两列
        rules: [
          { type: 'required', message: '请输入邮箱' },
          { type: 'email', message: '请输入有效的邮箱地址' }
        ]
      },
      {
        name: 'phone',
        label: '手机号码',
        type: 'input',
        required: true,
        rules: [{ type: 'required', message: '请输入手机号' }]
      },
      {
        name: 'city',
        label: '城市',
        type: 'input',
        rules: [{ type: 'required', message: '请输入城市' }]
      },
      {
        name: 'country',
        label: '国家',
        type: 'input',
        layout: { span: 2 }, // 跨两列
        rules: [{ type: 'required', message: '请输入国家' }]
      }
    ]
  }, {
    onChange: (values) => {
      doubleColumnData.value = values
    },
    onSubmit: async (values) => {
      console.log('双列表单提交:', values)
    }
  })

  doubleColumnAdapter = new VanillaAdapter()
  doubleColumnAdapter.mount(doubleColumnFormInstance, doubleColumnForm.value!)
  
  // 添加操作按钮
  addActionButtons(doubleColumnForm.value!, doubleColumnFormInstance, doubleColumnResult)
}

function createTripleColumnForm() {
  tripleColumnFormInstance = createForm({
    initialValues: {
      title: '',
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      phone: '',
      department: '',
      position: '',
      salary: '',
      description: ''
    },
    layout: {
      mode: 'horizontal', // 水平布局
      columns: 3,
      gutter: 16,
      labelAlign: 'top',
      horizontal: {
        columnsPerRow: 3,
        useGrid: true,
        rowGap: 16,
        columnGap: 16
      }
    },
    fields: [
      {
        name: 'title',
        label: '称谓',
        type: 'select',
        options: [
          { label: '先生', value: 'mr' },
          { label: '女士', value: 'ms' },
          { label: '博士', value: 'dr' }
        ]
      },
      {
        name: 'firstName',
        label: '名',
        type: 'input',
        required: true,
        rules: [{ type: 'required', message: '请输入名' }]
      },
      {
        name: 'middleName',
        label: '中间名',
        type: 'input'
      },
      {
        name: 'lastName',
        label: '姓',
        type: 'input',
        required: true,
        rules: [{ type: 'required', message: '请输入姓' }]
      },
      {
        name: 'email',
        label: '邮箱地址',
        type: 'input',
        required: true,
        layout: { span: 2 }, // 跨两列
        rules: [
          { type: 'required', message: '请输入邮箱' },
          { type: 'email', message: '请输入有效的邮箱地址' }
        ]
      },
      {
        name: 'phone',
        label: '手机号码',
        type: 'input',
        required: true,
        rules: [{ type: 'required', message: '请输入手机号' }]
      },
      {
        name: 'department',
        label: '部门',
        type: 'input',
        rules: [{ type: 'required', message: '请输入部门' }]
      },
      {
        name: 'position',
        label: '职位',
        type: 'input',
        rules: [{ type: 'required', message: '请输入职位' }]
      },
      {
        name: 'salary',
        label: '薪资',
        type: 'number',
        rules: [{ type: 'required', message: '请输入薪资' }]
      },
      {
        name: 'description',
        label: '描述',
        type: 'textarea',
        layout: { span: 3 }, // 跨三列
        rules: [{ type: 'required', message: '请输入描述' }]
      }
    ]
  }, {
    onChange: (values) => {
      tripleColumnData.value = values
    },
    onSubmit: async (values) => {
      console.log('三列表单提交:', values)
    }
  })

  tripleColumnAdapter = new VanillaAdapter()
  tripleColumnAdapter.mount(tripleColumnFormInstance, tripleColumnForm.value!)

  // 添加操作按钮
  addActionButtons(tripleColumnForm.value!, tripleColumnFormInstance, tripleColumnResult)
}

function createCollapsibleForm() {
  collapsibleFormInstance = createForm({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      city: '',
      country: '',
      company: '',
      department: '',
      position: '',
      experience: ''
    },
    layout: {
      mode: 'horizontal', // 水平布局
      horizontal: {
        columnsPerRow: 2,
        useGrid: true,
        rowGap: 16,
        columnGap: 20
      },
      collapsible: {
        enabled: true,
        defaultVisibleCount: 4,
        expandText: '显示更多字段',
        collapseText: '隐藏部分字段',
        showFieldCount: true,
        animationDuration: 400
      }
    },
    fields: [
      {
        name: 'firstName',
        label: '名',
        type: 'input',
        required: true,
        rules: [{ type: 'required', message: '请输入名' }]
      },
      {
        name: 'lastName',
        label: '姓',
        type: 'input',
        required: true,
        rules: [{ type: 'required', message: '请输入姓' }]
      },
      {
        name: 'email',
        label: '邮箱地址',
        type: 'input',
        required: true,
        rules: [
          { type: 'required', message: '请输入邮箱地址' },
          { type: 'email', message: '请输入有效的邮箱地址' }
        ]
      },
      {
        name: 'phone',
        label: '手机号码',
        type: 'input',
        required: true,
        rules: [{ type: 'required', message: '请输入手机号码' }]
      },
      {
        name: 'city',
        label: '城市',
        type: 'input'
      },
      {
        name: 'country',
        label: '国家',
        type: 'input'
      },
      {
        name: 'company',
        label: '公司名称',
        type: 'input'
      },
      {
        name: 'department',
        label: '部门',
        type: 'input'
      },
      {
        name: 'position',
        label: '职位',
        type: 'input'
      },
      {
        name: 'experience',
        label: '工作经验',
        type: 'select',
        options: [
          { label: '1年以下', value: '0-1' },
          { label: '1-3年', value: '1-3' },
          { label: '3-5年', value: '3-5' },
          { label: '5年以上', value: '5+' }
        ]
      }
    ]
  })

  // 创建适配器
  collapsibleAdapter = new VanillaAdapter()

  // 挂载表单
  collapsibleAdapter.mount(collapsibleFormInstance, collapsibleForm.value!)

  // 监听数据变化
  collapsibleFormInstance.on('change', (data) => {
    collapsibleData.value = data
  })

  // 添加操作按钮
  addActionButtons(collapsibleForm.value!, collapsibleFormInstance, collapsibleResult)
}

function createResponsiveForm() {
  responsiveFormInstance = createForm({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      zipCode: '',
      notes: ''
    },
    layout: {
      mode: 'horizontal', // 水平布局
      columns: 2,
      gutter: 16,
      labelAlign: 'top',
      responsive: true,
      breakpoints: {
        xs: 1,  // 小屏幕单列
        sm: 1,  // 小屏幕单列
        md: 2,  // 中等屏幕双列
        lg: 3,  // 大屏幕三列
        xl: 4,  // 超大屏幕四列
        xxl: 4  // 超大屏幕四列
      },
      horizontal: {
        columnsPerRow: 2,
        useGrid: true,
        autoFill: true,
        rowGap: 16,
        columnGap: 16
      }
    },
    fields: [
      {
        name: 'name',
        label: '姓名',
        type: 'input',
        required: true,
        rules: [{ type: 'required', message: '请输入姓名' }]
      },
      {
        name: 'email',
        label: '邮箱',
        type: 'input',
        required: true,
        rules: [
          { type: 'required', message: '请输入邮箱' },
          { type: 'email', message: '请输入有效的邮箱地址' }
        ]
      },
      {
        name: 'phone',
        label: '手机号',
        type: 'input',
        required: true,
        rules: [{ type: 'required', message: '请输入手机号' }]
      },
      {
        name: 'address',
        label: '地址',
        type: 'input',
        rules: [{ type: 'required', message: '请输入地址' }]
      },
      {
        name: 'city',
        label: '城市',
        type: 'input',
        rules: [{ type: 'required', message: '请输入城市' }]
      },
      {
        name: 'zipCode',
        label: '邮编',
        type: 'input',
        rules: [{ type: 'required', message: '请输入邮编' }]
      },
      {
        name: 'notes',
        label: '备注',
        type: 'textarea',
        layout: { span: -1 }, // 全宽
        rules: [{ type: 'required', message: '请输入备注' }]
      }
    ]
  }, {
    onChange: (values) => {
      responsiveData.value = values
    },
    onSubmit: async (values) => {
      console.log('响应式表单提交:', values)
    }
  })

  responsiveAdapter = new VanillaAdapter()
  responsiveAdapter.mount(responsiveFormInstance, responsiveForm.value!)

  // 添加操作按钮
  addActionButtons(responsiveForm.value!, responsiveFormInstance, responsiveResult)
}

function addActionButtons(container: HTMLElement, formInstance: FormInstance, resultRef: any) {
  const buttonContainer = document.createElement('div')
  buttonContainer.className = 'form-actions'

  // 提交按钮
  const submitButton = document.createElement('button')
  submitButton.textContent = '提交'
  submitButton.className = 'btn btn-primary'
  submitButton.onclick = async () => {
    try {
      const result = await formInstance.validate()
      resultRef.value = result
      if (result.valid) {
        await formInstance.submit()
      }
    } catch (error) {
      console.error('表单提交失败:', error)
    }
  }

  // 重置按钮
  const resetButton = document.createElement('button')
  resetButton.textContent = '重置'
  resetButton.className = 'btn btn-secondary'
  resetButton.onclick = () => {
    formInstance.reset()
    resultRef.value = null
  }

  // 验证按钮
  const validateButton = document.createElement('button')
  validateButton.textContent = '验证'
  validateButton.className = 'btn btn-outline'
  validateButton.onclick = async () => {
    try {
      const result = await formInstance.validate()
      resultRef.value = result
    } catch (error) {
      console.error('表单验证失败:', error)
    }
  }

  buttonContainer.appendChild(submitButton)
  buttonContainer.appendChild(resetButton)
  buttonContainer.appendChild(validateButton)

  container.appendChild(buttonContainer)
}
</script>

<style lang="less" scoped>
.horizontal-layout-example {
  padding: var(--ls-padding-lg);
  max-width: 1200px;
  margin: 0 auto;

  h2 {
    color: var(--ldesign-text-color-primary);
    font-size: var(--ls-font-size-h2);
    margin-bottom: var(--ls-margin-base);
  }

  > p {
    color: var(--ldesign-text-color-secondary);
    font-size: var(--ls-font-size-base);
    margin-bottom: var(--ls-margin-xl);
  }
}

.example-section {
  margin-bottom: var(--ls-margin-xxl);
  border: 1px solid var(--ldesign-border-level-1-color);
  border-radius: var(--ls-border-radius-lg);
  overflow: hidden;
  background: var(--ldesign-bg-color-container);
  box-shadow: var(--ldesign-shadow-1);

  .example-header {
    padding: var(--ls-padding-lg);
    background: var(--ldesign-bg-color-component);
    border-bottom: 1px solid var(--ldesign-border-level-1-color);

    h3 {
      color: var(--ldesign-text-color-primary);
      font-size: var(--ls-font-size-h3);
      margin: 0 0 var(--ls-margin-sm) 0;
    }

    p {
      color: var(--ldesign-text-color-secondary);
      font-size: var(--ls-font-size-sm);
      margin: 0;
    }
  }

  .example-content {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: var(--ls-spacing-lg);
    padding: var(--ls-padding-lg);

    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
    }
  }
}

.form-container {
  .form-wrapper {
    border: 1px solid var(--ldesign-border-level-1-color);
    border-radius: var(--ls-border-radius-base);
    padding: var(--ls-padding-lg);
    background: var(--ldesign-bg-color-component);
  }
}

.form-info {
  h4 {
    color: var(--ldesign-text-color-primary);
    font-size: var(--ls-font-size-lg);
    margin: 0 0 var(--ls-margin-sm) 0;
  }

  pre {
    background: var(--ldesign-gray-color-1);
    border: 1px solid var(--ldesign-border-level-1-color);
    border-radius: var(--ls-border-radius-sm);
    padding: var(--ls-padding-sm);
    font-size: var(--ls-font-size-xs);
    color: var(--ldesign-text-color-primary);
    overflow-x: auto;
    margin: 0 0 var(--ls-margin-base) 0;
    max-height: 200px;
    overflow-y: auto;
  }
}

// 表单操作按钮样式
:deep(.form-actions) {
  display: flex;
  gap: var(--ls-spacing-sm);
  margin-top: var(--ls-margin-lg);
  padding-top: var(--ls-padding-base);
  border-top: 1px solid var(--ldesign-border-level-1-color);

  .btn {
    padding: var(--ls-padding-sm) var(--ls-padding-base);
    border-radius: var(--ls-border-radius-base);
    font-size: var(--ls-font-size-sm);
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;

    &.btn-primary {
      background: var(--ldesign-brand-color);
      color: var(--ldesign-font-white-1);
      border-color: var(--ldesign-brand-color);

      &:hover {
        background: var(--ldesign-brand-color-hover);
        border-color: var(--ldesign-brand-color-hover);
      }
    }

    &.btn-secondary {
      background: var(--ldesign-gray-color-6);
      color: var(--ldesign-font-white-1);
      border-color: var(--ldesign-gray-color-6);

      &:hover {
        background: var(--ldesign-gray-color-7);
        border-color: var(--ldesign-gray-color-7);
      }
    }

    &.btn-outline {
      background: transparent;
      color: var(--ldesign-brand-color);
      border-color: var(--ldesign-brand-color);

      &:hover {
        background: var(--ldesign-brand-color-focus);
        border-color: var(--ldesign-brand-color-hover);
      }
    }
  }
}
</style>
