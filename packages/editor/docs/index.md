---
layout: home

hero:
  name: "LDesign Editor"
  text: "功能完整的富文本编辑器"
  tagline: 模块化设计 · 插件系统 · 主题定制 · 响应式设计
  image:
    src: /logo.svg
    alt: LDesign Editor
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看示例
      link: /examples/basic

features:
  - icon: 🎯
    title: 框架无关
    details: 支持 Vue、React、Angular 等主流前端框架，也可以在原生 JavaScript 中使用
  - icon: 🔌
    title: 插件系统
    details: 强大的插件架构，支持第三方插件扩展，轻松添加自定义功能
  - icon: 🎨
    title: 主题定制
    details: 基于 CSS 变量的主题系统，支持深度定制和动态切换
  - icon: 📱
    title: 响应式设计
    details: 完美适配 PC、平板、手机等各种设备，提供一致的用户体验
  - icon: ⚡
    title: 高性能
    details: 虚拟 DOM 渲染，支持大文档编辑，优化的事件处理机制
  - icon: 🛡️
    title: 类型安全
    details: 完整的 TypeScript 类型定义，提供优秀的开发体验
  - icon: 🧪
    title: 测试覆盖
    details: 完整的单元测试和端到端测试，确保代码质量和稳定性
  - icon: 📚
    title: 文档完善
    details: 详细的 API 文档、使用指南和丰富的示例代码
---

## 快速体验

::: code-group

```typescript [基础使用]
import { LDesignEditor } from '@ldesign/editor'
import '@ldesign/editor/dist/style.css'

// 创建编辑器实例
const editor = new LDesignEditor({
  container: '#editor',
  content: '<p>Hello World!</p>',
  placeholder: '请输入内容...'
})

// 初始化编辑器
editor.init()
```

```vue [Vue 3]
<template>
  <div ref="editorRef" class="editor-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { LDesignEditor } from '@ldesign/editor'

const editorRef = ref<HTMLElement>()
let editor: LDesignEditor | null = null

onMounted(() => {
  if (editorRef.value) {
    editor = new LDesignEditor({
      container: editorRef.value,
      content: '<p>Hello Vue!</p>'
    })
    editor.init()
  }
})

onUnmounted(() => {
  editor?.destroy()
})
</script>
```

```tsx [React]
import React, { useRef, useEffect } from 'react'
import { LDesignEditor } from '@ldesign/editor'

const EditorComponent: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null)
  const editorInstance = useRef<LDesignEditor | null>(null)

  useEffect(() => {
    if (editorRef.current) {
      editorInstance.current = new LDesignEditor({
        container: editorRef.current,
        content: '<p>Hello React!</p>'
      })
      editorInstance.current.init()
    }

    return () => {
      editorInstance.current?.destroy()
    }
  }, [])

  return <div ref={editorRef} className="editor-container" />
}

export default EditorComponent
```

:::

## 核心特性

### 🔌 强大的插件系统

```typescript
// 创建自定义插件
class CustomPlugin extends BasePlugin {
  public readonly name = 'custom'
  
  getCommands() {
    return [
      {
        name: 'customCommand',
        execute: (editor) => {
          // 插件逻辑
        }
      }
    ]
  }
}

// 注册并启用插件
editor.plugins.register(new CustomPlugin(editor))
editor.plugins.enable('custom')
```

### 🎨 灵活的主题系统

```typescript
// 切换预设主题
editor.themes.setTheme('dark')

// 创建自定义主题
const customTheme = editor.themes.createCustomTheme('myTheme', 'default', {
  '--ldesign-brand-color': '#ff6b6b',
  '--ldesign-bg-color-container': '#f8f9fa'
})

editor.themes.setTheme('myTheme')
```

### 📱 智能响应式适配

```typescript
// 检查当前设备类型
const deviceType = editor.responsive.getCurrentDevice()

// 监听设备变更
editor.responsive.onDeviceChange((newDevice, prevDevice) => {
  console.log(`Device changed from ${prevDevice} to ${newDevice}`)
})
```

## 安装

::: code-group

```bash [npm]
npm install @ldesign/editor
```

```bash [yarn]
yarn add @ldesign/editor
```

```bash [pnpm]
pnpm add @ldesign/editor
```

:::

## 浏览器支持

- Chrome >= 88
- Firefox >= 85
- Safari >= 14
- Edge >= 88

## 许可证

[MIT License](https://github.com/ldesign/editor/blob/main/LICENSE)

## 贡献

欢迎提交 Issue 和 Pull Request！查看 [贡献指南](https://github.com/ldesign/editor/blob/main/CONTRIBUTING.md) 了解更多信息。
