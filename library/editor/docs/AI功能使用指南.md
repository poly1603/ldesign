# 🤖 AI 功能使用指南

## 功能完成情况 ✅

AI功能已经**完全开发完成**，包括：

- ✅ **AI服务架构** - 支持多个AI提供商
- ✅ **DeepSeek集成** - 默认提供商，包含免费API密钥
- ✅ **四大核心功能** - 纠错、补全、续写、重写
- ✅ **UI组件** - 建议浮层、配置对话框、加载提示
- ✅ **配置管理** - 本地存储，支持自定义API密钥
- ✅ **快捷键支持** - 可自定义的键盘快捷键
- ✅ **插件集成** - 与编辑器插件系统完美整合

## 快速开始

### 1. 构建项目
```bash
# 安装依赖
npm install

# 构建项目
npm run build
```

### 2. 在项目中使用

#### 方法一：使用默认配置（推荐）
```javascript
import { Editor } from '@ldesign/editor'

const editor = new Editor({
  element: document.getElementById('editor'),
  plugins: ['AIPlugin'] // 只需添加AI插件即可
})
```

#### 方法二：自定义配置
```javascript
import { Editor } from '@ldesign/editor'

const editor = new Editor({
  element: document.getElementById('editor'),
  plugins: ['AIPlugin'],
  ai: {
    enabled: true,
    defaultProvider: 'deepseek',
    providers: {
      deepseek: {
        provider: 'deepseek',
        model: 'deepseek-chat',
        apiKey: 'sk-37b7e5f545814da1923cae055b498c9a', // 默认密钥
        apiEndpoint: 'https://api.deepseek.com/v1'
      }
    },
    features: {
      errorCorrection: true,    // AI纠错
      autoComplete: true,        // AI补全
      textContinuation: true,    // AI续写
      textRewrite: true,         // AI重写
      smartSuggestions: true     // 智能建议
    },
    shortcuts: {
      errorCorrection: 'Alt+F',
      autoComplete: 'Ctrl+Space',
      textContinuation: 'Alt+Enter',
      textRewrite: 'Alt+R'
    }
  }
})
```

### 3. 在Vue中使用
```vue
<template>
  <div id="editor"></div>
</template>

<script setup>
import { onMounted } from 'vue'
import { Editor } from '@ldesign/editor'

onMounted(() => {
  const editor = new Editor({
    element: document.getElementById('editor'),
    plugins: ['AIPlugin']
  })
})
</script>
```

### 4. 在React中使用
```jsx
import React, { useEffect, useRef } from 'react'
import { Editor } from '@ldesign/editor'

function EditorComponent() {
  const editorRef = useRef(null)
  
  useEffect(() => {
    const editor = new Editor({
      element: editorRef.current,
      plugins: ['AIPlugin']
    })
    
    return () => editor.destroy()
  }, [])
  
  return <div ref={editorRef} />
}
```

## 核心功能使用

### 1. AI纠错 ✨
- **快捷键**: `Alt+F`
- **使用方法**: 选中需要纠错的文本，按快捷键或点击工具栏按钮
- **功能**: 自动纠正拼写、语法和标点错误

### 2. AI补全 💡
- **快捷键**: `Ctrl+Space`
- **使用方法**: 在输入时按快捷键获取补全建议
- **功能**: 根据上下文智能补全当前输入

### 3. AI续写 ✍️
- **快捷键**: `Alt+Enter`
- **使用方法**: 将光标放在段落末尾，按快捷键
- **功能**: 自动续写后续内容，保持风格一致

### 4. AI重写 🔄
- **快捷键**: `Alt+R`
- **使用方法**: 选中需要重写的文本，按快捷键
- **功能**: 优化文本表达，使其更清晰流畅

## 配置管理

### 通过UI配置
1. 点击工具栏中的 **AI设置** 按钮（⚙️图标）
2. 在弹出的对话框中可以：
   - 启用/禁用AI功能
   - 切换AI提供商
   - 设置API密钥
   - 配置模型参数
   - 开关特定功能
   - 自定义快捷键

### 通过代码配置
```javascript
// 获取AI服务实例
const aiService = editor.ai

// 更新配置
aiService.updateConfig({
  defaultProvider: 'openai',
  providers: {
    openai: {
      apiKey: 'your-openai-key',
      model: 'gpt-3.5-turbo'
    }
  }
})

// 更新单个API密钥
aiService.updateApiKey('deepseek', 'new-api-key')

// 启用/禁用AI功能
aiService.setEnabled(true)

// 切换提供商
aiService.setProvider('openai')
```

## 高级用法

### 直接调用AI服务
```javascript
// 获取AI服务
import { getAIService } from '@ldesign/editor'
const aiService = getAIService()

// 纠错
const result = await aiService.correct('这是一个测试文本')

// 补全
const completion = await aiService.complete('今天天气')

// 续写
const continuation = await aiService.continue('人工智能的发展')

// 重写
const rewrite = await aiService.rewrite('这个很重要')

// 获取建议
const suggestions = await aiService.suggest('如何提高')
```

### 自定义AI提供商
```javascript
import { AIProviderInterface } from '@ldesign/editor'

class CustomProvider implements AIProviderInterface {
  name = 'custom'
  config = { /* ... */ }
  
  async initialize(config) { /* ... */ }
  async request(request) { /* ... */ }
  validateConfig() { /* ... */ }
  cleanup() { /* ... */ }
}

// 注册自定义提供商
aiService.registerProvider(new CustomProvider())
```

## 默认配置说明

### DeepSeek（默认）
- **API密钥**: `sk-37b7e5f545814da1923cae055b498c9a`
- **模型**: `deepseek-chat`
- **端点**: `https://api.deepseek.com/v1`
- **特点**: 中文优化，性价比高

### OpenAI（可选）
- **需要自行配置API密钥**
- **支持模型**: GPT-3.5, GPT-4
- **端点**: `https://api.openai.com/v1`

## 测试示例

打开 `examples/ai-demo.html` 查看完整的功能演示：

```bash
# 构建项目
npm run build

# 打开演示页面
open examples/ai-demo.html
```

## 注意事项

1. **API密钥安全**: 默认密钥仅供测试，生产环境请使用自己的密钥
2. **网络要求**: AI功能需要访问API端点，确保网络通畅
3. **配额限制**: 免费密钥可能有使用限制，建议申请自己的密钥
4. **隐私保护**: 文本会发送到AI服务商，注意敏感信息保护

## 常见问题

### Q: AI功能无响应？
A: 检查网络连接和API密钥是否有效

### Q: 如何更换AI提供商？
A: 通过AI设置对话框或调用 `aiService.setProvider()`

### Q: 支持离线使用吗？
A: 目前不支持，AI功能需要在线调用API

### Q: 如何禁用某个AI功能？
A: 在AI设置中关闭对应功能开关

## 技术架构

```
src/ai/
├── AIService.ts          # AI服务管理器
├── types.ts              # 类型定义
└── providers/
    └── DeepSeekProvider.ts  # DeepSeek实现

src/plugins/
└── ai.ts                 # AI编辑器插件

src/ui/
├── AISuggestionsOverlay.ts  # 建议浮层
└── AIConfigDialog.ts        # 配置对话框
```

## 开发计划

- [ ] 添加更多AI提供商（Azure, Anthropic等）
- [ ] 支持流式响应
- [ ] 添加提示词模板
- [ ] 支持自定义AI功能
- [ ] 添加使用统计
- [ ] 支持批量处理

---

**AI功能已完全实现，可以直接使用！** 🎉