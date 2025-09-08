/**
 * 支持的目标框架类型
 */
export type TargetFramework = 'vue2' | 'vue3' | 'react' | 'lit' | 'angular' | 'svelte';

/**
 * 图标尺寸预设
 */
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | string | number;

/**
 * 颜色主题配置
 */
export interface ColorTheme {
  /** 主色调 */
  primary?: string;
  /** 次要色调 */
  secondary?: string;
  /** 成功状态色 */
  success?: string;
  /** 警告状态色 */
  warning?: string;
  /** 错误状态色 */
  error?: string;
  /** 信息状态色 */
  info?: string;
  /** 自定义颜色映射 */
  custom?: Record<string, string>;
}

/**
 * 尺寸预设配置
 */
export interface SizePresets {
  xs?: string | number;
  sm?: string | number;
  md?: string | number;
  lg?: string | number;
  xl?: string | number;
}

/**
 * 高级功能配置
 */
export interface AdvancedFeatures {
  /** 是否支持动画 */
  animation?: boolean;
  /** 是否支持主题切换 */
  theming?: boolean;
  /** 是否支持 RTL */
  rtl?: boolean;
  /** 是否生成预览文档 */
  preview?: boolean;
  /** 是否生成类型定义文件 */
  dts?: boolean;
  /** 是否支持树摇优化 */
  treeshaking?: boolean;
}

/**
 * 组件属性配置
 */
export interface ComponentProps {
  /** 默认尺寸 */
  defaultSize?: IconSize;
  /** 默认颜色 */
  defaultColor?: string;
  /** 是否支持自定义类名 */
  customClass?: boolean;
  /** 是否支持自定义样式 */
  customStyle?: boolean;
  /** 额外的 props */
  extraProps?: Record<string, any>;
}

/**
 * 图标配置接口
 */
export interface IconConfig {
  /** 目标框架 */
  target: TargetFramework;
  /** 输入目录 */
  inputDir: string;
  /** 输出目录 */
  outputDir: string;
  /** 组件名前缀 */
  prefix?: string;
  /** 组件名后缀 */
  suffix?: string;
  /** 是否优化 SVG */
  optimize?: boolean;
  /** 是否使用 TypeScript */
  typescript?: boolean;
  /** 颜色主题配置 */
  theme?: ColorTheme;
  /** 尺寸预设配置 */
  sizes?: SizePresets;
  /** 高级功能配置 */
  features?: AdvancedFeatures;
  /** 组件属性配置 */
  componentProps?: ComponentProps;
  /** 自定义 SVGO 配置 */
  svgoConfig?: SVGOConfig;
  /** 包名称 */
  packageName?: string;
  /** 包版本 */
  packageVersion?: string;
  /** 包描述 */
  packageDescription?: string;
}

/**
 * SVG 元素属性
 */
export interface SVGAttributes {
  [key: string]: string | number | boolean | undefined;
  viewBox?: string;
  width?: string | number;
  height?: string | number;
  fill?: string;
  stroke?: string;
  strokeWidth?: string | number;
  strokeLinecap?: 'butt' | 'round' | 'square';
  strokeLinejoin?: 'miter' | 'round' | 'bevel';
  strokeDasharray?: string;
  strokeDashoffset?: string | number;
  opacity?: string | number;
  transform?: string;
}

/**
 * SVG 元素节点
 */
export interface SVGElement {
  /** 标签名 */
  tag: string;
  /** 属性 */
  attributes: SVGAttributes;
  /** 子元素 */
  children?: SVGElement[];
  /** 文本内容 */
  textContent?: string;
}

/**
 * 解析后的 SVG 信息
 */
export interface ParsedSVG {
  /** 根元素属性 */
  attributes: SVGAttributes;
  /** 子元素 */
  children: SVGElement[];
  /** 原始内容 */
  rawContent: string;
  /** 优化后的内容 */
  optimizedContent?: string;
}

/**
 * SVG 图标信息
 */
export interface SVGInfo {
  /** 原始文件名（不含扩展名） */
  name: string;
  /** 组件名称 */
  componentName: string;
  /** 文件名 */
  fileName: string;
  /** 原始 SVG 内容 */
  content: string;
  /** 优化后的 SVG 内容 */
  optimizedContent?: string;
  /** 解析后的 SVG 结构 */
  parsed?: ParsedSVG;
  /** 视图框 */
  viewBox?: string;
  /** 宽度 */
  width?: string | number;
  /** 高度 */
  height?: string | number;
  /** 文件路径 */
  filePath?: string;
  /** 文件大小（字节） */
  fileSize?: number;
  /** 创建时间 */
  createdAt?: Date;
  /** 修改时间 */
  modifiedAt?: Date;
  /** 标签分类 */
  tags?: string[];
  /** 描述信息 */
  description?: string;
}

/**
 * 生成器选项
 */
export interface GeneratorOptions {
  /** 图标列表 */
  icons: SVGInfo[];
  /** 配置信息 */
  config: IconConfig;
}

/**
 * SVGO 插件配置
 */
export interface SVGOPlugin {
  name: string;
  params?: Record<string, any>;
}

/**
 * SVGO 配置
 */
export interface SVGOConfig {
  /** 是否多次处理 */
  multipass?: boolean;
  /** 浮点数精度 */
  floatPrecision?: number;
  /** JS 转 SVG 配置 */
  js2svg?: {
    pretty?: boolean;
    indent?: number;
  };
  /** 插件列表 */
  plugins: SVGOPlugin[];
}

/**
 * 生成结果
 */
export interface GenerationResult {
  /** 是否成功 */
  success: boolean;
  /** 生成的文件列表 */
  files: string[];
  /** 错误信息 */
  errors?: string[];
  /** 警告信息 */
  warnings?: string[];
  /** 统计信息 */
  stats?: {
    totalIcons: number;
    generatedFiles: number;
    totalSize: number;
    optimizedSize?: number;
    compressionRatio?: number;
  };
}

/**
 * 验证结果
 */
export interface ValidationResult {
  /** 是否有效 */
  valid: boolean;
  /** 错误信息 */
  errors: string[];
  /** 警告信息 */
  warnings: string[];
}

/**
 * 图标元数据
 */
export interface IconMetadata {
  /** 图标名称 */
  name: string;
  /** 组件名称 */
  componentName: string;
  /** 分类 */
  category?: string;
  /** 标签 */
  tags: string[];
  /** 描述 */
  description?: string;
  /** 关键词 */
  keywords?: string[];
  /** 作者 */
  author?: string;
  /** 许可证 */
  license?: string;
  /** 版本 */
  version?: string;
  /** 创建时间 */
  createdAt: Date;
  /** 修改时间 */
  updatedAt: Date;
}

/**
 * 预览配置
 */
export interface PreviewConfig {
  /** 是否生成预览 */
  enabled: boolean;
  /** 预览页面标题 */
  title?: string;
  /** 预览页面描述 */
  description?: string;
  /** 每页显示数量 */
  itemsPerPage?: number;
  /** 是否支持搜索 */
  searchable?: boolean;
  /** 是否支持分类筛选 */
  filterable?: boolean;
  /** 自定义样式 */
  customStyles?: string;
  /** 自定义脚本 */
  customScripts?: string;
}
