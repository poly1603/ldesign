/**
 * @ldesign/size - Size Migration Tool
 * 
 * Helps migrate from other CSS frameworks to ldesign size system
 */


export type Framework = 'bootstrap' | 'tailwind' | 'antd' | 'material-ui' | 'bulma' | 'custom';

export interface MigrationConfig {
  from: Framework;
  to?: 'ldesign';
  customMappings?: Record<string, string>;
  preserveOriginal?: boolean;
  autoApply?: boolean;
}

export interface MigrationReport {
  framework: Framework;
  timestamp: Date;
  statistics: {
    totalClasses: number;
    migratedClasses: number;
    unmappedClasses: string[];
    warnings: string[];
  };
  mappings: Record<string, string>;
  rollbackData?: string;
}

export interface MigrationMapping {
  pattern: RegExp;
  replacement: string | ((match: string) => string);
  description?: string;
}

// Framework-specific mappings - 使用懒加载以减少内存占用
const FRAMEWORK_MAPPINGS_LOADER = new Map<Framework, () => MigrationMapping[]>();

// 懒加载获取映射
function getFrameworkMappings(framework: Framework): MigrationMapping[] {
  if (!FRAMEWORK_MAPPINGS_LOADER.has(framework)) {
    initializeMappings();
  }
  const loader = FRAMEWORK_MAPPINGS_LOADER.get(framework);
  return loader ? loader() : [];
}

// 延迟初始化映射，只在需要时加载
function initializeMappings(): void {
  if (FRAMEWORK_MAPPINGS_LOADER.size > 0) return;
  
  // Bootstrap mappings
  FRAMEWORK_MAPPINGS_LOADER.set('bootstrap', () => [
    // Spacing utilities
    { pattern: /\bp-0\b/g, replacement: 'p-none' },
    { pattern: /\bp-1\b/g, replacement: 'p-tiny' },
    { pattern: /\bp-2\b/g, replacement: 'p-small' },
    { pattern: /\bp-3\b/g, replacement: 'p-medium' },
    { pattern: /\bp-4\b/g, replacement: 'p-large' },
    { pattern: /\bp-5\b/g, replacement: 'p-huge' },
    { pattern: /\bm-0\b/g, replacement: 'm-none' },
    { pattern: /\bm-1\b/g, replacement: 'm-tiny' },
    { pattern: /\bm-2\b/g, replacement: 'm-small' },
    { pattern: /\bm-3\b/g, replacement: 'm-medium' },
    { pattern: /\bm-4\b/g, replacement: 'm-large' },
    { pattern: /\bm-5\b/g, replacement: 'm-huge' },
    
    // Font sizes
    { pattern: /\bfs-1\b/g, replacement: 'text-4xl' },
    { pattern: /\bfs-2\b/g, replacement: 'text-3xl' },
    { pattern: /\bfs-3\b/g, replacement: 'text-2xl' },
    { pattern: /\bfs-4\b/g, replacement: 'text-xl' },
    { pattern: /\bfs-5\b/g, replacement: 'text-lg' },
    { pattern: /\bfs-6\b/g, replacement: 'text-base' },
    
    // Display utilities
    { pattern: /\bdisplay-1\b/g, replacement: 'text-display1' },
    { pattern: /\bdisplay-2\b/g, replacement: 'text-display2' },
    { pattern: /\bdisplay-3\b/g, replacement: 'text-display3' },
    
    // Buttons
    { pattern: /\bbtn-sm\b/g, replacement: 'btn-small' },
    { pattern: /\bbtn-lg\b/g, replacement: 'btn-large' },
    
    // Border radius
    { pattern: /\brounded-0\b/g, replacement: 'rounded-none' },
    { pattern: /\brounded-1\b/g, replacement: 'rounded-small' },
    { pattern: /\brounded-2\b/g, replacement: 'rounded-medium' },
    { pattern: /\brounded-3\b/g, replacement: 'rounded-large' },
    { pattern: /\brounded-circle\b/g, replacement: 'rounded-circle' },
    { pattern: /\brounded-pill\b/g, replacement: 'rounded-full' }
  ]);

  // Tailwind mappings
  FRAMEWORK_MAPPINGS_LOADER.set('tailwind', () => [
    // Spacing (Tailwind uses 0.25rem = 4px units)
    { pattern: /\bp-0\b/g, replacement: 'p-none' },
    { pattern: /\bp-1\b/g, replacement: 'p-tiny' },
    { pattern: /\bp-2\b/g, replacement: 'p-small' },
    { pattern: /\bp-4\b/g, replacement: 'p-medium' },
    { pattern: /\bp-6\b/g, replacement: 'p-large' },
    { pattern: /\bp-8\b/g, replacement: 'p-huge' },
    { pattern: /\bm-0\b/g, replacement: 'm-none' },
    { pattern: /\bm-1\b/g, replacement: 'm-tiny' },
    { pattern: /\bm-2\b/g, replacement: 'm-small' },
    { pattern: /\bm-4\b/g, replacement: 'm-medium' },
    { pattern: /\bm-6\b/g, replacement: 'm-large' },
    { pattern: /\bm-8\b/g, replacement: 'm-huge' },
    
    // Text sizes
    { pattern: /\btext-xs\b/g, replacement: 'text-2xs' },
    { pattern: /\btext-sm\b/g, replacement: 'text-sm' },
    { pattern: /\btext-base\b/g, replacement: 'text-base' },
    { pattern: /\btext-lg\b/g, replacement: 'text-lg' },
    { pattern: /\btext-xl\b/g, replacement: 'text-xl' },
    { pattern: /\btext-2xl\b/g, replacement: 'text-2xl' },
    { pattern: /\btext-3xl\b/g, replacement: 'text-3xl' },
    { pattern: /\btext-4xl\b/g, replacement: 'text-4xl' },
    
    // Line height
    { pattern: /\bleading-none\b/g, replacement: 'leading-none' },
    { pattern: /\bleading-tight\b/g, replacement: 'leading-tight' },
    { pattern: /\bleading-snug\b/g, replacement: 'leading-snug' },
    { pattern: /\bleading-normal\b/g, replacement: 'leading-normal' },
    { pattern: /\bleading-relaxed\b/g, replacement: 'leading-relaxed' },
    { pattern: /\bleading-loose\b/g, replacement: 'leading-loose' },
    
    // Letter spacing
    { pattern: /\btracking-tighter\b/g, replacement: 'tracking-tighter' },
    { pattern: /\btracking-tight\b/g, replacement: 'tracking-tight' },
    { pattern: /\btracking-normal\b/g, replacement: 'tracking-normal' },
    { pattern: /\btracking-wide\b/g, replacement: 'tracking-wide' },
    { pattern: /\btracking-wider\b/g, replacement: 'tracking-wider' },
    { pattern: /\btracking-widest\b/g, replacement: 'tracking-widest' },
    
    // Border radius
    { pattern: /\brounded-none\b/g, replacement: 'rounded-none' },
    { pattern: /\brounded-sm\b/g, replacement: 'rounded-small' },
    { pattern: /\brounded\b/g, replacement: 'rounded-medium' },
    { pattern: /\brounded-md\b/g, replacement: 'rounded-medium' },
    { pattern: /\brounded-lg\b/g, replacement: 'rounded-large' },
    { pattern: /\brounded-xl\b/g, replacement: 'rounded-huge' },
    { pattern: /\brounded-full\b/g, replacement: 'rounded-full' }
  ]);

  // Ant Design mappings
  FRAMEWORK_MAPPINGS_LOADER.set('antd', () => [
    { pattern: /\bant-typography-title\b/g, replacement: 'text-h1' },
    { pattern: /\bant-btn-sm\b/g, replacement: 'btn-small' },
    { pattern: /\bant-btn-lg\b/g, replacement: 'btn-large' },
    { pattern: /\bant-space-compact\b/g, replacement: 'spacing-compact' },
    { pattern: /\bant-input-sm\b/g, replacement: 'input-small' },
    { pattern: /\bant-input-lg\b/g, replacement: 'input-large' }
  ]);

  // Material UI mappings
  FRAMEWORK_MAPPINGS_LOADER.set('material-ui', () => [
    { pattern: /\bMuiButton-sizeSmall\b/g, replacement: 'btn-small' },
    { pattern: /\bMuiButton-sizeMedium\b/g, replacement: 'btn-medium' },
    { pattern: /\bMuiButton-sizeLarge\b/g, replacement: 'btn-large' },
    { pattern: /\bMuiTypography-h1\b/g, replacement: 'text-h1' },
    { pattern: /\bMuiTypography-h2\b/g, replacement: 'text-h2' },
    { pattern: /\bMuiTypography-body1\b/g, replacement: 'text-base' },
    { pattern: /\bMuiTypography-caption\b/g, replacement: 'text-caption' }
  ]);

  // Bulma mappings
  FRAMEWORK_MAPPINGS_LOADER.set('bulma', () => [
    { pattern: /\bis-size-1\b/g, replacement: 'text-4xl' },
    { pattern: /\bis-size-2\b/g, replacement: 'text-3xl' },
    { pattern: /\bis-size-3\b/g, replacement: 'text-2xl' },
    { pattern: /\bis-size-4\b/g, replacement: 'text-xl' },
    { pattern: /\bis-size-5\b/g, replacement: 'text-lg' },
    { pattern: /\bis-size-6\b/g, replacement: 'text-base' },
    { pattern: /\bis-size-7\b/g, replacement: 'text-sm' },
    { pattern: /\bbutton.is-small\b/g, replacement: 'btn-small' },
    { pattern: /\bbutton.is-normal\b/g, replacement: 'btn-medium' },
    { pattern: /\bbutton.is-medium\b/g, replacement: 'btn-medium' },
    { pattern: /\bbutton.is-large\b/g, replacement: 'btn-large' }
  ]);

  // Custom mappings (empty)
  FRAMEWORK_MAPPINGS_LOADER.set('custom', () => []);
}

// CSS property mappings
const CSS_PROPERTY_MAPPINGS: Record<string, (value: string) => string> = {
  'font-size': (value) => {
    const sizeMap: Record<string, string> = {
      '10px': 'var(--size-font-2xs)',
      '11px': 'var(--size-font-xs)',
      '12px': 'var(--size-font-sm)',
      '14px': 'var(--size-font-base)',
      '16px': 'var(--size-font-md)',
      '18px': 'var(--size-font-lg)',
      '20px': 'var(--size-font-xl)',
      '24px': 'var(--size-font-2xl)',
      '30px': 'var(--size-font-3xl)',
      '36px': 'var(--size-font-4xl)',
      '0.625rem': 'var(--size-font-2xs)',
      '0.6875rem': 'var(--size-font-xs)',
      '0.75rem': 'var(--size-font-sm)',
      '0.875rem': 'var(--size-font-base)',
      '1rem': 'var(--size-font-md)',
      '1.125rem': 'var(--size-font-lg)',
      '1.25rem': 'var(--size-font-xl)',
      '1.5rem': 'var(--size-font-2xl)',
      '1.875rem': 'var(--size-font-3xl)',
      '2.25rem': 'var(--size-font-4xl)'
    };
    return sizeMap[value] || value;
  },
  
  'padding': (value) => {
    const paddingMap: Record<string, string> = {
      '0': 'var(--size-spacing-none)',
      '2px': 'var(--size-spacing-2xs)',
      '4px': 'var(--size-spacing-xs)',
      '8px': 'var(--size-spacing-md)',
      '12px': 'var(--size-spacing-lg)',
      '16px': 'var(--size-spacing-xl)',
      '24px': 'var(--size-spacing-2xl)',
      '32px': 'var(--size-spacing-3xl)',
      '0.125rem': 'var(--size-spacing-2xs)',
      '0.25rem': 'var(--size-spacing-xs)',
      '0.5rem': 'var(--size-spacing-md)',
      '0.75rem': 'var(--size-spacing-lg)',
      '1rem': 'var(--size-spacing-xl)',
      '1.5rem': 'var(--size-spacing-2xl)',
      '2rem': 'var(--size-spacing-3xl)'
    };
    return paddingMap[value] || value;
  },
  
  'margin': (value) => {
    // Reuse padding mappings for margin
    return CSS_PROPERTY_MAPPINGS.padding(value);
  },
  
  'border-radius': (value) => {
    const radiusMap: Record<string, string> = {
      '0': 'var(--size-radius-none)',
      '2px': 'var(--size-radius-xs)',
      '4px': 'var(--size-radius-sm)',
      '6px': 'var(--size-radius-md)',
      '8px': 'var(--size-radius-lg)',
      '12px': 'var(--size-radius-xl)',
      '16px': 'var(--size-radius-2xl)',
      '9999px': 'var(--size-radius-full)',
      '50%': 'var(--size-radius-circle)',
      '0.125rem': 'var(--size-radius-xs)',
      '0.25rem': 'var(--size-radius-sm)',
      '0.375rem': 'var(--size-radius-md)',
      '0.5rem': 'var(--size-radius-lg)',
      '0.75rem': 'var(--size-radius-xl)',
      '1rem': 'var(--size-radius-2xl)'
    };
    return radiusMap[value] || value;
  },
  
  'line-height': (value) => {
    const lineHeightMap: Record<string, string> = {
      '1': 'var(--size-line-none)',
      '1.25': 'var(--size-line-tight)',
      '1.375': 'var(--size-line-snug)',
      '1.5': 'var(--size-line-normal)',
      '1.625': 'var(--size-line-relaxed)',
      '2': 'var(--size-line-loose)'
    };
    return lineHeightMap[value] || value;
  }
};

export class SizeMigration {
  private config: MigrationConfig;
  private rollbackData: { deref: () => string | undefined } | null = null; // 兼容性处理
  private report: MigrationReport | null = null;
  private mappingsCache: MigrationMapping[] | null = null; // 缓存映射

  constructor(config: MigrationConfig) {
    this.config = {
      preserveOriginal: false,
      autoApply: false,
      ...config
    };
  }

  /**
   * Migrate HTML classes
   */
  migrateHTML(html: string): string {
    const mappings = this.getMappings();
    let migratedHTML = html;
    const usedMappings: Record<string, string> = {};
    const unmapped: Set<string> = new Set();
    
    // Store original for rollback - 兼容性处理
    if (typeof globalThis !== 'undefined' && typeof (globalThis as any).WeakRef !== 'undefined') {
      this.rollbackData = new ((globalThis as any).WeakRef)(html);
    } else {
      this.rollbackData = { deref: () => html };
    }
    
    // Apply mappings
    mappings.forEach(mapping => {
      const matches = migratedHTML.match(mapping.pattern);
      if (matches) {
        matches.forEach(match => {
          const replacement = typeof mapping.replacement === 'function' 
            ? mapping.replacement(match)
            : mapping.replacement;
          usedMappings[match] = replacement;
        });
        migratedHTML = migratedHTML.replace(mapping.pattern, mapping.replacement as string);
      }
    });
    
    // Find unmapped classes
    const classPattern = /class="([^"]*)"/g;
    let match = classPattern.exec(html);
    while (match !== null) {
      const classes = match[1].split(' ');
      classes.forEach(cls => {
        if (!Object.keys(usedMappings).includes(cls) && cls.trim()) {
          unmapped.add(cls);
        }
      });
      match = classPattern.exec(html);
    }
    
    // Generate report
    this.report = {
      framework: this.config.from,
      timestamp: new Date(),
      statistics: {
        totalClasses: Object.keys(usedMappings).length + unmapped.size,
        migratedClasses: Object.keys(usedMappings).length,
        unmappedClasses: Array.from(unmapped),
        warnings: this.generateWarnings(unmapped)
      },
      mappings: usedMappings,
      rollbackData: this.rollbackData?.deref() || undefined
    };
    
    return migratedHTML;
  }

  /**
   * Migrate CSS styles
   */
  migrateCSS(css: string): string {
    let migratedCSS = css;
    
    // Store original for rollback - 兼容性处理
    if (typeof globalThis !== 'undefined' && typeof (globalThis as any).WeakRef !== 'undefined') {
      this.rollbackData = new ((globalThis as any).WeakRef)(css);
    } else {
      this.rollbackData = { deref: () => css };
    }
    
    // Migrate property values
    Object.entries(CSS_PROPERTY_MAPPINGS).forEach(([property, mapper]) => {
      const propertyPattern = new RegExp(`${property}:\\s*([^;]+)`, 'g');
      migratedCSS = migratedCSS.replace(propertyPattern, (match, value) => {
        const trimmedValue = value.trim();
        const mappedValue = mapper(trimmedValue);
        return `${property}: ${mappedValue}`;
      });
    });
    
    // Migrate class selectors based on framework
    const mappings = this.getMappings();
    mappings.forEach(mapping => {
      migratedCSS = migratedCSS.replace(mapping.pattern, mapping.replacement as string);
    });
    
    // Add ldesign-specific optimizations
    migratedCSS = this.optimizeForLDesign(migratedCSS);
    
    return migratedCSS;
  }

  /**
   * Batch convert multiple files
   */
  async convertBatch(files: Array<{ path: string; content: string; type: 'html' | 'css' }>): Promise<Array<{ path: string; content: string; report: MigrationReport }>> {
    const results = [];
    
    for (const file of files) {
      const migrated = file.type === 'html' 
        ? this.migrateHTML(file.content)
        : this.migrateCSS(file.content);
      
      results.push({
        path: file.path,
        content: migrated,
        report: this.report!
      });
    }
    
    return results;
  }

  /**
   * Generate migration report
   */
  generateReport(): MigrationReport | null {
    return this.report;
  }

  /**
   * Rollback migration
   */
  rollback(): string | null {
    if (!this.rollbackData) {
      console.warn('[SizeMigration] No rollback data available');
      return null;
    }
    
    const data = this.rollbackData.deref();
    this.rollbackData = null;
    this.report = null;
    this.mappingsCache = null; // 清理缓存
    
    return data || null;
  }

  /**
   * Get framework mappings
   */
  private getMappings(): MigrationMapping[] {
    // 使用缓存避免重复创建
    if (this.mappingsCache) {
      return this.mappingsCache;
    }
    
    const baseMappings = getFrameworkMappings(this.config.from);
    
    // Add custom mappings if provided
    if (this.config.customMappings) {
      const customMappings = Object.entries(this.config.customMappings).map(([pattern, replacement]) => ({
        pattern: new RegExp(pattern, 'g'),
        replacement
      }));
      this.mappingsCache = [...baseMappings, ...customMappings];
    } else {
      this.mappingsCache = baseMappings;
    }
    
    return this.mappingsCache;
  }

  /**
   * Generate warnings for unmapped classes
   */
  private generateWarnings(unmapped: Set<string>): string[] {
    const warnings: string[] = [];
    
    unmapped.forEach(cls => {
      // Check for potential issues
      if (cls.includes('spacing') || cls.includes('margin') || cls.includes('padding')) {
        warnings.push(`Spacing class "${cls}" may need manual review`);
      }
      if (cls.includes('text') || cls.includes('font')) {
        warnings.push(`Typography class "${cls}" may need manual review`);
      }
      if (cls.includes('btn') || cls.includes('button')) {
        warnings.push(`Button class "${cls}" may need component-specific migration`);
      }
    });
    
    return warnings;
  }

  /**
   * Optimize CSS for ldesign
   */
  private optimizeForLDesign(css: string): string {
    let optimized = css;
    
    // Convert hard-coded values to CSS variables where possible
    optimized = optimized.replace(/(\d+(?:\.\d+)?)(px|rem|em)\s*(?=[;}])/g, (match, num, unit) => {
      const value = Number.parseFloat(num);
      
      // Try to match to standard sizes
      if (unit === 'px') {
        if (value === 12) return 'var(--size-font-sm)';
        if (value === 14) return 'var(--size-font-base)';
        if (value === 16) return 'var(--size-font-md)';
        if (value === 18) return 'var(--size-font-lg)';
        if (value === 20) return 'var(--size-font-xl)';
        if (value === 24) return 'var(--size-font-2xl)';
        
        // Spacing
        if (value === 4) return 'var(--size-spacing-xs)';
        if (value === 8) return 'var(--size-spacing-md)';
        if (value === 12) return 'var(--size-spacing-lg)';
        if (value === 16) return 'var(--size-spacing-xl)';
        if (value === 24) return 'var(--size-spacing-2xl)';
        if (value === 32) return 'var(--size-spacing-3xl)';
      }
      
      return match;
    });
    
    // Add comments for better understanding
    optimized = `/* Migrated from ${this.config.from} to ldesign size system */\n${  optimized}`;
    
    return optimized;
  }

  /**
   * Export migration configuration
   */
  exportConfig(): string {
    const config = {
      framework: this.config.from,
      mappings: this.getMappings().map(m => ({
        pattern: m.pattern.source,
        replacement: m.replacement,
        description: m.description
      })),
      customMappings: this.config.customMappings,
      report: this.report
    };
    
    return JSON.stringify(config, null, 2);
  }

  /**
   * Import migration configuration
   */
  static importConfig(configJSON: string): SizeMigration {
    const config = JSON.parse(configJSON);
    return new SizeMigration({
      from: config.framework,
      customMappings: config.customMappings
    });
  }

  /**
   * Analyze framework usage in code
   */
  analyzeFrameworkUsage(code: string): { framework: Framework | null; confidence: number; patterns: string[] } {
    const patterns: string[] = [];
    let detectedFramework: Framework | null = null;
    let maxMatches = 0;
    
    // Check each framework's patterns - 优化内存使用
    const frameworks: Framework[] = ['bootstrap', 'tailwind', 'antd', 'material-ui', 'bulma'];
    
    for (const framework of frameworks) {
      const mappings = getFrameworkMappings(framework);
      let matches = 0;
      const foundPatterns: string[] = [];
      
      mappings.forEach(mapping => {
        const found = code.match(mapping.pattern);
        if (found) {
          matches += found.length;
          foundPatterns.push(...found);
        }
      });
      
      if (matches > maxMatches) {
        maxMatches = matches;
        detectedFramework = framework as Framework;
        patterns.length = 0;
        patterns.push(...foundPatterns);
      }
    }
    
    const confidence = maxMatches > 0 ? Math.min(100, (maxMatches / 10) * 100) : 0;
    
    return {
      framework: detectedFramework,
      confidence,
      patterns: patterns.slice(0, 10) // Return top 10 patterns found
    };
  }

  /**
   * Generate migration guide
   */
  generateMigrationGuide(): string {
    const framework = this.config.from;
    const mappings = this.getMappings();
    
    let guide = `# Migration Guide: ${framework} to LDesign Size System\n\n`;
    guide += `## Overview\n`;
    guide += `This guide helps you migrate from ${framework} to the LDesign size system.\n\n`;
    
    guide += `## Class Mappings\n\n`;
    guide += `| ${framework} Class | LDesign Class | Description |\n`;
    guide += `|----------------|---------------|-------------|\n`;
    
    mappings.forEach(mapping => {
      const pattern = mapping.pattern.source.replace(/\\b|\\|/g, '').replace(/[()]/g, '');
      const replacement = typeof mapping.replacement === 'string' ? mapping.replacement : 'custom function';
      const description = mapping.description || 'Standard migration';
      guide += `| ${pattern} | ${replacement} | ${description} |\n`;
    });
    
    guide += `\n## CSS Property Mappings\n\n`;
    guide += `| Property | Old Value | New Value |\n`;
    guide += `|----------|-----------|-----------||\n`;
    
    Object.entries(CSS_PROPERTY_MAPPINGS).forEach(([property, mapper]) => {
      // Show some examples
      const examples = [
        ['16px', mapper('16px')],
        ['1rem', mapper('1rem')],
        ['24px', mapper('24px')]
      ];
      
      examples.forEach(([old, mapped]) => {
        if (old !== mapped) {
          guide += `| ${property} | ${old} | ${mapped} |\n`;
        }
      });
    });
    
    guide += `\n## Migration Steps\n\n`;
    guide += `1. **Backup your code** - Always create a backup before migrating\n`;
    guide += `2. **Run migration** - Use the migration tool to convert your code\n`;
    guide += `3. **Review changes** - Check the migration report for any warnings\n`;
    guide += `4. **Test thoroughly** - Ensure your UI looks correct after migration\n`;
    guide += `5. **Manual adjustments** - Fix any unmapped classes manually\n\n`;
    
    if (this.report) {
      guide += `## Migration Report\n\n`;
      guide += `- Total Classes: ${this.report.statistics.totalClasses}\n`;
      guide += `- Migrated: ${this.report.statistics.migratedClasses}\n`;
      guide += `- Unmapped: ${this.report.statistics.unmappedClasses.length}\n\n`;
      
      if (this.report.statistics.warnings.length > 0) {
        guide += `### ⚠️ Warnings\n\n`;
        this.report.statistics.warnings.forEach(warning => {
          guide += `- ${warning}\n`;
        });
      }
    }
    
    return guide;
  }
}

// Export convenience functions
export function migrateFrom(framework: Framework, code: string, type: 'html' | 'css' = 'html'): string {
  const migrator = new SizeMigration({ from: framework });
  return type === 'html' ? migrator.migrateHTML(code) : migrator.migrateCSS(code);
}

export function detectFramework(code: string): Framework | null {
  const migrator = new SizeMigration({ from: 'custom' });
  const analysis = migrator.analyzeFrameworkUsage(code);
  return analysis.confidence > 50 ? analysis.framework : null;
}

export function createMigrationGuide(framework: Framework): string {
  const migrator = new SizeMigration({ from: framework });
  return migrator.generateMigrationGuide();
}