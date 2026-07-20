import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from 'ui'
import { fetchProfile } from '@/lib/auth.api'
import { useAuthStore } from '@/lib/auth.store'

export const Route = createFileRoute('/profile')({
  component: Profile,
})

function Profile() {
  const idToken = useAuthStore((s) => s.idToken)
  const storeUser = useAuthStore((s) => s.user)

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => fetchProfile(idToken!),
    enabled: idToken !== null,
  })

  const user = profile ?? storeUser

  if (isLoading && !user) {
    return (
      <div className="p-6 bg-background flex-1 min-h-0 overflow-y-auto">
        <Card className="max-w-md mx-auto">
          <CardHeader className="items-center">
            <Skeleton className="h-20 w-20 rounded-full mb-2" />
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Skeleton className="h-3 w-10 mb-1" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div>
              <Skeleton className="h-3 w-10 mb-1" />
              <Skeleton className="h-4 w-36" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Unable to load profile.</p>
      </div>
    )
  }

  const displayEmail = user.email ?? ''
  const initial = displayEmail.charAt(0).toUpperCase() || '?'

  return (
    <div className="p-6 bg-background flex-1 min-h-0 overflow-y-auto">
      <Card className="max-w-md mx-auto">
        <CardHeader className="items-center">
          {user.picture ? (
            <img
              src={user.picture}
              alt={displayEmail}
              className="h-20 w-20 rounded-full object-cover mb-2"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-medium mb-2">
              {initial}
            </div>
          )}
          <CardTitle>{user.name ?? displayEmail}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="text-foreground">{displayEmail}</p>
          </div>
          {user.name && (
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="text-foreground">{user.name}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground">User ID</p>
            <p className="text-foreground font-mono text-sm break-all">{user.sub}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
