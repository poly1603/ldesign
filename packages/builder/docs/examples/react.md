# React 组件库

本页面展示如何使用 @ldesign/builder 构建 React 组件库。

## 项目结构

典型的 React 组件库项目结构：

```
my-react-lib/
├── src/
│   ├── components/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.module.css
│   │   │   └── index.ts
│   │   └── Input/
│   │       ├── Input.tsx
│   │       ├── Input.module.css
│   │       └── index.ts
│   ├── hooks/
│   │   └── useToggle.ts
│   ├── utils/
│   │   └── classNames.ts
│   └── index.ts
├── package.json
└── builder.config.ts
```

## 基础配置

创建 `builder.config.ts`：

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  outDir: 'dist',
  formats: ['esm', 'cjs', 'umd'],
  dts: true,
  external: ['react', 'react-dom'],
  globals: {
    react: 'React',
    'react-dom': 'ReactDOM'
  },
  name: 'MyReactLib'
})
```

## 入口文件

`src/index.ts`：

```typescript
// 导出所有组件
export { default as Button } from './components/Button'
export { default as Input } from './components/Input'

// 导出类型
export type { ButtonProps } from './components/Button'
export type { InputProps } from './components/Input'

// 导出 hooks
export { useToggle } from './hooks/useToggle'

// 导出工具函数
export { classNames } from './utils/classNames'
```

## 组件定义

`src/components/Button/Button.tsx`：

```tsx
import React, { forwardRef } from 'react'
import { classNames } from '../../utils/classNames'
import styles from './Button.module.css'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 按钮类型 */
  variant?: 'primary' | 'secondary' | 'danger'
  /** 按钮尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 是否为加载状态 */
  loading?: boolean
  /** 子元素 */
  children?: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'medium', 
    loading = false,
    disabled,
    className,
    children,
    ...props 
  }, ref) => {
    const buttonClass = classNames(
      styles.button,
      styles[`button--${variant}`],
      styles[`button--${size}`],
      {
        [styles['button--loading']]: loading,
        [styles['button--disabled']]: disabled || loading
      },
      className
    )

    return (
      <button
        ref={ref}
        className={buttonClass}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <span className={styles.spinner} />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
```

`src/components/Button/index.ts`：

```typescript
export { default } from './Button'
export type { ButtonProps } from './Button'
```

## Hooks 示例

`src/hooks/useToggle.ts`：

```typescript
import { useState, useCallback } from 'react'

export interface UseToggleReturn {
  value: boolean
  toggle: () => void
  setTrue: () => void
  setFalse: () => void
  setValue: (value: boolean) => void
}

export function useToggle(initialValue = false): UseToggleReturn {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => {
    setValue(prev => !prev)
  }, [])

  const setTrue = useCallback(() => {
    setValue(true)
  }, [])

  const setFalse = useCallback(() => {
    setValue(false)
  }, [])

  return {
    value,
    toggle,
    setTrue,
    setFalse,
    setValue
  }
}
```

## 工具函数

`src/utils/classNames.ts`：

```typescript
type ClassValue = string | number | boolean | undefined | null
type ClassObject = Record<string, any>
type ClassArray = ClassValue[]

export function classNames(...args: (ClassValue | ClassObject | ClassArray)[]): string {
  const classes: string[] = []

  for (const arg of args) {
    if (!arg) continue

    if (typeof arg === 'string' || typeof arg === 'number') {
      classes.push(String(arg))
    } else if (Array.isArray(arg)) {
      const inner = classNames(...arg)
      if (inner) classes.push(inner)
    } else if (typeof arg === 'object') {
      for (const key in arg) {
        if (arg[key]) classes.push(key)
      }
    }
  }

  return classes.join(' ')
}
```

## CSS 模块

`src/components/Button/Button.module.css`：

```css
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-family: inherit;
  font-weight: 500;
  transition: all 0.2s ease;
}

.button--primary {
  background-color: #3b82f6;
  color: white;
}

.button--primary:hover {
  background-color: #2563eb;
}

.button--secondary {
  background-color: #f3f4f6;
  color: #374151;
}

.button--danger {
  background-color: #ef4444;
  color: white;
}

.button--small {
  padding: 8px 12px;
  font-size: 14px;
}

.button--medium {
  padding: 10px 16px;
  font-size: 16px;
}

.button--large {
  padding: 12px 20px;
  font-size: 18px;
}

.button--loading {
  cursor: not-allowed;
  opacity: 0.7;
}

.button--disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

## 构建脚本

在 `package.json` 中添加：

```json
{
  "scripts": {
    "build": "node -e \"require('@ldesign/builder').build(require('./builder.config.ts').default)\"",
    "build:watch": "node -e \"require('@ldesign/builder').watch(require('./builder.config.ts').default)\"",
    "dev": "npm run build:watch"
  },
  "main": "dist/cjs/index.js",
  "module": "dist/esm/index.js",
  "types": "dist/types/index.d.ts",
  "files": [
    "dist"
  ]
}
```

## 输出结构

```
dist/
├── esm/                    # ES 模块格式
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── index.js
├── cjs/                    # CommonJS 格式
│   └── ... (相同结构)
├── umd/                    # UMD 格式
│   └── index.js
└── types/                  # TypeScript 声明文件
    ├── components/
    ├── hooks/
    ├── utils/
    └── index.d.ts
```

## 使用示例

### 安装和使用

```bash
npm install my-react-lib
```

```tsx
import React from 'react'
import { Button, Input, useToggle } from 'my-react-lib'

function App() {
  const { value: visible, toggle } = useToggle(false)

  return (
    <div>
      <Button variant="primary" onClick={toggle}>
        {visible ? '隐藏' : '显示'}
      </Button>
      
      {visible && (
        <Input placeholder="请输入内容" />
      )}
    </div>
  )
}
```

### 按需导入

```tsx
// 只导入需要的组件
import Button from 'my-react-lib/dist/esm/components/Button'
import { useToggle } from 'my-react-lib/dist/esm/hooks/useToggle'
```

## 高级配置

### 支持 JSX 运行时

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  outDir: 'dist',
  formats: ['esm', 'cjs', 'umd'],
  dts: true,
  external: ['react', 'react-dom'],
  globals: {
    react: 'React',
    'react-dom': 'ReactDOM'
  },
  name: 'MyReactLib',
  rollupOptions: {
    // 自动配置 React JSX 支持
  }
})
```

## 相关

- [基础用法](/examples/basic)
- [Vue 组件库](/examples/vue)
- [TypeScript 库](/examples/typescript)
