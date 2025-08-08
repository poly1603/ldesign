import { ref, computed, reactive } from 'vue'
import type { FormOptions, FieldConfig } from '@ldesign/form'
import type {
  LayoutPreset,
  LayoutConfig,
  FormData,
  FieldGroup,
} from '@/types/form'

export function useFormConfig() {
  // 当前布局配置
  const currentLayout = reactive<LayoutConfig>({
    columns: 2,
    gap: 16,
    labelPosition: 'top',
    labelWidth: 'auto',
    labelAlign: 'left',
  })

  // 是否显示分组
  const showGroups = ref(false)

  // 是否显示验证
  const showValidation = ref(true)

  // 布局预设
  const layoutPresets: LayoutPreset[] = [
    {
      name: 'responsive',
      label: '响应式布局',
      config: {
        columns: { xs: 1, sm: 1, md: 2, lg: 3, xl: 4 },
        gap: { xs: 8, sm: 12, md: 16, lg: 20, xl: 24 },
        labelPosition: 'top',
      },
    },
    {
      name: 'single',
      label: '单列布局',
      config: {
        columns: 1,
        gap: 20,
        labelPosition: 'top',
      },
    },
    {
      name: 'double',
      label: '双列布局',
      config: {
        columns: 2,
        gap: 16,
        labelPosition: 'top',
      },
    },
    {
      name: 'triple',
      label: '三列布局',
      config: {
        columns: 3,
        gap: 16,
        labelPosition: 'top',
      },
    },
    {
      name: 'leftLabel',
      label: '左侧标签',
      config: {
        columns: 1,
        gap: 16,
        labelPosition: 'left',
        labelWidth: 120,
        labelAlign: 'right',
      },
    },
    {
      name: 'rightLabel',
      label: '右侧标签',
      config: {
        columns: 1,
        gap: 16,
        labelPosition: 'right',
        labelWidth: 120,
        labelAlign: 'left',
      },
    },
  ]

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

  // 计算表单配置
  const formOptions = computed((): FormOptions => {
    const options: FormOptions = {
      fields: baseFields,
      layout: currentLayout,
      submitButton: {
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

  // 应用布局预设
  const applyLayoutPreset = (preset: LayoutPreset) => {
    Object.assign(currentLayout, preset.config)
  }

  // 更新布局配置
  const updateLayout = (key: keyof LayoutConfig, value: any) => {
    ;(currentLayout as any)[key] = value
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

  return {
    currentLayout,
    showGroups,
    showValidation,
    layoutPresets,
    fieldGroups,
    formOptions,
    applyLayoutPreset,
    updateLayout,
    toggleGroups,
    toggleValidation,
  }
}
