import type {
  SVGElement,
  SVGAttributes,
  ParsedSVG,
  ValidationResult
} from '../types';

/**
 * 高级 SVG 解析器
 * 提供更强大和准确的 SVG 解析功能
 */
export class SVGParser {
  private static readonly VOID_ELEMENTS = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr',
    // SVG void elements
    'circle', 'ellipse', 'line', 'path', 'polygon', 'polyline', 'rect', 'use'
  ]);

  private static readonly SVG_ELEMENTS = new Set([
    'svg', 'g', 'path', 'circle', 'ellipse', 'line', 'rect', 'polygon', 'polyline',
    'text', 'tspan', 'textPath', 'defs', 'clipPath', 'mask', 'pattern', 'image',
    'use', 'symbol', 'marker', 'linearGradient', 'radialGradient', 'stop',
    'animate', 'animateTransform', 'animateMotion', 'set', 'foreignObject',
    'switch', 'style', 'title', 'desc', 'metadata'
  ]);

  /**
   * 解析 SVG 内容
   * @param content SVG 字符串内容
   * @returns 解析后的 SVG 结构
   */
  static parse(content: string): ParsedSVG {
    const cleanContent = this.preprocessContent(content);
    const tokens = this.tokenize(cleanContent);
    const ast = this.buildAST(tokens);

    if (!ast || ast.tag !== 'svg') {
      throw new Error('无效的 SVG 内容：根元素必须是 svg');
    }

    return {
      attributes: ast.attributes,
      children: ast.children || [],
      rawContent: content
    };
  }

  /**
   * 预处理 SVG 内容
   * @param content 原始内容
   * @returns 清理后的内容
   */
  private static preprocessContent(content: string): string {
    return content
      // 移除 XML 声明
      .replace(/<\?xml[^>]*\?>/gi, '')
      // 移除 DOCTYPE 声明
      .replace(/<!DOCTYPE[^>]*>/gi, '')
      // 移除注释
      .replace(/<!--[\s\S]*?-->/g, '')
      // 移除 CDATA
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
      // 标准化空白字符
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * 词法分析 - 将内容分解为标记
   * @param content 预处理后的内容
   * @returns 标记数组
   */
  private static tokenize(content: string): Token[] {
    const tokens: Token[] = [];
    let position = 0;

    while (position < content.length) {
      const char = content[position];

      if (char === '<') {
        const tagEnd = content.indexOf('>', position);
        if (tagEnd === -1) {
          throw new Error(`未闭合的标签，位置: ${position}`);
        }

        const tagContent = content.slice(position + 1, tagEnd);

        if (tagContent.startsWith('/')) {
          // 结束标签
          tokens.push({
            type: 'endTag',
            name: tagContent.slice(1).trim(),
            position
          });
        } else if (tagContent.endsWith('/')) {
          // 自闭合标签
          const spaceIndex = tagContent.indexOf(' ');
          const tagName = spaceIndex > 0 ? tagContent.slice(0, spaceIndex) : tagContent.slice(0, -1);
          const attributesStr = spaceIndex > 0 ? tagContent.slice(spaceIndex + 1, -1).trim() : '';

          tokens.push({
            type: 'selfClosingTag',
            name: tagName.trim(),
            attributes: this.parseAttributeString(attributesStr),
            position
          });
        } else {
          // 开始标签
          const spaceIndex = tagContent.indexOf(' ');
          const tagName = spaceIndex > 0 ? tagContent.slice(0, spaceIndex) : tagContent;
          const attributesStr = spaceIndex > 0 ? tagContent.slice(spaceIndex + 1).trim() : '';

          tokens.push({
            type: 'startTag',
            name: tagName.trim(),
            attributes: this.parseAttributeString(attributesStr),
            position
          });
        }

        position = tagEnd + 1;
      } else {
        // 文本内容
        const nextTag = content.indexOf('<', position);
        const textContent = content.slice(position, nextTag === -1 ? undefined : nextTag).trim();

        if (textContent) {
          tokens.push({
            type: 'text',
            content: textContent,
            position
          });
        }

        position = nextTag === -1 ? content.length : nextTag;
      }
    }

    return tokens;
  }

  /**
   * 解析属性字符串
   * @param attributesStr 属性字符串
   * @returns 属性对象
   */
  private static parseAttributeString(attributesStr: string): SVGAttributes {
    const attributes: SVGAttributes = {};

    if (!attributesStr.trim()) {
      return attributes;
    }

    // 改进的属性解析正则，支持各种引号和无引号值
    const attrRegex = /(\w+(?:-\w+)*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
    let match;

    while ((match = attrRegex.exec(attributesStr)) !== null) {
      const [, name, doubleQuoted, singleQuoted, unquoted] = match;
      const value = doubleQuoted ?? singleQuoted ?? unquoted ?? '';

      attributes[this.normalizeAttributeName(name)] = this.normalizeAttributeValue(name, value);
    }

    return attributes;
  }

  /**
   * 构建抽象语法树
   * @param tokens 标记数组
   * @returns AST 根节点
   */
  private static buildAST(tokens: Token[]): SVGElement | null {
    let position = 0;

    function parseElement(): SVGElement | null {
      if (position >= tokens.length) {
        return null;
      }

      const token = tokens[position];

      if (token.type === 'startTag' && token.name) {
        const element: SVGElement = {
          tag: token.name,
          attributes: token.attributes || {}
        };

        position++;

        // 检查是否为 void 元素
        if (SVGParser.VOID_ELEMENTS.has(token.name)) {
          return element;
        }

        // 解析子元素和文本内容
        const children: SVGElement[] = [];
        let textContent = '';

        while (position < tokens.length) {
          const currentToken = tokens[position];

          if (currentToken.type === 'endTag' && currentToken.name === token.name) {
            position++;
            break;
          } else if (currentToken.type === 'text') {
            textContent += currentToken.content;
            position++;
          } else if (currentToken.type === 'startTag' || currentToken.type === 'selfClosingTag') {
            const child = parseElement();
            if (child) {
              children.push(child);
            }
          } else {
            position++;
          }
        }

        if (children.length > 0) {
          element.children = children;
        }

        if (textContent.trim()) {
          element.textContent = textContent.trim();
        }

        return element;
      } else if (token.type === 'selfClosingTag' && token.name) {
        position++;
        return {
          tag: token.name,
          attributes: token.attributes || {}
        };
      }

      position++;
      return null;
    }

    return parseElement();
  }

  /**
   * 标准化属性名称
   * @param name 原始属性名
   * @returns 标准化后的属性名
   */
  private static normalizeAttributeName(name: string): string {
    const mappings: Record<string, string> = {
      'viewbox': 'viewBox',
      'preserveaspectratio': 'preserveAspectRatio',
      'stroke-width': 'strokeWidth',
      'stroke-linecap': 'strokeLinecap',
      'stroke-linejoin': 'strokeLinejoin',
      'stroke-dasharray': 'strokeDasharray',
      'stroke-dashoffset': 'strokeDashoffset',
      'fill-rule': 'fillRule',
      'clip-rule': 'clipRule',
      'clip-path': 'clipPath'
    };

    return mappings[name.toLowerCase()] || name;
  }

  /**
   * 标准化属性值
   * @param name 属性名
   * @param value 原始值
   * @returns 标准化后的值
   */
  private static normalizeAttributeValue(name: string, value: string): string | number | boolean {
    // 数值属性
    const numericAttrs = new Set([
      'width', 'height', 'x', 'y', 'cx', 'cy', 'r', 'rx', 'ry',
      'strokeWidth', 'strokeDashoffset', 'opacity', 'fillOpacity', 'strokeOpacity'
    ]);

    // 布尔属性
    const booleanAttrs = new Set(['hidden', 'disabled']);

    // 检查标准化后的属性名
    const normalizedName = this.normalizeAttributeName(name);

    if (numericAttrs.has(normalizedName)) {
      const num = parseFloat(value);
      return isNaN(num) ? value : num;
    }

    if (booleanAttrs.has(normalizedName)) {
      return value === 'true' || value === name || value === '';
    }

    return value;
  }

  /**
   * 验证 SVG 结构
   * @param parsed 解析后的 SVG
   * @returns 验证结果
   */
  static validate(parsed: ParsedSVG): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 验证根元素
    if (!parsed.attributes.viewBox) {
      warnings.push('缺少 viewBox 属性，可能影响图标缩放');
    }

    // 递归验证子元素
    function validateElement(element: SVGElement, path: string): void {
      // 检查元素名称是否有效
      if (!SVGParser.SVG_ELEMENTS.has(element.tag)) {
        warnings.push(`未知的 SVG 元素: ${element.tag} (路径: ${path})`);
      }

      // 验证子元素
      if (element.children) {
        element.children.forEach((child, index) => {
          validateElement(child, `${path}/${child.tag}[${index}]`);
        });
      }
    }

    parsed.children.forEach((child, index) => {
      validateElement(child, `svg/${child.tag}[${index}]`);
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

/**
 * 基础标记类型
 */
interface BaseToken {
  position: number;
}

/**
 * 标签标记
 */
interface TagToken extends BaseToken {
  type: 'startTag' | 'endTag' | 'selfClosingTag';
  name: string;
  attributes?: SVGAttributes;
}

/**
 * 文本标记
 */
interface TextToken extends BaseToken {
  type: 'text';
  content: string;
}

/**
 * 标记联合类型
 */
type Token = TagToken | TextToken;
