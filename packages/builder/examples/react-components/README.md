# React 组件库示例

这是一个使用 @ldesign/builder 构建的 React 组件库示例，展示了如何构建现代化的 React 组件库。

## 📁 项目结构

```
react-components/
├── src/
│   ├── components/
│   │   ├── Button.tsx       # 按钮组件
│   │   ├── Button.css       # 按钮样式
│   │   ├── Input.tsx        # 输入框组件
│   │   └── Input.css        # 输入框样式
│   └── index.ts             # 主入口文件
├── ldesign.config.ts        # 构建配置
├── package.json             # 项目配置
├── tsconfig.json            # TypeScript 配置
└── README.md               # 项目说明
```

## 🚀 特性展示

### 1. React 组件
- **Button 组件**: 支持多种变体、尺寸和状态
- **Input 组件**: 完整的输入框功能，包括验证、清空、密码显示

### 2. TypeScript 集成
- 完整的 Props 接口定义
- forwardRef 引用转发支持
- 自动生成类型声明文件

### 3. 现代 React 特性
- 函数组件 + Hooks
- forwardRef 引用转发
- 受控和非受控组件支持

### 4. 样式处理
- CSS 模块化
- 自动提取样式到独立文件
- CSS 变量支持主题定制

## 🛠️ 构建命令

```bash
# 安装依赖
pnpm install

# 构建项目
pnpm build

# 开发模式（监听文件变化）
pnpm dev

# 清理输出目录
pnpm clean

# 分析构建结果
pnpm analyze
```

## 📦 构建输出

构建完成后，将在 `dist` 目录生成以下文件：

```
dist/
├── index.js          # ESM 格式
├── index.cjs         # CJS 格式
├── index.d.ts        # TypeScript 声明文件
├── style.css         # 提取的样式文件
├── index.js.map      # ESM Source Map
├── index.cjs.map     # CJS Source Map
└── style.css.map     # CSS Source Map
```

## 📖 使用示例

### 基础使用

```tsx
import React, { useState } from 'react'
import { Button, Input } from '@example/react-components'
import '@example/react-components/style'

function App() {
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // 提交逻辑
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('提交成功')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Input
        label="用户名"
        placeholder="请输入用户名"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        clearable
        onClear={() => setInputValue('')}
      />
      
      <Button
        variant="primary"
        loading={loading}
        loadingText="提交中..."
        onClick={handleSubmit}
      >
        提交
      </Button>
    </div>
  )
}

export default App
```

### 表单验证示例

```tsx
import React, { useState, useRef } from 'react'
import { Button, Input } from '@example/react-components'

interface FormData {
  username: string
  password: string
  email: string
}

interface FormErrors {
  username?: string
  password?: string
  email?: string
}

function LoginForm() {
  const [form, setForm] = useState<FormData>({
    username: '',
    password: '',
    email: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const usernameRef = useRef<HTMLInputElement>(null)

  const validateField = (name: keyof FormData, value: string): string => {
    switch (name) {
      case 'username':
        return value.length < 3 ? '用户名至少3个字符' : ''
      case 'password':
        return value.length < 6 ? '密码至少6个字符' : ''
      case 'email':
        return !/\S+@\S+\.\S+/.test(value) ? '邮箱格式不正确' : ''
      default:
        return ''
    }
  }

  const handleChange = (name: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value
    setForm(prev => ({ ...prev, [name]: value }))
    
    // 实时验证
    const error = validateField(name, value)
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  const handleSubmit = () => {
    // 聚焦到第一个错误字段
    if (errors.username) {
      usernameRef.current?.focus()
    }
  }

  return (
    <form>
      <Input
        ref={usernameRef}
        label="用户名"
        required
        value={form.username}
        onChange={handleChange('username')}
        error={errors.username}
        help="用户名用于登录系统"
      />
      
      <Input
        label="密码"
        type="password"
        required
        showPassword
        value={form.password}
        onChange={handleChange('password')}
        error={errors.password}
      />
      
      <Input
        label="邮箱"
        type="email"
        value={form.email}
        onChange={handleChange('email')}
        error={errors.email}
        prefix="📧"
      />
      
      <Button
        variant="primary"
        block
        onClick={handleSubmit}
        disabled={Object.values(errors).some(error => error)}
      >
        登录
      </Button>
    </form>
  )
}
```

### 自定义主题

```tsx
import React from 'react'
import { Button } from '@example/react-components'

// 通过 CSS 变量自定义主题
const customTheme = {
  '--ld-color-primary': '#ff6b6b',
  '--ld-color-primary-hover': '#ff5252',
  '--ld-border-radius': '12px'
}

function ThemedComponent() {
  return (
    <div style={customTheme}>
      <Button variant="primary">
        自定义主题按钮
      </Button>
    </div>
  )
}
```

## ⚙️ 配置说明

### ldesign.config.ts

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 入口文件
  input: 'src/index.ts',
  
  // 输出配置
  output: {
    dir: 'dist',
    format: ['esm', 'cjs'],  // 生成 ESM 和 CJS 两种格式
    sourcemap: true          // 生成 Source Map
  },
  
  // 库类型（混合类型，包含 TSX 和 CSS）
  libraryType: 'mixed',
  
  // React 配置
  react: {
    jsx: {
      enabled: true,
      pragma: 'React.createElement',
      pragmaFrag: 'React.Fragment',
      runtime: 'classic'     // 或 'automatic'
    }
  },
  
  // TypeScript 配置
  typescript: {
    declaration: true,      // 生成声明文件
    jsx: 'react-jsx'       // 或 'react'
  },
  
  // 样式配置
  style: {
    extract: true,         // 提取 CSS 到单独文件
    minimize: true,        // 压缩 CSS
    autoprefixer: true     // 自动添加浏览器前缀
  },
  
  // 外部依赖（不打包到输出中）
  external: ['react', 'react-dom']
})
```

## 🎨 组件 API

### Button 组件

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * 按钮变体
   */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  
  /**
   * 按钮尺寸
   */
  size?: 'small' | 'medium' | 'large'
  
  /**
   * 是否为块级按钮
   */
  block?: boolean
  
  /**
   * 是否为圆角按钮
   */
  round?: boolean
  
  /**
   * 是否显示加载状态
   */
  loading?: boolean
  
  /**
   * 加载状态文本
   */
  loadingText?: string
  
  /**
   * 图标（放在文本前面）
   */
  icon?: React.ReactNode
  
  /**
   * 子元素
   */
  children?: React.ReactNode
}
```

### Input 组件

```typescript
interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * 输入框标签
   */
  label?: string
  
  /**
   * 是否必填
   */
  required?: boolean
  
  /**
   * 错误信息
   */
  error?: string
  
  /**
   * 帮助文本
   */
  help?: string
  
  /**
   * 输入框尺寸
   */
  size?: 'small' | 'medium' | 'large'
  
  /**
   * 是否可清空
   */
  clearable?: boolean
  
  /**
   * 是否显示密码切换按钮
   */
  showPassword?: boolean
  
  /**
   * 前缀图标
   */
  prefix?: React.ReactNode
  
  /**
   * 后缀图标
   */
  suffix?: React.ReactNode
  
  /**
   * 清空回调
   */
  onClear?: () => void
}
```

## 🎯 最佳实践

### 1. 组件设计
- 使用函数组件和 Hooks
- 提供 forwardRef 支持
- 支持受控和非受控模式
- 遵循 React 组件设计原则

### 2. TypeScript 集成
- 扩展原生 HTML 元素属性
- 提供完整的类型定义
- 使用泛型提高灵活性
- 导出所有类型供用户使用

### 3. 样式设计
- 使用 CSS 变量支持主题
- 采用 BEM 命名规范
- 提供响应式设计
- 避免样式冲突

### 4. 可访问性
- 添加适当的 ARIA 属性
- 支持键盘导航
- 提供焦点管理
- 考虑屏幕阅读器

## 🔧 开发技巧

### 1. 调试
- 使用 React DevTools 调试组件
- 利用 Source Map 调试原始代码
- 在开发模式下使用 `pnpm dev` 监听变化

### 2. 测试
- 使用 @testing-library/react 进行组件测试
- 编写单元测试和集成测试
- 测试用户交互和边界情况

### 3. 性能优化
- 使用 React.memo 避免不必要的重渲染
- 合理使用 useCallback 和 useMemo
- 避免在渲染中创建新对象

## 📚 扩展功能

基于这个示例，你可以：

1. **添加更多组件**：表格、表单、模态框等
2. **集成状态管理**：Redux、Zustand 等
3. **添加动画**：Framer Motion、React Spring
4. **主题系统**：完整的主题定制方案
5. **国际化**：react-i18next 多语言支持
6. **移动端适配**：响应式设计和触摸支持

这个示例展示了使用 @ldesign/builder 构建 React 组件库的完整流程和最佳实践。
