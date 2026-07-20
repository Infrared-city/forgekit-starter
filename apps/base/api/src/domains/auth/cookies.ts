import type { Context } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import type { Env } from '../../config.js'

const COOKIE_NAME = 'refresh_token'
const MAX_AGE = 30 * 24 * 60 * 60 // 30 days in seconds

function isProduction(c: Context<{ Bindings: Env }>): boolean {
  return c.env.ENVIRONMENT === 'production'
}

export function setRefreshTokenCookie(c: Context<{ Bindings: Env }>, value: string): void {
  const prod = isProduction(c)
  setCookie(c, COOKIE_NAME, value, {
    path: '/',
    httpOnly: true,
    secure: prod,
    sameSite: 'Lax',
    maxAge: MAX_AGE,
    // domain intentionally NOT set -- host-only cookie
  })
}

export function getRefreshTokenCookie(c: Context<{ Bindings: Env }>): string | undefined {
  return getCookie(c, COOKIE_NAME)
}

export function clearRefreshTokenCookie(c: Context<{ Bindings: Env }>): void {
  const prod = isProduction(c)
  deleteCookie(c, COOKIE_NAME, {
    path: '/',
    secure: prod,
    sameSite: 'Lax',
  })
}
