import { describe, it, expect } from 'vitest'
import { detectLanguage, getSupportedLanguages } from '../src/utils/LanguageDetector'

describe('LanguageDetector', () => {
  describe('detectLanguage', () => {
    it('should detect TypeScript files', () => {
      const result = detectLanguage('test.ts')
      expect(result.name).toBe('TypeScript')
      expect(result.category).toBe('programming')
    })

    it('should detect JavaScript files', () => {
      const result = detectLanguage('app.js')
      expect(result.name).toBe('JavaScript')
      expect(result.category).toBe('programming')
    })

    it('should detect Python files', () => {
      const result = detectLanguage('main.py')
      expect(result.name).toBe('Python')
      expect(result.category).toBe('programming')
    })

    it('should detect Markdown files', () => {
      const result = detectLanguage('README.md')
      expect(result.name).toBe('Markdown')
      expect(result.category).toBe('markup')
    })

    it('should handle files without extensions', () => {
      const result = detectLanguage('Makefile')
      expect(result.name).toBe('Unknown')
      expect(result.category).toBe('other')
    })

    it('should detect Dockerfile', () => {
      const result = detectLanguage('Dockerfile')
      expect(result.name).toBe('Dockerfile')
      expect(result.category).toBe('config')
    })

    it('should be case insensitive', () => {
      const result = detectLanguage('TEST.TS')
      expect(result.name).toBe('TypeScript')
    })
  })

  describe('getSupportedLanguages', () => {
    it('should return array of languages', () => {
      const languages = getSupportedLanguages()
      expect(Array.isArray(languages)).toBe(true)
      expect(languages.length).toBeGreaterThan(0)
    })

    it('should include common languages', () => {
      const languages = getSupportedLanguages()
      expect(languages).toContain('TypeScript')
      expect(languages).toContain('JavaScript')
      expect(languages).toContain('Python')
    })
  })
})
