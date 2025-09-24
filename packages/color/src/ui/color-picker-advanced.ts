/**
 * Advanced Color Picker UI Component
 * 提供完整的可视化颜色选择界面
 */

export interface ColorPickerOptions {
  container?: HTMLElement | string
  initialColor?: string
  format?: 'hex' | 'rgb' | 'hsl' | 'hsv'
  showAlpha?: boolean
  showPalette?: boolean
  showHistory?: boolean
  showInput?: boolean
  paletteColors?: string[]
  maxHistory?: number
  onChange?: (color: ColorPickerValue) => void
  onSave?: (color: ColorPickerValue) => void
}

export interface ColorPickerValue {
  hex: string
  rgb: { r: number, g: number, b: number, a?: number }
  hsl: { h: number, s: number, l: number, a?: number }
  hsv: { h: number, s: number, v: number, a?: number }
}

export class AdvancedColorPicker {
  private container: HTMLElement
  private options: Required<ColorPickerOptions>
  private currentColor: ColorPickerValue
  private history: string[] = []
  private isDragging = false

  // UI Elements
  // private colorWheel?: HTMLCanvasElement // reserved for future wheel UI
  private saturationValue?: HTMLCanvasElement
  private hueSlider?: HTMLElement
  private alphaSlider?: HTMLElement
  private previewBox?: HTMLElement
  private inputFields?: Map<string, HTMLInputElement>

  // Canvas contexts
  private svCtx: CanvasRenderingContext2D | null = null

  constructor(options: ColorPickerOptions = {}) {
    this.options = {
      container: document.body,
      initialColor: '#3498db',
      format: 'hex',
      showAlpha: true,
      showPalette: true,
      showHistory: true,
      showInput: true,
      paletteColors: [
        '#FF6B6B',
        '#4ECDC4',
        '#45B7D1',
        '#96CEB4',
        '#FFEAA7',
        '#DDA0DD',
        '#98D8C8',
        '#F7DC6F',
        '#BB8FCE',
        '#85C1E2',
      ],
      maxHistory: 20,
      onChange: () => {},
      onSave: () => {},
      ...options,
    }

    this.container = this.resolveContainer(this.options.container)
    this.currentColor = this.parseColor(this.options.initialColor)

    this.init()
  }

  private init(): void {
    this.createDOM()
    this.setupEventListeners()
    this.render()
    this.updateUI()
  }

  private createDOM(): void {
    this.container.innerHTML = `
      <div class="color-picker-advanced">
        <div class="picker-header">
          <div class="preview-section">
            <div class="color-preview" id="preview-box"></div>
            <div class="color-info">
              <span class="color-label">Current</span>
              <span class="color-value">${this.options.initialColor}</span>
            </div>
          </div>
        </div>
        
        <div class="picker-body">
          <!-- Color Wheel Mode -->
          <div class="picker-mode wheel-mode" data-mode="wheel">
            <canvas id="color-wheel" width="200" height="200"></canvas>
            <div class="wheel-cursor"></div>
          </div>
          
          <!-- Saturation/Value Mode -->
          <div class="picker-mode sv-mode active" data-mode="sv">
            <canvas id="saturation-value" width="200" height="200"></canvas>
            <div class="sv-cursor"></div>
          </div>
          
          <!-- Sliders -->
          <div class="sliders-section">
            <div class="slider-group">
              <label>Hue</label>
              <div class="hue-slider" id="hue-slider">
                <div class="slider-track"></div>
                <div class="slider-handle"></div>
              </div>
            </div>
            
            ${
              this.options.showAlpha
                ? `
              <div class="slider-group">
                <label>Alpha</label>
                <div class="alpha-slider" id="alpha-slider">
                  <div class="slider-track"></div>
                  <div class="slider-handle"></div>
                </div>
              </div>
            `
                : ''
            }
          </div>
          
          <!-- Input Fields -->
          ${
            this.options.showInput
              ? `
            <div class="input-section">
              <div class="input-tabs">
                <button class="tab-btn active" data-format="hex">HEX</button>
                <button class="tab-btn" data-format="rgb">RGB</button>
                <button class="tab-btn" data-format="hsl">HSL</button>
                <button class="tab-btn" data-format="hsv">HSV</button>
              </div>
              <div class="input-fields">
                <div class="field-group active" data-format="hex">
                  <input type="text" id="hex-input" placeholder="#000000" />
                </div>
                <div class="field-group" data-format="rgb">
                  <input type="number" id="rgb-r" placeholder="R" min="0" max="255" />
                  <input type="number" id="rgb-g" placeholder="G" min="0" max="255" />
                  <input type="number" id="rgb-b" placeholder="B" min="0" max="255" />
                  ${this.options.showAlpha ? '<input type="number" id="rgb-a" placeholder="A" min="0" max="1" step="0.01" />' : ''}
                </div>
                <div class="field-group" data-format="hsl">
                  <input type="number" id="hsl-h" placeholder="H" min="0" max="360" />
                  <input type="number" id="hsl-s" placeholder="S" min="0" max="100" />
                  <input type="number" id="hsl-l" placeholder="L" min="0" max="100" />
                  ${this.options.showAlpha ? '<input type="number" id="hsl-a" placeholder="A" min="0" max="1" step="0.01" />' : ''}
                </div>
                <div class="field-group" data-format="hsv">
                  <input type="number" id="hsv-h" placeholder="H" min="0" max="360" />
                  <input type="number" id="hsv-s" placeholder="S" min="0" max="100" />
                  <input type="number" id="hsv-v" placeholder="V" min="0" max="100" />
                  ${this.options.showAlpha ? '<input type="number" id="hsv-a" placeholder="A" min="0" max="1" step="0.01" />' : ''}
                </div>
              </div>
            </div>
          `
              : ''
          }
          
          <!-- Palette -->
          ${
            this.options.showPalette
              ? `
            <div class="palette-section">
              <h4>Quick Colors</h4>
              <div class="palette-colors">
                ${this.options.paletteColors
                  .map(
                    color =>
                      `<div class="palette-color" data-color="${color}" style="background: ${color}"></div>`,
                  )
                  .join('')}
              </div>
            </div>
          `
              : ''
          }
          
          <!-- History -->
          ${
            this.options.showHistory
              ? `
            <div class="history-section">
              <h4>Recent Colors</h4>
              <div class="history-colors" id="history-colors"></div>
            </div>
          `
              : ''
          }
        </div>
        
        <div class="picker-footer">
          <button class="btn-cancel">Cancel</button>
          <button class="btn-save">Save Color</button>
        </div>
      </div>
    `

    // Get references to elements
    // wheel canvas is not used currently
    this.saturationValue = this.container.querySelector('#saturation-value') as HTMLCanvasElement
    this.hueSlider = this.container.querySelector('#hue-slider') as HTMLElement
    this.alphaSlider = this.container.querySelector('#alpha-slider') as HTMLElement
    this.previewBox = this.container.querySelector('#preview-box') as HTMLElement

    // Get canvas contexts
    // no-op: colorWheel context currently unused
    if (this.saturationValue) {
      this.svCtx = this.saturationValue.getContext('2d')
    }

    // Setup input fields map
    this.inputFields = new Map()
    const inputs = this.container.querySelectorAll('input')
    inputs.forEach((input) => {
      this.inputFields?.set(input.id, input as HTMLInputElement)
    })
  }

  private setupEventListeners(): void {
    // Saturation/Value canvas
    this.saturationValue?.addEventListener('mousedown', this.handleSVMouseDown.bind(this))
    this.saturationValue?.addEventListener('touchstart', this.handleSVTouchStart.bind(this))

    // Hue slider
    this.hueSlider?.addEventListener('mousedown', this.handleHueMouseDown.bind(this))
    this.hueSlider?.addEventListener('touchstart', this.handleHueTouchStart.bind(this))

    // Alpha slider
    this.alphaSlider?.addEventListener('mousedown', this.handleAlphaMouseDown.bind(this))
    this.alphaSlider?.addEventListener('touchstart', this.handleAlphaTouchStart.bind(this))

    // Input fields
    this.inputFields?.forEach((input, id) => {
      input.addEventListener('change', () => this.handleInputChange(id))
    })

    // Format tabs
    const tabs = this.container.querySelectorAll('.tab-btn')
    tabs.forEach((tab) => {
      tab.addEventListener('click', (e) => {
        const el = e.currentTarget as HTMLElement
        const format = el.getAttribute('data-format') || 'hex'
        this.switchInputFormat(format)
      })
    })

    // Palette colors
    const paletteColors = this.container.querySelectorAll('.palette-color')
    paletteColors.forEach((el) => {
      el.addEventListener('click', (e) => {
        const elTarget = e.currentTarget as HTMLElement
        const color = elTarget.getAttribute('data-color') || '#000000'
        this.setColor(color)
      })
    })

    // Buttons
    this.container.querySelector('.btn-save')?.addEventListener('click', () => {
      this.saveColor()
    })

    this.container.querySelector('.btn-cancel')?.addEventListener('click', () => {
      this.close()
    })

    // Global mouse/touch events
    document.addEventListener('mousemove', this.handleMouseMove.bind(this))
    document.addEventListener('mouseup', this.handleMouseUp.bind(this))
    document.addEventListener('touchmove', this.handleTouchMove.bind(this))
    document.addEventListener('touchend', this.handleTouchEnd.bind(this))
  }

  private render(): void {
    this.renderSaturationValue()
    this.renderHueSlider()
    if (this.options.showAlpha) {
      this.renderAlphaSlider()
    }
  }

  private renderSaturationValue(): void {
    if (!this.svCtx || !this.saturationValue)
      return

    // TypeScript null-check guard for old browsers
    if (!this.svCtx)
      return

    const width = this.saturationValue.width
    const height = this.saturationValue.height
    const { h } = this.currentColor.hsv

    // Create gradients
    const hueColor = this.hsvToRgb(h, 100, 100)

    // White to hue gradient (horizontal)
    const whiteGradient = this.svCtx.createLinearGradient(0, 0, width, 0)
    whiteGradient.addColorStop(0, 'white')
    whiteGradient.addColorStop(1, `rgb(${hueColor.r}, ${hueColor.g}, ${hueColor.b})`)

    this.svCtx.fillStyle = whiteGradient
    this.svCtx.fillRect(0, 0, width, height)

    // Transparent to black gradient (vertical)
    const blackGradient = this.svCtx.createLinearGradient(0, 0, 0, height)
    blackGradient.addColorStop(0, 'transparent')
    blackGradient.addColorStop(1, 'black')

    this.svCtx.fillStyle = blackGradient
    this.svCtx.fillRect(0, 0, width, height)
  }

  private renderHueSlider(): void {
    if (!this.hueSlider)
      return

    const track = this.hueSlider.querySelector('.slider-track') as HTMLElement
    if (!track)
      return

    // Create hue gradient
    const gradient = []
    for (let i = 0; i <= 360; i += 30) {
      const { r, g, b } = this.hsvToRgb(i, 100, 100)
      gradient.push(`rgb(${r}, ${g}, ${b})`)
    }

    track.style.background = `linear-gradient(to right, ${gradient.join(', ')})`
  }

  private renderAlphaSlider(): void {
    if (!this.alphaSlider)
      return

    const track = this.alphaSlider.querySelector('.slider-track') as HTMLElement
    if (!track)
      return

    const { r, g, b } = this.currentColor.rgb
    track.style.background = `
      linear-gradient(to right, 
        rgba(${r}, ${g}, ${b}, 0), 
        rgba(${r}, ${g}, ${b}, 1)
      ),
      url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="5" height="5" fill="%23ccc"/><rect x="5" y="5" width="5" height="5" fill="%23ccc"/></svg>')
    `
  }

  private updateUI(): void {
    // Update preview
    if (this.previewBox) {
      const { r, g, b, a = 1 } = this.currentColor.rgb
      this.previewBox.style.background = `rgba(${r}, ${g}, ${b}, ${a})`
    }

    // Update color value display
    const valueDisplay = this.container.querySelector('.color-value')
    if (valueDisplay) {
      valueDisplay.textContent = this.getFormattedColor()
    }

    // Update cursors
    this.updateSVCursor()
    this.updateHueCursor()
    this.updateAlphaCursor()

    // Update input fields
    this.updateInputFields()
  }

  private updateSVCursor(): void {
    if (!this.saturationValue)
      return

    const cursor = this.container.querySelector('.sv-cursor') as HTMLElement
    if (!cursor)
      return

    const { s, v } = this.currentColor.hsv
    const x = (s / 100) * this.saturationValue.width
    const y = ((100 - v) / 100) * this.saturationValue.height

    cursor.style.left = `${x}px`
    cursor.style.top = `${y}px`
  }

  private updateHueCursor(): void {
    if (!this.hueSlider)
      return

    const handle = this.hueSlider.querySelector('.slider-handle') as HTMLElement
    if (!handle)
      return

    const { h } = this.currentColor.hsv
    const x = (h / 360) * this.hueSlider.offsetWidth

    handle.style.left = `${x}px`
  }

  private updateAlphaCursor(): void {
    if (!this.alphaSlider || !this.options.showAlpha)
      return

    const handle = this.alphaSlider.querySelector('.slider-handle') as HTMLElement
    if (!handle)
      return

    const a = this.currentColor.rgb.a || 1
    const x = a * this.alphaSlider.offsetWidth

    handle.style.left = `${x}px`
  }

  private updateInputFields(): void {
    const { hex, rgb, hsl, hsv } = this.currentColor

    // Update hex input
    const hexInput = this.inputFields?.get('hex-input')
    if (hexInput)
      hexInput.value = hex

    // Update RGB inputs
    const rgbR = this.inputFields?.get('rgb-r')
    if (rgbR)
      rgbR.value = String(rgb.r)
    const rgbG = this.inputFields?.get('rgb-g')
    if (rgbG)
      rgbG.value = String(rgb.g)
    const rgbB = this.inputFields?.get('rgb-b')
    if (rgbB)
      rgbB.value = String(rgb.b)
    const rgbA = this.inputFields?.get('rgb-a')
    if (rgbA)
      rgbA.value = String(rgb.a || 1)

    // Update HSL inputs
    const hslH = this.inputFields?.get('hsl-h')
    if (hslH)
      hslH.value = String(Math.round(hsl.h))
    const hslS = this.inputFields?.get('hsl-s')
    if (hslS)
      hslS.value = String(Math.round(hsl.s))
    const hslL = this.inputFields?.get('hsl-l')
    if (hslL)
      hslL.value = String(Math.round(hsl.l))
    const hslA = this.inputFields?.get('hsl-a')
    if (hslA)
      hslA.value = String(hsl.a || 1)

    // Update HSV inputs
    const hsvH = this.inputFields?.get('hsv-h')
    if (hsvH)
      hsvH.value = String(Math.round(hsv.h))
    const hsvS = this.inputFields?.get('hsv-s')
    if (hsvS)
      hsvS.value = String(Math.round(hsv.s))
    const hsvV = this.inputFields?.get('hsv-v')
    if (hsvV)
      hsvV.value = String(Math.round(hsv.v))
    const hsvA = this.inputFields?.get('hsv-a')
    if (hsvA)
      hsvA.value = String(hsv.a || 1)
  }

  // Event handlers
  private handleSVMouseDown(e: MouseEvent): void {
    this.isDragging = true
    this.updateSVFromMouse(e)
  }

  private handleSVTouchStart(e: TouchEvent): void {
    this.isDragging = true
    this.updateSVFromTouch(e)
  }

  private handleHueMouseDown(e: MouseEvent): void {
    this.isDragging = true
    this.updateHueFromMouse(e)
  }

  private handleHueTouchStart(e: TouchEvent): void {
    this.isDragging = true
    this.updateHueFromTouch(e)
  }

  private handleAlphaMouseDown(e: MouseEvent): void {
    this.isDragging = true
    this.updateAlphaFromMouse(e)
  }

  private handleAlphaTouchStart(e: TouchEvent): void {
    this.isDragging = true
    this.updateAlphaFromTouch(e)
  }

  private handleMouseMove(e: MouseEvent): void {
    if (!this.isDragging)
      return

    // Determine which element is being dragged
    const target = e.target as HTMLElement
    if (target === this.saturationValue || target.closest('.sv-mode')) {
      this.updateSVFromMouse(e)
    }
    else if (target === this.hueSlider || target.closest('#hue-slider')) {
      this.updateHueFromMouse(e)
    }
    else if (target === this.alphaSlider || target.closest('#alpha-slider')) {
      this.updateAlphaFromMouse(e)
    }
  }

  private handleTouchMove(e: TouchEvent): void {
    if (!this.isDragging)
      return

    const target = e.target as HTMLElement
    if (target === this.saturationValue || target.closest('.sv-mode')) {
      this.updateSVFromTouch(e)
    }
    else if (target === this.hueSlider || target.closest('#hue-slider')) {
      this.updateHueFromTouch(e)
    }
    else if (target === this.alphaSlider || target.closest('#alpha-slider')) {
      this.updateAlphaFromTouch(e)
    }
  }

  private handleMouseUp(): void {
    this.isDragging = false
  }

  private handleTouchEnd(): void {
    this.isDragging = false
  }

  private updateSVFromMouse(e: MouseEvent): void {
    if (!this.saturationValue)
      return

    const rect = this.saturationValue.getBoundingClientRect()
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left))
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top))

    const s = (x / rect.width) * 100
    const v = 100 - (y / rect.height) * 100

    this.updateColorFromHSV(this.currentColor.hsv.h, s, v)
  }

  private updateSVFromTouch(e: TouchEvent): void {
    const touch = e.touches[0]
    this.updateSVFromMouse(touch as any)
  }

  private updateHueFromMouse(e: MouseEvent): void {
    if (!this.hueSlider)
      return

    const rect = this.hueSlider.getBoundingClientRect()
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left))
    const h = (x / rect.width) * 360

    this.updateColorFromHSV(h, this.currentColor.hsv.s, this.currentColor.hsv.v)
  }

  private updateHueFromTouch(e: TouchEvent): void {
    const touch = e.touches[0]
    this.updateHueFromMouse(touch as any)
  }

  private updateAlphaFromMouse(e: MouseEvent): void {
    if (!this.alphaSlider)
      return

    const rect = this.alphaSlider.getBoundingClientRect()
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left))
    const a = x / rect.width

    this.currentColor.rgb.a = a
    this.currentColor.hsl.a = a
    this.currentColor.hsv.a = a

    this.updateUI()
    this.emitChange()
  }

  private updateAlphaFromTouch(e: TouchEvent): void {
    const touch = e.touches[0]
    this.updateAlphaFromMouse(touch as any)
  }

  private handleInputChange(inputId: string): void {
    const input = this.inputFields?.get(inputId)
    if (!input)
      return

    const value = input.value

    if (inputId === 'hex-input') {
      this.setColor(value)
    }
    else if (inputId.startsWith('rgb-')) {
      const r = Number.parseInt(this.inputFields?.get('rgb-r')?.value || '0')
      const g = Number.parseInt(this.inputFields?.get('rgb-g')?.value || '0')
      const b = Number.parseInt(this.inputFields?.get('rgb-b')?.value || '0')
      const a = Number.parseFloat(this.inputFields?.get('rgb-a')?.value || '1')
      this.setColorFromRGB(r, g, b, a)
    }
    else if (inputId.startsWith('hsl-')) {
      const h = Number.parseInt(this.inputFields?.get('hsl-h')?.value || '0')
      const s = Number.parseInt(this.inputFields?.get('hsl-s')?.value || '0')
      const l = Number.parseInt(this.inputFields?.get('hsl-l')?.value || '0')
      const a = Number.parseFloat(this.inputFields?.get('hsl-a')?.value || '1')
      this.setColorFromHSL(h, s, l, a)
    }
    else if (inputId.startsWith('hsv-')) {
      const h = Number.parseInt(this.inputFields?.get('hsv-h')?.value || '0')
      const s = Number.parseInt(this.inputFields?.get('hsv-s')?.value || '0')
      const v = Number.parseInt(this.inputFields?.get('hsv-v')?.value || '0')
      const a = Number.parseFloat(this.inputFields?.get('hsv-a')?.value || '1')
      this.setColorFromHSV(h, s, v, a)
    }
  }

  private switchInputFormat(format: string): void {
    // Update tab buttons
    const tabs = this.container.querySelectorAll('.tab-btn')
    tabs.forEach((tab) => {
      const tabEl = tab as HTMLElement
      tabEl.classList.toggle('active', (tabEl.getAttribute('data-format') || '') === format)
    })

    // Update field groups
    const groups = this.container.querySelectorAll('.field-group')
    groups.forEach((group) => {
      const groupEl = group as HTMLElement
      groupEl.classList.toggle('active', (groupEl.getAttribute('data-format') || '') === format)
    })
  }

  // Color conversion methods
  private parseColor(color: string): ColorPickerValue {
    // Parse hex color
    const hex = color
    const rgb = this.hexToRgb(hex)
    const hsl = this.rgbToHsl(rgb)
    const hsv = this.rgbToHsv(rgb)

    return { hex, rgb, hsl, hsv }
  }

  private hexToRgb(hex: string): { r: number, g: number, b: number, a?: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(hex)
    if (!result)
      return { r: 0, g: 0, b: 0, a: 1 }

    return {
      r: Number.parseInt(result[1], 16),
      g: Number.parseInt(result[2], 16),
      b: Number.parseInt(result[3], 16),
      a: result[4] ? Number.parseInt(result[4], 16) / 255 : 1,
    }
  }

  private rgbToHex(r: number, g: number, b: number, a?: number): string {
    const toHex = (n: number) => n.toString(16).padStart(2, '0')
    let hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`
    if (a !== undefined && a < 1) {
      hex += toHex(Math.round(a * 255))
    }
    return hex.toUpperCase()
  }

  private rgbToHsl(rgb: { r: number, g: number, b: number, a?: number }): {
    h: number
    s: number
    l: number
    a?: number
  } {
    const r = rgb.r / 255
    const g = rgb.g / 255
    const b = rgb.b / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const l = (max + min) / 2

    if (max === min) {
      return { h: 0, s: 0, l: l * 100, a: rgb.a }
    }

    const d = max - min
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    let h = 0
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }

    return { h: h * 360, s: s * 100, l: l * 100, a: rgb.a }
  }

  private hslToRgb(
    h: number,
    s: number,
    l: number,
    a?: number,
  ): { r: number, g: number, b: number, a?: number } {
    h = h / 360
    s = s / 100
    l = l / 100

    let r, g, b

    if (s === 0) {
      r = g = b = l
    }
    else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0)
          t += 1
        if (t > 1)
          t -= 1
        if (t < 1 / 6)
          return p + (q - p) * 6 * t
        if (t < 1 / 2)
          return q
        if (t < 2 / 3)
          return p + (q - p) * (2 / 3 - t) * 6
        return p
      }

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q

      r = hue2rgb(p, q, h + 1 / 3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1 / 3)
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
      a,
    }
  }

  private rgbToHsv(rgb: { r: number, g: number, b: number, a?: number }): {
    h: number
    s: number
    v: number
    a?: number
  } {
    const r = rgb.r / 255
    const g = rgb.g / 255
    const b = rgb.b / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const v = max

    if (max === min) {
      return { h: 0, s: 0, v: v * 100, a: rgb.a }
    }

    const d = max - min
    const s = max === 0 ? 0 : d / max

    let h = 0
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }

    return { h: h * 360, s: s * 100, v: v * 100, a: rgb.a }
  }

  private hsvToRgb(
    h: number,
    s: number,
    v: number,
    a?: number,
  ): { r: number, g: number, b: number, a?: number } {
    h = h / 360
    s = s / 100
    v = v / 100

    const i = Math.floor(h * 6)
    const f = h * 6 - i
    const p = v * (1 - s)
    const q = v * (1 - f * s)
    const t = v * (1 - (1 - f) * s)

    let r, g, b

    switch (i % 6) {
      case 0:
        r = v
        g = t
        b = p
        break
      case 1:
        r = q
        g = v
        b = p
        break
      case 2:
        r = p
        g = v
        b = t
        break
      case 3:
        r = p
        g = q
        b = v
        break
      case 4:
        r = t
        g = p
        b = v
        break
      case 5:
        r = v
        g = p
        b = q
        break
      default:
        r = g = b = 0
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
      a,
    }
  }

  // Public methods
  setColor(color: string): void {
    this.currentColor = this.parseColor(color)
    this.render()
    this.updateUI()
    this.emitChange()
  }

  setColorFromRGB(r: number, g: number, b: number, a?: number): void {
    const rgb = { r, g, b, a }
    const hex = this.rgbToHex(r, g, b, a)
    const hsl = this.rgbToHsl(rgb)
    const hsv = this.rgbToHsv(rgb)

    this.currentColor = { hex, rgb, hsl, hsv }
    this.render()
    this.updateUI()
    this.emitChange()
  }

  setColorFromHSL(h: number, s: number, l: number, a?: number): void {
    const rgb = this.hslToRgb(h, s, l, a)
    const hex = this.rgbToHex(rgb.r, rgb.g, rgb.b, rgb.a)
    const hsl = { h, s, l, a }
    const hsv = this.rgbToHsv(rgb)

    this.currentColor = { hex, rgb, hsl, hsv }
    this.render()
    this.updateUI()
    this.emitChange()
  }

  setColorFromHSV(h: number, s: number, v: number, a?: number): void {
    const rgb = this.hsvToRgb(h, s, v, a)
    const hex = this.rgbToHex(rgb.r, rgb.g, rgb.b, rgb.a)
    const hsl = this.rgbToHsl(rgb)
    const hsv = { h, s, v, a }

    this.currentColor = { hex, rgb, hsl, hsv }
    this.render()
    this.updateUI()
    this.emitChange()
  }

  private updateColorFromHSV(h: number, s: number, v: number): void {
    const a = this.currentColor.hsv.a
    this.setColorFromHSV(h, s, v, a)
  }

  getColor(): ColorPickerValue {
    return { ...this.currentColor }
  }

  getFormattedColor(): string {
    switch (this.options.format) {
      case 'rgb':
        const { r, g, b, a = 1 } = this.currentColor.rgb
        return a < 1 ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`
      case 'hsl':
        const { h, s, l, a: ha = 1 } = this.currentColor.hsl
        return ha < 1
          ? `hsla(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%, ${ha})`
          : `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`
      case 'hsv':
        const hsv = this.currentColor.hsv
        return `hsv(${Math.round(hsv.h)}, ${Math.round(hsv.s)}%, ${Math.round(hsv.v)}%)`
      default:
        return this.currentColor.hex
    }
  }

  private emitChange(): void {
    this.options.onChange(this.getColor())
  }

  private saveColor(): void {
    const color = this.currentColor.hex

    // Add to history
    if (this.options.showHistory) {
      this.addToHistory(color)
    }

    // Emit save event
    this.options.onSave(this.getColor())
  }

  private addToHistory(color: string): void {
    // Remove if already exists
    const index = this.history.indexOf(color)
    if (index > -1) {
      this.history.splice(index, 1)
    }

    // Add to beginning
    this.history.unshift(color)

    // Limit history size
    if (this.history.length > this.options.maxHistory) {
      this.history = this.history.slice(0, this.options.maxHistory)
    }

    // Update UI
    this.renderHistory()
  }

  private renderHistory(): void {
    const historyContainer = this.container.querySelector('#history-colors')
    if (!historyContainer)
      return

    historyContainer.innerHTML = this.history
      .map(
        color =>
          `<div class="history-color" data-color="${color}" style="background: ${color}"></div>`,
      )
      .join('')

    // Add click handlers
    historyContainer.querySelectorAll('.history-color').forEach((el) => {
      el.addEventListener('click', (e) => {
        const color = (e.target as HTMLElement).dataset.color!
        this.setColor(color)
      })
    })
  }

  private resolveContainer(container: HTMLElement | string): HTMLElement {
    if (typeof container === 'string') {
      const el = document.querySelector(container) as HTMLElement
      if (!el)
        throw new Error(`Container ${container} not found`)
      return el
    }
    return container
  }

  open(): void {
    this.container.style.display = 'block'
  }

  close(): void {
    this.container.style.display = 'none'
  }

  destroy(): void {
    // Remove event listeners
    document.removeEventListener('mousemove', this.handleMouseMove.bind(this))
    document.removeEventListener('mouseup', this.handleMouseUp.bind(this))
    document.removeEventListener('touchmove', this.handleTouchMove.bind(this))
    document.removeEventListener('touchend', this.handleTouchEnd.bind(this))

    // Clear container
    this.container.innerHTML = ''
  }
}

// Export factory function
export function createColorPicker(options?: ColorPickerOptions): AdvancedColorPicker {
  return new AdvancedColorPicker(options)
}
