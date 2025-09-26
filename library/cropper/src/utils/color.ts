/**
 * @ldesign/cropper 颜色工具函数
 * 
 * 提供颜色转换、颜色计算、主题处理等工具函数
 */

// ============================================================================
// 颜色类型定义
// ============================================================================

/**
 * RGB颜色接口
 */
export interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * RGBA颜色接口
 */
export interface RGBA extends RGB {
  a: number;
}

/**
 * HSL颜色接口
 */
export interface HSL {
  h: number;
  s: number;
  l: number;
}

/**
 * HSLA颜色接口
 */
export interface HSLA extends HSL {
  a: number;
}

/**
 * HSV颜色接口
 */
export interface HSV {
  h: number;
  s: number;
  v: number;
}

// ============================================================================
// 颜色解析
// ============================================================================

/**
 * 解析十六进制颜色
 * @param hex 十六进制颜色字符串
 * @returns RGB颜色对象
 */
export function parseHex(hex: string): RGB | null {
  // 移除#号
  hex = hex.replace('#', '');
  
  // 支持3位和6位十六进制
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  
  if (hex.length !== 6) {
    return null;
  }
  
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return null;
  }
  
  return { r, g, b };
}

/**
 * 解析RGB颜色字符串
 * @param rgb RGB颜色字符串
 * @returns RGB颜色对象
 */
export function parseRGB(rgb: string): RGB | null {
  const match = rgb.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
  if (!match) return null;
  
  const r = parseInt(match[1], 10);
  const g = parseInt(match[2], 10);
  const b = parseInt(match[3], 10);
  
  return { r, g, b };
}

/**
 * 解析RGBA颜色字符串
 * @param rgba RGBA颜色字符串
 * @returns RGBA颜色对象
 */
export function parseRGBA(rgba: string): RGBA | null {
  const match = rgba.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/);
  if (!match) return null;
  
  const r = parseInt(match[1], 10);
  const g = parseInt(match[2], 10);
  const b = parseInt(match[3], 10);
  const a = parseFloat(match[4]);
  
  return { r, g, b, a };
}

/**
 * 解析HSL颜色字符串
 * @param hsl HSL颜色字符串
 * @returns HSL颜色对象
 */
export function parseHSL(hsl: string): HSL | null {
  const match = hsl.match(/hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)/);
  if (!match) return null;
  
  const h = parseInt(match[1], 10);
  const s = parseInt(match[2], 10);
  const l = parseInt(match[3], 10);
  
  return { h, s, l };
}

/**
 * 解析任意颜色字符串
 * @param color 颜色字符串
 * @returns RGBA颜色对象
 */
export function parseColor(color: string): RGBA | null {
  color = color.trim().toLowerCase();
  
  // 尝试解析十六进制
  if (color.startsWith('#')) {
    const rgb = parseHex(color);
    return rgb ? { ...rgb, a: 1 } : null;
  }
  
  // 尝试解析RGBA
  if (color.startsWith('rgba')) {
    return parseRGBA(color);
  }
  
  // 尝试解析RGB
  if (color.startsWith('rgb')) {
    const rgb = parseRGB(color);
    return rgb ? { ...rgb, a: 1 } : null;
  }
  
  // 尝试解析HSL
  if (color.startsWith('hsl')) {
    const hsl = parseHSL(color);
    if (hsl) {
      const rgb = hslToRgb(hsl);
      return { ...rgb, a: 1 };
    }
  }
  
  // 尝试解析命名颜色
  const namedColor = parseNamedColor(color);
  return namedColor ? { ...namedColor, a: 1 } : null;
}

// ============================================================================
// 颜色转换
// ============================================================================

/**
 * RGB转十六进制
 * @param rgb RGB颜色对象
 * @returns 十六进制颜色字符串
 */
export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * RGB转HSL
 * @param rgb RGB颜色对象
 * @returns HSL颜色对象
 */
export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (diff !== 0) {
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);
    
    switch (max) {
      case r:
        h = (g - b) / diff + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / diff + 2;
        break;
      case b:
        h = (r - g) / diff + 4;
        break;
    }
    h /= 6;
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * HSL转RGB
 * @param hsl HSL颜色对象
 * @returns RGB颜色对象
 */
export function hslToRgb(hsl: HSL): RGB {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;
  
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l; // 灰色
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

/**
 * RGB转HSV
 * @param rgb RGB颜色对象
 * @returns HSV颜色对象
 */
export function rgbToHsv(rgb: RGB): HSV {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  
  let h = 0;
  const s = max === 0 ? 0 : diff / max;
  const v = max;
  
  if (diff !== 0) {
    switch (max) {
      case r:
        h = (g - b) / diff + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / diff + 2;
        break;
      case b:
        h = (r - g) / diff + 4;
        break;
    }
    h /= 6;
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100)
  };
}

// ============================================================================
// 颜色格式化
// ============================================================================

/**
 * 格式化RGB颜色
 * @param rgb RGB颜色对象
 * @returns RGB颜色字符串
 */
export function formatRGB(rgb: RGB): string {
  return `rgb(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)})`;
}

/**
 * 格式化RGBA颜色
 * @param rgba RGBA颜色对象
 * @returns RGBA颜色字符串
 */
export function formatRGBA(rgba: RGBA): string {
  return `rgba(${Math.round(rgba.r)}, ${Math.round(rgba.g)}, ${Math.round(rgba.b)}, ${rgba.a})`;
}

/**
 * 格式化HSL颜色
 * @param hsl HSL颜色对象
 * @returns HSL颜色字符串
 */
export function formatHSL(hsl: HSL): string {
  return `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;
}

// ============================================================================
// 颜色计算
// ============================================================================

/**
 * 计算颜色亮度
 * @param rgb RGB颜色对象
 * @returns 亮度值（0-1）
 */
export function getLuminance(rgb: RGB): number {
  const sRGB = [rgb.r, rgb.g, rgb.b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}

/**
 * 计算对比度
 * @param color1 第一个颜色
 * @param color2 第二个颜色
 * @returns 对比度（1-21）
 */
export function getContrast(color1: RGB, color2: RGB): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * 判断颜色是否为深色
 * @param rgb RGB颜色对象
 * @returns 是否为深色
 */
export function isDark(rgb: RGB): boolean {
  return getLuminance(rgb) < 0.5;
}

/**
 * 判断颜色是否为浅色
 * @param rgb RGB颜色对象
 * @returns 是否为浅色
 */
export function isLight(rgb: RGB): boolean {
  return !isDark(rgb);
}

/**
 * 调整颜色亮度
 * @param rgb RGB颜色对象
 * @param amount 调整量（-1到1）
 * @returns 调整后的RGB颜色
 */
export function adjustBrightness(rgb: RGB, amount: number): RGB {
  const adjust = (value: number) => {
    return Math.max(0, Math.min(255, value + (amount * 255)));
  };
  
  return {
    r: adjust(rgb.r),
    g: adjust(rgb.g),
    b: adjust(rgb.b)
  };
}

/**
 * 调整颜色饱和度
 * @param rgb RGB颜色对象
 * @param amount 调整量（-1到1）
 * @returns 调整后的RGB颜色
 */
export function adjustSaturation(rgb: RGB, amount: number): RGB {
  const hsl = rgbToHsl(rgb);
  hsl.s = Math.max(0, Math.min(100, hsl.s + (amount * 100)));
  return hslToRgb(hsl);
}

/**
 * 混合两个颜色
 * @param color1 第一个颜色
 * @param color2 第二个颜色
 * @param ratio 混合比例（0-1）
 * @returns 混合后的颜色
 */
export function mixColors(color1: RGB, color2: RGB, ratio: number): RGB {
  ratio = Math.max(0, Math.min(1, ratio));
  
  return {
    r: Math.round(color1.r + (color2.r - color1.r) * ratio),
    g: Math.round(color1.g + (color2.g - color1.g) * ratio),
    b: Math.round(color1.b + (color2.b - color1.b) * ratio)
  };
}

// ============================================================================
// 命名颜色
// ============================================================================

/**
 * 常用命名颜色映射
 */
const NAMED_COLORS: Record<string, RGB> = {
  black: { r: 0, g: 0, b: 0 },
  white: { r: 255, g: 255, b: 255 },
  red: { r: 255, g: 0, b: 0 },
  green: { r: 0, g: 128, b: 0 },
  blue: { r: 0, g: 0, b: 255 },
  yellow: { r: 255, g: 255, b: 0 },
  cyan: { r: 0, g: 255, b: 255 },
  magenta: { r: 255, g: 0, b: 255 },
  gray: { r: 128, g: 128, b: 128 },
  grey: { r: 128, g: 128, b: 128 },
  orange: { r: 255, g: 165, b: 0 },
  purple: { r: 128, g: 0, b: 128 },
  brown: { r: 165, g: 42, b: 42 },
  pink: { r: 255, g: 192, b: 203 },
  transparent: { r: 0, g: 0, b: 0 }
};

/**
 * 解析命名颜色
 * @param name 颜色名称
 * @returns RGB颜色对象
 */
export function parseNamedColor(name: string): RGB | null {
  return NAMED_COLORS[name.toLowerCase()] || null;
}

// ============================================================================
// 颜色主题
// ============================================================================

/**
 * 生成颜色调色板
 * @param baseColor 基础颜色
 * @param count 颜色数量
 * @returns 颜色数组
 */
export function generatePalette(baseColor: RGB, count: number = 10): RGB[] {
  const hsl = rgbToHsl(baseColor);
  const palette: RGB[] = [];
  
  for (let i = 0; i < count; i++) {
    const lightness = Math.round((i / (count - 1)) * 100);
    const color = hslToRgb({ ...hsl, l: lightness });
    palette.push(color);
  }
  
  return palette;
}

/**
 * 生成互补色
 * @param rgb RGB颜色对象
 * @returns 互补色
 */
export function getComplementaryColor(rgb: RGB): RGB {
  const hsl = rgbToHsl(rgb);
  hsl.h = (hsl.h + 180) % 360;
  return hslToRgb(hsl);
}

/**
 * 生成类似色
 * @param rgb RGB颜色对象
 * @param count 颜色数量
 * @returns 类似色数组
 */
export function getAnalogousColors(rgb: RGB, count: number = 3): RGB[] {
  const hsl = rgbToHsl(rgb);
  const colors: RGB[] = [];
  const step = 30; // 30度间隔
  
  for (let i = 0; i < count; i++) {
    const h = (hsl.h + (i - Math.floor(count / 2)) * step + 360) % 360;
    colors.push(hslToRgb({ ...hsl, h }));
  }
  
  return colors;
}

/**
 * 获取最佳文本颜色
 * @param backgroundColor 背景颜色
 * @returns 最佳文本颜色（黑色或白色）
 */
export function getBestTextColor(backgroundColor: RGB): RGB {
  return isDark(backgroundColor) ? 
    { r: 255, g: 255, b: 255 } : // 白色
    { r: 0, g: 0, b: 0 };         // 黑色
}
