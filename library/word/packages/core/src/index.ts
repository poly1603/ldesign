/**
 * Word Viewer Core 核心包入口
 */

import { WordViewer } from './core/WordViewer';
import './styles/default.css';

// 导出核心类
export { WordViewer };

// 导出类型
export type {
  ViewerOptions,
  DocumentSource,
  SearchResult,
  TextFormat,
  DocumentInfo,
  PageInfo,
  ExportOptions,
  InsertImageOptions,
  EventType,
  EventCallback,
  EditState,
  SelectionRange,
  ErrorInfo,
  LoadProgress,
  ToolbarConfig,
  ToolbarItem,
  CustomAction,
} from './core/types';

// 导出常量
export { DEFAULT_OPTIONS, SUPPORTED_FILE_TYPES, ZOOM_RANGE } from './core/constants';

// 默认导出
export default WordViewer;



