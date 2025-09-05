import { defineComponent, h, type PropType } from 'vue';

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" aria-hidden="true" viewBox="0 0 24 24" width="1em" height="1em" focusable="false">
  <circle cx="11" cy="11" r="8"/>
  <path d="m21 21-4.35-4.35"/>
</svg>
`;

export default defineComponent({
  name: 'SearchIcon',
  props: {
    size: {
      type: [String, Number] as PropType<string | number>,
      default: '1em'
    },
    color: {
      type: String,
      default: 'currentColor'
    },
    strokeWidth: {
      type: [String, Number] as PropType<string | number>,
      default: 2
    },
    spin: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { attrs }) {
    return () => {
      return h('span', {
        ...attrs,
        innerHTML: svgContent
          .replace(/width="[^"]*"/, `width="${props.size}"`)
          .replace(/height="[^"]*"/, `height="${props.size}"`)
          .replace(/stroke="[^"]*"/g, `stroke="${props.color}"`)
          .replace(/fill="[^"]*"/g, `fill="${props.color}"`)
          .replace(/stroke-width="[^"]*"/g, `stroke-width="${props.strokeWidth}"`),
        class: [attrs.class, { 'ld-icon-spin': props.spin }],
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...attrs.style as any
        }
      });
    };
  }
});
