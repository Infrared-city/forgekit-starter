import '@testing-library/jest-dom'

// Browser API mocks for jsdom environment
// ResizeObserver mock that fires the callback immediately on observe()
// with a default contentRect. This is required for @tanstack/react-virtual
// which relies on ResizeObserver to measure the scroll container.
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    private callback: ResizeObserverCallback
    constructor(callback: ResizeObserverCallback) {
      this.callback = callback
    }
    observe(target: Element) {
      // Fire callback immediately with a reasonable default size so
      // virtualizers know the container has height and can render items.
      this.callback(
        [
          {
            target,
            contentRect: { width: 300, height: 600 } as DOMRectReadOnly,
            borderBoxSize: [{ blockSize: 600, inlineSize: 300 }],
            contentBoxSize: [{ blockSize: 600, inlineSize: 300 }],
            devicePixelContentBoxSize: [{ blockSize: 600, inlineSize: 300 }],
          } as ResizeObserverEntry,
        ],
        this as unknown as ResizeObserver,
      )
    }
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
}

if (typeof globalThis.IntersectionObserver === 'undefined') {
  globalThis.IntersectionObserver = class IntersectionObserver {
    readonly root = null
    readonly rootMargin = '0px'
    readonly thresholds = [0]
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  } as unknown as typeof IntersectionObserver
}

if (typeof window.matchMedia === 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  })
}
