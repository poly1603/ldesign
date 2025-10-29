# Vue Engine Example

This is a demo application showcasing `@ldesign/engine` integration with Vue 3.

## Features

- ✅ **Internationalization**: Switch between English and Chinese using the i18n plugin
- ✅ **Theme Switching**: Toggle between light and dark themes using the theme plugin
- ✅ **Size Control**: Adjust UI size (small, medium, large) using the size plugin
- ✅ **State Management**: Reactive state management with Vue's composition API
- ✅ **Event System**: Real-time event logging and monitoring
- ✅ **Type Safety**: Full TypeScript support with strict typing

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001) to view it in the browser.

### Build

```bash
pnpm build
```

## Project Structure

```
vue/
├── src/
│   ├── App.vue                    # Main app component
│   ├── main.ts                    # App entry point with engine setup
│   └── style.css                  # Global styles
├── index.html                     # HTML template
├── vite.config.ts                 # Vite configuration
├── tsconfig.json                  # TypeScript configuration
├── package.json                   # Dependencies
└── README.md                      # This file
```

## How It Works

### Engine Setup

The engine is initialized in `main.ts` with three plugins:

```typescript
import { createEngine } from '@ldesign/engine-core';
import { VueEnginePlugin } from '@ldesign/engine-vue';
import { createI18nPlugin } from '@ldesign/engine-core/plugins/i18n';
import { createThemePlugin } from '@ldesign/engine-core/plugins/theme';
import { createSizePlugin } from '@ldesign/engine-core/plugins/size';

const engine = createEngine({
  name: 'vue-example',
  version: '0.1.0'
});

engine.use(createI18nPlugin({ /* config */ }));
engine.use(createThemePlugin({ /* config */ }));
engine.use(createSizePlugin({ /* config */ }));

await engine.initialize();

const app = createApp(App);
app.use(VueEnginePlugin, { engine });
app.mount('#app');
```

### Using Engine in Components

The package provides composables for accessing engine features:

```vue
<script setup lang="ts">
import { useEngine, useEnginePlugin, useEngineEvent } from '@ldesign/engine-vue';

// Access the engine instance
const engine = useEngine();

// Access specific plugins
const i18nPlugin = useEnginePlugin('i18n');
const themePlugin = useEnginePlugin('theme');

// Listen to events
useEngineEvent('locale:changed', (data) => {
  console.log('Locale changed:', data);
});

// Use plugin APIs
function switchLocale() {
  if (i18nPlugin.value?.api) {
    const newLocale = locale.value === 'en' ? 'zh' : 'en';
    i18nPlugin.value.api.setLocale(newLocale);
  }
}
</script>
```

## Learn More

- [@ldesign/engine Documentation](../../docs/README.md)
- [Vue 3 Documentation](https://vuejs.org)
- [Vite Documentation](https://vitejs.dev)

## License

MIT
