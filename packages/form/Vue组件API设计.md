# Vue表单布局系统API设计

## 核心理念

基于CSS Grid实现精确的表单布局，确保每列的标题和组件完美对齐，提供灵活的标题位置选择（左侧或上方），支持响应式和展开收起功能，内置完整的表单校验、双向绑定、状态管理能力。

## 设计目标

1. **多种使用方式**: 支持options配置、Hook模式、组件模式三种使用方式
2. **完整的表单生态**: 内置校验、双向绑定、状态管理、错误处理
3. **Vue最佳实践**: 完全符合Vue3 Composition API和响应式系统
4. **TypeScript友好**: 完整的类型推导和智能提示
5. **可扩展架构**: 支持自定义组件、校验器、主题等

## 三种使用方式

### 1. Options 配置模式
通过配置对象快速生成表单，适用于简单的搜索表单和标准化表单。

### 2. Hook 模式
使用 Composition API 和 Hook 进行细粒度控制，适用于复杂的业务逻辑和自定义需求。

### 3. 组件模式
使用 FormLayout + FormItem 组件进行声明式开发，适用于布局复杂和高度自定义的表单。

## 组件架构

### 核心组件层次
```
FormLayout (容器组件)
├── FormItem (表单项组件)
│   ├── FormLabel (标题组件)
│   └── FormControl (控件插槽)
└── FormButtons (按钮组组件)

支持组件：
├── FormInput (输入框)
├── FormSelect (下拉选择)
├── FormCheckbox (复选框)
├── FormRadio (单选框)
├── FormDatePicker (日期选择)
└── FormTextarea (文本区域)
```

### 核心功能模块
```
核心功能
├── 布局引擎 (Grid Layout Engine)
├── 数据管理 (Data Management)
│   ├── 双向绑定 (v-model)
│   ├── 数据同步 (Data Sync)
│   └── 数据校验 (Validation)
├── 状态管理 (State Management)
│   ├── 表单状态 (Form State)
│   ├── 布局状态 (Layout State)
│   └── 校验状态 (Validation State)
└── 事件系统 (Event System)
    ├── 表单事件 (Form Events)
    ├── 布局事件 (Layout Events)
    └── 校验事件 (Validation Events)
```

## 三种使用方式详解

### 方式一：Options 配置模式

通过一个配置对象快速生成表单，内置校验、双向绑定等功能。

```vue
<template>
  <div class="search-form">
    <FormLayout :options="formOptions" v-model="formData" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { FormLayout } from '@ldesign/form-layout/vue';

const formData = ref({
  username: '',
  email: '',
  status: '',
  department: ''
});

const formOptions = {
  columns: 4,
  defaultRows: 2,
  labelPosition: 'left',
  labelWidth: '80px',
  fields: [
    {
      name: 'username',
      label: '用户名',
      type: 'input',
      placeholder: '请输入用户名',
      rules: [{ required: true, message: '用户名不能为空' }]
    },
    {
      name: 'email',
      label: '邮箱',
      type: 'input',
      placeholder: '请输入邮箱',
      rules: [{ type: 'email', message: '请输入正确的邮箱格式' }]
    },
    {
      name: 'status',
      label: '状态',
      type: 'select',
      options: [
        { label: '全部', value: '' },
        { label: '启用', value: 'active' },
        { label: '禁用', value: 'inactive' }
      ]
    },
    {
      name: 'department',
      label: '部门',
      type: 'select',
      options: [
        { label: '请选择部门', value: '' },
        { label: '技术部', value: 'tech' },
        { label: '销售部', value: 'sales' }
      ]
    }
  ],
  buttons: {
    showExpand: true,
    showReset: true,
    showSubmit: true,
    submitText: '查询',
    resetText: '重置'
  },
  onSubmit: (data) => {
    console.log('提交数据:', data);
  },
  onReset: () => {
    console.log('重置表单');
  }
};
</script>
```

### 方式二：Hook 模式

使用 `useFormLayout` Hook 进行细粒度控制，适合复杂的业务逻辑。

```vue
<template>
  <div class="user-form">
    <!-- 表单展示区域 -->
    <div class="form-container" ref="formContainer">
      <!-- 表单项会通过 Hook 动态渲染 -->
    </div>
    
    <!-- 按钮组 -->
    <div class="form-actions">
      <button @click="toggle">
        {{ isExpanded ? '收起' : '展开' }}
      </button>
      <button @click="reset">重置</button>
      <button @click="handleSubmit" type="primary">提交</button>
    </div>
    
    <!-- 校验错误信息 -->
    <div v-if="hasErrors" class="validation-errors">
      <div v-for="(error, field) in errors" :key="field">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useFormLayout } from '@ldesign/form-layout/vue';

const formContainer = ref();

const {
  // 数据相关
  formData,
  setFieldValue,
  getFieldValue,
  
  // 状态相关
  isExpanded,
  isAnimating,
  isValidating,
  errors,
  hasErrors,
  
  // 方法相关
  expand,
  collapse,
  toggle,
  reset,
  submit,
  validate,
  validateField,
  clearValidation,
  
  // 布局相关
  layoutInfo,
  updateLayout,
  
  // 配置相关
  updateConfig,
  getConfig
} = useFormLayout({
  container: formContainer,
  columns: 3,
  defaultRows: 2,
  labelPosition: 'left',
  labelWidth: '100px',
  
  // 初始数据
  initialData: {
    username: '',
    email: '',
    phone: '',
    address: ''
  },
  
  // 表单项配置
  fields: [
    {
      name: 'username',
      label: '用户名',
      type: 'input',
      required: true,
      rules: [
        { required: true, message: '用户名不能为空' },
        { min: 2, max: 20, message: '用户名长度在2-20个字符' }
      ]
    },
    {
      name: 'email',
      label: '邮箱',
      type: 'input',
      required: true,
      rules: [
        { required: true, message: '邮箱不能为空' },
        { type: 'email', message: '请输入正确的邮箱格式' }
      ]
    },
    {
      name: 'phone',
      label: '手机号',
      type: 'input',
      rules: [{
        pattern: /^1[3-9]\d{9}$/,
        message: '请输入正确的手机号'
      }]
    },
    {
      name: 'address',
      label: '地址',
      type: 'textarea',
      span: 3,
      rows: 3
    }
  ],
  
  // 事件处理
  onSubmit: async (data) => {
    console.log('表单提交:', data);
    // 处理提交逻辑
  },
  
  onValidationError: (errors) => {
    console.log('校验错误:', errors);
  }
});

// 自定义提交处理
const handleSubmit = async () => {
  const isValid = await validate();
  if (isValid) {
    await submit();
  } else {
    console.log('表单校验失败');
  }
};

// 监听数据变化
watch(formData, (newData, oldData) => {
  console.log('表单数据变化:', { newData, oldData });
}, { deep: true });

// 监听布局变化
watch(layoutInfo, (info) => {
  console.log('布局信息更新:', info);
});

onMounted(() => {
  // 初始化后的额外操作
  updateLayout();
});
</script>
```

### 方式三：组件模式

使用 FormLayout + FormItem 组件进行声明式开发，最灵活和可控。

```vue
<template>
  <FormLayout
    v-model="formData"
    :columns="4"
    :default-rows="2"
    label-position="left"
    label-width="100px"
    label-align="right"
    :rules="formRules"
    @submit="handleSubmit"
    @reset="handleReset"
    @validation-error="handleValidationError"
  >
    <!-- 基础信息 -->
    <FormItem 
      label="用户名" 
      name="username"
      :required="true"
      :rules="usernameRules"
    >
      <FormInput 
        v-model="formData.username" 
        placeholder="请输入用户名"
        @blur="validateField('username')"
      />
    </FormItem>
    
    <FormItem 
      label="邮箱" 
      name="email"
      :required="true"
    >
      <FormInput 
        v-model="formData.email" 
        type="email"
        placeholder="请输入邮箱"
      />
    </FormItem>
    
    <FormItem label="手机号" name="phone">
      <FormInput 
        v-model="formData.phone" 
        placeholder="请输入手机号"
      />
    </FormItem>
    
    <FormItem label="状态" name="status">
      <FormSelect 
        v-model="formData.status" 
        :options="statusOptions"
        placeholder="请选择状态"
      />
    </FormItem>
    
    <!-- 扩展信息 -->
    <FormItem label="部门" name="department">
      <FormSelect 
        v-model="formData.department" 
        :options="departmentOptions"
        placeholder="请选择部门"
        @change="handleDepartmentChange"
      />
    </FormItem>
    
    <FormItem label="角色" name="role">
      <FormSelect 
        v-model="formData.role" 
        :options="roleOptions"
        :disabled="!formData.department"
        placeholder="请选择角色"
      />
    </FormItem>
    
    <FormItem label="生日" name="birthday">
      <FormDatePicker 
        v-model="formData.birthday" 
        placeholder="请选择生日"
        format="YYYY-MM-DD"
      />
    </FormItem>
    
    <FormItem label="爱好" name="hobbies" :span="2">
      <FormCheckbox 
        v-model="formData.hobbies" 
        :options="hobbyOptions"
      />
    </FormItem>
    
    <!-- 跨多列的复杂表单项 -->
    <FormItem label="详细地址" name="address" :span="4">
      <FormTextarea 
        v-model="formData.address" 
        placeholder="请输入详细地址"
        :rows="3"
        :maxlength="200"
        show-word-limit
      />
    </FormItem>
    
    <!-- 自定义表单项 -->
    <FormItem name="customField" :span="2">
      <template #label>
        <span class="required-mark">*</span>
        <span>特殊字段</span>
        <Tooltip content="这是一个特殊的自定义字段">
          <Icon name="question-circle" />
        </Tooltip>
      </template>
      
      <!-- 自定义复杂控件 -->
      <div class="custom-control">
        <input 
          v-model="formData.customField.text" 
          placeholder="文本内容"
          class="form-control"
        />
        <select 
          v-model="formData.customField.type" 
          class="form-control"
        >
          <option value="">请选择类型</option>
          <option value="A">类型A</option>
          <option value="B">类型B</option>
        </select>
      </div>
    </FormItem>
    
    <!-- 自定义按钮组 -->
    <template #buttons>
      <button @click="saveDraft" type="button">保存草稿</button>
      <button @click="preview" type="button">预览</button>
      <button @click="expand" v-if="!isExpanded" type="button">展开</button>
      <button @click="collapse" v-else type="button">收起</button>
      <button @click="reset" type="button">重置</button>
      <button @click="submit" type="primary">提交</button>
    </template>
  </FormLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { 
  FormLayout, 
  FormItem, 
  FormInput, 
  FormSelect, 
  FormCheckbox, 
  FormDatePicker, 
  FormTextarea 
} from '@ldesign/form-layout/vue';

// 表单数据 - 支持 v-model
const formData = ref({
  username: '',
  email: '',
  phone: '',
  status: '',
  department: '',
  role: '',
  birthday: '',
  hobbies: [],
  address: '',
  customField: {
    text: '',
    type: ''
  }
});

// 选项数据
const statusOptions = [
  { label: '全部', value: '' },
  { label: '启用', value: 'active' },
  { label: '禁用', value: 'inactive' }
];

const departmentOptions = [
  { label: '请选择部门', value: '' },
  { label: '技术部', value: 'tech' },
  { label: '销售部', value: 'sales' },
  { label: '人事部', value: 'hr' }
];

// 根据部门动态生成角色选项
const roleOptions = computed(() => {
  switch (formData.value.department) {
    case 'tech':
      return [
        { label: '前端开发', value: 'frontend' },
        { label: '后端开发', value: 'backend' },
        { label: '全栈开发', value: 'fullstack' }
      ];
    case 'sales':
      return [
        { label: '销售代表', value: 'sales-rep' },
        { label: '销售经理', value: 'sales-manager' }
      ];
    case 'hr':
      return [
        { label: 'HR专员', value: 'hr-specialist' },
        { label: 'HR经理', value: 'hr-manager' }
      ];
    default:
      return [];
  }
});

const hobbyOptions = [
  { label: '读书', value: 'reading' },
  { label: '音乐', value: 'music' },
  { label: '运动', value: 'sports' },
  { label: '旅行', value: 'travel' }
];

// 校验规则
const formRules = {
  username: [
    { required: true, message: '用户名不能为空' },
    { min: 2, max: 20, message: '用户名长度在2-20个字符' }
  ],
  email: [
    { required: true, message: '邮箱不能为空' },
    { type: 'email', message: '请输入正确的邮箱格式' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
  ],
  'customField.text': [
    { required: true, message: '特殊字段不能为空' }
  ]
};

const usernameRules = [
  { required: true, message: '用户名不能为空' },
  { 
    validator: async (value) => {
      // 异步校验：检查用户名是否已存在
      const exists = await checkUsernameExists(value);
      return !exists;
    }, 
    message: '用户名已存在' 
  }
];

// 事件处理
const handleSubmit = async (data) => {
  console.log('表单提交:', data);
  // 处理提交逻辑
};

const handleReset = () => {
  console.log('重置表单');
};

const handleValidationError = (errors) => {
  console.log('校验错误:', errors);
};

const handleDepartmentChange = (value) => {
  // 部门变化时清空角色
  formData.value.role = '';
};

// 自定义方法
const saveDraft = () => {
  console.log('保存草稿:', formData.value);
};

const preview = () => {
  console.log('预览表单:', formData.value);
};

// 异步校验函数
const checkUsernameExists = async (username) => {
  // 模拟 API 调用
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(['admin', 'root', 'test'].includes(username));
    }, 1000);
  });
};

// 监听数据变化
watch(
  () => formData.value.username,
  (newValue) => {
    console.log('用户名变化:', newValue);
  }
);
</script>

<style scoped>
.custom-control {
  display: flex;
  gap: 8px;
}

.custom-control .form-control {
  flex: 1;
}

.required-mark {
  color: #ff4d4f;
  margin-right: 4px;
}
</style>
```

## API设计

### 1. FormLayout 主组件

#### Props
```typescript
interface FormLayoutProps {
  // 基础配置
  modelValue?: Record<string, any>;     // v-model绑定的表单数据
  
  // 布局配置
  columns?: number | 'auto';            // 列数，auto为自适应
  defaultRows?: number;                 // 默认显示行数
  spacing?: string | number;            // 间距
  
  // 标题配置
  labelPosition?: 'left' | 'top';       // 标题位置
  labelWidth?: string | number;         // 标题宽度（left模式）
  labelAlign?: 'left' | 'right' | 'center'; // 标题对齐
  
  // 按钮配置
  showExpand?: boolean;                 // 是否显示展开按钮
  showReset?: boolean;                  // 是否显示重置按钮
  showSubmit?: boolean;                 // 是否显示提交按钮
  expandText?: string;                  // 展开按钮文本
  collapseText?: string;                // 收起按钮文本
  resetText?: string;                   // 重置按钮文本
  submitText?: string;                  // 提交按钮文本
  
  // 功能配置
  animation?: boolean;                  // 是否启用动画
  responsive?: boolean;                 // 是否响应式
  
  // 样式配置
  size?: 'small' | 'medium' | 'large'; // 组件尺寸
  disabled?: boolean;                   // 是否禁用
}
```

#### Events
```typescript
interface FormLayoutEvents {
  // 数据相关
  'update:modelValue': (value: Record<string, any>) => void;
  'change': (value: Record<string, any>) => void;
  
  // 操作相关
  'expand': () => void;
  'collapse': () => void;
  'reset': () => void;
  'submit': (value: Record<string, any>) => void;
  
  // 布局相关
  'layout-change': (layout: LayoutInfo) => void;
}
```

#### Slots
```typescript
interface FormLayoutSlots {
  default: () => any;                   // 默认插槽，放置FormItem
  buttons?: () => any;                  // 自定义按钮插槽
}
```

#### 基础使用
```vue
<template>
  <FormLayout
    v-model="formData"
    :columns="4"
    :default-rows="2"
    label-position="left"
    label-width="100px"
    label-align="right"
    @submit="handleSubmit"
    @reset="handleReset"
  >
    <FormItem label="用户名" name="username">
      <input v-model="formData.username" placeholder="请输入用户名" />
    </FormItem>
    
    <FormItem label="邮箱" name="email">
      <input v-model="formData.email" placeholder="请输入邮箱" />
    </FormItem>
    
    <FormItem label="手机号" name="phone">
      <input v-model="formData.phone" placeholder="请输入手机号" />
    </FormItem>
    
    <FormItem label="部门" name="department">
      <select v-model="formData.department">
        <option value="">请选择</option>
        <option value="tech">技术部</option>
        <option value="sales">销售部</option>
      </select>
    </FormItem>
  </FormLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const formData = ref({
  username: '',
  email: '',
  phone: '',
  department: ''
});

const handleSubmit = (data: any) => {
  console.log('提交数据:', data);
};

const handleReset = () => {
  console.log('重置表单');
};
</script>
```

### 2. FormItem 表单项组件

#### Props
```typescript
interface FormItemProps {
  // 基础信息
  label?: string;                       // 标题文本
  name?: string;                        // 字段名称
  
  // 布局配置
  span?: number;                        // 跨列数量
  offset?: number;                      // 偏移列数
  
  // 标题配置（可覆盖全局配置）
  labelPosition?: 'left' | 'top';       // 标题位置
  labelWidth?: string | number;         // 标题宽度
  labelAlign?: 'left' | 'right' | 'center'; // 标题对齐
  
  // 验证配置
  required?: boolean;                   // 是否必填
  rules?: ValidationRule[];             // 验证规则
  error?: string;                       // 错误信息
  
  // 状态配置
  disabled?: boolean;                   // 是否禁用
  readonly?: boolean;                   // 是否只读
}
```

#### Slots
```typescript
interface FormItemSlots {
  default: () => any;                   // 控件插槽
  label?: () => any;                    // 自定义标题插槽
  error?: () => any;                    // 自定义错误信息插槽
}
```

### 3. useFormLayout Hook

#### 基础Hook
```typescript
import { useFormLayout } from '@ldesign/form-layout/vue';

export function useFormLayout(options?: FormLayoutOptions) {
  // 返回值类型
  interface UseFormLayoutReturn {
    // 状态
    formData: Ref<Record<string, any>>;
    isExpanded: Ref<boolean>;
    isAnimating: Ref<boolean>;
    
    // 方法
    expand: () => Promise<void>;
    collapse: () => Promise<void>;
    toggle: () => Promise<void>;
    reset: () => void;
    submit: () => void;
    validate: () => Promise<boolean>;
    
    // 配置
    updateConfig: (config: Partial<FormLayoutConfig>) => void;
    
    // 布局信息
    layoutInfo: Readonly<Ref<LayoutInfo>>;
  }
}
```

#### Hook使用示例
```vue
<script setup lang="ts">
import { useFormLayout } from '@ldesign/form-layout/vue';

// 使用Hook
const {
  formData,
  isExpanded,
  expand,
  collapse,
  reset,
  submit,
  validate,
  layoutInfo
} = useFormLayout({
  defaultData: {
    username: '',
    email: '',
    phone: ''
  },
  columns: 4,
  defaultRows: 2,
  labelPosition: 'left',
  labelWidth: '100px'
});

// 自定义提交逻辑
const handleSubmit = async () => {
  const isValid = await validate();
  if (isValid) {
    submit();
    console.log('表单数据:', formData.value);
  }
};

// 监听布局变化
watch(layoutInfo, (info) => {
  console.log('布局信息更新:', info);
});
</script>
```

### 4. 响应式断点配置

```typescript
interface ResponsiveConfig {
  xs: { columns: number; labelPosition?: 'left' | 'top' };    // < 576px
  sm: { columns: number; labelPosition?: 'left' | 'top' };    // 576px - 768px  
  md: { columns: number; labelPosition?: 'left' | 'top' };    // 768px - 992px
  lg: { columns: number; labelPosition?: 'left' | 'top' };    // 992px - 1200px
  xl: { columns: number; labelPosition?: 'left' | 'top' };    // > 1200px
}

// 响应式使用示例
const responsiveConfig: ResponsiveConfig = {
  xs: { columns: 1, labelPosition: 'top' },      // 手机端单列，标题在上方
  sm: { columns: 2, labelPosition: 'top' },      // 小平板双列，标题在上方  
  md: { columns: 3, labelPosition: 'left' },     // 大平板三列，标题在左侧
  lg: { columns: 4, labelPosition: 'left' },     // 笔记本四列
  xl: { columns: 6, labelPosition: 'left' }      // 桌面端六列
};
```

## 高级用法

### 1. 自定义表单项

```vue
<template>
  <FormLayout v-model="formData" :columns="3">
    <!-- 标准表单项 -->
    <FormItem label="用户名" name="username">
      <input v-model="formData.username" />
    </FormItem>
    
    <!-- 跨列表单项 -->
    <FormItem label="详细地址" name="address" :span="2">
      <textarea v-model="formData.address" rows="3"></textarea>
    </FormItem>
    
    <!-- 自定义标题 -->
    <FormItem name="custom">
      <template #label>
        <span class="required">*</span>
        <span>特殊字段</span>
        <Tooltip content="这是提示信息">
          <Icon name="info" />
        </Tooltip>
      </template>
      <input v-model="formData.custom" />
    </FormItem>
    
    <!-- 复杂控件 -->
    <FormItem label="日期范围" name="dateRange" :span="2">
      <DateRangePicker v-model="formData.dateRange" />
    </FormItem>
  </FormLayout>
</template>
```

### 2. 动态表单

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';

const formData = ref({
  type: '',
  details: {}
});

// 根据type动态生成表单项
const dynamicFields = computed(() => {
  switch (formData.value.type) {
    case 'user':
      return [
        { label: '用户名', name: 'username', type: 'input' },
        { label: '邮箱', name: 'email', type: 'input' },
        { label: '角色', name: 'role', type: 'select', options: ['admin', 'user'] }
      ];
    case 'product':
      return [
        { label: '产品名', name: 'name', type: 'input' },
        { label: '价格', name: 'price', type: 'number' },
        { label: '分类', name: 'category', type: 'select', options: ['A', 'B', 'C'] }
      ];
    default:
      return [];
  }
});
</script>

<template>
  <FormLayout v-model="formData" :columns="3">
    <FormItem label="类型" name="type">
      <select v-model="formData.type">
        <option value="">请选择</option>
        <option value="user">用户</option>
        <option value="product">产品</option>
      </select>
    </FormItem>
    
    <!-- 动态生成的表单项 -->
    <FormItem
      v-for="field in dynamicFields"
      :key="field.name"
      :label="field.label"
      :name="field.name"
    >
      <component
        :is="getFieldComponent(field.type)"
        v-model="formData.details[field.name]"
        v-bind="getFieldProps(field)"
      />
    </FormItem>
  </FormLayout>
</template>
```

### 3. 表单验证集成

```vue
<script setup lang="ts">
import { useFormLayout } from '@ldesign/form-layout/vue';

const {
  formData,
  validate,
  reset,
  submit
} = useFormLayout({
  defaultData: {
    username: '',
    email: '',
    phone: ''
  },
  rules: {
    username: [
      { required: true, message: '用户名不能为空' },
      { min: 3, max: 20, message: '用户名长度在3-20个字符' }
    ],
    email: [
      { required: true, message: '邮箱不能为空' },
      { type: 'email', message: '请输入正确的邮箱格式' }
    ],
    phone: [
      { required: true, message: '手机号不能为空' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
    ]
  }
});

const handleSubmit = async () => {
  const isValid = await validate();
  if (isValid) {
    // 提交逻辑
    console.log('提交数据:', formData.value);
  } else {
    console.log('验证失败');
  }
};
</script>

<template>
  <FormLayout 
    v-model="formData"
    :columns="2"
    @submit="handleSubmit"
  >
    <FormItem 
      label="用户名" 
      name="username"
      :rules="[{required: true, message: '用户名不能为空'}]"
    >
      <input v-model="formData.username" />
    </FormItem>
    
    <FormItem 
      label="邮箱" 
      name="email"
      :rules="[
        {required: true, message: '邮箱不能为空'},
        {type: 'email', message: '请输入正确的邮箱格式'}
      ]"
    >
      <input v-model="formData.email" />
    </FormItem>
  </FormLayout>
</template>
```

## CSS Grid布局实现

### 核心CSS结构

```css
/* 表单布局容器 */
.form-layout {
  display: grid;
  gap: var(--form-spacing, 16px);
}

/* 左侧标题模式 - 双列Grid：标题列 + 内容列 */
.form-layout--label-left {
  grid-template-columns: repeat(var(--form-columns), var(--label-width, 100px) 1fr);
}

/* 上方标题模式 - 单列Grid */
.form-layout--label-top {
  grid-template-columns: repeat(var(--form-columns), 1fr);
}

/* 表单项 */
.form-item {
  display: contents; /* 让子元素直接参与到grid布局中 */
}

/* 左侧标题模式的表单项 */
.form-layout--label-left .form-item {
  display: contents;
}

.form-layout--label-left .form-item-label {
  display: flex;
  align-items: center;
  justify-content: var(--label-align, flex-end);
  padding-right: 8px;
}

.form-layout--label-left .form-item-control {
  display: flex;
  align-items: center;
}

/* 上方标题模式的表单项 */
.form-layout--label-top .form-item {
  display: flex;
  flex-direction: column;
}

.form-layout--label-top .form-item-label {
  margin-bottom: 4px;
}

/* 跨列支持 */
.form-item--span-2 {
  grid-column: span 2;
}

.form-item--span-3 {
  grid-column: span 3;
}

/* 按钮组 */
.form-buttons {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}
```

## TypeScript类型定义

```typescript
// 表单数据类型
export interface FormData {
  [key: string]: any;
}

// 验证规则
export interface ValidationRule {
  required?: boolean;
  type?: 'string' | 'number' | 'email' | 'url' | 'date';
  min?: number;
  max?: number;
  pattern?: RegExp;
  validator?: (value: any) => boolean | Promise<boolean>;
  message?: string;
}

// 布局信息
export interface LayoutInfo {
  columns: number;
  rows: number;
  visibleRows: number;
  totalItems: number;
  visibleItems: number;
  isExpanded: boolean;
}

// 表单项配置
export interface FormItemConfig {
  label: string;
  name: string;
  type?: string;
  span?: number;
  offset?: number;
  required?: boolean;
  rules?: ValidationRule[];
  disabled?: boolean;
  readonly?: boolean;
  [key: string]: any;
}

// Hook选项
export interface FormLayoutOptions {
  defaultData?: FormData;
  columns?: number | 'auto';
  defaultRows?: number;
  labelPosition?: 'left' | 'top';
  labelWidth?: string | number;
  labelAlign?: 'left' | 'right' | 'center';
  rules?: Record<string, ValidationRule[]>;
  animation?: boolean;
  responsive?: ResponsiveConfig;
  [key: string]: any;
}
```

## 完整示例

```vue
<template>
  <div class="demo-container">
    <h3>用户搜索表单</h3>
    
    <FormLayout
      v-model="searchForm"
      :columns="4"
      :default-rows="2"
      label-position="left"
      label-width="80px"
      label-align="right"
      :responsive="responsiveConfig"
      @submit="handleSearch"
      @reset="handleReset"
      @expand="onExpand"
      @collapse="onCollapse"
    >
      <!-- 基础信息 -->
      <FormItem label="用户名" name="username">
        <input 
          v-model="searchForm.username" 
          placeholder="请输入用户名"
          class="form-control"
        />
      </FormItem>
      
      <FormItem label="邮箱" name="email">
        <input 
          v-model="searchForm.email" 
          type="email"
          placeholder="请输入邮箱"
          class="form-control"
        />
      </FormItem>
      
      <FormItem label="手机号" name="phone">
        <input 
          v-model="searchForm.phone" 
          placeholder="请输入手机号"
          class="form-control"
        />
      </FormItem>
      
      <FormItem label="状态" name="status">
        <select v-model="searchForm.status" class="form-control">
          <option value="">全部</option>
          <option value="active">启用</option>
          <option value="inactive">禁用</option>
        </select>
      </FormItem>
      
      <!-- 扩展信息 -->
      <FormItem label="部门" name="department">
        <select v-model="searchForm.department" class="form-control">
          <option value="">请选择部门</option>
          <option value="tech">技术部</option>
          <option value="sales">销售部</option>
          <option value="hr">人事部</option>
        </select>
      </FormItem>
      
      <FormItem label="角色" name="role">
        <select v-model="searchForm.role" class="form-control">
          <option value="">请选择角色</option>
          <option value="admin">管理员</option>
          <option value="user">普通用户</option>
        </select>
      </FormItem>
      
      <FormItem label="创建时间" name="createTime" :span="2">
        <div class="date-range">
          <input 
            v-model="searchForm.startDate" 
            type="date" 
            class="form-control"
          />
          <span class="separator">至</span>
          <input 
            v-model="searchForm.endDate" 
            type="date" 
            class="form-control"
          />
        </div>
      </FormItem>
      
      <FormItem label="备注" name="remark" :span="4">
        <textarea 
          v-model="searchForm.remark" 
          placeholder="请输入备注"
          class="form-control"
          rows="2"
        ></textarea>
      </FormItem>
    </FormLayout>
    
    <!-- 搜索结果 -->
    <div v-if="searchResult" class="search-result">
      <h4>搜索结果</h4>
      <pre>{{ searchResult }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { FormLayout, FormItem } from '@ldesign/form-layout/vue';

// 表单数据
const searchForm = ref({
  username: '',
  email: '',
  phone: '',
  status: '',
  department: '',
  role: '',
  startDate: '',
  endDate: '',
  remark: ''
});

// 搜索结果
const searchResult = ref<any>(null);

// 响应式配置
const responsiveConfig = {
  xs: { columns: 1, labelPosition: 'top' },
  sm: { columns: 2, labelPosition: 'top' },
  md: { columns: 3, labelPosition: 'left' },
  lg: { columns: 4, labelPosition: 'left' },
  xl: { columns: 4, labelPosition: 'left' }
};

// 事件处理
const handleSearch = (data: any) => {
  console.log('搜索数据:', data);
  searchResult.value = data;
};

const handleReset = () => {
  console.log('重置表单');
  searchResult.value = null;
};

const onExpand = () => {
  console.log('展开表单');
};

const onCollapse = () => {
  console.log('收起表单');
};
</script>

<style scoped>
.demo-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.form-control {
  width: 100%;
  height: 32px;
  padding: 4px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
}

.form-control:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.date-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.separator {
  flex-shrink: 0;
  color: #666;
}

.search-result {
  margin-top: 24px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 4px;
}
</style>
```

这个API设计重点关注了：

1. **Grid布局精确对齐**: 使用CSS Grid确保每列标题和组件完美对齐
2. **灵活的标题位置**: 支持左侧和上方两种标题位置
3. **Vue友好的API**: 符合Vue使用习惯的Props、Events、Slots设计
4. **强大的Hook系统**: 提供状态管理和逻辑复用
5. **完整的类型支持**: 全面的TypeScript类型定义
6. **响应式设计**: 支持不同屏幕尺寸下的布局调整
