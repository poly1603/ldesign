# 流程图模板系统

流程图模板系统为 @ldesign/flowchart 提供了完整的模板管理功能，包括内置模板、自定义模板的创建、保存、加载和管理。

## ✨ 主要特性

- **🎯 内置模板**：提供常用的审批流程模板（请假、报销、采购等）
- **💾 模板管理**：支持模板的保存、加载、删除、导入、导出
- **🔍 智能过滤**：支持按分类、标签、关键词过滤模板
- **📊 排序功能**：支持按名称、创建时间、节点数量等排序
- **💿 本地存储**：自动保存自定义模板到本地存储
- **🎨 用户界面**：提供友好的模板选择器和保存对话框
- **🔧 工具栏集成**：无缝集成到流程图编辑器工具栏
- **📝 事件系统**：完整的事件通知机制

## 🚀 快速开始

### 基本使用

```typescript
import { FlowchartEditor } from '@ldesign/flowchart'

// 创建编辑器实例，启用模板功能
const editor = new FlowchartEditor({
  container: '#flowchart-container',
  toolbar: {
    tools: [
      'template-library',  // 模板库按钮
      'template-save',     // 保存模板按钮
      // ... 其他工具
    ]
  }
})

// 获取模板管理器
const templateManager = editor.getTemplateManager()
```

### 独立使用模板管理器

```typescript
import { TemplateManager } from '@ldesign/flowchart'

// 创建模板管理器
const templateManager = new TemplateManager({
  storage: {
    type: 'localStorage',
    key: 'my-templates'
  },
  builtInTemplates: {
    enabled: true,
    categories: ['approval', 'workflow']
  }
})

// 初始化
await templateManager.initialize()
```

## 📚 API 参考

### TemplateManager

#### 构造函数

```typescript
new TemplateManager(config?: TemplateManagerConfig)
```

**配置选项：**

```typescript
interface TemplateManagerConfig {
  storage?: {
    type: 'localStorage' | 'indexedDB' | 'memory'
    key?: string
    maxSize?: number
  }
  builtInTemplates?: {
    enabled: boolean
    categories?: TemplateCategory[]
  }
  cache?: {
    enabled: boolean
    maxSize: number
    ttl: number
  }
}
```

#### 主要方法

##### 模板管理

```typescript
// 添加模板
await templateManager.addTemplate({
  name: 'my-template',
  displayName: '我的模板',
  description: '模板描述',
  category: 'custom',
  version: '1.0.0',
  isBuiltIn: false,
  data: { nodes: [], edges: [] }
})

// 更新模板
await templateManager.updateTemplate(templateId, {
  displayName: '新的显示名称',
  description: '新的描述'
})

// 删除模板
await templateManager.deleteTemplate(templateId)

// 获取模板
const template = templateManager.getTemplate(templateId)
```

##### 模板查询

```typescript
// 获取所有模板
const templates = templateManager.getAllTemplates()

// 获取模板元数据
const metadata = templateManager.getTemplateMetadata()

// 过滤模板
const filtered = templateManager.filterTemplates({
  category: 'approval',
  tags: ['请假'],
  search: '审批',
  isBuiltIn: true
})

// 排序模板
const sorted = templateManager.sortTemplates(templates, {
  field: 'displayName',
  order: 'asc'
})
```

##### 导入导出

```typescript
// 导出模板
const exportData = templateManager.exportTemplates([templateId], {
  format: 'json',
  pretty: true,
  includeMetadata: true
})

// 导入模板
const importedIds = await templateManager.importTemplates(exportData, {
  overwrite: false,
  validateData: true,
  generateId: true
})
```

### FlowchartEditor 模板方法

```typescript
// 获取模板管理器
const templateManager = editor.getTemplateManager()

// 获取模板元数据
const templates = editor.getTemplateMetadata()

// 加载模板
editor.loadTemplate(templateId)

// 保存当前流程图为模板
await editor.saveAsTemplate({
  name: 'my-template',
  displayName: '我的模板',
  description: '模板描述',
  category: 'custom',
  tags: ['自定义']
})

// 显示模板选择器
editor.showTemplateSelector()

// 显示保存模板对话框
editor.showSaveTemplateDialog()
```

## 🎨 内置模板

### 请假审批流程

- **模板ID**: `builtin_leave_approval`
- **显示名称**: 请假审批流程
- **描述**: 标准的请假审批流程，包含申请提交、直属领导审批、HR审批等环节
- **节点数量**: 6个节点，6条连线
- **适用场景**: 员工请假申请的审批流程

### 报销审批流程

- **模板ID**: `builtin_expense_approval`
- **显示名称**: 报销审批流程
- **描述**: 标准的费用报销审批流程，包含申请提交、部门审批、财务审批等环节
- **节点数量**: 7个节点，7条连线
- **适用场景**: 费用报销申请的审批流程

### 采购审批流程

- **模板ID**: `builtin_purchase_approval`
- **显示名称**: 采购审批流程
- **描述**: 标准的采购申请审批流程，包含需求提交、部门审批、采购执行等环节
- **节点数量**: 6个节点，5条连线
- **适用场景**: 采购申请的审批流程

## 🔧 工具栏集成

模板系统提供了以下工具栏按钮：

- **`template-library`**: 打开模板库，浏览和加载模板
- **`template-save`**: 保存当前流程图为模板
- **`template-load`**: 快速加载模板（同 template-library）
- **`template-new`**: 创建新模板（同 template-save）

```typescript
const editor = new FlowchartEditor({
  toolbar: {
    tools: [
      'template-library',
      'template-save',
      // ... 其他工具
    ]
  }
})
```

## 📝 事件系统

模板系统支持以下事件：

```typescript
// 监听模板事件
templateManager.on('template:add', (template) => {
  console.log('模板已添加:', template.displayName)
})

templateManager.on('template:update', (template, oldTemplate) => {
  console.log('模板已更新:', template.displayName)
})

templateManager.on('template:delete', (templateId) => {
  console.log('模板已删除:', templateId)
})

templateManager.on('template:load', (template) => {
  console.log('模板已加载:', template.displayName)
})

templateManager.on('template:save', (template) => {
  console.log('模板已保存:', template.displayName)
})

templateManager.on('template:import', (templates) => {
  console.log('模板已导入:', templates.length, '个')
})

templateManager.on('template:export', (templates) => {
  console.log('模板已导出:', templates.length, '个')
})
```

## 💾 数据格式

### 模板数据结构

```typescript
interface FlowchartTemplate {
  id: string                    // 模板唯一ID
  name: string                  // 模板名称
  displayName: string           // 显示名称
  description: string           // 模板描述
  category: TemplateCategory    // 模板分类
  version: string               // 模板版本
  author?: string               // 作者
  tags?: string[]               // 标签
  preview?: string              // 预览图URL
  
  // 模板数据
  data: FlowchartData           // 流程图数据
  
  // 元数据
  isBuiltIn: boolean            // 是否为内置模板
  isDefault?: boolean           // 是否为默认模板
  createdAt: string             // 创建时间
  updatedAt: string             // 更新时间
}
```

### 模板分类

```typescript
type TemplateCategory =
  | 'approval'      // 审批流程
  | 'workflow'      // 工作流程
  | 'business'      // 业务流程
  | 'custom'        // 自定义
  | 'other'         // 其他
```

## 🧪 测试

模板系统包含完整的单元测试：

```bash
# 运行模板系统测试
pnpm test src/__tests__/templates

# 运行特定测试文件
pnpm test src/__tests__/templates/TemplateManager.test.ts
pnpm test src/__tests__/templates/builtInTemplates.test.ts
```

测试覆盖了以下功能：
- ✅ 模板管理器初始化
- ✅ 模板的增删改查
- ✅ 模板过滤和排序
- ✅ 模板导入导出
- ✅ 事件系统
- ✅ 内置模板验证
- ✅ 数据格式验证

## 📖 使用示例

查看 `examples/template-simple-demo.html` 了解完整的使用示例。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进模板系统！
