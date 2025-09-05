# TSX 组件使用指南

## 概述

@ldesign/form 包含了使用 TSX 编写的 Vue 3 组件，这些组件提供了更好的类型安全性和开发体验。

## 组件列表

### LDesignButton

功能丰富的按钮组件，支持多种类型、尺寸和状态。

#### 基础用法

```tsx
import { LDesignButton } from '@ldesign/form'

// 基础按钮
<LDesignButton type="primary">
  点击我
</LDesignButton>

// 带图标的按钮
<LDesignButton type="success" icon="check">
  确认
</LDesignButton>

// 加载状态按钮
<LDesignButton loading={true}>
  加载中...
</LDesignButton>
```

#### 属性说明

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| type | `'primary' \| 'secondary' \| 'success' \| 'warning' \| 'error' \| 'info'` | `'primary'` | 按钮类型 |
| size | `'small' \| 'medium' \| 'large'` | `'medium'` | 按钮尺寸 |
| disabled | `boolean` | `false` | 是否禁用 |
| loading | `boolean` | `false` | 是否加载中 |
| block | `boolean` | `false` | 是否为块级按钮 |
| shape | `'default' \| 'round' \| 'circle'` | `'default'` | 按钮形状 |
| icon | `string` | - | 图标名称 |
| htmlType | `'button' \| 'submit' \| 'reset'` | `'button'` | HTML 按钮类型 |

#### 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| click | `(event: MouseEvent) => void` | 点击事件 |

#### 完整示例

```tsx
import { defineComponent, ref } from 'vue'
import { LDesignButton } from '@ldesign/form'

export default defineComponent({
  setup() {
    const loading = ref(false)
    
    const handleSubmit = async () => {
      loading.value = true
      try {
        // 模拟异步操作
        await new Promise(resolve => setTimeout(resolve, 2000))
        console.log('提交成功')
      } finally {
        loading.value = false
      }
    }
    
    return () => (
      <div class="button-demo">
        {/* 不同类型的按钮 */}
        <div class="button-group">
          <LDesignButton type="primary">Primary</LDesignButton>
          <LDesignButton type="secondary">Secondary</LDesignButton>
          <LDesignButton type="success">Success</LDesignButton>
          <LDesignButton type="warning">Warning</LDesignButton>
          <LDesignButton type="error">Error</LDesignButton>
          <LDesignButton type="info">Info</LDesignButton>
        </div>
        
        {/* 不同尺寸的按钮 */}
        <div class="button-group">
          <LDesignButton size="small">Small</LDesignButton>
          <LDesignButton size="medium">Medium</LDesignButton>
          <LDesignButton size="large">Large</LDesignButton>
        </div>
        
        {/* 特殊状态的按钮 */}
        <div class="button-group">
          <LDesignButton disabled>Disabled</LDesignButton>
          <LDesignButton loading={loading.value} onClick={handleSubmit}>
            {loading.value ? '提交中...' : '提交'}
          </LDesignButton>
          <LDesignButton block>Block Button</LDesignButton>
        </div>
        
        {/* 不同形状的按钮 */}
        <div class="button-group">
          <LDesignButton shape="default">Default</LDesignButton>
          <LDesignButton shape="round">Round</LDesignButton>
          <LDesignButton shape="circle" icon="plus"></LDesignButton>
        </div>
      </div>
    )
  }
})
```

### LDesignInput

功能完整的输入框组件，支持多种输入类型和交互功能。

#### 基础用法

```tsx
import { LDesignInput } from '@ldesign/form'

// 基础输入框
<LDesignInput
  v-model={inputValue}
  placeholder="请输入内容"
/>

// 密码输入框
<LDesignInput
  v-model={password}
  type="password"
  showPassword={true}
  placeholder="请输入密码"
/>

// 可清除的输入框
<LDesignInput
  v-model={searchValue}
  clearable={true}
  placeholder="搜索..."
/>
```

#### 属性说明

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| modelValue | `string \| number` | `''` | 输入框值 |
| type | `'text' \| 'password' \| 'email' \| 'number' \| 'tel' \| 'url' \| 'search'` | `'text'` | 输入框类型 |
| size | `'small' \| 'medium' \| 'large'` | `'medium'` | 输入框尺寸 |
| status | `'default' \| 'success' \| 'warning' \| 'error'` | `'default'` | 输入框状态 |
| placeholder | `string` | - | 占位符文本 |
| disabled | `boolean` | `false` | 是否禁用 |
| readonly | `boolean` | `false` | 是否只读 |
| clearable | `boolean` | `false` | 是否显示清除按钮 |
| showPassword | `boolean` | `false` | 是否显示密码切换按钮 |
| maxlength | `number` | - | 最大长度 |
| showCount | `boolean` | `false` | 是否显示字数统计 |
| prefixIcon | `string` | - | 前缀图标 |
| suffixIcon | `string` | - | 后缀图标 |
| autofocus | `boolean` | `false` | 自动聚焦 |

#### 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| update:modelValue | `(value: string \| number) => void` | 值更新事件 |
| input | `(event: Event) => void` | 输入事件 |
| change | `(event: Event) => void` | 变化事件 |
| focus | `(event: FocusEvent) => void` | 聚焦事件 |
| blur | `(event: FocusEvent) => void` | 失焦事件 |
| clear | `() => void` | 清除事件 |
| keydown | `(event: KeyboardEvent) => void` | 按键事件 |

#### 完整示例

```tsx
import { defineComponent, ref } from 'vue'
import { LDesignInput } from '@ldesign/form'

export default defineComponent({
  setup() {
    const formData = ref({
      username: '',
      password: '',
      email: '',
      phone: '',
      description: ''
    })
    
    const handleSubmit = () => {
      console.log('表单数据:', formData.value)
    }
    
    return () => (
      <div class="input-demo">
        <div class="form-item">
          <label>用户名：</label>
          <LDesignInput
            v-model={formData.value.username}
            placeholder="请输入用户名"
            prefixIcon="user"
            clearable
          />
        </div>
        
        <div class="form-item">
          <label>密码：</label>
          <LDesignInput
            v-model={formData.value.password}
            type="password"
            placeholder="请输入密码"
            showPassword
            maxlength={20}
            showCount
          />
        </div>
        
        <div class="form-item">
          <label>邮箱：</label>
          <LDesignInput
            v-model={formData.value.email}
            type="email"
            placeholder="请输入邮箱地址"
            suffixIcon="mail"
            status={formData.value.email && !isValidEmail(formData.value.email) ? 'error' : 'default'}
          />
        </div>
        
        <div class="form-item">
          <label>手机号：</label>
          <LDesignInput
            v-model={formData.value.phone}
            type="tel"
            placeholder="请输入手机号"
            maxlength={11}
            showCount
          />
        </div>
        
        <div class="form-item">
          <label>描述：</label>
          <LDesignInput
            v-model={formData.value.description}
            placeholder="请输入描述信息"
            maxlength={100}
            showCount
          />
        </div>
        
        <div class="form-actions">
          <LDesignButton type="primary" onClick={handleSubmit}>
            提交
          </LDesignButton>
        </div>
      </div>
    )
  }
})

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
```

## 样式定制

TSX 组件使用 LDESIGN Design System 的颜色变量，你可以通过覆盖 CSS 变量来定制样式：

```css
:root {
  /* 自定义主色调 */
  --ldesign-brand-color: #1890ff;
  --ldesign-brand-color-hover: #40a9ff;
  --ldesign-brand-color-active: #096dd9;
  
  /* 自定义尺寸 */
  --ls-button-height-medium: 40px;
  --ls-input-height-medium: 40px;
  
  /* 自定义圆角 */
  --ls-border-radius-base: 6px;
}
```

## 类型支持

所有 TSX 组件都提供了完整的 TypeScript 类型定义，包括：

- 组件属性类型
- 事件回调类型
- 插槽类型
- 样式类型

```tsx
import type { 
  ButtonProps, 
  ButtonEmits, 
  InputProps, 
  InputEmits 
} from '@ldesign/form'

// 类型安全的组件使用
const buttonProps: ButtonProps = {
  type: 'primary',
  size: 'medium',
  disabled: false
}

const handleClick: ButtonEmits['click'] = (event) => {
  console.log('Button clicked:', event)
}
```

## 测试

TSX 组件包含了完整的单元测试，确保功能的正确性和稳定性。你可以参考测试文件来了解组件的详细用法：

- `__tests__/tsx/LDesignButton.test.tsx`
- `__tests__/tsx/LDesignInput.test.tsx`

## 注意事项

1. TSX 组件需要 Vue 3 和 TypeScript 支持
2. 确保项目中已正确配置 JSX/TSX 编译
3. 样式文件会自动导入，无需手动引入
4. 组件遵循 Vue 3 Composition API 规范
