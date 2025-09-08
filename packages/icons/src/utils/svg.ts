import path from 'path';
import fs from 'fs-extra';
import { optimize, type Config as SvgoConfig } from 'svgo';
import camelCase from 'camelcase';
import type {
  SVGInfo,
  SVGOConfig,
  ParsedSVG,
  SVGElement,
  SVGAttributes,
  ValidationResult,
  IconMetadata
} from '../types';

/**
 * 将文件名转换为组件名称
 * @param name 原始文件名
 * @param prefix 前缀
 * @param suffix 后缀
 * @returns 组件名称
 */
export function toComponentName(name: string, prefix?: string, suffix?: string): string {
  // 清理文件名，移除特殊字符
  const cleaned = name
    .replace(/[^a-zA-Z0-9\-_]/g, '-')
    .replace(/[-_]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // 手动转换为 PascalCase，特殊处理数字+字母组合
  const base = cleaned
    .split('-')
    .filter(Boolean)
    .map(word => {
      // 特殊处理 "2x" 这种情况
      if (/^\d+[a-z]$/.test(word)) {
        return word.charAt(0) + word.slice(1).toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join('');

  // 确保组件名以字母开头
  const validBase = /^[A-Z]/.test(base) ? base : `Icon${base}`;

  return [prefix ?? '', validBase, suffix ?? ''].join('').replace(/\s+/g, '');
}

/**
 * 验证组件名称是否有效
 * @param name 组件名称
 * @returns 验证结果
 */
export function validateComponentName(name: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 检查是否为空
  if (!name || name.trim().length === 0) {
    errors.push('组件名称不能为空');
  }

  // 检查是否以字母开头
  if (!/^[A-Z]/.test(name)) {
    errors.push('组件名称必须以大写字母开头');
  }

  // 检查是否包含无效字符
  if (!/^[A-Za-z0-9]+$/.test(name)) {
    errors.push('组件名称只能包含字母和数字');
  }

  // 检查长度
  if (name.length > 50) {
    warnings.push('组件名称过长，建议控制在50个字符以内');
  }

  // 检查是否为保留字
  const reservedWords = ['Component', 'Element', 'Node', 'Object', 'Function'];
  if (reservedWords.includes(name)) {
    warnings.push(`组件名称 "${name}" 是保留字，建议使用其他名称`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * 读取 SVG 文件并解析
 * @param inputDir 输入目录
 * @param options 选项
 * @returns SVG 信息数组
 */
export async function readSvgFiles(
  inputDir: string,
  options: {
    recursive?: boolean;
    filter?: (fileName: string) => boolean;
    includeMetadata?: boolean;
  } = {}
): Promise<SVGInfo[]> {
  const { recursive = false, filter, includeMetadata = false } = options;

  if (!await fs.pathExists(inputDir)) {
    throw new Error(`输入目录不存在: ${inputDir}`);
  }

  const results: SVGInfo[] = [];

  async function processDirectory(dir: string): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory() && recursive) {
        await processDirectory(fullPath);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.svg')) {
        // 应用过滤器
        if (filter && !filter(entry.name)) {
          continue;
        }

        try {
          const content = await fs.readFile(fullPath, 'utf8');
          const name = path.basename(entry.name, '.svg');
          const componentName = toComponentName(name);
          const stats = await fs.stat(fullPath);

          // 验证组件名称
          const validation = validateComponentName(componentName);
          if (!validation.valid) {
            console.warn(`跳过无效的图标文件 ${entry.name}: ${validation.errors.join(', ')}`);
            continue;
          }

          const svgInfo: SVGInfo = {
            name,
            componentName,
            fileName: entry.name,
            content,
            filePath: fullPath,
            fileSize: stats.size,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime
          };

          // 解析 SVG 内容
          try {
            svgInfo.parsed = parseSvgContent(content);
            svgInfo.viewBox = svgInfo.parsed.attributes.viewBox as string;
            svgInfo.width = svgInfo.parsed.attributes.width;
            svgInfo.height = svgInfo.parsed.attributes.height;
          } catch (parseError) {
            console.warn(`解析 SVG 文件 ${entry.name} 时出错:`, parseError);
          }

          // 包含元数据
          if (includeMetadata) {
            svgInfo.description = extractSvgDescription(content);
            svgInfo.tags = extractSvgTags(content, name);
          }

          results.push(svgInfo);
        } catch (error) {
          console.error(`读取 SVG 文件 ${fullPath} 时出错:`, error);
        }
      }
    }
  }

  await processDirectory(inputDir);
  return results;
}

/**
 * 解析 SVG 内容为结构化数据
 * @param content SVG 内容
 * @returns 解析后的 SVG 结构
 */
export function parseSvgContent(content: string): ParsedSVG {
  // 移除注释和多余空白
  const cleanContent = content
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // 提取根 SVG 元素
  const svgMatch = cleanContent.match(/<svg([^>]*)>([\s\S]*)<\/svg>/i);
  if (!svgMatch) {
    throw new Error('无效的 SVG 内容：找不到根 svg 元素');
  }

  const [, attributesStr, innerContent] = svgMatch;

  // 解析根元素属性
  const attributes = parseAttributes(attributesStr);

  // 解析子元素
  const children = parseElements(innerContent);

  return {
    attributes,
    children,
    rawContent: content,
  };
}

/**
 * 解析元素属性
 * @param attributesStr 属性字符串
 * @returns 属性对象
 */
export function parseAttributes(attributesStr: string): SVGAttributes {
  const attributes: SVGAttributes = {};

  // 匹配属性的正则表达式，支持单引号、双引号和无引号值
  const attrRegex = /(\w+(?:-\w+)?)=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let match;

  while ((match = attrRegex.exec(attributesStr)) !== null) {
    const [, name, doubleQuoted, singleQuoted, unquoted] = match;
    const value = doubleQuoted ?? singleQuoted ?? unquoted;

    // 转换属性名为 camelCase（除了特殊情况）
    const normalizedName = normalizeAttributeName(name);

    // 转换属性值
    attributes[normalizedName] = normalizeAttributeValue(normalizedName, value);
  }

  return attributes;
}

/**
 * 标准化属性名称
 * @param name 原始属性名
 * @returns 标准化后的属性名
 */
function normalizeAttributeName(name: string): string {
  // 特殊属性名映射
  const specialMappings: Record<string, string> = {
    'viewBox': 'viewBox',
    'preserveAspectRatio': 'preserveAspectRatio',
    'stroke-width': 'strokeWidth',
    'stroke-linecap': 'strokeLinecap',
    'stroke-linejoin': 'strokeLinejoin',
    'stroke-dasharray': 'strokeDasharray',
    'stroke-dashoffset': 'strokeDashoffset',
    'fill-rule': 'fillRule',
    'clip-rule': 'clipRule',
    'clip-path': 'clipPath',
    'marker-start': 'markerStart',
    'marker-mid': 'markerMid',
    'marker-end': 'markerEnd',
  };

  return specialMappings[name] || name;
}

/**
 * 标准化属性值
 * @param name 属性名
 * @param value 原始值
 * @returns 标准化后的值
 */
function normalizeAttributeValue(name: string, value: string): string | number | boolean {
  // 数值属性
  const numericAttrs = [
    'width', 'height', 'x', 'y', 'cx', 'cy', 'r', 'rx', 'ry',
    'strokeWidth', 'strokeDashoffset', 'opacity', 'fillOpacity', 'strokeOpacity'
  ];

  // 布尔属性
  const booleanAttrs = ['hidden', 'disabled'];

  if (numericAttrs.includes(name)) {
    const num = parseFloat(value);
    return isNaN(num) ? value : num;
  }

  if (booleanAttrs.includes(name)) {
    return value === 'true' || value === name;
  }

  return value;
}

/**
 * 解析 SVG 元素
 * @param content 元素内容
 * @returns 元素数组
 */
export function parseElements(content: string): SVGElement[] {
  const elements: SVGElement[] = [];

  // 匹配所有元素的正则表达式
  const elementRegex = /<(\w+)([^>]*?)(?:\/>|>([\s\S]*?)<\/\1>)/g;
  let match;

  while ((match = elementRegex.exec(content)) !== null) {
    const [, tag, attributesStr, innerContent] = match;

    const element: SVGElement = {
      tag,
      attributes: parseAttributes(attributesStr),
    };

    if (innerContent) {
      const trimmedContent = innerContent.trim();

      // 检查是否包含子元素
      if (/<\w+/.test(trimmedContent)) {
        element.children = parseElements(trimmedContent);
      } else if (trimmedContent) {
        // 纯文本内容
        element.textContent = trimmedContent;
      }
    }

    elements.push(element);
  }

  return elements;
}

/**
 * 优化 SVG 内容
 * @param content 原始 SVG 内容
 * @param svgoConfig SVGO 配置
 * @returns 优化结果
 */
export function optimizeSvgContent(
  content: string,
  svgoConfig?: SVGOConfig
): { data: string; info?: any } {
  try {
    const config = svgoConfig || getDefaultSvgoConfig();
    // 使用 SVGO 3.x 的配置格式
    const svgoNativeConfig: any = {
      multipass: config.multipass,
      floatPrecision: config.floatPrecision,
      js2svg: config.js2svg,
      plugins: config.plugins.map(plugin => ({
        name: plugin.name,
        params: plugin.params
      }))
    };
    const result = optimize(content, svgoNativeConfig);

    if ('data' in result) {
      return {
        data: result.data,
        info: undefined // SVGO 3.x 不再提供 info
      };
    }

    // 兼容性处理
    return { data: content };
  } catch (error) {
    console.warn('SVG 优化失败，使用原始内容:', error);
    return { data: content };
  }
}

/**
 * 提取 SVG 的 viewBox
 * @param content SVG 内容
 * @returns viewBox 值
 */
export function extractViewBox(content: string): string | undefined {
  const match = content.match(/viewBox\s*=\s*["']([^"']+)["']/i);
  return match ? match[1] : undefined;
}

/**
 * 提取 SVG 描述信息
 * @param content SVG 内容
 * @returns 描述信息
 */
export function extractSvgDescription(content: string): string | undefined {
  // 尝试从 <desc> 标签提取
  const descMatch = content.match(/<desc[^>]*>([\s\S]*?)<\/desc>/i);
  if (descMatch) {
    return descMatch[1].trim();
  }

  // 尝试从 <title> 标签提取
  const titleMatch = content.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) {
    return titleMatch[1].trim();
  }

  return undefined;
}

/**
 * 提取 SVG 标签
 * @param content SVG 内容
 * @param fileName 文件名
 * @returns 标签数组
 */
export function extractSvgTags(content: string, fileName: string): string[] {
  const tags: Set<string> = new Set();

  // 从文件名提取标签
  const nameWords = fileName
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2);

  nameWords.forEach(word => tags.add(word));

  // 从 SVG 内容提取常见图标类型
  const iconTypes = [
    'arrow', 'icon', 'button', 'menu', 'close', 'search', 'user', 'home',
    'settings', 'edit', 'delete', 'add', 'plus', 'minus', 'check', 'cross',
    'star', 'heart', 'bookmark', 'share', 'download', 'upload', 'play',
    'pause', 'stop', 'next', 'previous', 'volume', 'mute', 'calendar',
    'clock', 'mail', 'phone', 'location', 'map', 'camera', 'image',
    'video', 'music', 'file', 'folder', 'document', 'text', 'link',
    'external', 'internal', 'warning', 'error', 'success', 'info'
  ];

  iconTypes.forEach(type => {
    if (content.toLowerCase().includes(type) || fileName.toLowerCase().includes(type)) {
      tags.add(type);
    }
  });

  return Array.from(tags);
}

/**
 * 获取默认的 SVGO 配置
 * @returns SVGO 配置
 */
export function getDefaultSvgoConfig(): SVGOConfig {
  return {
    multipass: true,
    floatPrecision: 2,
    js2svg: {
      pretty: true,
      indent: 2
    },
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: {
            // 保留 viewBox
            removeViewBox: false,
            // 保留有用的属性
            removeUnknownsAndDefaults: {
              keepRoleAttr: true,
              keepAriaAttrs: true,
              keepDataAttrs: true
            },
            // 保留标题和描述
            removeTitle: false,
            removeDesc: false,
            // 不移除隐藏元素（可能用于动画）
            removeHiddenElems: false
          }
        }
      },
      // 移除尺寸属性，使用 viewBox
      { name: 'removeDimensions' },
      // 将样式转换为属性
      { name: 'convertStyleToAttrs' },
      // 移除脚本元素（安全考虑）
      { name: 'removeScriptElement' },
      // 移除不必要的命名空间
      { name: 'removeUselessStrokeAndFill' },
      // 合并路径
      { name: 'mergePaths' },
      // 转换颜色
      { name: 'convertColors', params: { currentColor: true } }
    ]
  };
}

/**
 * 验证 SVG 内容
 * @param content SVG 内容
 * @returns 验证结果
 */
export function validateSvgContent(content: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 检查是否为空
  if (!content || content.trim().length === 0) {
    errors.push('SVG 内容不能为空');
    return { valid: false, errors, warnings };
  }

  // 检查是否包含 SVG 根元素
  if (!/<svg[\s\S]*?<\/svg>/i.test(content)) {
    errors.push('SVG 内容必须包含根 svg 元素');
  }

  // 检查是否包含恶意脚本
  if (/<script[\s\S]*?<\/script>/i.test(content)) {
    warnings.push('SVG 包含脚本元素，建议移除以确保安全');
  }

  // 检查是否包含外部引用
  if (/href\s*=\s*["']https?:\/\//.test(content)) {
    warnings.push('SVG 包含外部链接，可能影响离线使用');
  }

  // 检查 viewBox
  if (!extractViewBox(content)) {
    warnings.push('SVG 缺少 viewBox 属性，可能影响缩放');
  }

  // 检查文件大小
  if (content.length > 50000) {
    warnings.push('SVG 文件过大，建议优化以提高性能');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * 计算 SVG 内容的哈希值
 * @param content SVG 内容
 * @returns 哈希值
 */
export function calculateSvgHash(content: string): string {
  // 简单的哈希算法
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为 32 位整数
  }
  return Math.abs(hash).toString(36);
}

