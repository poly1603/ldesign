# 🚀 流程图节点渲染优化功能

本次优化主要解决了流程图中节点渲染的多个核心问题，提供了智能化的布局检测、防重叠算法和丰富的配置选项。

## ✨ 核心功能

### 1. 🧠 智能布局检测 (LayoutDetectionService)

自动检测流程图是横向还是纵向布局，并提供智能建议：

```typescript
import { layoutDetectionService } from './services/LayoutDetectionService'

// 自动检测布局方向
const analysis = layoutDetectionService.detectLayout(flowchartData)
console.log(`检测到${analysis.direction}布局，置信度: ${analysis.confidence}`)

// 获取优化建议
const suggestions = layoutDetectionService.getLayoutSuggestions(analysis)
```

**功能特点：**
- 🎯 自动分析节点分布和连线方向
- 📊 提供置信度评分 (0-1)
- 🔄 支持横向、纵向、混合布局检测
- 💡 智能生成锚点位置建议
- 📏 推荐合适的节点间距

### 2. 🎨 节点渲染优化器 (NodeRenderOptimizer)

解决图标和文字重叠问题，提供智能布局调整：

```typescript
import { nodeRenderOptimizer } from './services/NodeRenderOptimizer'

// 计算优化后的布局
const layout = nodeRenderOptimizer.calculateOptimalLayout(
  '开始节点', 
  'start', 
  customConfig, 
  'horizontal'
)

// 检测和修复重叠
const fixed = nodeRenderOptimizer.detectAndFixOverlap(iconBounds, textBounds, nodeRadius)
```

**功能特点：**
- 🔧 智能文本测量和换行
- 📐 防重叠算法
- 🎛️ 多种布局策略 (垂直、水平、覆盖)
- 📏 自适应尺寸调整
- 🎨 生成自适应样式

### 3. 🔗 增强连线配置 (EdgeConfigService)

为连线提供丰富的配置选项：

```typescript
import { edgeConfigService } from './services/EdgeConfigService'

// 创建条件分支连线
const conditionalEdge = edgeConfigService.createConditionalEdge(
  'approved == true',
  '审批通过',
  1,
  true
)

// 创建高优先级连线
const highPriorityEdge = edgeConfigService.createHighPriorityEdge()

// 创建数据流连线
const dataFlowEdge = edgeConfigService.createDataFlowEdge('high')
```

**功能特点：**
- 🎨 丰富的样式配置 (颜色、宽度、虚线样式)
- 🏹 多种箭头类型 (简单、实心、菱形、圆形)
- 🏷️ 灵活的标签配置 (位置、背景、边框)
- 💫 流向动画指示 (点状、箭头、脉冲、虚线)
- 📊 数据流量显示
- 🎯 条件分支支持
- 🛠️ 多种路径类型 (直线、折线、贝塞尔曲线)

### 4. ⚙️ 增强节点配置 (NodeConfigService)

为节点提供完整的配置体系：

```typescript
import { nodeConfigService } from './services/NodeConfigService'

// 获取默认配置
const defaultConfig = nodeConfigService.getDefaultConfig('approval', 'horizontal')

// 创建条件节点
const conditionalNode = nodeConfigService.createConditionalNode(
  'age > 18',
  { x: 200, y: 300 }
)

// 创建审批节点
const approvalNode = nodeConfigService.createApprovalNode(
  '经理审批',
  { x: 400, y: 300 },
  24 // 24小时时限
)
```

**功能特点：**
- 🎨 完整的样式配置 (填充、边框、渐变、阴影)
- ✏️ 丰富的文本配置 (字体、颜色、对齐、多行)
- 🏷️ 灵活的图标配置 (类型、大小、位置、动画)
- 📐 智能布局配置 (策略、间距、对齐、自适应)
- ⚡ 交互行为配置 (拖拽、调整、连接、编辑)
- 🔗 锚点配置 (位置、样式、标签)

### 5. 🎛️ 增强属性面板 (EnhancedPropertyPanel)

提供直观的界面来配置所有选项：

**功能特点：**
- 🎯 全局流程图设置 (布局方向、主题)
- 🏷️ 基础属性编辑 (ID、类型、文本、位置)
- 🎨 样式配置 (颜色、尺寸、透明度)
- 📐 布局设置 (策略、间距、对齐)
- ⚡ 行为配置 (交互、连接、编辑权限)
- 🔗 连线高级配置 (样式、流向、条件)
- ⚙️ 快捷操作 (智能排列、优化布局、重置)

## 🔧 优化的节点实现

### StartNode 和 EndNode 增强

- ✅ 集成布局检测服务
- ✅ 自动调整锚点位置
- ✅ 防重叠图标文字渲染
- ✅ 支持手动设置布局方向
- ✅ 调试模式显示布局方向

```typescript
// 手动设置布局方向
startNode.setLayoutDirection('vertical')

// 获取当前布局方向
const direction = startNode.getLayoutDirection()
```

## 📋 使用示例

### 基础使用

```typescript
import { 
  layoutDetectionService,
  nodeRenderOptimizer,
  edgeConfigService,
  nodeConfigService
} from '@ldesign/flowchart/services'

// 1. 检测布局
const layoutAnalysis = layoutDetectionService.detectLayout(flowchartData)

// 2. 优化节点渲染
const nodeLayout = nodeRenderOptimizer.calculateOptimalLayout(
  '审批节点',
  'approval',
  undefined,
  layoutAnalysis.direction
)

// 3. 配置连线
const edgeConfig = edgeConfigService.createConditionalEdge(
  'approved == true',
  '通过',
  1,
  true
)

// 4. 配置节点
const nodeConfig = nodeConfigService.createApprovalNode(
  '部门经理',
  { x: 300, y: 200 },
  48
)
```

### 高级配置

```typescript
// 创建高度定制的节点配置
const customNodeConfig = nodeConfigService.mergeConfigs(
  nodeConfigService.getDefaultConfig('process'),
  {
    style: {
      fill: '#e6f7ff',
      stroke: '#1890ff',
      strokeWidth: 3,
      gradient: {
        type: 'linear',
        colors: [
          { offset: 0, color: '#e6f7ff' },
          { offset: 1, color: '#bae0ff' }
        ]
      }
    },
    layout: {
      strategy: 'vertical',
      iconTextSpacing: 12,
      autoResize: true,
      preventOverlap: true
    },
    behavior: {
      draggable: true,
      hoverable: true,
      hoverScale: 1.1
    }
  }
)
```

## 🎨 主题支持

所有服务都支持主题切换：

```typescript
// 应用主题到节点配置
const themedNodeConfig = nodeConfigService.applyTheme(nodeConfig, 'dark')

// 应用主题到连线配置
const themedEdgeConfig = edgeConfigService.applyTheme(edgeConfig, 'dark')
```

支持的主题：
- 🌞 `light` - 浅色主题
- 🌙 `dark` - 深色主题  
- 💙 `blue` - 蓝色主题

## 🚀 性能优化

- 📊 智能文本测量缓存
- 🔄 批量DOM更新
- ⚡ 防抖和节流优化
- 🎯 按需渲染
- 💾 配置验证和错误处理

## 📝 配置验证

所有服务都提供配置验证：

```typescript
// 验证节点配置
const nodeValidation = nodeConfigService.validateConfig(nodeConfig)
if (!nodeValidation.valid) {
  console.error('节点配置错误:', nodeValidation.errors)
}

// 验证连线配置
const edgeValidation = edgeConfigService.validateConfig(edgeConfig)
if (!edgeValidation.valid) {
  console.error('连线配置错误:', edgeValidation.errors)
}
```

## 🎯 核心解决问题

1. **✅ 图标文字重叠** - 通过智能布局算法完全解决
2. **✅ 布局方向检测** - 自动识别并提供手动设置选项  
3. **✅ 锚点位置优化** - 根据布局方向自动调整
4. **✅ 连线配置受限** - 提供丰富的样式和行为配置
5. **✅ 节点配置不足** - 完整的配置体系
6. **✅ 属性面板功能简单** - 增强的多标签页界面
7. **✅ 渲染性能问题** - 多项性能优化措施

## ✨ 已实现扩展功能

### 1. ✅ 智能拖拽与对齐系统 (DragGuideService)
- **✅ 拖动指示线** - 节点拖拽时显示参考线和距离提示
- **✅ 智能吸附对齐** - 自动吸附到网格、其他节点或画布边缘
- **✅ 多节点对齐** - 批量选择节点进行左对齐、右对齐、居中等操作
- **✅ 实时测量** - 显示节点间距离和角度信息

### 2. ✅ AI智能布局优化 (AILayoutService)
- **✅ 自动布局分析** - AI分析流程逻辑，推荐最佳布局方案
- **✅ 智能节点排列** - 根据业务逻辑自动优化节点位置和间距
- **✅ 布局模板推荐** - 基于流程类型推荐标准化布局模板
- **✅ 性能优化建议** - AI检测布局问题并提供优化建议

### 3. ✅ 移动端与多主题支持 (MobileAdapterService & EnhancedThemeService)
- **✅ 响应式设计** - 适配手机、平板等不同屏幕尺寸
- **✅ 触控优化** - 手势操作、双指缩放、长按菜单
- **✅ 丰富主题系统** - 支持企业定制主题、节日主题、行业专用主题
- **✅ 无障碍访问** - 支持屏幕阅读器、键盘导航、高对比度模式

---

**总结：** 本次优化从根本上解决了流程图节点渲染的核心问题，提供了完整的智能化解决方案，大幅提升了用户体验和功能丰富度。
