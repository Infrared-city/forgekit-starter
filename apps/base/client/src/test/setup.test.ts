import { describe, expect, it } from 'vitest'

describe('Test Setup', () => {
  it('should have vitest configured correctly', () => {
    expect(true).toBe(true)
  })

  it('should have ResizeObserver mocked', () => {
    const ro = new ResizeObserver(() => {})
    expect(ro.observe).toBeDefined()
    expect(typeof ro.observe).toBe('function')
  })

  it('should have IntersectionObserver mocked', () => {
    const io = new IntersectionObserver(() => {})
    expect(io.observe).toBeDefined()
    expect(typeof io.observe).toBe('function')
  })

  it('should have matchMedia mocked', () => {
    const mq = window.matchMedia('(min-width: 768px)')
    expect(mq.matches).toBe(false)
    expect(mq.media).toBe('(min-width: 768px)')
  })
})
