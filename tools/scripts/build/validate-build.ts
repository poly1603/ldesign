#!/usr/bin/env tsx

/*
 Lightweight TS entrypoint that forwards to the existing JS implementation.
 This allows unified TS-based CLI usage while we progressively migrate internals.
*/

// Preserve process exit code and signal handling similar to node forwarding
(async () => {
  try {
    const mod = await import('./validate-build.js');
    if (typeof (mod as any).default === 'function') {
      await (mod as any).default(process.argv.slice(2));
    } else if (typeof (mod as any).run === 'function') {
      await (mod as any).run(process.argv.slice(2));
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[tools] validate-build failed:', error);
    process.exitCode = 1;
  }
})();


