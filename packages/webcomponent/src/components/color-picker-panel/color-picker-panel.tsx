import { Component, Prop, State, Event, EventEmitter, h, Host, Element, Watch } from '@stencil/core';
import { Size } from '../../types';

/**
 * ColorPicker Panel 纯面板
 * - 不包含 Popup/触发器，仅渲染颜色选择面板
 * - 适合内嵌在任意容器，宽度默认铺满容器
 */
@Component({
  tag: 'ldesign-color-picker-panel',
  styleUrl: 'color-picker-panel.less',
  shadow: false,
})
export class LdesignColorPickerPanel {
  @Element() host!: HTMLElement;

  // Refs
  private svCanvas?: HTMLCanvasElement;
  private hueTrack?: HTMLElement;
  private alphaTrack?: HTMLElement;
  private ro?: ResizeObserver;

  // Public props
  /** 当前颜色（默认 hex），支持 #RRGGBB/#RRGGBBAA、rgb/rgba、hsl/hsla、hsv */
  @Prop({ mutable: true, reflect: true }) value: string = '#3498db';
  /** 默认显示格式 */
  @Prop() format: 'hex' | 'rgb' | 'hsl' | 'hsv' = 'hex';
  /** 是否显示透明度 */
  @Prop() showAlpha: boolean = true;
  /** 是否显示系统预设 */
  @Prop() showPreset: boolean = true;
  /** 是否显示最近使用（无数据时自动隐藏） */
  @Prop() showHistory: boolean = true;
  /** 预设颜色 */
  @Prop() presets: string[] = [
    '#ff4d4f', '#ff7a45', '#ffa940', '#ffc53d', '#ffec3d', '#bae637', '#73d13d', '#36cfc9', '#40a9ff', '#597ef7', '#9254de', '#f759ab',
    '#d4380d', '#d46b08', '#d48806', '#ad8b00', '#5b8c00', '#08979c', '#096dd9', '#1d39c4', '#531dab', '#c41d7f', '#8c8c8c', '#595959',
  ];
  /** 最近使用最多条数 */
  @Prop() recentMax: number = 12;
  /** 尺寸（影响整体间距） */
  @Prop() size: Size = 'medium';
  /** 是否禁用（禁用交互） */
  @Prop() disabled: boolean = false;
  /** 面板模式：单色 | 渐变 | 两者 */
  @Prop() modes: 'solid' | 'gradient' | 'both' = 'both';
  /** 渐变类型：线性/径向/两者（仅在 activeMode=gradient 时生效） */
  @Prop() gradientTypes: 'linear' | 'radial' | 'both' = 'both';
  /** 渐变色标之间的最小间距（百分比，避免重叠），默认 1 */
  @Prop() minStopGap: number = 1;
  /** UI 模式：simple 为精简界面，仅保留必要控件；pro 为完整界面 */
  @Prop() ui: 'simple' | 'pro' = 'pro';
  /** 是否在渐变面板中显示“线性/径向”切换按钮（默认不显示） */
  @Prop() showGradientTypeTabs: boolean = false;
  /** 在渐变-径向模式下，于右侧显示径向面板（中心拖拽与参数） */
  @Prop() showRadialSidebar: boolean = false;

  // Events
  @Event() ldesignInput!: EventEmitter<string>;
  @Event() ldesignChange!: EventEmitter<string>;

  // Internal state
  @State() private activeMode: 'solid' | 'gradient' = this.modes === 'gradient' ? 'gradient' : 'solid';
  @State() private activeFormat: 'hex' | 'rgb' | 'hsl' | 'hsv' = this.format;
  // solid color
  @State() private hsv: { h: number; s: number; v: number } = { h: 204, s: 72, v: 86 };
  @State() private alpha: number = 1;
  // gradient
  @State() private gradientType: 'linear' | 'radial' = 'linear';
  @State() private gradientAngle: number = 45; // linear
  @State() private radialShape: 'circle' | 'ellipse' = 'circle'; // radial
  @State() private radialCenterX: number = 50; // 0~100
  @State() private radialCenterY: number = 50; // 0~100
  /** 镜像：将色标围绕 50% 位置镜像（视觉对称） */
  @State() private radialMirror: boolean = false;
  @State() private gradientStops: { h: number; s: number; v: number; a: number; pos: number }[] = [
    { h: 204, s: 72, v: 86, a: 1, pos: 0 },
    { h: 204, s: 72, v: 86, a: 1, pos: 100 },
  ];
  @State() private activeStopIndex: number = 0;
  private stopDragIndex: number | null = null;
  private stopTrackEl?: HTMLElement;

  // Quick editor state
  @State() private quickFormat: 'hex' | 'rgba' = 'hex';
  @State() private stopQuickFormat: 'hex' | 'rgba' = 'hex';

  @State() private dragging: 'sv' | 'hue' | 'alpha' | 'angle' | 'center' | null = null;
  @State() private history: string[] = [];

  componentWillLoad() {
    // 初始决定渐变类型（若外部仅允许 radial，则默认进入 radial）
    if (this.modes !== 'solid') {
      if (this.gradientTypes === 'radial') this.gradientType = 'radial';
      else if (this.gradientTypes === 'linear') this.gradientType = 'linear';
    }
    this.applyIncomingValue(this.value);
  }

  componentDidLoad() {
    // 自适应 canvas 尺寸
    const el = this.host.querySelector('.sv-wrap') as HTMLElement | null;
    if (el && 'ResizeObserver' in window) {
      this.ro = new ResizeObserver(() => this.syncCanvasSize());
      this.ro.observe(el);
      this.syncCanvasSize();
    } else {
      this.syncCanvasSize();
    }
  }

  disconnectedCallback() { this.ro?.disconnect(); this.ro = undefined; }

  @Watch('value')
  onValueChange(next: string) { this.applyIncomingValue(next, true); }

  @Watch('gradientTypes')
  onGradientTypesChange(next: 'linear'|'radial'|'both') {
    if (next === 'radial' && this.gradientType !== 'radial') this.gradientType = 'radial';
    else if (next === 'linear' && this.gradientType !== 'linear') this.gradientType = 'linear';
  }

  private splitStopsList(s: string): string[] {
    const out: string[] = []; let depth=0, cur='';
    for (let i=0;i<s.length;i++) { const ch=s[i]; if (ch==='(') depth++; if (ch===')') depth=Math.max(0,depth-1); if (ch===',' && depth===0){ out.push(cur.trim()); cur=''; } else cur+=ch; }
    if (cur.trim()) out.push(cur.trim());
    return out;
  }

  private applyIncomingValue(input: string, silent = false) {
    const val = (input || '').trim();
    // 解析 radial-gradient(shape at x% y%, stops...)
    const rg = val.match(/^radial-gradient\(\s*(circle|ellipse)?(?:\s+at\s+([0-9.]+)%\s+([0-9.]+)%)?\s*,\s*(.+)\)$/i);
    if (rg && (this.modes === 'gradient' || this.modes === 'both')) {
      const shape = (rg[1] as any) || 'circle';
      const cx = rg[2] != null ? parseFloat(rg[2]) : 50;
      const cy = rg[3] != null ? parseFloat(rg[3]) : 50;
      const rest = rg[4];
      const parts = this.splitStopsList(rest).slice(0, 8);
      const parsedStops: { h:number;s:number;v:number;a:number;pos:number }[] = [];
      for (const token of parts) {
        const m = token.match(/^(.*?)(?:\s+([0-9.]+)%\s*)?$/);
        const col = m?.[1]?.trim() || token.trim();
        const pos = m?.[2] != null ? Math.max(0, Math.min(100, parseFloat(m![2]))) : undefined;
        const c = this.parseColor(col);
        if (c) parsedStops.push({ h:c.hsv.h, s:c.hsv.s, v:c.hsv.v, a:c.rgb.a ?? 1, pos: pos ?? (parsedStops.length===0 ? 0 : 100) });
      }
      if (parsedStops.length >= 2) {
        this.activeMode='gradient';
        this.gradientType='radial';
        this.radialShape = (shape === 'ellipse' ? 'ellipse' : 'circle');
        this.radialCenterX = isFinite(cx) ? cx : 50; this.radialCenterY = isFinite(cy) ? cy : 50;
        this.gradientStops = parsedStops;
        if (!silent) this.value = this.getFormattedOutput();
        return;
      }
    }

    // 简单解析 linear-gradient(angle, color1, color2) / 支持两个及以上 stops
    const lg = val.match(/^linear-gradient\(\s*([0-9.]+)deg\s*,\s*(.+)\)$/i);
    if (lg && (this.modes === 'gradient' || this.modes === 'both')) {
      const angle = parseFloat(lg[1]);
      // 尝试解析百分比位置：linear-gradient(45deg, color1 0%, color2 100%)
      const colorAndPos = (s: string) => {
        const m = s.match(/^(.*?)(?:\s+([0-9.]+)%\s*)?$/);
        return { raw: m?.[1]?.trim() || s.trim(), pos: m?.[2] != null ? parseFloat(m[2]) : undefined };
      };
      const rest = lg[2];
      const parts = this.splitStopsList(rest).slice(0, 8);
      const stops: { h:number;s:number;v:number;a:number;pos:number }[] = [];
      for (const token of parts) {
        const m = token.match(/^(.*?)(?:\s+([0-9.]+)%\s*)?$/);
        const col = m?.[1]?.trim() || token.trim();
        const pos = m?.[2] != null ? Math.max(0, Math.min(100, parseFloat(m![2]))) : undefined;
        const c = this.parseColor(col);
        if (c) stops.push({ h:c.hsv.h, s:c.hsv.s, v:c.hsv.v, a:c.rgb.a ?? 1, pos: pos ?? (stops.length===0 ? 0 : 100) });
      }
      if (stops.length >= 2) {
        this.activeMode = 'gradient';
        this.gradientType='linear';
        this.gradientAngle = isFinite(angle) ? angle : 45;
        this.gradientStops = stops;
        if (!silent) this.value = this.getFormattedOutput();
        return;
      }
    }

    const parsed = this.parseColor(val || '#000000');
    if (!parsed) return;
    this.activeMode = this.modes === 'gradient' ? 'gradient' : 'solid';
    this.hsv = { h: parsed.hsv.h, s: parsed.hsv.s, v: parsed.hsv.v };
    this.alpha = parsed.rgb.a ?? 1;
    if (!silent) this.value = this.getFormattedOutput();
  }

  // ---------- Helpers: color conversions ----------
  private clamp(n: number, min: number, max: number) { return Math.min(max, Math.max(min, n)); }
  private hexToRgb(hex: string): { r: number; g: number; b: number; a?: number } | null {
    const cleaned = hex.trim().replace(/^#/, '');
    if (![3,4,6,8].includes(cleaned.length)) return null;
    const expand = (s: string) => s.length === 1 ? s + s : s;
    let r=0,g=0,b=0,a: number | undefined;
    if (cleaned.length <= 4){
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
    if (a == null || a >= 1) return base;
    const aHex = this.clamp(Math.round(a*255),0,255).toString(16).padStart(2,'0');
    return base + aHex;
  }
  private rgbToHsv({r,g,b,a}: {r:number;g:number;b:number;a?:number}){
    r/=255; g/=255; b/=255; const max=Math.max(r,g,b),min=Math.min(r,g,b); const d=max-min; const v=max; const s=max===0?0:d/max; let h=0; if(d!==0){ switch(max){ case r: h=(g-b)/d+(g<b?6:0); break; case g: h=(b-r)/d+2; break; case b: h=(r-g)/d+4; break;} h/=6;} return { h:h*360,s:s*100,v:v*100,a };
  }
  private hsvToRgb(h:number,s:number,v:number,a?:number){ h/=360; s/=100; v/=100; const i=Math.floor(h*6); const f=h*6-i; const p=v*(1-s); const q=v*(1-f*s); const t=v*(1-(1-f)*s); let R=0,G=0,B=0; switch(i%6){ case 0: R=v; G=t; B=p; break; case 1: R=q; G=v; B=p; break; case 2: R=p; G=v; B=t; break; case 3: R=p; G=q; B=v; break; case 4: R=t; G=p; B=v; break; case 5: R=v; G=p; B=q; break;} return { r: Math.round(R*255), g: Math.round(G*255), b: Math.round(B*255), a } }
  private rgbToHsl({r,g,b,a}: {r:number;g:number;b:number;a?:number}){ r/=255; g/=255; b/=255; const max=Math.max(r,g,b),min=Math.min(r,g,b); let h=0,s=0; const l=(max+min)/2; if(max!==min){ const d=max-min; s=l>0.5?d/(2-max-min):d/(max+min); switch(max){ case r: h=(g-b)/d+(g<b?6:0); break; case g: h=(b-r)/d+2; break; case b: h=(r-g)/d+4; break } h/=6 } return { h:h*360,s:s*100,l:l*100,a } }
  private hslToRgb(h:number,s:number,l:number,a?:number){ h/=360; s/=100; l/=100; const hue2rgb=(p:number,q:number,t:number)=>{ if(t<0)t+=1; if(t>1)t-=1; if(t<1/6)return p+(q-p)*6*t; if(t<1/2)return q; if(t<2/3)return p+(q-p)*(2/3-t)*6; return p }; let r:number,g:number,b:number; if(s===0){ r=g=b=l } else { const q=l<0.5?l*(1+s):l+s-l*s; const p=2*l-q; r=hue2rgb(p,q,h+1/3); g=hue2rgb(p,q,h); b=hue2rgb(p,q,h-1/3) } return { r:Math.round(r*255), g:Math.round(g*255), b:Math.round(b*255), a }}

  private parseColor(input: string): { rgb: { r: number; g: number; b: number; a?: number }; hsv: { h: number; s: number; v: number }; hex: string } | null {
    const val = (input || '').trim();
    if (val.startsWith('#')) {
      const rgb = this.hexToRgb(val);
      if (!rgb) return null;
      const hsv = this.rgbToHsv(rgb);
      return { rgb, hsv, hex: val };
    }
    const rgbMatch = val.match(/^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)$/i);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1]);
      const g = parseInt(rgbMatch[2]);
      const b = parseInt(rgbMatch[3]);
      const a = rgbMatch[4] ? parseFloat(rgbMatch[4]) : undefined;
      const rgb = { r, g, b, a };
      const hsv = this.rgbToHsv(rgb);
      const hex = this.rgbToHex(r, g, b, a);
      return { rgb, hsv, hex };
    }
    return null;
  }

  // ---------- Canvas size ----------
  private syncCanvasSize() {
    if (!this.svCanvas) return;
    const parent = this.svCanvas.parentElement as HTMLElement | null;
    const ratio = 0.72; // 高度 = 宽度 * 0.72（视觉更紧凑）
    const cssWidth = Math.max(160, Math.floor((parent?.clientWidth || this.host.clientWidth || 260)));
    const cssHeight = Math.floor(cssWidth * ratio);
    const dpr = (window.devicePixelRatio || 1);
    this.svCanvas.width = Math.floor(cssWidth * dpr);
    this.svCanvas.height = Math.floor(cssHeight * dpr);
    this.svCanvas.style.width = cssWidth + 'px';
    this.svCanvas.style.height = cssHeight + 'px';
    this.renderSV();
  }

  // ---------- UI helpers ----------
  private getFormattedSolid(): string {
    const { h, s, v } = this.hsv; const rgb = this.hsvToRgb(h,s,v,this.alpha);
    switch(this.activeFormat){
      case 'rgb': return this.alpha<1 ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${this.alpha})` : `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      case 'hsl': const hsl = this.rgbToHsl(rgb); return this.alpha<1 ? `hsla(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%, ${this.alpha})` : `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;
      case 'hsv': return `hsv(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(v)}%)`;
      default: return this.rgbToHex(rgb.r,rgb.g,rgb.b,this.alpha);
    }
  }
  private getStopsLinearPreview(): string {
    const sorted = this.gradientStops.slice().sort((a,b)=> a.pos-b.pos);
    let list = sorted;
    if (this.gradientType === 'radial' && this.radialMirror) {
      const mirrored = sorted.slice().reverse().map(s => ({ ...s, pos: 100 - s.pos }));
      const combined = [...sorted, ...mirrored];
      const seen = new Set<string>();
      const dedup: typeof combined = [];
      for (const s of combined.sort((a,b)=> a.pos-b.pos)) {
        const key = `${Math.round(s.pos*100)/100}`;
        if (!seen.has(key)) { seen.add(key); dedup.push(s); }
      }
      list = dedup;
    }
    const parts = list.map(st => {
      const rgb = this.hsvToRgb(st.h, st.s, st.v, st.a);
      const color = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${st.a})`;
      return `${color} ${Math.round(st.pos)}%`;
    });
    return `linear-gradient(to right, ${parts.join(', ')})`;
  }

  private getFormattedGradient(): string {
    const sorted = this.gradientStops.slice().sort((a,b)=> a.pos-b.pos);
    let list = sorted;
    if (this.gradientType === 'radial' && this.radialMirror) {
      const mirrored = sorted.slice().reverse().map(s => ({ ...s, pos: 100 - s.pos }));
      const combined = [...sorted, ...mirrored];
      // 去重同位置（避免 0/100 或 50% 重复）
      const seen = new Set<string>();
      const dedup: typeof combined = [];
      for (const s of combined.sort((a,b)=> a.pos-b.pos)) {
        const key = `${Math.round(s.pos*100)/100}`;
        if (!seen.has(key)) { seen.add(key); dedup.push(s); }
      }
      list = dedup;
    }
    const parts = list.map(st => {
      const rgb = this.hsvToRgb(st.h, st.s, st.v, st.a);
      const color = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${st.a})`;
      return `${color} ${Math.round(st.pos)}%`;
    });
    if (this.gradientType === 'radial') {
      const cx = Math.max(0, Math.min(100, Math.round(this.radialCenterX)));
      const cy = Math.max(0, Math.min(100, Math.round(this.radialCenterY)));
      const shape = this.radialShape;
      return `radial-gradient(${shape} at ${cx}% ${cy}%, ${parts.join(', ')})`;
    }
    const angle = Math.round((this.gradientAngle % 360 + 360) % 360);
    return `linear-gradient(${angle}deg, ${parts.join(', ')})`;
  }
  private getFormattedOutput(): string { return this.activeMode === 'gradient' ? this.getFormattedGradient() : this.getFormattedSolid(); }

  private renderSV() {
    const c = this.svCanvas; if(!c) return; const ctx = c.getContext('2d'); if(!ctx) return; const w=c.width,h=c.height;
    // 使用当前激活颜色的 Hue 来渲染 SV 面板（在渐变模式下取当前 stop 的 H）
    const ac = this.getActiveHSVA();
    const hueRGB = this.hsvToRgb(ac.h,100,100);
    const g1 = ctx.createLinearGradient(0,0,w,0); g1.addColorStop(0,'#fff'); g1.addColorStop(1,`rgb(${hueRGB.r}, ${hueRGB.g}, ${hueRGB.b})`); ctx.fillStyle=g1; ctx.fillRect(0,0,w,h);
    const g2 = ctx.createLinearGradient(0,0,0,h); g2.addColorStop(0,'rgba(0,0,0,0)'); g2.addColorStop(1,'#000'); ctx.fillStyle=g2; ctx.fillRect(0,0,w,h);
  }

  componentDidRender() { this.renderSV(); }

  // ---------- active color helpers ----------
  private getActiveHSVA() { return this.activeMode === 'gradient' ? this.gradientStops[this.activeStopIndex] : { h: this.hsv.h, s: this.hsv.s, v: this.hsv.v, a: this.alpha }; }
  private setActiveHSVA(h: number, s: number, v: number, a?: number) {
    // clamp percent for stability
    const clamp01 = (x:number) => Math.min(100, Math.max(0, x));
    if (this.activeMode === 'gradient') {
      const stops = [...this.gradientStops];
      stops[this.activeStopIndex] = { h, s, v, a: a ?? stops[this.activeStopIndex].a, pos: clamp01(stops[this.activeStopIndex].pos) };
      this.gradientStops = stops;
      // 在渐变模式下更新当前 stop 的颜色时，重新渲染 SV 面板
      requestAnimationFrame(() => this.renderSV());
    } else {
      this.hsv = { h, s, v };
      if (a != null) this.alpha = a;
      // 单色模式下也需要重新渲染
      requestAnimationFrame(() => this.renderSV());
    }
  }

  // ---------- pointer handlers (SV only; sliders use components) ----------
  private onSVPointerDown = (e: PointerEvent) => { if (this.disabled) return; this.dragging='sv'; (e.target as HTMLElement).setPointerCapture?.(e.pointerId); this.updateFromSVPointer(e); window.addEventListener('pointermove', this.onWindowPointerMove); window.addEventListener('pointerup', this.onWindowPointerUp); };
private onWindowPointerMove = (e: PointerEvent) => { if (!this.dragging) return; switch(this.dragging){ case 'sv': this.updateFromSVPointer(e); break; case 'angle': this.updateFromAnglePointer(e,true); break; case 'center': this.updateFromCenterPointer(e,true); break; } };
  private onWindowPointerUp = () => { if (!this.dragging) return; this.dragging=null; window.removeEventListener('pointermove', this.onWindowPointerMove); window.removeEventListener('pointerup', this.onWindowPointerUp); const out=this.getFormattedOutput(); this.value=out; this.ldesignChange.emit(out); if (this.showHistory && this.activeMode==='solid') { const rgb=this.hsvToRgb(this.hsv.h,this.hsv.s,this.hsv.v); this.pushHistory(this.rgbToHex(rgb.r,rgb.g,rgb.b,this.alpha)); } };

  private updateFromSVPointer(e: PointerEvent){ if (!this.svCanvas) return; const rect=this.svCanvas.getBoundingClientRect(); const x=this.clamp(e.clientX-rect.left,0,rect.width); const y=this.clamp(e.clientY-rect.top,0,rect.height); const s=(x/rect.width)*100; const v=(1-y/rect.height)*100; const cur=this.getActiveHSVA(); this.setActiveHSVA(cur.h,s,v,cur.a); const out=this.getFormattedOutput(); this.value=out; this.ldesignInput.emit(out); }
  // slider event handlers
  private onHueSliderInput = (e: CustomEvent<number>) => { const cur=this.getActiveHSVA(); this.setActiveHSVA(e.detail, cur.s, cur.v, cur.a); const out=this.getFormattedOutput(); this.value=out; this.ldesignInput.emit(out); this.renderSV(); };
  private onAlphaSliderInput = (e: CustomEvent<number>) => { const cur=this.getActiveHSVA(); this.setActiveHSVA(cur.h, cur.s, cur.v, e.detail); const out=this.getFormattedOutput(); this.value=out; this.ldesignInput.emit(out); };

  // Angle knob / Center drag
  private angleKnobEl?: HTMLElement;
  private centerPlaneEl?: HTMLElement;
  private onAnglePointerDown = (e: PointerEvent) => {
    if (this.disabled) return;
    if (!this.angleKnobEl) return;
    // 点击即指向点击位置：根据点击点相对圆心的极角直接设定角度（0° 在正上方，顺时针递增）
    const rect=this.angleKnobEl.getBoundingClientRect();
    const cx=rect.left+rect.width/2;
    const cy=rect.top+rect.height/2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const deg = (Math.atan2(dy, dx) * 180 / Math.PI + 90 + 360) % 360;
    this.gradientAngle = Math.round(deg);
    const out=this.getFormattedOutput();
    this.value=out;
    this.ldesignInput.emit(out);
    // 不开启拖动旋转（不设置 dragging / 不监听 pointermove）
    e.preventDefault();
  };
  private onCenterPointerDown = (e: PointerEvent) => { this.dragging='center'; (e.target as HTMLElement).setPointerCapture?.(e.pointerId); this.updateFromCenterPointer(e); window.addEventListener('pointermove', this.onWindowPointerMove); window.addEventListener('pointerup', this.onWindowPointerUp); };
  private updateFromAnglePointer(e: PointerEvent, moving=false){
    if (!this.angleKnobEl) return;
    const rect=this.angleKnobEl.getBoundingClientRect();
    const cx=rect.left+rect.width/2;
    const cy=rect.top+rect.height/2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    let deg = (Math.atan2(dy, dx) * 180 / Math.PI + 90 + 360) % 360; // 0° at top, clockwise
    if (e.shiftKey) {
      // snap to 15° when holding Shift
      deg = Math.round(deg / 15) * 15;
    } else {
      deg = Math.round(deg);
    }
    this.gradientAngle = deg;
    const out=this.getFormattedOutput();
    this.value=out;
    this.ldesignInput.emit(out);
  }
  private updateFromCenterPointer(e: PointerEvent, moving=false){ if (!this.centerPlaneEl) return; const rect=this.centerPlaneEl.getBoundingClientRect(); const x = Math.min(100, Math.max(0, ((e.clientX-rect.left)/rect.width)*100)); const y = Math.min(100, Math.max(0, ((e.clientY-rect.top)/rect.height)*100)); this.radialCenterX = x; this.radialCenterY = y; const out=this.getFormattedOutput(); this.value=out; this.ldesignInput.emit(out); }

  // ---------- Stop position helpers ----------
  private updateActiveStopPosRaw(pos: number) {
    const idx = this.activeStopIndex;
    if (idx < 0) return;
    let p = this.clamp(pos, 0, 100);
    const arr = [...this.gradientStops];
    const others = arr
      .filter((_, i) => i !== idx)
      .map((s) => s.pos)
      .sort((a, b) => a - b);
    const prev = others.filter((x) => x < p).slice(-1)[0];
    const next = others.find((x) => x > p);
    if (prev != null) p = Math.max(p, prev + this.minStopGap);
    if (next != null) p = Math.min(p, next - this.minStopGap);
    arr[idx] = { ...arr[idx], pos: p } as any;
    this.gradientStops = arr;
    const out = this.getFormattedOutput();
    this.value = out;
    this.ldesignInput.emit(out);
  }
  private onStopPosSliderInput = (e: CustomEvent<number>) => {
    this.updateActiveStopPosRaw(e.detail);
  };
  private onStopPosNumberChange = (e: any) => {
    const v = parseFloat(e?.target?.value) || 0;
    this.updateActiveStopPosRaw(v);
  };

  private onAngleKeyDown = (e: KeyboardEvent) => {
    if (this.disabled) return;
    let ang = this.gradientAngle;
    const step = e.shiftKey ? 15 : 1;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { ang -= step; }
    else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { ang += step; }
    else if (e.key === 'Home') { ang = 0; }
    else if (e.key === 'End') { ang = 180; }
    else { return; }
    e.preventDefault();
    ang = (ang % 360 + 360) % 360;
    this.gradientAngle = ang;
    const out=this.getFormattedOutput();
    this.value=out;
    this.ldesignInput.emit(out);
  };

  // ---------- Inputs & palette ----------
  private getFormattedColor(): string { return this.getFormattedOutput(); }
  private switchFormat(fmt: 'hex'|'rgb'|'hsl'|'hsv'){ this.activeFormat=fmt; this.value=this.getFormattedColor(); }
  private onHexInput(e: Event){ const v=(e.target as HTMLInputElement).value; const parsed=this.parseColor(v); if(parsed){ this.hsv={ h:parsed.hsv.h, s:parsed.hsv.s, v:parsed.hsv.v }; this.alpha=parsed.rgb.a ?? 1; this.value=this.getFormattedColor(); this.ldesignInput.emit(this.value); this.ldesignChange.emit(this.value); } }
  private onRGBInput(_ids: ['r','g','b','a?'], values: number[]){ const [r,g,b,aVal]=values; const rgb={r,g,b,a:this.showAlpha?(aVal ?? this.alpha):undefined}; const hsv=this.rgbToHsv(rgb); this.hsv={h:hsv.h, s:hsv.s, v:hsv.v}; this.alpha=rgb.a ?? this.alpha; this.value=this.getFormattedColor(); this.ldesignInput.emit(this.value); this.ldesignChange.emit(this.value); }
  private onHSLInput(values: number[]){ const [h,s,l,aVal]=values as any; const rgb=this.hslToRgb(h,s,l,this.showAlpha?aVal:undefined); const hsv=this.rgbToHsv(rgb); this.hsv={h:hsv.h, s:hsv.s, v:hsv.v}; this.alpha=rgb.a ?? this.alpha; this.value=this.getFormattedColor(); this.ldesignInput.emit(this.value); this.ldesignChange.emit(this.value); }
  private onHSVInput(values: number[]){ const [h,s,v,aVal]=values as any; this.hsv={h,s,v}; if (this.showAlpha && typeof aVal==='number') this.alpha=aVal; this.value=this.getFormattedColor(); this.ldesignInput.emit(this.value); this.ldesignChange.emit(this.value); }
  private setFromPreset(color: string){ const parsed=this.parseColor(color); if(!parsed) return; this.hsv={ h:parsed.hsv.h, s:parsed.hsv.s, v:parsed.hsv.v }; this.alpha=parsed.rgb.a ?? 1; const out=this.getFormattedColor(); this.value=out; this.ldesignInput.emit(out); this.ldesignChange.emit(out); if (this.showHistory) this.pushHistory(parsed.hex); }
  private pushHistory(hex: string){ const list=this.history.slice(); const idx=list.indexOf(hex); if(idx>=0) list.splice(idx,1); list.unshift(hex); if(list.length>this.recentMax) list.length=this.recentMax; this.history=list; }

  private hueGradientStyle(){ const stops:string[]=[]; for(let i=0;i<=360;i+=30){ const {r,g,b}=this.hsvToRgb(i,100,100); stops.push(`rgb(${r}, ${g}, ${b})`);} return { '--ld-slider-rail-bg': `linear-gradient(to right, ${stops.join(', ')})`, '--ld-slider-fill-bg': 'transparent' } as any; }
  private alphaGradientStyle(){ const cur=this.getActiveHSVA(); const { r,g,b } = this.hsvToRgb(cur.h,cur.s,cur.v); return { '--ld-slider-rail-bg': `linear-gradient(to right, rgba(${r}, ${g}, ${b}, 0), rgba(${r}, ${g}, ${b}, 1)), var(--ldesign-alpha-checker, url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"10\" height=\"10\"><rect width=\"5\" height=\"5\" fill=\"%23ccc\"/><rect x=\"5\" y=\"5\" width=\"5\" height=\"5\" fill=\"%23ccc\"/></svg>'))`, '--ld-slider-fill-bg': 'transparent' } as any; }
  private pointerPosForSV(){ const cur=this.getActiveHSVA(); if(!this.svCanvas) return { left:'0%', top:'0%' } as any; return { left: `${cur.s}%`, top: `${100-cur.v}%` } as any; }
  private pointerPosForHue(){ const cur=this.getActiveHSVA(); if(!this.hueTrack) return { left:'0%' } as any; return { left: `${(cur.h/360)*100}%` } as any; }
  private pointerPosForAlpha(){ const cur=this.getActiveHSVA(); if(!this.showAlpha || !this.alphaTrack) return { left:'100%' } as any; return { left: `${(cur.a ?? 1)*100}%` } as any; }

  private renderInputs(){ const ac=this.getActiveHSVA(); const rgb=this.hsvToRgb(ac.h,ac.s,ac.v,ac.a); const hsl=this.rgbToHsl(rgb); const hex=this.rgbToHex(rgb.r,rgb.g,rgb.b,ac.a); return (
    <div class="cp-inputs">
      <div class="cp-tabs">
        <button class={{'active': this.activeFormat==='hex'}} onClick={()=>this.switchFormat('hex')}>HEX</button>
        <button class={{'active': this.activeFormat==='rgb'}} onClick={()=>this.switchFormat('rgb')}>RGB</button>
        <button class={{'active': this.activeFormat==='hsl'}} onClick={()=>this.switchFormat('hsl')}>HSL</button>
        <button class={{'active': this.activeFormat==='hsv'}} onClick={()=>this.switchFormat('hsv')}>HSV</button>
      </div>
      <div class="cp-fields">
        {this.activeFormat==='hex' && (<div class="field-row"><input type="text" class="hex" value={hex} onChange={(e)=>this.onHexInput(e)} disabled={this.disabled} /></div>)}
        {this.activeFormat==='rgb' && (
          <div class="field-row">
            <input type="number" min="0" max="255" value={rgb.r} disabled={this.disabled} onChange={(e)=>this.onRGBInput(['r','g','b','a?'], [parseFloat((e.target as any).value), rgb.g, rgb.b, ac.a])} />
            <input type="number" min="0" max="255" value={rgb.g} disabled={this.disabled} onChange={(e)=>this.onRGBInput(['r','g','b','a?'], [rgb.r, parseFloat((e.target as any).value), rgb.b, ac.a])} />
            <input type="number" min="0" max="255" value={rgb.b} disabled={this.disabled} onChange={(e)=>this.onRGBInput(['r','g','b','a?'], [rgb.r, rgb.g, parseFloat((e.target as any).value), ac.a])} />
            {this.showAlpha ? (<input type="number" min="0" max="1" step="0.01" value={ac.a ?? 1} disabled={this.disabled} onChange={(e)=>this.onRGBInput(['r','g','b','a?'], [rgb.r, rgb.g, rgb.b, parseFloat((e.target as any).value)])} />) : null}
          </div>
        )}
        {this.activeFormat==='hsl' && (
          <div class="field-row">
            <input type="number" min="0" max="360" value={Math.round(hsl.h)} disabled={this.disabled} onChange={(e)=>this.onHSLInput([parseFloat((e.target as any).value), hsl.s, hsl.l, ac.a])} />
            <input type="number" min="0" max="100" value={Math.round(hsl.s)} disabled={this.disabled} onChange={(e)=>this.onHSLInput([hsl.h, parseFloat((e.target as any).value), hsl.l, ac.a])} />
            <input type="number" min="0" max="100" value={Math.round(hsl.l)} disabled={this.disabled} onChange={(e)=>this.onHSLInput([hsl.h, hsl.s, parseFloat((e.target as any).value), ac.a])} />
            {this.showAlpha ? (<input type="number" min="0" max="1" step="0.01" value={ac.a ?? 1} disabled={this.disabled} onChange={(e)=>this.onHSLInput([hsl.h, hsl.s, hsl.l, parseFloat((e.target as any).value)])} />) : null}
          </div>
        )}
        {this.activeFormat==='hsv' && (
          <div class="field-row">
            <input type="number" min="0" max="360" value={Math.round(ac.h)} disabled={this.disabled} onChange={(e)=>this.onHSVInput([parseFloat((e.target as any).value), ac.s, ac.v, ac.a])} />
            <input type="number" min="0" max="100" value={Math.round(ac.s)} disabled={this.disabled} onChange={(e)=>this.onHSVInput([ac.h, parseFloat((e.target as any).value), ac.v, ac.a])} />
            <input type="number" min="0" max="100" value={Math.round(ac.v)} disabled={this.disabled} onChange={(e)=>this.onHSVInput([ac.h, ac.s, parseFloat((e.target as any).value), ac.a])} />
            {this.showAlpha ? (<input type="number" min="0" max="1" step="0.01" value={ac.a ?? 1} disabled={this.disabled} onChange={(e)=>this.onHSVInput([ac.h, ac.s, ac.v, parseFloat((e.target as any).value)])} />) : null}
          </div>
        )}
      </div>
    </div>
  ); }

  render() {
    const hueStyle = this.hueGradientStyle(); const alphaStyle = this.alphaGradientStyle();
    const showHistory = this.showHistory && this.history.length > 0;
    // 顶部色标条统一使用线性预览，避免径向在细条上造成颜色错觉
    const gPreview = { background: this.getStopsLinearPreview() } as any;
    return (
      <Host>
        <div class={{ 'ldesign-color-picker-panel': true, [`ldesign-color-picker-panel--${this.size}`]: true, 'ldesign-color-picker-panel--disabled': this.disabled, 'ldesign-color-picker-panel--simple': this.ui==='simple' }}>
          <div class="mode-tabs" style={{ display: this.modes === 'both' ? 'flex' : 'none' }}>
            <button class={{ active: this.activeMode==='solid' }} onClick={()=> { this.activeMode='solid'; }}>
              单色
            </button>
            <button
              class={{ active: this.activeMode==='gradient' && this.gradientType==='linear' }}
              onClick={()=> { this.activeMode='gradient'; this.gradientType='linear'; const out=this.getFormattedOutput(); this.value=out; this.ldesignInput.emit(out); }}
            >
              渐变
            </button>
            {this.gradientTypes !== 'linear' ? (
              <button
                class={{ active: this.activeMode==='gradient' && this.gradientType==='radial' }}
                onClick={()=> { this.activeMode='gradient'; this.gradientType='radial'; const out=this.getFormattedOutput(); this.value=out; this.ldesignInput.emit(out); }}
              >
                径向渐变
              </button>
            ) : null}
          </div>

          {this.activeMode==='gradient' ? (
            <div class="gradient-tools">
              <div class="gt-header">
                <div class="type-tabs" style={{ display: (this.showGradientTypeTabs && this.gradientTypes==='both') ? 'inline-flex' : 'none' }}>
                  <button class={{ active: this.gradientType==='linear' }} onClick={()=>{ this.gradientType='linear'; const out=this.getFormattedOutput(); this.value=out; this.ldesignInput.emit(out); }}>线性</button>
                  <button class={{ active: this.gradientType==='radial' }} onClick={()=>{ this.gradientType='radial'; const out=this.getFormattedOutput(); this.value=out; this.ldesignInput.emit(out); }}>径向</button>
                </div>
                <div class="stops-bar stops-bar--top" ref={(el) => (this.stopTrackEl = el as HTMLElement)} onPointerUp={() => { this.stopDragIndex=null; }} tabIndex={0} aria-label="Gradient stops (top)" onKeyDown={(e:any)=>{
                  const idx=this.activeStopIndex; if (idx<0) return; const arr=[...this.gradientStops];
                  if (e.key==='Tab') { e.preventDefault(); const dir = e.shiftKey ? -1 : 1; const n=arr.length; this.activeStopIndex = (idx + dir + n) % n; return; }
                  if (e.key==='Delete' || e.key==='Backspace') { if (arr.length>2) { arr.splice(idx,1); this.gradientStops=arr; this.activeStopIndex=Math.max(0, idx-1); const out=this.getFormattedOutput(); this.value=out; this.ldesignInput.emit(out);} e.preventDefault(); return; }
                  if (e.key==='Enter') { if (arr.length<8){ const cur=this.getActiveHSVA(); const insertPos = arr[idx].pos; const newStop = { h:cur.h, s:cur.s, v:cur.v, a:cur.a ?? 1, pos:insertPos }; arr.splice(idx+1,0,newStop as any); this.gradientStops=arr; this.activeStopIndex=idx+1; const out=this.getFormattedOutput(); this.value=out; this.ldesignInput.emit(out);} e.preventDefault(); return; }
                  if (e.key==='ArrowLeft' || e.key==='ArrowRight') { e.preventDefault();
                    const step = e.shiftKey ? 10 : 1;
                    let pos = arr[idx].pos + (e.key==='ArrowRight' ? step : -step);
                    pos = Math.min(100, Math.max(0, pos));
                    const others = arr.filter((_,x)=>x!==idx).map(s=>s.pos).sort((a,b)=>a-b);
                    const prev = others.filter(p=>p < pos).slice(-1)[0];
                    const next = others.find(p=>p > pos);
                    if (prev!=null) pos = Math.max(pos, prev + this.minStopGap);
                    if (next!=null) pos = Math.min(pos, next - this.minStopGap);
                    arr[idx] = { ...arr[idx], pos } as any; this.gradientStops = arr;
                    const out=this.getFormattedOutput(); this.value=out; this.ldesignInput.emit(out);
                    return;
                  }
                }}>
                  <div class="stops-gradient" style={gPreview} onClick={(e:any)=>{ if (!this.stopTrackEl) return; if (this.gradientStops.length>=8) return; const rect=this.stopTrackEl.getBoundingClientRect(); let pos = Math.min(100, Math.max(0, ((e.clientX-rect.left)/rect.width)*100)); const arr=[...this.gradientStops]; const others = arr.map(s=>s.pos).sort((a,b)=>a-b); const prev = others.filter(p=>p < pos).slice(-1)[0]; const next = others.find(p=>p > pos); if (prev!=null) pos = Math.max(pos, prev + this.minStopGap); if (next!=null) pos = Math.min(pos, next - this.minStopGap); const cur=this.getActiveHSVA(); arr.push({ h:cur.h, s:cur.s, v:cur.v, a:cur.a ?? 1, pos }); arr.sort((a,b)=>a.pos-b.pos); this.gradientStops=arr; this.activeStopIndex=arr.findIndex(s=>s.pos===pos); const out=this.getFormattedOutput(); this.value=out; this.ldesignInput.emit(out); }}></div>
                  <div class="stops-ruler"></div>
                  {this.gradientStops.map((st, i) => (
                    <div
                      class={{ 'stop-handle': true, active: this.activeStopIndex===i }}
                      style={{ left: `${st.pos}%`, background: this.rgbStringOf(st.h, st.s, st.v, st.a) }}
                      onPointerDown={(e:any)=>{ this.stopDragIndex=i; (e.target as HTMLElement).setPointerCapture?.(e.pointerId); }}
                      onPointerMove={(e:any)=>{
                        if (this.stopDragIndex===i && this.stopTrackEl){
                          const rect=this.stopTrackEl.getBoundingClientRect();
                          let pos = Math.min(100, Math.max(0, ((e.clientX-rect.left)/rect.width)*100));
                          const arr=[...this.gradientStops];
                          const others = arr.filter((_,x)=>x!==i).map(s=>s.pos).sort((a,b)=>a-b);
                          const prev = others.filter(p=>p < pos).slice(-1)[0];
                          const next = others.find(p=>p > pos);
                          if (prev!=null) pos = Math.max(pos, prev + this.minStopGap);
                          if (next!=null) pos = Math.min(pos, next - this.minStopGap);
                          arr[i] = { ...arr[i], pos } as any; this.gradientStops = arr;
                          const out=this.getFormattedOutput(); this.value=out; this.ldesignInput.emit(out);
                        }
                      }}
                      onClick={()=> this.activeStopIndex=i}
                    ></div>
                  ))}
                </div>
                {this.gradientType==='linear' ? (
                  <div class="angle-badge" title="角度">{Math.round(this.gradientAngle)}°</div>
                ) : null}
              </div>

              {/* Position row for active stop (radial layout parity with gradient) */}
              {this.ui==='pro' && this.gradientType==='radial' ? (
                <div class="pos-row">
                  <ldesign-slider
                    min={0 as any}
                    max={100 as any}
                    step={1 as any}
                    value={Math.round(this.gradientStops[this.activeStopIndex]?.pos ?? 0) as any}
                    onLdesignInput={this.onStopPosSliderInput as any}
                  ></ldesign-slider>
                  <div class="pos-ctrl">
                    <button title="添加色标" aria-label="Add stop" onClick={()=>{ if(this.gradientStops.length<8){ const cur=this.getActiveHSVA(); const arr=[...this.gradientStops, { h:cur.h, s:cur.s, v:cur.v, a:cur.a ?? 1, pos:50 }]; this.gradientStops=arr; this.activeStopIndex=arr.length-1; const out=this.getFormattedOutput(); this.value=out; this.ldesignInput.emit(out); } }}>+</button>
                    <button title="删除当前色标" aria-label="Remove stop" onClick={()=>{ if(this.gradientStops.length>2){ const arr=[...this.gradientStops]; arr.splice(this.activeStopIndex,1); this.gradientStops=arr; this.activeStopIndex=Math.max(0,this.activeStopIndex-1); const out=this.getFormattedOutput(); this.value=out; this.ldesignInput.emit(out);} }}>-</button>
                    <span class="lbl">位置</span>
                    <input type="number" min="0" max="100" value={Math.round(this.gradientStops[this.activeStopIndex]?.pos ?? 0)} onChange={this.onStopPosNumberChange as any} />
                    <span class="unit">%</span>
                  </div>
                </div>
              ) : null}

              {this.ui === 'pro' ? (
                <div class="gt-visual">
                  {this.gradientType==='linear' ? (
                    <div
                      class={{ 'angle-knob': true, dragging: this.dragging==='angle' }}
                      ref={(el)=> (this.angleKnobEl = el as HTMLElement)}
                      onPointerDown={this.onAnglePointerDown as any}
                      onKeyDown={this.onAngleKeyDown as any}
                      tabIndex={0}
                      role="slider"
                      aria-label="角度"
                      aria-valuemin={0}
                      aria-valuemax={360}
                      aria-valuenow={Math.round(this.gradientAngle) as any}
                    >
                      <div class="angle-indicator" style={{ transform: `translate(-50%, -100%) rotate(${Math.round(this.gradientAngle)}deg)` }}></div>
                    </div>
                  ) : (!this.showRadialSidebar ? (
                    <div class="center-plane" ref={(el)=> (this.centerPlaneEl = el as HTMLElement)} onPointerDown={this.onCenterPointerDown as any} style={{ background: this.getFormattedGradient() }}>
                      <div class="center-handle" style={{ left: `${Math.round(this.radialCenterX)}%`, top: `${Math.round(this.radialCenterY)}%` }}></div>
                    </div>
                  ) : null)}
                </div>
              ) : null}

              <div class="gt-params">
                {this.gradientType==='radial' ? (
                  <div class="param-group">
                    <div class="param">
                      <label class="param__label">镜像</label>
                      <div class="seg">
                        <button class={{ segbtn: true, active: !this.radialMirror }} onClick={()=>{ this.radialMirror=false; const out=this.getFormattedOutput(); this.value=out; this.ldesignInput.emit(out); }}>关闭</button>
                        <button class={{ segbtn: true, active: this.radialMirror }} onClick={()=>{ this.radialMirror=true; const out=this.getFormattedOutput(); this.value=out; this.ldesignInput.emit(out); }}>开启</button>
                      </div>
                    </div>
                    <div class="param">
                      <label class="param__label">中心X</label>
                      <ldesign-slider min={0 as any} max={100 as any} step={1 as any} value={Math.round(this.radialCenterX) as any} onLdesignInput={(e:any)=>{ this.radialCenterX=e.detail; const out=this.getFormattedOutput(); this.value=out; this.ldesignInput.emit(out); }}></ldesign-slider>
                      {this.ui==='pro' ? (<input type="number" min="0" max="100" value={Math.round(this.radialCenterX)} onChange={(e:any)=>{ this.radialCenterX = Math.min(100, Math.max(0, parseFloat(e.target.value)||0)); const out=this.getFormattedOutput(); this.value=out; this.ldesignInput.emit(out); }} />) : null}
                    </div>
                    <div class="param">
                      <label class="param__label">中心Y</label>
                      <ldesign-slider min={0 as any} max={100 as any} step={1 as any} value={Math.round(this.radialCenterY) as any} onLdesignInput={(e:any)=>{ this.radialCenterY=e.detail; const out=this.getFormattedOutput(); this.value=out; this.ldesignInput.emit(out); }}></ldesign-slider>
                      {this.ui==='pro' ? (<input type="number" min="0" max="100" value={Math.round(this.radialCenterY)} onChange={(e:any)=>{ this.radialCenterY = Math.min(100, Math.max(0, parseFloat(e.target.value)||0)); const out=this.getFormattedOutput(); this.value=out; this.ldesignInput.emit(out); }} />) : null}
                    </div>
                    <div class="param">
                      <label class="param__label">形状</label>
                      <div class="seg">
                        <button class={{ segbtn: true, active: this.radialShape==='circle' }} onClick={()=>{ this.radialShape='circle'; const out=this.getFormattedOutput(); this.value=out; this.ldesignInput.emit(out); }} title="circle"><span class="shape circle"></span></button>
                        <button class={{ segbtn: true, active: this.radialShape==='ellipse' }} onClick={()=>{ this.radialShape='ellipse'; const out=this.getFormattedOutput(); this.value=out; this.ldesignInput.emit(out); }} title="ellipse"><span class="shape ellipse"></span></button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Radial old stops section removed in favor of unified top bar */}
              

              {this.ui==='pro' ? (
              <div class="stop-quick">
                <select onChange={(e:any)=>{ this.stopQuickFormat = (e.target.value==='rgba'?'rgba':'hex'); }}>
                  <option value="hex" selected={this.stopQuickFormat==='hex'}>HEX</option>
                  <option value="rgba" selected={this.stopQuickFormat==='rgba'}>RGBA</option>
                </select>
                {this.stopQuickFormat==='hex' ? (
                  <input type="text" value={(()=>{ const st=this.gradientStops[this.activeStopIndex]; return this.rgbToHex(this.hsvToRgb(st.h,st.s,st.v,st.a).r, this.hsvToRgb(st.h,st.s,st.v,st.a).g, this.hsvToRgb(st.h,st.s,st.v,st.a).b, st.a); })()} onChange={(e:any)=>{ const v=(e.target.value||'').trim(); const c=this.parseColor(v); if (c){ const arr=[...this.gradientStops]; arr[this.activeStopIndex]={ h:c.hsv.h,s:c.hsv.s,v:c.hsv.v,a:c.rgb.a ?? arr[this.activeStopIndex].a,pos:arr[this.activeStopIndex].pos }; this.gradientStops=arr; const out=this.getFormattedOutput(); this.value=out; this.ldesignInput.emit(out);} }} />
                ) : (
                  <div class="q">
                    {(() => { const st=this.gradientStops[this.activeStopIndex]; const r=this.hsvToRgb(st.h,st.s,st.v,st.a); return (
                      <div class="q-rgb-values">
                        <input type="number" min="0" max="255" value={r.r} onChange={(e:any)=>{ const rv=Math.min(255,Math.max(0,parseFloat(e.target.value)||0)); const g=r.g; const b=r.b; const hsv=this.rgbToHsv({r:rv,g,b,a:st.a}); const arr=[...this.gradientStops]; arr[this.activeStopIndex]={ ...arr[this.activeStopIndex], h:hsv.h,s:hsv.s,v:hsv.v }; this.gradientStops=arr; const out=this.getFormattedOutput(); this.value=out; this.ldesignInput.emit(out);} } />
                        <input type="number" min="0" max="255" value={r.g} onChange={(e:any)=>{ const gv=Math.min(255,Math.max(0,parseFloat(e.target.value)||0)); const hsv=this.rgbToHsv({r:r.r,g:gv,b:r.b,a:st.a}); const arr=[...this.gradientStops]; arr[this.activeStopIndex]={ ...arr[this.activeStopIndex], h:hsv.h,s:hsv.s,v:hsv.v }; this.gradientStops=arr; const out=this.getFormattedOutput(); this.value=out; this.ldesignInput.emit(out);} } />
                        <input type="number" min="0" max="255" value={r.b} onChange={(e:any)=>{ const bv=Math.min(255,Math.max(0,parseFloat(e.target.value)||0)); const hsv=this.rgbToHsv({r:r.r,g:r.g,b:bv,a:st.a}); const arr=[...this.gradientStops]; arr[this.activeStopIndex]={ ...arr[this.activeStopIndex], h:hsv.h,s:hsv.s,v:hsv.v }; this.gradientStops=arr; const out=this.getFormattedOutput(); this.value=out; this.ldesignInput.emit(out);} } />
                        {this.showAlpha ? (<input type="number" min="0" max="1" step="0.01" value={st.a} onChange={(e:any)=>{ const av=Math.min(1,Math.max(0,parseFloat(e.target.value)||0)); const arr=[...this.gradientStops]; arr[this.activeStopIndex]={ ...arr[this.activeStopIndex], a: av }; this.gradientStops=arr; const out=this.getFormattedOutput(); this.value=out; this.ldesignInput.emit(out);} } />) : null}
                      </div>
                    )})()}
                  </div>
                )}
                <button class="copy" title="复制" onClick={() => { const st=this.gradientStops[this.activeStopIndex]; const s=this.rgbStringOf(st.h,st.s,st.v,st.a); navigator.clipboard?.writeText(s); }}>
                  复制
                </button>
              </div>
              ) : null}

            </div>
          ) : null}
            {(() => {
              const main = (
                <div class="cp-main">
                  <div class="sv-wrap">
                    <canvas ref={el => (this.svCanvas = el as HTMLCanvasElement)} class="sv-canvas" onPointerDown={this.onSVPointerDown as any}></canvas>
                    <div class="sv-cursor" style={this.pointerPosForSV()}></div>
                  </div>

                  <div class="sliders">
                    <div class="slider-row">
                      <label style={{ width:'40px' }}>H</label>
                      <ldesign-slider class="cp-hue-slider" min={0 as any} max={360 as any} step={1 as any} value={this.getActiveHSVA().h as any} onLdesignInput={this.onHueSliderInput as any} style={hueStyle as any}></ldesign-slider>
                    </div>
                    {this.showAlpha ? (
                      <div class="slider-row">
                        <label style={{ width:'40px' }}>Alpha</label>
                        <ldesign-slider class="cp-alpha-slider" min={0 as any} max={1 as any} step={0.01 as any} value={(this.getActiveHSVA().a ?? 1) as any} onLdesignInput={this.onAlphaSliderInput as any} style={alphaStyle as any}></ldesign-slider>
                      </div>
                    ) : null}
                  </div>

                  {this.renderInputs()}

                  {this.activeMode==='gradient' ? (
                    <div class="result-preview" style={{ background: this.getFormattedGradient() }} title="预览"></div>
                  ) : null}

                  {this.showPreset ? (
                    <div class="cp-section">
                      <div class="section-title">系统预设颜色</div>
                      <div class="swatches">
                        {this.presets.map(c => (<div class="swatch" style={{ background: c }} onClick={()=>this.setFromPreset(c)} title={c}></div>))}
                      </div>
                    </div>
                  ) : null}

                  {showHistory ? (
                    <div class="cp-section" id="history-section">
                      <div class="section-title">最近使用颜色</div>
                      <div class="swatches">
                        {this.history.map(c => (<div class="swatch" style={{ background: c }} onClick={()=>this.setFromPreset(c)} title={c}></div>))}
                      </div>
                    </div>
                  ) : null}
                </div>
              );

              const useSidebar = this.activeMode==='gradient' && this.gradientType==='radial' && this.showRadialSidebar;
              if (!useSidebar) return main;
              return (
                <div class="cp-layout">
                  {main}
                  <aside class="cp-aside cp-aside--radial">
                    <div class="center-plane" ref={(el)=> (this.centerPlaneEl = el as HTMLElement)} onPointerDown={this.onCenterPointerDown as any} style={{ background: this.getFormattedGradient() }}>
                      <div class="center-handle" style={{ left: `${Math.round(this.radialCenterX)}%`, top: `${Math.round(this.radialCenterY)}%` }}></div>
                    </div>
                    <div class="param-group" style={{ marginTop: '8px' }}>
                      <div class="param">
                        <label class="param__label">中心X</label>
                        <ldesign-slider min={0 as any} max={100 as any} step={1 as any} value={Math.round(this.radialCenterX) as any} onLdesignInput={(e:any)=>{ this.radialCenterX=e.detail; const out=this.getFormattedOutput(); this.value=out; this.ldesignInput.emit(out); }}></ldesign-slider>
                        <input type="number" min="0" max="100" value={Math.round(this.radialCenterX)} onChange={(e:any)=>{ this.radialCenterX = Math.min(100, Math.max(0, parseFloat(e.target.value)||0)); const out=this.getFormattedOutput(); this.value=out; this.ldesignInput.emit(out); }} />
                      </div>
                      <div class="param">
                        <label class="param__label">中心Y</label>
                        <ldesign-slider min={0 as any} max={100 as any} step={1 as any} value={Math.round(this.radialCenterY) as any} onLdesignInput={(e:any)=>{ this.radialCenterY=e.detail; const out=this.getFormattedOutput(); this.value=out; this.ldesignInput.emit(out); }}></ldesign-slider>
                        <input type="number" min="0" max="100" value={Math.round(this.radialCenterY)} onChange={(e:any)=>{ this.radialCenterY = Math.min(100, Math.max(0, parseFloat(e.target.value)||0)); const out=this.getFormattedOutput(); this.value=out; this.ldesignInput.emit(out); }} />
                      </div>
                      <div class="param">
                        <label class="param__label">形状</label>
                        <div class="seg">
                          <button class={{ segbtn: true, active: this.radialShape==='circle' }} onClick={()=>{ this.radialShape='circle'; const out=this.getFormattedOutput(); this.value=out; this.ldesignInput.emit(out); }} title="circle"><span class="shape circle"></span></button>
                          <button class={{ segbtn: true, active: this.radialShape==='ellipse' }} onClick={()=>{ this.radialShape='ellipse'; const out=this.getFormattedOutput(); this.value=out; this.ldesignInput.emit(out); }} title="ellipse"><span class="shape ellipse"></span></button>
                        </div>
                      </div>
                    </div>
                  </aside>
                </div>
              );
            })()}
          </div>
      </Host>
    );
  }

  private rgbStringOf(h:number,s:number,v:number,a:number){ const r=this.hsvToRgb(h,s,v,a); return `rgba(${r.r}, ${r.g}, ${r.b}, ${a})`; }
}
