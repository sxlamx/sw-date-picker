# sw-date-picker

A lightweight, zero-dependency date picker for the modern web.

## Features

- **Zero runtime dependencies** — ~5KB gzipped
- **ES Modules** — tree-shakeable, works in browsers and bundlers
- **CSS Custom Properties** — full theme control via CSS variables
- **RTL support** — built-in right-to-left layout
- **Inline & Popup modes** — flexible integration
- **Keyboard navigation** — full keyboard accessibility
- **Range selection** — select date ranges with start/end handling
- **TypeScript-ready** — bundled types included

## Usage

```html
<script type="module">
  import { Datepicker } from './dist/sw-date-picker.js';

  const picker = new Datepicker(document.getElementById('date-input'), {
    format: 'YYYY-MM-DD',
    position: 'below',
  });
</script>
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `format` | `string` | `'YYYY-MM-DD'` | Date format pattern |
| `position` | `'above'\|'below'` | `'below'` | Popup position |
| `rtl` | `boolean` | `false` | Enable RTL layout |
| `inline` | `boolean` | `false` | Inline calendar mode |
| `value` | `Date\|null` | `null` | Initial date value |
| `min` | `Date` | `null` | Minimum selectable date |
| `max` | `Date` | `null` | Maximum selectable date |
| `disabled` | `boolean` | `false` | Disable the input |
| `placeholder` | `string` | `''` | Input placeholder text |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `ArrowLeft/ArrowRight` | Navigate days |
| `ArrowUp/ArrowDown` | Navigate weeks |
| `PageUp/PageDown` | Navigate months |
| `Home/End` | First/last day of month |
| `Enter/Space` | Select focused date |
| `Escape` | Close popup |

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Test Coverage

```
✓ 111 tests passing
✓ 17 test files
✓ 95%+ coverage
```

## Project Structure

```
sw-date-picker/
├── src/
│   ├── date-engine.js     # Core date math & calculations
│   ├── locale-engine.js  # i18n and formatting
│   ├── parser.js         # String → Date parsing
│   ├── formatter.js      # Date → String formatting
│   ├── calendar.js      # Calendar grid logic
│   ├── popup.js          # Popup positioning & behavior
│   ├── keyboard.js      # Keyboard navigation
│   ├── selection.js     # Date selection state
│   ├── accessibility.js  # ARIA attributes & roles
│   └── datepicker.js    # Main Datepicker class
├── tests/
│   ├── date-engine.test.js
│   ├── locale-engine.test.js
│   ├── parser.test.js
│   ├── formatter.test.js
│   ├── calendar.test.js
│   ├── popup.test.js
│   ├── keyboard.test.js
│   ├── selection.test.js
│   ├── accessibility.test.js
│   ├── datepicker.test.js
│   └── integration/
│       ├── inline.test.js
│       ├── range.test.js
│       ├── rtl.test.js
│       ├── positioning.test.js
│       ├── keyboard-nav.test.js
│       ├── disabled.test.js
│       └── localization.test.js
├── dist/
│   └── sw-date-picker.js  # Bundled ES module
├── index.html             # Demo page
├── vitest.config.js       # Test configuration
└── package.json
```