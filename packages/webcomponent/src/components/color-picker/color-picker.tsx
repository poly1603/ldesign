import { Component, Prop, State, Event, EventEmitter, h, Host, Element, Watch } from '@stencil/core';
import { Size } from '../../types';

/**
 * ColorPicker 颜色选择器
 * - 支持 SV 色板 + Hue 滑条 + 可选 Alpha
 * - 支持 HEX/RGB/HSL/HSV 输入与预设/历史颜色
 */
@Component({
  tag: 'ldesign-color-picker',
  styleUrl: 'color-picker.less',
  shadow: false,
})
export class LdesignColorPicker {
  @Element() host!: HTMLElement;

  // Refs
  private svCanvas?: HTMLCanvasElement;
  private hueTrack?: HTMLElement;
  private alphaTrack?: HTMLElement;

  // Public props
  /** 当前颜色值（默认 hex），支持 #RRGGBB/#RRGGBBAA、rgb/rgba、hsl/hsla */
  @Prop({ mutable: true, reflect: true }) value: string = '#3498db';
  /** 默认显示格式 */
  @Prop() format: 'hex' | 'rgb' | 'hsl' | 'hsv' = 'hex';
  /** 是否显示透明度 */
  @Prop() showAlpha: boolean = true;
  /** 是否显示预设颜色 */
  @Prop() showPreset: boolean = true;
  /** 是否显示最近使用 */
  @Prop() showHistory: boolean = true;
  /** 预设颜色 */
  @Prop() presets: string[] = [
    '#ff4d4f', '#ff7a45', '#ffa940', '#ffc53d', '#ffec3d', '#bae637', '#73d13d', '#36cfc9', '#40a9ff', '#597ef7', '#9254de', '#f759ab',
    '#d4380d', '#d46b08', '#d48806', '#ad8b00', '#5b8c00', '#08979c', '#096dd9', '#1d39c4', '#531dab', '#c41d7f', '#8c8c8c', '#595959',
  ];
  /** 最近使用最多条数 */
  @Prop() recentMax: number = 12;
  /** 尺寸（影响输入高度等） */
  @Prop() size: Size = 'medium';
  /** 是否禁用 */
  @Prop() disabled: boolean = false;

  // Events
  /** 拖动或输入实时触发 */
  @Event() ldesignInput!: EventEmitter<string>;
  /** 颜色确定触发（拖动结束、输入回车或失焦） */
  @Event() ldesignChange!: EventEmitter<string>;

  // Internal state
  @State() private activeFormat: 'hex' | 'rgb' | 'hsl' | 'hsv' = this.format;
  @State() private hsv: { h: number; s: number; v: number } = { h: 204, s: 72, v: 86 };
  @State() private alpha: number = 1;
  @State() private dragging: 'sv' | 'hue' | 'alpha' | null = null;
  @State() private history: string[] = [];

  componentWillLoad() {
    // 初始化颜色
    this.applyIncomingValue(this.value);
  }

  @Watch('value')
  onValueChange(next: string) {
    // 外部受控更新
    this.applyIncomingValue(next, true);
  }

  private applyIncomingValue(input: string, silent = false) {
    const parsed = this.parseColor(input || '#000000');
    if (!parsed) return;
    this.hsv = { h: parsed.hsv.h, s: parsed.hsv.s, v: parsed.hsv.v };
    this.alpha = parsed.rgb.a ?? 1;
    if (!silent) {
      // 同步格式化后的值到 value（保持与当前 format 一致）
      this.value = this.getFormattedColor();
    }
  }

  // ---------- Color helpers ----------
  private clamp(n: number, min: number, max: number) { return Math.min(max, Math.max(min, n)); }

  private hexToRgb(hex: string): { r: number; g: number; b: number; a?: number } | null {
    const cleaned = hex.trim().replace(/^#/,'');
    if (![3,4,6,8].includes(cleaned.length)) return null;
    const expand = (s: string) => s.length === 1 ? s + s : s;
    let r=0,g=0,b=0,a: number | undefined;
    if (cleaned.length === 3 || cleaned.length === 4){
      r = parseInt(expand(cleaned[0]),16);
      g = parseInt(expand(cleaned[1]),16);
      b = parseInt(expand(cleaned[2]),16);
      if (cleaned.length === 4) a = parseInt(expand(cleaned[3]),16)/255;
    } else {
      r = parseInt(cleaned.slice(0,2),16);
      g = parseInt(cleaned.slice(2,4),16);
      b = parseInt(cleaned.slice(4,6),16);
      if (cleaned.length === 8) a = parseInt(cleaned.slice(6,8),16)/255;
    }
    return { r,g,b,a };
  }

  private rgbToHex(r: number,g: number,b: number,a?: number) {
    const toHex = (n: number) => this.clamp(Math.round(n),0,255).toString(16).padStart(2,'0');
    const base = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    if (a === undefined || a >= 1) return base;
    const aHex = this.clamp(Math.round(a*255),0,255).toString(16).padStart(2,'0');
    return base + aHex;
  }

  private rgbToHsv({r,g,b,a}: {r:number;g:number;b:number;a?:number}){
    r/=255; g/=255; b/=255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    const d = max - min;
    const v = max;
    const s = max === 0 ? 0 : d / max;
    let h = 0;
    if (d !== 0){
      switch(max){
        case r: h = (g-b)/d + (g<b?6:0); break;
        case g: h = (b-r)/d + 2; break;
        case b: h = (r-g)/d + 4; break;
      }
      h /= 6;
    }
    return { h: h*360, s: s*100, v: v*100, a };
  }

  private hsvToRgb(h:number,s:number,v:number,a?:number){
    h/=360; s/=100; v/=100;
    const i = Math.floor(h*6);
    const f = h*6 - i;
    const p = v*(1-s);
    const q = v*(1-f*s);
    const t = v*(1-(1-f)*s);
    let R=0,G=0,B=0;
    switch(i%6){
      case 0: R=v; G=t; B=p; break;
      case 1: R=q; G=v; B=p; break;
      case 2: R=p; G=v; B=t; break;
      case 3: R=p; G=q; B=v; break;
      case 4: R=t; G=p; B=v; break;
      case 5: R=v; G=p; B=q; break;
    }
    return { r: Math.round(R*255), g: Math.round(G*255), b: Math.round(B*255), a };
  }

  private rgbToHsl({r,g,b,a}: {r:number;g:number;b:number;a?:number}){
    r/=255; g/=255; b/=255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h=0,s=0; const l = (max+min)/2;
    if (max!==min){
      const d = max-min;
      s = l>0.5 ? d/(2-max-min) : d/(max+min);
      switch(max){
        case r: h=(g-b)/d + (g<b?6:0); break;
        case g: h=(b-r)/d + 2; break;
        case b: h=(r-g)/d + 4; break;
      }
      h/=6;
    }
    return { h: h*360, s: s*100, l: l*100, a };
  }

  private hslToRgb(h:number,s:number,l:number,a?:number){
    h/=360; s/=100; l/=100;
    const hue2rgb = (p:number,q:number,t:number)=>{ if(t<0) t+=1; if(t>1) t-=1; if(t<1/6) return p+(q-p)*6*t; if(t<1/2) return q; if(t<2/3) return p+(q-p)*(2/3-t)*6; return p; };
    let r:number,g:number,b:number;
    if (s===0){ r=g=b=l; }
    else{
      const q = l<0.5 ? l*(1+s) : l+s-l*s;
      const p = 2*l - q;
      r = hue2rgb(p,q,h+1/3);
      g = hue2rgb(p,q,h);
      b = hue2rgb(p,q,h-1/3);
    }
    return { r: Math.round(r*255), g: Math.round(g*255), b: Math.round(b*255), a };
  }

  private parseColor(input: string): { hex: string; rgb: {r:number;g:number;b:number;a?:number}; hsl: {h:number;s:number;l:number;a?:number}; hsv: {h:number;s:number;v:number;a?:number} } | null {
    input = (input || '').trim();
    // hex
    if (input.startsWith('#')){
      const rgb = this.hexToRgb(input); if(!rgb) return null;
      const hex = this.rgbToHex(rgb.r,rgb.g,rgb.b,rgb.a);
      const hsl = this.rgbToHsl(rgb);
      const hsv = this.rgbToHsv(rgb);
      return { hex, rgb, hsl, hsv };
    }
    // rgb/rgba
    const rgbMatch = input.match(/^rgba?\(([^)]+)\)$/i);
    if (rgbMatch){
      const parts = rgbMatch[1].split(',').map(s=>s.trim());
      const r = parseFloat(parts[0]);
      const g = parseFloat(parts[1]);
      const b = parseFloat(parts[2]);
      const a = parts[3]!==undefined ? parseFloat(parts[3]) : undefined;
      const rgb = { r: this.clamp(r,0,255), g: this.clamp(g,0,255), b: this.clamp(b,0,255), a };
      const hex = this.rgbToHex(rgb.r,rgb.g,rgb.b,a);
      const hsl = this.rgbToHsl(rgb);
      const hsv = this.rgbToHsv(rgb);
      return { hex, rgb, hsl, hsv };
    }
    // hsl/hsla
    const hslMatch = input.match(/^hsla?\(([^)]+)\)$/i);
    if (hslMatch){
      const parts = hslMatch[1].split(',').map(s=>s.trim().replace(/%$/,''));
      const h = parseFloat(parts[0]);
      const s = parseFloat(parts[1]);
      const l = parseFloat(parts[2]);
      const a = parts[3]!==undefined ? parseFloat(parts[3]) : undefined;
      const rgb = this.hslToRgb(h,s,l,a);
      const hex = this.rgbToHex(rgb.r,rgb.g,rgb.b,a);
      const hsl = { h,s,l,a };
      const hsv = this.rgbToHsv(rgb);
      return { hex, rgb, hsl, hsv };
    }
    // hsv
    const hsvMatch = input.match(/^hsv\(([^)]+)\)$/i);
    if (hsvMatch){
      const parts = hsvMatch[1].split(',').map(s=>s.trim().replace(/%$/,''));
      const h = parseFloat(parts[0]);
      const s = parseFloat(parts[1]);
      const v = parseFloat(parts[2]);
      const rgb = this.hsvToRgb(h,s,v);
      const hex = this.rgbToHex(rgb.r,rgb.g,rgb.b);
      const hsl = this.rgbToHsl(rgb);
      const hsv = { h,s,v };
      return { hex, rgb, hsl, hsv };
    }
    return null;
  }

  private getFormattedColor(): string {
    const { h, s, v } = this.hsv;
    const rgb = this.hsvToRgb(h,s,v,this.alpha);
    switch(this.activeFormat){
      case 'rgb': return this.alpha<1 ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${this.alpha})` : `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      case 'hsl': const hsl = this.rgbToHsl(rgb); return this.alpha<1 ? `hsla(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%, ${this.alpha})` : `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;
      case 'hsv': return `hsv(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(v)}%)`;
      default: return this.rgbToHex(rgb.r,rgb.g,rgb.b,this.alpha);
    }
  }

  // ---------- UI helpers ----------
  private renderSV() {
    const c = this.svCanvas; if(!c) return;
    const ctx = c.getContext('2d'); if(!ctx) return;
    const w = c.width, h = c.height;
    // fill with white->hue gradient
    const hueRGB = this.hsvToRgb(this.hsv.h, 100, 100);
    const g1 = ctx.createLinearGradient(0,0,w,0);
    g1.addColorStop(0,'#fff');
    g1.addColorStop(1,`rgb(${hueRGB.r}, ${hueRGB.g}, ${hueRGB.b})`);
    ctx.fillStyle = g1; ctx.fillRect(0,0,w,h);
    const g2 = ctx.createLinearGradient(0,0,0,h);
    g2.addColorStop(0,'rgba(0,0,0,0)');
    g2.addColorStop(1,'#000');
    ctx.fillStyle = g2; ctx.fillRect(0,0,w,h);
  }

  componentDidRender() {
    this.renderSV();
  }

  // ---------- pointer handlers ----------
  private onSVPointerDown = (e: PointerEvent) => {
    if (this.disabled) return;
    this.dragging = 'sv';
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    this.updateFromSVPointer(e);
    window.addEventListener('pointermove', this.onWindowPointerMove);
    window.addEventListener('pointerup', this.onWindowPointerUp);
  };

  private onHuePointerDown = (e: PointerEvent) => {
    if (this.disabled) return;
    this.dragging = 'hue';
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    this.updateFromHuePointer(e);
    window.addEventListener('pointermove', this.onWindowPointerMove);
    window.addEventListener('pointerup', this.onWindowPointerUp);
  };

  private onAlphaPointerDown = (e: PointerEvent) => {
    if (!this.showAlpha || this.disabled) return;
    this.dragging = 'alpha';
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    this.updateFromAlphaPointer(e);
    window.addEventListener('pointermove', this.onWindowPointerMove);
    window.addEventListener('pointerup', this.onWindowPointerUp);
  };

  private onWindowPointerMove = (e: PointerEvent) => {
    if (!this.dragging) return;
    switch(this.dragging){
      case 'sv': this.updateFromSVPointer(e, true); break;
      case 'hue': this.updateFromHuePointer(e, true); break;
      case 'alpha': this.updateFromAlphaPointer(e, true); break;
    }
  };

  private onWindowPointerUp = (_e: PointerEvent) => {
    if (!this.dragging) return;
    this.dragging = null;
    window.removeEventListener('pointermove', this.onWindowPointerMove);
    window.removeEventListener('pointerup', this.onWindowPointerUp);
    // emit change
    const out = this.getFormattedColor();
    this.value = out;
    this.ldesignChange.emit(out);
    if (this.showHistory) this.pushHistory(this.rgbToHex(...Object.values(this.hsvToRgb(this.hsv.h, this.hsv.s, this.hsv.v)).slice(0,3) as [number,number,number], this.alpha));
  };

  private updateFromSVPointer(e: PointerEvent, isMove = false){
    if (!this.svCanvas) return;
    const rect = this.svCanvas.getBoundingClientRect();
    const x = this.clamp(e.clientX - rect.left, 0, rect.width);
    const y = this.clamp(e.clientY - rect.top, 0, rect.height);
    const s = (x / rect.width) * 100;
    const v = (1 - y / rect.height) * 100;
    this.hsv = { ...this.hsv, s, v };
    const out = this.getFormattedColor();
    this.value = out;
    this.ldesignInput.emit(out);
  }

  private updateFromHuePointer(e: PointerEvent, isMove = false){
    if (!this.hueTrack) return;
    const rect = this.hueTrack.getBoundingClientRect();
    const x = this.clamp(e.clientX - rect.left, 0, rect.width);
    const h = (x / rect.width) * 360;
    this.hsv = { ...this.hsv, h };
    const out = this.getFormattedColor();
    this.value = out;
    this.ldesignInput.emit(out);
  }

  private updateFromAlphaPointer(e: PointerEvent, isMove = false){
    if (!this.alphaTrack) return;
    const rect = this.alphaTrack.getBoundingClientRect();
    const x = this.clamp(e.clientX - rect.left, 0, rect.width);
    this.alpha = x / rect.width;
    const out = this.getFormattedColor();
    this.value = out;
    this.ldesignInput.emit(out);
  }

  // ---------- Inputs & palette ----------
  private switchFormat(fmt: 'hex'|'rgb'|'hsl'|'hsv'){
    this.activeFormat = fmt;
    // 同步一次 value
    this.value = this.getFormattedColor();
  }

  private onHexInput(e: Event){
    const v = (e.target as HTMLInputElement).value;
    const parsed = this.parseColor(v);
    if (parsed){
      this.hsv = { h: parsed.hsv.h, s: parsed.hsv.s, v: parsed.hsv.v };
      this.alpha = parsed.rgb.a ?? 1;
      this.value = this.getFormattedColor();
      this.ldesignInput.emit(this.value);
      this.ldesignChange.emit(this.value);
    }
  }

  private onRGBInput(ids: ['r','g','b','a?'], values: number[]){
    const [r,g,b,aVal] = values;
    const rgb = { r, g, b, a: this.showAlpha ? (aVal ?? this.alpha) : undefined };
    const hsv = this.rgbToHsv(rgb);
    this.hsv = { h: hsv.h, s: hsv.s, v: hsv.v };
    this.alpha = rgb.a ?? this.alpha;
    this.value = this.getFormattedColor();
    this.ldesignInput.emit(this.value);
    this.ldesignChange.emit(this.value);
  }

  private onHSLInput(values: number[]){
    const [h,s,l,aVal] = values as any;
    const rgb = this.hslToRgb(h,s,l,this.showAlpha ? aVal : undefined);
    const hsv = this.rgbToHsv(rgb);
    this.hsv = { h: hsv.h, s: hsv.s, v: hsv.v };
    this.alpha = rgb.a ?? this.alpha;
    this.value = this.getFormattedColor();
    this.ldesignInput.emit(this.value);
    this.ldesignChange.emit(this.value);
  }

  private onHSVInput(values: number[]){
    const [h,s,v,aVal] = values as any;
    this.hsv = { h, s, v };
    if (this.showAlpha && typeof aVal === 'number') this.alpha = aVal;
    this.value = this.getFormattedColor();
    this.ldesignInput.emit(this.value);
    this.ldesignChange.emit(this.value);
  }

  private setFromPreset(color: string){
    const parsed = this.parseColor(color);
    if (!parsed) return;
    this.hsv = { h: parsed.hsv.h, s: parsed.hsv.s, v: parsed.hsv.v };
    this.alpha = parsed.rgb.a ?? 1;
    const out = this.getFormattedColor();
    this.value = out;
    this.ldesignInput.emit(out);
    this.ldesignChange.emit(out);
    if (this.showHistory) this.pushHistory(parsed.hex);
  }

  private pushHistory(hex: string){
    const list = this.history.slice();
    const idx = list.indexOf(hex);
    if (idx>=0) list.splice(idx,1);
    list.unshift(hex);
    if (list.length>this.recentMax) list.length = this.recentMax;
    this.history = list;
  }

  // ---------- Render ----------
  private hueGradientStyle(){
    const stops: string[] = [];
    for (let i=0;i<=360;i+=30){
      const {r,g,b} = this.hsvToRgb(i,100,100);
      stops.push(`rgb(${r}, ${g}, ${b})`);
    }
    return { background: `linear-gradient(to right, ${stops.join(', ')})` } as any;
  }

  private alphaGradientStyle(){
    const { r,g,b } = this.hsvToRgb(this.hsv.h, this.hsv.s, this.hsv.v);
    return {
      background: `linear-gradient(to right, rgba(${r}, ${g}, ${b}, 0), rgba(${r}, ${g}, ${b}, 1)), var(--ldesign-alpha-checker, url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"10\" height=\"10\"><rect width=\"5\" height=\"5\" fill=\"%23ccc\"/><rect x=\"5\" y=\"5\" width=\"5\" height=\"5\" fill=\"%23ccc\"/></svg>'))`
    } as any;
  }

  private pointerPosForSV(){
    if (!this.svCanvas) return { left: '0%', top: '0%' } as any;
    const left = `${this.hsv.s}%`;
    const top = `${100 - this.hsv.v}%`;
    return { left, top } as any;
  }

  private pointerPosForHue(){
    if (!this.hueTrack) return { left: '0%' } as any;
    return { left: `${(this.hsv.h/360)*100}%` } as any;
  }

  private pointerPosForAlpha(){
    if (!this.showAlpha || !this.alphaTrack) return { left: '100%' } as any;
    return { left: `${this.alpha*100}%` } as any;
  }

  private previewStyle(){
    const rgb = this.hsvToRgb(this.hsv.h,this.hsv.s,this.hsv.v,this.alpha);
    return { background: this.alpha<1 ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${this.alpha})` : `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` } as any;
  }

  private renderInputs(){
    const rgb = this.hsvToRgb(this.hsv.h,this.hsv.s,this.hsv.v,this.alpha);
    const hsl = this.rgbToHsl(rgb);
    const hex = this.rgbToHex(rgb.r,rgb.g,rgb.b,this.alpha);

    return (
      <div class="cp-inputs">
        <div class="cp-tabs">
          <button class={{'active': this.activeFormat==='hex'}} onClick={()=>this.switchFormat('hex')}>HEX</button>
          <button class={{'active': this.activeFormat==='rgb'}} onClick={()=>this.switchFormat('rgb')}>RGB</button>
          <button class={{'active': this.activeFormat==='hsl'}} onClick={()=>this.switchFormat('hsl')}>HSL</button>
          <button class={{'active': this.activeFormat==='hsv'}} onClick={()=>this.switchFormat('hsv')}>HSV</button>
        </div>
        <div class="cp-fields">
          {this.activeFormat==='hex' && (
            <div class="field-row">
              <input type="text" class="hex" value={hex} onChange={(e)=>this.onHexInput(e)} disabled={this.disabled} />
            </div>
          )}
          {this.activeFormat==='rgb' && (
            <div class="field-row">
              <input type="number" min="0" max="255" value={rgb.r} disabled={this.disabled} onChange={(e)=>this.onRGBInput(['r','g','b','a?'], [parseFloat((e.target as any).value), rgb.g, rgb.b, this.alpha])} />
              <input type="number" min="0" max="255" value={rgb.g} disabled={this.disabled} onChange={(e)=>this.onRGBInput(['r','g','b','a?'], [rgb.r, parseFloat((e.target as any).value), rgb.b, this.alpha])} />
              <input type="number" min="0" max="255" value={rgb.b} disabled={this.disabled} onChange={(e)=>this.onRGBInput(['r','g','b','a?'], [rgb.r, rgb.g, parseFloat((e.target as any).value), this.alpha])} />
              {this.showAlpha ? (
                <input type="number" min="0" max="1" step="0.01" value={this.alpha} disabled={this.disabled} onChange={(e)=>this.onRGBInput(['r','g','b','a?'], [rgb.r, rgb.g, rgb.b, parseFloat((e.target as any).value)])} />
              ) : null}
            </div>
          )}
          {this.activeFormat==='hsl' && (
            <div class="field-row">
              <input type="number" min="0" max="360" value={Math.round(hsl.h)} disabled={this.disabled} onChange={(e)=>this.onHSLInput([parseFloat((e.target as any).value), hsl.s, hsl.l, this.alpha])} />
              <input type="number" min="0" max="100" value={Math.round(hsl.s)} disabled={this.disabled} onChange={(e)=>this.onHSLInput([hsl.h, parseFloat((e.target as any).value), hsl.l, this.alpha])} />
              <input type="number" min="0" max="100" value={Math.round(hsl.l)} disabled={this.disabled} onChange={(e)=>this.onHSLInput([hsl.h, hsl.s, parseFloat((e.target as any).value), this.alpha])} />
              {this.showAlpha ? (
                <input type="number" min="0" max="1" step="0.01" value={this.alpha} disabled={this.disabled} onChange={(e)=>this.onHSLInput([hsl.h, hsl.s, hsl.l, parseFloat((e.target as any).value)])} />
              ) : null}
            </div>
          )}
          {this.activeFormat==='hsv' && (
            <div class="field-row">
              <input type="number" min="0" max="360" value={Math.round(this.hsv.h)} disabled={this.disabled} onChange={(e)=>this.onHSVInput([parseFloat((e.target as any).value), this.hsv.s, this.hsv.v, this.alpha])} />
              <input type="number" min="0" max="100" value={Math.round(this.hsv.s)} disabled={this.disabled} onChange={(e)=>this.onHSVInput([this.hsv.h, parseFloat((e.target as any).value), this.hsv.v, this.alpha])} />
              <input type="number" min="0" max="100" value={Math.round(this.hsv.v)} disabled={this.disabled} onChange={(e)=>this.onHSVInput([this.hsv.h, this.hsv.s, parseFloat((e.target as any).value), this.alpha])} />
              {this.showAlpha ? (
                <input type="number" min="0" max="1" step="0.01" value={this.alpha} disabled={this.disabled} onChange={(e)=>this.onHSVInput([this.hsv.h, this.hsv.s, this.hsv.v, parseFloat((e.target as any).value)])} />
              ) : null}
            </div>
          )}
        </div>
      </div>
    );
  }

  render() {
    const hueStyle = this.hueGradientStyle();
    const alphaStyle = this.alphaGradientStyle();

    return (
      <Host>
<div class={{ 'ldesign-color-picker': true, [`ldesign-color-picker--${this.size}`]: true, 'ldesign-color-picker--disabled': this.disabled }}>
          <div class="cp-header">
            <div class="preview" style={this.previewStyle()} />
            <div class="label">{this.value}</div>
          </div>

          <div class="cp-body">
            <div class="sv-wrap">
              <canvas ref={el => (this.svCanvas = el as HTMLCanvasElement)} class="sv-canvas" width={220} height={160} onPointerDown={this.onSVPointerDown as any}></canvas>
              <div class="sv-cursor" style={this.pointerPosForSV()}></div>
            </div>

            <div class="sliders">
              <div class="slider hue" ref={el=> (this.hueTrack = el as HTMLElement)} style={hueStyle} onPointerDown={this.onHuePointerDown as any}>
                <div class="slider-handle" style={this.pointerPosForHue()} />
              </div>
              {this.showAlpha ? (
                <div class="slider alpha" ref={el=> (this.alphaTrack = el as HTMLElement)} style={alphaStyle} onPointerDown={this.onAlphaPointerDown as any}>
                  <div class="slider-handle" style={this.pointerPosForAlpha()} />
                </div>
              ) : null}
            </div>

            {this.renderInputs()}

            {this.showPreset ? (
              <div class="cp-section">
                <div class="section-title">系统预设颜色</div>
                <div class="swatches">
                  {this.presets.map(c => (
                    <div class="swatch" style={{ background: c }} onClick={()=>this.setFromPreset(c)} title={c}></div>
                  ))}
                </div>
              </div>
            ) : null}

            {this.showHistory ? (
              <div class="cp-section">
                <div class="section-title">最近使用颜色</div>
                <div class="swatches">
                  {this.history.length ? this.history.map(c => (
                    <div class="swatch" style={{ background: c }} onClick={()=>this.setFromPreset(c)} title={c}></div>
                  )) : <div class="empty">暂无</div>}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </Host>
    );
  }
}