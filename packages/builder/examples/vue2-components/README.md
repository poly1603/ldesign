# Vue2 组件库示例

这是一个使用 `@ldesign/builder` 构建的 Vue2 组件库示例，展示了如何创建、配置和打包一个完整的 Vue2 组件库。

## 📦 功能特性

- 🎨 **基础组件** - 按钮、输入框、卡片等常用 UI 组件
- 🎯 **Vue2 支持** - 完全兼容 Vue 2.6+ 版本
- 📝 **TypeScript 支持** - 提供完整的类型定义
- 🎨 **Less 样式** - 使用 Less 预处理器，支持主题定制
- 📦 **多格式输出** - 支持 ESM、CJS、UMD 三种格式
- 🌳 **按需引入** - 支持组件级别的按需引入
- 🎨 **设计系统** - 基于 LDesign 设计系统的颜色规范

## 🚀 安装

```bash
# 使用 npm
npm install @ldesign/vue2-components-example vue@^2.6.0

# 使用 pnpm
pnpm add @ldesign/vue2-components-example vue@^2.6.0

# 使用 yarn
yarn add @ldesign/vue2-components-example vue@^2.6.0
```

## 📖 使用方法

### 全局安装

```typescript
import Vue from 'vue'
import Vue2Components from '@ldesign/vue2-components-example'

// 安装所有组件
Vue.use(Vue2Components)

// 现在可以在任何组件中使用
// <l-button>按钮</l-button>
// <l-input v-model="value" />
// <l-card title="标题">内容</l-card>
```

### 按需引入

```typescript
import { Button, Input, Card } from '@ldesign/vue2-components-example'

export default {
  components: {
    LButton: Button,
    LInput: Input,
    LCard: Card
  }
}
```

### 单个组件安装

```typescript
import Vue from 'vue'
import { Button } from '@ldesign/vue2-components-example'

Vue.use(Button)
```

### 样式引入

```typescript
// 如果使用按需引入，需要手动引入样式
import '@ldesign/vue2-components-example/dist/style.css'
```

## 🧩 组件列表

### Button 按钮

基础的按钮组件，支持多种类型、尺寸和状态。

```vue
<template>
  <div>
    <!-- 基础按钮 -->
    <l-button @click="handleClick">默认按钮</l-button>
    
    <!-- 不同类型 -->
    <l-button type="primary">主要按钮</l-button>
    <l-button type="secondary">次要按钮</l-button>
    <l-button type="success">成功按钮</l-button>
    <l-button type="warning">警告按钮</l-button>
    <l-button type="error">错误按钮</l-button>
    <l-button type="text">文本按钮</l-button>
    
    <!-- 不同尺寸 -->
    <l-button size="small">小按钮</l-button>
    <l-button size="medium">中按钮</l-button>
    <l-button size="large">大按钮</l-button>
    
    <!-- 特殊状态 -->
    <l-button disabled>禁用按钮</l-button>
    <l-button loading>加载中</l-button>
    <l-button block>块级按钮</l-button>
    <l-button round>圆形按钮</l-button>
    <l-button circle icon="❤️"></l-button>
  </div>
</template>
```

#### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| type | `'primary' \| 'secondary' \| 'success' \| 'warning' \| 'error' \| 'text'` | `'primary'` | 按钮类型 |
| size | `'small' \| 'medium' \| 'large'` | `'medium'` | 按钮尺寸 |
| block | `boolean` | `false` | 是否为块级按钮 |
| round | `boolean` | `false` | 是否为圆形按钮 |
| circle | `boolean` | `false` | 是否为圆角按钮 |
| disabled | `boolean` | `false` | 是否禁用 |
| loading | `boolean` | `false` | 是否加载中 |
| icon | `string` | `''` | 图标 |
| iconPosition | `'left' \| 'right'` | `'left'` | 图标位置 |

#### Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| click | 点击事件 | `(event: Event)` |

### Input 输入框

基础的输入框组件，支持多种类型和验证。

```vue
<template>
  <div>
    <!-- 基础输入框 -->
    <l-input v-model="value" placeholder="请输入内容" />
    
    <!-- 带标签 -->
    <l-input
      v-model="username"
      label="用户名"
      placeholder="请输入用户名"
      required
    />
    
    <!-- 带图标 -->
    <l-input
      v-model="search"
      prefix-icon="🔍"
      placeholder="搜索"
      clearable
    />
    
    <!-- 密码输入框 -->
    <l-input
      v-model="password"
      type="password"
      label="密码"
      show-word-count
      maxlength="20"
    />
    
    <!-- 带验证 -->
    <l-input
      v-model="email"
      type="email"
      label="邮箱"
      :error-message="emailError"
      help-text="请输入有效的邮箱地址"
    />
  </div>
</template>
```

#### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| value | `string \| number` | `''` | 输入框的值 |
| type | `string` | `'text'` | 输入框类型 |
| size | `'small' \| 'medium' \| 'large'` | `'medium'` | 输入框尺寸 |
| label | `string` | `''` | 标签文本 |
| placeholder | `string` | `''` | 占位符文本 |
| disabled | `boolean` | `false` | 是否禁用 |
| readonly | `boolean` | `false` | 是否只读 |
| required | `boolean` | `false` | 是否必填 |
| clearable | `boolean` | `false` | 是否可清除 |
| showWordCount | `boolean` | `false` | 是否显示字数统计 |
| maxlength | `number` | - | 最大长度 |
| prefixIcon | `string` | `''` | 前缀图标 |
| suffixIcon | `string` | `''` | 后缀图标 |
| errorMessage | `string` | `''` | 错误信息 |
| helpText | `string` | `''` | 帮助文本 |

#### Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| input | 输入事件 | `(value: string)` |
| change | 变化事件 | `(value: string)` |
| focus | 获得焦点事件 | `(event: Event)` |
| blur | 失去焦点事件 | `(event: Event)` |
| clear | 清除事件 | - |

### Card 卡片

通用的卡片容器组件，支持标题、封面、内容和底部区域。

```vue
<template>
  <div>
    <!-- 基础卡片 -->
    <l-card title="基础卡片">
      <p>这是卡片的内容区域。</p>
    </l-card>
    
    <!-- 带封面的卡片 -->
    <l-card title="带封面的卡片">
      <template #cover>
        <img src="https://via.placeholder.com/300x200" alt="封面" />
      </template>
      <p>这是带封面的卡片内容。</p>
    </l-card>
    
    <!-- 自定义头部 -->
    <l-card>
      <template #header>
        <div style="display: flex; align-items: center;">
          <span style="font-weight: bold;">自定义头部</span>
          <span style="margin-left: auto;">2023-12-25</span>
        </div>
      </template>
      <p>这是自定义头部的卡片内容。</p>
    </l-card>
    
    <!-- 带底部的卡片 -->
    <l-card title="带底部的卡片">
      <p>这是卡片的主要内容。</p>
      <template #footer>
        <div style="text-align: right;">
          <l-button>取消</l-button>
          <l-button type="primary">确定</l-button>
        </div>
      </template>
    </l-card>
  </div>
</template>
```

#### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | `string` | `''` | 卡片标题 |
| size | `'small' \| 'medium' \| 'large'` | `'medium'` | 卡片尺寸 |
| bordered | `boolean` | `true` | 是否有边框 |
| shadow | `boolean \| 'always' \| 'hover' \| 'never'` | `'hover'` | 阴影效果 |
| hoverable | `boolean` | `false` | 是否可悬停 |
| bodyPadding | `boolean` | `true` | 内容区域是否有内边距 |
| loading | `boolean` | `false` | 是否加载中 |

#### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 卡片内容 |
| header | 头部内容 |
| extra | 额外内容（显示在头部右侧） |
| cover | 封面内容 |
| footer | 底部内容 |

## 🎨 主题定制

组件库基于 LDesign 设计系统，支持通过 CSS 变量进行主题定制：

```css
:root {
  /* 主色调 */
  --ldesign-brand-color: #722ED1;
  --ldesign-brand-color-hover: #7334cb;
  --ldesign-brand-color-active: #491f84;
  
  /* 功能色 */
  --ldesign-success-color: #62cb62;
  --ldesign-warning-color: #f5c538;
  --ldesign-error-color: #e54848;
  
  /* 文本色 */
  --ldesign-text-color-primary: rgba(0, 0, 0, 90%);
  --ldesign-text-color-secondary: rgba(0, 0, 0, 70%);
  
  /* 边框色 */
  --ldesign-border-color: #e5e5e5;
  --ldesign-border-color-hover: #d9d9d9;
  
  /* 背景色 */
  --ldesign-bg-color-container: #ffffff;
  --ldesign-bg-color-component: #ffffff;
}
```

## 🔧 开发

### 构建

```bash
# 构建所有格式
npm run build

# 监听模式构建
npm run dev

# 清理构建产物
npm run clean
```

### 测试

```bash
# 运行测试
npm test

# 运行测试（单次）
npm run test:run
```

## 📁 项目结构

```
vue2-components/
├── src/                    # 源代码目录
│   ├── button/            # 按钮组件
│   │   ├── Button.vue     # 组件实现
│   │   └── index.ts       # 组件导出
│   ├── input/             # 输入框组件
│   │   ├── Input.vue      # 组件实现
│   │   └── index.ts       # 组件导出
│   ├── card/              # 卡片组件
│   │   ├── Card.vue       # 组件实现
│   │   └── index.ts       # 组件导出
│   ├── styles/            # 样式文件
│   │   └── variables.less # 样式变量
│   └── index.ts           # 主入口文件
├── .ldesign/              # 构建配置
│   └── builder.config.ts  # @ldesign/builder 配置
├── dist/                  # 构建输出目录
│   ├── esm/              # ES 模块格式
│   ├── cjs/              # CommonJS 格式
│   ├── umd/              # UMD 格式
│   ├── types/            # TypeScript 类型声明
│   └── style.css         # 提取的样式文件
├── package.json           # 项目配置
└── README.md             # 项目文档
```

## 🛠️ 构建配置

本项目使用 `@ldesign/builder` 进行构建，配置文件位于 `.ldesign/builder.config.ts`：

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  output: {
    format: ['esm', 'cjs', 'umd'],
    sourcemap: true,
    name: 'Vue2Components'
  },
  libraryType: 'vue2',
  bundler: 'rollup',
  dts: true,
  external: ['vue'],
  globals: { vue: 'Vue' },
  css: {
    extract: true,
    preprocessor: 'less'
  },
  clean: true
})
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系我们

- 官网：https://ldesign.dev
- GitHub：https://github.com/ldesign/ldesign
