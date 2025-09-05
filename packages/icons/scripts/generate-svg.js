import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { optimize } from 'svgo';
import { glob } from 'glob';
import camelCase from 'camelcase';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const SVG_DIR = path.resolve(ROOT_DIR, 'assets/svg');
const OUTPUT_DIR = path.resolve(ROOT_DIR, 'packages/icons-svg');

const svgoConfig = {
  multipass: true,
  js2svg: {
    indent: 2,
    pretty: true,
  },
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          removeViewBox: false,
          removeUnknownsAndDefaults: {
            keepRoleAttr: true,
          },
          cleanupIds: {
            minify: false,
          },
        },
      },
    },
    'removeDimensions',
    'convertStyleToAttrs',
    'removeScriptElement',
    {
      name: 'removeAttributesBySelector',
      params: {
        selectors: [
          { selector: '*', attributes: ['class', 'data-name'] }
        ]
      }
    },
    {
      name: 'addAttributesToSVGElement',
      params: {
        attributes: [
          { width: '1em' },
          { height: '1em' },
          { focusable: 'false' },
          { 'aria-hidden': 'true' }
        ]
      }
    }
  ],
};

async function processSvgFiles() {
  console.log(chalk.blue('📦 Processing SVG files...'));

  // Ensure directories exist
  await fs.ensureDir(SVG_DIR);
  await fs.ensureDir(path.resolve(OUTPUT_DIR, 'src'));
  await fs.ensureDir(path.resolve(OUTPUT_DIR, 'src/svg'));

  // Find all SVG files
  const svgFiles = await glob('**/*.svg', {
    cwd: SVG_DIR,
    absolute: false,
  });

  if (svgFiles.length === 0) {
    console.log(chalk.yellow('⚠️  No SVG files found in assets/svg directory'));
    return [];
  }

  console.log(chalk.green(`✅ Found ${svgFiles.length} SVG files`));

  const manifest = [];

  for (const file of svgFiles) {
    const filePath = path.resolve(SVG_DIR, file);
    const content = await fs.readFile(filePath, 'utf8');
    
    // Get icon name
    const name = path.basename(file, '.svg');
    const componentName = camelCase(name, { pascalCase: true });

    // Optimize SVG
    const result = optimize(content, svgoConfig);
    const optimizedContent = result.data;

    // Extract metadata
    const viewBoxMatch = optimizedContent.match(/viewBox="([^"]*)"/);
    const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24';

    // Save optimized SVG
    const outputPath = path.resolve(OUTPUT_DIR, 'src/svg', `${name}.svg`);
    await fs.writeFile(outputPath, optimizedContent);

    // Add to manifest
    manifest.push({
      name,
      componentName,
      fileName: `${name}.svg`,
      viewBox,
    });

    console.log(chalk.gray(`  ✓ Processed: ${name}.svg`));
  }

  // Generate index file with all SVG exports
  const indexContent = generateSvgIndex(manifest);
  await fs.writeFile(
    path.resolve(OUTPUT_DIR, 'src/index.ts'),
    indexContent
  );

  // Generate manifest.json
  await fs.writeJson(
    path.resolve(OUTPUT_DIR, 'src/manifest.json'),
    manifest,
    { spaces: 2 }
  );

  console.log(chalk.green(`✅ Generated ${manifest.length} optimized SVG files`));
  return manifest;
}

function generateSvgIndex(manifest) {
  const exports = manifest.map(({ name, componentName }) => {
    const svgContent = fs.readFileSync(path.resolve(OUTPUT_DIR, 'src/svg', `${name}.svg`), 'utf-8');
    return `export const ${componentName}Svg = \`${svgContent.replace(/`/g, '\\`')}\`;`;
  }).join('\n\n');

  const namedExports = manifest.map(({ componentName }) => 
    `  ${componentName}Svg,`
  ).join('\n');

  return `// Auto-generated file, do not edit directly
${exports}

export const icons = {
${namedExports}
};

export const manifest = ${JSON.stringify(manifest, null, 2)};

export type IconName = ${manifest.map(m => `'${m.name}'`).join(' | ')};
export type IconComponentName = ${manifest.map(m => `'${m.componentName}'`).join(' | ')};
`;
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  processSvgFiles().catch(console.error);
}

export default processSvgFiles;
