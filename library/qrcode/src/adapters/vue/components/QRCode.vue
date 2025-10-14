<template>
  <div
    ref="containerRef"
    :class="containerClasses"
    :style="containerStyles"
    @click="handleClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <slot v-if="isLoading && $slots.loading" name="loading" />
    <slot v-else-if="error && $slots.error" name="error" :error="error" />
    <slot v-else-if="!isLoading && !error && $slots.overlay" name="overlay" />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  watch,
  onMounted,
  onUnmounted,
  PropType,
} from 'vue';
import type {
  QRCodeConfig,
  QRCodeInstance,
  ErrorCorrectionLevel,
  RenderType,
  LogoConfig,
  QRCodeStyle,
  DotStyle,
} from '../../../types/index';
import { createQRCode } from '../../../index';

export default defineComponent({
  name: 'QRCode',
  props: {
    // Basic props
    content: {
      type: String,
      required: true,
    },
    errorCorrectionLevel: {
      type: String as PropType<ErrorCorrectionLevel>,
      default: 'M',
    },
    renderType: {
      type: String as PropType<RenderType>,
      default: 'canvas',
    },
    size: {
      type: Number,
      default: 200,
    },
    margin: {
      type: Number,
      default: 4,
    },
    
    // Color props
    fgColor: {
      type: String,
      default: '#000000',
    },
    bgColor: {
      type: String,
      default: '#ffffff',
    },
    
    // Style props
    cornerRadius: {
      type: Number,
      default: 0,
    },
    dotStyle: {
      type: String as PropType<DotStyle>,
      default: 'square',
    },
    
    // Advanced style props
    gradient: {
      type: Object,
      default: undefined,
    },
    backgroundGradient: {
      type: Object,
      default: undefined,
    },
    
    // Logo props
    logo: {
      type: Object as PropType<LogoConfig>,
      default: undefined,
    },
    
    // Animation props
    animated: {
      type: Boolean,
      default: false,
    },
    animationDuration: {
      type: Number,
      default: 1000,
    },
    animationType: {
      type: String as PropType<'fade' | 'scale' | 'rotate' | 'slide'>,
      default: 'fade',
    },
    animationDelay: {
      type: Number,
      default: 0,
    },
    
    // Other props
    typeNumber: {
      type: Number,
      default: undefined,
    },
    invert: {
      type: Boolean,
      default: false,
    },
    rotate: {
      type: Number as PropType<0 | 90 | 180 | 270>,
      default: 0,
    },
    
    // Auto features
    autoDownload: {
      type: Boolean,
      default: false,
    },
    downloadFileName: {
      type: String,
      default: 'qrcode',
    },
    downloadFormat: {
      type: String as PropType<'png' | 'jpeg' | 'svg'>,
      default: 'png',
    },
    
    // Style classes and inline styles
    containerClass: {
      type: [String, Object, Array] as PropType<string | Record<string, boolean> | string[]>,
      default: '',
    },
    containerStyle: {
      type: Object as PropType<Record<string, any>>,
      default: () => ({}),
    },
    
    // Accessibility
    ariaLabel: {
      type: String,
      default: 'QR Code',
    },
    role: {
      type: String,
      default: 'img',
    },
    tabindex: {
      type: Number,
      default: undefined,
    },
  },
  emits: ['ready', 'error', 'click', 'download', 'hover'],
  setup(props, { emit, expose }) {
    // Refs
    const containerRef = ref<HTMLDivElement>();
    const qrInstance = ref<QRCodeInstance>();
    
    // State
    const isLoading = ref(true);
    const error = ref<Error | null>(null);
    const isHovering = ref(false);
    const animationClass = ref('');
    
    // Computed style object
    const styleConfig = computed<QRCodeStyle>(() => ({
      size: props.size,
      margin: props.margin,
      fgColor: props.fgColor,
      bgColor: props.bgColor,
      cornerRadius: props.cornerRadius,
      dotStyle: props.dotStyle,
      gradient: props.gradient,
      backgroundGradient: props.backgroundGradient,
      invert: props.invert,
      rotate: props.rotate,
    }));
    
    // Container classes
    const containerClasses = computed(() => {
      const classes = ['qrcode-container'];
      
      // Add custom classes
      if (typeof props.containerClass === 'string') {
        classes.push(props.containerClass);
      } else if (Array.isArray(props.containerClass)) {
        classes.push(...props.containerClass);
      } else if (typeof props.containerClass === 'object') {
        Object.entries(props.containerClass).forEach(([key, value]) => {
          if (value) classes.push(key);
        });
      }
      
      // Add state classes
      if (animationClass.value) classes.push(animationClass.value);
      if (isLoading.value) classes.push('qrcode-loading');
      if (error.value) classes.push('qrcode-error');
      if (isHovering.value) classes.push('qrcode-hovering');
      
      return classes;
    });
    
    // Container styles
    const containerStyles = computed(() => ({
      ...props.containerStyle,
      animationDuration: props.animated ? `${props.animationDuration}ms` : undefined,
    }));
    
    // Animation classes
    const getAnimationClass = () => {
      if (!props.animated) return '';
      return `qrcode-${props.animationType}-in`;
    };
    
    // Generate QR code
    const generateQRCode = async () => {
      if (!containerRef.value) return;
      
      try {
        isLoading.value = true;
        error.value = null;
        
        // Clean up existing instance
        if (qrInstance.value) {
          qrInstance.value.destroy();
        }
        
        // Reset animation
        if (props.animated) {
          animationClass.value = '';
          await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        // Create config
        const config: QRCodeConfig = {
          content: props.content,
          errorCorrectionLevel: props.errorCorrectionLevel,
          renderType: props.renderType,
          typeNumber: props.typeNumber,
          style: styleConfig.value,
          logo: props.logo,
        };
        
        // Create new instance
        qrInstance.value = createQRCode({
          ...config,
          container: containerRef.value,
        });
        
        // Apply animation
        if (props.animated) {
          setTimeout(() => {
            animationClass.value = getAnimationClass();
          }, props.animationDelay);
        }
        
        isLoading.value = false;
        
        // Emit ready event
        emit('ready', qrInstance.value);
        
        // Auto download if enabled
        if (props.autoDownload) {
          setTimeout(() => {
            download();
          }, 500);
        }
      } catch (err) {
        error.value = err as Error;
        isLoading.value = false;
        emit('error', err);
        console.error('Failed to generate QR code:', err);
      }
    };
    
    // Public methods
    const download = (
      fileName?: string,
      format?: 'png' | 'jpeg' | 'svg',
      quality?: number
    ) => {
      if (!qrInstance.value) return;
      
      const actualFileName = fileName || props.downloadFileName;
      const actualFormat = format || props.downloadFormat;
      
      if (actualFormat === 'svg') {
        // Download SVG
        const svgString = qrInstance.value.toSVGString();
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${actualFileName}.svg`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        qrInstance.value.download({
          fileName: actualFileName,
          format: actualFormat as 'png' | 'jpeg',
          quality,
        });
      }
      
      emit('download', { fileName: actualFileName, format: actualFormat });
    };
    
    const refresh = () => {
      generateQRCode();
    };
    
    const getInstance = () => qrInstance.value;
    
    const toDataURL = (format?: 'png' | 'jpeg', quality?: number) => {
      return qrInstance.value?.toDataURL(format, quality);
    };
    
    const toSVGString = () => {
      return qrInstance.value?.toSVGString();
    };
    
    // Event handlers
    const handleClick = (event: MouseEvent) => {
      emit('click', event);
    };
    
    const handleMouseEnter = () => {
      isHovering.value = true;
      emit('hover', true);
    };
    
    const handleMouseLeave = () => {
      isHovering.value = false;
      emit('hover', false);
    };
    
    // Watch for prop changes
    watch(
      () => [
        props.content,
        props.errorCorrectionLevel,
        props.renderType,
        props.size,
        props.margin,
        props.fgColor,
        props.bgColor,
        props.cornerRadius,
        props.dotStyle,
        props.gradient,
        props.backgroundGradient,
        props.logo,
        props.typeNumber,
        props.invert,
        props.rotate,
      ],
      () => {
        generateQRCode();
      }
    );
    
    // Lifecycle
    onMounted(() => {
      generateQRCode();
    });
    
    onUnmounted(() => {
      if (qrInstance.value) {
        qrInstance.value.destroy();
      }
    });
    
    // Expose methods
    expose({
      getInstance,
      toDataURL,
      toSVGString,
      download,
      refresh,
      isLoading,
      error,
    });
    
    return {
      containerRef,
      containerClasses,
      containerStyles,
      isLoading,
      error,
      handleClick,
      handleMouseEnter,
      handleMouseLeave,
    };
  },
});
</script>

<style scoped>
.qrcode-container {
  display: inline-block;
  position: relative;
}

.qrcode-loading {
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qrcode-error {
  color: #ff0000;
  padding: 10px;
  border: 1px solid #ffcccc;
  background: #ffeeee;
  border-radius: 4px;
}

.qrcode-hovering {
  transform: scale(1.05);
  transition: transform 0.3s ease;
}

/* Animation classes */
@keyframes qrcode-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes qrcode-scale-in {
  from { transform: scale(0); }
  to { transform: scale(1); }
}

@keyframes qrcode-rotate-in {
  from {
    transform: rotate(-180deg) scale(0);
    opacity: 0;
  }
  to {
    transform: rotate(0) scale(1);
    opacity: 1;
  }
}

@keyframes qrcode-slide-in {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.qrcode-fade-in {
  animation: qrcode-fade-in var(--animation-duration, 1s) ease-in-out;
}

.qrcode-scale-in {
  animation: qrcode-scale-in var(--animation-duration, 0.5s) ease-in-out;
}

.qrcode-rotate-in {
  animation: qrcode-rotate-in var(--animation-duration, 0.8s) ease-in-out;
}

.qrcode-slide-in {
  animation: qrcode-slide-in var(--animation-duration, 0.6s) ease-in-out;
}
</style>