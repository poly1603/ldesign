import {
  defineComponent,
  ref,
  onMounted,
  onBeforeUnmount,
  watch,
  PropType,
  h,
} from 'vue';
import { CircleProgress as CoreCircleProgress, CircleProgressOptions } from '@ldesign/progress-core';

export default defineComponent({
  name: 'LdCircleProgress',
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
    radius: {
      type: Number,
      default: 50,
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
    clockwise: {
      type: Boolean,
      default: true,
    },
    startAngle: {
      type: Number,
      default: -90,
    },
    lineCap: {
      type: String as PropType<'round' | 'square' | 'butt'>,
      default: 'round',
    },
  },
  emits: ['update:value', 'change', 'complete', 'start'],
  setup(props, { emit }) {
    const containerRef = ref<HTMLElement>();
    let progressInstance: CoreCircleProgress | null = null;

    const initProgress = () => {
      if (!containerRef.value) return;

      const options: Partial<CircleProgressOptions> = {
        value: props.value,
        min: props.min,
        max: props.max,
        radius: props.radius,
        strokeWidth: props.strokeWidth,
        color: props.color,
        trackColor: props.trackColor,
        theme: props.theme,
        animated: props.animated,
        duration: props.duration,
        showText: props.showText,
        format: props.format,
        clockwise: props.clockwise,
        startAngle: props.startAngle,
        lineCap: props.lineCap,
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

      progressInstance = new CoreCircleProgress(containerRef.value, options);
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

    watch(() => props.value, (newValue) => {
      if (progressInstance) {
        progressInstance.setValue(newValue);
      }
    });

    watch(
      () => ({
        radius: props.radius,
        strokeWidth: props.strokeWidth,
        color: props.color,
        trackColor: props.trackColor,
        theme: props.theme,
        showText: props.showText,
        clockwise: props.clockwise,
        startAngle: props.startAngle,
        lineCap: props.lineCap,
      }),
      (newOptions) => {
        if (progressInstance) {
          progressInstance.updateOptions(newOptions as Partial<CircleProgressOptions>);
        }
      },
      { deep: true }
    );

    return () => h('div', { ref: containerRef });
  },
});


