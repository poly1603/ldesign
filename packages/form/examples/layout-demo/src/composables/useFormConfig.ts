import { ref, computed, reactive, nextTick, onMounted, onUnmounted } from 'vue'
import type { FormOptions, FieldConfig } from '@ldesign/form'
import type {
  LayoutConfig,
  FormData,
  FieldGroup,
  FormState,
} from '@/types/form'

// 防抖函数
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout | null = null
  return ((...args: any[]) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }) as T
}

export function useFormConfig() {
  // 字段最小宽度（用于自动列数计算）
  const fieldMinWidth = 200

  // 当前布局配置
  const currentLayout = reactive<LayoutConfig>({
    columns: 2,
    autoColumns: false,
    gap: 16,
    rowGap: 16,
    columnGap: 16,
    unifiedSpacing: true,
    labelPosition: 'top',
    labelWidth: 'auto',
    autoLabelWidth: false, // 顶部标签时默认不启用自动计算
    labelWidthMode: 'auto',
    labelWidthByColumn: {},
    labelAlign: 'left',
    defaultRows: 0,
    expandMode: 'inline',
    showExpandButton: false,
    buttonPosition: 'follow-last-row', // 按钮组位置：'follow-last-row' | 'separate-row'
  })

  // 是否显示分组
  const showGroups = ref(false)

  // 是否显示验证
  const showValidation = ref(true)

  // 表单状态
  const formState = reactive<FormState>({
    isExpanded: false,
    visibleFields: [],
    hiddenFields: [],
    calculatedColumns: 2,
    calculatedLabelWidths: {},
  })

  // 容器引用
  const containerRef = ref<HTMLElement>()

  // 自动计算列数
  const calculateOptimalColumns = () => {
    if (!containerRef.value || !currentLayout.autoColumns) return

    // 获取表单容器的实际宽度
    const formContainer = containerRef.value.querySelector(
      '.form-fields'
    ) as HTMLElement
    if (!formContainer) return

    const containerWidth =
      formContainer.clientWidth || formContainer.offsetWidth
    let availableWidth = containerWidth - 32 // 减去容器内边距和间距
    let effectiveFieldMinWidth = fieldMinWidth

    // 如果标签在左侧或右侧，需要考虑标签宽度占用的空间
    if (
      currentLayout.labelPosition === 'left' ||
      currentLayout.labelPosition === 'right'
    ) {
      const labelWidth =
        typeof currentLayout.labelWidth === 'number'
          ? currentLayout.labelWidth
          : 120 // 默认标签宽度

      // 每个字段需要额外的标签宽度和间距
      effectiveFieldMinWidth = fieldMinWidth + labelWidth + 8 // 8px 为标签和输入框间距
    }

    const optimalColumns = Math.max(
      1,
      Math.min(4, Math.floor(availableWidth / effectiveFieldMinWidth))
    )

    formState.calculatedColumns = optimalColumns
    if (currentLayout.autoColumns) {
      currentLayout.columns = optimalColumns
    }
  }

  // 文本宽度测量缓存
  const textWidthCache = new Map<string, number>()

  // 使用真实DOM元素精确测量文本宽度
  const measureTextWidth = (text: string): number => {
    if (typeof window === 'undefined') return text.length * 8 // SSR fallback

    // 检查缓存
    const cacheKey = text
    if (textWidthCache.has(cacheKey)) {
      return textWidthCache.get(cacheKey)!
    }

    // 创建临时DOM元素来测量文本宽度
    const tempElement = document.createElement('span')
    tempElement.style.cssText = `
      position: absolute;
      visibility: hidden;
      white-space: nowrap;
      font-weight: 500;
      font-size: 0.9rem;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.4;
    `
    tempElement.textContent = text

    document.body.appendChild(tempElement)
    const width = tempElement.getBoundingClientRect().width
    document.body.removeChild(tempElement)

    // 缓存结果，使用floor而不是ceil来避免偏大
    const finalWidth = Math.floor(width)
    textWidthCache.set(cacheKey, finalWidth)
    return finalWidth
  }

  // 计算标签宽度
  const calculateLabelWidths = () => {
    if (!currentLayout.autoLabelWidth || currentLayout.labelPosition === 'top')
      return

    const columns =
      typeof currentLayout.columns === 'number' ? currentLayout.columns : 2
    const labelWidths: Record<number, number> = {}

    if (currentLayout.labelWidthMode === 'auto') {
      // 自动计算模式：每列使用该列中最宽标签的宽度
      for (let col = 0; col < columns; col++) {
        let maxWidth = 0
        const fieldsInColumn = baseFields.filter(
          (_, index) => index % columns === col
        )

        fieldsInColumn.forEach(field => {
          const labelText = field.label || ''
          if (labelText) {
            // 如果有必填标记，在测量时包含星号
            const fullText = field.required ? `${labelText}*` : labelText
            // 使用Canvas精确测量完整文本宽度，不加任何padding
            const textWidth = measureTextWidth(fullText)
            maxWidth = Math.max(maxWidth, textWidth)
          }
        })

        // 直接使用测量的宽度，不加容错空间
        labelWidths[col] = Math.max(30, maxWidth)
      }
    } else {
      // 手动设置模式：使用用户设置的宽度
      for (let col = 0; col < columns; col++) {
        // 使用用户设置的宽度，如果没有设置则使用默认宽度120px
        labelWidths[col] = currentLayout.labelWidthByColumn?.[col] || 120
      }
    }

    // 更新计算结果到状态中
    formState.calculatedLabelWidths = labelWidths

    // 只在自动计算模式下更新到布局配置中，手动模式下保持用户设置不变
    if (currentLayout.labelWidthMode === 'auto') {
      currentLayout.labelWidthByColumn = { ...labelWidths }
    }
  }

  // 计算可见和隐藏字段
  const calculateVisibleFields = () => {
    if (!currentLayout.defaultRows || currentLayout.defaultRows <= 0) {
      formState.visibleFields = baseFields.map(f => f.name)
      formState.hiddenFields = []
      return
    }

    const columns =
      typeof currentLayout.columns === 'number' ? currentLayout.columns : 2
    let maxVisibleFields = currentLayout.defaultRows * columns

    // 根据按钮组位置决定是否预留空间
    if (currentLayout.buttonPosition === 'follow-last-row') {
      maxVisibleFields = maxVisibleFields - 1 // 预留操作按钮位置
    }

    formState.visibleFields = baseFields
      .slice(0, maxVisibleFields)
      .map(f => f.name)
    formState.hiddenFields = baseFields.slice(maxVisibleFields).map(f => f.name)
  }

  // 监听容器大小变化
  const handleResize = debounce(() => {
    // 等待DOM更新完成后再计算
    nextTick(() => {
      if (currentLayout.autoColumns) {
        calculateOptimalColumns()
      }
      if (currentLayout.autoLabelWidth) {
        calculateLabelWidths()
      }
    })
  }, 300)

  // 字段分组配置
  const fieldGroups: FieldGroup[] = [
    {
      title: '基本信息',
      fields: [
        'firstName',
        'lastName',
        'email',
        'phone',
        'gender',
        'birthDate',
      ],
      description: '请填写您的基本个人信息',
    },
    {
      title: '地址信息',
      fields: ['country', 'province', 'city', 'address', 'zipCode'],
      description: '请填写您的详细地址信息',
    },
    {
      title: '职业信息',
      fields: ['company', 'position', 'industry', 'experience', 'salary'],
      description: '请填写您的职业相关信息',
    },
    {
      title: '偏好设置',
      fields: ['interests', 'newsletter', 'notifications', 'language'],
      description: '请设置您的个人偏好',
    },
    {
      title: '其他信息',
      fields: ['bio', 'website', 'socialMedia'],
      description: '请填写其他补充信息',
    },
  ]

  // 基础字段配置
  const baseFields: FieldConfig[] = [
    {
      name: 'firstName',
      label: '名',
      component: 'FormInput',
      required: true,
      placeholder: '请输入您的名',
      rules: showValidation.value
        ? [
            { required: true, message: '请输入您的名' },
            { min: 1, max: 20, message: '名字长度为1-20个字符' },
          ]
        : [],
    },
    {
      name: 'lastName',
      label: '姓',
      component: 'FormInput',
      required: true,
      placeholder: '请输入您的姓',
      rules: showValidation.value
        ? [
            { required: true, message: '请输入您的姓' },
            { min: 1, max: 20, message: '姓氏长度为1-20个字符' },
          ]
        : [],
    },
    {
      name: 'email',
      label: '邮箱地址',
      component: 'FormInput',
      props: { type: 'email' },
      required: true,
      placeholder: '请输入邮箱地址',
      span: 'full',
      rules: showValidation.value
        ? [
            { required: true, message: '请输入邮箱地址' },
            { type: 'email', message: '请输入有效的邮箱地址' },
          ]
        : [],
    },
    {
      name: 'phone',
      label: '手机号码',
      component: 'FormInput',
      props: { type: 'tel' },
      placeholder: '请输入手机号码',
      rules: showValidation.value
        ? [{ pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' }]
        : [],
    },
    {
      name: 'gender',
      label: '性别',
      component: 'FormRadio',
      props: {
        options: [
          { label: '男', value: 'male' },
          { label: '女', value: 'female' },
          { label: '其他', value: 'other' },
        ],
      },
    },
    {
      name: 'birthDate',
      label: '出生日期',
      component: 'FormDatePicker',
      placeholder: '请选择出生日期',
    },
    {
      name: 'country',
      label: '国家/地区',
      component: 'FormSelect',
      required: true,
      props: {
        options: [
          { label: '中国', value: 'china' },
          { label: '美国', value: 'usa' },
          { label: '日本', value: 'japan' },
          { label: '韩国', value: 'korea' },
          { label: '其他', value: 'other' },
        ],
      },
      rules: showValidation.value
        ? [{ required: true, message: '请选择国家/地区' }]
        : [],
    },
    {
      name: 'province',
      label: '省/州',
      component: 'FormInput',
      placeholder: '请输入省/州',
    },
    {
      name: 'city',
      label: '城市',
      component: 'FormInput',
      placeholder: '请输入城市',
    },
    {
      name: 'address',
      label: '详细地址',
      component: 'FormInput',
      placeholder: '请输入详细地址',
      span: 'full',
    },
    {
      name: 'zipCode',
      label: '邮政编码',
      component: 'FormInput',
      placeholder: '请输入邮政编码',
    },
    {
      name: 'company',
      label: '公司名称',
      component: 'FormInput',
      placeholder: '请输入公司名称',
      span: 'full',
    },
    {
      name: 'position',
      label: '职位',
      component: 'FormInput',
      placeholder: '请输入职位',
    },
    {
      name: 'industry',
      label: '行业',
      component: 'FormSelect',
      props: {
        options: [
          { label: '互联网/IT', value: 'it' },
          { label: '金融', value: 'finance' },
          { label: '教育', value: 'education' },
          { label: '医疗', value: 'healthcare' },
          { label: '制造业', value: 'manufacturing' },
          { label: '服务业', value: 'service' },
          { label: '其他', value: 'other' },
        ],
      },
    },
    {
      name: 'experience',
      label: '工作经验',
      component: 'FormSelect',
      props: {
        options: [
          { label: '应届毕业生', value: '0' },
          { label: '1-3年', value: '1-3' },
          { label: '3-5年', value: '3-5' },
          { label: '5-10年', value: '5-10' },
          { label: '10年以上', value: '10+' },
        ],
      },
    },
    {
      name: 'salary',
      label: '期望薪资',
      component: 'FormInput',
      props: { type: 'number' },
      placeholder: '请输入期望薪资（元/月）',
    },
    {
      name: 'interests',
      label: '兴趣爱好',
      component: 'FormCheckbox',
      props: {
        options: [
          { label: '阅读', value: 'reading' },
          { label: '运动', value: 'sports' },
          { label: '音乐', value: 'music' },
          { label: '旅行', value: 'travel' },
          { label: '摄影', value: 'photography' },
          { label: '编程', value: 'programming' },
          { label: '游戏', value: 'gaming' },
          { label: '烹饪', value: 'cooking' },
        ],
      },
      span: 'full',
    },
    {
      name: 'newsletter',
      label: '订阅邮件通知',
      component: 'FormSwitch',
    },
    {
      name: 'notifications',
      label: '接收推送通知',
      component: 'FormSwitch',
    },
    {
      name: 'language',
      label: '首选语言',
      component: 'FormSelect',
      props: {
        options: [
          { label: '中文', value: 'zh' },
          { label: 'English', value: 'en' },
          { label: '日本語', value: 'ja' },
          { label: '한국어', value: 'ko' },
        ],
      },
    },
    {
      name: 'bio',
      label: '个人简介',
      component: 'FormTextarea',
      placeholder: '请简单介绍一下自己...',
      span: 'full',
      props: {
        rows: 4,
        maxlength: 500,
      },
    },
    {
      name: 'website',
      label: '个人网站',
      component: 'FormInput',
      props: { type: 'url' },
      placeholder: 'https://example.com',
    },
    {
      name: 'socialMedia',
      label: '社交媒体',
      component: 'FormInput',
      placeholder: '请输入社交媒体账号',
    },
  ]

  // 计算可见字段
  const visibleFields = computed(() => {
    if (
      !currentLayout.defaultRows ||
      currentLayout.defaultRows <= 0 ||
      formState.isExpanded
    ) {
      return baseFields
    }

    const fieldsToShow = baseFields.filter(field =>
      formState.visibleFields.includes(field.name)
    )

    // 添加操作按钮字段
    if (formState.hiddenFields.length > 0) {
      fieldsToShow.push({
        name: '_actions',
        label: '',
        component: 'FormActions',
        span: 1,
        props: {
          showQuery: true,
          showReset: true,
          showExpand: true,
          expandText: formState.isExpanded ? '收起' : '展开',
          onQuery: () => console.log('查询'),
          onReset: () => console.log('重置'),
          onExpand: () => toggleExpand(),
        },
      })
    }

    return fieldsToShow
  })

  // 计算表单配置
  const formOptions = computed((): FormOptions => {
    let fields = visibleFields.value

    // 如果有默认行数限制且有隐藏字段，根据按钮位置添加按钮组
    if (
      currentLayout.defaultRows &&
      currentLayout.defaultRows > 0 &&
      formState.hiddenFields.length > 0
    ) {
      // 只有在"跟随最后一行"模式下才在表单内添加按钮组
      if (currentLayout.buttonPosition === 'follow-last-row') {
        const columns =
          typeof currentLayout.columns === 'number' ? currentLayout.columns : 2
        const visibleFieldsCount = formState.visibleFields.length
        const lastRowFieldsCount = visibleFieldsCount % columns

        // 如果最后一行没有填满，在最后一行添加按钮组
        // 如果最后一行已满，则在新的一行添加按钮组
        const buttonField: FieldConfig = {
          name: '__form_actions__',
          label: '',
          component: 'FormActions',
          props: {
            showQuery: true,
            showReset: true,
            showExpand: true,
            expandText: formState.isExpanded ? '收起' : '展开',
            labelPosition: currentLayout.labelPosition, // 传递标签位置信息
            onQuery: () => console.log('查询'),
            onReset: () => console.log('重置'),
            onExpand: toggleExpand,
          },
          span: 1,
          style: {
            display: 'flex',
            justifyContent: 'flex-end', // 按钮组右对齐
            alignItems: 'center',
          },
        }

        fields = [...fields, buttonField]
      }
    }

    const options: FormOptions = {
      fields,
      layout: currentLayout,
      submitButton:
        currentLayout.defaultRows && currentLayout.defaultRows > 0
          ? currentLayout.buttonPosition === 'separate-row'
            ? {
                text: '提交表单',
                type: 'primary',
              }
            : undefined
          : {
              text: '提交表单',
              type: 'primary',
            },
    }

    // 如果启用分组
    if (showGroups.value) {
      options.groups = fieldGroups.map(group => ({
        title: group.title,
        fields: group.fields,
        layout: {
          columns: currentLayout.columns,
          gap: currentLayout.gap,
        },
        collapsible: true,
        collapsed: false,
      }))
    }

    return options
  })

  // 更新布局配置
  const updateLayout = (key: keyof LayoutConfig, value: any) => {
    ;(currentLayout as any)[key] = value

    // 当相关配置变化时重新计算
    if (key === 'columns' || key === 'autoColumns') {
      calculateLabelWidths()
      calculateVisibleFields()
    }
    if (key === 'defaultRows') {
      calculateVisibleFields()
    }
    // 当标签位置变化时的特殊处理
    if (key === 'labelPosition') {
      // 如果切换到左侧或右侧，自动启用自动计算宽度
      if (value === 'left' || value === 'right') {
        currentLayout.autoLabelWidth = true
        currentLayout.labelWidthMode = 'auto'
        // 立即计算标签宽度
        calculateLabelWidths()
      }
      // 无论如何都重新计算一次
      calculateLabelWidths()
    }
    if (key === 'unifiedSpacing') {
      if (value) {
        currentLayout.rowGap = currentLayout.gap
        currentLayout.columnGap = currentLayout.gap
      }
    }
    if (key === 'gap' && currentLayout.unifiedSpacing) {
      currentLayout.rowGap = value
      currentLayout.columnGap = value
    }
  }

  // 切换自动列数
  const toggleAutoColumns = () => {
    currentLayout.autoColumns = !currentLayout.autoColumns
    if (currentLayout.autoColumns) {
      calculateOptimalColumns()
    }
  }

  // 切换统一间距
  const toggleUnifiedSpacing = () => {
    currentLayout.unifiedSpacing = !currentLayout.unifiedSpacing
    if (currentLayout.unifiedSpacing) {
      currentLayout.rowGap = currentLayout.gap
      currentLayout.columnGap = currentLayout.gap
    }
  }

  // 切换自动标签宽度
  const toggleAutoLabelWidth = () => {
    currentLayout.autoLabelWidth = !currentLayout.autoLabelWidth
    if (currentLayout.autoLabelWidth) {
      calculateLabelWidths()
    }
  }

  // 切换展开状态
  const toggleExpand = () => {
    formState.isExpanded = !formState.isExpanded
  }

  // 切换按钮位置
  const toggleButtonPosition = () => {
    currentLayout.buttonPosition =
      currentLayout.buttonPosition === 'follow-last-row'
        ? 'separate-row'
        : 'follow-last-row'
    calculateVisibleFields()
  }

  // 切换分组显示
  const toggleGroups = () => {
    showGroups.value = !showGroups.value
  }

  // 切换验证显示
  const toggleValidation = () => {
    showValidation.value = !showValidation.value
    // 重新生成字段配置以更新验证规则
    baseFields.forEach(field => {
      if (showValidation.value) {
        // 重新添加验证规则
        switch (field.name) {
          case 'firstName':
          case 'lastName':
            field.rules = [
              { required: true, message: `请输入您的${field.label}` },
              { min: 1, max: 20, message: `${field.label}长度为1-20个字符` },
            ]
            break
          case 'email':
            field.rules = [
              { required: true, message: '请输入邮箱地址' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]
            break
          case 'phone':
            field.rules = [
              { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' },
            ]
            break
          case 'country':
            field.rules = [{ required: true, message: '请选择国家/地区' }]
            break
        }
      } else {
        field.rules = []
      }
    })
  }

  // 切换标签宽度模式
  const toggleLabelWidthMode = () => {
    currentLayout.labelWidthMode =
      currentLayout.labelWidthMode === 'auto' ? 'manual' : 'auto'
    calculateLabelWidths()
  }

  // 设置手动标签宽度
  const setManualLabelWidth = (columnIndex: number, width: number) => {
    if (!currentLayout.labelWidthByColumn) {
      currentLayout.labelWidthByColumn = {}
    }
    currentLayout.labelWidthByColumn[columnIndex] = Math.max(
      60,
      Math.min(300, width)
    )
    if (currentLayout.labelWidthMode === 'manual') {
      calculateLabelWidths()
    }
  }

  // 初始化计算
  const initialize = () => {
    // 如果标签位置是左侧或右侧，自动启用自动计算宽度
    if (
      currentLayout.labelPosition === 'left' ||
      currentLayout.labelPosition === 'right'
    ) {
      currentLayout.autoLabelWidth = true
      currentLayout.labelWidthMode = 'auto'
    }

    calculateVisibleFields()
    calculateLabelWidths()
    if (currentLayout.autoColumns) {
      calculateOptimalColumns()
    }
  }

  // 生命周期钩子
  onMounted(() => {
    initialize()
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })

  return {
    currentLayout,
    showGroups,
    showValidation,
    formState,
    containerRef,
    fieldGroups,
    formOptions,
    visibleFields,
    updateLayout,
    toggleAutoColumns,
    toggleUnifiedSpacing,
    toggleAutoLabelWidth,
    toggleExpand,
    toggleButtonPosition,
    toggleGroups,
    toggleValidation,
    toggleLabelWidthMode,
    setManualLabelWidth,
    calculateOptimalColumns,
    calculateLabelWidths,
    calculateVisibleFields,
  }
}
