import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

vi.mock('@/lib/auth.api', () => ({
  refreshTokens: vi.fn(),
}))

vi.mock('@/lib/auth.store', () => {
  const state = {
    idToken: null as string | null,
    accessToken: null as string | null,
    setTokens: (idToken: string, accessToken: string) => {
      state.idToken = idToken
      state.accessToken = accessToken
    },
    clear: () => {
      state.idToken = null
      state.accessToken = null
    },
  }
  return {
    useAuthStore: {
      getState: () => state,
    },
  }
})

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('lib/api', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    const { useAuthStore } = await import('@/lib/auth.store')
    useAuthStore.getState().clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('fetchWithTimeout', () => {
    it('should fetch successfully within timeout', async () => {
      const { api } = await import('@/lib/api')
      const body = { data: 'test' }
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify(body), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )

      const result = await api.get<{ data: string }>('/test')

      expect(result).toEqual(body)
      expect(mockFetch).toHaveBeenCalledOnce()
      const [url, options] = mockFetch.mock.calls[0]
      expect(url).toContain('/test')
      expect(options.signal).toBeInstanceOf(AbortSignal)
    })

    it('should abort and throw "Request timed out" when timeout expires', async () => {
      const { api } = await import('@/lib/api')

      // Simulate a fetch that never resolves but properly throws AbortError
      // when the signal is aborted — matching real browser fetch behavior.
      mockFetch.mockImplementationOnce(
        (_url: string, opts: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            if (opts.signal) {
              opts.signal.addEventListener('abort', () => {
                // In real browsers, fetch rejects with an Error whose name is 'AbortError'
                const err = new Error('The operation was aborted.')
                err.name = 'AbortError'
                reject(err)
              })
            }
          }),
      )

      // Use a very short timeout (10ms) so the test doesn't hang
      await expect(api.get('/slow', 10)).rejects.toThrow('Request timed out')
    })
  })

  describe('handleResponse', () => {
    it('should parse JSON from ok response', async () => {
      const { api } = await import('@/lib/api')
      const body = { id: 1, name: 'item' }
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify(body), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )

      const result = await api.get<{ id: number; name: string }>('/items/1')
      expect(result).toEqual(body)
    })

    it('should throw an ApiError with raw text for plain-text non-ok response', async () => {
      const { api, ApiError } = await import('@/lib/api')
      mockFetch.mockResolvedValueOnce(
        new Response('Not Found', { status: 404, statusText: 'Not Found' }),
      )

      await expect(api.get('/missing')).rejects.toMatchObject({
        name: 'ApiError',
        status: 404,
        message: 'Not Found',
      })
      // Re-run with a separate request so we can also assert instanceof
      mockFetch.mockResolvedValueOnce(
        new Response('Not Found', { status: 404, statusText: 'Not Found' }),
      )
      await expect(api.get('/missing')).rejects.toBeInstanceOf(ApiError)
    })

    it('should throw an ApiError with status text when error body is empty', async () => {
      const { api } = await import('@/lib/api')
      mockFetch.mockResolvedValueOnce(
        new Response('', { status: 500, statusText: 'Internal Server Error' }),
      )

      await expect(api.get('/broken')).rejects.toMatchObject({
        name: 'ApiError',
        status: 500,
        message: 'Internal Server Error',
      })
    })

    it('should parse Python {error, details} envelope into ApiError', async () => {
      const { api } = await import('@/lib/api')
      const details = [{ loc: ['body', 'lat'], msg: 'field required' }]
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Validation error', details }), {
          status: 422,
          headers: { 'Content-Type': 'application/json' },
        }),
      )

      await expect(api.get('/validate')).rejects.toMatchObject({
        name: 'ApiError',
        status: 422,
        message: 'Validation error',
        details,
      })
    })

    it('should parse RFC 9457 {type, title, detail, code} envelope into ApiError', async () => {
      const { api } = await import('@/lib/api')
      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            type: 'about:blank',
            title: 'Forbidden',
            detail: 'Account disabled',
            code: 'ACCOUNT_DISABLED',
          }),
          { status: 403, headers: { 'Content-Type': 'application/json' } },
        ),
      )

      await expect(api.get('/forbidden')).rejects.toMatchObject({
        name: 'ApiError',
        status: 403,
        message: 'Account disabled',
        code: 'ACCOUNT_DISABLED',
      })
    })

    it('should fall back to type as code when RFC 9457 body omits code', async () => {
      const { api } = await import('@/lib/api')
      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            type: 'urn:problem:rate-limited',
            title: 'Too Many Requests',
          }),
          { status: 429 },
        ),
      )

      await expect(api.get('/throttle')).rejects.toMatchObject({
        name: 'ApiError',
        status: 429,
        message: 'Too Many Requests',
        code: 'urn:problem:rate-limited',
      })
    })

    it('should surface a truncated body when error body is HTML (e.g. 502)', async () => {
      const { api } = await import('@/lib/api')
      const html = '<html><body><h1>502 Bad Gateway</h1></body></html>'
      mockFetch.mockResolvedValueOnce(
        new Response(html, {
          status: 502,
          statusText: 'Bad Gateway',
          headers: { 'Content-Type': 'text/html' },
        }),
      )

      await expect(api.get('/down')).rejects.toMatchObject({
        name: 'ApiError',
        status: 502,
        message: html,
      })
    })

    it('should surface a truncated body when error body is plain text', async () => {
      const { api } = await import('@/lib/api')
      mockFetch.mockResolvedValueOnce(
        new Response('upstream timeout', { status: 504, statusText: 'Gateway Timeout' }),
      )

      await expect(api.get('/slow')).rejects.toMatchObject({
        name: 'ApiError',
        status: 504,
        message: 'upstream timeout',
      })
    })

    it('should surface the raw body for parseable-but-unknown JSON shapes', async () => {
      const { api } = await import('@/lib/api')
      // A JSON shape that matches none of our known envelopes
      const body = '{"message":"something odd","requestId":"abc-123"}'
      mockFetch.mockResolvedValueOnce(
        new Response(body, {
          status: 418,
          statusText: "I'm a teapot",
          headers: { 'Content-Type': 'application/json' },
        }),
      )

      await expect(api.get('/unknown-shape')).rejects.toMatchObject({
        name: 'ApiError',
        status: 418,
        message: body,
      })
    })

    it('should return undefined for a 204 No Content success', async () => {
      const { api } = await import('@/lib/api')
      mockFetch.mockResolvedValueOnce(new Response(null, { status: 204 }))

      const result = await api.delete<void>('/items/1')
      expect(result).toBeUndefined()
    })

    it('should return undefined for an empty 200 body', async () => {
      const { api } = await import('@/lib/api')
      mockFetch.mockResolvedValueOnce(new Response('', { status: 200 }))

      const result = await api.get<void>('/empty')
      expect(result).toBeUndefined()
    })

    it('should return undefined for a whitespace-only 200 body', async () => {
      const { api } = await import('@/lib/api')
      mockFetch.mockResolvedValueOnce(new Response('\n  \n', { status: 200 }))

      const result = await api.get<void>('/whitespace')
      expect(result).toBeUndefined()
    })

    it('should throw a structured ApiError when a 200 body is not valid JSON', async () => {
      const { api } = await import('@/lib/api')
      const html = '<html><body>Gateway returned 200 with an HTML page</body></html>'
      mockFetch.mockResolvedValueOnce(
        new Response(html, { status: 200, headers: { 'Content-Type': 'text/html' } }),
      )

      await expect(api.get('/bad-200')).rejects.toMatchObject({
        name: 'ApiError',
        status: 200,
        message: html,
      })
    })

    it('should throw an ApiError when 401 -> refresh succeeds -> retry fails with 500', async () => {
      const { api } = await import('@/lib/api')
      const { refreshTokens } = await import('@/lib/auth.api')
      ;(refreshTokens as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        idToken: 'new-id',
        accessToken: 'new-access',
      })

      // First call: 401 unauth
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'token expired' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      // Retry call: backend 500
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'database unreachable' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }),
      )

      await expect(api.get('/protected')).rejects.toMatchObject({
        name: 'ApiError',
        status: 500,
        message: 'database unreachable',
      })
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('api.get', () => {
    it('should call fetch with correct URL and no method override', async () => {
      const { api } = await import('@/lib/api')
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200 }))

      await api.get('/items')

      expect(mockFetch).toHaveBeenCalledOnce()
      const [url, options] = mockFetch.mock.calls[0]
      expect(url).toMatch(/\/items$/)
      // GET requests should not have a method set (defaults to GET)
      expect(options.method).toBeUndefined()
    })
  })

  describe('api.post', () => {
    it('should call fetch with POST method, JSON headers, and stringified body', async () => {
      const { api } = await import('@/lib/api')
      const payload = { name: 'New Item' }
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ id: 1 }), { status: 201 }))

      await api.post('/items', payload)

      expect(mockFetch).toHaveBeenCalledOnce()
      const [url, options] = mockFetch.mock.calls[0]
      expect(url).toMatch(/\/items$/)
      expect(options.method).toBe('POST')
      expect(options.headers).toEqual({ 'Content-Type': 'application/json' })
      expect(options.body).toBe(JSON.stringify(payload))
    })
  })

  describe('api.delete', () => {
    it('should call fetch with DELETE method', async () => {
      const { api } = await import('@/lib/api')
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), { status: 200 }),
      )

      await api.delete('/items/1')

      expect(mockFetch).toHaveBeenCalledOnce()
      const [url, options] = mockFetch.mock.calls[0]
      expect(url).toMatch(/\/items\/1$/)
      expect(options.method).toBe('DELETE')
    })
  })
})
