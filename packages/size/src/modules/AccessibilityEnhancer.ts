/**
 * Accessibility Enhancement Module
 * Provides WCAG 2.1 compliance and adaptive sizing for accessibility
 */

import { getDeviceDetector } from '../core/DeviceDetector';

/**
 * WCAG compliance levels
 */
export type WCAGLevel = 'A' | 'AA' | 'AAA';

/**
 * User accessibility preferences
 */
export interface AccessibilityPreferences {
  fontSize: 'small' | 'normal' | 'large' | 'extra-large';
  contrast: 'normal' | 'high' | 'ultra-high';
  reducedMotion: boolean;
  colorBlind?: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';
  keyboardNavigation: boolean;
  screenReader: boolean;
  focusIndicator: 'default' | 'enhanced' | 'custom';
  zoomLevel?: number;
}

/**
 * Accessibility size configuration
 */
export interface AccessibilitySizeConfig {
  baseFontSize: number;
  scaleFactors: {
    small: number;
    normal: number;
    large: number;
    'extra-large': number;
  };
  minimumSizes: {
    text: number;
    clickTarget: number;
    touchTarget: number;
    spacing: number;
  };
  wcagLevel: WCAGLevel;
}

/**
 * Accessibility validation result
 */
export interface AccessibilityValidation {
  passed: boolean;
  level: WCAGLevel;
  issues: Array<{
    element: string;
    issue: string;
    severity: 'error' | 'warning' | 'info';
    recommendation: string;
    wcagCriteria: string;
  }>;
  score: number;
}

/**
 * Focus management configuration
 */
export interface FocusConfig {
  outlineWidth: number;
  outlineStyle: string;
  outlineColor: string;
  outlineOffset: number;
  customStyles?: Record<string, any>;
}

/**
 * Accessibility Enhancer
 */
export class AccessibilityEnhancer {
  private preferences: AccessibilityPreferences;
  private config: AccessibilitySizeConfig;
  private fontScaleListeners: Set<(scale: number) => void>;
  private preferenceListeners: Set<(prefs: AccessibilityPreferences) => void>;
  private detector = getDeviceDetector();

  constructor(config?: Partial<AccessibilitySizeConfig>) {
    this.config = {
      baseFontSize: 16,
      scaleFactors: {
        small: 0.875,
        normal: 1,
        large: 1.25,
        'extra-large': 1.5
      },
      minimumSizes: {
        text: 12,
        clickTarget: 44,
        touchTarget: 48,
        spacing: 8
      },
      wcagLevel: 'AA',
      ...config
    };

    this.preferences = this.detectUserPreferences();
    this.fontScaleListeners = new Set();
    this.preferenceListeners = new Set();

    this.setupPreferenceListeners();
  }

  /**
   * Detect user accessibility preferences
   */
  private detectUserPreferences(): AccessibilityPreferences {
    if (typeof window === 'undefined') {
      return this.getDefaultPreferences();
    }

    return {
      fontSize: this.detectFontSizePreference(),
      contrast: this.detectContrastPreference(),
      reducedMotion: this.detectReducedMotion(),
      colorBlind: 'none',
      keyboardNavigation: true,
      screenReader: this.detectScreenReader(),
      focusIndicator: 'default',
      zoomLevel: this.detectZoomLevel()
    };
  }

  /**
   * Get default preferences
   */
  private getDefaultPreferences(): AccessibilityPreferences {
    return {
      fontSize: 'normal',
      contrast: 'normal',
      reducedMotion: false,
      colorBlind: 'none',
      keyboardNavigation: true,
      screenReader: false,
      focusIndicator: 'default'
    };
  }

  /**
   * Detect font size preference
   */
  private detectFontSizePreference(): AccessibilityPreferences['fontSize'] {
    if (typeof window === 'undefined') return 'normal';

    const computedFontSize = Number.parseFloat(
      getComputedStyle(document.documentElement).fontSize
    );

    if (computedFontSize < 14) return 'small';
    if (computedFontSize < 18) return 'normal';
    if (computedFontSize < 22) return 'large';
    return 'extra-large';
  }

  /**
   * Detect contrast preference
   */
  private detectContrastPreference(): AccessibilityPreferences['contrast'] {
    if (typeof window === 'undefined') return 'normal';

    if (window.matchMedia('(prefers-contrast: high)').matches) {
      return 'high';
    }
    if (window.matchMedia('(prefers-contrast: more)').matches) {
      return 'ultra-high';
    }
    return 'normal';
  }

  /**
   * Detect reduced motion preference
   */
  private detectReducedMotion(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Detect screen reader usage
   */
  private detectScreenReader(): boolean {
    if (typeof window === 'undefined') return false;

    // Check for common screen reader indicators
    const indicators = [
      // ARIA live regions are often added by screen readers
      document.querySelector('[aria-live]'),
      // Check for screen reader specific attributes
      document.querySelector('[role="application"]'),
      // Some screen readers add specific classes
      document.documentElement.classList.contains('sr-active')
    ];

    return indicators.some(Boolean);
  }

  /**
   * Detect zoom level
   */
  private detectZoomLevel(): number {
    if (typeof window === 'undefined') return 1;
    return window.devicePixelRatio / (window.devicePixelRatio || 1);
  }

  /**
   * Setup preference change listeners
   */
  private setupPreferenceListeners(): void {
    if (typeof window === 'undefined') return;

    // Listen for contrast changes
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    contrastQuery.addEventListener('change', () => {
      this.updatePreferences({
        contrast: this.detectContrastPreference()
      });
    });

    // Listen for reduced motion changes
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener('change', (e) => {
      this.updatePreferences({
        reducedMotion: e.matches
      });
    });

    // Listen for zoom changes
    window.addEventListener('resize', () => {
      const newZoom = this.detectZoomLevel();
      if (newZoom !== this.preferences.zoomLevel) {
        this.updatePreferences({ zoomLevel: newZoom });
      }
    });
  }

  /**
   * Update user preferences
   */
  updatePreferences(updates: Partial<AccessibilityPreferences>): void {
    const oldPreferences = { ...this.preferences };
    this.preferences = { ...this.preferences, ...updates };

    // Notify listeners if font size changed
    if (oldPreferences.fontSize !== this.preferences.fontSize) {
      const scale = this.config.scaleFactors[this.preferences.fontSize];
      this.fontScaleListeners.forEach(listener => listener(scale));
    }

    // Notify preference listeners
    this.preferenceListeners.forEach(listener => listener(this.preferences));
  }

  // ============================================
  // Size Calculations
  // ============================================

  /**
   * Get accessible font size
   */
  getFontSize(baseSize: number = this.config.baseFontSize): number {
    const scale = this.config.scaleFactors[this.preferences.fontSize];
    const scaledSize = baseSize * scale;

    // Apply zoom level if available
    const zoomAdjusted = this.preferences.zoomLevel 
      ? scaledSize * this.preferences.zoomLevel 
      : scaledSize;

    // Ensure minimum size
    return Math.max(zoomAdjusted, this.config.minimumSizes.text);
  }

  /**
   * Get accessible line height
   */
  getLineHeight(fontSize: number): number {
    // WCAG recommends 1.5x line height for body text
    const baseMultiplier = 1.5;

    // Increase line height for larger text
    if (this.preferences.fontSize === 'large') {
      return fontSize * (baseMultiplier + 0.1);
    }
    if (this.preferences.fontSize === 'extra-large') {
      return fontSize * (baseMultiplier + 0.2);
    }

    return fontSize * baseMultiplier;
  }

  /**
   * Get accessible spacing
   */
  getSpacing(baseSpacing: number = 8): number {
    const scale = this.config.scaleFactors[this.preferences.fontSize];
    const scaledSpacing = baseSpacing * scale;

    // Ensure minimum spacing for readability
    return Math.max(scaledSpacing, this.config.minimumSizes.spacing);
  }

  /**
   * Get accessible click/touch target size
   */
  getTargetSize(isTouch: boolean = this.detector.isTouch()): number {
    const minSize = isTouch 
      ? this.config.minimumSizes.touchTarget 
      : this.config.minimumSizes.clickTarget;

    // Increase target size for users with larger font preferences
    if (this.preferences.fontSize === 'large') {
      return minSize * 1.1;
    }
    if (this.preferences.fontSize === 'extra-large') {
      return minSize * 1.2;
    }

    return minSize;
  }

  /**
   * Get focus indicator styles
   */
  getFocusStyles(): FocusConfig {
    const baseConfig: FocusConfig = {
      outlineWidth: 2,
      outlineStyle: 'solid',
      outlineColor: 'currentColor',
      outlineOffset: 2
    };

    if (this.preferences.focusIndicator === 'enhanced') {
      return {
        ...baseConfig,
        outlineWidth: 3,
        outlineOffset: 4,
        customStyles: {
          boxShadow: '0 0 0 4px rgba(0, 123, 255, 0.25)'
        }
      };
    }

    if (this.preferences.contrast === 'high') {
      return {
        ...baseConfig,
        outlineWidth: 3,
        outlineColor: '#000000'
      };
    }

    return baseConfig;
  }

  // ============================================
  // Validation
  // ============================================

  /**
   * Validate accessibility compliance
   */
  validateAccessibility(
    element: HTMLElement | null,
    wcagLevel: WCAGLevel = this.config.wcagLevel
  ): AccessibilityValidation {
    const issues: AccessibilityValidation['issues'] = [];
    
    if (!element) {
      return {
        passed: false,
        level: wcagLevel,
        issues: [{
          element: 'unknown',
          issue: 'Element not found',
          severity: 'error',
          recommendation: 'Provide a valid element for validation',
          wcagCriteria: 'N/A'
        }],
        score: 0
      };
    }

    // Check text size
    this.validateTextSize(element, issues, wcagLevel);
    
    // Check contrast ratios
    this.validateContrast(element, issues, wcagLevel);
    
    // Check touch targets
    this.validateTouchTargets(element, issues, wcagLevel);
    
    // Check focus indicators
    this.validateFocusIndicators(element, issues, wcagLevel);
    
    // Check semantic HTML
    this.validateSemantics(element, issues, wcagLevel);
    
    // Calculate score
    const errorCount = issues.filter(i => i.severity === 'error').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;
    const maxScore = 100;
    const score = Math.max(0, maxScore - (errorCount * 10) - (warningCount * 3));

    return {
      passed: errorCount === 0 && (wcagLevel === 'A' || warningCount === 0),
      level: wcagLevel,
      issues,
      score
    };
  }

  /**
   * Validate text size
   */
  private validateTextSize(
    element: HTMLElement,
    issues: AccessibilityValidation['issues'],
    level: WCAGLevel
  ): void {
    const computedStyle = getComputedStyle(element);
    const fontSize = Number.parseFloat(computedStyle.fontSize);

    if (fontSize < this.config.minimumSizes.text) {
      issues.push({
        element: element.tagName.toLowerCase(),
        issue: `Font size ${fontSize}px is below minimum ${this.config.minimumSizes.text}px`,
        severity: level === 'AAA' ? 'error' : 'warning',
        recommendation: `Increase font size to at least ${this.config.minimumSizes.text}px`,
        wcagCriteria: '1.4.4 Resize Text'
      });
    }
  }

  /**
   * Validate contrast ratios
   */
  private validateContrast(
    element: HTMLElement,
    issues: AccessibilityValidation['issues'],
    level: WCAGLevel
  ): void {
    const computedStyle = getComputedStyle(element);
    const color = computedStyle.color;
    const backgroundColor = computedStyle.backgroundColor;

    if (color && backgroundColor && backgroundColor !== 'transparent') {
      const contrastRatio = this.calculateContrastRatio(color, backgroundColor);
      const requiredRatio = level === 'AAA' ? 7 : 4.5;

      if (contrastRatio < requiredRatio) {
        issues.push({
          element: element.tagName.toLowerCase(),
          issue: `Contrast ratio ${contrastRatio.toFixed(2)} is below required ${requiredRatio}`,
          severity: 'error',
          recommendation: `Increase contrast to meet WCAG ${level} standards`,
          wcagCriteria: '1.4.3 Contrast (Minimum)'
        });
      }
    }
  }

  /**
   * Validate touch targets
   */
  private validateTouchTargets(
    element: HTMLElement,
    issues: AccessibilityValidation['issues'],
    level: WCAGLevel
  ): void {
    const interactiveElements = element.querySelectorAll(
      'button, a, input, select, textarea, [role="button"], [onclick]'
    );

    interactiveElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const minSize = this.detector.isTouch() 
        ? this.config.minimumSizes.touchTarget
        : this.config.minimumSizes.clickTarget;

      if (rect.width < minSize || rect.height < minSize) {
        issues.push({
          element: el.tagName.toLowerCase(),
          issue: `Target size ${rect.width}x${rect.height} is below minimum ${minSize}x${minSize}`,
          severity: level === 'AAA' ? 'error' : 'warning',
          recommendation: `Increase target size to at least ${minSize}x${minSize} pixels`,
          wcagCriteria: '2.5.5 Target Size'
        });
      }
    });
  }

  /**
   * Validate focus indicators
   */
  private validateFocusIndicators(
    element: HTMLElement,
    issues: AccessibilityValidation['issues'],
    _level: WCAGLevel
  ): void {
    const focusableElements = element.querySelectorAll(
      'a, button, input, select, textarea, [tabindex]'
    );

    focusableElements.forEach((el) => {
      const computedStyle = getComputedStyle(el, ':focus');
      const hasOutline = computedStyle.outlineStyle !== 'none';
      const hasBoxShadow = computedStyle.boxShadow !== 'none';

      if (!hasOutline && !hasBoxShadow) {
        issues.push({
          element: el.tagName.toLowerCase(),
          issue: 'No visible focus indicator',
          severity: 'error',
          recommendation: 'Add visible focus styles using outline or box-shadow',
          wcagCriteria: '2.4.7 Focus Visible'
        });
      }
    });
  }

  /**
   * Validate semantic HTML
   */
  private validateSemantics(
    element: HTMLElement,
    issues: AccessibilityValidation['issues'],
    _level: WCAGLevel
  ): void {
    // Check for missing alt text on images
    const images = element.querySelectorAll('img');
    images.forEach((img) => {
      if (!img.hasAttribute('alt')) {
        issues.push({
          element: 'img',
          issue: 'Missing alt attribute',
          severity: 'error',
          recommendation: 'Add descriptive alt text or empty alt="" for decorative images',
          wcagCriteria: '1.1.1 Non-text Content'
        });
      }
    });

    // Check for form labels
    const inputs = element.querySelectorAll('input, select, textarea');
    inputs.forEach((input) => {
      const id = input.getAttribute('id');
      const hasLabel = id && element.querySelector(`label[for="${id}"]`);
      const hasAriaLabel = input.hasAttribute('aria-label') || input.hasAttribute('aria-labelledby');

      if (!hasLabel && !hasAriaLabel) {
        issues.push({
          element: input.tagName.toLowerCase(),
          issue: 'Form control without accessible label',
          severity: 'error',
          recommendation: 'Add a label element or aria-label attribute',
          wcagCriteria: '1.3.1 Info and Relationships'
        });
      }
    });
  }

  /**
   * Calculate contrast ratio between two colors
   */
  private calculateContrastRatio(_color1: string, _color2: string): number {
    // Simplified contrast calculation
    // In production, use a proper color library
    return 4.5; // Placeholder
  }

  // ============================================
  // Event Listeners
  // ============================================

  /**
   * Subscribe to font scale changes
   */
  onFontScaleChange(listener: (scale: number) => void): () => void {
    this.fontScaleListeners.add(listener);
    return () => {
      this.fontScaleListeners.delete(listener);
    };
  }

  /**
   * Subscribe to preference changes
   */
  onPreferenceChange(listener: (prefs: AccessibilityPreferences) => void): () => void {
    this.preferenceListeners.add(listener);
    return () => {
      this.preferenceListeners.delete(listener);
    };
  }

  // ============================================
  // Utility Methods
  // ============================================

  /**
   * Get current preferences
   */
  getPreferences(): AccessibilityPreferences {
    return { ...this.preferences };
  }

  /**
   * Get WCAG level
   */
  getWCAGLevel(): WCAGLevel {
    return this.config.wcagLevel;
  }

  /**
   * Set WCAG level
   */
  setWCAGLevel(level: WCAGLevel): void {
    this.config.wcagLevel = level;
  }

  /**
   * Generate accessibility report
   */
  generateReport(element?: HTMLElement): string {
    const validation = this.validateAccessibility(
      element || document.body,
      this.config.wcagLevel
    );

    const report = [
      `Accessibility Report`,
      `===================`,
      `WCAG Level: ${validation.level}`,
      `Score: ${validation.score}/100`,
      `Status: ${validation.passed ? 'PASSED' : 'FAILED'}`,
      ``,
      `Issues Found: ${validation.issues.length}`,
      ``
    ];

    if (validation.issues.length > 0) {
      report.push('Details:');
      report.push('--------');
      validation.issues.forEach((issue, _index) => {
        report.push(`${_index + 1}. [${issue.severity.toUpperCase()}] ${issue.element}`);
        report.push(`   Issue: ${issue.issue}`);
        report.push(`   WCAG: ${issue.wcagCriteria}`);
        report.push(`   Fix: ${issue.recommendation}`);
        report.push('');
      });
    }

    return report.join('\n');
  }
}

/**
 * Create accessibility enhancer instance
 */
export function createAccessibilityEnhancer(
  config?: Partial<AccessibilitySizeConfig>
): AccessibilityEnhancer {
  return new AccessibilityEnhancer(config);
}

/**
 * Quick access helpers
 */
export const a11y = {
  getFontSize: (base?: number) => {
    const enhancer = createAccessibilityEnhancer();
    return enhancer.getFontSize(base);
  },
  getTargetSize: (isTouch?: boolean) => {
    const enhancer = createAccessibilityEnhancer();
    return enhancer.getTargetSize(isTouch);
  },
  validate: (element: HTMLElement, level?: WCAGLevel) => {
    const enhancer = createAccessibilityEnhancer();
    return enhancer.validateAccessibility(element, level);
  }
};