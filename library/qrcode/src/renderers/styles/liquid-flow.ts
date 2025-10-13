/**
 * High-quality liquid flow style renderer
 * Uses advanced image processing to create smooth, natural flowing liquid effects
 */

/**
 * Main rendering function for liquid flow style
 */
export function renderLiquidFlow(
  ctx: CanvasRenderingContext2D,
  modules: boolean[][],
  moduleSize: number,
  margin: number
): void {
  const moduleCount = modules.length;
  const canvasSize = (moduleCount + margin * 2) * moduleSize;
  
  // Create a high-resolution temporary canvas for processing
  const scale = 4; // Higher scale for smoother results
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvasSize * scale;
  tempCanvas.height = canvasSize * scale;
  const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true })!;
  
  // Enable high-quality rendering
  tempCtx.imageSmoothingEnabled = true;
  tempCtx.imageSmoothingQuality = 'high';
  
  // Scale up for high-res rendering
  tempCtx.scale(scale, scale);
  
  // Step 1: Draw basic modules with soft edges
  drawSoftModules(tempCtx, modules, moduleSize, margin);
  
  // Step 2: Apply multiple blur passes for liquid effect
  const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
  const blurredData = applyLiquidEffect(imageData, scale);
  tempCtx.putImageData(blurredData, 0, 0);
  
  // Step 3: Apply threshold to create smooth blobs
  const thresholdData = applyThreshold(blurredData, 0.5);
  tempCtx.putImageData(thresholdData, 0, 0);
  
  // Step 4: Draw the result back to the main canvas
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(tempCanvas, 0, 0, canvasSize, canvasSize);
  ctx.restore();
}

/**
 * Draw modules with soft edges for better blending
 */
function drawSoftModules(
  ctx: CanvasRenderingContext2D,
  modules: boolean[][],
  moduleSize: number,
  margin: number
): void {
  const moduleCount = modules.length;
  
  ctx.fillStyle = '#000000';
  
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (modules[row][col]) {
        const x = (col + margin) * moduleSize;
        const y = (row + margin) * moduleSize;
        
        // Draw with gradient for soft edges
        const cx = x + moduleSize / 2;
        const cy = y + moduleSize / 2;
        const gradient = ctx.createRadialGradient(
          cx, cy, 0,
          cx, cy, moduleSize * 0.6
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
        gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.9)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, moduleSize * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

/**
 * Apply liquid effect using gaussian blur and metaball technique
 */
function applyLiquidEffect(imageData: ImageData, scale: number): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const width = imageData.width;
  const height = imageData.height;
  
  // Apply multiple passes of gaussian blur
  const blurRadius = Math.floor(8 * scale);
  const blurred = gaussianBlur(data, width, height, blurRadius);
  
  // Apply second blur pass for smoother results
  const smoothed = gaussianBlur(blurred, width, height, Math.floor(blurRadius * 0.6));
  
  // Convert to proper ArrayBuffer for ImageData constructor
  const buffer = smoothed.buffer.slice(smoothed.byteOffset, smoothed.byteOffset + smoothed.byteLength);
  return new ImageData(new Uint8ClampedArray(buffer), width, height);
}

/**
 * Gaussian blur implementation
 */
function gaussianBlur(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number
): Uint8ClampedArray {
  const result = new Uint8ClampedArray(data.length);
  
  // Generate gaussian kernel
  const kernel = generateGaussianKernel(radius);
  const kernelSize = kernel.length;
  const halfSize = Math.floor(kernelSize / 2);
  
  // Apply horizontal blur
  const temp = new Uint8ClampedArray(data.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, a = 0, weight = 0;
      
      for (let i = -halfSize; i <= halfSize; i++) {
        const sampleX = Math.max(0, Math.min(width - 1, x + i));
        const idx = (y * width + sampleX) * 4;
        const k = kernel[i + halfSize];
        
        r += data[idx] * k;
        g += data[idx + 1] * k;
        b += data[idx + 2] * k;
        a += data[idx + 3] * k;
        weight += k;
      }
      
      const idx = (y * width + x) * 4;
      temp[idx] = r / weight;
      temp[idx + 1] = g / weight;
      temp[idx + 2] = b / weight;
      temp[idx + 3] = a / weight;
    }
  }
  
  // Apply vertical blur
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, a = 0, weight = 0;
      
      for (let i = -halfSize; i <= halfSize; i++) {
        const sampleY = Math.max(0, Math.min(height - 1, y + i));
        const idx = (sampleY * width + x) * 4;
        const k = kernel[i + halfSize];
        
        r += temp[idx] * k;
        g += temp[idx + 1] * k;
        b += temp[idx + 2] * k;
        a += temp[idx + 3] * k;
        weight += k;
      }
      
      const idx = (y * width + x) * 4;
      result[idx] = r / weight;
      result[idx + 1] = g / weight;
      result[idx + 2] = b / weight;
      result[idx + 3] = a / weight;
    }
  }
  
  return result;
}

/**
 * Generate gaussian kernel
 */
function generateGaussianKernel(radius: number): Float32Array {
  const size = radius * 2 + 1;
  const kernel = new Float32Array(size);
  const sigma = radius / 3;
  const sigma2 = sigma * sigma;
  let sum = 0;
  
  for (let i = 0; i < size; i++) {
    const x = i - radius;
    const value = Math.exp(-(x * x) / (2 * sigma2));
    kernel[i] = value;
    sum += value;
  }
  
  // Normalize kernel
  for (let i = 0; i < size; i++) {
    kernel[i] /= sum;
  }
  
  return kernel;
}

/**
 * Apply threshold to create smooth blobs
 */
function applyThreshold(imageData: ImageData, threshold: number): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const thresholdValue = threshold * 255;
  
  // Apply smooth threshold with anti-aliasing
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    
    if (alpha < thresholdValue * 0.3) {
      // Fully transparent
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 0;
    } else if (alpha < thresholdValue) {
      // Smooth transition zone
      const t = (alpha - thresholdValue * 0.3) / (thresholdValue * 0.7);
      const smoothT = t * t * (3 - 2 * t); // Smooth step function
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = smoothT * 255;
    } else {
      // Fully opaque
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 255;
    }
  }
  
  return new ImageData(data, imageData.width, imageData.height);
}

/**
 * Alternative implementation using SVG filters (for comparison)
 */
export function renderLiquidFlowSVG(
  ctx: CanvasRenderingContext2D,
  modules: boolean[][],
  moduleSize: number,
  margin: number
): void {
  const moduleCount = modules.length;
  const canvasSize = (moduleCount + margin * 2) * moduleSize;
  
  // Create SVG with liquid filter
  const svg = `
    <svg width="${canvasSize}" height="${canvasSize}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="liquid">
          <feGaussianBlur in="SourceGraphic" stdDeviation="${moduleSize * 0.4}" result="blur" />
          <feColorMatrix in="blur" mode="matrix" 
            values="1 0 0 0 0  
                    0 1 0 0 0  
                    0 0 1 0 0  
                    0 0 0 20 -10" result="gooey" />
          <feComposite in="SourceGraphic" in2="gooey" operator="atop"/>
          <feGaussianBlur stdDeviation="${moduleSize * 0.15}" />
        </filter>
      </defs>
      <g filter="url(#liquid)" fill="black">
        ${generateSVGModules(modules, moduleSize, margin)}
      </g>
    </svg>
  `;
  
  // Convert SVG to image and draw
  const img = new Image();
  const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  
  img.onload = () => {
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);
  };
  
  img.src = url;
}

/**
 * Generate SVG circles for modules
 */
function generateSVGModules(
  modules: boolean[][],
  moduleSize: number,
  margin: number
): string {
  const moduleCount = modules.length;
  let circles = '';
  
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (modules[row][col]) {
        const cx = (col + margin) * moduleSize + moduleSize / 2;
        const cy = (row + margin) * moduleSize + moduleSize / 2;
        circles += `<circle cx="${cx}" cy="${cy}" r="${moduleSize * 0.45}" />`;
      }
    }
  }
  
  return circles;
}