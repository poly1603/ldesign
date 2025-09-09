<template>
  <div class="collapsible-example">
    <h2>展开/收起功能示例</h2>
    <p>演示 @ldesign/form 的展开/收起功能，支持默认显示部分字段，通过按钮控制显示全部字段。</p>

    <!-- 基础展开/收起示例 -->
    <div class="example-section">
      <div class="example-header">
        <h3>基础展开/收起表单</h3>
        <p>纵向布局，配置显示3行（每行1列），根据字段colSpan智能计算可见字段数量</p>
      </div>
      <div class="example-content">
        <div class="form-container">
          <div id="collapsible-form"></div>
        </div>
        <div class="result-panel">
          <h4>表单数据</h4>
          <pre>{{ JSON.stringify(formData, null, 2) }}</pre>
          <h4>验证结果</h4>
          <pre>{{ validationResult ? JSON.stringify(validationResult, null, 2) : 'null' }}</pre>
        </div>
      </div>
    </div>

    <!-- 水平布局展开/收起示例 - 按钮组内联 -->
    <div class="example-section">
      <div class="example-header">
        <h3>水平布局展开/收起 - 按钮组内联</h3>
        <p>水平布局，配置显示2行（每行2列），根据字段colSpan智能计算可见字段数量。按钮组内联显示，智能定位在网格中的合适位置。</p>
      </div>
      <div class="example-content">
        <div class="form-container full-width">
          <div id="horizontal-form"></div>
        </div>
        <!-- 隐藏表单数据和验证结果，让表单更宽便于测试 -->
      </div>
    </div>

    <!-- 水平布局展开/收起示例 - 按钮组独占行 -->
    <div class="example-section">
      <div class="example-header">
        <h3>水平布局展开/收起 - 按钮组独占行</h3>
        <p>水平布局，配置显示2行（每行2列），按钮组独占一行显示，与表单字段分离。</p>
      </div>
      <div class="example-content">
        <div class="form-container full-width">
          <div id="horizontal-form-separate"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { FormCore, VanillaAdapter } from '@ldesign/form'
import type { FormConfig, FieldConfig } from '@ldesign/form'

// 响应式数据
const formData = ref({})
const validationResult = ref(null)
const horizontalFormData = ref({})
const horizontalValidationResult = ref(null)

// 表单实例
let form: FormCore | null = null
let horizontalForm: FormCore | null = null
let horizontalFormSeparate: FormCore | null = null

// 适配器实例 - 为每个表单创建独立的适配器实例
let verticalAdapter: VanillaAdapter | null = null
let horizontalAdapter: VanillaAdapter | null = null
let horizontalSeparateAdapter: VanillaAdapter | null = null

onMounted(() => {
  // 为垂直布局表单创建独立的适配器
  verticalAdapter = new VanillaAdapter()

  // 为水平布局表单创建独立的适配器
  horizontalAdapter = new VanillaAdapter()

  // 为水平布局独占行表单创建独立的适配器
  horizontalSeparateAdapter = new VanillaAdapter()

  // 创建基础展开/收起表单
  createCollapsibleForm()

  // 创建水平布局展开/收起表单（按钮组内联）
  createHorizontalForm()

  // 创建水平布局展开/收起表单（按钮组独占行）
  createHorizontalFormSeparate()
})

onUnmounted(() => {
  // 清理资源
  form?.destroy()
  horizontalForm?.destroy()
  verticalAdapter?.destroy()
  horizontalAdapter?.destroy()
})

/**
 * 添加表单操作按钮
 */
function addFormButtons(containerId: string, formInstance: FormCore, validationResultRef: any) {
  const container = document.getElementById(containerId)
  if (!container) return

  const buttonsContainer = document.createElement('div')
  buttonsContainer.className = 'form-buttons'

  // 基础按钮HTML（移除验证按钮）
  const buttonsHTML = `
    <button type="button" class="btn btn-primary">提交</button>
    <button type="button" class="btn btn-secondary">重置</button>
  `

  buttonsContainer.innerHTML = buttonsHTML

  // 绑定按钮事件
  const buttons = buttonsContainer.querySelectorAll('button')
  buttons[0].addEventListener('click', () => {
    const data = formInstance.getData()
    console.log('提交数据:', data)
  })

  buttons[1].addEventListener('click', () => {
    formInstance.reset()
  })

  container.appendChild(buttonsContainer)
}

/**
 * 创建基础展开/收起表单
 */
function createCollapsibleForm() {
  const fields: FieldConfig[] = [
    {
      name: 'name',
      label: '姓名',
      type: 'input',
      required: true,
      validation: { required: true, message: '请输入姓名' }
    },
    {
      name: 'gender',
      label: '性别',
      type: 'radio',
      options: [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' }
      ]
    },
    {
      name: 'hobby',
      label: '爱好',
      type: 'select',
      options: [
        { label: '请选择', value: '' },
        { label: '读书', value: 'reading' },
        { label: '运动', value: 'sports' },
        { label: '音乐', value: 'music' },
        { label: '旅行', value: 'travel' }
      ]
    },
    {
      name: 'email',
      label: '邮箱',
      type: 'input',
      validation: { email: true, message: '请输入有效的邮箱地址' }
    },
    {
      name: 'phone',
      label: '手机号',
      type: 'input',
      validation: { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' }
    },
    {
      name: 'address',
      label: '地址',
      type: 'input'
    },
    {
      name: 'company',
      label: '公司',
      type: 'input'
    },
    {
      name: 'position',
      label: '职位',
      type: 'input'
    },
    {
      name: 'remarks',
      label: '备注',
      type: 'textarea'
    }
  ]

  const config: FormConfig = {
    layout: {
      mode: 'vertical',
      collapsible: {
        enabled: true,
        defaultVisibleRows: 3,
        expandText: '展开',
        collapseText: '收起',
        showFieldCount: false,
        animationDuration: 300
      }
    }
  }

  const formConfig = {
    ...config,
    fields: fields
  }

  form = new FormCore(formConfig)

  // 渲染表单 - 使用垂直布局专用的适配器
  verticalAdapter!.mount(form, '#collapsible-form')

  // 监听数据变化
  form.on('change', (data) => {
    formData.value = data
  })

  // 不再需要手动添加按钮，VanillaAdapter会自动创建按钮组
}

/**
 * 创建水平布局展开/收起表单
 */
function createHorizontalForm() {
  const fields: FieldConfig[] = [
    {
      name: 'h_firstName',
      label: '名',
      type: 'input',
      required: true,
      validation: { required: true, message: '请输入名' }
    },
    {
      name: 'h_lastName',
      label: '姓',
      type: 'input',
      required: true,
      validation: { required: true, message: '请输入姓' }
    },
    {
      name: 'h_email',
      label: '邮箱地址',
      type: 'input',
      colSpan: 1, // 占用2列
      validation: { email: true, message: '请输入有效的邮箱地址' }
    },
    {
      name: 'h_phone',
      label: '手机号码',
      type: 'input',
      validation: { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' }
    },
    {
      name: 'h_city',
      label: '城市',
      type: 'input'
    },
    {
      name: 'h_country',
      label: '国家',
      type: 'input'
    },
    {
      name: 'h_company',
      label: '公司名称',
      type: 'input',
      colSpan: 2 // 占用2列
    },
    {
      name: 'h_department',
      label: '部门',
      type: 'input'
    },
    {
      name: 'h_position',
      label: '职位',
      type: 'input'
    },
    {
      name: 'h_experience',
      label: '工作经验',
      type: 'select',
      colSpan: 2, // 占用2列
      options: [
        { label: '1年以下', value: '0-1' },
        { label: '1-3年', value: '1-3' },
        { label: '3-5年', value: '3-5' },
        { label: '5年以上', value: '5+' }
      ]
    }
  ]

  const config: FormConfig = {
    layout: {
      mode: 'horizontal',
      horizontal: {
        columnsPerRow: 2,
        useGrid: true,
        rowGap: 16,
        columnGap: 20,
        buttonPosition: 'inline',
        buttonColSpan: 1
      },
      collapsible: {
        enabled: true,
        defaultVisibleRows: 2,
        expandText: '展开',
        collapseText: '收起',
        showFieldCount: false,
        animationDuration: 300
      }
    }
  }

  const formConfig = {
    ...config,
    fields: fields
  }

  horizontalForm = new FormCore(formConfig)

  // 渲染表单 - 使用水平布局专用的适配器
  horizontalAdapter!.mount(horizontalForm, '#horizontal-form')

  // 监听数据变化
  horizontalForm.on('change', (data) => {
    horizontalFormData.value = data
  })

  // 不再需要手动添加按钮，VanillaAdapter会自动创建按钮组
}

/**
 * 创建水平布局展开/收起表单（按钮组独占行）
 */
function createHorizontalFormSeparate() {
  // 使用相同的字段配置
  const fields: FieldConfig[] = [
    {
      name: 'firstName',
      label: '名',
      type: 'input',
      colSpan: 1
    },
    {
      name: 'lastName',
      label: '姓',
      type: 'input',
      colSpan: 1
    },
    {
      name: 'email',
      label: '邮箱地址',
      type: 'input',
      colSpan: 1 // 修改为1列，这样第二行会有空间
    },
    {
      name: 'phone',
      label: '手机号码',
      type: 'input',
      colSpan: 1
    },
    {
      name: 'city',
      label: '城市',
      type: 'input',
      colSpan: 1
    },
    {
      name: 'country',
      label: '国家',
      type: 'input',
      colSpan: 1
    },
    {
      name: 'company',
      label: '公司名称',
      type: 'input',
      colSpan: 2 // 占用2列
    },
    {
      name: 'department',
      label: '部门',
      type: 'input',
      colSpan: 1
    },
    {
      name: 'position',
      label: '职位',
      type: 'input',
      colSpan: 1
    },
    {
      name: 'experience',
      label: '工作经验',
      type: 'select',
      colSpan: 2, // 占用2列
      options: [
        { label: '1年以下', value: '0-1' },
        { label: '1-3年', value: '1-3' },
        { label: '3-5年', value: '3-5' },
        { label: '5年以上', value: '5+' }
      ]
    }
  ]

  const config: FormConfig = {
    layout: {
      mode: 'horizontal',
      horizontal: {
        columnsPerRow: 2,
        useGrid: true,
        rowGap: 16,
        columnGap: 20,
        buttonPosition: 'separate-row', // 按钮组独占行
        buttonColSpan: 1
      },
      collapsible: {
        enabled: true,
        defaultVisibleRows: 2,
        expandText: '展开',
        collapseText: '收起',
        showFieldCount: false,
        animationDuration: 300
      }
    }
  }

  const formConfig = {
    ...config,
    fields: fields
  }

  horizontalFormSeparate = new FormCore(formConfig)

  // 渲染表单 - 使用水平布局独占行专用的适配器
  horizontalSeparateAdapter!.mount(horizontalFormSeparate, '#horizontal-form-separate')

  // 监听数据变化
  horizontalFormSeparate.on('change', (data) => {
    console.log('Horizontal form separate data changed:', data)
  })
}


</script>

<style scoped lang="less">
.collapsible-example {
  padding: var(--ls-padding-lg);
  max-width: 1200px;
  margin: 0 auto;

  h2 {
    color: var(--ldesign-text-color-primary);
    margin-bottom: var(--ls-margin-base);
    font-size: var(--ls-font-size-h2);
  }

  > p {
    color: var(--ldesign-text-color-secondary);
    margin-bottom: var(--ls-margin-xl);
    font-size: var(--ls-font-size-base);
    line-height: 1.6;
  }
}

.example-section {
  margin-bottom: var(--ls-margin-xxl);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-lg);
  overflow: hidden;
  background: var(--ldesign-bg-color-container);

  .example-header {
    padding: var(--ls-padding-lg);
    background: var(--ldesign-bg-color-component);
    border-bottom: 1px solid var(--ldesign-border-color);

    h3 {
      margin: 0 0 var(--ls-margin-xs) 0;
      color: var(--ldesign-text-color-primary);
      font-size: var(--ls-font-size-h3);
    }

    p {
      margin: 0;
      color: var(--ldesign-text-color-secondary);
      font-size: var(--ls-font-size-sm);
    }
  }

  .example-content {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: var(--ls-spacing-lg);
    padding: var(--ls-padding-lg);

    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
      gap: var(--ls-spacing-base);
    }

    // 当隐藏右侧面板时，让表单占满宽度
    &:has(.full-width) {
      grid-template-columns: 1fr;
    }
  }
}

.form-container {
  min-height: 300px;

  &.full-width {
    max-width: 800px; // 让表单更宽，便于测试
  }
}

.result-panel {
  background: var(--ldesign-bg-color-component);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  padding: var(--ls-padding-base);

  h4 {
    margin: 0 0 var(--ls-margin-sm) 0;
    color: var(--ldesign-text-color-primary);
    font-size: var(--ls-font-size-base);
    font-weight: 600;
  }

  pre {
    background: var(--ldesign-bg-color-page);
    border: 1px solid var(--ldesign-border-color);
    border-radius: var(--ls-border-radius-sm);
    padding: var(--ls-padding-sm);
    margin: 0 0 var(--ls-margin-base) 0;
    font-size: var(--ls-font-size-xs);
    color: var(--ldesign-text-color-primary);
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-all;
  }
}

.form-buttons {
  display: flex;
  gap: var(--ls-spacing-sm);
  margin-top: var(--ls-margin-base);
  padding-top: var(--ls-padding-base);
  border-top: 1px solid var(--ldesign-border-color);

  button {
    padding: var(--ls-padding-xs) var(--ls-padding-base);
    border: 1px solid var(--ldesign-border-color);
    border-radius: var(--ls-border-radius-base);
    background: var(--ldesign-bg-color-component);
    color: var(--ldesign-text-color-primary);
    font-size: var(--ls-font-size-sm);
    cursor: pointer;
    transition: all 0.2s ease-in-out;

    &:hover {
      border-color: var(--ldesign-brand-color);
      color: var(--ldesign-brand-color);
    }

    &.primary {
      background: var(--ldesign-brand-color);
      border-color: var(--ldesign-brand-color);
      color: var(--ldesign-font-white-1);

      &:hover {
        background: var(--ldesign-brand-color-hover);
        border-color: var(--ldesign-brand-color-hover);
      }
    }

    &.btn-collapse {
      background: var(--ldesign-warning-color);
      border-color: var(--ldesign-warning-color);
      color: var(--ldesign-font-white-1);

      &:hover {
        background: var(--ldesign-warning-color-hover);
        border-color: var(--ldesign-warning-color-hover);
      }
    }
  }
}
</style>
