import { useNavigate } from '@tanstack/react-router'
import { KeyRound, LogOut, User } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'ui'
import { signOut } from '@/lib/auth.api'
import { useAuthStore } from '@/lib/auth.store'

export function UserMenu() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  if (!user) return null

  const displayEmail = user.email ?? ''
  const initial = displayEmail.charAt(0).toUpperCase() || '?'

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch {
      // Sign out from server failed -- clear local state anyway
    }
    useAuthStore.getState().clear()
    navigate({ to: '/login' })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-accent transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {user.picture ? (
            <img
              src={user.picture}
              alt={displayEmail}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
              {initial}
            </div>
          )}
          <span className="hidden sm:inline text-foreground">{displayEmail}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={() => navigate({ to: '/dashboard' })}
        >
          <KeyRound className="mr-2 h-4 w-4" />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onSelect={() => navigate({ to: '/profile' })}>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onSelect={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
