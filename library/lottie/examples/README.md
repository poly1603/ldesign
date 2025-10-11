# Lottie Examples

This directory contains working examples of the `@ldesign/lottie` plugin with real Lottie animation files.

## 📁 Directory Structure

```
examples/
├── assets/                    # Lottie JSON animation files
│   ├── loading-spinner.json   # Colorful confetti loading spinner  
│   ├── success-checkmark.json # Animated green checkmark
│   ├── heart-beat.json        # Beating heart animation
│   ├── rocket.json            # Rocket launch animation
│   ├── confetti.json          # Celebration confetti
│   ├── loading.json           # Simple loading circles (legacy)
│   ├── success.json           # Simple success icon (legacy)
│   └── heart.json             # Simple heart (legacy)
├── vanilla/                   # Pure JavaScript/TypeScript example
├── react/                     # React example with hooks and components
├── vue/                       # Vue 3 example with composables and directives
└── test-lottie.html           # Standalone test file using CDN
```

## 🎨 Featured Animations (Used in Examples)

### 1. Loading Spinner (`loading-spinner.json`)
- **Type**: Colorful confetti particles spinning in circles
- **Source**: LottieFiles community
- **Duration**: 5 seconds (loops)
- **Colors**: Multi-color (orange, blue, purple, green, pink)
- **Size**: 65 KB
- **Use case**: Loading states, processing indicators, splash screens

### 2. Success Checkmark (`success-checkmark.json`)
- **Type**: Animated checkmark with circle fill
- **Source**: LottieFiles community
- **Duration**: 3 seconds (plays once)
- **Colors**: Green shades
- **Size**: 115 KB
- **Use case**: Success confirmations, completed actions, form submissions

### 3. Heart Beat (`heart-beat.json`)
- **Type**: Pulsing heart animation
- **Source**: LottieFiles community
- **Duration**: 2 seconds (loops)
- **Colors**: Red/Pink
- **Size**: 12 KB
- **Use case**: Like buttons, favorites, emotional feedback, health apps

### 4. Rocket Launch (`rocket.json`)
- **Type**: Rocket flying upwards
- **Source**: LottieFiles community
- **Duration**: 1.5 seconds
- **Colors**: Orange, white, blue
- **Size**: 3 KB
- **Use case**: Launch actions, success milestones, onboarding

### 5. Confetti (`confetti.json`)
- **Type**: Celebratory confetti explosion
- **Source**: LottieFiles community
- **Duration**: 4 seconds
- **Colors**: Multi-color
- **Size**: 98 KB
- **Use case**: Celebrations, achievements, success screens

## 🚀 Running the Examples

### Method 1: Using npm scripts (Recommended)

From the root `lottie` directory:

```bash
# Vanilla JavaScript example
npm run example:vanilla

# React example
npm run example:react

# Vue example
npm run example:vue
```

Each example will start a local dev server (usually on port 8080-8082).

### Method 2: Standalone Test

The `test-lottie.html` file is a standalone example using the Lottie CDN. You can:

1. **Using Python:**
   ```bash
   cd examples
   python -m http.server 8000
   ```
   Then open `http://localhost:8000/test-lottie.html`

2. **Using Node.js:**
   ```bash
   cd examples
   npx serve
   ```

3. **Or simply open the file in your browser** (some features may not work due to CORS)

## 💡 Example Features

### Vanilla JavaScript Example
- Basic animation controls (play, pause, stop, reset)
- Click-to-play/pause interaction
- Hover-to-play interaction
- Animation sequences
- Global performance statistics
- State management

### React Example
- `useLottie` hook for programmatic control
- `<Lottie>` component for declarative usage
- Speed control with real-time updates
- Global manager integration
- TypeScript support

### Vue Example
- `useLottie` composable for composition API
- `v-lottie` directive for template usage
- Reactive speed control
- Global statistics display
- Full TypeScript support

## 🔧 Customizing Animations

Want to use your own Lottie animations? Simply:

1. **Add your JSON file** to the `assets/` directory
2. **Update the path** in the example files:
   ```javascript
   // Change from:
   path: '/loading.json'
   
   // To:
   path: '/your-animation.json'
   ```

### Finding Lottie Animations

- [LottieFiles](https://lottiefiles.com/) - Free Lottie animations
- [Iconscout](https://iconscout.com/lottie-animations) - Premium and free animations
- Create your own with Adobe After Effects + Bodymovin plugin

## 🎯 Key Concepts Demonstrated

1. **Loading animations from JSON files**
   - Remote path loading
   - Animation data caching
   - Error handling

2. **Animation controls**
   - Play, pause, stop, reset
   - Speed control
   - Loop settings

3. **Interactive behaviors**
   - Click interactions
   - Hover interactions
   - Custom event handlers

4. **Animation sequences**
   - Chaining multiple animations
   - Delays between animations
   - Sequential playback control

5. **Performance monitoring**
   - FPS tracking
   - Cache hit rates
   - Instance management

## 📚 Learn More

- [Main Documentation](../README.md)
- [Usage Guide](../USAGE_GUIDE.md)
- [API Documentation](../docs/api/core.md)
- [LottieFiles Documentation](https://lottiefiles.github.io/lottie-docs/)

## ⚠️ Troubleshooting

### Animations not loading?
- Ensure the dev server is running
- Check browser console for errors
- Verify JSON files are in the `assets/` directory
- Check network tab for 404 errors

### Blank containers?
- Wait a few seconds for animations to load
- Click the "Play" button
- Check if `lottie-web` is properly loaded

### CORS errors?
- Use a local dev server (Vite, Python HTTP server, etc.)
- Don't open HTML files directly with `file://` protocol

## 🤝 Contributing

Found an issue or want to add more examples? Feel free to contribute!

1. Add new animation JSON files to `assets/`
2. Create example implementations
3. Update this README
4. Submit a pull request

## 📄 License

MIT License - see [LICENSE](../LICENSE) for details
