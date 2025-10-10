import { defineComponent, h, ref, watch, onMounted, onUnmounted, PropType } from 'vue';
import type { QRCodeConfig, QRCodeInstance, ErrorCorrectionLevel, RenderType, LogoConfig, QRCodeStyle } from '../types';
import { createQRCode } from '../index';

/**
 * Vue QRCode component
 */
export const QRCode = defineComponent({
  name: 'QRCode',
  props: {
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
    fgColor: {
      type: String,
      default: '#000000',
    },
    bgColor: {
      type: String,
      default: '#ffffff',
    },
    cornerRadius: {
      type: Number,
      default: 0,
    },
    logo: {
      type: Object as PropType<LogoConfig>,
      default: undefined,
    },
    typeNumber: {
      type: Number,
      default: undefined,
    },
  },
  emits: ['ready', 'error'],
  setup(props, { emit, expose }) {
    const containerRef = ref<HTMLDivElement>();
    const qrInstance = ref<QRCodeInstance>();

    const generateQRCode = async () => {
      if (!containerRef.value) return;

      try {
        // Clean up existing instance
        if (qrInstance.value) {
          qrInstance.value.destroy();
        }

        // Create config
        const config: QRCodeConfig = {
          content: props.content,
          errorCorrectionLevel: props.errorCorrectionLevel,
          renderType: props.renderType,
          typeNumber: props.typeNumber,
          style: {
            size: props.size,
            margin: props.margin,
            fgColor: props.fgColor,
            bgColor: props.bgColor,
            cornerRadius: props.cornerRadius,
          },
          logo: props.logo,
        };

        // Create new instance
        qrInstance.value = createQRCode({
          ...config,
          container: containerRef.value,
        });

        emit('ready', qrInstance.value);
      } catch (error) {
        emit('error', error);
        console.error('Failed to generate QR code:', error);
      }
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
        props.logo,
        props.typeNumber,
      ],
      () => {
        generateQRCode();
      }
    );

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
      getInstance: () => qrInstance.value,
      toDataURL: (format?: 'png' | 'jpeg', quality?: number) => {
        return qrInstance.value?.toDataURL(format, quality);
      },
      download: (fileName?: string, format?: 'png' | 'jpeg', quality?: number) => {
        qrInstance.value?.download({ fileName, format, quality });
      },
      toSVGString: () => {
        return qrInstance.value?.toSVGString();
      },
    });

    return () => h('div', { ref: containerRef, class: 'qrcode-container' });
  },
});

/**
 * Vue composable for QR code
 */
export function useQRCode(initialConfig?: QRCodeConfig) {
  const qrInstance = ref<QRCodeInstance>();
  const container = ref<HTMLElement>();
  const isReady = ref(false);
  const error = ref<Error | null>(null);

  const generate = async (config: QRCodeConfig) => {
    try {
      error.value = null;
      isReady.value = false;

      if (qrInstance.value) {
        qrInstance.value.destroy();
      }

      qrInstance.value = createQRCode({
        ...config,
        container: container.value,
      });

      isReady.value = true;
    } catch (err) {
      error.value = err as Error;
      console.error('Failed to generate QR code:', err);
    }
  };

  const update = async (config: Partial<QRCodeConfig>) => {
    if (!qrInstance.value) {
      throw new Error('QR code instance not initialized');
    }
    await qrInstance.value.update(config);
  };

  const toDataURL = (format?: 'png' | 'jpeg', quality?: number): string => {
    if (!qrInstance.value) {
      throw new Error('QR code instance not initialized');
    }
    return qrInstance.value.toDataURL(format, quality);
  };

  const download = (fileName?: string, format?: 'png' | 'jpeg', quality?: number) => {
    if (!qrInstance.value) {
      throw new Error('QR code instance not initialized');
    }
    qrInstance.value.download({ fileName, format, quality });
  };

  const toSVGString = (): string => {
    if (!qrInstance.value) {
      throw new Error('QR code instance not initialized');
    }
    return qrInstance.value.toSVGString();
  };

  const destroy = () => {
    if (qrInstance.value) {
      qrInstance.value.destroy();
      qrInstance.value = undefined;
      isReady.value = false;
    }
  };

  // Initialize if config provided
  if (initialConfig) {
    generate(initialConfig);
  }

  onUnmounted(() => {
    destroy();
  });

  return {
    container,
    qrInstance,
    isReady,
    error,
    generate,
    update,
    toDataURL,
    download,
    toSVGString,
    destroy,
  };
}

// Export types
export type { QRCodeConfig, QRCodeInstance, ErrorCorrectionLevel, RenderType, LogoConfig, QRCodeStyle };

// Default export
export default QRCode;
