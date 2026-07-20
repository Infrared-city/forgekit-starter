// ABOUTME: Provides file-reading helpers for vegetation import tests.
// ABOUTME: Keeps jsdom compatibility aligned with browser File and Blob APIs.

if (typeof Blob !== 'undefined' && !Blob.prototype.text) {
  Object.defineProperty(Blob.prototype, 'text', {
    configurable: true,
    value: function text(this: Blob) {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result ?? ''))
        reader.onerror = () => reject(reader.error ?? new Error('Failed to read blob text.'))
        reader.readAsText(this)
      })
    },
  })
}
