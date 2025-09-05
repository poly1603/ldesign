#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import path from 'path';
import chalk from 'chalk';
import fs from 'fs-extra';
import { convert } from './index';
import type { IconConfig } from './types';

const argv = yargs(hideBin(process.argv))
  .options({
    target: {
      alias: 't',
      describe: 'Target framework',
      choices: ['vue2', 'vue3', 'react', 'lit', 'all'],
      default: 'all' as const
    },
    input: {
      alias: 'i',
      describe: 'Input directory containing SVG files',
      type: 'string',
      default: './svg'
    },
    output: {
      alias: 'o',
      describe: 'Output directory for generated components',
      type: 'string',
      default: './output'
    },
    prefix: {
      alias: 'p',
      describe: 'Prefix for component names',
      type: 'string'
    },
    suffix: {
      alias: 's',
      describe: 'Suffix for component names',
      type: 'string'
    },
    typescript: {
      alias: 'ts',
      describe: 'Generate TypeScript components',
      type: 'boolean',
      default: true
    },
    optimize: {
      describe: 'Optimize SVG files with SVGO',
      type: 'boolean',
      default: true
    }
  })
  .help()
  .parseSync();

async function run() {
  const inputDir = path.resolve(process.cwd(), argv.input);
  const outputBase = path.resolve(process.cwd(), argv.output);

  // Check if input directory exists
  if (!await fs.pathExists(inputDir)) {
    console.error(chalk.red(`❌ Input directory does not exist: ${inputDir}`));
    process.exit(1);
  }

  // Check if input directory contains SVG files
  const files = await fs.readdir(inputDir);
  const svgFiles = files.filter(f => f.toLowerCase().endsWith('.svg'));
  
  if (svgFiles.length === 0) {
    console.error(chalk.red(`❌ No SVG files found in: ${inputDir}`));
    process.exit(1);
  }

  console.log(chalk.blue(`📁 Found ${svgFiles.length} SVG file(s) in ${inputDir}`));

  const targets: Array<IconConfig['target']> = 
    argv.target === 'all' 
      ? ['vue2', 'vue3', 'react', 'lit'] 
      : [argv.target as IconConfig['target']];

  for (const target of targets) {
    const outputDir = argv.target === 'all' 
      ? path.join(outputBase, target)
      : outputBase;

    console.log(chalk.green(`\n🎯 Generating ${target.toUpperCase()} components...`));
    
    const config: IconConfig = {
      target,
      inputDir,
      outputDir,
      prefix: argv.prefix,
      suffix: argv.suffix,
      typescript: argv.typescript,
      optimize: argv.optimize
    };

    try {
      await convert(config);
      console.log(chalk.green(`✅ ${target.toUpperCase()} components generated in ${outputDir}`));
    } catch (error) {
      console.error(chalk.red(`❌ Error generating ${target} components:`, error));
      process.exit(1);
    }
  }

  console.log(chalk.bold.green('\n✨ All done! Your icon components are ready.'));
  console.log(chalk.cyan('\n📦 To publish as npm packages:'));
  console.log(chalk.cyan('   1. Navigate to each output directory'));
  console.log(chalk.cyan('   2. Run: npm publish --access public'));
}

run().catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});
