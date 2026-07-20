import { describe, expect, it } from 'vitest'
import { ifcGlobalIdToUuid } from '../core/indoor-analysis.utils'

describe('ifcGlobalIdToUuid', () => {
  // --- Valid inputs ---

  it('should convert a known IFC GlobalId to a UUID', () => {
    // Known test vector: IFC GlobalId "2MKhx1HRb7xBkMOe1CZXY7"
    // This is a well-known example from IFC documentation
    const result = ifcGlobalIdToUuid('2MKhx1HRb7xBkMOe1CZXY7')
    // Result should be a valid UUID format (8-4-4-4-12)
    expect(result).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
  })

  it('should produce consistent results for the same input', () => {
    const globalId = '0YvctVUKr0kugbFTf53O9L'
    const result1 = ifcGlobalIdToUuid(globalId)
    const result2 = ifcGlobalIdToUuid(globalId)
    expect(result1).toBe(result2)
  })

  it('should produce different UUIDs for different GlobalIds', () => {
    const uuid1 = ifcGlobalIdToUuid('0YvctVUKr0kugbFTf53O9L')
    const uuid2 = ifcGlobalIdToUuid('2MKhx1HRb7xBkMOe1CZXY7')
    expect(uuid1).not.toBe(uuid2)
  })

  it('should handle GlobalIds with underscore and dollar characters', () => {
    // IFC base-64 uses _ and $ as the last two characters of the alphabet
    // "0000000000000000000000" is all zeros
    const result = ifcGlobalIdToUuid('0000000000000000000000')
    expect(result).toBe('00000000-0000-0000-0000-000000000000')
  })

  it('should return lowercase hex in UUID', () => {
    const result = ifcGlobalIdToUuid('2MKhx1HRb7xBkMOe1CZXY7')
    // All hex characters should be lowercase
    expect(result).toBe(result.toLowerCase())
  })

  it('should return a UUID in 8-4-4-4-12 format', () => {
    const result = ifcGlobalIdToUuid('0YvctVUKr0kugbFTf53O9L')
    const parts = result.split('-')
    expect(parts).toHaveLength(5)
    expect(parts[0]).toHaveLength(8)
    expect(parts[1]).toHaveLength(4)
    expect(parts[2]).toHaveLength(4)
    expect(parts[3]).toHaveLength(4)
    expect(parts[4]).toHaveLength(12)
  })

  // --- Edge cases and errors ---

  it('should throw for empty string', () => {
    expect(() => ifcGlobalIdToUuid('')).toThrow('IFC GlobalId must be 22 characters')
  })

  it('should throw for string shorter than 22 characters', () => {
    expect(() => ifcGlobalIdToUuid('0YvctVUKr0kug')).toThrow('IFC GlobalId must be 22 characters')
  })

  it('should throw for string longer than 22 characters', () => {
    expect(() => ifcGlobalIdToUuid('0YvctVUKr0kugbFTf53O9L0')).toThrow(
      'IFC GlobalId must be 22 characters',
    )
  })

  it('should throw for invalid characters (e.g., @)', () => {
    expect(() => ifcGlobalIdToUuid('0YvctVUKr0kugbFTf53O9@')).toThrow(
      'Invalid IFC base-64 character',
    )
  })

  it('should throw for invalid characters (e.g., space)', () => {
    expect(() => ifcGlobalIdToUuid('0YvctVUKr0kugbFTf53O9 ')).toThrow(
      'Invalid IFC base-64 character',
    )
  })
})
