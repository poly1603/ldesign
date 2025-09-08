// Minimal config to satisfy `rollup -c` during build:lib.
// The library compilation for CLI is handled by TypeScript (tsc) to emit dist/cli.js.
// We provide a minimal config that does nothing.
export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/dummy.js',
    format: 'es'
  },
  external: () => true // Mark all imports as external
};

