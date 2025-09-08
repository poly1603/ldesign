import { describe, it, expect } from 'vitest';
import { SVGParser } from '../utils/parser';
import type { ParsedSVG, SVGElement } from '../types';

describe('SVGParser', () => {
  describe('parse', () => {
    it('应该解析简单的 SVG', () => {
      const svg = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>';
      const result = SVGParser.parse(svg);

      expect(result.attributes.viewBox).toBe('0 0 24 24');
      expect(result.children).toHaveLength(1);
      expect(result.children[0].tag).toBe('circle');
      expect(result.children[0].attributes.cx).toBe(12);
      expect(result.children[0].attributes.cy).toBe(12);
      expect(result.children[0].attributes.r).toBe(10);
    });

    it('应该解析嵌套的 SVG 元素', () => {
      const svg = `
        <svg viewBox="0 0 24 24">
          <g fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </g>
        </svg>
      `;

      const result = SVGParser.parse(svg);

      expect(result.children).toHaveLength(1);
      expect(result.children[0].tag).toBe('g');
      expect(result.children[0].children).toHaveLength(2);
      expect(result.children[0].children![0].tag).toBe('circle');
      expect(result.children[0].children![1].tag).toBe('path');
    });

    it('应该处理自闭合标签', () => {
      const svg = '<svg viewBox="0 0 24 24"><path d="M12 2L2 7v10c0 5.55 3.84 10 9 11 1.16.21 2.76.21 3.92 0 5.16-1 9-5.45 9-11V7l-10-5z"/></svg>';
      const result = SVGParser.parse(svg);

      expect(result.children).toHaveLength(1);
      expect(result.children[0].tag).toBe('path');
      expect(result.children[0].attributes.d).toBeDefined();
    });

    it('应该处理文本内容', () => {
      const svg = '<svg viewBox="0 0 24 24"><text x="12" y="12">Hello</text></svg>';
      const result = SVGParser.parse(svg);

      expect(result.children[0].tag).toBe('text');
      expect(result.children[0].textContent).toBe('Hello');
    });

    it('应该处理复杂属性', () => {
      const svg = `
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-width="2" stroke-linecap="round" fill-rule="evenodd" d="M12 2L2 7"/>
        </svg>
      `;

      const result = SVGParser.parse(svg);

      expect(result.attributes.xmlns).toBe('http://www.w3.org/2000/svg');
      expect(result.children[0].attributes.strokeWidth).toBe(2);
      expect(result.children[0].attributes.strokeLinecap).toBe('round');
      expect(result.children[0].attributes.fillRule).toBe('evenodd');
    });

    it('应该移除注释和 CDATA', () => {
      const svg = `
        <!-- This is a comment -->
        <svg viewBox="0 0 24 24">
          <![CDATA[
            Some CDATA content
          ]]>
          <circle cx="12" cy="12" r="10"/>
        </svg>
      `;

      const result = SVGParser.parse(svg);

      expect(result.children).toHaveLength(1);
      expect(result.children[0].tag).toBe('circle');
    });

    it('应该抛出错误对于无效的 SVG', () => {
      expect(() => {
        SVGParser.parse('<div>Not an SVG</div>');
      }).toThrow('无效的 SVG 内容：根元素必须是 svg');
    });

    it('应该处理空的 SVG', () => {
      const svg = '<svg viewBox="0 0 24 24"></svg>';
      const result = SVGParser.parse(svg);

      expect(result.children).toHaveLength(0);
      expect(result.attributes.viewBox).toBe('0 0 24 24');
    });
  });

  describe('validate', () => {
    it('应该验证有效的 SVG 结构', () => {
      const parsed: ParsedSVG = {
        attributes: { viewBox: '0 0 24 24' },
        children: [
          {
            tag: 'circle',
            attributes: { cx: 12, cy: 12, r: 10 }
          }
        ],
        rawContent: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>'
      };

      const result = SVGParser.validate(parsed);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该警告缺少 viewBox', () => {
      const parsed: ParsedSVG = {
        attributes: {},
        children: [
          {
            tag: 'circle',
            attributes: { cx: 12, cy: 12, r: 10 }
          }
        ],
        rawContent: '<svg><circle cx="12" cy="12" r="10"/></svg>'
      };

      const result = SVGParser.validate(parsed);

      expect(result.valid).toBe(true);
      expect(result.warnings).toContain('缺少 viewBox 属性，可能影响图标缩放');
    });

    it('应该警告未知的 SVG 元素', () => {
      const parsed: ParsedSVG = {
        attributes: { viewBox: '0 0 24 24' },
        children: [
          {
            tag: 'unknown-element',
            attributes: {}
          }
        ],
        rawContent: '<svg viewBox="0 0 24 24"><unknown-element/></svg>'
      };

      const result = SVGParser.validate(parsed);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.includes('未知的 SVG 元素: unknown-element'))).toBe(true);
    });
  });

  describe('属性解析', () => {
    it('应该正确解析数值属性', () => {
      const svg = '<svg width="100" height="200.5" opacity="0.8"><circle r="10.5"/></svg>';
      const result = SVGParser.parse(svg);

      expect(result.attributes.width).toBe(100);
      expect(result.attributes.height).toBe(200.5);
      expect(result.attributes.opacity).toBe(0.8);
      expect(result.children[0].attributes.r).toBe(10.5);
    });

    it('应该正确解析布尔属性', () => {
      const svg = '<svg><path hidden="true" disabled="false"/></svg>';
      const result = SVGParser.parse(svg);

      expect(result.children[0].attributes.hidden).toBe(true);
      expect(result.children[0].attributes.disabled).toBe(false);
    });

    it('应该处理不同的引号类型', () => {
      const svg = `<svg viewBox='0 0 24 24' width="100" height=50><circle cx="12"/></svg>`;
      const result = SVGParser.parse(svg);

      expect(result.attributes.viewBox).toBe('0 0 24 24');
      expect(result.attributes.width).toBe(100);
      expect(result.attributes.height).toBe(50);
    });

    it('应该标准化属性名称', () => {
      const svg = '<svg><path stroke-width="2" fill-rule="evenodd" clip-path="url(#clip)"/></svg>';
      const result = SVGParser.parse(svg);

      expect(result.children[0].attributes.strokeWidth).toBe(2);
      expect(result.children[0].attributes.fillRule).toBe('evenodd');
      expect(result.children[0].attributes.clipPath).toBe('url(#clip)');
    });
  });

  describe('错误处理', () => {
    it('应该处理格式错误的 SVG', () => {
      // 解析器应该能够处理格式错误的 SVG，要么成功解析要么抛出错误
      expect(() => {
        const result = SVGParser.parse('<svg><path d="M12 2L2 7</svg>');
        // 如果成功解析，应该有正确的结构
        expect(result).toBeDefined();
        expect(result.attributes).toBeDefined();
        expect(result.children).toBeDefined();
      }).not.toThrow();
    });

    it('应该处理未闭合的标签', () => {
      // 解析器应该能够处理未闭合的标签，要么成功解析要么抛出错误
      expect(() => {
        const result = SVGParser.parse('<svg><circle cx="12" cy="12" r="10"</svg>');
        // 如果成功解析，应该有正确的结构
        expect(result).toBeDefined();
        expect(result.attributes).toBeDefined();
        expect(result.children).toBeDefined();
      }).not.toThrow();
    });

    it('应该处理空内容', () => {
      expect(() => {
        SVGParser.parse('');
      }).toThrow();
    });

    it('应该处理只有空白的内容', () => {
      expect(() => {
        SVGParser.parse('   \n\t   ');
      }).toThrow();
    });
  });

  describe('性能测试', () => {
    it('应该能够处理大型 SVG', () => {
      // 生成一个包含大量元素的 SVG
      const elements = Array.from({ length: 1000 }, (_, i) =>
        `<circle cx="${i % 100}" cy="${Math.floor(i / 100)}" r="1"/>`
      ).join('');

      const svg = `<svg viewBox="0 0 100 10">${elements}</svg>`;

      const start = performance.now();
      const result = SVGParser.parse(svg);
      const end = performance.now();

      expect(result.children).toHaveLength(1000);
      expect(end - start).toBeLessThan(1000); // 应该在 1 秒内完成
    });
  });
});
