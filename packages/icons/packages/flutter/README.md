# LDesign Icons Flutter

A comprehensive Flutter package providing access to the LDesign icon library.

## Installation

Add this to your package's `pubspec.yaml` file:

```yaml
dependencies:
  ldesign_icons_flutter: ^1.0.0
```

## Usage

```dart
import 'package:ldesign_icons_flutter/ldesign_icons.dart';

// Use in widgets
Icon(LDesignIcons.add)
Icon(LDesignIcons.user, size: 32.0, color: Colors.blue)

// Get icon by name
IconData? icon = LDesignIcons.getByName('add');

// Get all available icons
List<String> allIcons = LDesignIcons.allNames;
```

## Features

- 1.0.0 icons available
- Vector-based, fully scalable
- Consistent with LDesign design system
- Type-safe icon access
- Support for all Flutter platforms

## Generated

This package is automatically generated from SVG sources.
Generation time: 2025-09-17T09:45:01.350Z