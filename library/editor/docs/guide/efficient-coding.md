# 高效简洁编码指南

本指南展示如何使用新的API编写更简洁、高效的代码。

## 🎯 编辑器构建器

### 传统方式 vs 新方式

**传统方式（冗长）**:
```typescript
import { Editor } from '@ldesign/editor'

const editor = new Editor({
  element: '#editor',
  content: '<p>Hello</p>',
  editable: true,
  plugins: [/* 长长的插件列表 */]
})

// 然后手动配置各种东西...
```

**新方式（简洁）**:
```typescript
import { createEditor } from '@ldesign/editor'

// 流式API，链式调用
const editor = await createEditor()
  .element('#editor')
  .content('<p>Hello</p>')
  .lightweight()        // 使用预设
  .theme('dark')        // 设置主题
  .icons('material')    // 设置图标
  .build()              // 构建
```

### 预设构建器

**轻量级编辑器（一行代码）**:
```typescript
import { createLightweightEditor } from '@ldesign/editor'

const editor = await createLightweightEditor('#editor')
```

**功能完整编辑器（一行代码）**:
```typescript
import { createFullFeaturedEditor } from '@ldesign/editor'

const editor = await createFullFeaturedEditor('#editor')
```

**格式化专用编辑器（一行代码）**:
```typescript
import { createFormatOnlyEditor } from '@ldesign/editor'

const editor = await createFormatOnlyEditor('#editor')
```

### 自定义构建

**只启用特定功能**:
```typescript
const editor = await createEditor()
  .element('#editor')
  .onlyEnable([
    'bold',
    'italic',
    'heading',
    'link',
    'image'
  ])
  .compact(true)        // 紧凑工具栏
  .build()
```

**启用媒体功能**:
```typescript
const editor = await createEditor()
  .element('#editor')
  .lightweight()        // 基础功能
  .withMedia()          // + 媒体功能
  .withTable()          // + 表格功能
  .build()
```

**启用AI功能**:
```typescript
const editor = await createEditor()
  .element('#editor')
  .fullFeatured()
  .withAI('your-api-key', 'openai')
  .build()
```

## 🎨 DOM简化操作

### 使用$工具

**传统方式**:
```typescript
const button = document.createElement('button')
button.className = 'btn'
button.textContent = '保存'
button.style.cssText = 'padding: 8px 16px; background: blue; color: white;'
button.addEventListener('click', () => save())
document.body.appendChild(button)
```

**简化方式**:
```typescript
import { $, on } from '@ldesign/editor'

const button = $.create('button', {
  className: 'btn',
  text: '保存',
  style: 'padding: 8px 16px; background: blue; color: white;'
})
on.click(button, () => save())
document.body.appendChild(button)
```

### UI快捷函数

**创建按钮**:
```typescript
import { ui } from '@ldesign/editor'

// 一行代码创建完整按钮
const btn = ui.button('保存', () => save(), 'save')
```

**创建输入框**:
```typescript
const input = ui.input('请输入...', (value) => {
  console.log('输入:', value)
})
```

**显示提示**:
```typescript
ui.toast('保存成功！', 'success')
ui.toast('操作失败', 'error')
ui.toast('提示信息', 'info')
```

**显示对话框**:
```typescript
const dialog = ui.dialog('标题', '<p>内容</p>')
document.body.appendChild(dialog)
```

## 🔧 编辑器命令简化

### 使用cmd辅助函数

**传统方式**:
```typescript
editor.commands.execute('toggleBold')
editor.commands.execute('insertImage', { url: '...' })
editor.commands.execute('setFontSize', '16px')
```

**简化方式**:
```typescript
import { cmd } from '@ldesign/editor'

const c = cmd(editor)

c.toggle('bold')              // 切换加粗
c.insert('image', { url })    // 插入图片
c.set('fontSize', '16px')     // 设置字号
c.exec('customCommand')       // 执行自定义命令
```

## 🎨 样式简化

### CSS对象转字符串

**传统方式**:
```typescript
element.style.cssText = 'padding: 8px; margin: 16px; background: white;'
```

**简化方式**:
```typescript
import { css } from '@ldesign/editor'

element.style.cssText = css({
  padding: 8,          // 自动添加px
  margin: 16,
  background: 'white',
  borderRadius: 6
})
```

### 类名组合

**传统方式**:
```typescript
const className = ['btn']
if (isPrimary) className.push('btn-primary')
if (isDisabled) className.push('btn-disabled')
element.className = className.join(' ')
```

**简化方式**:
```typescript
import { classNames } from '@ldesign/editor'

element.className = classNames(
  'btn',
  isPrimary && 'btn-primary',
  isDisabled && 'btn-disabled'
)
```

## 🔤 字符串工具

```typescript
import { str } from '@ldesign/editor'

str.capitalize('hello')        // 'Hello'
str.kebab('fontSize')          // 'font-size'
str.camel('font-size')         // 'fontSize'
str.truncate('long text...', 10) // 'long te...'
```

## 📦 功能开关

### 细粒度控制

**启用/禁用功能**:
```typescript
import { getFeatureFlags } from '@ldesign/editor'

const features = getFeatureFlags()

// 禁用不需要的功能
features.disable('video')
features.disable('ai-translate')

// 启用需要的功能
features.enable('table')
features.enable('emoji')

// 批量操作
features.disableBatch(['video', 'audio', 'file'])
features.enableBatch(['image', 'link'])

// 分类操作
features.disableCategory(FeatureCategory.AI)
features.enableCategory(FeatureCategory.MEDIA)
```

**功能管理面板**:
```typescript
import { showFeatureManager } from '@ldesign/editor'

// 可视化管理所有功能
showFeatureManager()
```

## ⚡ 性能优化技巧

### 1. 使用预设配置

```typescript
import { lightweightConfig } from '@ldesign/editor'

// 不用写一堆配置
const editor = new Editor(lightweightConfig)
```

### 2. 按需启用功能

```typescript
const editor = await createEditor()
  .element('#editor')
  .onlyEnable([
    // 只启用真正需要的
    'bold', 'italic', 'link'
  ])
  .build()
```

### 3. 懒加载

```typescript
import { getLazyLoader } from '@ldesign/editor'

const loader = getLazyLoader()

// 注册懒加载资源
loader.register('heavy-feature', () => import('./HeavyFeature'))

// 需要时才加载
const feature = await loader.load('heavy-feature')
```

### 4. 性能监控

```typescript
import { measure } from '@ldesign/editor'

// 自动测量性能
const result = await measure('my-operation', async () => {
  // 执行操作
  return doSomething()
})
```

## 🎨 完整示例

### 博客编辑器（简洁版本）

```typescript
import {
  createEditor,
  showSettingsPanel,
  ui,
  $
} from '@ldesign/editor'

// 创建编辑器（3行）
const editor = await createEditor()
  .element('#editor')
  .formatOnly()  // 只要格式化
  .withMedia()   // + 图片链接
  .build()

// 添加设置按钮（1行）
const settingsBtn = ui.button('设置', () => showSettingsPanel(), 'settings')
$.select('.toolbar')?.appendChild(settingsBtn)

// 自动保存（3行）
let timer: any
on.input(editor.contentElement!, () => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    localStorage.setItem('content', editor.getContent())
    ui.toast('已自动保存', 'success')
  }, 3000)
})
```

### 文档编辑器（功能完整）

```typescript
import {
  createEditor,
  showFeatureManager,
  getPerformanceMonitor
} from '@ldesign/editor'

// 创建编辑器
const editor = await createEditor()
  .element('#editor')
  .fullFeatured()
  .withTable()
  .theme('light')
  .locale('zh-CN')
  .build()

// 功能管理
const manageBtn = ui.button('管理功能', showFeatureManager)

// 性能监控
const monitor = getPerformanceMonitor()
setInterval(() => {
  const metrics = monitor.getMetrics()
  console.log(`FPS: ${metrics.fps}, 内存: ${metrics.memoryUsage}MB`)
}, 10000)
```

### 最小化编辑器（极简）

```typescript
import { createLightweightEditor } from '@ldesign/editor'

// 一行代码！
const editor = await createLightweightEditor('#editor')
```

## 📊 代码对比

### 创建工具栏按钮

**优化前（30行）**:
```typescript
const button = document.createElement('button')
button.type = 'button'
button.className = 'toolbar-button'
button.title = '加粗'

const icon = document.createElement('svg')
// ... 15行SVG代码

button.appendChild(icon)

button.style.padding = '6px 10px'
button.style.border = 'none'
button.style.borderRadius = '4px'
button.style.background = 'transparent'
button.style.cursor = 'pointer'

button.addEventListener('mouseenter', () => {
  button.style.background = '#f3f4f6'
})

button.addEventListener('mouseleave', () => {
  button.style.background = 'transparent'
})

button.addEventListener('click', () => {
  editor.commands.execute('toggleBold')
})
```

**优化后（5行）**:
```typescript
import { ui, cmd } from '@ldesign/editor'

const c = cmd(editor)
const button = ui.button('加粗', () => c.toggle('bold'), 'bold')
// 样式自动应用，事件自动绑定
```

### 性能测量

**优化前（10行）**:
```typescript
const start = performance.now()
try {
  await doSomething()
  const end = performance.now()
  console.log('耗时:', end - start, 'ms')
} catch (error) {
  const end = performance.now()
  console.log('失败，耗时:', end - start, 'ms')
  throw error
}
```

**优化后（1行）**:
```typescript
import { measure } from '@ldesign/editor'

const result = await measure('operation', doSomething)
```

## 💡 最佳实践

### 1. 使用构建器模式

```typescript
// ✅ 推荐
const editor = await createEditor()
  .element('#editor')
  .lightweight()
  .build()

// ❌ 不推荐
const editor = new Editor({
  element: '#editor',
  plugins: [/* 长列表 */]
})
```

### 2. 使用简化工具

```typescript
// ✅ 推荐
import { $, ui } from '@ldesign/editor'

const btn = ui.button('保存', save)
const input = ui.input('输入', onChange)

// ❌ 不推荐
const btn = document.createElement('button')
btn.textContent = '保存'
// ... 10行配置代码
```

### 3. 使用功能开关

```typescript
// ✅ 推荐
features.disableCategory(FeatureCategory.AI)

// ❌ 不推荐
// 手动禁用每个AI功能
```

### 4. 使用性能监控

```typescript
// ✅ 推荐
const result = await measure('load', () => loadData())

// ❌ 不推荐
console.time('load')
const result = await loadData()
console.timeEnd('load')
```

## 🚀 高级技巧

### 条件功能加载

```typescript
const editor = await createEditor()
  .element('#editor')
  .lightweight()

// 根据用户权限启用功能
if (user.isPro) {
  editor.withAI(apiKey)
        .withTable()
}

await editor.build()
```

### 响应式配置

```typescript
const isMobile = window.innerWidth < 768

const editor = await createEditor()
  .element('#editor')
  .lightweight()
  .compact(isMobile)
  .showLabels(!isMobile)
  .build()
```

### 动态功能切换

```typescript
const features = getFeatureFlags()

// 切换高级功能
toggleAdvanced.addEventListener('click', () => {
  if (features.isEnabled('ai-service')) {
    features.disableCategory(FeatureCategory.AI)
    ui.toast('AI功能已禁用', 'info')
  } else {
    features.enableCategory(FeatureCategory.AI)
    ui.toast('AI功能已启用', 'success')
  }
})
```

## 📝 实用代码片段

### 快速创建表单

```typescript
import { $, ui, css } from '@ldesign/editor'

const form = $.create('div', {
  style: css({
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  })
}, [
  ui.input('标题', (v) => data.title = v),
  ui.input('作者', (v) => data.author = v),
  ui.button('提交', submit, 'check')
])
```

### 快速创建对话框

```typescript
import { ui } from '@ldesign/editor'

const content = $.create('div', {}, [
  $.create('p', { text: '确定要删除吗？' }),
  $.create('div', {
    style: css({ display: 'flex', gap: 8, justifyContent: 'flex-end' })
  }, [
    ui.button('取消', close),
    ui.button('确定', confirm)
  ])
])

const dialog = ui.dialog('确认', content)
document.body.appendChild(dialog)
```

### 批量处理

```typescript
import { Batcher } from '@ldesign/editor'

const batcher = new Batcher(async (items) => {
  // 批量处理items
  return await api.batchSave(items)
}, { maxSize: 10, maxWait: 100 })

// 自动批处理
data.forEach(item => {
  batcher.add(item).then(result => {
    console.log('处理完成:', result)
  })
})
```

## 🎯 性能优化技巧

### 1. 使用LRU缓存

```typescript
import { LRUCache } from '@ldesign/editor'

const cache = new LRUCache(100)

function expensiveOperation(key) {
  if (cache.has(key)) {
    return cache.get(key)
  }
  
  const result = doExpensiveWork(key)
  cache.set(key, result)
  return result
}
```

### 2. 使用防抖

```typescript
import { debounce } from '@ldesign/editor'

const search = debounce((query) => {
  // 只在用户停止输入300ms后执行
  performSearch(query)
}, 300)

on.input(searchInput, (e) => {
  search(e.target.value)
})
```

### 3. 使用重试

```typescript
import { retry } from '@ldesign/editor'

const data = await retry(
  () => fetch('/api/data'),
  {
    maxAttempts: 3,
    delay: 1000,
    backoff: 2,
    onRetry: (attempt, error) => {
      console.log(`重试 ${attempt}次:`, error.message)
    }
  }
)
```

## 🎨 代码行数对比

| 功能 | 传统方式 | 简化后 | 减少 |
|------|----------|--------|------|
| 创建编辑器 | ~20行 | 3-5行 | **75%** |
| 创建按钮 | ~30行 | 1-2行 | **95%** |
| DOM操作 | ~15行 | 3-5行 | **70%** |
| 性能测量 | ~10行 | 1行 | **90%** |
| 功能配置 | ~50行 | 5-10行 | **85%** |

## 📚 相关资源

- [快速参考](../../📖-优化功能快速参考.md)
- [API文档](../api/editor.md)
- [性能优化指南](./performance-optimization.md)
- [定制化指南](./customization.md)




