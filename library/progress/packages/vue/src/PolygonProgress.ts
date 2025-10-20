import {
  defineComponent,
  ref,
  onMounted,
  onBeforeUnmount,
  watch,
  PropType,
  h,
} from 'vue';
import { PolygonProgress as CorePolygonProgress, PolygonProgressOptions } from '@ldesign/progress-core';

export default defineComponent({
  name: 'LdPolygonProgress',
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
    sides: {
      type: Number,
      default: 6,
    },
    radius: {
      type: Number,
      default: 60,
    },
    rotation: {
      type: Number,
      default: 0,
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
  },
  emits: ['update:value', 'change', 'complete', 'start'],
  setup(props, { emit }) {
    const containerRef = ref<HTMLElement>();
    let progressInstance: CorePolygonProgress | null = null;

    const initProgress = () => {
      if (!containerRef.value) return;

      const options: Partial<PolygonProgressOptions> = {
        value: props.value,
        min: props.min,
        max: props.max,
        sides: props.sides,
        radius: props.radius,
        rotation: props.rotation,
        strokeWidth: props.strokeWidth,
        color: props.color,
        trackColor: props.trackColor,
        theme: props.theme,
        animated: props.animated,
        duration: props.duration,
        showText: props.showText,
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

      progressInstance = new CorePolygonProgress(containerRef.value, options);
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
        sides: props.sides,
        radius: props.radius,
        rotation: props.rotation,
        strokeWidth: props.strokeWidth,
        color: props.color,
        trackColor: props.trackColor,
        theme: props.theme,
        showText: props.showText,
      }),
      (newOptions) => {
        if (progressInstance) {
          progressInstance.updateOptions(newOptions as Partial<PolygonProgressOptions>);
        }
      },
      { deep: true }
    );

    return () => h('div', { ref: containerRef });
  },
});

