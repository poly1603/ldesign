/**
 * 绘制工具相关类型定义
 * 定义地图绘制功能的所有类型和接口
 */

import type { Coordinate } from 'ol/coordinate';
import type { Feature } from 'ol';
import type { Geometry, Point, LineString, Polygon, Circle } from 'ol/geom';
import type { StyleLike } from 'ol/style/Style';

/**
 * 绘制类型枚举
 */
export enum DrawType {
  /** 点 */
  POINT = 'Point',
  /** 线 */
  LINE = 'LineString',
  /** 多边形 */
  POLYGON = 'Polygon',
  /** 圆形 */
  CIRCLE = 'Circle',
  /** 矩形 */
  RECTANGLE = 'Rectangle',
  /** 自由绘制 */
  FREE_HAND = 'FreeHand',
  /** 箭头 */
  ARROW = 'Arrow',
  /** 文本 */
  TEXT = 'Text'
}

/**
 * 绘制模式枚举
 */
export enum DrawMode {
  /** 绘制模式 */
  DRAW = 'draw',
  /** 编辑模式 */
  EDIT = 'edit',
  /** 删除模式 */
  DELETE = 'delete',
  /** 选择模式 */
  SELECT = 'select',
  /** 测量模式 */
  MEASURE = 'measure'
}

/**
 * 绘制配置接口
 */
export interface DrawConfig {
  /** 绘制类型 */
  type: DrawType;

  /** 绘制样式 */
  style?: DrawStyle;

  /** 是否启用捕捉 */
  snap?: boolean;

  /** 捕捉容差（像素） */
  snapTolerance?: number;

  /** 最大点数限制 */
  maxPoints?: number;

  /** 最小点数限制 */
  minPoints?: number;

  /** 是否自由绘制 */
  freehand?: boolean;

  /** 自由绘制条件 */
  freehandCondition?: (event: any) => boolean;

  /** 完成条件 */
  finishCondition?: (event: any) => boolean;

  /** 几何图形函数 */
  geometryFunction?: (coordinates: Coordinate[], geometry?: Geometry) => Geometry;

  /** 是否显示测量信息 */
  showMeasurement?: boolean;

  /** 测量单位 */
  measurementUnit?: 'metric' | 'imperial';

  /** 自定义属性 */
  properties?: Record<string, any>;
}

/**
 * 绘制样式配置
 */
export interface DrawStyle {
  /** 填充样式 */
  fill?: {
    /** 填充颜色 */
    color?: string;
    /** 填充透明度 */
    opacity?: number;
  };

  /** 描边样式 */
  stroke?: {
    /** 描边颜色 */
    color?: string;
    /** 描边宽度 */
    width?: number;
    /** 描边透明度 */
    opacity?: number;
    /** 线条样式 */
    lineDash?: number[];
    /** 线条端点样式 */
    lineCap?: 'butt' | 'round' | 'square';
    /** 线条连接样式 */
    lineJoin?: 'bevel' | 'round' | 'miter';
  };

  /** 点样式 */
  point?: {
    /** 点半径 */
    radius?: number;
    /** 点颜色 */
    color?: string;
    /** 点透明度 */
    opacity?: number;
    /** 点图标 */
    icon?: {
      src: string;
      size?: [number, number];
      anchor?: [number, number];
    };
  };

  /** 文本样式 */
  text?: {
    /** 文本内容 */
    text?: string;
    /** 字体 */
    font?: string;
    /** 文本颜色 */
    color?: string;
    /** 文本描边 */
    stroke?: {
      color?: string;
      width?: number;
    };
    /** 文本偏移 */
    offset?: [number, number];
    /** 文本对齐 */
    textAlign?: 'left' | 'center' | 'right';
    /** 文本基线 */
    textBaseline?: 'top' | 'middle' | 'bottom';
  };

  /** 选中状态样式 */
  selected?: Partial<DrawStyle>;

  /** 悬停状态样式 */
  hover?: Partial<DrawStyle>;
}

/**
 * 绘制要素配置
 */
export interface DrawFeatureConfig {
  /** 要素 ID */
  id: string;

  /** 要素几何图形 */
  geometry: Geometry;

  /** 要素样式 */
  style?: StyleLike;

  /** 要素属性 */
  properties?: Record<string, any>;

  /** 要素标签 */
  label?: string;

  /** 是否可编辑 */
  editable?: boolean;

  /** 是否可删除 */
  deletable?: boolean;

  /** 是否可选择 */
  selectable?: boolean;
}

/**
 * 测量结果接口
 */
export interface MeasurementResult {
  /** 测量类型 */
  type: 'length' | 'area' | 'angle';

  /** 测量值 */
  value: number;

  /** 测量单位 */
  unit: string;

  /** 格式化后的文本 */
  text: string;

  /** 测量坐标 */
  coordinates: Coordinate[];

  /** 测量几何图形 */
  geometry: Geometry;
}

/**
 * 编辑配置接口
 */
export interface EditConfig {
  /** 编辑样式 */
  style?: DrawStyle;

  /** 顶点样式 */
  vertexStyle?: DrawStyle;

  /** 是否显示顶点 */
  showVertices?: boolean;

  /** 顶点半径 */
  vertexRadius?: number;

  /** 是否允许添加顶点 */
  insertVertexCondition?: (event: any) => boolean;

  /** 是否允许删除顶点 */
  deleteCondition?: (event: any) => boolean;

  /** 修改条件 */
  modifyCondition?: (event: any) => boolean;
}

/**
 * 绘制状态
 */
export interface DrawState {
  /** 当前绘制模式 */
  mode: DrawMode;

  /** 当前绘制类型 */
  type?: DrawType;

  /** 是否正在绘制 */
  drawing: boolean;

  /** 是否正在编辑 */
  editing: boolean;

  /** 当前绘制的要素 */
  currentFeature?: Feature<Geometry>;

  /** 选中的要素 */
  selectedFeatures: Feature<Geometry>[];

  /** 绘制的所有要素 */
  features: Feature<Geometry>[];
}

/**
 * 绘制操作选项
 */
export interface DrawOperationOptions {
  /** 是否静默执行 */
  silent?: boolean;

  /** 是否清除之前的绘制 */
  clear?: boolean;

  /** 自定义样式 */
  style?: DrawStyle;
}

/**
 * 绘制工具接口
 */
export interface IDrawingTools {
  /** 开始绘制 */
  startDraw(type: DrawType, config?: DrawConfig): void;

  /** 停止绘制 */
  stopDraw(): void;

  /** 开始编辑 */
  startEdit(featureId?: string, config?: EditConfig): void;

  /** 停止编辑 */
  stopEdit(): void;

  /** 删除要素 */
  deleteFeature(featureId: string): boolean;

  /** 删除选中的要素 */
  deleteSelected(): boolean;

  /** 清空所有绘制 */
  clear(): void;

  /** 获取绘制状态 */
  getState(): DrawState;

  /** 获取所有要素 */
  getFeatures(): Feature<Geometry>[];

  /** 获取要素 */
  getFeature(id: string): Feature<Geometry> | null;

  /** 选择要素 */
  selectFeature(id: string): void;

  /** 取消选择要素 */
  deselectFeature(id: string): void;

  /** 取消选择所有要素 */
  deselectAll(): void;

  /** 设置绘制样式 */
  setDrawStyle(style: DrawStyle): void;

  /** 设置编辑样式 */
  setEditStyle(style: DrawStyle): void;

  /** 导出绘制数据 */
  export(format?: 'geojson' | 'wkt' | 'kml'): string;

  /** 导入绘制数据 */
  import(data: string, format?: 'geojson' | 'wkt' | 'kml'): void;

  /** 撤销操作 */
  undo(): boolean;

  /** 重做操作 */
  redo(): boolean;

  /** 测量长度 */
  measureLength(coordinates: Coordinate[]): MeasurementResult;

  /** 测量面积 */
  measureArea(coordinates: Coordinate[]): MeasurementResult;

  /** 测量角度 */
  measureAngle(coordinates: Coordinate[]): MeasurementResult;
}

/**
 * 绘制配置接口（新增）
 */
export interface DrawingConfig {
  /** 绘制类型 */
  type: DrawType;
  /** 绘制样式 */
  style?: StyleLike;
  /** 是否启用捕捉 */
  enableSnap?: boolean;
  /** 捕捉容差 */
  snapTolerance?: number;
  /** 最大点数 */
  maxPoints?: number;
  /** 最小点数 */
  minPoints?: number;
}

/**
 * 绘制状态接口
 */
export interface DrawingState {
  /** 是否激活 */
  isActive: boolean;
  /** 当前绘制类型 */
  currentDrawType: DrawType;
  /** 当前模式 */
  currentMode: DrawMode;
  /** 要素数量 */
  featureCount: number;
  /** 要素ID列表 */
  features: string[];
}

/**
 * 绘制选项接口
 */
export interface DrawingOptions {
  /** 自定义样式 */
  style?: StyleLike;
  /** 是否启用捕捉 */
  enableSnap?: boolean;
  /** 捕捉容差 */
  snapTolerance?: number;
  /** 最大点数 */
  maxPoints?: number;
  /** 最小点数 */
  minPoints?: number;
}

/**
 * 绘制事件数据接口
 */
export interface DrawingEventData {
  /** 事件类型 */
  type: string;
  /** 绘制类型 */
  drawType?: DrawType;
  /** 相关要素 */
  feature?: Feature;
  /** 要素ID */
  featureId?: string;
  /** 要素列表 */
  features?: Feature[];
  /** 模式 */
  mode?: DrawMode;
  /** 时间戳 */
  timestamp: number;
}

/**
 * 绘制工具接口（新增）
 */
export interface IDrawingTools {
  /** 开始绘制 */
  startDrawing(type: DrawType, options?: DrawingOptions): void;

  /** 停止绘制 */
  stopDrawing(): void;

  /** 启用编辑模式 */
  enableEdit(): void;

  /** 清空所有绘制内容 */
  clear(): void;

  /** 删除指定要素 */
  removeFeature(featureId: string): boolean;

  /** 获取所有要素 */
  getFeatures(): Feature[];

  /** 获取指定要素 */
  getFeature(featureId: string): Feature | null;

  /** 获取当前状态 */
  getState(): DrawingState;

  /** 添加事件监听器 */
  addEventListener(event: string, listener: Function): void;

  /** 移除事件监听器 */
  removeEventListener(event: string, listener: Function): void;

  /** 销毁绘制工具 */
  destroy(): void;
}
