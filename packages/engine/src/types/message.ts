/**
 * 消息系统类型定义
 * 从消息模块导出的类型定义
 */

// 导出消息管理器配置类型
export type { MessageManagerConfig } from '../message/message-manager'

// 重新导出消息系统的所有类型
export type {
  MessageAccessibility,
  MessageAnimation,
  MessageAnimationController,
  MessageAPI,
  MessageConfig,
  MessageConfigBuilder,
  MessageContainer,
  MessageErrorHandler,
  MessageEvents,
  MessageFactory,
  MessageFilter,
  MessageGlobalConfig,
  MessageI18n,
  MessageInstance,
  MessageLifecycleHooks,
  MessageMiddleware,
  MessagePerformance,
  MessagePlugin,
  MessagePosition,
  MessagePositionManager,
  MessageQueue,
  MessageRenderer,
  MessageService,
  MessageStats,
  MessageStorage,
  MessageTheme,
  MessageThemeManager,
  MessageTransformer,
  MessageType,
  MessageValidator,
} from '../message/types'
