import { describe, it, expect } from 'vitest'
import { getLanguageColor, hexToRgb, getAllColors, getHighContrastColor } from '../src/utils/ColorPalette'

describe('ColorPalette', () => {
  describe('getLanguageColor', () => {
    it('should return color for TypeScript', () => {
      const color = getLanguageColor('TypeScript')
      expect(color.primary).toBe('#3178c6')
      expect(color.name).toBe('Blue')
    })

    it('should return color for JavaScript', () => {
      const color = getLanguageColor('JavaScript')
      expect(color.primary).toBe('#f7df1e')
      expect(color.name).toBe('Yellow')
    })

    it('should return color for Python', () => {
      const color = getLanguageColor('Python')
      expect(color.primary).toBe('#3776ab')
      expect(color.name).toBe('Blue')
    })

    it('should return fallback color for unknown language', () => {
      const color = getLanguageColor('UnknownLanguage')
      expect(color.primary).toBe('#808080')
      expect(color.name).toBe('Gray')
    })
  })

  describe('hexToRgb', () => {
    it('should convert hex to RGB correctly', () => {
      const rgb = hexToRgb('#3178c6')
      expect(rgb.r).toBeCloseTo(0.192, 2)
      expect(rgb.g).toBeCloseTo(0.471, 2)
      expect(rgb.b).toBeCloseTo(0.776, 2)
    })

    it('should handle hex without # prefix', () => {
      const rgb = hexToRgb('f7df1e')
      expect(rgb.r).toBeCloseTo(0.969, 2)
      expect(rgb.g).toBeCloseTo(0.875, 2)
      expect(rgb.b).toBeCloseTo(0.118, 2)
    })

    it('should return gray fallback for invalid hex', () => {
      const rgb = hexToRgb('invalid')
      expect(rgb.r).toBe(0.5)
      expect(rgb.g).toBe(0.5)
      expect(rgb.b).toBe(0.5)
    })
  })

  describe('getAllColors', () => {
    it('should return array of unique colors', () => {
      const colors = getAllColors()
      expect(Array.isArray(colors)).toBe(true)
      expect(colors.length).toBeGreaterThan(0)
      
      // Check for uniqueness
      const uniqueColors = new Set(colors)
      expect(uniqueColors.size).toBe(colors.length)
    })

    it('should include common language colors', () => {
      const colors = getAllColors()
      expect(colors).toContain('#3178c6') // TypeScript
      expect(colors).toContain('#f7df1e') // JavaScript
      expect(colors).toContain('#3776ab') // Python
    })
  })

  describe('getHighContrastColor', () => {
    it('should return a valid hex color', () => {
      const contrast = getHighContrastColor('#3178c6')
      expect(contrast).toMatch(/^#[0-9a-f]{6}$/i)
    })

    it('should modify dark colors to be lighter', () => {
      const original = '#000000'
      const contrast = getHighContrastColor(original)
      // Should be lighter than original
      expect(contrast).not.toBe(original)
    })

    it('should modify light colors to be darker', () => {
      const original = '#ffffff'
      const contrast = getHighContrastColor(original)
      // Should be darker than original
      expect(contrast).not.toBe(original)
    })
  })
})
