# 导入导出功能实现文档

## 概述

导入导出功能模块为LogicFlow流程图编辑器提供了强大的多格式文件导入导出能力，支持多种主流格式的转换和批量操作。

## 🎯 核心功能

### 1. 多格式支持
- **JSON格式**: LogicFlow原生格式，完整保留所有属性
- **Draw.io格式**: 支持Draw.io XML格式的导入导出
- **BPMN 2.0格式**: 支持标准BPMN 2.0业务流程建模格式
- **Visio格式**: 支持Microsoft Visio流程图格式（计划支持）
- **图片格式**: PNG、SVG、PDF等图片导出
- **数据格式**: CSV、Excel等数据导出（计划支持）

### 2. 智能格式检测
- 自动检测文件格式
- 基于文件扩展名的格式推断
- 基于文件内容的格式验证
- 支持多种MIME类型识别

### 3. 灵活的导入选项
- **合并模式**: 将导入内容合并到当前流程图
- **替换模式**: 完全替换当前流程图内容
- **坐标偏移**: 导入时自动调整元素位置
- **ID处理**: 保留原始ID或重新生成
- **数据验证**: 导入前验证数据完整性
- **错误处理**: 严格、宽松或跳过错误的处理策略

### 4. 丰富的导出选项
- **导出范围**: 全部、选中或可见元素
- **元数据控制**: 包含或排除元数据信息
- **压缩选项**: 压缩输出以减小文件大小
- **图片选项**: 分辨率、质量、背景等设置
- **格式特定选项**: 针对不同格式的专门配置

### 5. 批量操作
- 批量导入多个文件
- 批量导出多个流程图
- 并发控制和进度跟踪
- 错误处理和恢复策略

## 🏗️ 架构设计

### 核心组件

```
ImportExportManager (核心管理器)
├── FormatParser (格式解析器接口)
│   ├── JsonParser (JSON解析器)
│   ├── DrawioParser (Draw.io解析器)
│   ├── BpmnParser (BPMN解析器)
│   └── ... (其他解析器)
├── FormatGenerator (格式生成器接口)
│   ├── JsonGenerator (JSON生成器)
│   ├── DrawioGenerator (Draw.io生成器)
│   ├── BpmnGenerator (BPMN生成器)
│   └── ... (其他生成器)
├── FormatConverter (格式转换器接口)
│   └── ... (格式转换器)
└── ImportExportPlugin (LogicFlow插件)
```

### 数据流

```
导入流程:
文件 → 格式检测 → 解析器 → 数据转换 → 映射规则 → 过滤器 → LogicFlow

导出流程:
LogicFlow → 数据提取 → 过滤器 → 映射规则 → 生成器 → 文件下载
```

## 📋 API 接口

### ImportExportManager

```typescript
class ImportExportManager {
  // 注册解析器和生成器
  registerParser(parser: FormatParser): void
  registerGenerator(generator: FormatGenerator): void
  registerConverter(converter: FormatConverter): void
  
  // 核心功能
  import(data: string | ArrayBuffer | File, options?: ImportOptions): Promise<ImportResult>
  export(data: any, options: ExportOptions): Promise<ExportResult>
  convert(data: any, sourceFormat: SupportedFormat, targetFormat: SupportedFormat): Promise<any>
  
  // 批量操作
  batchImport(files: File[], options?: ImportOptions): Promise<BatchImportResult>
  batchExport(dataList: any[], options: ExportOptions): Promise<BatchExportResult>
  
  // 工具方法
  getSupportedFormats(): FormatInfo[]
  detectFormat(data: string | ArrayBuffer | File): Promise<SupportedFormat | null>
  validateFormat(data: string | ArrayBuffer | File, format: SupportedFormat): Promise<boolean>
}
```

### ImportExportPlugin

```typescript
class ImportExportPlugin extends BasePlugin {
  // 核心功能
  importFile(file: File, options?: ImportOptions): Promise<ImportResult>
  exportData(format: SupportedFormat, options?: ExportOptions): Promise<ExportResult>
  
  // 批量操作
  batchImport(files: File[], options?: ImportOptions): Promise<BatchImportResult>
  batchExport(dataList: any[], options: ExportOptions): Promise<BatchExportResult>
  
  // 工具方法
  getSupportedFormats(): FormatInfo[]
  detectFormat(file: File): Promise<SupportedFormat | null>
}
```

## 🔧 使用示例

### 基本使用

```typescript
import { ImportExportPlugin } from './src/importexport'

// 创建插件实例
const importExportPlugin = new ImportExportPlugin({
  enabledFormats: ['json', 'drawio', 'bpmn'],
  showToolbar: true,
  enableDragImport: true
})

// 安装插件
lf.use(importExportPlugin)

// 导入文件
const file = new File([jsonData], 'flowchart.json', { type: 'application/json' })
const result = await importExportPlugin.importFile(file, {
  merge: false,
  preserveIds: true
})

// 导出数据
const exportResult = await importExportPlugin.exportData('drawio', {
  scope: 'all',
  includeMetadata: true
})
```

### 高级配置

```typescript
const plugin = new ImportExportPlugin({
  // 基本配置
  enabledFormats: ['json', 'drawio', 'bpmn', 'png', 'svg'],
  maxFileSize: 100 * 1024 * 1024, // 100MB
  
  // 默认选项
  defaultImportOptions: {
    merge: false,
    preserveIds: false,
    validate: true,
    errorHandling: 'lenient'
  },
  defaultExportOptions: {
    scope: 'all',
    includeMetadata: true,
    compress: false
  },
  
  // UI配置
  showToolbar: true,
  toolbarPosition: 'top',
  enableDragImport: true,
  enableShortcuts: true,
  
  // 自定义按钮
  customButtons: [
    {
      id: 'export-png',
      text: '导出PNG',
      format: 'png',
      action: 'export',
      defaultOptions: {
        imageOptions: {
          width: 1920,
          height: 1080,
          quality: 0.9
        }
      }
    }
  ],
  
  // 批量操作
  enableBatchOperations: true,
  
  // 缓存配置
  cache: {
    enabled: true,
    maxSize: 100,
    ttl: 30 * 60 * 1000
  }
})
```

### 自定义映射规则

```typescript
const mappingRules = [
  {
    id: 'node-text-mapping',
    name: '节点文本映射',
    sourcePath: 'properties.label',
    targetPath: 'text',
    transform: (value) => value?.toUpperCase()
  },
  {
    id: 'position-offset',
    name: '位置偏移',
    sourcePath: 'x',
    targetPath: 'x',
    transform: (value) => value + 100
  }
]

await plugin.importFile(file, {
  mappingRules,
  preserveIds: false
})
```

### 批量操作

```typescript
// 批量导入
const files = [file1, file2, file3]
const batchResult = await plugin.batchImport(files, {
  merge: true
}, {
  concurrency: 2,
  stopOnError: false,
  onProgress: (progress) => {
    console.log(`进度: ${progress.percentage}%`)
  }
})

// 批量导出
const dataList = [data1, data2, data3]
const batchExportResult = await plugin.batchExport(dataList, {
  format: 'json'
}, {
  concurrency: 3
})
```

## 🎨 UI 集成

### 工具栏

插件自动创建导入导出工具栏，包含：
- 导入按钮（支持文件选择对话框）
- 格式导出按钮组（JSON、Draw.io、BPMN等）
- 自定义按钮

### 拖拽导入

支持直接拖拽文件到画布进行导入：
- 自动格式检测
- 视觉反馈
- 批量文件处理

### 快捷键

- `Ctrl+O`: 打开导入对话框
- `Ctrl+S`: 导出为JSON格式
- `Ctrl+Shift+E`: 导出为PNG图片

## 📊 性能优化

### 1. 异步处理
- 所有导入导出操作都是异步的
- 支持进度回调和取消操作
- 大文件分块处理

### 2. 内存管理
- 流式处理大文件
- 及时释放临时对象
- 智能缓存策略

### 3. 并发控制
- 批量操作的并发限制
- 资源池管理
- 错误恢复机制

## 🔍 错误处理

### 错误类型
- **解析错误**: 文件格式不正确或损坏
- **验证错误**: 数据结构不符合要求
- **转换错误**: 格式转换过程中的错误
- **网络错误**: 文件下载或上传失败

### 错误处理策略
- **严格模式**: 遇到任何错误立即停止
- **宽松模式**: 记录错误但继续处理
- **跳过模式**: 跳过有问题的项目

### 错误恢复
- 自动重试机制
- 部分成功处理
- 详细的错误报告

## 🧪 测试

### 单元测试
- 解析器和生成器测试
- 格式转换测试
- 错误处理测试

### 集成测试
- 完整导入导出流程测试
- 批量操作测试
- UI交互测试

### 性能测试
- 大文件处理测试
- 并发操作测试
- 内存使用测试

## 🚀 扩展性

### 添加新格式支持

1. 实现FormatParser接口
2. 实现FormatGenerator接口
3. 注册到ImportExportManager
4. 更新配置和文档

### 自定义转换器

```typescript
class CustomConverter implements FormatConverter {
  name = 'CustomConverter'
  sourceFormat = 'custom1'
  targetFormat = 'custom2'
  
  async convert(data: any, options?: ConvertOptions): Promise<any> {
    // 实现转换逻辑
  }
  
  getConversionQuality(): ConversionQuality {
    return {
      dataIntegrity: 0.95,
      visualFidelity: 0.90,
      functionalCompatibility: 0.85,
      overallQuality: 0.90
    }
  }
}
```

## 📈 未来规划

### 短期目标
- 完善Visio格式支持
- 添加Excel/CSV数据导入导出
- 优化大文件处理性能

### 中期目标
- 云端文件存储集成
- 实时协作导入导出
- 更多图片格式支持

### 长期目标
- AI辅助格式转换
- 智能数据映射
- 版本控制集成

## 📝 总结

导入导出功能模块为LogicFlow编辑器提供了企业级的文件处理能力，支持多种格式、批量操作、智能转换等高级功能。通过模块化设计和插件架构，可以轻松扩展新的格式支持，满足不同用户的需求。

该模块的实现大大提升了编辑器的实用性和兼容性，使用户能够在不同的工具和平台之间无缝迁移流程图数据。
