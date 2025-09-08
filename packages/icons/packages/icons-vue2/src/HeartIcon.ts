import Vue, { CreateElement, VNode } from 'vue';

const rawSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" aria-hidden="true" viewBox="0 0 24 24" width="1em" height="1em" focusable="false">
  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78"/>
</svg>
`;

export interface HeartIconProps {
  size?: string | number;
  color?: string;
  strokeWidth?: string | number;
  spin?: boolean;
}

export default Vue.extend({
  name: 'HeartIcon',
  inheritAttrs: false,
  props: {
    size: { type: [String, Number], default: '1em' },
    color: { type: String, default: 'currentColor' },
    strokeWidth: { type: [String, Number], default: 2 },
    spin: { type: Boolean, default: false }
  },
  render(this: Vue & HeartIconProps, h: CreateElement): VNode {
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
