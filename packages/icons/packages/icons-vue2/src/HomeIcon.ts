import Vue, { CreateElement, VNode } from 'vue';

const rawSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" aria-hidden="true" viewBox="0 0 24 24" width="1em" height="1em" focusable="false">
  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
  <path d="M9 22V12h6v10"/>
</svg>
`;

export interface HomeIconProps {
  size?: string | number;
  color?: string;
  strokeWidth?: string | number;
  spin?: boolean;
}

export default Vue.extend({
  name: 'HomeIcon',
  inheritAttrs: false,
  props: {
    size: { type: [String, Number], default: '1em' },
    color: { type: String, default: 'currentColor' },
    strokeWidth: { type: [String, Number], default: 2 },
    spin: { type: Boolean, default: false }
  },
  render(this: Vue & HomeIconProps, h: CreateElement): VNode {
    const classes = ['ld-icon', this.spin ? 'ld-icon-spin' : ''].filter(Boolean);
    const html = rawSvg
      .replace(/width="[^"]*"/g, 'width="' + (typeof this.size === "number" ? String(this.size) : this.size) + '"')
      .replace(/height="[^"]*"/g, 'height="' + (typeof this.size === "number" ? String(this.size) : this.size) + '"')
      .replace(/stroke="[^"]*"/g, 'stroke="' + this.color + '"')
      .replace(/fill="[^"]*"/g, 'fill="' + this.color + '"')
      .replace(/stroke-width="[^"]*"/g, 'stroke-width="' + String(this.strokeWidth) + '"');

    const style: Record<string, any> = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: typeof this.size === 'number' ? (this.size + 'px') : this.size,
      height: typeof this.size === 'number' ? (this.size + 'px') : this.size
    };

    return h('span', {
      class: classes,
      style,
      domProps: { innerHTML: html },
      attrs: this.$attrs
    });
  }
});
