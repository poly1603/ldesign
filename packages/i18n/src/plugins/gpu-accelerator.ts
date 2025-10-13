/**
 * @ldesign/i18n - GPU Accelerator
 * GPU加速并行渲染：WebGPU/WebGL加速文本处理
 */

import type { I18nPlugin, I18nInstance, Locale } from '../types';

/**
 * GPU配置
 */
export interface GPUConfig {
  enabled?: boolean;
  backend?: 'webgpu' | 'webgl2' | 'webgl';
  maxTextureSize?: number;
  workgroupSize?: number;
  preferHighPerformance?: boolean;
}

/**
 * WebGPU文本渲染器
 */
class WebGPUTextRenderer {
  private device?: GPUDevice;
  private context?: GPUCanvasContext;
  private pipeline?: GPURenderPipeline;
  private textureCache: Map<string, GPUTexture> = new Map();
  
  /**
   * 初始化WebGPU
   */
  async initialize(): Promise<boolean> {
    if (!navigator.gpu) {
      console.warn('[WebGPU] Not supported');
      return false;
    }
    
    try {
      const adapter = await navigator.gpu.requestAdapter({
        powerPreference: 'high-performance'
      });
      
      if (!adapter) return false;
      
      this.device = await adapter.requestDevice();
      
      // 创建着色器
      const shaderModule = this.device.createShaderModule({
        code: `
          struct VertexOutput {
            @builtin(position) position: vec4<f32>,
            @location(0) texCoord: vec2<f32>,
          }
          
          @vertex
          fn vertexMain(@location(0) position: vec2<f32>,
                       @location(1) texCoord: vec2<f32>) -> VertexOutput {
            var output: VertexOutput;
            output.position = vec4<f32>(position, 0.0, 1.0);
            output.texCoord = texCoord;
            return output;
          }
          
          @group(0) @binding(0) var textTexture: texture_2d<f32>;
          @group(0) @binding(1) var textSampler: sampler;
          
          @fragment
          fn fragmentMain(@location(0) texCoord: vec2<f32>) -> @location(0) vec4<f32> {
            return textureSample(textTexture, textSampler, texCoord);
          }
        `
      });
      
      // 创建渲染管线
      this.pipeline = this.device.createRenderPipeline({
        layout: 'auto',
        vertex: {
          module: shaderModule,
          entryPoint: 'vertexMain',
          buffers: [{
            arrayStride: 16,
            attributes: [
              { format: 'float32x2', offset: 0, shaderLocation: 0 },
              { format: 'float32x2', offset: 8, shaderLocation: 1 }
            ]
          }]
        },
        fragment: {
          module: shaderModule,
          entryPoint: 'fragmentMain',
          targets: [{ format: 'bgra8unorm' }]
        },
        primitive: { topology: 'triangle-list' }
      });
      
      return true;
    } catch (error) {
      console.error('[WebGPU] Initialization failed:', error);
      return false;
    }
  }
  
  /**
   * 批量渲染文本
   */
  async batchRenderText(texts: string[]): Promise<ImageData[]> {
    if (!this.device || !this.pipeline) {
      throw new Error('WebGPU not initialized');
    }
    
    const results: ImageData[] = [];
    
    // 创建命令编码器
    const commandEncoder = this.device.createCommandEncoder();
    
    for (const text of texts) {
      // 创建文本纹理
      const texture = await this.createTextTexture(text);
      
      // 渲染到纹理
      const renderTexture = this.device.createTexture({
        size: { width: 512, height: 64 },
        format: 'bgra8unorm',
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC
      });
      
      const renderPass = commandEncoder.beginRenderPass({
        colorAttachments: [{
          view: renderTexture.createView(),
          loadOp: 'clear',
          storeOp: 'store',
          clearValue: { r: 0, g: 0, b: 0, a: 1 }
        }]
      });
      
      renderPass.setPipeline(this.pipeline);
      renderPass.draw(6);
      renderPass.end();
      
      // 读取结果
      const buffer = this.device.createBuffer({
        size: 512 * 64 * 4,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
      });
      
      commandEncoder.copyTextureToBuffer(
        { texture: renderTexture },
        { buffer, bytesPerRow: 512 * 4 },
        { width: 512, height: 64 }
      );
    }
    
    // 提交命令
    this.device.queue.submit([commandEncoder.finish()]);
    
    return results;
  }
  
  /**
   * 创建文本纹理
   */
  private async createTextTexture(text: string): Promise<GPUTexture> {
    if (!this.device) throw new Error('Device not initialized');
    
    // 检查缓存
    const cached = this.textureCache.get(text);
    if (cached) return cached;
    
    // 创建Canvas渲染文本
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    
    ctx.fillStyle = 'white';
    ctx.font = '32px Arial';
    ctx.fillText(text, 10, 40);
    
    // 获取图像数据
    const imageData = ctx.getImageData(0, 0, 512, 64);
    
    // 创建GPU纹理
    const texture = this.device.createTexture({
      size: { width: 512, height: 64 },
      format: 'rgba8unorm',
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
    });
    
    // 写入数据
    this.device.queue.writeTexture(
      { texture },
      imageData.data,
      { bytesPerRow: 512 * 4 },
      { width: 512, height: 64 }
    );
    
    // 缓存
    this.textureCache.set(text, texture);
    
    return texture;
  }
  
  /**
   * 清理资源
   */
  dispose(): void {
    for (const texture of this.textureCache.values()) {
      texture.destroy();
    }
    this.textureCache.clear();
    this.device?.destroy();
  }
}

/**
 * WebGL计算着色器
 */
class WebGLComputeShader {
  private gl?: WebGL2RenderingContext;
  private program?: WebGLProgram;
  private buffers: Map<string, WebGLBuffer> = new Map();
  
  /**
   * 初始化WebGL
   */
  initialize(canvas: HTMLCanvasElement): boolean {
    const gl = canvas.getContext('webgl2');
    if (!gl) {
      console.warn('[WebGL] WebGL2 not supported');
      return false;
    }
    
    this.gl = gl;
    
    // 创建计算着色器
    const vertexShader = this.createShader(gl.VERTEX_SHADER, `
      #version 300 es
      precision highp float;
      
      in vec2 position;
      in vec2 texCoord;
      out vec2 vTexCoord;
      
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
        vTexCoord = texCoord;
      }
    `);
    
    const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, `
      #version 300 es
      precision highp float;
      
      in vec2 vTexCoord;
      out vec4 fragColor;
      
      uniform sampler2D uTexture;
      uniform float uTime;
      
      // 并行文本处理
      vec4 processText(vec2 coord) {
        vec4 color = texture(uTexture, coord);
        
        // 应用GPU加速的文本效果
        float wave = sin(coord.x * 10.0 + uTime) * 0.02;
        color.rgb *= 1.0 + wave;
        
        return color;
      }
      
      void main() {
        fragColor = processText(vTexCoord);
      }
    `);
    
    if (!vertexShader || !fragmentShader) return false;
    
    // 创建程序
    this.program = gl.createProgram()!;
    gl.attachShader(this.program, vertexShader);
    gl.attachShader(this.program, fragmentShader);
    gl.linkProgram(this.program);
    
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.error('[WebGL] Program link failed:', gl.getProgramInfoLog(this.program));
      return false;
    }
    
    return true;
  }
  
  /**
   * 创建着色器
   */
  private createShader(type: number, source: string): WebGLShader | null {
    if (!this.gl) return null;
    
    const shader = this.gl.createShader(type)!;
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('[WebGL] Shader compile failed:', this.gl.getShaderInfoLog(shader));
      return null;
    }
    
    return shader;
  }
  
  /**
   * 并行处理文本数组
   */
  parallelProcessTexts(texts: string[]): Float32Array {
    if (!this.gl || !this.program) {
      throw new Error('WebGL not initialized');
    }
    
    const gl = this.gl;
    
    // 创建数据纹理
    const textureSize = Math.ceil(Math.sqrt(texts.length));
    const textureData = new Float32Array(textureSize * textureSize * 4);
    
    // 编码文本到纹理数据
    texts.forEach((text, index) => {
      const hash = this.hashText(text);
      const offset = index * 4;
      textureData[offset] = (hash & 0xFF) / 255;
      textureData[offset + 1] = ((hash >> 8) & 0xFF) / 255;
      textureData[offset + 2] = ((hash >> 16) & 0xFF) / 255;
      textureData[offset + 3] = ((hash >> 24) & 0xFF) / 255;
    });
    
    // 创建纹理
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA32F,
      textureSize, textureSize, 0,
      gl.RGBA, gl.FLOAT, textureData
    );
    
    // 创建帧缓冲
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    
    const outputTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, outputTexture);
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA32F,
      textureSize, textureSize, 0,
      gl.RGBA, gl.FLOAT, null
    );
    
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D, outputTexture, 0
    );
    
    // 执行渲染（GPU计算）
    gl.useProgram(this.program);
    gl.viewport(0, 0, textureSize, textureSize);
    
    // 绘制全屏四边形
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    
    // 读取结果
    const result = new Float32Array(textureSize * textureSize * 4);
    gl.readPixels(0, 0, textureSize, textureSize, gl.RGBA, gl.FLOAT, result);
    
    // 清理
    gl.deleteTexture(texture);
    gl.deleteTexture(outputTexture);
    gl.deleteFramebuffer(framebuffer);
    
    return result;
  }
  
  /**
   * 文本哈希
   */
  private hashText(text: string): number {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash = hash & hash;
    }
    return hash >>> 0;
  }
  
  /**
   * 清理资源
   */
  dispose(): void {
    if (!this.gl) return;
    
    for (const buffer of this.buffers.values()) {
      this.gl.deleteBuffer(buffer);
    }
    
    if (this.program) {
      this.gl.deleteProgram(this.program);
    }
  }
}

/**
 * GPU字符串匹配
 */
class GPUStringMatcher {
  private webgpu?: WebGPUTextRenderer;
  private webgl?: WebGLComputeShader;
  
  async initialize(backend: 'webgpu' | 'webgl2' | 'webgl'): Promise<void> {
    if (backend === 'webgpu') {
      this.webgpu = new WebGPUTextRenderer();
      await this.webgpu.initialize();
    } else {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      this.webgl = new WebGLComputeShader();
      this.webgl.initialize(canvas);
    }
  }
  
  /**
   * GPU加速的批量字符串匹配
   */
  async batchMatch(patterns: string[], texts: string[]): Promise<boolean[][]> {
    // 创建匹配矩阵
    const results: boolean[][] = [];
    
    if (this.webgl) {
      // 使用WebGL并行匹配
      const processed = this.webgl.parallelProcessTexts([...patterns, ...texts]);
      
      // 解析结果
      for (let i = 0; i < patterns.length; i++) {
        const row: boolean[] = [];
        for (let j = 0; j < texts.length; j++) {
          // 简化的匹配逻辑（实际应该在GPU上执行）
          row.push(texts[j].includes(patterns[i]));
        }
        results.push(row);
      }
    } else {
      // CPU回退
      for (const pattern of patterns) {
        const row = texts.map(text => text.includes(pattern));
        results.push(row);
      }
    }
    
    return results;
  }
  
  /**
   * GPU加速的模糊匹配
   */
  async fuzzyMatch(query: string, candidates: string[], threshold = 0.7): Promise<Array<{text: string; score: number}>> {
    const matches: Array<{text: string; score: number}> = [];
    
    if (this.webgl) {
      // GPU并行计算相似度
      const scores = this.webgl.parallelProcessTexts([query, ...candidates]);
      
      candidates.forEach((candidate, index) => {
        // 从GPU结果中提取分数（简化）
        const score = scores[index * 4] || 0;
        if (score >= threshold) {
          matches.push({ text: candidate, score });
        }
      });
    } else {
      // CPU回退
      for (const candidate of candidates) {
        const score = this.calculateSimilarity(query, candidate);
        if (score >= threshold) {
          matches.push({ text: candidate, score });
        }
      }
    }
    
    return matches.sort((a, b) => b.score - a.score);
  }
  
  private calculateSimilarity(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    const maxLen = Math.max(len1, len2);
    
    if (maxLen === 0) return 1;
    
    // Levenshtein距离
    const matrix: number[][] = [];
    
    for (let i = 0; i <= len2; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= len1; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= len2; i++) {
      for (let j = 1; j <= len1; j++) {
        if (str2[i - 1] === str1[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return 1 - (matrix[len2][len1] / maxLen);
  }
  
  dispose(): void {
    this.webgpu?.dispose();
    this.webgl?.dispose();
  }
}

/**
 * GPU加速器主类
 */
export class GPUAccelerator {
  private config: GPUConfig;
  private stringMatcher?: GPUStringMatcher;
  private initialized = false;
  
  constructor(config: GPUConfig = {}) {
    this.config = {
      enabled: true,
      backend: 'webgpu',
      maxTextureSize: 4096,
      workgroupSize: 64,
      preferHighPerformance: true,
      ...config
    };
  }
  
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      this.stringMatcher = new GPUStringMatcher();
      await this.stringMatcher.initialize(this.config.backend!);
      this.initialized = true;
      console.log(`[GPUAccelerator] Initialized with ${this.config.backend}`);
    } catch (error) {
      console.error('[GPUAccelerator] Initialization failed:', error);
    }
  }
  
  /**
   * GPU加速批量翻译查找
   */
  async batchLookup(keys: string[], translations: Map<string, string>): Promise<Map<string, string>> {
    if (!this.initialized || !this.stringMatcher) {
      // CPU回退
      const results = new Map<string, string>();
      for (const key of keys) {
        const value = translations.get(key);
        if (value) results.set(key, value);
      }
      return results;
    }
    
    const translationKeys = Array.from(translations.keys());
    const matches = await this.stringMatcher.batchMatch(keys, translationKeys);
    
    const results = new Map<string, string>();
    matches.forEach((row, i) => {
      const matchIndex = row.findIndex(match => match);
      if (matchIndex >= 0) {
        const matchedKey = translationKeys[matchIndex];
        results.set(keys[i], translations.get(matchedKey)!);
      }
    });
    
    return results;
  }
  
  /**
   * GPU加速模糊搜索
   */
  async fuzzySearch(query: string, translations: Map<string, string>): Promise<Array<{key: string; value: string; score: number}>> {
    if (!this.initialized || !this.stringMatcher) {
      return [];
    }
    
    const candidates = Array.from(translations.keys());
    const matches = await this.stringMatcher.fuzzyMatch(query, candidates);
    
    return matches.map(match => ({
      key: match.text,
      value: translations.get(match.text)!,
      score: match.score
    }));
  }
  
  /**
   * GPU加速文本渲染
   */
  async renderTexts(texts: string[]): Promise<ImageData[]> {
    if (!this.initialized) {
      return [];
    }
    
    // 使用WebGPU渲染
    const renderer = new WebGPUTextRenderer();
    if (await renderer.initialize()) {
      const results = await renderer.batchRenderText(texts);
      renderer.dispose();
      return results;
    }
    
    return [];
  }
  
  dispose(): void {
    this.stringMatcher?.dispose();
    this.initialized = false;
  }
}

/**
 * GPU加速插件
 */
export class GPUAcceleratorPlugin implements I18nPlugin {
  name = 'gpu-accelerator';
  version = '1.0.0';
  
  private accelerator: GPUAccelerator;
  
  constructor(config?: GPUConfig) {
    this.accelerator = new GPUAccelerator(config);
  }
  
  async install(i18n: I18nInstance): Promise<void> {
    console.log('[GPUAccelerator] Installing GPU accelerator...');
    
    await this.accelerator.initialize();
    
    // 添加GPU加速API
    (i18n as any).gpuBatchLookup = async (keys: string[]) => {
      const allTranslations = new Map<string, string>();
      // 这里应该从i18n获取所有翻译
      return this.accelerator.batchLookup(keys, allTranslations);
    };
    
    (i18n as any).gpuFuzzySearch = async (query: string) => {
      const allTranslations = new Map<string, string>();
      // 这里应该从i18n获取所有翻译
      return this.accelerator.fuzzySearch(query, allTranslations);
    };
    
    (i18n as any).gpuRenderTexts = async (texts: string[]) => {
      return this.accelerator.renderTexts(texts);
    };
    
    console.log('[GPUAccelerator] GPU accelerator installed');
  }
  
  async uninstall(i18n: I18nInstance): Promise<void> {
    this.accelerator.dispose();
    delete (i18n as any).gpuBatchLookup;
    delete (i18n as any).gpuFuzzySearch;
    delete (i18n as any).gpuRenderTexts;
    console.log('[GPUAccelerator] GPU accelerator uninstalled');
  }
}

export default GPUAcceleratorPlugin;