import { createQRCode, ErrorCorrectionLevel, DotStyle, LogoShape } from '@ldesign/qrcode';
import type { QRCodeInstance } from '@ldesign/qrcode';

// Store QR code instances
const qrInstances: Record<string, QRCodeInstance> = {};

// Initialize basic QR code
function initBasicQR() {
  const container = document.getElementById('basic-qr')!;
  const contentInput = document.getElementById('basic-content') as HTMLInputElement;
  const updateBtn = document.getElementById('basic-update')!;
  const downloadBtn = document.getElementById('basic-download')!;

  qrInstances.basic = createQRCode({
    content: contentInput.value,
    container,
    style: {
      size: 200,
      margin: 4,
    },
  });

  updateBtn.addEventListener('click', async () => {
    await qrInstances.basic.update({ content: contentInput.value });
  });

  downloadBtn.addEventListener('click', () => {
    qrInstances.basic.download({ fileName: 'qrcode', format: 'png' });
  });
}

// Initialize styled QR code
function initStyledQR() {
  const container = document.getElementById('styled-qr')!;
  const fgColorInput = document.getElementById('fg-color') as HTMLInputElement;
  const bgColorInput = document.getElementById('bg-color') as HTMLInputElement;
  const cornerRadiusInput = document.getElementById('corner-radius') as HTMLInputElement;
  const radiusValueSpan = document.getElementById('radius-value')!;
  const updateBtn = document.getElementById('styled-update')!;

  qrInstances.styled = createQRCode({
    content: 'Styled QR Code',
    container,
    style: {
      size: 200,
      fgColor: fgColorInput.value,
      bgColor: bgColorInput.value,
      cornerRadius: parseFloat(cornerRadiusInput.value),
    },
  });

  cornerRadiusInput.addEventListener('input', () => {
    radiusValueSpan.textContent = cornerRadiusInput.value;
  });

  updateBtn.addEventListener('click', async () => {
    await qrInstances.styled.update({
      style: {
        fgColor: fgColorInput.value,
        bgColor: bgColorInput.value,
        cornerRadius: parseFloat(cornerRadiusInput.value),
      },
    });
  });
}

// Initialize SVG QR code
function initSVGQR() {
  const container = document.getElementById('svg-qr')!;
  const contentInput = document.getElementById('svg-content') as HTMLInputElement;
  const updateBtn = document.getElementById('svg-update')!;
  const downloadBtn = document.getElementById('svg-download')!;

  qrInstances.svg = createQRCode({
    content: contentInput.value,
    container,
    renderType: 'svg' as any,
    style: {
      size: 200,
      fgColor: '#10b981',
      bgColor: '#d1fae5',
    },
  });

  updateBtn.addEventListener('click', async () => {
    await qrInstances.svg.update({ content: contentInput.value });
  });

  downloadBtn.addEventListener('click', () => {
    qrInstances.svg.download({ fileName: 'qrcode', format: 'svg' });
  });
}

// Helper: Create emoji logo as base64
function createEmojiLogo(emoji: string, size: number = 100): string {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  ctx.font = `${size * 0.7}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, size / 2, size / 2);

  return canvas.toDataURL();
}

// Initialize logo QR code
function initLogoQR() {
  const container = document.getElementById('logo-qr')!;
  const contentInput = document.getElementById('logo-content') as HTMLInputElement;
  const logoUrlInput = document.getElementById('logo-url') as HTMLInputElement;
  const updateBtn = document.getElementById('logo-update')!;

  const logoSrc = createEmojiLogo('🚀');

  qrInstances.logo = createQRCode({
    content: contentInput.value,
    container,
    errorCorrectionLevel: 'H' as any,
    style: {
      size: 200,
      fgColor: '#7c3aed',
      bgColor: '#ede9fe',
    },
    logo: {
      src: logoSrc,
      width: '22%',
      height: '22%',
      border: true,
      borderColor: '#ffffff',
      borderWidth: 4,
      borderRadius: 8,
      logoBackground: true,
      logoBackgroundPadding: 6,
    },
  });

  updateBtn.addEventListener('click', async () => {
    await qrInstances.logo.update({
      content: contentInput.value,
      logo: {
        src: logoSrc,
        width: '22%',
        height: '22%',
        border: true,
        borderColor: '#ffffff',
        borderWidth: 4,
        borderRadius: 8,
        logoBackground: true,
        logoBackgroundPadding: 6,
      },
    });
  });
}

// Initialize error correction QR code
function initErrorQR() {
  const container = document.getElementById('error-qr')!;
  const errorLevelSelect = document.getElementById('error-level') as HTMLSelectElement;
  const updateBtn = document.getElementById('error-update')!;

  qrInstances.error = createQRCode({
    content: 'Error Correction Test',
    container,
    errorCorrectionLevel: errorLevelSelect.value as any,
    style: {
      size: 200,
      fgColor: '#dc2626',
      bgColor: '#fee2e2',
    },
  });

  updateBtn.addEventListener('click', async () => {
    await qrInstances.error.update({
      errorCorrectionLevel: errorLevelSelect.value as any,
    });
  });
}

// Initialize size control QR code
function initSizeQR() {
  const container = document.getElementById('size-qr')!;
  const sizeInput = document.getElementById('qr-size') as HTMLInputElement;
  const sizeValueSpan = document.getElementById('size-value')!;
  const updateBtn = document.getElementById('size-update')!;

  qrInstances.size = createQRCode({
    content: 'Size Control Demo',
    container,
    style: {
      size: parseInt(sizeInput.value),
      fgColor: '#ea580c',
      bgColor: '#ffedd5',
      cornerRadius: 0.2,
    },
  });

  sizeInput.addEventListener('input', () => {
    sizeValueSpan.textContent = sizeInput.value;
  });

  updateBtn.addEventListener('click', async () => {
    await qrInstances.size.update({
      style: {
        size: parseInt(sizeInput.value),
      },
    });
  });
}

// Initialize linear gradient QR code
function initLinearGradientQR() {
  const container = document.getElementById('linear-gradient-qr')!;
  const color1Input = document.getElementById('gradient-color1') as HTMLInputElement;
  const color2Input = document.getElementById('gradient-color2') as HTMLInputElement;
  const directionInput = document.getElementById('gradient-direction') as HTMLInputElement;
  const directionValueSpan = document.getElementById('direction-value')!;
  const updateBtn = document.getElementById('gradient-update')!;

  qrInstances.linearGradient = createQRCode({
    content: 'Linear Gradient Demo',
    container,
    style: {
      size: 200,
      gradient: {
        type: 'linear',
        colors: [color1Input.value, color2Input.value],
        direction: parseInt(directionInput.value),
      },
    },
  });

  directionInput.addEventListener('input', () => {
    directionValueSpan.textContent = directionInput.value;
  });

  updateBtn.addEventListener('click', async () => {
    await qrInstances.linearGradient.update({
      style: {
        gradient: {
          type: 'linear',
          colors: [color1Input.value, color2Input.value],
          direction: parseInt(directionInput.value),
        },
      },
    });
  });
}

// Initialize radial gradient QR code
function initRadialGradientQR() {
  const container = document.getElementById('radial-gradient-qr')!;
  const color1Input = document.getElementById('radial-color1') as HTMLInputElement;
  const color2Input = document.getElementById('radial-color2') as HTMLInputElement;
  const updateBtn = document.getElementById('radial-update')!;

  qrInstances.radialGradient = createQRCode({
    content: 'Radial Gradient Demo',
    container,
    style: {
      size: 200,
      gradient: {
        type: 'radial',
        colors: [color1Input.value, color2Input.value],
        position: { x: 0.5, y: 0.5 },
      },
    },
  });

  updateBtn.addEventListener('click', async () => {
    await qrInstances.radialGradient.update({
      style: {
        gradient: {
          type: 'radial',
          colors: [color1Input.value, color2Input.value],
          position: { x: 0.5, y: 0.5 },
        },
      },
    });
  });
}

// Initialize dots style QR code
function initDotsQR() {
  const container = document.getElementById('dots-qr')!;
  const colorInput = document.getElementById('dots-color') as HTMLInputElement;
  const updateBtn = document.getElementById('dots-update')!;
  const downloadBtn = document.getElementById('dots-download')!;

  qrInstances.dots = createQRCode({
    content: 'Dots Style Demo',
    container,
    style: {
      size: 200,
      dotStyle: 'dots' as DotStyle,
      fgColor: colorInput.value,
    },
  });

  updateBtn.addEventListener('click', async () => {
    await qrInstances.dots.update({
      style: {
        fgColor: colorInput.value,
      },
    });
  });

  downloadBtn.addEventListener('click', () => {
    qrInstances.dots.download({ fileName: 'dots-qrcode', format: 'png' });
  });
}

// Initialize diamond style QR code
function initDiamondQR() {
  const container = document.getElementById('diamond-qr')!;
  const colorInput = document.getElementById('diamond-color') as HTMLInputElement;
  const updateBtn = document.getElementById('diamond-update')!;

  qrInstances.diamond = createQRCode({
    content: 'Diamond Style Demo',
    container,
    style: {
      size: 200,
      dotStyle: 'diamond' as DotStyle,
      fgColor: colorInput.value,
    },
  });

  updateBtn.addEventListener('click', async () => {
    await qrInstances.diamond.update({
      style: {
        fgColor: colorInput.value,
      },
    });
  });
}

// Initialize star style QR code
function initStarQR() {
  const container = document.getElementById('star-qr')!;
  const colorInput = document.getElementById('star-color') as HTMLInputElement;
  const updateBtn = document.getElementById('star-update')!;

  qrInstances.star = createQRCode({
    content: 'Star Style Demo',
    container,
    style: {
      size: 200,
      dotStyle: 'star' as DotStyle,
      fgColor: colorInput.value,
    },
  });

  updateBtn.addEventListener('click', async () => {
    await qrInstances.star.update({
      style: {
        fgColor: colorInput.value,
      },
    });
  });
}

// Initialize classy style QR code
function initClassyQR() {
  const container = document.getElementById('classy-qr')!;
  const styleSelect = document.getElementById('classy-style') as HTMLSelectElement;
  const updateBtn = document.getElementById('classy-update')!;

  qrInstances.classy = createQRCode({
    content: 'Classy Style Demo',
    container,
    style: {
      size: 200,
      dotStyle: styleSelect.value as DotStyle,
      gradient: {
        type: 'linear',
        colors: ['#ec4899', '#8b5cf6'],
        direction: 90,
      },
    },
  });

  updateBtn.addEventListener('click', async () => {
    await qrInstances.classy.update({
      style: {
        dotStyle: styleSelect.value as DotStyle,
      },
    });
  });
}

// Initialize custom eye style (single) QR code
function initEyeSingleQR() {
  const container = document.getElementById('eye-single-qr')!;
  const outerColorInput = document.getElementById('eye-outer-color') as HTMLInputElement;
  const innerColorInput = document.getElementById('eye-inner-color') as HTMLInputElement;
  const updateBtn = document.getElementById('eye-single-update')!;

  qrInstances.eyeSingle = createQRCode({
    content: 'Custom Eye Style',
    container,
    style: {
      size: 200,
      eyeStyle: {
        outer: {
          style: 'rounded' as DotStyle,
          color: outerColorInput.value,
        },
        inner: {
          style: 'dots' as DotStyle,
          color: innerColorInput.value,
        },
      },
    },
  });

  updateBtn.addEventListener('click', async () => {
    await qrInstances.eyeSingle.update({
      style: {
        eyeStyle: {
          outer: {
            style: 'rounded' as DotStyle,
            color: outerColorInput.value,
          },
          inner: {
            style: 'dots' as DotStyle,
            color: innerColorInput.value,
          },
        },
      },
    });
  });
}

// Initialize custom eye style (multi) QR code
function initEyeMultiQR() {
  const container = document.getElementById('eye-multi-qr')!;
  const regenerateBtn = document.getElementById('eye-multi-regenerate')!;

  function generate() {
    if (qrInstances.eyeMulti) {
      qrInstances.eyeMulti.destroy();
    }

    qrInstances.eyeMulti = createQRCode({
      content: 'Multi-Color Eyes',
      container,
      style: {
        size: 200,
        eyeStyle: [
          {
            outer: { style: 'rounded' as DotStyle, color: '#ef4444' },
            inner: { style: 'dots' as DotStyle, color: '#dc2626' },
          },
          {
            outer: { style: 'rounded' as DotStyle, color: '#3b82f6' },
            inner: { style: 'dots' as DotStyle, color: '#2563eb' },
          },
          {
            outer: { style: 'rounded' as DotStyle, color: '#10b981' },
            inner: { style: 'dots' as DotStyle, color: '#059669' },
          },
        ],
      },
    });
  }

  generate();
  regenerateBtn.addEventListener('click', generate);
}

// Initialize square logo QR code
function initSquareLogoQR() {
  const container = document.getElementById('square-logo-qr')!;
  const shapeSelect = document.getElementById('logo-shape') as HTMLSelectElement;
  const backgroundCheckbox = document.getElementById('logo-background') as HTMLInputElement;
  const updateBtn = document.getElementById('square-logo-update')!;

  const logoSrc = createEmojiLogo('💎');

  qrInstances.squareLogo = createQRCode({
    content: 'Square Logo Demo',
    container,
    errorCorrectionLevel: 'H' as any,
    style: {
      size: 200,
      fgColor: '#1e40af',
    },
    logo: {
      src: logoSrc,
      width: '22%',
      height: '22%',
      logoShape: shapeSelect.value as LogoShape,
      aspectRatio: 'keep' as any,
      logoBackground: backgroundCheckbox.checked,
      logoBackgroundPadding: 6,
      borderRadius: 8,
    },
  });

  updateBtn.addEventListener('click', async () => {
    await qrInstances.squareLogo.update({
      logo: {
        src: logoSrc,
        width: '22%',
        height: '22%',
        logoShape: shapeSelect.value as LogoShape,
        aspectRatio: 'keep' as any,
        logoBackground: backgroundCheckbox.checked,
        logoBackgroundPadding: 6,
        borderRadius: 8,
      },
    });
  });
}

// Initialize shadow effect QR code
function initShadowQR() {
  const container = document.getElementById('shadow-qr')!;
  const blurInput = document.getElementById('shadow-blur') as HTMLInputElement;
  const offsetInput = document.getElementById('shadow-offset') as HTMLInputElement;
  const blurValueSpan = document.getElementById('blur-value')!;
  const offsetValueSpan = document.getElementById('offset-value')!;
  const updateBtn = document.getElementById('shadow-update')!;

  qrInstances.shadow = createQRCode({
    content: 'Shadow Effect Demo',
    container,
    style: {
      size: 200,
      fgColor: '#7c3aed',
      shadow: {
        blur: parseInt(blurInput.value),
        color: 'rgba(124, 58, 237, 0.3)',
        offsetX: parseInt(offsetInput.value),
        offsetY: parseInt(offsetInput.value),
      },
    },
  });

  blurInput.addEventListener('input', () => {
    blurValueSpan.textContent = blurInput.value;
  });

  offsetInput.addEventListener('input', () => {
    offsetValueSpan.textContent = offsetInput.value;
  });

  updateBtn.addEventListener('click', async () => {
    await qrInstances.shadow.update({
      style: {
        shadow: {
          blur: parseInt(blurInput.value),
          color: 'rgba(124, 58, 237, 0.3)',
          offsetX: parseInt(offsetInput.value),
          offsetY: parseInt(offsetInput.value),
        },
      },
    });
  });
}

// Initialize background gradient QR code
function initBgGradientQR() {
  const container = document.getElementById('bg-gradient-qr')!;
  const color1Input = document.getElementById('bg-grad-color1') as HTMLInputElement;
  const color2Input = document.getElementById('bg-grad-color2') as HTMLInputElement;
  const updateBtn = document.getElementById('bg-gradient-update')!;

  qrInstances.bgGradient = createQRCode({
    content: 'Background Gradient',
    container,
    style: {
      size: 200,
      fgColor: '#333333',
      backgroundGradient: {
        type: 'linear',
        colors: [color1Input.value, color2Input.value],
        direction: 90,
      },
    },
  });

  updateBtn.addEventListener('click', async () => {
    await qrInstances.bgGradient.update({
      style: {
        backgroundGradient: {
          type: 'linear',
          colors: [color1Input.value, color2Input.value],
          direction: 90,
        },
      },
    });
  });
}

// Initialize combined effects QR code (FIXED - 现在可以扫描了！)
function initCombinedQR() {
  const container = document.getElementById('combined-qr')!;
  const regenerateBtn = document.getElementById('combined-regenerate')!;
  const downloadBtn = document.getElementById('combined-download')!;

  function generate() {
    if (qrInstances.combined) {
      qrInstances.combined.destroy();
    }

    qrInstances.combined = createQRCode({
      content: 'https://example.com/combined',
      container,
      errorCorrectionLevel: 'H' as any, // ✅ 使用高容错等级
      style: {
        size: 200,
        dotStyle: 'rounded' as DotStyle, // ✅ 改用圆角，更易识别
        gradient: {
          type: 'linear', // ✅ 改用线性渐变
          colors: ['#f97316', '#dc2626'],
          direction: 45,
        },
        eyeStyle: {
          outer: {
            style: 'rounded' as DotStyle,
            gradient: {
              type: 'linear',
              colors: ['#8b5cf6', '#ec4899'],
              direction: 45,
            },
          },
          inner: {
            style: 'rounded' as DotStyle, // ✅ 改用圆角
            color: '#4b5563' // ✅ 改用深色，确保对比度
          },
        },
        shadow: {
          blur: 6, // ✅ 减小阴影模糊
          color: 'rgba(0, 0, 0, 0.15)',
          offsetY: 3,
        },
      },
    });
  }

  generate();

  regenerateBtn.addEventListener('click', generate);

  downloadBtn.addEventListener('click', () => {
    qrInstances.combined.download({ fileName: 'combined-qrcode', format: 'png' });
  });
}

// Initialize extra rounded style QR code (NEW ⭐)
function initExtraRoundedQR() {
  const container = document.getElementById('extra-rounded-qr')!;

  qrInstances.extraRounded = createQRCode({
    content: 'Extra Rounded Style',
    container,
    style: {
      size: 200,
      dotStyle: 'extra-rounded' as DotStyle,
      gradient: {
        type: 'linear',
        colors: ['#667eea', '#764ba2'],
        direction: 45,
      },
    },
  });
}

// Initialize hexagon style QR code (NEW ⭐)
function initHexagonQR() {
  const container = document.getElementById('hexagon-qr')!;

  qrInstances.hexagon = createQRCode({
    content: 'Hexagon Style',
    container,
    style: {
      size: 200,
      dotStyle: 'hexagon' as DotStyle,
      gradient: {
        type: 'linear',
        colors: ['#f59e0b', '#f97316'],
        direction: 135,
      },
    },
  });
}

// Initialize liquid style QR code (NEW ⭐)
function initLiquidQR() {
  const container = document.getElementById('liquid-qr')!;

  qrInstances.liquid = createQRCode({
    content: 'Liquid Style',
    container,
    errorCorrectionLevel: 'H' as any, // Added high error correction
    style: {
      size: 200,
      dotStyle: 'liquid' as DotStyle,
      gradient: {
        type: 'linear',
        colors: ['#ec4899', '#8b5cf6'],
        direction: 90,
      },
    },
  });
}

// Initialize smooth dots style QR code (NEW ⭐)
function initSmoothDotsQR() {
  const container = document.getElementById('smooth-dots-qr')!;

  qrInstances.smoothDots = createQRCode({
    content: 'Smooth Dots Style',
    container,
    errorCorrectionLevel: 'H' as any,
    style: {
      size: 200,
      dotStyle: 'smooth-dots' as DotStyle,
      gradient: {
        type: 'linear',
        colors: ['#14b8a6', '#06b6d4'],
        direction: 45,
      },
    },
  });
}

// Initialize perspective X transform (NEW ADVANCED ⭐)
function initPerspectiveX() {
  const container = document.getElementById('perspective-x-qr')!;
  const input = document.getElementById('px-input') as HTMLInputElement;
  const valueDisplay = document.getElementById('px-value')!;
  const updateBtn = document.getElementById('px-update')!;

  qrInstances.perspectiveX = createQRCode({
    content: 'Perspective X Transform',
    container,
    style: {
      size: 200,
      dotStyle: 'rounded' as DotStyle,
      gradient: {
        type: 'linear',
        colors: ['#667eea', '#764ba2'],
        direction: 45,
      },
      transform: {
        perspectiveX: parseFloat(input.value),
      },
    },
  });

  input.addEventListener('input', () => {
    valueDisplay.textContent = input.value;
  });

  updateBtn.addEventListener('click', async () => {
    await qrInstances.perspectiveX.update({
      style: {
        transform: {
          perspectiveX: parseFloat(input.value),
        },
      },
    });
  });
}

// Initialize perspective Y transform (NEW ADVANCED ⭐)
function initPerspectiveY() {
  const container = document.getElementById('perspective-y-qr')!;
  const input = document.getElementById('py-input') as HTMLInputElement;
  const valueDisplay = document.getElementById('py-value')!;
  const updateBtn = document.getElementById('py-update')!;

  qrInstances.perspectiveY = createQRCode({
    content: 'Perspective Y Transform',
    container,
    style: {
      size: 200,
      dotStyle: 'dots' as DotStyle,
      gradient: {
        type: 'radial',
        colors: ['#f97316', '#dc2626'],
        position: { x: 0.5, y: 0.5 },
      },
      transform: {
        perspectiveY: parseFloat(input.value),
      },
    },
  });

  input.addEventListener('input', () => {
    valueDisplay.textContent = input.value;
  });

  updateBtn.addEventListener('click', async () => {
    await qrInstances.perspectiveY.update({
      style: {
        transform: {
          perspectiveY: parseFloat(input.value),
        },
      },
    });
  });
}

// Initialize scale transform (NEW ADVANCED ⭐)
function initScale() {
  const container = document.getElementById('scale-qr')!;
  const input = document.getElementById('scale-input') as HTMLInputElement;
  const valueDisplay = document.getElementById('scale-value')!;
  const updateBtn = document.getElementById('scale-update')!;

  qrInstances.scale = createQRCode({
    content: 'Scale Transform',
    container,
    style: {
      size: 200,
      dotStyle: 'diamond' as DotStyle,
      fgColor: '#10b981',
      transform: {
        scale: parseFloat(input.value),
      },
    },
  });

  input.addEventListener('input', () => {
    valueDisplay.textContent = input.value;
  });

  updateBtn.addEventListener('click', async () => {
    await qrInstances.scale.update({
      style: {
        transform: {
          scale: parseFloat(input.value),
        },
      },
    });
  });
}

// Initialize combined transform (NEW ADVANCED ⭐)
function initCombinedTransform() {
  const container = document.getElementById('combined-transform-qr')!;
  const pxInput = document.getElementById('ct-px-input') as HTMLInputElement;
  const pyInput = document.getElementById('ct-py-input') as HTMLInputElement;
  const scaleInput = document.getElementById('ct-scale-input') as HTMLInputElement;
  const pxValue = document.getElementById('ct-px-value')!;
  const pyValue = document.getElementById('ct-py-value')!;
  const scaleValue = document.getElementById('ct-scale-value')!;
  const updateBtn = document.getElementById('ct-update')!;

  qrInstances.combinedTransform = createQRCode({
    content: 'Combined Transform',
    container,
    style: {
      size: 200,
      dotStyle: 'classy-rounded' as DotStyle,
      gradient: {
        type: 'linear',
        colors: ['#ec4899', '#8b5cf6'],
        direction: 90,
      },
      transform: {
        perspectiveX: parseFloat(pxInput.value),
        perspectiveY: parseFloat(pyInput.value),
        scale: parseFloat(scaleInput.value),
      },
    },
  });

  pxInput.addEventListener('input', () => {
    pxValue.textContent = pxInput.value;
  });

  pyInput.addEventListener('input', () => {
    pyValue.textContent = pyInput.value;
  });

  scaleInput.addEventListener('input', () => {
    scaleValue.textContent = scaleInput.value;
  });

  updateBtn.addEventListener('click', async () => {
    await qrInstances.combinedTransform.update({
      style: {
        transform: {
          perspectiveX: parseFloat(pxInput.value),
          perspectiveY: parseFloat(pyInput.value),
          scale: parseFloat(scaleInput.value),
        },
      },
    });
  });
}

// Initialize render layer (NEW ADVANCED ⭐)
function initRenderLayer() {
  const container = document.getElementById('render-layer-qr')!;
  const select = document.getElementById('render-layer-select') as HTMLSelectElement;
  const updateBtn = document.getElementById('render-layer-update')!;

  qrInstances.renderLayer = createQRCode({
    content: 'Render Layer Selection',
    container,
    style: {
      size: 200,
      fgColor: '#2563eb',
      renderLayer: 'all' as any,
    },
  });

  updateBtn.addEventListener('click', async () => {
    await qrInstances.renderLayer.update({
      style: {
        renderLayer: select.value as any,
      },
    });
  });
}

// Initialize margin noise (NEW ADVANCED ⭐)
function initMarginNoise() {
  const container = document.getElementById('margin-noise-qr')!;
  const noiseCheck = document.getElementById('margin-noise-check') as HTMLInputElement;
  const seedInput = document.getElementById('seed-input') as HTMLInputElement;
  const seedValue = document.getElementById('seed-value')!;
  const updateBtn = document.getElementById('margin-noise-update')!;

  qrInstances.marginNoise = createQRCode({
    content: 'Margin Noise Effect',
    container,
    style: {
      size: 200,
      dotStyle: 'rounded' as DotStyle,
      fgColor: '#f59e0b',
      margin: 6,
      marginNoise: noiseCheck.checked,
      seed: parseInt(seedInput.value),
    },
  });

  seedInput.addEventListener('input', () => {
    seedValue.textContent = seedInput.value;
  });

  updateBtn.addEventListener('click', async () => {
    await qrInstances.marginNoise.update({
      style: {
        marginNoise: noiseCheck.checked,
        seed: parseInt(seedInput.value),
      },
    });
  });
}

// Initialize mask pattern (NEW ADVANCED ⭐)
function initMaskPattern() {
  const container = document.getElementById('mask-pattern-qr')!;
  const select = document.getElementById('mask-pattern-select') as HTMLSelectElement;
  const updateBtn = document.getElementById('mask-pattern-update')!;

  qrInstances.maskPattern = createQRCode({
    content: 'Mask Pattern Selection',
    container,
    maskPattern: -1,
    style: {
      size: 200,
      dotStyle: 'dots' as DotStyle,
      fgColor: '#8b5cf6',
    },
  });

  updateBtn.addEventListener('click', async () => {
    await qrInstances.maskPattern.update({
      content: 'Mask Pattern: ' + select.value,
      maskPattern: parseInt(select.value),
    });
  });
}

// Initialize crystalize effect (NEW ADVANCED ⭐)
function initCrystalizeQR() {
  const container = document.getElementById('crystalize-qr')!;
  const select = document.getElementById('crystalize-effect-select') as HTMLSelectElement;
  const updateBtn = document.getElementById('crystalize-update')!;
  const downloadBtn = document.getElementById('crystalize-download')!;

  qrInstances.crystalize = createQRCode({
    content: 'Crystalize Effect Demo',
    container,
    style: {
      size: 200,
      dotStyle: 'rounded' as DotStyle,
      gradient: {
        type: 'linear',
        colors: ['#16a085', '#1abc9c'],
        direction: 45,
      },
      effect: select.value as any,
    },
  });

  updateBtn.addEventListener('click', async () => {
    await qrInstances.crystalize.update({
      style: {
        effect: select.value as any,
      },
    });
  });

  downloadBtn.addEventListener('click', () => {
    qrInstances.crystalize.download({ fileName: 'crystalize-qrcode', format: 'png' });
  });
}

// Initialize smooth flow effect (NEW ADVANCED ⭐)
function initSmoothFlowQR() {
  const container = document.getElementById('smooth-flow-qr')!;
  const updateBtn = document.getElementById('smooth-flow-update')!;
  const downloadBtn = document.getElementById('smooth-flow-download')!;

  qrInstances.smoothFlow = createQRCode({
    content: 'Smooth Flow QR Code',
    container,
    errorCorrectionLevel: 'H' as any,
    style: {
      size: 200,
      dotStyle: 'liquid' as DotStyle, // Use liquid dot style
      gradient: {
        type: 'linear',
        colors: ['#3498db', '#2980b9'],
        direction: 45,
      }
    },
  });

  updateBtn.addEventListener('click', async () => {
    await qrInstances.smoothFlow.update({
      style: {
        dotStyle: 'liquid' as DotStyle,
      },
    });
  });

  downloadBtn.addEventListener('click', () => {
    qrInstances.smoothFlow.download({ fileName: 'smooth-flow-qrcode', format: 'png' });
  });
}

// Initialize ultra smooth effect (NEWEST ADVANCED ⭐⭐⭐)
function initUltraSmoothQR() {
  const container = document.getElementById('ultra-smooth-qr')!;
  const updateBtn = document.getElementById('ultra-smooth-update')!;
  const downloadBtn = document.getElementById('ultra-smooth-download')!;

  qrInstances.ultraSmooth = createQRCode({
    content: 'Ultra Smooth QR Code',
    container,
    errorCorrectionLevel: 'H' as any,
    style: {
      size: 200,
      dotStyle: 'ultra-smooth' as DotStyle, // Use ultra-smooth dot style
      gradient: {
        type: 'linear',
        colors: ['#e91e63', '#9c27b0'],
        direction: 135,
      }
    },
  });

  updateBtn.addEventListener('click', async () => {
    await qrInstances.ultraSmooth.update({
      content: `Updated at ${new Date().toLocaleTimeString()}`,
    });
  });

  downloadBtn.addEventListener('click', () => {
    qrInstances.ultraSmooth.download({ fileName: 'ultra-smooth-qrcode', format: 'png' });
  });
}

// Initialize all demos
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing QR Code demos...');

  try {
    // Basic demos
    initBasicQR();
    initStyledQR();
    initSVGQR();
    initLogoQR();
    initErrorQR();
    initSizeQR();

    // Advanced demos
    initLinearGradientQR();
    initRadialGradientQR();
    initDotsQR();
    initDiamondQR();
    initStarQR();
    initClassyQR();
    initEyeSingleQR();
    initEyeMultiQR();
    initSquareLogoQR();
    initShadowQR();
    initBgGradientQR();
    initCombinedQR();

    // New style demos ⭐
    initExtraRoundedQR();
    initHexagonQR();
    initLiquidQR();
    initSmoothDotsQR();

    // Advanced features demos ⭐⭐⭐
    initPerspectiveX();
    initPerspectiveY();
    initScale();
    initCombinedTransform();
    initRenderLayer();
    initMarginNoise();
    initMaskPattern();
    initCrystalizeQR();
    initSmoothFlowQR();
    initUltraSmoothQR();

    console.log('✅ All demos initialized successfully!');
  } catch (error) {
    console.error('❌ Error initializing demos:', error);
  }
});
