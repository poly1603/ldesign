import type { Deck, DeckProps } from '@deck.gl/core';
import type { GeoJsonLayer, ScatterplotLayer } from '@deck.gl/layers';
import type { Feature, FeatureCollection, GeoJsonProperties } from 'geojson';

export type ViewMode = '2d' | '3d';

export interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch?: number;
  bearing?: number;
  transitionDuration?: number;
}

export interface MapRendererOptions {
  mode?: ViewMode;
  longitude?: number;
  latitude?: number;
  zoom?: number;
  pitch?: number;
  bearing?: number;
  viewState?: Partial<ViewState>;
  autoFit?: boolean;  // 自动适配容器尺寸
}

export interface TextLabelOptions {
  pickable?: boolean;
  fontSize?: number;  // 基础字体大小，会根据 zoom 级别动态调整
  getSize?: number | ((d: any) => number);
  getAngle?: number | ((d: any) => number);
  getTextAnchor?: string | ((d: any) => string);
  getAlignmentBaseline?: string | ((d: any) => string);
  getColor?: 'auto' | number[] | ((d: any) => number[]);  // 支持 'auto' 自动计算对比色
  getBackgroundColor?: number[] | ((d: any) => number[]);
  backgroundColor?: boolean;
  backgroundPadding?: number[];
  fontFamily?: string;
  fontWeight?: string | number;
  sdf?: boolean;
  buffer?: number;
  outlineWidth?: number;
  outlineColor?: number[];
  sizeScale?: number;
  sizeMinPixels?: number;
  sizeMaxPixels?: number;
  billboard?: boolean;
  characterSet?: string;
  wordBreak?: string;
  maxWidth?: number;
  lineHeight?: number;
}

export type ColorMode = 'single' | 'gradient' | 'category' | 'custom' | 'random' | 'data';

export interface ColorScheme {
  mode: ColorMode;
  // 单色模式
  color?: number[];  
  // 渐变色模式
  startColor?: number[];
  endColor?: number[];
  // 分类色模式
  colors?: number[][];
  categoryField?: string;
  // 数据驱动模式
  dataField?: string;
  dataRange?: [number, number];
  colorStops?: Array<{ value: number; color: number[] }>;
  // 自定义函数
  customFunction?: (feature: any, index: number) => number[];
  // 通用设置
  opacity?: number;
}

export interface LayerOptions {
  id?: string;
  pickable?: boolean;
  stroked?: boolean;
  filled?: boolean;
  extruded?: boolean;
  wireframe?: boolean;
  lineWidthMinPixels?: number;
  lineWidthMaxPixels?: number;
  getLineColor?: number[] | ((feature: any) => number[]);
  getFillColor?: number[] | ((feature: any, info?: any) => number[]);
  getLineWidth?: number | ((feature: any) => number);
  getElevation?: number | ((feature: any) => number);
  elevationScale?: number;
  material?: any;
  transitions?: any;
  showLabels?: boolean;  // 是否显示标签
  labelOptions?: TextLabelOptions;  // 标签样式配置
  colorScheme?: ColorScheme;  // 颜色方案配置
}

export interface CityMarker {
  name: string;
  coordinates: [number, number];
  longitude?: number;
  latitude?: number;
  radius?: number;
  color?: number[];
}

export interface CityMarkerOptions {
  id?: string;
  pickable?: boolean;
  opacity?: number;
  stroked?: boolean;
  filled?: boolean;
  radiusScale?: number;
  radiusMinPixels?: number;
  radiusMaxPixels?: number;
  lineWidthMinPixels?: number;
  getPosition?: (d: CityMarker) => [number, number];
  getRadius?: (d: CityMarker) => number;
  getFillColor?: (d: CityMarker) => number[];
  getLineColor?: number[] | ((d: CityMarker) => number[]);
}

export interface TooltipInfo {
  object?: Feature<any, GeoJsonProperties>;
  x?: number;
  y?: number;
  coordinate?: [number, number];
}

export type DeckGLLayer = GeoJsonLayer | ScatterplotLayer;