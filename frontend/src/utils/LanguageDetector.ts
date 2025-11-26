/**
 * Language Detection Utility
 * Detects programming language from file extension
 * Constitution: Local-only, no external API calls
 */

interface LanguageInfo {
  name: string
  category: 'programming' | 'markup' | 'data' | 'config' | 'documentation' | 'other'
}

/**
 * Map of file extensions to language information
 */
const EXTENSION_MAP: Record<string, LanguageInfo> = {
  // Programming Languages
  ts: { name: 'TypeScript', category: 'programming' },
  tsx: { name: 'TypeScript React', category: 'programming' },
  js: { name: 'JavaScript', category: 'programming' },
  jsx: { name: 'JavaScript React', category: 'programming' },
  py: { name: 'Python', category: 'programming' },
  java: { name: 'Java', category: 'programming' },
  c: { name: 'C', category: 'programming' },
  cpp: { name: 'C++', category: 'programming' },
  cc: { name: 'C++', category: 'programming' },
  cxx: { name: 'C++', category: 'programming' },
  h: { name: 'C Header', category: 'programming' },
  hpp: { name: 'C++ Header', category: 'programming' },
  cs: { name: 'C#', category: 'programming' },
  go: { name: 'Go', category: 'programming' },
  rs: { name: 'Rust', category: 'programming' },
  rb: { name: 'Ruby', category: 'programming' },
  php: { name: 'PHP', category: 'programming' },
  swift: { name: 'Swift', category: 'programming' },
  kt: { name: 'Kotlin', category: 'programming' },
  scala: { name: 'Scala', category: 'programming' },
  sh: { name: 'Shell', category: 'programming' },
  bash: { name: 'Bash', category: 'programming' },
  zsh: { name: 'Zsh', category: 'programming' },
  lua: { name: 'Lua', category: 'programming' },
  r: { name: 'R', category: 'programming' },
  m: { name: 'Objective-C', category: 'programming' },
  mm: { name: 'Objective-C++', category: 'programming' },
  dart: { name: 'Dart', category: 'programming' },
  ex: { name: 'Elixir', category: 'programming' },
  exs: { name: 'Elixir', category: 'programming' },
  erl: { name: 'Erlang', category: 'programming' },
  clj: { name: 'Clojure', category: 'programming' },
  hs: { name: 'Haskell', category: 'programming' },
  ml: { name: 'OCaml', category: 'programming' },
  vim: { name: 'VimScript', category: 'programming' },
  sql: { name: 'SQL', category: 'programming' },

  // Markup Languages
  html: { name: 'HTML', category: 'markup' },
  htm: { name: 'HTML', category: 'markup' },
  xml: { name: 'XML', category: 'markup' },
  svg: { name: 'SVG', category: 'markup' },
  md: { name: 'Markdown', category: 'markup' },
  markdown: { name: 'Markdown', category: 'markup' },
  tex: { name: 'LaTeX', category: 'markup' },
  rst: { name: 'reStructuredText', category: 'markup' },

  // Stylesheets
  css: { name: 'CSS', category: 'markup' },
  scss: { name: 'SCSS', category: 'markup' },
  sass: { name: 'Sass', category: 'markup' },
  less: { name: 'Less', category: 'markup' },

  // Data Formats
  json: { name: 'JSON', category: 'data' },
  yaml: { name: 'YAML', category: 'data' },
  yml: { name: 'YAML', category: 'data' },
  toml: { name: 'TOML', category: 'data' },
  csv: { name: 'CSV', category: 'data' },

  // Configuration
  conf: { name: 'Config', category: 'config' },
  ini: { name: 'INI', category: 'config' },
  cfg: { name: 'Config', category: 'config' },
  env: { name: 'Environment', category: 'config' },
  properties: { name: 'Properties', category: 'config' },

  // Documentation
  txt: { name: 'Text', category: 'documentation' },
  doc: { name: 'Document', category: 'documentation' },
  pdf: { name: 'PDF', category: 'documentation' },

  // Other
  gitignore: { name: 'Git Ignore', category: 'config' },
  dockerfile: { name: 'Dockerfile', category: 'config' },
}

/**
 * Detects programming language from file path
 * @param filePath - The file path to analyze
 * @returns Language information
 */
export function detectLanguage(filePath: string): LanguageInfo {
  // Extract extension
  const lastDot = filePath.lastIndexOf('.')
  if (lastDot === -1) {
    // No extension, check special cases
    const fileName = filePath.split('/').pop()?.toLowerCase() || ''
    if (fileName === 'dockerfile') {
      return EXTENSION_MAP['dockerfile']!
    }
    if (fileName === '.gitignore') {
      return EXTENSION_MAP['gitignore']!
    }
    return { name: 'Unknown', category: 'other' }
  }

  const extension = filePath.slice(lastDot + 1).toLowerCase()
  return EXTENSION_MAP[extension] || { name: 'Unknown', category: 'other' }
}

/**
 * Gets all supported languages
 * @returns Array of all language names
 */
export function getSupportedLanguages(): string[] {
  const languages = new Set<string>()
  Object.values(EXTENSION_MAP).forEach((info) => languages.add(info.name))
  return Array.from(languages).sort()
}

/**
 * Checks if a language is supported for syntax highlighting
 * @param language - Language name
 * @returns True if highlighting is supported
 */
export function isHighlightingSupported(language: string): boolean {
  // For MVP, we'll support common languages via highlight.js
  const supported = [
    'TypeScript',
    'JavaScript',
    'Python',
    'Java',
    'C',
    'C++',
    'C#',
    'Go',
    'Rust',
    'Ruby',
    'PHP',
    'Swift',
    'Kotlin',
    'HTML',
    'CSS',
    'JSON',
    'Markdown',
    'Shell',
    'Bash',
    'SQL',
  ]
  return supported.includes(language)
}
