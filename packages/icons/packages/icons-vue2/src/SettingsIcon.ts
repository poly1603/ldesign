import Vue, { CreateElement, VNode } from 'vue';

const rawSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" aria-hidden="true" viewBox="0 0 24 24" width="1em" height="1em" focusable="false">
  <circle cx="12" cy="12" r="3"/>
  <path d="M12 1v6m0 6v6m4.22-13.22 4.24 4.24m-2.1-4.38 4.24 4.24M20.66 12H21m-6 0h6M7.76 7.76 3.52 3.52m2.82 14.84L2.1 22.6m9.9.4v-6m0-6V5M7.76 16.24l-4.24 4.24M5.64 5.64 1.4 1.4"/>
</svg>
`;

export interface SettingsIconProps {
  size?: string | number;
  color?: string;
  strokeWidth?: string | number;
  spin?: boolean;
}

export default Vue.extend({
  name: 'SettingsIcon',
  inheritAttrs: false,
  props: {
    size: { type: [String, Number], default: '1em' },
    color: { type: String, default: 'currentColor' },
    strokeWidth: { type: [String, Number], default: 2 },
    spin: { type: Boolean, default: false }
  },
  render(this: Vue & SettingsIconProps, h: CreateElement): VNode {
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
