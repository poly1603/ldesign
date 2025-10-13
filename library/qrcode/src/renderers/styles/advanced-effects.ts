/**
 * Advanced visual effects for QR codes
 */

import { QRCodeGenerator } from '../../core/generator';

/**
 * Render neon glow effect
 */
export function renderNeonGlow(
  ctx: CanvasRenderingContext2D,
  generator: QRCodeGenerator,
  moduleSize: number,
  margin: number,
  color: string = '#00ff00'
): void {
  const moduleCount = generator.getModuleCount();
  
  // Create multiple glow layers
  const glowLayers = [
    { blur: 20, alpha: 0.3, scale: 1.2 },
    { blur: 10, alpha: 0.4, scale: 1.1 },
    { blur: 5, alpha: 0.5, scale: 1.05 },
    { blur: 2, alpha: 0.7, scale: 1.02 },
    { blur: 0, alpha: 1, scale: 1 }
  ];

  ctx.save();
  
  glowLayers.forEach(layer => {
    ctx.shadowColor = color;
    ctx.shadowBlur = layer.blur;
    ctx.globalAlpha = layer.alpha;
    
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (generator.isDark(row, col)) {
          const x = (col + margin) * moduleSize;
          const y = (row + margin) * moduleSize;
          const size = moduleSize * layer.scale;
          const offset = (size - moduleSize) / 2;
          
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(
            x + moduleSize / 2, 
            y + moduleSize / 2, 
            size / 2 - 1, 
            0, 
            Math.PI * 2
          );
          ctx.fill();
        }
      }
    }
  });
  
  ctx.restore();
}

/**
 * Render wave effect
 */
export function renderWaveEffect(
  ctx: CanvasRenderingContext2D,
  generator: QRCodeGenerator,
  moduleSize: number,
  margin: number,
  amplitude: number = 5,
  frequency: number = 0.1,
  phase: number = 0
): void {
  const moduleCount = generator.getModuleCount();
  
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (generator.isDark(row, col)) {
        const baseX = (col + margin) * moduleSize;
        const baseY = (row + margin) * moduleSize;
        
        // Apply wave transformation
        const waveOffset = Math.sin(col * frequency + phase) * amplitude;
        const x = baseX;
        const y = baseY + waveOffset;
        
        ctx.beginPath();
        ctx.arc(x + moduleSize / 2, y + moduleSize / 2, moduleSize * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

/**
 * Render pixel art effect (8-bit style)
 */
export function renderPixelArt(
  ctx: CanvasRenderingContext2D,
  generator: QRCodeGenerator,
  moduleSize: number,
  margin: number,
  pixelSize: number = 3
): void {
  const moduleCount = generator.getModuleCount();
  
  // Disable smoothing for crisp pixels
  ctx.imageSmoothingEnabled = false;
  
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (generator.isDark(row, col)) {
        const x = (col + margin) * moduleSize;
        const y = (row + margin) * moduleSize;
        
        // Draw pixelated module
        for (let px = 0; px < moduleSize; px += pixelSize) {
          for (let py = 0; py < moduleSize; py += pixelSize) {
            // Create pixel pattern
            const isEdge = px === 0 || py === 0 || 
                          px >= moduleSize - pixelSize || 
                          py >= moduleSize - pixelSize;
            
            ctx.fillStyle = isEdge ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 1)';
            ctx.fillRect(x + px, y + py, pixelSize - 1, pixelSize - 1);
          }
        }
      }
    }
  }
  
  ctx.imageSmoothingEnabled = true;
}

/**
 * Render gradient dots effect
 */
export function renderGradientDots(
  ctx: CanvasRenderingContext2D,
  generator: QRCodeGenerator,
  moduleSize: number,
  margin: number,
  startColor: string = '#ff0080',
  endColor: string = '#00bfff'
): void {
  const moduleCount = generator.getModuleCount();
  
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (generator.isDark(row, col)) {
        const x = (col + margin) * moduleSize;
        const y = (row + margin) * moduleSize;
        
        // Create radial gradient for each dot
        const gradient = ctx.createRadialGradient(
          x + moduleSize / 2, y + moduleSize / 2, 0,
          x + moduleSize / 2, y + moduleSize / 2, moduleSize / 2
        );
        
        // Interpolate colors based on position
        const t = (row + col) / (moduleCount * 2);
        gradient.addColorStop(0, interpolateColor(startColor, endColor, t));
        gradient.addColorStop(1, interpolateColor(startColor, endColor, 1 - t));
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x + moduleSize / 2, y + moduleSize / 2, moduleSize * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

/**
 * Render mosaic/tile effect
 */
export function renderMosaic(
  ctx: CanvasRenderingContext2D,
  generator: QRCodeGenerator,
  moduleSize: number,
  margin: number,
  gap: number = 1
): void {
  const moduleCount = generator.getModuleCount();
  
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (generator.isDark(row, col)) {
        const x = (col + margin) * moduleSize;
        const y = (row + margin) * moduleSize;
        
        // Draw tile with gap
        const tileSize = moduleSize - gap * 2;
        
        // Add slight gradient for 3D effect
        const gradient = ctx.createLinearGradient(x, y, x + tileSize, y + tileSize);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
        gradient.addColorStop(0.5, 'rgba(0, 0, 0, 1)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x + gap, y + gap, tileSize, tileSize);
        
        // Add highlight
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x + gap, y + gap, tileSize, tileSize);
      }
    }
  }
}

/**
 * Render bubble effect
 */
export function renderBubbles(
  ctx: CanvasRenderingContext2D,
  generator: QRCodeGenerator,
  moduleSize: number,
  margin: number
): void {
  const moduleCount = generator.getModuleCount();
  
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (generator.isDark(row, col)) {
        const x = (col + margin) * moduleSize;
        const y = (row + margin) * moduleSize;
        const cx = x + moduleSize / 2;
        const cy = y + moduleSize / 2;
        
        // Main bubble
        const gradient = ctx.createRadialGradient(
          cx - moduleSize * 0.15, 
          cy - moduleSize * 0.15, 
          0,
          cx, cy, moduleSize * 0.45
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.3, 'rgba(100, 150, 255, 0.6)');
        gradient.addColorStop(0.7, 'rgba(50, 100, 200, 0.8)');
        gradient.addColorStop(1, 'rgba(0, 50, 150, 1)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, moduleSize * 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(cx - moduleSize * 0.1, cy - moduleSize * 0.1, moduleSize * 0.1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

/**
 * Helper function to interpolate between two colors
 */
function interpolateColor(color1: string, color2: string, t: number): string {
  // Convert hex to RGB
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  
  if (!c1 || !c2) return color1;
  
  const r = Math.round(c1.r + (c2.r - c1.r) * t);
  const g = Math.round(c1.g + (c2.g - c1.g) * t);
  const b = Math.round(c1.b + (c2.b - c1.b) * t);
  
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export type AdvancedEffect = 
  | 'neon-glow'
  | 'wave'
  | 'pixel-art'
  | 'gradient-dots'
  | 'mosaic'
  | 'bubbles';

/**
 * Apply advanced effect to QR code
 */
export function applyAdvancedEffect(
  ctx: CanvasRenderingContext2D,
  generator: QRCodeGenerator,
  moduleSize: number,
  margin: number,
  effect: AdvancedEffect,
  options?: any
): void {
  switch (effect) {
    case 'neon-glow':
      renderNeonGlow(ctx, generator, moduleSize, margin, options?.color);
      break;
    case 'wave':
      renderWaveEffect(ctx, generator, moduleSize, margin, options?.amplitude, options?.frequency, options?.phase);
      break;
    case 'pixel-art':
      renderPixelArt(ctx, generator, moduleSize, margin, options?.pixelSize);
      break;
    case 'gradient-dots':
      renderGradientDots(ctx, generator, moduleSize, margin, options?.startColor, options?.endColor);
      break;
    case 'mosaic':
      renderMosaic(ctx, generator, moduleSize, margin, options?.gap);
      break;
    case 'bubbles':
      renderBubbles(ctx, generator, moduleSize, margin);
      break;
  }
}