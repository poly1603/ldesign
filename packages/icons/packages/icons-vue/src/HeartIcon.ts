import { defineComponent, h, computed, type PropType } from 'vue';
import { useTheme } from './composables/useTheme.js';

export interface HeartIconProps {
  /** 图标尺寸 */
  size?: string | number;
  /** 图标颜色 */
  color?: string;
  /** 是否旋转动画 */
  spin?: boolean;
  /** 是否脉冲动画 */
  pulse?: boolean;
  /** 主题色彩 */
  theme?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  /** 描边宽度 */
  strokeWidth?: string | number;
  /** 自定义类名 */
  class?: string | string[] | Record<string, boolean>;
  /** 自定义样式 */
  style?: string | Record<string, any>;
}

/**
 * HeartIcon 图标组件
 * @description HeartIcon 图标
 */
export default defineComponent({
  name: 'HeartIcon',
  props: {
    size: {
      type: [String, Number] as PropType<string | number>,
      default: 'md'
    },
    color: {
      type: String,
      default: 'currentColor'
    },
    spin: {
      type: Boolean,
      default: false
    },
    pulse: {
      type: Boolean,
      default: false
    },
    theme: {
      type: String as PropType<'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'>,
      default: undefined
    },
    strokeWidth: {
      type: [String, Number] as PropType<string | number>,
      default: 2
    },
    class: {
      type: [String, Array, Object],
      default: undefined
    },
    style: {
      type: [String, Object],
      default: undefined
    }
  },
  setup(props, { attrs }) {
    const { getThemeColor } = useTheme();

    const computedColor = computed(() => {
      
      if (props.theme) {
        return getThemeColor(props.theme);
      }
      return props.color;
    });

    const computedClass = computed(() => {
      const classes: string[] = ['ld-icon'];

      
      if (props.spin) classes.push('ld-icon--spin');
      if (props.pulse) classes.push('ld-icon--pulse');

      if (props.class) {
        if (typeof props.class === 'string') {
          classes.push(props.class);
        } else if (Array.isArray(props.class)) {
          classes.push(...props.class);
        } else {
          Object.entries(props.class).forEach(([key, value]) => {
            if (value) classes.push(key);
          });
        }
      }

      return classes.join(' ');
    });

    const computedStyle = computed(() => {
      const styles: Record<string, any> = {
        width: typeof props.size === 'number' ? `${props.size}px` : props.size,
        height: typeof props.size === 'number' ? `${props.size}px` : props.size,
        display: 'inline-block',
        verticalAlign: 'middle'
      };

      if (props.style) {
        if (typeof props.style === 'string') {
          return [styles, props.style].join(';');
        } else {
          Object.assign(styles, props.style);
        }
      }

      return styles;
    });

    return () => h(
      'svg',
      {
        class: computedClass.value,
        style: computedStyle.value,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: computedColor.value,
        strokeWidth: props.strokeWidth,
        xmlns: 'http://www.w3.org/2000/svg',
        'aria-hidden': 'true',
        focusable: 'false',
        ...attrs
      },
      [
        h('path', { 'd': 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' })
      ]
    );
  }
});