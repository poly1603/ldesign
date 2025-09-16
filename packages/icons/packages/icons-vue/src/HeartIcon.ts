import { defineComponent, h, type PropType } from 'vue';

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" aria-hidden="true" viewBox="0 0 24 24" width="1em" height="1em" focusable="false">
  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78"/>
</svg>
`;

export default defineComponent({
  name: 'HeartIcon',
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
