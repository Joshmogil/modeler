/**
 * Color Palette for Programming Languages
 * Constitution: Local-only, no external API calls
 */

export interface ColorInfo {
  primary: string // Hex color
  name: string
}

/**
 * Color palette for top programming languages
 * Colors chosen for visual distinction and accessibility
 */
export const LANGUAGE_COLORS: Record<string, ColorInfo> = {
  // Programming Languages
  TypeScript: { primary: '#3178c6', name: 'Blue' },
  'TypeScript React': { primary: '#3178c6', name: 'Blue' },
  JavaScript: { primary: '#f7df1e', name: 'Yellow' },
  'JavaScript React': { primary: '#61dafb', name: 'Cyan' },
  Python: { primary: '#3776ab', name: 'Blue' },
  Java: { primary: '#b07219', name: 'Orange' },
  C: { primary: '#555555', name: 'Gray' },
  'C++': { primary: '#f34b7d', name: 'Pink' },
  'C Header': { primary: '#555555', name: 'Gray' },
  'C++ Header': { primary: '#f34b7d', name: 'Pink' },
  'C#': { primary: '#178600', name: 'Green' },
  Go: { primary: '#00add8', name: 'Cyan' },
  Rust: { primary: '#dea584', name: 'Orange' },
  Ruby: { primary: '#701516', name: 'Red' },
  PHP: { primary: '#4f5d95', name: 'Purple' },
  Swift: { primary: '#ffac45', name: 'Orange' },
  Kotlin: { primary: '#a97bff', name: 'Purple' },
  Scala: { primary: '#c22d40', name: 'Red' },
  Shell: { primary: '#89e051', name: 'Green' },
  Bash: { primary: '#89e051', name: 'Green' },
  Zsh: { primary: '#89e051', name: 'Green' },
  Lua: { primary: '#000080', name: 'Navy' },
  R: { primary: '#198ce7', name: 'Blue' },
  'Objective-C': { primary: '#438eff', name: 'Blue' },
  'Objective-C++': { primary: '#6866fb', name: 'Purple' },
  Dart: { primary: '#00b4ab', name: 'Teal' },
  Elixir: { primary: '#6e4a7e', name: 'Purple' },
  Erlang: { primary: '#b83998', name: 'Magenta' },
  Clojure: { primary: '#db5855', name: 'Red' },
  Haskell: { primary: '#5e5086', name: 'Purple' },
  OCaml: { primary: '#3be133', name: 'Green' },
  VimScript: { primary: '#199f4b', name: 'Green' },
  SQL: { primary: '#e38c00', name: 'Orange' },

  // Markup & Stylesheets
  HTML: { primary: '#e34c26', name: 'Red' },
  XML: { primary: '#0060ac', name: 'Blue' },
  SVG: { primary: '#ff9900', name: 'Orange' },
  Markdown: { primary: '#083fa1', name: 'Blue' },
  LaTeX: { primary: '#3d6117', name: 'Green' },
  reStructuredText: { primary: '#141414', name: 'Black' },
  CSS: { primary: '#563d7c', name: 'Purple' },
  SCSS: { primary: '#c6538c', name: 'Pink' },
  Sass: { primary: '#a53b70', name: 'Magenta' },
  Less: { primary: '#1d365d', name: 'Navy' },

  // Data & Config
  JSON: { primary: '#292929', name: 'Dark Gray' },
  YAML: { primary: '#cb171e', name: 'Red' },
  TOML: { primary: '#9c4221', name: 'Brown' },
  CSV: { primary: '#3b7b3b', name: 'Green' },
  Config: { primary: '#777777', name: 'Gray' },
  INI: { primary: '#777777', name: 'Gray' },
  Environment: { primary: '#777777', name: 'Gray' },
  Properties: { primary: '#777777', name: 'Gray' },
  'Git Ignore': { primary: '#f14e32', name: 'Red' },
  Dockerfile: { primary: '#384d54', name: 'Slate' },

  // Documentation
  Text: { primary: '#cccccc', name: 'Light Gray' },
  Document: { primary: '#cccccc', name: 'Light Gray' },
  PDF: { primary: '#ff2116', name: 'Red' },

  // Fallback
  Unknown: { primary: '#808080', name: 'Gray' },
}

/**
 * Gets color for a programming language
 * @param language - Language name from LanguageDetector
 * @returns Color info with hex color and name
 */
export function getLanguageColor(language: string): ColorInfo {
  return LANGUAGE_COLORS[language] || LANGUAGE_COLORS['Unknown']!
}

/**
 * Converts hex color to RGB object for Three.js
 * @param hex - Hex color string (e.g., '#3178c6')
 * @returns RGB object with r, g, b in range [0, 1]
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1]!, 16) / 255,
        g: parseInt(result[2]!, 16) / 255,
        b: parseInt(result[3]!, 16) / 255,
      }
    : { r: 0.5, g: 0.5, b: 0.5 } // Fallback to gray
}

/**
 * Gets all unique colors in the palette
 * @returns Array of hex colors
 */
export function getAllColors(): string[] {
  return Array.from(new Set(Object.values(LANGUAGE_COLORS).map((c) => c.primary)))
}

/**
 * Generates accessible high-contrast version of a color
 * @param hex - Original hex color
 * @returns High-contrast hex color
 */
export function getHighContrastColor(hex: string): string {
  const rgb = hexToRgb(hex)
  const luminance = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b

  // If too dark, lighten; if too light, darken
  if (luminance < 0.5) {
    // Make brighter
    return `#${Math.floor((rgb.r * 255 + 100) % 255)
      .toString(16)
      .padStart(2, '0')}${Math.floor((rgb.g * 255 + 100) % 255)
      .toString(16)
      .padStart(2, '0')}${Math.floor((rgb.b * 255 + 100) % 255)
      .toString(16)
      .padStart(2, '0')}`
  } else {
    // Make darker
    return `#${Math.floor(rgb.r * 155)
      .toString(16)
      .padStart(2, '0')}${Math.floor(rgb.g * 155)
      .toString(16)
      .padStart(2, '0')}${Math.floor(rgb.b * 155)
      .toString(16)
      .padStart(2, '0')}`
  }
}
