import path from 'path';
import fs from 'fs-extra';
import { optimize, type Config as SvgoConfig } from 'svgo';
import camelCase from 'camelcase';
import type { SVGInfo } from '../types';

export function toComponentName(name: string, prefix?: string, suffix?: string) {
  const base = camelCase(name.replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => ' ' + chr), { pascalCase: true });
  return [prefix ?? '', base, suffix ?? ''].join('').replace(/\s+/g, '');
}

export async function readSvgFiles(inputDir: string): Promise<SVGInfo[]> {
  const files = await fs.readdir(inputDir);
  const svgs = files.filter((f) => f.toLowerCase().endsWith('.svg'));
  const results: SVGInfo[] = [];
  for (const file of svgs) {
    const filePath = path.resolve(inputDir, file);
    const content = await fs.readFile(filePath, 'utf8');
    const name = path.basename(file, '.svg');
    const fileName = `${camelCase(name, { pascalCase: true })}.svg`;
    results.push({ name, componentName: camelCase(name, { pascalCase: true }), fileName, content });
  }
  return results;
}

export function optimizeSvgContent(content: string, svgoConfig?: SvgoConfig): { data: string } {
  const result = optimize(content, svgoConfig ?? defaultSvgoConfig);
  if ('data' in result) {
    return { data: result.data };
  }
  // @ts-expect-error a fallback in case types mismatch
  return { data: result.data ?? content };
}

export function extractViewBox(content: string): string | undefined {
  const m = content.match(/viewBox="([^"]+)"/i);
  return m ? m[1] : undefined;
}

export const defaultSvgoConfig: SvgoConfig = {
  multipass: true,
  js2svg: { pretty: true },
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          removeViewBox: false,
          removeUnknownsAndDefaults: { keepRoleAttr: true }
        }
      }
    },
    { name: 'removeDimensions' },
    { name: 'convertStyleToAttrs' },
    { name: 'removeScriptElement' }
  ]
};

