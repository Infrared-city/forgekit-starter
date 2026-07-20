import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { Env } from './config.js'
import { authRoutes, userRoutes } from './domains/auth/routes.js'
import { groundMaterialsRoutes } from './domains/ground-materials/routes.js'
import { indoorRoutes } from './domains/indoor/routes.js'
import { infraredProxyRoutes } from './domains/infrared-proxy/routes.js'
import { mapRoutes } from './domains/map/routes.js'
import { placesRoutes } from './domains/places/routes.js'
import { authMiddleware } from './middleware/auth.js'

// Replace with your own Cloudflare Pages / custom domain once deployed —
// see README.md "Deploying" for the wrangler.toml + Pages project rename steps.
const ALLOWED_ORIGINS: Record<string, string[]> = {
  dev: ['http://localhost:3001', 'http://localhost:5173'],
  preview: ['https://preview.your-app.pages.dev'],
  production: ['https://your-app.pages.dev'],
}

const app = new Hono<{ Bindings: Env }>()

// CORS before auth -- OPTIONS preflight must not require auth
app.use('*', async (c, next) => {
  const origins = ALLOWED_ORIGINS[c.env.ENVIRONMENT] ?? (ALLOWED_ORIGINS.dev as string[])
  return cors({
    origin: origins,
    credentials: true,
    allowHeaders: ['Authorization', 'Content-Type', 'X-Api-Key'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    exposeHeaders: ['Retry-After'],
  })(c, next)
})

// Health check (public)
app.get('/', (c) => c.json({ status: 'ok' }))

// Public auth routes
app.route('/auth', authRoutes)

// Infrared API proxy — authenticated by server-side API key, not user token
app.route('/infrared', infraredProxyRoutes)

// Protected routes behind auth middleware
const guarded = new Hono<{ Bindings: Env }>()
guarded.use('*', authMiddleware)
guarded.route('/user', userRoutes)
guarded.route('/indoor', indoorRoutes)
guarded.route('/ground-materials', groundMaterialsRoutes)
guarded.route('/map', mapRoutes)
guarded.route('/places', placesRoutes)

app.route('/', guarded)

export default app
