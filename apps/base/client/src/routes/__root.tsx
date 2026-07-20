import { createRootRoute, Link, Outlet, redirect, useRouterState } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { UserMenu } from '@/components/auth/user-menu'
import { selectIsAuthenticated, useAuthStore } from '@/lib/auth.store'

const PUBLIC_ROUTES = ['/login', '/signup', '/forgot-password']

export const Route = createRootRoute({
  beforeLoad: ({ location }) => {
    if (PUBLIC_ROUTES.includes(location.pathname)) return

    const { idToken, isLoading } = useAuthStore.getState()

    // Still resolving auth state -- let the loading spinner handle it
    if (isLoading) return

    if (idToken === null) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }
  },
  component: RootComponent,
})

function RootComponent() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname)

  return (
    <div className="h-dvh flex flex-col overflow-hidden">
      <nav className="flex items-center justify-between px-4 py-2 bg-card text-card-foreground border-b border-border">
        {isPublicRoute ? (
          <span className="text-sm font-semibold text-foreground">Forge Kit</span>
        ) : (
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <>
                <Link
                  to="/"
                  className="[&.active]:font-bold text-primary hover:text-primary/80 transition-colors text-sm"
                >
                  Home
                </Link>
                <Link
                  to="/about"
                  className="[&.active]:font-bold text-primary hover:text-primary/80 transition-colors text-sm"
                >
                  About
                </Link>
                <Link
                  to="/map"
                  className="[&.active]:font-bold text-primary hover:text-primary/80 transition-colors text-sm"
                >
                  Map
                </Link>
                <Link
                  to="/interior"
                  className="[&.active]:font-bold text-primary hover:text-primary/80 transition-colors text-sm"
                >
                  Interior
                </Link>
              </>
            )}
          </div>
        )}
        {!isPublicRoute && isAuthenticated && <UserMenu />}
      </nav>
      <Outlet />
      {/* Only render devtools in development */}
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </div>
  )
}
