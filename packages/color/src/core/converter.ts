import type { RGB, HSL, HSV, CMYK, LAB, ColorFormat } from '../types'

/**
 * 颜色转换器
 */
export class ColorConverter {
  /**
   * RGB转HSL
   */
  static rgbToHsl(rgb: RGB): HSL {
    const { r, g, b } = rgb
    const rNorm = r / 255
    const gNorm = g / 255
    const bNorm = b / 255

    const max = Math.max(rNorm, gNorm, bNorm)
    const min = Math.min(rNorm, gNorm, bNorm)
    const diff = max - min

    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (diff !== 0) {
      s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min)

      switch (max) {
        case rNorm:
          h = ((gNorm - bNorm) / diff + (gNorm < bNorm ? 6 : 0)) / 6
          break
        case gNorm:
          h = ((bNorm - rNorm) / diff + 2) / 6
          break
        case bNorm:
          h = ((rNorm - gNorm) / diff + 4) / 6
          break
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    }
  }

  /**
   * HSL转RGB
   */
  static hslToRgb(hsl: HSL): RGB {
    const { h, s, l } = hsl
    const hNorm = h / 360
    const sNorm = s / 100
    const lNorm = l / 100

    if (sNorm === 0) {
      const gray = Math.round(lNorm * 255)
      return { r: gray, g: gray, b: gray }
    }

    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }

    const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm
    const p = 2 * lNorm - q

    return {
      r: Math.round(hue2rgb(p, q, hNorm + 1/3) * 255),
      g: Math.round(hue2rgb(p, q, hNorm) * 255),
      b: Math.round(hue2rgb(p, q, hNorm - 1/3) * 255)
    }
  }

  /**
   * RGB转HSV
   */
  static rgbToHsv(rgb: RGB): HSV {
    const { r, g, b } = rgb
    const rNorm = r / 255
    const gNorm = g / 255
    const bNorm = b / 255

    const max = Math.max(rNorm, gNorm, bNorm)
    const min = Math.min(rNorm, gNorm, bNorm)
    const diff = max - min

    let h = 0
    const s = max === 0 ? 0 : diff / max
    const v = max

    if (diff !== 0) {
      switch (max) {
        case rNorm:
          h = ((gNorm - bNorm) / diff + (gNorm < bNorm ? 6 : 0)) / 6
          break
        case gNorm:
          h = ((bNorm - rNorm) / diff + 2) / 6
          break
        case bNorm:
          h = ((rNorm - gNorm) / diff + 4) / 6
          break
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      v: Math.round(v * 100)
    }
  }

  /**
   * HSV转RGB
   */
  static hsvToRgb(hsv: HSV): RGB {
    const { h, s, v } = hsv
    const hNorm = h / 360
    const sNorm = s / 100
    const vNorm = v / 100

    const c = vNorm * sNorm
    const x = c * (1 - Math.abs((hNorm * 6) % 2 - 1))
    const m = vNorm - c

    let r = 0, g = 0, b = 0

    if (hNorm >= 0 && hNorm < 1/6) {
      r = c; g = x; b = 0
    } else if (hNorm >= 1/6 && hNorm < 2/6) {
      r = x; g = c; b = 0
    } else if (hNorm >= 2/6 && hNorm < 3/6) {
      r = 0; g = c; b = x
    } else if (hNorm >= 3/6 && hNorm < 4/6) {
      r = 0; g = x; b = c
    } else if (hNorm >= 4/6 && hNorm < 5/6) {
      r = x; g = 0; b = c
    } else {
      r = c; g = 0; b = x
    }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255)
    }
  }

  /**
   * RGB转CMYK
   */
  static rgbToCmyk(rgb: RGB): CMYK {
    const { r, g, b } = rgb
    const rNorm = r / 255
    const gNorm = g / 255
    const bNorm = b / 255

    const k = 1 - Math.max(rNorm, gNorm, bNorm)
    const c = k === 1 ? 0 : (1 - rNorm - k) / (1 - k)
    const m = k === 1 ? 0 : (1 - gNorm - k) / (1 - k)
    const y = k === 1 ? 0 : (1 - bNorm - k) / (1 - k)

    return {
      c: Math.round(c * 100),
      m: Math.round(m * 100),
      y: Math.round(y * 100),
      k: Math.round(k * 100)
    }
  }

  /**
   * CMYK转RGB
   */
  static cmykToRgb(cmyk: CMYK): RGB {
    const { c, m, y, k } = cmyk
    const cNorm = c / 100
    const mNorm = m / 100
    const yNorm = y / 100
    const kNorm = k / 100

    const r = 255 * (1 - cNorm) * (1 - kNorm)
    const g = 255 * (1 - mNorm) * (1 - kNorm)
    const b = 255 * (1 - yNorm) * (1 - kNorm)

    return {
      r: Math.round(r),
      g: Math.round(g),
      b: Math.round(b)
    }
  }

  /**
   * RGB转LAB
   */
  static rgbToLab(rgb: RGB): LAB {
    // 先转换到XYZ色彩空间
    const xyz = this.rgbToXyz(rgb)
    return this.xyzToLab(xyz)
  }

  /**
   * LAB转RGB
   */
  static labToRgb(lab: LAB): RGB {
    // 先转换到XYZ色彩空间
    const xyz = this.labToXyz(lab)
    return this.xyzToRgb(xyz)
  }

  /**
   * RGB转XYZ
   */
  private static rgbToXyz(rgb: RGB): { x: number; y: number; z: number } {
    let { r, g, b } = rgb
    r = r / 255
    g = g / 255
    b = b / 255

    // Gamma correction
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92

    // Observer = 2°, Illuminant = D65
    const x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375
    const y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750
    const z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041

    return { x: x * 100, y: y * 100, z: z * 100 }
  }

  /**
   * XYZ转RGB
   */
  private static xyzToRgb(xyz: { x: number; y: number; z: number }): RGB {
    let { x, y, z } = xyz
    x = x / 100
    y = y / 100
    z = z / 100

    // Observer = 2°, Illuminant = D65
    let r = x * 3.2404542 + y * -1.5371385 + z * -0.4985314
    let g = x * -0.9692660 + y * 1.8760108 + z * 0.0415560
    let b = x * 0.0556434 + y * -0.2040259 + z * 1.0572252

    // Gamma correction
    r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r
    g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g
    b = b > 0.0031308 ? 1.055 * Math.pow(b, 1 / 2.4) - 0.055 : 12.92 * b

    return {
      r: Math.max(0, Math.min(255, Math.round(r * 255))),
      g: Math.max(0, Math.min(255, Math.round(g * 255))),
      b: Math.max(0, Math.min(255, Math.round(b * 255)))
    }
  }

  /**
   * XYZ转LAB
   */
  private static xyzToLab(xyz: { x: number; y: number; z: number }): LAB {
    let { x, y, z } = xyz
    
    // Reference white D65
    x = x / 95.047
    y = y / 100.000
    z = z / 108.883

    const fx = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x + 16/116)
    const fy = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y + 16/116)
    const fz = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z + 16/116)

    const l = 116 * fy - 16
    const a = 500 * (fx - fy)
    const b = 200 * (fy - fz)

    return {
      l: Math.round(l * 100) / 100,
      a: Math.round(a * 100) / 100,
      b: Math.round(b * 100) / 100
    }
  }

  /**
   * LAB转XYZ
   */
  private static labToXyz(lab: LAB): { x: number; y: number; z: number } {
    const { l, a, b } = lab
    
    const fy = (l + 16) / 116
    const fx = a / 500 + fy
    const fz = fy - b / 200

    const x = fx > 0.206897 ? Math.pow(fx, 3) : (fx - 16/116) / 7.787
    const y = fy > 0.206897 ? Math.pow(fy, 3) : (fy - 16/116) / 7.787
    const z = fz > 0.206897 ? Math.pow(fz, 3) : (fz - 16/116) / 7.787

    // Reference white D65
    return {
      x: x * 95.047,
      y: y * 100.000,
      z: z * 108.883
    }
  }

  /**
   * HEX转RGB
   */
  static hexToRgb(hex: string): RGB {
    const cleanHex = hex.replace('#', '')
    const r = parseInt(cleanHex.substr(0, 2), 16)
    const g = parseInt(cleanHex.substr(2, 2), 16)
    const b = parseInt(cleanHex.substr(4, 2), 16)
    return { r, g, b }
  }

  /**
   * RGB转HEX
   */
  static rgbToHex(rgb: RGB): string {
    const { r, g, b } = rgb
    const toHex = (n: number) => {
      const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }

  /**
   * 转换为指定格式
   */
  static convert(rgb: RGB, format: ColorFormat): string {
    switch (format) {
      case 'hex':
        return this.rgbToHex(rgb)
      case 'rgb':
        return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
      case 'rgba':
        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`
      case 'hsl': {
        const hsl = this.rgbToHsl(rgb)
        return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
      }
      case 'hsla': {
        const hsl = this.rgbToHsl(rgb)
        return `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 1)`
      }
      case 'hsv': {
        const hsv = this.rgbToHsv(rgb)
        return `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`
      }
      case 'cmyk': {
        const cmyk = this.rgbToCmyk(rgb)
        return `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`
      }
      case 'lab': {
        const lab = this.rgbToLab(rgb)
        return `lab(${lab.l}, ${lab.a}, ${lab.b})`
      }
      default:
        return this.rgbToHex(rgb)
    }
  }
}