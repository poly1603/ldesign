import {
  defineComponent,
  ref,
  onMounted,
  onBeforeUnmount,
  watch,
  PropType,
  h,
} from 'vue';
import { HeartProgress as CoreHeartProgress, HeartProgressOptions } from '@ldesign/progress-core';

export default defineComponent({
  name: 'LdHeartProgress',
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
    heartSize: {
      type: Number,
      default: 100,
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
    fillMode: {
      type: String as PropType<'bottom-up' | 'center-out' | 'pulse'>,
      default: 'bottom-up',
    },
    beatAnimation: {
      type: Boolean,
      default: false,
    },
    beatSpeed: {
      type: Number,
      default: 1000,
    },
  },
  emits: ['update:value', 'change', 'complete', 'start'],
  setup(props, { emit }) {
    const containerRef = ref<HTMLElement>();
    let progressInstance: CoreHeartProgress | null = null;

    const initProgress = () => {
      if (!containerRef.value) return;

      const options: Partial<HeartProgressOptions> = {
        value: props.value,
        min: props.min,
        max: props.max,
        heartSize: props.heartSize,
        color: props.color,
        trackColor: props.trackColor,
        theme: props.theme,
        animated: props.animated,
        duration: props.duration,
        showText: props.showText,
        fillMode: props.fillMode,
        beatAnimation: props.beatAnimation,
        beatSpeed: props.beatSpeed,
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

      progressInstance = new CoreHeartProgress(containerRef.value, options);
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
        heartSize: props.heartSize,
        color: props.color,
        trackColor: props.trackColor,
        theme: props.theme,
        showText: props.showText,
        fillMode: props.fillMode,
        beatAnimation: props.beatAnimation,
        beatSpeed: props.beatSpeed,
      }),
      (newOptions) => {
        if (progressInstance) {
          progressInstance.updateOptions(newOptions as Partial<HeartProgressOptions>);
        }
      },
      { deep: true }
    );

    return () => h('div', { ref: containerRef });
  },
});

