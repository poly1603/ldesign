# Angular Engine Example

This is a demo application showcasing `@ldesign/engine` integration with Angular.

## Features

- ✅ **Internationalization**: Switch between English and Chinese using the i18n plugin
- ✅ **Theme Switching**: Toggle between light and dark themes using the theme plugin
- ✅ **Size Control**: Adjust UI size (small, medium, large) using the size plugin
- ✅ **State Management**: Reactive state management with RxJS observables
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
pnpm start
```

Open [http://localhost:4200](http://localhost:4200) to view it in the browser.

### Build

```bash
pnpm build
```

## Project Structure

```
angular/
├── src/
│   ├── app/
│   │   ├── app.component.ts       # Main app component
│   │   ├── app.component.html     # Component template
│   │   └── app.component.css      # Component styles
│   ├── main.ts                    # App entry point with engine setup
│   ├── index.html                 # HTML template
│   └── styles.css                 # Global styles
├── angular.json                   # Angular CLI configuration
├── tsconfig.json                  # TypeScript configuration
├── tsconfig.app.json              # App-specific TypeScript config
├── package.json                   # Dependencies
└── README.md                      # This file
```

## How It Works

### Engine Setup

The engine is initialized in `main.ts` with three plugins:

```typescript
import { createEngine } from '@ldesign/engine-core';
import { createI18nPlugin } from '@ldesign/engine-core/plugins/i18n';
import { createThemePlugin } from '@ldesign/engine-core/plugins/theme';
import { createSizePlugin } from '@ldesign/engine-core/plugins/size';
import { provideEngine } from '@ldesign/engine-angular';

const engine = createEngine({
  name: 'angular-example',
  version: '0.1.0'
});

engine.use(createI18nPlugin({ /* config */ }));
engine.use(createThemePlugin({ /* config */ }));
engine.use(createSizePlugin({ /* config */ }));

await engine.initialize();

bootstrapApplication(AppComponent, {
  providers: [provideEngine(engine)]
});
```

### Using Engine in Components

The `EngineService` provides RxJS observables for reactive state management:

```typescript
import { EngineService } from '@ldesign/engine-angular';

export class AppComponent {
  constructor(private engineService: EngineService) {}

  ngOnInit() {
    // Subscribe to locale changes
    this.engineService.locale$.subscribe(locale => {
      console.log('Locale changed:', locale);
    });

    // Subscribe to theme changes
    this.engineService.theme$.subscribe(theme => {
      console.log('Theme changed:', theme);
    });

    // Subscribe to all events
    this.engineService.events$.subscribe(event => {
      console.log('Event:', event);
    });

    // Get plugin API
    const i18nPlugin = this.engineService.getPlugin('i18n');
    i18nPlugin.api.setLocale('zh');
  }
}
```

## Learn More

- [@ldesign/engine Documentation](../../docs/README.md)
- [Angular Documentation](https://angular.dev)
- [RxJS Documentation](https://rxjs.dev)

## License

MIT
