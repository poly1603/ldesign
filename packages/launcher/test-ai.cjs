const { createCli } = require('./dist/cli/index.cjs');

// Test the CLI with AI command
const args = process.argv.slice(2);
if (args.length === 0) {
  args.push('ai', '--help');
}

// Mock process.argv for the CLI
process.argv = ['node', 'test-ai.js', ...args];

// Create and run CLI
const cli = createCli();
