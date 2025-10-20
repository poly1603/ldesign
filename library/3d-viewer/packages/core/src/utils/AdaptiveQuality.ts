/**
 * Adaptive quality system
 * Automatically adjusts rendering quality based on performance
 */
import type { PerformanceMonitor } from './PerformanceMonitor';

export interface QualitySettings {
  pixelRatio: number;
  textureQuality: number; // 0-1
  shadowQuality: 'off' | 'low' | 'medium' | 'high';
  antialiasing: boolean;
  renderScale: number; // 0.5-1.0
}

export class AdaptiveQuality {
  private performanceMonitor: PerformanceMonitor;
  private currentSettings: QualitySettings;
  private targetFps: number = 55;
  private enabled: boolean = true;
  private adjustmentInterval: number = 2000; // Check every 2 seconds
  private lastAdjustment: number = 0;
  private onChange?: (settings: QualitySettings) => void;

  // Quality presets
  private static readonly PRESETS = {
    ultra: {
      pixelRatio: 2,
      textureQuality: 1.0,
      shadowQuality: 'high' as const,
      antialiasing: true,
      renderScale: 1.0,
    },
    high: {
      pixelRatio: 1.5,
      textureQuality: 0.9,
      shadowQuality: 'medium' as const,
      antialiasing: true,
      renderScale: 1.0,
    },
    medium: {
      pixelRatio: 1.0,
      textureQuality: 0.75,
      shadowQuality: 'low' as const,
      antialiasing: true,
      renderScale: 0.9,
    },
    low: {
      pixelRatio: 1.0,
      textureQuality: 0.5,
      shadowQuality: 'off' as const,
      antialiasing: false,
      renderScale: 0.75,
    },
  };

  constructor(
    performanceMonitor: PerformanceMonitor,
    initialQuality: 'ultra' | 'high' | 'medium' | 'low' = 'high',
    onChange?: (settings: QualitySettings) => void
  ) {
    this.performanceMonitor = performanceMonitor;
    this.currentSettings = { ...AdaptiveQuality.PRESETS[initialQuality] };
    this.onChange = onChange;
  }

  /**
   * Update adaptive quality (call every frame)
   */
  public update(): void {
    if (!this.enabled) return;

    const now = Date.now();
    if (now - this.lastAdjustment < this.adjustmentInterval) {
      return;
    }

    this.lastAdjustment = now;

    const stats = this.performanceMonitor.getStats();
    const fps = stats.fps;

    // Adjust quality based on FPS
    if (fps < this.targetFps - 10) {
      // Performance is poor, reduce quality
      this.decreaseQuality();
    } else if (fps > this.targetFps + 5) {
      // Performance is good, try to increase quality
      this.increaseQuality();
    }
  }

  /**
   * Decrease rendering quality
   */
  private decreaseQuality(): void {
    let changed = false;

    // Reduce in order of impact on performance
    if (this.currentSettings.pixelRatio > 1.0) {
      this.currentSettings.pixelRatio = Math.max(1.0, this.currentSettings.pixelRatio - 0.25);
      changed = true;
    } else if (this.currentSettings.renderScale > 0.75) {
      this.currentSettings.renderScale = Math.max(0.75, this.currentSettings.renderScale - 0.1);
      changed = true;
    } else if (this.currentSettings.antialiasing) {
      this.currentSettings.antialiasing = false;
      changed = true;
    } else if (this.currentSettings.textureQuality > 0.5) {
      this.currentSettings.textureQuality = Math.max(0.5, this.currentSettings.textureQuality - 0.1);
      changed = true;
    }

    if (changed) {
      console.log('[AdaptiveQuality] Quality decreased', this.currentSettings);
      this.onChange?.(this.currentSettings);
    }
  }

  /**
   * Increase rendering quality
   */
  private increaseQuality(): void {
    let changed = false;

    // Increase in reverse order
    if (this.currentSettings.textureQuality < 1.0) {
      this.currentSettings.textureQuality = Math.min(1.0, this.currentSettings.textureQuality + 0.1);
      changed = true;
    } else if (!this.currentSettings.antialiasing) {
      this.currentSettings.antialiasing = true;
      changed = true;
    } else if (this.currentSettings.renderScale < 1.0) {
      this.currentSettings.renderScale = Math.min(1.0, this.currentSettings.renderScale + 0.1);
      changed = true;
    } else if (this.currentSettings.pixelRatio < 2.0) {
      this.currentSettings.pixelRatio = Math.min(2.0, this.currentSettings.pixelRatio + 0.25);
      changed = true;
    }

    if (changed) {
      console.log('[AdaptiveQuality] Quality increased', this.currentSettings);
      this.onChange?.(this.currentSettings);
    }
  }

  /**
   * Get current quality settings
   */
  public getSettings(): QualitySettings {
    return { ...this.currentSettings };
  }

  /**
   * Set quality preset
   */
  public setPreset(preset: 'ultra' | 'high' | 'medium' | 'low'): void {
    this.currentSettings = { ...AdaptiveQuality.PRESETS[preset] };
    this.onChange?.(this.currentSettings);
  }

  /**
   * Enable/disable adaptive quality
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if adaptive quality is enabled
   */
  public isEnabled(): boolean {
    return this.enabled;
  }
}

