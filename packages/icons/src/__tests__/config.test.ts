import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import { ConfigManager } from '../utils/config';
import type { IconConfig, TargetFramework } from '../types';

describe('ConfigManager', () => {
  const testDir = path.join(__dirname, 'temp-test-configs');

  beforeEach(async () => {
    await fs.ensureDir(testDir);
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  describe('createDefault', () => {
    it('应该创建默认配置', () => {
      const config = ConfigManager.createDefault('vue3', '/input', '/output');
      
      expect(config.target).toBe('vue3');
      expect(config.inputDir).toBe('/input');
      expect(config.outputDir).toBe('/output');
      expect(config.typescript).toBe(true);
      expect(config.optimize).toBe(true);
      expect(config.suffix).toBe('Icon');
      expect(config.packageName).toBe('@ldesign/icons-vue3');
    });

    it('应该包含完整的主题配置', () => {
      const config = ConfigManager.createDefault('react', '/input', '/output');
      
      expect(config.theme).toBeDefined();
      expect(config.theme!.primary).toBe('#722ED1');
      expect(config.theme!.secondary).toBe('#8C5AD3');
      expect(config.theme!.success).toBe('#42BD42');
    });

    it('应该包含尺寸预设', () => {
      const config = ConfigManager.createDefault('vue3', '/input', '/output');
      
      expect(config.sizes).toBeDefined();
      expect(config.sizes!.xs).toBe('12px');
      expect(config.sizes!.sm).toBe('16px');
      expect(config.sizes!.md).toBe('20px');
      expect(config.sizes!.lg).toBe('24px');
      expect(config.sizes!.xl).toBe('32px');
    });

    it('应该包含功能配置', () => {
      const config = ConfigManager.createDefault('vue3', '/input', '/output');
      
      expect(config.features).toBeDefined();
      expect(config.features!.animation).toBe(true);
      expect(config.features!.theming).toBe(true);
      expect(config.features!.preview).toBe(true);
      expect(config.features!.dts).toBe(true);
      expect(config.features!.treeshaking).toBe(true);
    });
  });

  describe('loadFromFile', () => {
    it('应该从 JSON 文件加载配置', async () => {
      const configData = {
        target: 'vue3' as TargetFramework,
        inputDir: '/test/input',
        outputDir: '/test/output',
        prefix: 'Ld',
        typescript: false
      };
      
      const configPath = path.join(testDir, 'config.json');
      await fs.writeJson(configPath, configData);
      
      const config = await ConfigManager.loadFromFile(configPath);
      
      expect(config.target).toBe('vue3');
      expect(config.inputDir).toBe('/test/input');
      expect(config.outputDir).toBe('/test/output');
      expect(config.prefix).toBe('Ld');
      expect(config.typescript).toBe(false);
    });

    it('应该从 JS 文件加载配置', async () => {
      const configContent = `
        export default {
          target: 'react',
          inputDir: '/test/input',
          outputDir: '/test/output',
          optimize: false
        };
      `;
      
      const configPath = path.join(testDir, 'config.js');
      await fs.writeFile(configPath, configContent);
      
      const config = await ConfigManager.loadFromFile(configPath);
      
      expect(config.target).toBe('react');
      expect(config.optimize).toBe(false);
    });

    it('应该处理不存在的文件', async () => {
      await expect(ConfigManager.loadFromFile('/non-existent.json'))
        .rejects.toThrow('配置文件不存在');
    });

    it('应该处理不支持的文件格式', async () => {
      const configPath = path.join(testDir, 'config.txt');
      await fs.writeFile(configPath, 'some content');
      
      await expect(ConfigManager.loadFromFile(configPath))
        .rejects.toThrow('不支持的配置文件格式');
    });

    it('应该处理无效的 JSON', async () => {
      const configPath = path.join(testDir, 'invalid.json');
      await fs.writeFile(configPath, '{ invalid json }');
      
      await expect(ConfigManager.loadFromFile(configPath))
        .rejects.toThrow('读取配置文件失败');
    });
  });

  describe('mergeWithDefaults', () => {
    it('应该合并用户配置与默认值', () => {
      const userConfig = {
        target: 'vue3' as TargetFramework,
        inputDir: '/input',
        outputDir: '/output',
        prefix: 'Custom',
        theme: {
          primary: '#FF0000'
        }
      };
      
      const config = ConfigManager.mergeWithDefaults(userConfig);
      
      expect(config.prefix).toBe('Custom');
      expect(config.suffix).toBe('Icon'); // 默认值
      expect(config.theme!.primary).toBe('#FF0000'); // 用户值
      expect(config.theme!.secondary).toBe('#8C5AD3'); // 默认值
    });

    it('应该要求必需字段', () => {
      expect(() => {
        ConfigManager.mergeWithDefaults({});
      }).toThrow('必须提供 target、inputDir 和 outputDir');
    });

    it('应该深度合并嵌套对象', () => {
      const userConfig = {
        target: 'react' as TargetFramework,
        inputDir: '/input',
        outputDir: '/output',
        features: {
          animation: false
        },
        sizes: {
          xs: '10px'
        }
      };
      
      const config = ConfigManager.mergeWithDefaults(userConfig);
      
      expect(config.features!.animation).toBe(false); // 用户值
      expect(config.features!.theming).toBe(true); // 默认值
      expect(config.sizes!.xs).toBe('10px'); // 用户值
      expect(config.sizes!.md).toBe('20px'); // 默认值
    });
  });

  describe('validate', () => {
    it('应该验证有效配置', () => {
      const config = ConfigManager.createDefault('vue3', '/input', '/output');
      const result = ConfigManager.validate(config);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该拒绝缺少必需字段的配置', () => {
      const config = {
        inputDir: '/input',
        outputDir: '/output'
      } as IconConfig;
      
      const result = ConfigManager.validate(config);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('target 字段是必需的');
    });

    it('应该拒绝不支持的目标框架', () => {
      const config = {
        target: 'unsupported' as TargetFramework,
        inputDir: '/input',
        outputDir: '/output'
      } as IconConfig;
      
      const result = ConfigManager.validate(config);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('不支持的目标框架: unsupported');
    });

    it('应该验证组件名称配置', () => {
      const config = ConfigManager.createDefault('vue3', '/input', '/output');
      config.prefix = '123invalid';
      
      const result = ConfigManager.validate(config);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('prefix 必须是有效的标识符');
    });

    it('应该警告相对路径', () => {
      const config = ConfigManager.createDefault('vue3', 'input', 'output');
      const result = ConfigManager.validate(config);
      
      expect(result.warnings).toContain('建议使用绝对路径作为 inputDir');
      expect(result.warnings).toContain('建议使用绝对路径作为 outputDir');
    });

    it('应该验证包名称格式', () => {
      const config = ConfigManager.createDefault('vue3', '/input', '/output');
      config.packageName = 'Invalid Package Name';
      
      const result = ConfigManager.validate(config);
      
      expect(result.warnings).toContain('packageName 格式可能不正确');
    });

    it('应该验证版本号格式', () => {
      const config = ConfigManager.createDefault('vue3', '/input', '/output');
      config.packageVersion = 'invalid-version';
      
      const result = ConfigManager.validate(config);
      
      expect(result.warnings).toContain('packageVersion 应该遵循语义化版本规范');
    });

    it('应该验证主题颜色', () => {
      const config = ConfigManager.createDefault('vue3', '/input', '/output');
      config.theme!.primary = 'invalid-color';
      
      const result = ConfigManager.validate(config);
      
      expect(result.warnings.some(w => w.includes('主题颜色 primary 的值可能不是有效的颜色'))).toBe(true);
    });

    it('应该验证尺寸配置', () => {
      const config = ConfigManager.createDefault('vue3', '/input', '/output');
      config.sizes!.xs = 'invalid-size';
      
      const result = ConfigManager.validate(config);
      
      expect(result.warnings.some(w => w.includes('尺寸 xs 的值可能不是有效的 CSS 尺寸'))).toBe(true);
    });

    it('应该拒绝负数尺寸', () => {
      const config = ConfigManager.createDefault('vue3', '/input', '/output');
      config.sizes!.xs = -10;
      
      const result = ConfigManager.validate(config);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('尺寸 xs 不能为负数: -10');
    });
  });

  describe('getSupportedFrameworks', () => {
    it('应该返回支持的框架列表', () => {
      const frameworks = ConfigManager.getSupportedFrameworks();
      
      expect(frameworks).toContain('vue2');
      expect(frameworks).toContain('vue3');
      expect(frameworks).toContain('react');
      expect(frameworks).toContain('lit');
      expect(frameworks).toContain('angular');
      expect(frameworks).toContain('svelte');
    });
  });

  describe('saveToFile', () => {
    it('应该保存配置为 JSON', async () => {
      const config = ConfigManager.createDefault('vue3', '/input', '/output');
      const outputPath = path.join(testDir, 'output.json');
      
      await ConfigManager.saveToFile(config, outputPath, 'json');
      
      const saved = await fs.readJson(outputPath);
      expect(saved.target).toBe('vue3');
      expect(saved.inputDir).toBe('/input');
    });

    it('应该保存配置为 JS', async () => {
      const config = ConfigManager.createDefault('react', '/input', '/output');
      const outputPath = path.join(testDir, 'output.js');
      
      await ConfigManager.saveToFile(config, outputPath, 'js');
      
      const content = await fs.readFile(outputPath, 'utf-8');
      expect(content).toContain('export default');
      expect(content).toContain('"target": "react"');
    });

    it('应该创建输出目录', async () => {
      const config = ConfigManager.createDefault('vue3', '/input', '/output');
      const outputPath = path.join(testDir, 'nested', 'dir', 'config.json');
      
      await ConfigManager.saveToFile(config, outputPath);
      
      expect(await fs.pathExists(outputPath)).toBe(true);
    });
  });

  describe('getSummary', () => {
    it('应该生成配置摘要', () => {
      const config = ConfigManager.createDefault('vue3', '/input', '/output');
      config.prefix = 'Ld';
      
      const summary = ConfigManager.getSummary(config);
      
      expect(summary).toContain('目标框架: vue3');
      expect(summary).toContain('输入目录: /input');
      expect(summary).toContain('输出目录: /output');
      expect(summary).toContain('组件前缀: Ld');
      expect(summary).toContain('TypeScript: 是');
      expect(summary).toContain('SVG 优化: 是');
    });

    it('应该显示启用的功能', () => {
      const config = ConfigManager.createDefault('react', '/input', '/output');
      config.features!.animation = false;
      config.features!.theming = true;
      
      const summary = ConfigManager.getSummary(config);
      
      expect(summary).toContain('启用功能:');
      expect(summary).toContain('theming');
      expect(summary).not.toContain('animation');
    });
  });
});
