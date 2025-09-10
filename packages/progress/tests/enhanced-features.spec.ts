import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LinearProgress, CircularProgress, TextFormatters, getSizeConfig, getStatusColor, getStatusBackgroundColor } from '../src/index';

// Mock DOM environment
Object.defineProperty(window, 'HTMLCanvasElement', {
  value: class HTMLCanvasElement {
    style: Record<string, any> = {};
    setAttribute = vi.fn();
    appendChild = vi.fn();
    getContext() {
      return {
        fillRect: vi.fn(),
        clearRect: vi.fn(),
        getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
        putImageData: vi.fn(),
        createImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
        setTransform: vi.fn(),
        drawImage: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        closePath: vi.fn(),
        stroke: vi.fn(),
        fill: vi.fn(),
        arc: vi.fn(),
        createLinearGradient: vi.fn(() => ({
          addColorStop: vi.fn()
        })),
        createRadialGradient: vi.fn(() => ({
          addColorStop: vi.fn()
        })),
        setLineDash: vi.fn(),
        lineDashOffset: 0,
        clip: vi.fn(),
        fillText: vi.fn(),
        measureText: vi.fn(() => ({ width: 100 })),
        font: '',
        textAlign: 'center',
        textBaseline: 'middle'
      };
    }
    toDataURL() {
      return 'data:image/png;base64,test';
    }
  }
});

describe('Enhanced Features', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  describe('Size Presets', () => {
    it('should apply small size preset to linear progress', () => {
      const progress = new LinearProgress({
        container,
        size: 'small',
        value: 50
      });

      expect(progress.getValue()).toBe(50);
      // 验证尺寸配置被正确应用
      const sizeConfig = getSizeConfig('small', 'linear');
      expect(sizeConfig.height).toBe(6);
    });

    it('should apply large size preset to circular progress', () => {
      const progress = new CircularProgress({
        container,
        size: 'large',
        value: 75
      });

      expect(progress.getValue()).toBe(75);
      // 验证尺寸配置被正确应用
      const sizeConfig = getSizeConfig('large', 'circular');
      expect(sizeConfig.radius).toBe(70);
      expect(sizeConfig.strokeWidth).toBe(12);
    });

    it('should fallback to medium size for invalid size', () => {
      const sizeConfig = getSizeConfig('invalid', 'linear');
      const mediumConfig = getSizeConfig('medium', 'linear');
      expect(sizeConfig).toEqual(mediumConfig);
    });
  });

  describe('Status Presets', () => {
    it('should apply success status colors', () => {
      const progress = new LinearProgress({
        container,
        status: 'success',
        value: 100
      });

      expect(progress.getValue()).toBe(100);
      expect(getStatusColor('success')).toBe('#52C41A');
      expect(getStatusBackgroundColor('success')).toBe('#F6FFED');
    });

    it('should apply error status colors', () => {
      const progress = new LinearProgress({
        container,
        status: 'error',
        value: 0
      });

      expect(progress.getValue()).toBe(0);
      expect(getStatusColor('error')).toBe('#F5222D');
      expect(getStatusBackgroundColor('error')).toBe('#FFF2F0');
    });

    it('should change status dynamically', () => {
      const progress = new LinearProgress({
        container,
        status: 'normal',
        value: 50
      });

      expect(progress.getStatus()).toBe('normal');

      progress.setSuccess();
      expect(progress.getStatus()).toBe('success');

      progress.setError();
      expect(progress.getStatus()).toBe('error');

      progress.setWarning();
      expect(progress.getStatus()).toBe('warning');

      progress.setLoading();
      expect(progress.getStatus()).toBe('loading');

      progress.setNormal();
      expect(progress.getStatus()).toBe('normal');
    });
  });

  describe('Text Formatters', () => {
    it('should format percentage correctly', () => {
      expect(TextFormatters.percentage(75.6)).toBe('76%');
      expect(TextFormatters.percentageDecimal(75.6)).toBe('75.6%');
    });

    it('should format fraction correctly', () => {
      expect(TextFormatters.fraction(75)).toBe('75/100');
      expect(TextFormatters.fraction(30, 50)).toBe('30/50');
    });

    it('should format description correctly', () => {
      expect(TextFormatters.description(10)).toBe('开始');
      expect(TextFormatters.description(30)).toBe('进行中');
      expect(TextFormatters.description(60)).toBe('接近完成');
      expect(TextFormatters.description(90)).toBe('即将完成');
      expect(TextFormatters.description(100)).toBe('完成');
    });

    it('should format level correctly', () => {
      const result = TextFormatters.level(25);
      expect(result).toContain('★');
      expect(result).toContain('Lv.');
    });

    it('should format rating correctly', () => {
      const result = TextFormatters.rating(80);
      expect(result).toContain('★');
      expect(result.length).toBe(5); // 5 star rating
    });

    it('should format time correctly', () => {
      expect(TextFormatters.time(65)).toBe('1:05');
      expect(TextFormatters.time(30)).toBe('0:30');
    });

    it('should format file size correctly', () => {
      const result = TextFormatters.fileSize(50);
      expect(result).toMatch(/MB|KB|B/);
    });

    it('should format temperature correctly', () => {
      expect(TextFormatters.temperature(25.7)).toBe('26°C');
    });

    it('should format speed correctly', () => {
      expect(TextFormatters.speed(65.4)).toBe('65.4 km/h');
    });

    it('should format currency correctly', () => {
      expect(TextFormatters.currency(1.5)).toBe('$150.00');
    });
  });

  describe('Progress Bar with Text Formatters', () => {
    it('should use custom text formatter', () => {
      const progress = new LinearProgress({
        container,
        value: 75,
        text: {
          enabled: true,
          format: TextFormatters.percentage
        }
      });

      expect(progress.getValue()).toBe(75);
      // 文本格式化在渲染时应用，这里主要测试配置是否正确设置
    });

    it('should use description formatter', () => {
      const progress = new CircularProgress({
        container,
        value: 60,
        text: {
          enabled: true,
          format: TextFormatters.description
        }
      });

      expect(progress.getValue()).toBe(60);
    });
  });

  describe('Status Methods', () => {
    let progress: LinearProgress;

    beforeEach(() => {
      progress = new LinearProgress({
        container,
        value: 50
      });
    });

    it('should set and get status correctly', () => {
      progress.setStatus('success');
      expect(progress.getStatus()).toBe('success');
    });

    it('should have convenience status methods', () => {
      progress.setLoading();
      expect(progress.getStatus()).toBe('loading');

      progress.setSuccess();
      expect(progress.getStatus()).toBe('success');

      progress.setWarning();
      expect(progress.getStatus()).toBe('warning');

      progress.setError();
      expect(progress.getStatus()).toBe('error');

      progress.setNormal();
      expect(progress.getStatus()).toBe('normal');
    });
  });

  describe('Size and Status Integration', () => {
    it('should work with both size and status presets', () => {
      const progress = new LinearProgress({
        container,
        size: 'large',
        status: 'success',
        value: 80
      });

      expect(progress.getValue()).toBe(80);
      expect(progress.getStatus()).toBe('success');
    });

    it('should work with circular progress', () => {
      const progress = new CircularProgress({
        container,
        size: 'small',
        status: 'error',
        value: 25
      });

      expect(progress.getValue()).toBe(25);
      expect(progress.getStatus()).toBe('error');
    });
  });
});
