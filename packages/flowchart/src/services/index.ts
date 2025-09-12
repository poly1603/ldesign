/**
 * 流程图优化与扩展服务入口
 * 
 * 导出所有优化服务、扩展功能和工具
 */

// 布局检测服务
export {
  LayoutDetectionService,
  layoutDetectionService,
  type LayoutDirection,
  type LayoutAnalysis,
  type AnchorPosition
} from './LayoutDetectionService'

// 节点渲染优化器
export {
  NodeRenderOptimizer,
  nodeRenderOptimizer,
  type NodeLayout,
  type TextMeasurement,
  type NodeRenderConfig
} from './NodeRenderOptimizer'

// 连线配置服务
export {
  EdgeConfigService,
  edgeConfigService,
  type EdgeStyleConfig,
  type EdgeLabelConfig,
  type EdgeArrowConfig,
  type EdgeBehaviorConfig,
  type EdgeFlowConfig,
  type CompleteEdgeConfig
} from './EdgeConfigService'

// 节点配置服务
export {
  NodeConfigService,
  nodeConfigService,
  type NodeStyleConfig,
  type NodeTextConfig,
  type NodeIconConfig,
  type NodeLayoutConfig,
  type NodeBehaviorConfig,
  type NodeAnchorConfig,
  type CompleteNodeConfig
} from './NodeConfigService'

// 智能拖拽与对齐服务
export {
  DragGuideService,
  dragGuideService,
  type GuideLine,
  type AlignmentReference,
  type SnapResult,
  type MeasurementInfo,
  type MultiAlignOptions,
  type DragGuideConfig
} from './DragGuideService'

// AI智能布局优化服务
export {
  AILayoutService,
  aiLayoutService,
  type LayoutTemplate,
  type LayoutSuggestion,
  type PerformanceAnalysis,
  type LayoutIssue,
  type PerformanceOptimization,
  type SmartArrangementOptions,
  type ProcessTypeRecognition
} from './AILayoutService'

// 移动端适配服务
export {
  MobileAdapterService,
  mobileAdapterService,
  type DeviceType,
  type ScreenOrientation,
  type TouchGesture,
  type MobileConfig,
  type ViewportInfo,
  type ResponsiveLayoutResult,
  type GestureRecognitionResult
} from './MobileAdapterService'

// 增强主题服务
export {
  EnhancedThemeService,
  enhancedThemeService,
  type ThemeColors,
  type NodeThemeStyle,
  type EdgeThemeStyle,
  type CanvasThemeStyle,
  type UIThemeStyle,
  type Theme,
  type ThemeConfig,
  type ThemeApplicationResult
} from './EnhancedThemeService'
