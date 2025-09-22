/**
 * 核心模块导出
 */

export { Player, createPlayer } from './Player';
export { EventManager } from './EventManager';
export { StateManager } from './StateManager';
export { BasePlugin } from './BasePlugin';
export { UIPlugin } from './UIPlugin';
export { Plugin } from './Plugin';
export { PluginManager, createPluginManager } from './PluginManager';
export { ThemeManager, createThemeManager } from './ThemeManager';

// 重新导出类型
export type {
  IPlayer,
  PlayerConfig,
  PlayerState,
  PlayerEvents,
  Quality,
  MediaError
} from '../types';

export type {
  IPlugin,
  PluginConfig,
  PluginLifecycle,
  PluginType,
  PluginDependency
} from '../types/plugins';

export type {
  EventHandler,
  EventMiddleware,
  EventFilter,
  EventTransformer
} from '../types/events';
