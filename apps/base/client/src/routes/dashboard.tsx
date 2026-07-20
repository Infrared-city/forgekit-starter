import { createFileRoute, redirect } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from 'ui'
import { ApiKeysTab } from '@/components/dashboard/api-keys-tab'
import { WebhookSecretTab } from '@/components/dashboard/webhook-secret-tab'
import { useAuthStore } from '@/lib/auth.store'

export const Route = createFileRoute('/dashboard')({
  // The root route's `beforeLoad` already redirects unauthenticated users to
  // /login for any non-public route, so this guard is normally redundant.
  // Keeping it on the route itself is defense-in-depth: a future refactor of
  // the root's `PUBLIC_ROUTES` list or `beforeLoad` mustn't accidentally
  // expose the dashboard shell — which then fires unauthenticated requests
  // to /user/apikeys — as a public surface.
  beforeLoad: ({ location }) => {
    const { idToken, isLoading } = useAuthStore.getState()
    if (isLoading) return
    if (idToken === null) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }
  },
  component: Dashboard,
})

function Dashboard() {
  return (
    <div className="p-6 bg-background flex-1 min-h-0 overflow-y-auto">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="api-keys">
            <TabsList>
              <TabsTrigger value="api-keys">API Keys</TabsTrigger>
              <TabsTrigger value="webhook-secret">Webhook Secret</TabsTrigger>
            </TabsList>
            <TabsContent value="api-keys" className="pt-4">
              <ApiKeysTab />
            </TabsContent>
            <TabsContent value="webhook-secret" className="pt-4">
              <WebhookSecretTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
