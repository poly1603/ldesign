import {
  defineComponent,
  ref,
  onMounted,
  onBeforeUnmount,
  watch,
  PropType,
  h,
} from 'vue';
import { LinearProgress as CoreLinearProgress, LinearProgressOptions } from '@ldesign/progress-core';

export default defineComponent({
  name: 'LdLinearProgress',
  props: {
    value: {
      type: Number,
      default: 0,
    },
    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 100,
    },
    direction: {
      type: String as PropType<'horizontal' | 'vertical'>,
      default: 'horizontal',
    },
    strokeWidth: {
      type: Number,
      default: 6,
    },
    color: {
      type: [String, Array] as PropType<string | string[]>,
      default: undefined,
    },
    trackColor: {
      type: String,
      default: undefined,
    },
    theme: {
      type: String,
      default: 'default',
    },
    animated: {
      type: Boolean,
      default: true,
    },
    duration: {
      type: Number,
      default: 300,
    },
    showText: {
      type: Boolean,
      default: true,
    },
    format: {
      type: Function as PropType<(value: number) => string>,
      default: undefined,
    },
    textInside: {
      type: Boolean,
      default: false,
    },
    striped: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: false,
    },
    indeterminate: {
      type: Boolean,
      default: false,
    },
    buffer: {
      type: Number,
      default: undefined,
    },
    width: {
      type: [String, Number],
      default: undefined,
    },
    height: {
      type: [String, Number],
      default: undefined,
    },
  },
  emits: ['update:value', 'change', 'complete', 'start'],
  setup(props, { emit }) {
    const containerRef = ref<HTMLElement>();
    let progressInstance: CoreLinearProgress | null = null;

    const initProgress = () => {
      if (!containerRef.value) return;

      const options: Partial<LinearProgressOptions> = {
        value: props.value,
        min: props.min,
        max: props.max,
        direction: props.direction,
        strokeWidth: props.strokeWidth,
        color: props.color,
        trackColor: props.trackColor,
        theme: props.theme,
        animated: props.animated,
        duration: props.duration,
        showText: props.showText,
        format: props.format,
        textInside: props.textInside,
        striped: props.striped,
        active: props.active,
        indeterminate: props.indeterminate,
        buffer: props.buffer,
        width: props.width,
        height: props.height,
        onChange: (value: number) => {
          emit('update:value', value);
          emit('change', value);
        },
        onComplete: () => {
          emit('complete');
        },
        onStart: () => {
          emit('start');
        },
      };

      progressInstance = new CoreLinearProgress(containerRef.value, options);
    };

    onMounted(() => {
      initProgress();
    });

    onBeforeUnmount(() => {
      if (progressInstance) {
        progressInstance.destroy();
        progressInstance = null;
      }
    });

    // 监听值变化
    watch(() => props.value, (newValue) => {
      if (progressInstance) {
        progressInstance.setValue(newValue);
      }
    });

    // 监听buffer变化
    watch(() => props.buffer, (newBuffer) => {
      if (progressInstance && newBuffer !== undefined) {
        progressInstance.setBuffer(newBuffer);
      }
    });

    // 监听其他配置变化
    watch(
      () => ({
        direction: props.direction,
        strokeWidth: props.strokeWidth,
        color: props.color,
        trackColor: props.trackColor,
        theme: props.theme,
        showText: props.showText,
        textInside: props.textInside,
        striped: props.striped,
        active: props.active,
        indeterminate: props.indeterminate,
        width: props.width,
        height: props.height,
      }),
      (newOptions) => {
        if (progressInstance) {
          progressInstance.updateOptions(newOptions as Partial<LinearProgressOptions>);
        }
      },
      { deep: true }
    );

    return () => h('div', { ref: containerRef });
  },
});


