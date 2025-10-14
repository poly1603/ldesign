# @ldesign/color Examples

This directory contains examples demonstrating the usage of @ldesign/color library.

## Running the Examples

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

## Features Demonstrated

### Color Palette Generation
- **Primary Palette**: Generates 11 shades from a primary color
- **Semantic Palettes**: Automatically generates success, warning, danger, and info color palettes
- **Gray Scale**: Creates a 14-level grayscale palette

### Interactive Features
- Color picker to choose primary color
- Real-time palette generation
- Click to copy color values
- Export generated CSS variables
- Auto-apply theme to page elements

### CSS Variables
The example generates standard CSS variables that can be used in your projects:
- `--color-primary-[1-11]`
- `--color-success-[1-11]`
- `--color-warning-[1-11]`
- `--color-danger-[1-11]`
- `--color-info-[1-11]`
- `--color-gray-[1-14]`

## Project Structure

```
examples/
├── src/
│   ├── main.js      # Main application logic
│   └── style.css    # Styles for the example page
├── index.html       # Entry HTML file
├── vite.config.js   # Vite configuration
└── package.json     # Dependencies and scripts
```

## Using in Your Project

The example demonstrates how to import and use the @ldesign/color library:

```javascript
import { Color } from '@ldesign/color/core/Color'
import { 
  generateNumberedPalette,
  generateSemanticColors,
  generateGrayScale,
  generateCSSVariables,
  insertCSSVariables
} from '@ldesign/color/core/palette'

// Generate semantic colors from a primary color
const semanticColors = generateSemanticColors('#1890ff')

// Generate numbered palette for each color
const primaryPalette = generateNumberedPalette(semanticColors.primary)

// Generate and apply CSS variables
const theme = {
  primary: primaryPalette,
  // ... other palettes
}
insertCSSVariables(theme)
```