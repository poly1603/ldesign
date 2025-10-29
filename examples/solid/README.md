# Solid.js Example

This example demonstrates how to use `@ldesign/engine` with Solid.js.

## Features

- ✅ **i18n Plugin** - Multi-language support (English/Chinese)
- ✅ **Theme Plugin** - Light/Dark theme switching
- ✅ **Size Plugin** - Global size control (Small/Medium/Large)
- ✅ **State Management** - Fine-grained reactive signals
- ✅ **Event System** - Real-time event monitoring
- ✅ **Plugin System** - Dynamic plugin loading

## Getting Started

### Prerequisites

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
pnpm --filter @ldesign/example-solid dev
```

Or from this directory:

```bash
pnpm dev
```

The app will be available at [http://localhost:3002](http://localhost:3002).

### Build

```bash
pnpm build
```

### Preview

```bash
pnpm preview
```

## Project Structure

```
examples/solid/
├── src/
│   ├── App.tsx           # Main component
│   ├── App.css           # App styles
│   ├── index.tsx         # Entry point
│   └── index.css         # Global styles
├── index.html            # HTML template
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── vite.config.ts        # Vite config
└── README.md             # This file
```

## Key Concepts

### 1. Engine Setup

```ts
import { createEngine } from '@ldesign/engine-core'
import { setEngine } from '@ldesign/engine-solid'

const engine = createEngine({ ... })
await engine.initialize()
setEngine(engine)
```

### 2. Using Signals

```tsx
import { useEngine, useEngineState, usePlugin } from '@ldesign/engine-solid'

function MyComponent() {
  const engine = useEngine()
  const i18nPlugin = usePlugin('i18n')
  const [count, setCount] = useEngineState<number>('counter', 0)
  
  return (
    <div>
      <p>Count: {count()}</p>
      <button onClick={() => setCount(count() + 1)}>+1</button>
    </div>
  )
}
```

## Available Functions

- `setEngine(engine)` - Set the engine instance
- `getEngine()` - Get the engine instance
- `useEngine()` - Create engine signal
- `usePlugin(name)` - Create plugin signal
- `useEngineState(path, initial)` - Create state signal with setter
- `useEngineConfig(key, default)` - Create config signal
- `useEngineEvent(event, handler)` - Listen to events
- `useEngineEventSignal(event)` - Create event signal
- `useEngineLogger()` - Get logger instance
- `useEngineStatus()` - Create status signal

## Learn More

- [Engine Documentation](../../docs/README.md)
- [Plugin Development](../../docs/guide/plugin-development.md)
- [Solid.js Integration](../../docs/frameworks/solid.md)
- [Core API Reference](../../docs/api/core.md)

## License

MIT
