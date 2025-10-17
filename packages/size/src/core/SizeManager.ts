/**
 * @ldesign/size - Size Manager
 * 
 * Manages size schemes, persistence, and CSS injection
 */
export interface SizeConfig {
  baseSize: number
}

export interface SizePreset {
  name: string
  label: string
  description?: string
  baseSize: number
  category?: string
}

export type SizeChangeListener = (config: SizeConfig) => void

const DEFAULT_STORAGE_KEY = 'ldesign-size-scheme'

// Default presets
const defaultPresets: SizePreset[] = [
  {
    name: 'compact',
    label: 'Compact',
    description: 'High density for maximum content',
    baseSize: 14,
    category: 'density'
  },
  {
    name: 'comfortable',
    label: 'Comfortable',
    description: 'Balanced spacing for everyday use',
    baseSize: 16,
    category: 'density'
  },
  {
    name: 'default',
    label: 'Default',
    description: 'Standard size settings',
    baseSize: 16,
    category: 'density'
  },
  {
    name: 'spacious',
    label: 'Spacious',
    description: 'Lower density for better readability',
    baseSize: 18,
    category: 'density'
  }
]

export class SizeManager {
  private config: SizeConfig
  private presets: Map<string, SizePreset>
  private listeners: Set<SizeChangeListener>
  private styleElement: HTMLStyleElement | null = null
  private currentPresetName: string = 'default'
  private storageKey: string

  constructor(options: { storageKey?: string; presets?: SizePreset[] } = {}) {
    this.storageKey = options.storageKey || DEFAULT_STORAGE_KEY
    this.config = {
      baseSize: 16
    }

    this.presets = new Map()
    this.listeners = new Set()

    // Add default presets
    defaultPresets.forEach(preset => {
      this.presets.set(preset.name, preset)
    })

    // Add custom presets
    if (options.presets) {
      options.presets.forEach(preset => {
        this.presets.set(preset.name, preset)
      })
    }

    // Load saved config
    this.loadFromStorage()

    // Apply initial size
    this.applySize()
  }

  getConfig(): SizeConfig {
    return { ...this.config }
  }

  setConfig(config: Partial<SizeConfig>): void {
    this.config = {
      ...this.config,
      ...config
    }
    this.applySize()
    this.saveToStorage()
    this.notifyListeners()
  }

  setBaseSize(baseSize: number): void {
    this.setConfig({ baseSize })
  }

  applyPreset(presetName: string): void {
    const preset = this.presets.get(presetName)
    if (preset) {
      this.currentPresetName = presetName
      this.setConfig({
        baseSize: preset.baseSize
      })
    }
  }

  getCurrentPreset(): string {
    return this.currentPresetName
  }
  
  getCurrentSize(): string {
    return this.currentPresetName
  }
  
  setSize(size: string): void {
    this.applyPreset(size)
  }
  
  getSizes(): string[] {
    return Array.from(this.presets.keys())
  }

  getPresets(): SizePreset[] {
    return Array.from(this.presets.values())
  }

  addPreset(preset: SizePreset): void {
    this.presets.set(preset.name, preset)
  }

  private applySize(): void {
    if (typeof document === 'undefined') return

    const css = this.generateCSS()

    if (!this.styleElement) {
      this.styleElement = document.createElement('style')
      this.styleElement.id = 'ldesign-size-styles'
      document.head.appendChild(this.styleElement)
    }

    this.styleElement.textContent = css
  }

  private generateCSS(): string {
    const { baseSize } = this.config
    // 确保所有计算出来的值都是整数
    const s = (multiplier: number) => `${Math.round(baseSize * multiplier)}px`

    return `
      :root {
        /* Base Configuration */
        --size-base: ${baseSize}px;

        /* Base Size Tokens (TDesign style - 2px increment) */
        --size-0: 0px;
        --size-1: ${s(0.125)};
        --size-2: ${s(0.25)};
        --size-3: ${s(0.375)};
        --size-4: ${s(0.5)};
        --size-5: ${s(0.75)};
        --size-6: ${s(1)};
        --size-7: ${s(1.25)};
        --size-8: ${s(1.5)};
        --size-9: ${s(1.75)};
        --size-10: ${s(2)};
        --size-11: ${s(2.25)};
        --size-12: ${s(2.5)};
        --size-13: ${s(3)};
        --size-14: ${s(3.5)};
        --size-15: ${s(4)};
        --size-16: ${s(4.5)};
        --size-17: ${s(5)};
        --size-18: ${s(6)};
        --size-19: ${s(7)};
        --size-20: ${s(8)};
        --size-24: ${s(12)};
        --size-32: ${s(16)};
        --size-40: ${s(20)};
        --size-48: ${s(24)};
        --size-56: ${s(28)};
        --size-64: ${s(32)};

        /* Font Sizes */
        --size-font-tiny: ${s(0.625)};
        --size-font-small: ${s(0.75)};
        --size-font-medium: ${s(0.875)};
        --size-font-large: ${s(1)};
        --size-font-huge: ${s(1.125)};
        --size-font-giant: ${s(1.25)};
        
        /* Heading Sizes */
        --size-font-h1: ${s(1.75)};
        --size-font-h2: ${s(1.5)};
        --size-font-h3: ${s(1.25)};
        --size-font-h4: ${s(1.125)};
        --size-font-h5: ${s(1)};
        --size-font-h6: ${s(0.875)};
        
        /* Display Sizes */
        --size-font-display1: ${s(3)};
        --size-font-display2: ${s(2.625)};
        --size-font-display3: ${s(2.25)};
        
        /* Special Font Sizes */
        --size-font-caption: ${s(0.6875)};
        --size-font-overline: ${s(0.625)};
        --size-font-code: ${s(0.8125)};

        /* Spacing System */
        --size-spacing-none: 0;
        --size-spacing-tiny: ${s(0.125)};
        --size-spacing-small: ${s(0.25)};
        --size-spacing-medium: ${s(0.5)};
        --size-spacing-large: ${s(0.75)};
        --size-spacing-huge: ${s(1)};
        --size-spacing-giant: ${s(1.5)};
        --size-spacing-massive: ${s(2)};
        --size-spacing-colossal: ${s(3)};
        --size-spacing-half: ${s(0.375)};
        --size-spacing-quarter: ${s(0.1875)};
        --size-spacing-double: ${s(1)};

        /* Component Heights */
        --size-comp-size-xxxs: var(--size-6);
        --size-comp-size-xxs: var(--size-7);
        --size-comp-size-xs: var(--size-8);
        --size-comp-size-s: var(--size-9);
        --size-comp-size-m: var(--size-10);
        --size-comp-size-l: var(--size-11);
        --size-comp-size-xl: var(--size-12);
        --size-comp-size-xxl: var(--size-13);
        --size-comp-size-xxxl: var(--size-14);
        --size-comp-size-xxxxl: var(--size-15);
        --size-comp-size-xxxxxl: var(--size-16);

        /* Popup Padding */
        --size-pop-padding-s: var(--size-2);
        --size-pop-padding-m: var(--size-3);
        --size-pop-padding-l: var(--size-4);
        --size-pop-padding-xl: var(--size-5);
        --size-pop-padding-xxl: var(--size-6);

        /* Component Padding LR */
        --size-comp-paddingLR-xxs: var(--size-1);
        --size-comp-paddingLR-xs: var(--size-2);
        --size-comp-paddingLR-s: var(--size-4);
        --size-comp-paddingLR-m: var(--size-5);
        --size-comp-paddingLR-l: var(--size-6);
        --size-comp-paddingLR-xl: var(--size-8);
        --size-comp-paddingLR-xxl: var(--size-10);

        /* Component Padding TB */
        --size-comp-paddingTB-xxs: var(--size-1);
        --size-comp-paddingTB-xs: var(--size-2);
        --size-comp-paddingTB-s: var(--size-3);
        --size-comp-paddingTB-m: var(--size-4);
        --size-comp-paddingTB-l: var(--size-5);
        --size-comp-paddingTB-xl: var(--size-6);
        --size-comp-paddingTB-xxl: var(--size-8);

        /* Component Margins */
        --size-comp-margin-xxs: var(--size-1);
        --size-comp-margin-xs: var(--size-2);
        --size-comp-margin-s: var(--size-4);
        --size-comp-margin-m: var(--size-5);
        --size-comp-margin-l: var(--size-6);
        --size-comp-margin-xl: var(--size-7);
        --size-comp-margin-xxl: var(--size-8);
        --size-comp-margin-xxxl: var(--size-10);
        --size-comp-margin-xxxxl: var(--size-12);

        /* Border Radius */
        --size-radius-none: 0;
        --size-radius-small: ${s(0.125)};
        --size-radius-medium: ${s(0.25)};
        --size-radius-large: ${s(0.5)};
        --size-radius-huge: ${s(0.75)};
        --size-radius-full: 9999px;
        --size-radius-circle: 50%;

        /* Line Heights */
        --size-line-none: 1.0;
        --size-line-tight: 1.25;
        --size-line-snug: 1.375;
        --size-line-normal: 1.5;
        --size-line-relaxed: 1.625;
        --size-line-loose: 2.0;

        /* Letter Spacing */
        --size-letter-tighter: -0.05em;
        --size-letter-tight: -0.025em;
        --size-letter-normal: 0;
        --size-letter-wide: 0.025em;
        --size-letter-wider: 0.05em;
        --size-letter-widest: 0.1em;

        /* Font Families */
        --size-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        --size-font-family-mono: "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace;

        /* Font Weights */
        --size-font-weight-thin: 100;
        --size-font-weight-extralight: 200;
        --size-font-weight-light: 300;
        --size-font-weight-regular: 400;
        --size-font-weight-medium: 500;
        --size-font-weight-semibold: 600;
        --size-font-weight-bold: 700;
        --size-font-weight-extrabold: 800;
        --size-font-weight-black: 900;

        /* Border Widths */
        --size-border-width-thin: 1px;
        --size-border-width-medium: 2px;
        --size-border-width-thick: 3px;

        /* Shadows */
        --size-shadow-1: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        --size-shadow-2: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        --size-shadow-3: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        --size-shadow-4: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        --size-shadow-5: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        --size-shadow-6: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

        /* Z-Index */
        --size-z-dropdown: 1000;
        --size-z-sticky: 1020;
        --size-z-fixed: 1030;
        --size-z-modal-backdrop: 1040;
        --size-z-modal: 1050;
        --size-z-popover: 1060;
        --size-z-tooltip: 1070;
        --size-z-notification: 1080;

        /* Animation Durations */
        --size-duration-instant: 0ms;
        --size-duration-fast: 150ms;
        --size-duration-normal: 300ms;
        --size-duration-slow: 450ms;
        --size-duration-slower: 600ms;

        /* Easing Functions */
        --size-ease-linear: linear;
        --size-ease-in: cubic-bezier(0.4, 0, 1, 1);
        --size-ease-out: cubic-bezier(0, 0, 0.2, 1);
        --size-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

        /* Button Sizes */
        --size-btn-height-tiny: ${s(1.5)};
        --size-btn-height-small: ${s(1.75)};
        --size-btn-height-medium: ${s(2)};
        --size-btn-height-large: ${s(2.25)};
        --size-btn-height-huge: ${s(2.5)};
        --size-btn-padding-tiny: 0 ${s(0.5)};
        --size-btn-padding-small: 0 ${s(0.625)};
        --size-btn-padding-medium: 0 ${s(0.875)};
        --size-btn-padding-large: 0 ${s(1)};
        --size-btn-padding-huge: 0 ${s(1.25)};

        /* Input Sizes */
        --size-input-height-small: ${s(1.75)};
        --size-input-height-medium: ${s(2)};
        --size-input-height-large: ${s(2.25)};
        --size-input-padding-small: ${s(0.25)} ${s(0.5)};
        --size-input-padding-medium: ${s(0.375)} ${s(0.625)};
        --size-input-padding-large: ${s(0.5)} ${s(0.75)};

        /* Icon Sizes */
        --size-icon-tiny: ${s(0.75)};
        --size-icon-small: ${s(0.875)};
        --size-icon-medium: ${s(1)};
        --size-icon-large: ${s(1.25)};
        --size-icon-huge: ${s(1.5)};
        --size-icon-giant: ${s(2)};

        /* Avatar Sizes */
        --size-avatar-tiny: ${s(1.25)};
        --size-avatar-small: ${s(1.5)};
        --size-avatar-medium: ${s(2)};
        --size-avatar-large: ${s(2.5)};
        --size-avatar-huge: ${s(3)};
        --size-avatar-giant: ${s(4)};

        /* Card Padding */
        --size-card-padding-small: ${s(0.5)};
        --size-card-padding-medium: ${s(0.75)};
        --size-card-padding-large: ${s(1)};

        /* Table Sizes */
        --size-table-row-height-small: ${s(2.25)};
        --size-table-row-height-medium: ${s(2.75)};
        --size-table-row-height-large: ${s(3.25)};

        /* Form Sizes */
        --size-form-label-margin: 0 0 ${s(0.125)} 0;
        --size-form-group-margin: 0 0 ${s(1)} 0;

        /* Tag/Badge Sizes */
        --size-tag-height: ${s(1.5)};
        --size-tag-padding: 0 ${s(0.25)};

        /* Modal Sizes */
        --size-modal-width-small: ${s(25)};
        --size-modal-width-medium: ${s(37.5)};
        --size-modal-width-large: ${s(50)};

        /* Drawer Sizes */
        --size-drawer-width-small: ${s(20)};
        --size-drawer-width-medium: ${s(30)};
        --size-drawer-width-large: ${s(40)};

        /* Container Widths */
        --size-container-sm: 640px;
        --size-container-md: 768px;
        --size-container-lg: 1024px;
        --size-container-xl: 1280px;
        --size-container-xxl: 1536px;
      }
    `
  }

  private loadFromStorage(): void {
    if (typeof localStorage === 'undefined') return

    try {
      const saved = localStorage.getItem(this.storageKey)
      if (saved) {
        const data = JSON.parse(saved)
        if (data.config) {
          this.config = data.config
        }
        if (data.presetName) {
          this.currentPresetName = data.presetName
        }
      }
    } catch (e) {
      console.error('Failed to load size config from storage:', e)
    }
  }

  private saveToStorage(): void {
    if (typeof localStorage === 'undefined') return

    try {
      const data = {
        config: this.config,
        presetName: this.currentPresetName
      }
      localStorage.setItem(this.storageKey, JSON.stringify(data))
    } catch (e) {
      console.error('Failed to save size config to storage:', e)
    }
  }

  subscribe(listener: SizeChangeListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
  
  onChange(listener: SizeChangeListener): () => void {
    return this.subscribe(listener)
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.config))
  }

  destroy(): void {
    if (this.styleElement && this.styleElement.parentNode) {
      this.styleElement.parentNode.removeChild(this.styleElement)
    }
    this.listeners.clear()
  }
}

// Export a singleton instance
export const sizeManager = new SizeManager()