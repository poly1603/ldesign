# React Example

This example demonstrates how to use `@ldesign/engine` with React.

## Features

This example showcases:

- ✅ **i18n Plugin** - Multi-language support (English/Chinese)
- ✅ **Theme Plugin** - Light/Dark theme switching with CSS variables
- ✅ **Size Plugin** - Global size control (Small/Medium/Large)
- ✅ **State Management** - Cross-component state with `useEngineState`
- ✅ **Event System** - Real-time event monitoring with `useEngineEvent`
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
pnpm --filter @ldesign/example-react dev
```

Or from this directory:

```bash
pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

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
examples/react/
├── src/
│   ├── App.tsx          # Main application component
│   ├── App.css          # Application styles
│   ├── main.tsx         # Entry point with engine setup
│   └── index.css        # Global styles
├── index.html           # HTML template
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
├── vite.config.ts       # Vite config
└── README.md            # This file
```

## Key Concepts

### 1. Engine Setup

The engine is created and configured in `main.tsx`:

```tsx
import { createEngine } from '@ldesign/engine-core'

const engine = createEngine({
  name: 'react-example',
  version: '0.1.0'
})
```

### 2. Plugin Registration

Plugins are registered before initialization:

```tsx
import { createI18nPlugin } from '@ldesign/engine-core/plugins/i18n'
import { createThemePlugin } from '@ldesign/engine-core/plugins/theme'

engine.use(createI18nPlugin({ /* config */ }))
engine.use(createThemePlugin({ /* config */ }))
```

### 3. Provider Setup

The `EngineProvider` makes the engine available to all components:

```tsx
import { EngineProvider } from '@ldesign/engine-react'

<EngineProvider engine={engine}>
  <App />
</EngineProvider>
```

### 4. Using Hooks

React hooks provide easy access to engine features:

```tsx
import {
  useEngine,
  usePlugin,
  useEngineState,
  useEngineEvent
} from '@ldesign/engine-react'

function MyComponent() {
  const engine = useEngine()
  const i18nPlugin = usePlugin('i18n')
  const [count, setCount] = useEngineState('counter', 0)
  
  useEngineEvent('theme:changed', (data) => {
    console.log('Theme changed to:', data.to)
  })
  
  return <div>{count}</div>
}
```

## Available Hooks

- `useEngine()` - Get the engine instance
- `usePlugin(name)` - Get a specific plugin
- `useEngineState(path, initial)` - Get and set engine state
- `useEngineEvent(event, handler)` - Listen to engine events
- `useEngineConfig(key, default)` - Get engine configuration
- `useEngineLogger()` - Get the logger instance
- `useEngineStatus()` - Get engine status information

## Learn More

- [Engine Documentation](../../docs/README.md)
- [Plugin Development](../../docs/guide/plugin-development.md)
- [React Integration](../../docs/frameworks/react.md)
- [Core API Reference](../../docs/api/core.md)

## License

MIT
