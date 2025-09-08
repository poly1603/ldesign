import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import {
  toComponentName,
  validateComponentName,
  readSvgFiles,
  optimizeSvgContent,
  extractViewBox,
  extractSvgDescription,
  extractSvgTags,
  validateSvgContent,
  calculateSvgHash
} from '../utils/svg';

describe('SVG Utils', () => {
  const testDir = path.join(__dirname, 'temp-test-svgs');

  beforeEach(async () => {
    await fs.ensureDir(testDir);
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  describe('toComponentName', () => {
    it('应该转换简单名称', () => {
      expect(toComponentName('home')).toBe('Home');
      expect(toComponentName('user-profile')).toBe('UserProfile');
      expect(toComponentName('arrow_left')).toBe('ArrowLeft');
    });

    it('应该处理前缀和后缀', () => {
      expect(toComponentName('home', 'Ld', 'Icon')).toBe('LdHomeIcon');
      expect(toComponentName('user-profile', '', 'Svg')).toBe('UserProfileSvg');
    });

    it('应该清理特殊字符', () => {
      expect(toComponentName('home@2x')).toBe('Home2x');
      expect(toComponentName('arrow-left.filled')).toBe('ArrowLeftFilled');
      expect(toComponentName('24/7-support')).toBe('Icon247Support');
    });

    it('应该确保以字母开头', () => {
      expect(toComponentName('24-hours')).toBe('Icon24Hours');
      expect(toComponentName('2x-zoom')).toBe('Icon2xZoom');
    });
  });

  describe('validateComponentName', () => {
    it('应该验证有效的组件名', () => {
      const result = validateComponentName('HomeIcon');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该拒绝无效的组件名', () => {
      const result = validateComponentName('home-icon');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('组件名称必须以大写字母开头');
    });

    it('应该拒绝空名称', () => {
      const result = validateComponentName('');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('组件名称不能为空');
    });

    it('应该警告过长的名称', () => {
      const longName = 'A'.repeat(60);
      const result = validateComponentName(longName);
      expect(result.warnings).toContain('组件名称过长，建议控制在50个字符以内');
    });

    it('应该警告保留字', () => {
      const result = validateComponentName('Component');
      expect(result.warnings).toContain('组件名称 "Component" 是保留字，建议使用其他名称');
    });
  });

  describe('readSvgFiles', () => {
    it('应该读取 SVG 文件', async () => {
      // 创建测试 SVG 文件
      const svgContent = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>';
      await fs.writeFile(path.join(testDir, 'home.svg'), svgContent);
      await fs.writeFile(path.join(testDir, 'user.svg'), svgContent);

      const result = await readSvgFiles(testDir);

      expect(result).toHaveLength(2);
      expect(result.map(r => r.name)).toContain('home');
      expect(result.map(r => r.name)).toContain('user');
      expect(result[0].content).toBe(svgContent);
    });

    it('应该递归读取子目录', async () => {
      const subDir = path.join(testDir, 'icons');
      await fs.ensureDir(subDir);

      const svgContent = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>';
      await fs.writeFile(path.join(testDir, 'home.svg'), svgContent);
      await fs.writeFile(path.join(subDir, 'user.svg'), svgContent);

      const result = await readSvgFiles(testDir, { recursive: true });

      expect(result).toHaveLength(2);
    });

    it('应该应用过滤器', async () => {
      const svgContent = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>';
      await fs.writeFile(path.join(testDir, 'home.svg'), svgContent);
      await fs.writeFile(path.join(testDir, 'user.svg'), svgContent);
      await fs.writeFile(path.join(testDir, '.hidden.svg'), svgContent);

      const result = await readSvgFiles(testDir, {
        filter: (fileName) => !fileName.startsWith('.')
      });

      expect(result).toHaveLength(2);
      expect(result.map(r => r.name)).not.toContain('.hidden');
    });

    it('应该包含元数据', async () => {
      const svgContent = '<svg viewBox="0 0 24 24"><title>Home Icon</title><circle cx="12" cy="12" r="10"/></svg>';
      await fs.writeFile(path.join(testDir, 'home.svg'), svgContent);

      const result = await readSvgFiles(testDir, { includeMetadata: true });

      expect(result[0].description).toBe('Home Icon');
      expect(result[0].tags).toContain('home');
      expect(result[0].fileSize).toBeGreaterThan(0);
      expect(result[0].createdAt).toBeInstanceOf(Date);
    });

    it('应该处理不存在的目录', async () => {
      await expect(readSvgFiles('/non-existent-directory')).rejects.toThrow('输入目录不存在');
    });
  });

  describe('optimizeSvgContent', () => {
    it('应该优化 SVG 内容', () => {
      const svg = `
        <svg width="100" height="100" viewBox="0 0 24 24">
          <!-- This is a comment -->
          <circle cx="12" cy="12" r="10" fill="red"/>
        </svg>
      `;

      const result = optimizeSvgContent(svg);

      expect(result.data).not.toContain('<!-- This is a comment -->');
      expect(result.data).not.toContain('width="100"');
      expect(result.data).not.toContain('height="100"');
      expect(result.data).toContain('viewBox="0 0 24 24"');
    });

    it('应该处理优化失败的情况', () => {
      const invalidSvg = '<invalid>content</invalid>';
      const result = optimizeSvgContent(invalidSvg);

      // 应该返回原始内容而不是抛出错误
      expect(result.data).toContain('<invalid>');
      expect(result.data).toContain('content');
      expect(result.data).toContain('</invalid>');
    });
  });

  describe('extractViewBox', () => {
    it('应该提取 viewBox', () => {
      const svg = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>';
      expect(extractViewBox(svg)).toBe('0 0 24 24');
    });

    it('应该处理不同的引号', () => {
      const svg = `<svg viewBox='0 0 100 100'><circle cx="50" cy="50" r="40"/></svg>`;
      expect(extractViewBox(svg)).toBe('0 0 100 100');
    });

    it('应该返回 undefined 如果没有 viewBox', () => {
      const svg = '<svg width="100" height="100"><circle cx="50" cy="50" r="40"/></svg>';
      expect(extractViewBox(svg)).toBeUndefined();
    });
  });

  describe('extractSvgDescription', () => {
    it('应该从 desc 标签提取描述', () => {
      const svg = '<svg><desc>This is a home icon</desc><circle cx="12" cy="12" r="10"/></svg>';
      expect(extractSvgDescription(svg)).toBe('This is a home icon');
    });

    it('应该从 title 标签提取描述', () => {
      const svg = '<svg><title>Home Icon</title><circle cx="12" cy="12" r="10"/></svg>';
      expect(extractSvgDescription(svg)).toBe('Home Icon');
    });

    it('应该优先使用 desc 而不是 title', () => {
      const svg = '<svg><title>Title</title><desc>Description</desc><circle cx="12" cy="12" r="10"/></svg>';
      expect(extractSvgDescription(svg)).toBe('Description');
    });

    it('应该返回 undefined 如果没有描述', () => {
      const svg = '<svg><circle cx="12" cy="12" r="10"/></svg>';
      expect(extractSvgDescription(svg)).toBeUndefined();
    });
  });

  describe('extractSvgTags', () => {
    it('应该从文件名提取标签', () => {
      const tags = extractSvgTags('<svg></svg>', 'home-icon');
      expect(tags).toContain('home');
      expect(tags).toContain('icon');
    });

    it('应该从内容提取标签', () => {
      const tags = extractSvgTags('<svg><circle/></svg>', 'circle-shape');
      expect(tags).toContain('circle');
    });

    it('应该过滤短词', () => {
      const tags = extractSvgTags('<svg></svg>', 'a-big-home-icon');
      expect(tags).not.toContain('a'); // 太短
      expect(tags).toContain('big');
      expect(tags).toContain('home');
      expect(tags).toContain('icon');
    });
  });

  describe('validateSvgContent', () => {
    it('应该验证有效的 SVG', () => {
      const svg = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>';
      const result = validateSvgContent(svg);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该拒绝空内容', () => {
      const result = validateSvgContent('');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('SVG 内容不能为空');
    });

    it('应该拒绝非 SVG 内容', () => {
      const result = validateSvgContent('<div>Not an SVG</div>');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('SVG 内容必须包含根 svg 元素');
    });

    it('应该警告脚本内容', () => {
      const svg = '<svg><script>alert("xss")</script><circle cx="12" cy="12" r="10"/></svg>';
      const result = validateSvgContent(svg);

      expect(result.warnings).toContain('SVG 包含脚本元素，建议移除以确保安全');
    });

    it('应该警告外部链接', () => {
      const svg = '<svg><image href="https://example.com/image.png"/></svg>';
      const result = validateSvgContent(svg);

      expect(result.warnings).toContain('SVG 包含外部链接，可能影响离线使用');
    });

    it('应该警告缺少 viewBox', () => {
      const svg = '<svg width="100" height="100"><circle cx="50" cy="50" r="40"/></svg>';
      const result = validateSvgContent(svg);

      expect(result.warnings).toContain('SVG 缺少 viewBox 属性，可能影响缩放');
    });

    it('应该警告过大的文件', () => {
      const largeContent = 'x'.repeat(60000);
      const svg = `<svg viewBox="0 0 24 24">${largeContent}</svg>`;
      const result = validateSvgContent(svg);

      expect(result.warnings).toContain('SVG 文件过大，建议优化以提高性能');
    });
  });

  describe('calculateSvgHash', () => {
    it('应该为相同内容生成相同哈希', () => {
      const svg = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>';
      const hash1 = calculateSvgHash(svg);
      const hash2 = calculateSvgHash(svg);

      expect(hash1).toBe(hash2);
    });

    it('应该为不同内容生成不同哈希', () => {
      const svg1 = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>';
      const svg2 = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/></svg>';
      const hash1 = calculateSvgHash(svg1);
      const hash2 = calculateSvgHash(svg2);

      expect(hash1).not.toBe(hash2);
    });

    it('应该生成合理长度的哈希', () => {
      const svg = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>';
      const hash = calculateSvgHash(svg);

      expect(hash).toMatch(/^[a-z0-9]+$/);
      expect(hash.length).toBeGreaterThan(0);
      expect(hash.length).toBeLessThan(20);
    });
  });
});
