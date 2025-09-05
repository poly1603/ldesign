import type { IconConfig, SVGInfo } from './types';
import { readSvgFiles, optimizeSvgContent, toComponentName } from './utils/svg';
import { generateVue2Components } from './generators/vue2';
import { generateVue3Components } from './generators/vue3';
import { generateReactComponents } from './generators/react';
import { generateLitComponents } from './generators/lit';

export async function convert(config: IconConfig): Promise<void> {
  // Read all SVG files from input directory
  const svgFiles = await readSvgFiles(config.inputDir);
  
  // Process each SVG file
  const icons: SVGInfo[] = svgFiles.map(svg => {
    const componentName = toComponentName(svg.name, config.prefix, config.suffix);
    
    // Optimize SVG if requested
    if (config.optimize) {
      const optimized = optimizeSvgContent(svg.content);
      return {
        ...svg,
        componentName,
        optimizedContent: optimized.data
      };
    }
    
    return {
      ...svg,
      componentName
    };
  });

  // Generate components based on target
  const options = { icons, config };
  
  switch (config.target) {
    case 'vue2':
      await generateVue2Components(options);
      break;
    case 'vue3':
      await generateVue3Components(options);
      break;
    case 'react':
      await generateReactComponents(options);
      break;
    case 'lit':
      await generateLitComponents(options);
      break;
    default:
      throw new Error(`Unsupported target: ${config.target}`);
  }
}

export * from './types';
export * from './utils/svg';
export { generateVue2Components } from './generators/vue2';
export { generateVue3Components } from './generators/vue3';
export { generateReactComponents } from './generators/react';
export { generateLitComponents } from './generators/lit';
