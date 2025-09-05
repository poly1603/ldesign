export interface IconConfig {
  target: 'vue2' | 'vue3' | 'react' | 'lit';
  inputDir: string;
  outputDir: string;
  prefix?: string;
  suffix?: string;
  optimize?: boolean;
  typescript?: boolean;
}

export interface SVGInfo {
  name: string;
  componentName: string;
  fileName: string;
  content: string;
  optimizedContent?: string;
  viewBox?: string;
  width?: string;
  height?: string;
}

export interface GeneratorOptions {
  icons: SVGInfo[];
  config: IconConfig;
}

export interface SVGOConfig {
  plugins: Array<{
    name: string;
    params?: any;
  }>;
}
