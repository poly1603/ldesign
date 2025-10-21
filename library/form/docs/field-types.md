# 字段类型文档

@ldesign/form 提供了丰富的字段类型组件，支持各种常见的表单输入场景。

## 目录

- [基础输入字段](#基础输入字段)
- [选择类字段](#选择类字段)
- [日期时间字段](#日期时间字段)
- [高级字段](#高级字段)
- [自定义字段](#自定义字段)

## 基础输入字段

### InputField - 输入框

支持文本、密码、邮箱、数字、电话等多种输入类型。

#### 配置选项

```typescript
interface InputFieldProps {
  // 基础属性
  id?: string
  name?: string
  modelValue?: string | number
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url'
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  
  // 功能特性
  clearable?: boolean           // 显示清空按钮
  showCount?: boolean           // 显示字符计数
  maxLength?: number            // 最大长度
  showPasswordToggle?: boolean  // 密码可见性切换
  
  // 前后缀
  prefix?: string | Component   // 前缀内容
  suffix?: string | Component   // 后缀内容
  
  // 状态
  error?: boolean               // 错误状态
}
```

#### 使用示例

```vue
<template>
  <!-- 基础文本输入 -->
  <InputField
    v-model="username"
    placeholder="请输入用户名"
    clearable
  />

  <!-- 带字符计数 -->
  <InputField
    v-model="nickname"
    :maxLength="20"
    showCount
    placeholder="请输入昵称"
  />

  <!-- 密码输入 -->
  <InputField
    v-model="password"
    type="password"
    showPasswordToggle
    placeholder="请输入密码"
  />

  <!-- 带前后缀 -->
  <InputField
    v-model="price"
    type="number"
    prefix="¥"
    suffix="元"
  />
</template>

<script setup>
import { ref } from 'vue'
import { InputField } from '@ldesign/form/vue/fields'

const username = ref('')
const nickname = ref('')
const password = ref('')
const price = ref('')
</script>
```

#### 事件

- `update:modelValue` - 值变化时触发
- `change` - 值变化且失焦时触发
- `blur` - 失焦时触发
- `focus` - 聚焦时触发
- `clear` - 点击清空按钮时触发
- `keypress` - 键盘按下时触发

#### 方法

- `focus()` - 聚焦到输入框
- `blur()` - 失焦

---

### TextareaField - 多行文本

支持多行文本输入，可自动调整高度。

#### 配置选项

```typescript
interface TextareaFieldProps {
  id?: string
  name?: string
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  rows?: number                 // 行数
  
  // 自动高度
  autosize?: boolean | {
    minRows?: number
    maxRows?: number
  }
  
  // 功能特性
  showCount?: boolean           // 显示字符计数
  maxLength?: number            // 最大长度
  showMarkdownPreview?: boolean // Markdown 预览
  
  error?: boolean
}
```

#### 使用示例

```vue
<template>
  <!-- 基础多行文本 -->
  <TextareaField
    v-model="description"
    :rows="4"
    placeholder="请输入描述"
  />

  <!-- 自动高度 -->
  <TextareaField
    v-model="content"
    :autosize="{ minRows: 3, maxRows: 10 }"
    placeholder="内容会自动扩展高度"
  />

  <!-- 带字符计数 -->
  <TextareaField
    v-model="bio"
    :maxLength="500"
    showCount
    placeholder="个人简介"
  />

  <!-- Markdown 预览 -->
  <TextareaField
    v-model="markdown"
    showMarkdownPreview
    placeholder="支持 Markdown 语法"
  />
</template>
```

---

## 选择类字段

### SelectField - 下拉选择

支持单选、多选、搜索、远程加载等功能。

#### 配置选项

```typescript
interface SelectOption {
  label: string
  value: any
  disabled?: boolean
  group?: string
}

interface SelectFieldProps {
  modelValue?: any | any[]
  options?: SelectOption[]
  placeholder?: string
  disabled?: boolean
  
  // 功能特性
  multiple?: boolean            // 多选模式
  filterable?: boolean          // 可搜索
  loading?: boolean             // 加载状态
  loadOptions?: () => Promise<SelectOption[]>  // 远程加载
  maxHeight?: number            // 下拉菜单最大高度
  virtualScroll?: boolean       // 虚拟滚动（大数据量）
  
  error?: boolean
}
```

#### 使用示例

```vue
<template>
  <!-- 基础下拉选择 -->
  <SelectField
    v-model="category"
    :options="categoryOptions"
    placeholder="请选择分类"
  />

  <!-- 多选 -->
  <SelectField
    v-model="tags"
    :options="tagOptions"
    multiple
    placeholder="选择标签"
  />

  <!-- 可搜索 -->
  <SelectField
    v-model="city"
    :options="cityOptions"
    filterable
    placeholder="搜索城市"
  />

  <!-- 远程加载 -->
  <SelectField
    v-model="userId"
    :loadOptions="loadUsers"
    filterable
    placeholder="搜索用户"
  />

  <!-- 分组选项 -->
  <SelectField
    v-model="fruit"
    :options="fruitOptions"
    placeholder="选择水果"
  />
</template>

<script setup>
import { ref } from 'vue'
import { SelectField } from '@ldesign/form/vue/fields'

const category = ref('')
const categoryOptions = [
  { label: '技术', value: 'tech' },
  { label: '产品', value: 'product' },
  { label: '设计', value: 'design' }
]

const tags = ref([])
const tagOptions = [
  { label: 'Vue', value: 'vue' },
  { label: 'React', value: 'react' },
  { label: 'Angular', value: 'angular' }
]

const city = ref('')
const cityOptions = [
  { label: '北京', value: 'beijing' },
  { label: '上海', value: 'shanghai' },
  { label: '广州', value: 'guangzhou' },
  { label: '深圳', value: 'shenzhen' }
]

const userId = ref('')
const loadUsers = async () => {
  const response = await fetch('/api/users')
  return response.json()
}

const fruit = ref('')
const fruitOptions = [
  { label: '苹果', value: 'apple', group: '常见水果' },
  { label: '香蕉', value: 'banana', group: '常见水果' },
  { label: '榴莲', value: 'durian', group: '热带水果' },
  { label: '芒果', value: 'mango', group: '热带水果' }
]
</script>
```

---

### RadioField - 单选按钮

单选按钮组，支持水平和垂直布局。

#### 配置选项

```typescript
interface RadioOption {
  label: string
  value: any
  disabled?: boolean
}

interface RadioFieldProps {
  modelValue?: any
  options?: RadioOption[]
  name?: string
  disabled?: boolean
  buttonStyle?: boolean         // 按钮样式
  direction?: 'horizontal' | 'vertical'  // 方向
}
```

#### 使用示例

```vue
<template>
  <!-- 基础单选 -->
  <RadioField
    v-model="gender"
    :options="genderOptions"
  />

  <!-- 垂直布局 -->
  <RadioField
    v-model="plan"
    :options="planOptions"
    direction="vertical"
  />

  <!-- 按钮样式 -->
  <RadioField
    v-model="size"
    :options="sizeOptions"
    buttonStyle
  />
</template>

<script setup>
import { ref } from 'vue'
import { RadioField } from '@ldesign/form/vue/fields'

const gender = ref('')
const genderOptions = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
  { label: '其他', value: 'other' }
]

const plan = ref('')
const planOptions = [
  { label: '免费版', value: 'free' },
  { label: '专业版', value: 'pro' },
  { label: '企业版', value: 'enterprise' }
]

const size = ref('medium')
const sizeOptions = [
  { label: '小', value: 'small' },
  { label: '中', value: 'medium' },
  { label: '大', value: 'large' }
]
</script>
```

---

### CheckboxField - 复选框

复选框组，支持全选、最小/最大选择数量限制。

#### 配置选项

```typescript
interface CheckboxOption {
  label: string
  value: any
  disabled?: boolean
}

interface CheckboxFieldProps {
  modelValue?: any[]
  options?: CheckboxOption[]
  name?: string
  disabled?: boolean
  showCheckAll?: boolean        // 显示全选
  min?: number                  // 最小选择数量
  max?: number                  // 最大选择数量
  direction?: 'horizontal' | 'vertical'
}
```

#### 使用示例

```vue
<template>
  <!-- 基础复选框 -->
  <CheckboxField
    v-model="hobbies"
    :options="hobbyOptions"
  />

  <!-- 带全选 -->
  <CheckboxField
    v-model="permissions"
    :options="permissionOptions"
    showCheckAll
  />

  <!-- 最小最大限制 -->
  <CheckboxField
    v-model="topSkills"
    :options="skillOptions"
    :min="1"
    :max="3"
  />

  <!-- 垂直布局 -->
  <CheckboxField
    v-model="features"
    :options="featureOptions"
    direction="vertical"
  />
</template>

<script setup>
import { ref } from 'vue'
import { CheckboxField } from '@ldesign/form/vue/fields'

const hobbies = ref([])
const hobbyOptions = [
  { label: '阅读', value: 'reading' },
  { label: '运动', value: 'sports' },
  { label: '音乐', value: 'music' },
  { label: '旅行', value: 'travel' }
]

const permissions = ref([])
const permissionOptions = [
  { label: '读取', value: 'read' },
  { label: '写入', value: 'write' },
  { label: '删除', value: 'delete' },
  { label: '管理', value: 'admin' }
]

const topSkills = ref([])
const skillOptions = [
  { label: 'JavaScript', value: 'js' },
  { label: 'TypeScript', value: 'ts' },
  { label: 'Python', value: 'py' },
  { label: 'Java', value: 'java' },
  { label: 'Go', value: 'go' }
]

const features = ref([])
const featureOptions = [
  { label: '自动保存', value: 'autosave' },
  { label: '夜间模式', value: 'darkmode' },
  { label: '邮件通知', value: 'emailnotify' }
]
</script>
```

---

## 日期时间字段

### DatePickerField - 日期选择器

日期选择器组件，支持日期范围、禁用日期和快捷选择。

#### 配置选项

```typescript
interface DateShortcut {
  text: string
  value: Date | (() => Date)
}

interface DatePickerFieldProps {
  modelValue?: string | Date
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  format?: string                    // 日期格式，默认 'YYYY-MM-DD'
  shortcuts?: DateShortcut[]         // 快捷选择
  disabledDate?: (date: Date) => boolean  // 禁用日期函数
}
```

#### 使用示例

```vue
<template>
  <!-- 基础日期选择 -->
  <DatePickerField
    v-model="birthday"
    placeholder="请选择出生日期"
  />

  <!-- 带快捷选择 -->
  <DatePickerField
    v-model="date"
    :shortcuts="dateShortcuts"
    placeholder="选择日期"
  />

  <!-- 禁用周末 -->
  <DatePickerField
    v-model="workDate"
    :disabledDate="disableWeekends"
    placeholder="选择工作日"
  />

  <!-- 自定义格式 -->
  <DatePickerField
    v-model="customDate"
    format="YYYY年MM月DD日"
  />
</template>

<script setup>
import { ref } from 'vue'
import { DatePickerField } from '@ldesign/form/vue/fields'

const birthday = ref('')
const date = ref('')

const dateShortcuts = [
  { text: '今天', value: () => new Date() },
  { text: '昨天', value: () => {
    const date = new Date()
    date.setDate(date.getDate() - 1)
    return date
  }},
  { text: '最近7天', value: () => {
    const date = new Date()
    date.setDate(date.getDate() - 6)
    return date
  }}
]

const workDate = ref('')
const disableWeekends = (date) => {
  const day = date.getDay()
  return day === 0 || day === 6  // 禁用周日和周六
}

const customDate = ref('')
</script>
```

---

### TimePickerField - 时间选择器

时间选择器组件，支持时分秒选择和步长控制。

#### 配置选项

```typescript
interface TimePickerFieldProps {
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  format?: '12' | '24'               // 12/24小时制
  showSecond?: boolean               // 显示秒
  hourStep?: number                  // 小时步长
  minuteStep?: number                // 分钟步长
  secondStep?: number                // 秒步长
  disabledHours?: () => number[]     // 禁用小时
  disabledMinutes?: (hour: number) => number[]     // 禁用分钟
  disabledSeconds?: (hour: number, minute: number) => number[]  // 禁用秒
}
```

#### 使用示例

```vue
<template>
  <!-- 基础时间选择 -->
  <TimePickerField
    v-model="time"
    placeholder="请选择时间"
  />

  <!-- 不显示秒 -->
  <TimePickerField
    v-model="appointmentTime"
    :showSecond="false"
  />

  <!-- 15分钟步长 -->
  <TimePickerField
    v-model="meetingTime"
    :minuteStep="15"
  />

  <!-- 禁用时间段 -->
  <TimePickerField
    v-model="businessHours"
    :disabledHours="disableNonBusinessHours"
  />

  <!-- 12小时制 -->
  <TimePickerField
    v-model="time12"
    format="12"
  />
</template>

<script setup>
import { ref } from 'vue'
import { TimePickerField } from '@ldesign/form/vue/fields'

const time = ref('')
const appointmentTime = ref('')
const meetingTime = ref('')
const businessHours = ref('')

// 禁用非营业时间（9:00-18:00）
const disableNonBusinessHours = () => {
  const disabled = []
  for (let i = 0; i < 9; i++) disabled.push(i)
  for (let i = 19; i < 24; i++) disabled.push(i)
  return disabled
}

const time12 = ref('')
</script>
```

---

### CascaderField - 级联选择器

级联选择器组件，支持多级联动和异步加载。

#### 配置选项

```typescript
interface CascaderOption {
  label: string
  value: any
  disabled?: boolean
  children?: CascaderOption[]
  loadChildren?: () => Promise<CascaderOption[]>  // 异步加载子节点
}

interface CascaderFieldProps {
  modelValue?: any[]
  options?: CascaderOption[]
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  filterable?: boolean               // 可搜索
  changeOnSelect?: boolean           // 选择任意级别即改变
  separator?: string                 // 显示分隔符，默认 ' / '
  expandTrigger?: 'click' | 'hover'  // 展开触发方式
}
```

#### 使用示例

```vue
<template>
  <!-- 基础级联选择（省市区） -->
  <CascaderField
    v-model="region"
    :options="regionOptions"
    placeholder="请选择省/市/区"
  />

  <!-- 可搜索 -->
  <CascaderField
    v-model="category"
    :options="categoryOptions"
    filterable
    placeholder="搜索分类"
  />

  <!-- 选择任意级别 -->
  <CascaderField
    v-model="flexibleCategory"
    :options="categoryOptions"
    changeOnSelect
  />

  <!-- 异步加载子节点 -->
  <CascaderField
    v-model="asyncRegion"
    :options="asyncRegionOptions"
  />

  <!-- 悬停展开 -->
  <CascaderField
    v-model="hoverRegion"
    :options="regionOptions"
    expandTrigger="hover"
  />
</template>

<script setup>
import { ref } from 'vue'
import { CascaderField } from '@ldesign/form/vue/fields'

const region = ref([])
const regionOptions = [
  {
    label: '北京市',
    value: 'beijing',
    children: [
      {
        label: '东城区',
        value: 'dongcheng',
        children: [
          { label: '王府井', value: 'wangfujing' }
        ]
      },
      { label: '西城区', value: 'xicheng' }
    ]
  },
  {
    label: '上海市',
    value: 'shanghai',
    children: [
      { label: '黄浦区', value: 'huangpu' },
      { label: '徐汇区', value: 'xuhui' }
    ]
  }
]

const category = ref([])
const categoryOptions = [
  {
    label: '电子产品',
    value: 'electronics',
    children: [
      {
        label: '手机',
        value: 'phone',
        children: [
          { label: 'iPhone', value: 'iphone' },
          { label: 'Android', value: 'android' }
        ]
      }
    ]
  }
]

const asyncRegion = ref([])
const asyncRegionOptions = [
  {
    label: '广东省',
    value: 'guangdong',
    loadChildren: async () => {
      // 模拟异步加载
      await new Promise(resolve => setTimeout(resolve, 1000))
      return [
        { label: '广州市', value: 'guangzhou' },
        { label: '深圳市', value: 'shenzhen' }
      ]
    }
  }
]
</script>
```

---

### UploadField - 文件上传

文件上传组件，支持拖拽上传、图片预览和进度显示。

#### 配置选项

```typescript
interface UploadFile {
  uid: string
  name: string
  status: 'ready' | 'uploading' | 'success' | 'error'
  percent: number
  url?: string
  raw?: File
}

interface UploadFieldProps {
  modelValue?: UploadFile[]
  accept?: string                    // 接受的文件类型
  multiple?: boolean                 // 多文件上传
  disabled?: boolean
  drag?: boolean                     // 拖拽上传
  maxCount?: number                  // 最大文件数量
  maxSize?: number                   // 单个文件最大大小（字节）
  listType?: 'text' | 'picture' | 'picture-card'  // 列表类型
  buttonText?: string                // 按钮文字
  tip?: string                       // 提示文字
  customUpload?: (file: File) => Promise<{ url: string }>  // 自定义上传函数
  beforeUpload?: (file: File) => boolean | Promise<boolean>  // 上传前钩子
}
```

#### 使用示例

```vue
<template>
  <!-- 基础文件上传 -->
  <UploadField
    v-model="files"
    accept=".pdf,.doc,.docx"
    buttonText="选择文件"
  />

  <!-- 图片上传 -->
  <UploadField
    v-model="images"
    accept="image/*"
    listType="picture"
    :maxCount="9"
    :maxSize="5 * 1024 * 1024"
    tip="支持 JPG、PNG，单张图片不超过 5MB"
  />

  <!-- 图片卡片式上传 -->
  <UploadField
    v-model="avatars"
    accept="image/*"
    listType="picture-card"
    :maxCount="1"
  />

  <!-- 拖拽上传 -->
  <UploadField
    v-model="documents"
    multiple
    drag
    buttonText="点击或拖拽文件到此处上传"
  />

  <!-- 自定义上传逻辑 -->
  <UploadField
    v-model="customFiles"
    :customUpload="uploadToServer"
    :beforeUpload="validateFile"
  />
</template>

<script setup>
import { ref } from 'vue'
import { UploadField } from '@ldesign/form/vue/fields'

const files = ref([])
const images = ref([])
const avatars = ref([])
const documents = ref([])
const customFiles = ref([])

// 自定义上传函数
const uploadToServer = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  })
  
  const data = await response.json()
  return { url: data.url }
}

// 上传前验证
const validateFile = (file) => {
  // 检查文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    alert('只支持 JPG、PNG、GIF 格式')
    return false
  }
  
  // 检查文件大小
  if (file.size > 2 * 1024 * 1024) {
    alert('文件大小不能超过 2MB')
    return false
  }
  
  return true
}
</script>
```

#### 事件

- `update:modelValue` - 文件列表变化时触发
- `change` - 文件上传状态改变时触发
- `exceed` - 超出最大文件数量时触发
- `error` - 上传失败时触发

---

## 高级字段

### SwitchField - 开关

开关组件，支持加载状态和自定义文案。

#### 配置选项

```typescript
interface SwitchFieldProps {
  modelValue?: boolean
  disabled?: boolean
  loading?: boolean             // 加载状态
  checkedChildren?: string      // 选中时文案
  uncheckedChildren?: string    // 未选中时文案
  checkedValue?: any            // 选中时的值
  uncheckedValue?: any          // 未选中时的值
  size?: 'small' | 'default'    // 尺寸
}
```

#### 使用示例

```vue
<template>
  <!-- 基础开关 -->
  <SwitchField v-model="enabled" />

  <!-- 带文案 -->
  <SwitchField
    v-model="autoSave"
    checkedChildren="开启"
    uncheckedChildren="关闭"
  />

  <!-- 加载状态 -->
  <SwitchField
    v-model="status"
    :loading="saving"
    @change="handleStatusChange"
  />

  <!-- 自定义值 -->
  <SwitchField
    v-model="theme"
    checkedValue="dark"
    uncheckedValue="light"
  />

  <!-- 小尺寸 -->
  <SwitchField
    v-model="compact"
    size="small"
  />
</template>

<script setup>
import { ref } from 'vue'
import { SwitchField } from '@ldesign/form/vue/fields'

const enabled = ref(false)
const autoSave = ref(true)

const status = ref(false)
const saving = ref(false)
const handleStatusChange = async (value) => {
  saving.value = true
  // 模拟API调用
  await new Promise(resolve => setTimeout(resolve, 1000))
  saving.value = false
}

const theme = ref('light')
const compact = ref(false)
</script>
```

---

### SliderField - 滑块

滑块组件，支持单值、范围、刻度标记和输入框联动。

#### 配置选项

```typescript
interface SliderFieldProps {
  modelValue?: number | [number, number]
  min?: number                  // 最小值
  max?: number                  // 最大值
  step?: number                 // 步长
  disabled?: boolean
  range?: boolean               // 范围模式
  marks?: Record<number, string> // 刻度标记
  showTooltip?: boolean         // 显示提示
  formatTooltip?: (value: number) => string  // 格式化提示
  withInput?: boolean           // 显示输入框
}
```

#### 使用示例

```vue
<template>
  <!-- 基础滑块 -->
  <SliderField
    v-model="volume"
    :min="0"
    :max="100"
  />

  <!-- 带刻度标记 -->
  <SliderField
    v-model="quality"
    :min="0"
    :max="100"
    :step="25"
    :marks="qualityMarks"
  />

  <!-- 范围选择 -->
  <SliderField
    v-model="priceRange"
    :min="0"
    :max="10000"
    :step="100"
    range
  />

  <!-- 带输入框 -->
  <SliderField
    v-model="age"
    :min="18"
    :max="120"
    withInput
  />

  <!-- 自定义格式 -->
  <SliderField
    v-model="temperature"
    :min="-20"
    :max="40"
    :formatTooltip="(v) => `${v}°C`"
  />
</template>

<script setup>
import { ref } from 'vue'
import { SliderField } from '@ldesign/form/vue/fields'

const volume = ref(50)

const quality = ref(50)
const qualityMarks = {
  0: '低',
  25: '中低',
  50: '中',
  75: '中高',
  100: '高'
}

const priceRange = ref([1000, 5000])
const age = ref(25)
const temperature = ref(20)
</script>
```

---

## 自定义字段

你可以通过 `FieldConfig.component` 和 `props` 来集成任何自定义组件。

### 示例：集成自定义组件

```typescript
import { createForm } from '@ldesign/form'
import MyCustomComponent from './MyCustomComponent.vue'

const form = createForm({
  initialValues: {
    customField: ''
  },
  fields: [
    {
      name: 'customField',
      label: '自定义字段',
      component: MyCustomComponent,
      props: {
        // 传递给自定义组件的属性
        placeholder: '请输入',
        maxLength: 100,
        // 其他自定义属性
        customProp: 'value'
      }
    }
  ]
})
```

### 自定义组件要求

自定义组件需要：

1. 接收 `modelValue` prop
2. 发出 `update:modelValue` 事件
3. （可选）发出 `blur` 和 `focus` 事件以支持验证时机

```vue
<template>
  <div class="my-custom-field">
    <input
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      @blur="$emit('blur', $event)"
      @focus="$emit('focus', $event)"
      v-bind="$attrs"
    />
  </div>
</template>

<script setup>
defineProps(['modelValue'])
defineEmits(['update:modelValue', 'blur', 'focus'])
</script>
```

---

## 最佳实践

### 1. 字段验证

所有字段都支持通过 `rules` 配置验证规则：

```typescript
{
  name: 'email',
  label: '邮箱',
  component: InputField,
  rules: [
    { validator: required, message: '请输入邮箱' },
    { validator: email, message: '请输入有效的邮箱地址' }
  ]
}
```

### 2. 字段联动

使用 `visible` 和 `dependencies` 实现字段间的联动：

```typescript
{
  name: 'otherCity',
  label: '其他城市',
  visible: (values) => values.city === 'other',
  dependencies: ['city']
}
```

### 3. 动态选项加载

使用 `loadOptions` 实现异步加载选项：

```typescript
{
  name: 'category',
  component: SelectField,
  loadOptions: async () => {
    const response = await fetch('/api/categories')
    return response.json()
  }
}
```

### 4. 性能优化

对于大数据量的选择组件，启用虚拟滚动：

```typescript
{
  name: 'city',
  component: SelectField,
  props: {
    virtualScroll: true,
    maxHeight: 300
  }
}
```

---

## 相关文档

- [验证规则](./validation-rules.md)
- [高级功能](./advanced-features.md)
- [真实场景示例](./real-world-examples.md)
- [API 参考](../README.md)



