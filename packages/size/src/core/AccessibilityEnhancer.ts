/**
 * @ldesign/size - Accessibility Enhancer
 * 
 * WCAG compliance checking and automatic adjustments
 */

import { getDeviceDetector } from './DeviceDetector';
import { sizeManager } from './SizeManager';

export type WCAGLevel = 'A' | 'AA' | 'AAA';
export type ColorBlindnessType = 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';

export interface ComplianceReport {
  level: WCAGLevel;
  passed: boolean;
  violations: Array<{
    rule: string;
    severity: 'error' | 'warning';
    element?: HTMLElement;
    message: string;
    solution?: string;
  }>;
  score: number;
}

export interface ValidationResult {
  valid: boolean;
  issues: string[];
  recommendations: string[];
}

export interface ContrastRatio {
  ratio: number;
  passes: {
    AA: boolean;
    AAA: boolean;
  };
}

export class AccessibilityEnhancer {
  private currentLevel: WCAGLevel = 'AA';
  private colorBlindnessMode: ColorBlindnessType | null = null;
  private styleElements: HTMLStyleElement[] = [];
  private svgElements: SVGElement[] = [];
  private elementCache = new WeakMap<HTMLElement, { color?: string; backgroundColor?: string; contrast?: number }>();
  private isDestroyed = false;

  /**
   * Check WCAG compliance
   */
  checkWCAGCompliance(level: WCAGLevel = 'AA'): ComplianceReport {
    const violations: ComplianceReport['violations'] = [];
    let passedChecks = 0;
    let totalChecks = 0;

    if (typeof document === 'undefined') {
      return { level, passed: false, violations: [], score: 0 };
    }

    // Check font sizes
    totalChecks++;
    const fontSizeViolations = this.checkFontSizes(level);
    if (fontSizeViolations.length === 0) passedChecks++;
    violations.push(...fontSizeViolations);

    // Check touch targets
    totalChecks++;
    const touchTargetViolations = this.checkTouchTargets(level);
    if (touchTargetViolations.length === 0) passedChecks++;
    violations.push(...touchTargetViolations);

    // Check contrast ratios
    totalChecks++;
    const contrastViolations = this.checkContrastRatios(level);
    if (contrastViolations.length === 0) passedChecks++;
    violations.push(...contrastViolations);

    // Check focus indicators
    totalChecks++;
    const focusViolations = this.checkFocusIndicators();
    if (focusViolations.length === 0) passedChecks++;
    violations.push(...focusViolations);

    // Check line height
    totalChecks++;
    const lineHeightViolations = this.checkLineHeight(level);
    if (lineHeightViolations.length === 0) passedChecks++;
    violations.push(...lineHeightViolations);

    const score = (passedChecks / totalChecks) * 100;
    const passed = violations.filter(v => v.severity === 'error').length === 0;

    return { level, passed, violations, score };
  }

  /**
   * Check font sizes for WCAG compliance
   */
  private checkFontSizes(level: WCAGLevel): ComplianceReport['violations'] {
    const violations: ComplianceReport['violations'] = [];
    const minSizes = {
      'A': 12,
      'AA': 14,
      'AAA': 16
    };

    const minSize = minSizes[level];
    // 优化：只检查有文本内容的元素
    const elements = document.querySelectorAll('p, div, span, h1, h2, h3, h4, h5, h6, li, a, button, td, th, label');

    // 使用批处理减少重绘
    const batchSize = 100;
    const elementArray = Array.from(elements);
    
    for (let i = 0; i < elementArray.length; i += batchSize) {
      const batch = elementArray.slice(i, i + batchSize);
      batch.forEach(element => {
        const styles = window.getComputedStyle(element);
        const fontSize = Number.parseFloat(styles.fontSize);
        
        if (fontSize < minSize && element.textContent?.trim()) {
        violations.push({
          rule: 'WCAG 1.4.4 Resize Text',
          severity: 'error',
          element: element as HTMLElement,
          message: `Font size ${fontSize}px is below minimum ${minSize}px for WCAG ${level}`,
          solution: `Increase font size to at least ${minSize}px`
          });
        }
      });
    }

    return violations;
  }

  /**
   * Check touch target sizes
   */
  private checkTouchTargets(level: WCAGLevel): ComplianceReport['violations'] {
    const violations: ComplianceReport['violations'] = [];
    const minSizes = {
      'A': 24,
      'AA': 44,
      'AAA': 48
    };

    const minSize = minSizes[level];
    const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [role="button"], [onclick]');

    interactiveElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      
      if (width < minSize || height < minSize) {
        violations.push({
          rule: 'WCAG 2.5.5 Target Size',
          severity: level === 'AAA' ? 'error' : 'warning',
          element: element as HTMLElement,
          message: `Touch target ${width}x${height}px is below minimum ${minSize}x${minSize}px`,
          solution: `Increase touch target to at least ${minSize}x${minSize}px`
        });
      }
    });

    return violations;
  }

  /**
   * Check contrast ratios
   */
  private checkContrastRatios(level: WCAGLevel): ComplianceReport['violations'] {
    const violations: ComplianceReport['violations'] = [];
    // 优化：只检查有文本的元素
    const elements = document.querySelectorAll('p, div, span, h1, h2, h3, h4, h5, h6, li, a, button, td, th, label');

    // 使用缓存减少重复计算
    elements.forEach(element => {
      const htmlElement = element as HTMLElement;
      
      // 检查缓存
      let cached = this.elementCache.get(htmlElement);
      if (!cached) {
        cached = {};
        this.elementCache.set(htmlElement, cached);
      }
      
      const styles = window.getComputedStyle(element);
      const color = cached.color || styles.color;
      const backgroundColor = cached.backgroundColor || this.getBackgroundColor(htmlElement);
      
      if (!cached.color) cached.color = color;
      if (!cached.backgroundColor) cached.backgroundColor = backgroundColor;
      
      if (color && backgroundColor && element.textContent?.trim()) {
        const contrast = this.calculateContrast(color, backgroundColor);
        const fontSize = Number.parseFloat(styles.fontSize);
        const fontWeight = styles.fontWeight;
        const isLarge = fontSize >= 18 || (fontSize >= 14 && Number.parseInt(fontWeight) >= 700);
        
        const requiredRatio = {
          'A': isLarge ? 3 : 4.5,
          'AA': isLarge ? 3 : 4.5,
          'AAA': isLarge ? 4.5 : 7
        };

        if (contrast.ratio < requiredRatio[level]) {
          violations.push({
            rule: 'WCAG 1.4.3 Contrast',
            severity: 'error',
            element: element as HTMLElement,
            message: `Contrast ratio ${contrast.ratio.toFixed(2)}:1 is below ${requiredRatio[level]}:1 for WCAG ${level}`,
            solution: 'Adjust text or background color to improve contrast'
          });
        }
      }
    });

    return violations;
  }

  /**
   * Check focus indicators
   */
  private checkFocusIndicators(): ComplianceReport['violations'] {
    const violations: ComplianceReport['violations'] = [];
    const focusableElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]');

    focusableElements.forEach(element => {
      const styles = window.getComputedStyle(element);
      const outlineWidth = styles.outlineWidth;
      const outlineStyle = styles.outlineStyle;
      
      if (outlineStyle === 'none' || Number.parseFloat(outlineWidth) < 2) {
        violations.push({
          rule: 'WCAG 2.4.7 Focus Visible',
          severity: 'warning',
          element: element as HTMLElement,
          message: 'Focus indicator is missing or insufficient',
          solution: 'Add visible focus indicator with at least 2px outline'
        });
      }
    });

    return violations;
  }

  /**
   * Check line height
   */
  private checkLineHeight(level: WCAGLevel): ComplianceReport['violations'] {
    const violations: ComplianceReport['violations'] = [];
    const minLineHeight = level === 'AAA' ? 1.5 : 1.4;
    
    const textElements = document.querySelectorAll('p, div, span, li, td');

    textElements.forEach(element => {
      const styles = window.getComputedStyle(element);
      const lineHeight = Number.parseFloat(styles.lineHeight);
      const fontSize = Number.parseFloat(styles.fontSize);
      const ratio = lineHeight / fontSize;
      
      if (ratio < minLineHeight && element.textContent?.trim()) {
        violations.push({
          rule: 'WCAG 1.4.12 Text Spacing',
          severity: 'warning',
          element: element as HTMLElement,
          message: `Line height ratio ${ratio.toFixed(2)} is below recommended ${minLineHeight}`,
          solution: `Increase line height to at least ${minLineHeight}x font size`
        });
      }
    });

    return violations;
  }

  /**
   * Auto-adjust for accessibility
   */
  autoAdjustForA11y(level: WCAGLevel = 'AA'): void {
    this.currentLevel = level;
    const report = this.checkWCAGCompliance(level);
    
    // Auto-fix violations
    report.violations.forEach(violation => {
      if (violation.element) {
        this.applyFix(violation);
      }
    });

    // Adjust global sizes based on level
    const baseSizeAdjustments = {
      'A': 0,
      'AA': 1,
      'AAA': 2
    };

    const currentConfig = sizeManager.getConfig();
    const adjustedSize = currentConfig.baseSize + baseSizeAdjustments[level];
    
    if (adjustedSize !== currentConfig.baseSize) {
      sizeManager.setBaseSize(adjustedSize);
      console.log(`[A11y] Base size adjusted to ${adjustedSize}px for WCAG ${level}`);
    }
  }

  /**
   * Apply fix for violation
   */
  private applyFix(violation: ComplianceReport['violations'][0]): void {
    if (!violation.element) return;

    switch (violation.rule) {
      case 'WCAG 1.4.4 Resize Text':
        violation.element.style.fontSize = '14px';
        break;
      
      case 'WCAG 2.5.5 Target Size':
        violation.element.style.minWidth = '44px';
        violation.element.style.minHeight = '44px';
        violation.element.style.padding = '8px';
        break;
      
      case 'WCAG 2.4.7 Focus Visible':
        violation.element.style.outline = '2px solid #1890ff';
        violation.element.style.outlineOffset = '2px';
        break;
      
      case 'WCAG 1.4.12 Text Spacing':
        violation.element.style.lineHeight = '1.5';
        break;
    }
  }

  /**
   * Adapt for color blindness
   */
  adaptForColorBlindness(type: ColorBlindnessType): void {
    this.colorBlindnessMode = type;
    
    // Create CSS filter
    const filters = {
      protanopia: 'url(#protanopia-filter)',
      deuteranopia: 'url(#deuteranopia-filter)',
      tritanopia: 'url(#tritanopia-filter)',
      achromatopsia: 'grayscale(100%)'
    };

    // Apply filter to document
    if (typeof document !== 'undefined') {
      document.documentElement.style.filter = filters[type];
      
      // Add SVG filters if needed
      if (type !== 'achromatopsia') {
        this.addColorBlindnessFilter(type);
      }
    }

    console.log(`[A11y] Color blindness mode activated: ${type}`);
  }

  /**
   * Add SVG filter for color blindness
   */
  private addColorBlindnessFilter(type: ColorBlindnessType): void {
    const filterMatrices: Record<string, number[][]> = {
      protanopia: [
        [0.567, 0.433, 0],
        [0.558, 0.442, 0],
        [0, 0.242, 0.758]
      ],
      deuteranopia: [
        [0.625, 0.375, 0],
        [0.7, 0.3, 0],
        [0, 0.3, 0.7]
      ],
      tritanopia: [
        [0.95, 0.05, 0],
        [0, 0.433, 0.567],
        [0, 0.475, 0.525]
      ],
      achromatopsia: [
        [0.299, 0.587, 0.114],
        [0.299, 0.587, 0.114],
        [0.299, 0.587, 0.114]
      ]
    };

    const matrix = filterMatrices[type];
    if (!matrix) return;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.position = 'absolute';
    svg.style.width = '0';
    svg.style.height = '0';
    
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', `${type}-filter`);
    
    const colorMatrix = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
    colorMatrix.setAttribute('type', 'matrix');
    colorMatrix.setAttribute('values', 
      `${matrix[0].join(' ')} 0 0 ` +
      `${matrix[1].join(' ')} 0 0 ` +
      `${matrix[2].join(' ')} 0 0 ` +
      `0 0 0 1 0`
    );
    
    filter.appendChild(colorMatrix);
    svg.appendChild(filter);
    document.body.appendChild(svg);
    this.svgElements.push(svg);
  }

  /**
   * Optimize focus indicators
   */
  optimizeFocusIndicators(): void {
    if (this.isDestroyed) return;
    
    // 检查是否已存在
    const existingStyle = document.getElementById('ldesign-a11y-focus');
    if (existingStyle) {
      return;
    }
    
    const style = document.createElement('style');
    style.id = 'ldesign-a11y-focus';
    this.styleElements.push(style);
    style.textContent = `
      *:focus {
        outline: 2px solid #1890ff !important;
        outline-offset: 2px !important;
      }
      
      *:focus:not(:focus-visible) {
        outline: none !important;
      }
      
      *:focus-visible {
        outline: 3px solid #1890ff !important;
        outline-offset: 3px !important;
        box-shadow: 0 0 0 4px rgba(24, 144, 255, 0.2) !important;
      }
      
      button:focus-visible,
      a:focus-visible,
      input:focus-visible,
      select:focus-visible,
      textarea:focus-visible {
        position: relative;
        z-index: 1;
      }
    `;
    
    document.head.appendChild(style);
    console.log('[A11y] Focus indicators optimized');
  }

  /**
   * Validate touch targets
   */
  validateTouchTargets(): ValidationResult {
    const issues: string[] = [];
    const recommendations: string[] = [];
    const minSize = getDeviceDetector().isTouch() ? 44 : 24;
    
    const targets = document.querySelectorAll('button, a, input, select, textarea, [role="button"]');
    let tooSmall = 0;
    
    targets.forEach(target => {
      const rect = target.getBoundingClientRect();
      if (rect.width < minSize || rect.height < minSize) {
        tooSmall++;
      }
    });
    
    if (tooSmall > 0) {
      issues.push(`${tooSmall} touch targets are below ${minSize}px`);
      recommendations.push(`Increase touch target size to at least ${minSize}x${minSize}px`);
    }
    
    return {
      valid: issues.length === 0,
      issues,
      recommendations
    };
  }

  /**
   * Calculate contrast ratio between two colors
   */
  private calculateContrast(color1: string, color2: string): ContrastRatio {
    const rgb1 = this.parseColor(color1);
    const rgb2 = this.parseColor(color2);
    
    const l1 = this.getLuminance(rgb1);
    const l2 = this.getLuminance(rgb2);
    
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    
    return {
      ratio,
      passes: {
        AA: ratio >= 4.5,
        AAA: ratio >= 7
      }
    };
  }

  /**
   * Get luminance of RGB color
   */
  private getLuminance(rgb: number[]): number {
    const [r, g, b] = rgb.map(val => {
      val = val / 255;
      return val <= 0.03928 ? val / 12.92 : ((val + 0.055) / 1.055)**2.4;
    });
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * Parse color string to RGB
   */
  private parseColor(color: string): number[] {
    // Simple RGB parser (would need to handle more formats in production)
    const match = color.match(/\d+/g);
    if (match) {
      return match.slice(0, 3).map(Number);
    }
    return [0, 0, 0];
  }

  /**
   * Get computed background color of element
   */
  private getBackgroundColor(element: HTMLElement): string {
    let bgColor = window.getComputedStyle(element).backgroundColor;
    let parent = element.parentElement;
    
    while (bgColor === 'rgba(0, 0, 0, 0)' && parent) {
      bgColor = window.getComputedStyle(parent).backgroundColor;
      parent = parent.parentElement;
    }
    
    return bgColor || 'rgb(255, 255, 255)';
  }

  /**
   * Reset color blindness mode
   */
  resetColorBlindness(): void {
    if (typeof document !== 'undefined') {
      document.documentElement.style.filter = '';
      this.colorBlindnessMode = null;
    }
  }

  /**
   * Get current accessibility status
   */
  getStatus(): {
    level: WCAGLevel;
    colorBlindnessMode: ColorBlindnessType | null;
    compliance: ComplianceReport;
  } {
    return {
      level: this.currentLevel,
      colorBlindnessMode: this.colorBlindnessMode,
      compliance: this.checkWCAGCompliance(this.currentLevel)
    };
  }
  
  /**
   * Destroy and clean up resources
   */
  destroy(): void {
    if (this.isDestroyed) return;
    
    this.isDestroyed = true;
    
    // Reset color blindness
    this.resetColorBlindness();
    
    // Remove style elements
    this.styleElements.forEach(style => {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    });
    this.styleElements = [];
    
    // Remove SVG elements
    this.svgElements.forEach(svg => {
      if (svg.parentNode) {
        svg.parentNode.removeChild(svg);
      }
    });
    this.svgElements = [];
    
    // Clear cache
    this.elementCache = new WeakMap();
  }
}

// Singleton instance
let enhancer: AccessibilityEnhancer | null = null;

/**
 * Get accessibility enhancer instance
 */
export function getAccessibilityEnhancer(): AccessibilityEnhancer {
  if (!enhancer) {
    enhancer = new AccessibilityEnhancer();
  }
  return enhancer;
}

/**
 * Quick access API
 */
export const a11y = {
  check: (level?: WCAGLevel) => getAccessibilityEnhancer().checkWCAGCompliance(level),
  autoAdjust: (level?: WCAGLevel) => getAccessibilityEnhancer().autoAdjustForA11y(level),
  colorBlindness: (type: ColorBlindnessType) => getAccessibilityEnhancer().adaptForColorBlindness(type),
  resetColorBlindness: () => getAccessibilityEnhancer().resetColorBlindness(),
  focusIndicators: () => getAccessibilityEnhancer().optimizeFocusIndicators(),
  validateTouch: () => getAccessibilityEnhancer().validateTouchTargets(),
  status: () => getAccessibilityEnhancer().getStatus()
};