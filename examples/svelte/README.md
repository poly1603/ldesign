# Svelte Example

This example demonstrates how to use `@ldesign/engine` with Svelte.

## Features

This example showcases:

- ✅ **i18n Plugin** - Multi-language support (English/Chinese)
- ✅ **Theme Plugin** - Light/Dark theme switching with CSS variables
- ✅ **Size Plugin** - Global size control (Small/Medium/Large)
- ✅ **State Management** - Reactive Svelte stores backed by engine state
- ✅ **Event System** - Real-time event monitoring
- ✅ **Plugin System** - Dynamic plugin loading and usage

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js >= 18
- pnpm >= 8

### Installation

From the root of the monorepo:

```bash
pnpm install
```

### Development

Run the development server:

```bash
pnpm --filter @ldesign/example-svelte dev
```

Or from this directory:

```bash
pnpm dev
```

The app will be available at [http://localhost:3001](http://localhost:3001).

### Build

Build the production bundle:

```bash
pnpm build
```

### Preview

Preview the production build:

```bash
pnpm preview
```

## Project Structure

```
examples/svelte/
├── src/
│   ├── App.svelte       # Main application component
│   └── main.ts          # Entry point with engine setup
├── index.html           # HTML template
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
├── vite.config.ts       # Vite config
└── README.md            # This file
```

## Key Concepts

### 1. Engine Setup

The engine is created and configured in `main.ts`:

```ts
import { createEngine } from '@ldesign/engine-core'
import { setEngine } from '@ldesign/engine-svelte'

const engine = createEngine({
  name: 'svelte-example',
  version: '0.1.0'
})

await engine.initialize()
setEngine(engine)
```

### 2. Plugin Registration

Plugins are registered before initialization:

```ts
import { createI18nPlugin } from '@ldesign/engine-core/plugins/i18n'
import { createThemePlugin } from '@ldesign/engine-core/plugins/theme'

engine.use(createI18nPlugin({ /* config */ }))
engine.use(createThemePlugin({ /* config */ }))
```

### 3. Using Stores

Svelte stores provide reactive access to engine features:

```svelte
<script>
import {
  getEngine,
  createPluginStore,
  createEngineStateStore
} from '@ldesign/engine-svelte'

const engine = getEngine()
const i18nPlugin = createPluginStore('i18n')
const count = createEngineStateStore('counter', 0)

function increment() {
  $count++
}
</script>

<p>Count: {$count}</p>
<button on:click={increment}>+1</button>
```

## Available Store Creators

- `setEngine(engine)` - Set the engine instance
- `getEngine()` - Get the engine instance
- `engineStore` - Writable store containing the engine
- `createPluginStore(name)` - Create a readable store for a plugin
- `createEngineStateStore(path, initial)` - Create a writable store for engine state
- `createEngineConfigStore(key, default)` - Create a readable store for config
- `createEngineEventStore(event)` - Create a readable store for events
- `createEngineStatusStore()` - Create a readable store for engine status

## Learn More

- [Engine Documentation](../../docs/README.md)
- [Plugin Development](../../docs/guide/plugin-development.md)
- [Svelte Integration](../../docs/frameworks/svelte.md)
- [Core API Reference](../../docs/api/core.md)

## License

MIT
