# @ldesign/core

Framework-agnostic core engine for building modern applications.

## Features

- 🔌 **Plugin System** - Extensible plugin architecture
- 🔄 **Middleware** - Powerful middleware support
- ⚡ **Lifecycle** - Complete lifecycle management
- 📡 **Events** - Event-driven architecture
- 💉 **Dependency Injection** - Built-in DI container
- 📦 **State Management** - Framework-agnostic state management
- 🗃️ **Caching** - Multiple caching strategies
- 📝 **Logger** - Flexible logging system
- ⚙️ **Configuration** - Type-safe configuration management

## Installation

```bash
npm install @ldesign/core
# or
pnpm add @ldesign/core
# or
yarn add @ldesign/core
```

## Usage

```typescript
import { createCoreEngine } from '@ldesign/core'

const engine = createCoreEngine({
  // Your configuration
})

// Use plugins
engine.use(myPlugin)

// Register middleware
engine.middleware.use(async (ctx, next) => {
  console.log('Before')
  await next()
  console.log('After')
})

// Start engine
await engine.start()
```

## Documentation

Visit [https://ldesign.dev/core](https://ldesign.dev/core) for full documentation.

## License

MIT © LDesign Team
