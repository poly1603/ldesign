# 混合类型库示例

这是一个使用 @ldesign/builder 构建的混合类型库示例，展示了如何构建包含多种文件类型的复杂库项目。

## 📁 项目结构

```
mixed-library/
├── src/
│   ├── utils/
│   │   └── index.ts         # 工具函数模块
│   ├── components/
│   │   ├── index.ts         # 组件模块
│   │   └── styles.less      # 组件样式
│   └── index.ts             # 主入口文件
├── .ldesign/
│   └── builder.config.ts    # 构建配置
├── package.json             # 项目配置
├── tsconfig.json            # TypeScript 配置
└── README.md               # 项目说明
```

## 🚀 特性展示

### 1. 多模块架构
- **工具函数模块**: 字符串、数字、日期、验证、存储等工具
- **组件模块**: DOM 操作组件（Toast、Modal、Loading）
- **样式模块**: Less 样式文件和动画效果

### 2. TypeScript 集成
- 完整的类型定义和接口
- 模块化的代码组织
- 严格的类型检查

### 3. 原生 DOM 组件
- 基于原生 JavaScript 的组件类
- 支持事件处理和生命周期
- 提供链式调用 API

### 4. 样式集成
- Less 预处理器支持
- 组件样式自动提取
- CSS 动画和过渡效果

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
├── utils.js          # 工具模块 (ESM)
├── utils.cjs         # 工具模块 (CJS)
├── utils.d.ts        # 工具模块类型定义
├── index.js.map      # ESM Source Map
├── index.cjs.map     # CJS Source Map
└── style.css.map     # CSS Source Map
```

## 📖 使用示例

### 完整导入

```typescript
import mixedLibrary, {
  stringUtils,
  numberUtils,
  dateUtils,
  validationUtils,
  storageUtils,
  Toast,
  Modal,
  Loading
} from '@example/mixed-library'
import '@example/mixed-library/style'

// 初始化库
mixedLibrary.init()

// 使用工具函数
const formattedText = stringUtils.capitalize('hello world')
const formattedNumber = numberUtils.formatCurrency(1234.56)
const relativeTime = dateUtils.relative(new Date('2024-01-01'))

// 使用组件
Toast.success('操作成功！')
const modal = Modal.show({
  title: '确认操作',
  content: '您确定要执行此操作吗？',
  confirmText: '确定',
  cancelText: '取消'
})
```

### 按需导入

```typescript
// 仅导入工具函数
import { stringUtils, numberUtils } from '@example/mixed-library/utils'

// 仅导入组件
import { Toast, Modal } from '@example/mixed-library'
import '@example/mixed-library/style'

// 使用
const text = stringUtils.camelCase('hello-world')
Toast.info('信息提示')
```

### 工具函数使用

```typescript
import {
  stringUtils,
  numberUtils,
  dateUtils,
  validationUtils,
  storageUtils
} from '@example/mixed-library'

// 字符串工具
const title = stringUtils.capitalize('hello world')  // "Hello world"
const camelCase = stringUtils.camelCase('hello-world')  // "helloWorld"
const kebabCase = stringUtils.kebabCase('HelloWorld')  // "hello-world"
const truncated = stringUtils.truncate('很长的文本...', 10)  // "很长的文本..."

// 数字工具
const formatted = numberUtils.format(1234.567, { precision: 2 })  // "1,234.57"
const currency = numberUtils.formatCurrency(1234.56)  // "¥1,234.56"
const randomNum = numberUtils.randomInt(1, 100)  // 1-100 的随机整数

// 日期工具
const dateStr = dateUtils.format(new Date(), 'YYYY-MM-DD HH:mm:ss')
const relative = dateUtils.relative(new Date('2024-01-01'))  // "3天前"
const futureDate = dateUtils.addDays(new Date(), 7)  // 7天后的日期

// 验证工具
const isValidEmail = validationUtils.email('test@example.com')  // true
const isValidPhone = validationUtils.phone('13800138000')  // true

const validationResult = validationUtils.validate('test', [
  { required: true, message: '此字段为必填项' },
  { min: 3, message: '最少3个字符' },
  { pattern: /^[a-zA-Z]+$/, message: '只能包含字母' }
])

// 存储工具
storageUtils.setLocal('user', { name: 'John', age: 30 })
const user = storageUtils.getLocal('user')
storageUtils.setSession('token', 'abc123')
```

### 组件使用

```typescript
import { Toast, Modal, Loading, BaseComponent } from '@example/mixed-library'

// Toast 消息提示
Toast.info('普通信息')
Toast.success('操作成功', 5000)  // 5秒后消失
Toast.warning('警告信息')
Toast.error('错误信息')

// 自定义 Toast
Toast.show({
  message: '自定义消息',
  type: 'info',
  duration: 3000,
  position: 'center'
})

// Modal 对话框
const modal = Modal.show({
  title: '确认删除',
  content: '删除后无法恢复，确定要删除吗？',
  confirmText: '删除',
  cancelText: '取消',
  onConfirm: () => {
    console.log('确认删除')
  },
  onCancel: () => {
    console.log('取消删除')
  }
})

// Promise 风格的确认对话框
const confirmed = await Modal.confirm({
  title: '确认操作',
  content: '您确定要执行此操作吗？'
})

if (confirmed) {
  console.log('用户确认了操作')
}

// Loading 加载提示
const loading = Loading.show('加载中...')

// 模拟异步操作
setTimeout(() => {
  loading.hide()
}, 3000)

// 自定义组件
class CustomComponent extends BaseComponent {
  constructor() {
    super('div', {
      className: 'custom-component',
      onClick: (event) => {
        console.log('组件被点击', event)
      }
    })
    
    this.element.textContent = '自定义组件'
  }
}

const customComponent = new CustomComponent()
customComponent.appendTo(document.body)
```

### 在现代框架中使用

#### Vue 3 中使用

```vue
<template>
  <div>
    <button @click="showToast">显示提示</button>
    <button @click="showModal">显示对话框</button>
    <button @click="showLoading">显示加载</button>
  </div>
</template>

<script setup lang="ts">
import { Toast, Modal, Loading, stringUtils } from '@example/mixed-library'
import '@example/mixed-library/style'

const showToast = () => {
  Toast.success('Vue 3 中的提示消息')
}

const showModal = async () => {
  const confirmed = await Modal.confirm({
    title: 'Vue 3 确认',
    content: '在 Vue 3 中使用 Modal 组件'
  })
  
  if (confirmed) {
    Toast.success('用户确认了操作')
  }
}

const showLoading = () => {
  const loading = Loading.show('Vue 3 加载中...')
  
  setTimeout(() => {
    loading.hide()
    Toast.success('加载完成')
  }, 2000)
}

// 使用工具函数
const formattedText = stringUtils.capitalize('hello vue 3')
console.log(formattedText)  // "Hello vue 3"
</script>
```

#### React 中使用

```tsx
import React from 'react'
import { Toast, Modal, Loading, numberUtils } from '@example/mixed-library'
import '@example/mixed-library/style'

function App() {
  const handleShowToast = () => {
    Toast.success('React 中的提示消息')
  }

  const handleShowModal = async () => {
    const confirmed = await Modal.confirm({
      title: 'React 确认',
      content: '在 React 中使用 Modal 组件'
    })
    
    if (confirmed) {
      Toast.success('用户确认了操作')
    }
  }

  const handleShowLoading = () => {
    const loading = Loading.show('React 加载中...')
    
    setTimeout(() => {
      loading.hide()
      Toast.success('加载完成')
    }, 2000)
  }

  // 使用工具函数
  const price = numberUtils.formatCurrency(1234.56)

  return (
    <div>
      <h1>价格: {price}</h1>
      <button onClick={handleShowToast}>显示提示</button>
      <button onClick={handleShowModal}>显示对话框</button>
      <button onClick={handleShowLoading}>显示加载</button>
    </div>
  )
}

export default App
```

## ⚙️ 配置说明

### .ldesign/builder.config.ts

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
  
  // 库类型（混合类型库）
  libraryType: 'mixed',
  
  // TypeScript 配置
  typescript: {
    declaration: true,       // 生成声明文件
    declarationDir: 'dist',  // 声明文件输出目录
    target: 'ES2020',       // 编译目标
    module: 'ESNext',       // 模块格式
    strict: true            // 严格模式
  },
  
  // 样式配置
  style: {
    extract: true,          // 提取 CSS 到单独文件
    minimize: true,         // 压缩 CSS
    autoprefixer: true,     // 自动添加浏览器前缀
    preprocessor: {
      less: {
        enabled: true,
        options: {
          javascriptEnabled: true
        }
      }
    }
  },
  
  // 性能配置
  performance: {
    treeshaking: true,      // Tree Shaking
    minify: true,          // 代码压缩
    bundleAnalyzer: false  // 构建分析
  }
})
```

## 🎯 最佳实践

### 1. 模块化设计
- 按功能划分模块
- 保持模块间的低耦合
- 提供清晰的 API 接口

### 2. 类型安全
- 为所有公共 API 提供类型定义
- 使用泛型提高灵活性
- 导出所有类型供用户使用

### 3. 组件设计
- 基于原生 DOM API
- 提供链式调用支持
- 考虑内存泄漏和清理

### 4. 样式管理
- 使用 CSS 变量支持主题
- 避免样式冲突
- 提供合理的默认样式

## 🔧 开发技巧

### 1. 调试
- 使用浏览器开发者工具
- 利用 Source Map 调试原始代码
- 在开发模式下使用 `pnpm dev` 监听变化

### 2. 测试
- 编写单元测试覆盖工具函数
- 测试组件的 DOM 操作
- 验证样式的正确应用

### 3. 性能优化
- 合理使用 Tree Shaking
- 避免不必要的依赖
- 优化包体积

## 📚 扩展功能

基于这个示例，你可以：

1. **添加更多工具函数**：文件处理、网络请求、加密等
2. **扩展组件库**：表格、表单、图表等复杂组件
3. **集成第三方库**：动画库、图标库等
4. **添加插件系统**：支持自定义扩展
5. **国际化支持**：多语言文本处理
6. **主题系统**：完整的主题定制方案

这个示例展示了使用 @ldesign/builder 构建混合类型库的完整流程和最佳实践，适合构建功能丰富的工具库和组件库。
