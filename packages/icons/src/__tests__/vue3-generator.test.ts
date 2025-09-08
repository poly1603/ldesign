import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import { Vue3Generator, generateVue3Components } from '../generators/vue3';
import { ConfigManager } from '../utils/config';
import { SVGParser } from '../utils/parser';
import type { SVGInfo, GeneratorOptions } from '../types';

describe('Vue3Generator', () => {
  const testDir = path.join(__dirname, 'temp-test-output');

  beforeEach(async () => {
    await fs.ensureDir(testDir);
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  const createTestSvg = (name: string, content?: string): SVGInfo => {
    const svgContent = content || '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>';
    return {
      name,
      componentName: name.charAt(0).toUpperCase() + name.slice(1) + 'Icon',
      fileName: `${name}.svg`,
      content: svgContent,
      parsed: SVGParser.parse(svgContent),
      viewBox: '0 0 24 24'
    };
  };

  describe('generateComponent', () => {
    it('应该生成基本的 TypeScript 组件', () => {
      const svg = createTestSvg('home');
      const config = ConfigManager.createDefault('vue3', '/input', '/output');
      const options: GeneratorOptions = { icons: [svg], config };

      const result = Vue3Generator.generateComponent(svg, options);

      expect(result).toContain('import { defineComponent, h, computed, type PropType } from \'vue\'');
      expect(result).toContain('export default defineComponent({');
      expect(result).toContain('name: \'HomeIcon\'');
      expect(result).toContain('size?: string | number');
      expect(result).toContain('color?: string');
      expect(result).toContain('viewBox: \'0 0 24 24\'');
    });

    it('应该生成 JavaScript 组件', () => {
      const svg = createTestSvg('user');
      const config = ConfigManager.createDefault('vue3', '/input', '/output');
      config.typescript = false;
      const options: GeneratorOptions = { icons: [svg], config };

      const result = Vue3Generator.generateComponent(svg, options);

      expect(result).toContain('import { defineComponent, h, computed } from \'vue\'');
      expect(result).not.toContain('type PropType');
      expect(result).not.toContain('export interface');
    });

    it('应该包含动画功能', () => {
      const svg = createTestSvg('spinner');
      const config = ConfigManager.createDefault('vue3', '/input', '/output');
      config.features!.animation = true;
      const options: GeneratorOptions = { icons: [svg], config };

      const result = Vue3Generator.generateComponent(svg, options);

      expect(result).toContain('spin: {');
      expect(result).toContain('pulse: {');
      expect(result).toContain('ld-icon--spin');
      expect(result).toContain('ld-icon--pulse');
    });

    it('应该包含主题功能', () => {
      const svg = createTestSvg('heart');
      const config = ConfigManager.createDefault('vue3', '/input', '/output');
      config.features!.theming = true;
      const options: GeneratorOptions = { icons: [svg], config };

      const result = Vue3Generator.generateComponent(svg, options);

      expect(result).toContain('import { useTheme } from \'./composables/useTheme\'');
      expect(result).toContain('theme: {');
      expect(result).toContain('getThemeColor');
    });

    it('应该支持自定义前缀和后缀', () => {
      // 手动创建 SVG 信息，使用自定义前缀和后缀
      const svg: SVGInfo = {
        name: 'star',
        componentName: 'LdStarSvg',
        fileName: 'star.svg',
        content: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>',
        parsed: SVGParser.parse('<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>'),
        viewBox: '0 0 24 24'
      };
      const config = ConfigManager.createDefault('vue3', '/input', '/output');
      config.prefix = 'Ld';
      config.suffix = 'Svg';
      const options: GeneratorOptions = { icons: [svg], config };

      const result = Vue3Generator.generateComponent(svg, options);

      expect(result).toContain('name: \'LdStarSvg\'');
    });

    it('应该处理复杂的 SVG 结构', () => {
      const complexSvg = `
        <svg viewBox="0 0 24 24">
          <g fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </g>
        </svg>
      `;
      const svg = createTestSvg('clock', complexSvg);
      const config = ConfigManager.createDefault('vue3', '/input', '/output');
      const options: GeneratorOptions = { icons: [svg], config };

      const result = Vue3Generator.generateComponent(svg, options);

      expect(result).toContain('h(\'g\'');
      expect(result).toContain('h(\'circle\'');
      expect(result).toContain('h(\'path\'');
    });

    it('应该包含自定义属性', () => {
      const svg = createTestSvg('custom');
      const config = ConfigManager.createDefault('vue3', '/input', '/output');
      config.componentProps!.customClass = true;
      config.componentProps!.customStyle = true;
      const options: GeneratorOptions = { icons: [svg], config };

      const result = Vue3Generator.generateComponent(svg, options);

      expect(result).toContain('class: {');
      expect(result).toContain('style: {');
    });
  });

  describe('generateVue3Components', () => {
    it('应该生成所有组件文件', async () => {
      const icons = [
        createTestSvg('home'),
        createTestSvg('user'),
        createTestSvg('settings')
      ];
      const config = ConfigManager.createDefault('vue3', '/input', testDir);
      const options: GeneratorOptions = { icons, config };

      await generateVue3Components(options);

      // 检查组件文件
      expect(await fs.pathExists(path.join(testDir, 'HomeIcon.ts'))).toBe(true);
      expect(await fs.pathExists(path.join(testDir, 'UserIcon.ts'))).toBe(true);
      expect(await fs.pathExists(path.join(testDir, 'SettingsIcon.ts'))).toBe(true);

      // 检查索引文件
      expect(await fs.pathExists(path.join(testDir, 'index.ts'))).toBe(true);

      // 检查 package.json
      expect(await fs.pathExists(path.join(testDir, 'package.json'))).toBe(true);
    });

    it('应该生成正确的索引文件', async () => {
      const icons = [
        createTestSvg('home'),
        createTestSvg('user')
      ];
      const config = ConfigManager.createDefault('vue3', '/input', testDir);
      const options: GeneratorOptions = { icons, config };

      await generateVue3Components(options);

      const indexContent = await fs.readFile(path.join(testDir, 'index.ts'), 'utf-8');

      expect(indexContent).toContain('export { default as HomeIcon } from \'./HomeIcon.ts\'');
      expect(indexContent).toContain('export { default as UserIcon } from \'./UserIcon.ts\'');
      expect(indexContent).toContain('export type { HomeIconProps } from \'./HomeIcon.ts\'');
      expect(indexContent).toContain('export type IconName = \'home\' | \'user\'');
      expect(indexContent).toContain('export type ComponentName = \'HomeIcon\' | \'UserIcon\'');
    });

    it('应该生成样式文件', async () => {
      const icons = [createTestSvg('home')];
      const config = ConfigManager.createDefault('vue3', '/input', testDir);
      config.features!.animation = true;
      config.features!.theming = true;
      const options: GeneratorOptions = { icons, config };

      await generateVue3Components(options);

      expect(await fs.pathExists(path.join(testDir, 'style.css'))).toBe(true);

      const styleContent = await fs.readFile(path.join(testDir, 'style.css'), 'utf-8');
      expect(styleContent).toContain('.ld-icon--spin');
      expect(styleContent).toContain('.ld-icon--primary');
      expect(styleContent).toContain('@keyframes ld-icon-spin');
    });

    it('应该生成 Composables', async () => {
      const icons = [createTestSvg('home')];
      const config = ConfigManager.createDefault('vue3', '/input', testDir);
      config.features!.theming = true;
      const options: GeneratorOptions = { icons, config };

      await generateVue3Components(options);

      expect(await fs.pathExists(path.join(testDir, 'composables', 'useTheme.ts'))).toBe(true);

      const composableContent = await fs.readFile(path.join(testDir, 'composables', 'useTheme.ts'), 'utf-8');
      expect(composableContent).toContain('export function useTheme()');
      expect(composableContent).toContain('getThemeColor');
      expect(composableContent).toContain('ThemeConfig');
    });

    it('应该生成正确的 package.json', async () => {
      const icons = [createTestSvg('home')];
      const config = ConfigManager.createDefault('vue3', '/input', testDir);
      config.packageName = '@custom/icons-vue3';
      config.packageVersion = '2.0.0';
      config.packageDescription = 'Custom Vue 3 icons';
      const options: GeneratorOptions = { icons, config };

      await generateVue3Components(options);

      const packageJson = await fs.readJson(path.join(testDir, 'package.json'));

      expect(packageJson.name).toBe('@custom/icons-vue3');
      expect(packageJson.version).toBe('2.0.0');
      expect(packageJson.description).toBe('Custom Vue 3 icons');
      expect(packageJson.peerDependencies.vue).toBe('^3.0.0');
      expect(packageJson.sideEffects).toBe(false);
    });

    it('应该处理 JavaScript 模式', async () => {
      const icons = [createTestSvg('home')];
      const config = ConfigManager.createDefault('vue3', '/input', testDir);
      config.typescript = false;
      const options: GeneratorOptions = { icons, config };

      await generateVue3Components(options);

      expect(await fs.pathExists(path.join(testDir, 'HomeIcon.js'))).toBe(true);
      expect(await fs.pathExists(path.join(testDir, 'index.js'))).toBe(true);

      const indexContent = await fs.readFile(path.join(testDir, 'index.js'), 'utf-8');
      expect(indexContent).toContain('export { default as HomeIcon } from \'./HomeIcon.js\'');
      expect(indexContent).not.toContain('export type');
    });

    it('应该跳过不需要的功能', async () => {
      const icons = [createTestSvg('home')];
      const config = ConfigManager.createDefault('vue3', '/input', testDir);
      config.features!.animation = false;
      config.features!.theming = false;
      const options: GeneratorOptions = { icons, config };

      await generateVue3Components(options);

      // 不应该生成样式文件
      expect(await fs.pathExists(path.join(testDir, 'style.css'))).toBe(false);

      // 不应该生成 composables
      expect(await fs.pathExists(path.join(testDir, 'composables'))).toBe(false);

      const componentContent = await fs.readFile(path.join(testDir, 'HomeIcon.ts'), 'utf-8');
      expect(componentContent).not.toContain('spin:');
      expect(componentContent).not.toContain('theme:');
      expect(componentContent).not.toContain('useTheme');
    });
  });

  describe('边界情况', () => {
    it('应该处理空的图标列表', async () => {
      const config = ConfigManager.createDefault('vue3', '/input', testDir);
      const options: GeneratorOptions = { icons: [], config };

      await generateVue3Components(options);

      const indexContent = await fs.readFile(path.join(testDir, 'index.ts'), 'utf-8');
      expect(indexContent).toContain('export type IconName = never');
      expect(indexContent).toContain('export type ComponentName = never');
    });

    it('应该处理特殊字符的图标名称', async () => {
      // 手动创建 SVG 信息，确保组件名称正确
      const svg: SVGInfo = {
        name: 'arrow-left-circle',
        componentName: 'ArrowLeftCircleIcon',
        fileName: 'arrow-left-circle.svg',
        content: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>',
        parsed: SVGParser.parse('<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>'),
        viewBox: '0 0 24 24'
      };
      const config = ConfigManager.createDefault('vue3', '/input', testDir);
      const options: GeneratorOptions = { icons: [svg], config };

      await generateVue3Components(options);

      expect(await fs.pathExists(path.join(testDir, 'ArrowLeftCircleIcon.ts'))).toBe(true);
    });

    it('应该处理没有 viewBox 的 SVG', () => {
      const svgContent = '<svg width="24" height="24"><circle cx="12" cy="12" r="10"/></svg>';
      const svg = createTestSvg('no-viewbox', svgContent);
      const config = ConfigManager.createDefault('vue3', '/input', testDir);
      const options: GeneratorOptions = { icons: [svg], config };

      const result = Vue3Generator.generateComponent(svg, options);

      expect(result).toContain('viewBox: \'0 0 24 24\''); // 应该使用默认值
    });
  });
});
